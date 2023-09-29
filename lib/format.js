(function () {
    'use strict';

    var utils = require('./utils/format');
    var ysonConverter = require('./converters/yson-to-unipika');
    var yqlConverter = require('./converters/yql-to-unipika');
    var rawConverter = require('./converters/raw-to-unipika');

    // var TYPE_KEY = '$type';
    var VALUE_KEY = '$value';
    var ATTRIBUTES_KEY = '$attributes';

    var JSON = 'json';
    var YSON = 'yson';

    function defaultPlugin(node) {
        return String(node.$value);
    }

    /* Main formatting rules */
    var _format;
    var _plugins = {};
    var mapFragment;

    function formatValue(node, settings, level) {
        var plugin = _plugins.hasOwnProperty(node.$type) ?
            _plugins[node.$type] :
            defaultPlugin;

        var formattedValue = plugin(node, settings, level);

        var wrappedValue = plugin.isScalar ?
            utils.wrapScalar(node, settings, formattedValue) :
            utils.wrapComplex(node, settings, formattedValue);

        return utils.wrapOptional(node, settings, wrappedValue);
    }

    function formatKey(key, settings, level) {
        return formatValue({
            $type: 'string',
            $special_key: true,
            $value: key,
            $decoded_value: key
        }, settings, level);
    }

    function formatAttributes(node, settings, level) {
        var resultString = '';
        var currentAttributes = node.$attributes;
        var attributesLength = currentAttributes.length;

        if (utils.drawFullView(attributesLength, settings)) {
            resultString += utils.ATTRIBUTES_START(settings) + utils.INDENT(settings, level);
            resultString += mapFragment(currentAttributes, settings, level);
            resultString += utils.INDENT(settings, level - 1) + utils.ATTRIBUTES_END(settings) + utils.INDENT(settings, level - 1);
        } else if (utils.drawCompactView(attributesLength, settings)) {
            resultString += utils.ATTRIBUTES_START(settings);
            resultString += mapFragment(currentAttributes, settings, level - 1);
            resultString += utils.ATTRIBUTES_END(settings) + ((settings.format === JSON) ? utils.INDENT(settings, level - 1) : '');
        } else {
            // This case is added for consistency in case we want to always render attributes in the future
            resultString += utils.ATTRIBUTES_START(settings) + utils.ATTRIBUTES_END(settings);
        }

        return resultString;
    }

    function hasAttributes(node) {
        return node.hasOwnProperty('$attributes') &&
                node.$attributes.length > 0;
    }

    _format = function (node, settings, level) {
        level = level || 1;

        var resultString = '';

        if (settings.format === JSON) {
            if (hasAttributes(node)) {
                resultString += utils.OBJECT_START + utils.INDENT(settings, level);
                // Attributes
                resultString += formatKey(ATTRIBUTES_KEY, settings, level) + utils.KEY_VALUE_SEPARATOR(settings);
                resultString += formatAttributes(node, settings, level + 1);

                // Value
                resultString += formatKey(VALUE_KEY, settings, level) + utils.KEY_VALUE_SEPARATOR(settings);
                resultString += formatValue(node, settings, level + 1);

                resultString += utils.INDENT(settings, level - 1) + utils.OBJECT_END;
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

    mapFragment = require('./utils/map-fragment')(_format);

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
    _plugins['yql.datetime'] = require('./plugins/yql-datetime')(_format);
    _plugins['yql.timestamp'] = require('./plugins/yql-timestamp')(_format);
    _plugins['yql.tzdate'] = require('./plugins/yql-tzdate')(_format);
    _plugins['yql.tzdatetime'] = require('./plugins/yql-tzdatetime')(_format);
    _plugins['yql.tztimestamp'] = require('./plugins/yql-tztimestamp')(_format);
    _plugins['yql.interval'] = require('./plugins/yql-interval')(_format);
    _plugins['yql.uuid'] = require('./plugins/yql-uuid')(_format);
    _plugins['yql.null'] = require('./plugins/yql-null')(_format);
    _plugins['yql.variant'] = require('./plugins/yql-variant')(_format);
    _plugins['yql.enum'] = require('./plugins/yql-enum')(_format);
    _plugins['yql.set'] = require('./plugins/yql-set')(_format);
    _plugins['yql.json'] = require('./plugins/yql-json')(_format);
    _plugins['yql.yson'] = require('./plugins/yql-yson')(_format);
    _plugins['yql.tagged'] = require('./plugins/yql-tagged')(_format);


    function format(node, settings, converter) {
        if (typeof node === 'undefined') {
            // Backward compatibility
            return utils.EMPTY_STRING;
        }

        settings = settings || {};
        converter = converter || function (value) { return value; };

        settings.format = utils.parseSetting(settings, 'format', JSON);
        settings.decodeUTF8 = utils.parseSetting(settings, 'decodeUTF8', true); // is YSON utf8 encoded?
        settings.showDecoded = utils.parseSetting(settings, 'showDecoded', true);
        settings.asHTML = utils.parseSetting(settings, 'asHTML', true);
        settings.indent = utils.parseSetting(settings, 'indent', 4);
        settings.break = utils.parseSetting(settings, 'break', true);

        settings.compact = utils.parseSetting(settings, 'compact', false);
        settings.binaryAsHex = utils.parseSetting(settings, 'binaryAsHex', true);
        settings.escapeWhitespace = utils.parseSetting(settings, 'escapeWhitespace', true);
        settings.highlightControlCharacter = utils.parseSetting(settings, 'highlightControlCharacter', false);
        settings.escapeYQLStrings = utils.parseSetting(settings, 'escapeYQLStrings', true);
        settings.nonBreakingIndent = utils.parseSetting(settings, 'nonBreakingIndent', true);

        settings.validateSrcUrl = utils.parseSetting(settings, 'validateSrcUrl', () => false);
        settings.normalizeUrl = utils.parseSetting(settings, 'normalizeUrl', (url) => encodeURI(url));

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
        formatValue: formatValue
    };
})();
