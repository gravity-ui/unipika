(function () {
    'use strict';

    const utils = require('./utils/format');
    const ysonConverter = require('./converters/yson-to-unipika');
    const yqlConverter = require('./converters/yql-to-unipika');
    const rawConverter = require('./converters/raw-to-unipika');

    // var TYPE_KEY = '$type';
    const VALUE_KEY = '$value';
    const ATTRIBUTES_KEY = '$attributes';

    const JSON = 'json';
    const YSON = 'yson';

    function defaultPlugin(node) {
        return String(node.$value);
    }

    /* Main formatting rules */
    const _plugins = {};

    const parentKey = Symbol('parent');

    function formatValue(node, settings, level) {
        const child = node.$value;

        if (child instanceof Array) {
            child.forEach((ch) => {
                if (ch instanceof Object) {
                    ch[parentKey] = node;
                }
            });
        } else if (child instanceof Object) {
            child[parentKey] = node;
        }

        const pluginType = node.$type?.startsWith('yql.pg') ? 'yql.pg' : node.$type;
        const plugin = Object.prototype.hasOwnProperty.call(_plugins, pluginType)
            ? _plugins[pluginType]
            : defaultPlugin;

        const formattedValue = plugin(node, settings, level);

        const wrappedValue = plugin.isScalar
            ? utils.wrapScalar(node, settings, formattedValue)
            : utils.wrapComplex(node, settings, formattedValue);

        return utils.wrapOptional(node, settings, wrappedValue, parentKey);
    }

    function formatKey(key, settings, level) {
        return formatValue(
            {
                $type: 'string',
                $special_key: true,
                $value: key,
                $decoded_value: key,
            },
            settings,
            level,
        );
    }

    function formatAttributes(node, settings, level) {
        let resultString = '';
        const currentAttributes = node.$attributes;
        const attributesLength = currentAttributes.length;

        if (utils.drawFullView(attributesLength, settings)) {
            resultString += utils.getAttributesStart(settings) + utils.getIndent(settings, level);
            resultString += mapFragment(currentAttributes, settings, level);
            resultString +=
                utils.getIndent(settings, level - 1) +
                utils.getAttributesEnd(settings) +
                utils.getIndent(settings, level - 1);
        } else if (utils.drawCompactView(attributesLength, settings)) {
            resultString += utils.getAttributesStart(settings);
            resultString += mapFragment(currentAttributes, settings, level - 1);
            resultString +=
                utils.getAttributesEnd(settings) +
                (settings.format === JSON ? utils.getIndent(settings, level - 1) : '');
        } else {
            // This case is added for consistency in case we want to always render attributes in the future
            resultString += utils.getAttributesStart(settings) + utils.getAttributesEnd(settings);
        }

        return resultString;
    }

    function hasAttributes(node) {
        return (
            Object.prototype.hasOwnProperty.call(node, '$attributes') && node.$attributes.length > 0
        );
    }

    const _format = function (node, settings, level) {
        level = level || 1;

        let resultString = '';

        if (settings.format === JSON) {
            if (hasAttributes(node)) {
                resultString += utils.OBJECT_START + utils.getIndent(settings, level);
                // Attributes
                resultString +=
                    formatKey(ATTRIBUTES_KEY, settings, level) +
                    utils.getKeyValueSeparator(settings);
                resultString += formatAttributes(node, settings, level + 1);

                // Value
                resultString +=
                    formatKey(VALUE_KEY, settings, level) + utils.getKeyValueSeparator(settings);
                resultString += formatValue(node, settings, level + 1);

                resultString += utils.getIndent(settings, level - 1) + utils.OBJECT_END;
            } else {
                resultString += formatValue(node, settings, level);
            }
        } else if (settings.format === YSON) {
            if (hasAttributes(node)) {
                resultString += formatAttributes(node, settings, level);
            }
            resultString += formatValue(node, settings, level);
        }

        return resultString;
    };

    const mapFragment = require('./utils/map-fragment')(_format);

    // YT
    _plugins.list = require('./plugins/list')(_format);
    _plugins.map = require('./plugins/map')(_format);
    _plugins.string = require('./plugins/string')(_format);
    _plugins.number = require('./plugins/number')(_format);
    _plugins.int64 = require('./plugins/int64')(_format);
    _plugins.uint64 = require('./plugins/uint64')(_format);
    _plugins.double = require('./plugins/double')(_format);
    _plugins.boolean = require('./plugins/boolean')(_format);
    _plugins.null = require('./plugins/null')(_format);
    _plugins.tagged = require('./plugins/tagged')(_format);

    // YQL
    _plugins['yql.list'] = require('./plugins/yql-list')(_format);
    _plugins['yql.stream'] = require('./plugins/yql-stream')(_format);
    _plugins['yql.tuple'] = require('./plugins/yql-tuple')(_format);
    _plugins['yql.struct'] = require('./plugins/yql-struct')(_format);
    _plugins['yql.dict'] = require('./plugins/yql-dict')(_format);
    _plugins['yql.string'] = require('./plugins/yql-string')(_format);
    _plugins['yql.utf8'] = require('./plugins/yql-utf8')(_format);
    // yql.int[8|16|32] should have the same l&f as yql.int64
    _plugins['yql.int64'] = require('./plugins/yql-int64')(_format);
    _plugins['yql.int8'] = _plugins['yql.int64'];
    _plugins['yql.int16'] = _plugins['yql.int64'];
    _plugins['yql.int32'] = _plugins['yql.int64'];
    // yql.uint[8|16|32] should have the same l&f as yql.uint64
    _plugins['yql.uint64'] = require('./plugins/yql-uint64')(_format);
    _plugins['yql.uint8'] = _plugins['yql.uint64'];
    _plugins['yql.uint16'] = _plugins['yql.uint64'];
    _plugins['yql.uint32'] = _plugins['yql.uint64'];
    // yql.float should have the same l&f as yql.double
    _plugins['yql.double'] = require('./plugins/yql-double')(_format);
    _plugins['yql.float'] = _plugins['yql.double'];
    _plugins['yql.decimal'] = require('./plugins/yql-decimal')(_format);
    _plugins['yql.bool'] = require('./plugins/yql-bool')(_format);
    _plugins['yql.date'] = require('./plugins/yql-date')(_format);
    _plugins['yql.date32'] = _plugins['yql.date'];
    _plugins['yql.datetime'] = require('./plugins/yql-datetime')(_format);
    _plugins['yql.datetime64'] = _plugins['yql.datetime'];
    _plugins['yql.timestamp'] = require('./plugins/yql-timestamp')(_format);
    _plugins['yql.timestamp64'] = _plugins['yql.timestamp'];
    _plugins['yql.tzdate'] = require('./plugins/yql-tzdate')(_format);
    _plugins['yql.tzdate32'] = require('./plugins/yql-tzdate')(_format);
    _plugins['yql.tzdatetime'] = require('./plugins/yql-tzdatetime')(_format);
    _plugins['yql.tzdatetime64'] = require('./plugins/yql-tzdatetime')(_format);
    _plugins['yql.tztimestamp'] = require('./plugins/yql-tztimestamp')(_format);
    _plugins['yql.tztimestamp64'] = require('./plugins/yql-tztimestamp')(_format);
    _plugins['yql.interval'] = require('./plugins/yql-interval')(_format);
    _plugins['yql.interval64'] = _plugins['yql.interval'];
    _plugins['yql.uuid'] = require('./plugins/yql-uuid')(_format);
    _plugins['yql.null'] = require('./plugins/yql-null')(_format);
    _plugins['yql.variant'] = require('./plugins/yql-variant')(_format);
    _plugins['yql.enum'] = require('./plugins/yql-enum')(_format);
    _plugins['yql.set'] = require('./plugins/yql-set')(_format);
    _plugins['yql.json'] = require('./plugins/yql-json')(_format);
    _plugins['yql.yson'] = require('./plugins/yql-yson')(_format);
    _plugins['yql.tagged'] = require('./plugins/yql-tagged')(_format);
    _plugins['yql.pg'] = require('./plugins/yql-pg')(_format);

    function format(node, settings, converter) {
        if (typeof node === 'undefined') {
            // Backward compatibility
            return utils.EMPTY_STRING;
        }

        settings = settings || {};
        converter =
            converter ||
            function (value) {
                return value;
            };

        settings.format = utils.parseSetting(settings, 'format', JSON);
        settings.decodeUTF8 = utils.parseSetting(settings, 'decodeUTF8', true); // is YSON utf8 encoded?
        settings.showDecoded = utils.parseSetting(settings, 'showDecoded', true);
        settings.asHTML = utils.parseSetting(settings, 'asHTML', true);
        settings.indent = utils.parseSetting(settings, 'indent', 4);
        settings.break = utils.parseSetting(settings, 'break', true);

        settings.compact = utils.parseSetting(settings, 'compact', false);
        settings.binaryAsHex = utils.parseSetting(settings, 'binaryAsHex', true);
        settings.escapeWhitespace = utils.parseSetting(settings, 'escapeWhitespace', true);
        settings.highlightControlCharacter = utils.parseSetting(
            settings,
            'highlightControlCharacter',
            false,
        );
        settings.escapeYQLStrings = utils.parseSetting(settings, 'escapeYQLStrings', true);
        settings.nonBreakingIndent = utils.parseSetting(settings, 'nonBreakingIndent', true);
        settings.treatValAsData = utils.parseSetting(settings, 'treatValAsData', false);

        settings.validateSrcUrl = utils.parseSetting(settings, 'validateSrcUrl', () => false);
        settings.normalizeUrl = utils.parseSetting(settings, 'normalizeUrl', (url) =>
            encodeURI(url),
        );

        return _format(converter(node, settings), settings);
    }

    module.exports = {
        format: format,
        formatFromYSON: function (node, settings) {
            return format(node, settings, ysonConverter);
        },
        formatFromYQL: function (node, settings) {
            return format(node, settings, yqlConverter);
        },
        formatRaw: function (node, settings) {
            settings = settings || {};

            // Enforce "raw" settings
            settings.format = 'json';
            settings.showDecoded = false;
            settings.compact = false;
            settings.escapeWhitespace = true;

            return format(node, settings, rawConverter);
        },
        formatAttributes: formatAttributes,
        formatKey: formatKey,
        formatValue: formatValue,
    };
})();
