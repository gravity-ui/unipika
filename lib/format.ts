import {convert as rawConverter} from './converters/raw-to-unipika';
import type {ConverterNode, ConverterSettings} from './converters/types';
import {convert as yqlConverter} from './converters/yql-to-unipika';
import {convert as ysonConverter} from './converters/yson-to-unipika';
import {booleanPluginFactory} from './plugins/boolean';
import {doublePluginFactory} from './plugins/double';
import {int64PluginFactory} from './plugins/int64';
import {listPluginFactory} from './plugins/list';
import {mapPluginFactory} from './plugins/map';
import {nullPluginFactory} from './plugins/null';
import {stringPluginFactory} from './plugins/string';
import {taggedPluginFactory} from './plugins/tagged';
import type {FormatFunction, PluginFunction, PluginSettings} from './plugins/types';
import {uint64PluginFactory} from './plugins/uint64';
import {yqlBoolPluginFactory} from './plugins/yql-bool';
import {yqlDatePluginFactory} from './plugins/yql-date';
import {yqlDatetimePluginFactory} from './plugins/yql-datetime';
import {yqlDecimalPluginFactory} from './plugins/yql-decimal';
import {yqlDictPluginFactory} from './plugins/yql-dict';
import {yqlDoublePluginFactory} from './plugins/yql-double';
import {yqlEnumPluginFactory} from './plugins/yql-enum';
import {yqlInt64PluginFactory} from './plugins/yql-int64';
import {yqlIntervalPluginFactory} from './plugins/yql-interval';
import {yqlJsonPluginFactory} from './plugins/yql-json';
import {yqlListPluginFactory} from './plugins/yql-list';
import {yqlNullPluginFactory} from './plugins/yql-null';
import {yqlPgPluginFactory} from './plugins/yql-pg';
import {yqlSetPluginFactory} from './plugins/yql-set';
import {yqlStreamPluginFactory} from './plugins/yql-stream';
import {yqlStringPluginFactory} from './plugins/yql-string';
import {yqlStructPluginFactory} from './plugins/yql-struct';
import {yqlTaggedPluginFactory} from './plugins/yql-tagged';
import {yqlTimestampPluginFactory} from './plugins/yql-timestamp';
import {yqlTuplePluginFactory} from './plugins/yql-tuple';
import {yqlTzdatePluginFactory} from './plugins/yql-tzdate';
import {yqlTzdatetimePluginFactory} from './plugins/yql-tzdatetime';
import {yqlTztimestampPluginFactory} from './plugins/yql-tztimestamp';
import {yqlUint64PluginFactory} from './plugins/yql-uint64';
import {yqlUtf8PluginFactory} from './plugins/yql-utf8';
import {yqlUuidPluginFactory} from './plugins/yql-uuid';
import {yqlVariantPluginFactory} from './plugins/yql-variant';
import {yqlYsonPluginFactory} from './plugins/yql-yson';
import type {FormatNode, ScalarValue} from './utils/format';
import * as utils from './utils/format';
import {mapFragmentFactory} from './utils/map-fragment';

const VALUE_KEY = '$value';
const ATTRIBUTES_KEY = '$attributes';

const JSON = 'json';
const YSON = 'yson';

type Converter = (node: unknown, settings: ConverterSettings) => FormatNode | undefined;

function defaultPlugin(node: FormatNode): string {
    return String(node.$value);
}

/* Main formatting rules */
const _plugins: Record<string, PluginFunction> = {};

const parentKey = Symbol('parent');

function formatValue(node: FormatNode, settings: PluginSettings, level: number): ScalarValue {
    const child = node.$value;

    if (child instanceof Array) {
        child.forEach((ch) => {
            if (ch instanceof Object) {
                (ch as Record<symbol, FormatNode>)[parentKey] = node;
            }
        });
    } else if (child instanceof Object) {
        (child as Record<symbol, FormatNode>)[parentKey] = node;
    }

    const pluginType = node.$type?.startsWith('yql.pg') ? 'yql.pg' : node.$type;
    const plugin = Object.prototype.hasOwnProperty.call(_plugins, pluginType)
        ? _plugins[pluginType]
        : (defaultPlugin as PluginFunction);

    const formattedValue = plugin(node, settings, level) as ScalarValue;

    const wrappedValue = plugin.isScalar
        ? utils.wrapScalar(node, settings, formattedValue)
        : utils.wrapComplex(node, settings, formattedValue);

    return utils.wrapOptional(node, settings, wrappedValue, parentKey);
}

function formatKey(key: unknown, settings: PluginSettings, level: number): ScalarValue {
    return formatValue(
        {
            $type: 'string',
            $special_key: true,
            $value: key,
            $decoded_value: key,
        } as FormatNode,
        settings,
        level,
    );
}

function formatAttributes(node: ConverterNode, settings: PluginSettings, level: number): string {
    let resultString = '';
    const currentAttributes = node.$attributes as Array<[FormatNode, unknown]>;
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

function hasAttributes(node: ConverterNode): boolean {
    return (
        Object.prototype.hasOwnProperty.call(node, '$attributes') &&
        (node.$attributes as Array<unknown>).length > 0
    );
}

const _format: FormatFunction = function (node, settings, level): string {
    level = level || 1;

    let resultString = '';

    if (settings.format === JSON) {
        if (hasAttributes(node as ConverterNode)) {
            resultString += utils.OBJECT_START + utils.getIndent(settings, level);
            // Attributes
            resultString +=
                formatKey(ATTRIBUTES_KEY, settings, level) + utils.getKeyValueSeparator(settings);
            resultString += formatAttributes(node as ConverterNode, settings, level + 1);

            // Value
            resultString +=
                formatKey(VALUE_KEY, settings, level) + utils.getKeyValueSeparator(settings);
            resultString += formatValue(node as FormatNode, settings, level + 1);

            resultString += utils.getIndent(settings, level - 1) + utils.OBJECT_END;
        } else {
            resultString += formatValue(node as FormatNode, settings, level);
        }
    } else if (settings.format === YSON) {
        if (hasAttributes(node as ConverterNode)) {
            resultString += formatAttributes(node as ConverterNode, settings, level);
        }
        resultString += formatValue(node as FormatNode, settings, level);
    }

    return resultString;
};

const mapFragment = mapFragmentFactory(_format);

// YT
_plugins.list = listPluginFactory(_format);
_plugins.map = mapPluginFactory(_format);
_plugins.string = stringPluginFactory(_format);
_plugins.number = int64PluginFactory(_format);
_plugins.int64 = int64PluginFactory(_format);
_plugins.uint64 = uint64PluginFactory(_format);
_plugins.double = doublePluginFactory(_format);
_plugins.boolean = booleanPluginFactory(_format);
_plugins.null = nullPluginFactory(_format);
_plugins.tagged = taggedPluginFactory(_format);

// YQL
_plugins['yql.list'] = yqlListPluginFactory(_format);
_plugins['yql.stream'] = yqlStreamPluginFactory(_format);
_plugins['yql.tuple'] = yqlTuplePluginFactory(_format);
_plugins['yql.struct'] = yqlStructPluginFactory(_format);
_plugins['yql.dict'] = yqlDictPluginFactory(_format);
_plugins['yql.string'] = yqlStringPluginFactory(_format);
_plugins['yql.utf8'] = yqlUtf8PluginFactory(_format);
// yql.int[8|16|32] should have the same l&f as yql.int64
_plugins['yql.int64'] = yqlInt64PluginFactory(_format);
_plugins['yql.int8'] = _plugins['yql.int64'];
_plugins['yql.int16'] = _plugins['yql.int64'];
_plugins['yql.int32'] = _plugins['yql.int64'];
// yql.uint[8|16|32] should have the same l&f as yql.uint64
_plugins['yql.uint64'] = yqlUint64PluginFactory(_format);
_plugins['yql.uint8'] = _plugins['yql.uint64'];
_plugins['yql.uint16'] = _plugins['yql.uint64'];
_plugins['yql.uint32'] = _plugins['yql.uint64'];
// yql.float should have the same l&f as yql.double
_plugins['yql.double'] = yqlDoublePluginFactory(_format);
_plugins['yql.float'] = _plugins['yql.double'];
_plugins['yql.decimal'] = yqlDecimalPluginFactory(_format);
_plugins['yql.bool'] = yqlBoolPluginFactory(_format);
_plugins['yql.date'] = yqlDatePluginFactory(_format);
_plugins['yql.date32'] = _plugins['yql.date'];
_plugins['yql.datetime'] = yqlDatetimePluginFactory(_format);
_plugins['yql.datetime64'] = _plugins['yql.datetime'];
_plugins['yql.timestamp'] = yqlTimestampPluginFactory(_format);
_plugins['yql.timestamp64'] = _plugins['yql.timestamp'];
_plugins['yql.tzdate'] = yqlTzdatePluginFactory(_format);
_plugins['yql.tzdate32'] = _plugins['yql.tzdate'];
_plugins['yql.tzdatetime'] = yqlTzdatetimePluginFactory(_format);
_plugins['yql.tzdatetime64'] = _plugins['yql.tzdatetime'];
_plugins['yql.tztimestamp'] = yqlTztimestampPluginFactory(_format);
_plugins['yql.tztimestamp64'] = _plugins['yql.tztimestamp'];
_plugins['yql.interval'] = yqlIntervalPluginFactory(_format);
_plugins['yql.interval64'] = _plugins['yql.interval'];
_plugins['yql.uuid'] = yqlUuidPluginFactory(_format);
_plugins['yql.null'] = yqlNullPluginFactory(_format);
_plugins['yql.variant'] = yqlVariantPluginFactory(_format);
_plugins['yql.enum'] = yqlEnumPluginFactory(_format);
_plugins['yql.set'] = yqlSetPluginFactory(_format);
_plugins['yql.json'] = yqlJsonPluginFactory(_format);
_plugins['yql.yson'] = yqlYsonPluginFactory(_format);
_plugins['yql.tagged'] = yqlTaggedPluginFactory(_format);
_plugins['yql.pg'] = yqlPgPluginFactory(_format);

function format(node: unknown, settings?: PluginSettings, converter?: Converter): string {
    if (typeof node === 'undefined') {
        // Backward compatibility
        return utils.EMPTY_STRING;
    }

    settings = (settings || {}) as PluginSettings;
    converter =
        converter ||
        function (value) {
            return value as FormatNode;
        };

    settings.format = utils.parseSetting(settings, 'format', JSON) as string;
    settings.decodeUTF8 = utils.parseSetting(settings, 'decodeUTF8', true) as boolean;
    settings.showDecoded = utils.parseSetting(settings, 'showDecoded', true) as boolean;
    settings.asHTML = utils.parseSetting(settings, 'asHTML', true) as boolean;
    settings.indent = utils.parseSetting(settings, 'indent', 4) as number;
    settings.break = utils.parseSetting(settings, 'break', true) as boolean;

    settings.compact = utils.parseSetting(settings, 'compact', false) as boolean;
    settings.binaryAsHex = utils.parseSetting(settings, 'binaryAsHex', true) as boolean;
    settings.escapeWhitespace = utils.parseSetting(settings, 'escapeWhitespace', true) as boolean;
    settings.highlightControlCharacter = utils.parseSetting(
        settings,
        'highlightControlCharacter',
        false,
    ) as boolean;
    settings.escapeYQLStrings = utils.parseSetting(settings, 'escapeYQLStrings', true) as boolean;
    settings.nonBreakingIndent = utils.parseSetting(settings, 'nonBreakingIndent', true) as boolean;
    settings.treatValAsData = utils.parseSetting(settings, 'treatValAsData', false) as boolean;

    settings.validateSrcUrl = utils.parseSetting(settings, 'validateSrcUrl', () => false) as (
        url: string,
    ) => boolean;
    settings.normalizeUrl = utils.parseSetting(settings, 'normalizeUrl', (url: string) =>
        encodeURI(url),
    ) as (url: string) => string;

    return _format(converter(node, settings as ConverterSettings), settings, 0);
}

export {format};

export function formatFromYSON(node: unknown, settings?: PluginSettings): string {
    return format(node, settings, ysonConverter as Converter);
}

export function formatFromYQL(node: unknown, settings?: PluginSettings): string {
    return format(node, settings, yqlConverter as Converter);
}

export function formatRaw(node: unknown, settings?: PluginSettings): string {
    settings = (settings || {}) as PluginSettings;

    // Enforce "raw" settings
    settings.format = 'json';
    settings.showDecoded = false;
    settings.compact = false;
    settings.escapeWhitespace = true;

    return format(node, settings, rawConverter as Converter);
}

export {formatAttributes};
export {formatKey};
export {formatValue};
