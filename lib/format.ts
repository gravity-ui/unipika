import {convert as rawConverter} from './converters/raw-to-unipika';
import type {ConverterNode, ConverterSettings} from './converters/types';
import {convert as yqlConverter} from './converters/yql-to-unipika';
import {convert as ysonConverter} from './converters/yson-to-unipika';
import {boolean} from './plugins/boolean';
import {double} from './plugins/double';
import {int64} from './plugins/int64';
import {list} from './plugins/list';
import {map} from './plugins/map';
import {nullPlugin} from './plugins/null';
import {string} from './plugins/string';
import {tagged} from './plugins/tagged';
import type {FormatFunction, PluginFunction, PluginSettings} from './plugins/types';
import {uint64} from './plugins/uint64';
import {yqlBool} from './plugins/yql-bool';
import {yqlDate} from './plugins/yql-date';
import {yqlDatetime} from './plugins/yql-datetime';
import {yqlDecimal} from './plugins/yql-decimal';
import {yqlDict} from './plugins/yql-dict';
import {yqlDouble} from './plugins/yql-double';
import {yqlEnum} from './plugins/yql-enum';
import {yqlInt64} from './plugins/yql-int64';
import {yqlInterval} from './plugins/yql-interval';
import {yqlJson} from './plugins/yql-json';
import {yqlList} from './plugins/yql-list';
import {yqlNull} from './plugins/yql-null';
import {yqlPg} from './plugins/yql-pg';
import {yqlSet} from './plugins/yql-set';
import {yqlStream} from './plugins/yql-stream';
import {yqlString} from './plugins/yql-string';
import {yqlStruct} from './plugins/yql-struct';
import {yqlTagged} from './plugins/yql-tagged';
import {yqlTimestamp} from './plugins/yql-timestamp';
import {yqlTuple} from './plugins/yql-tuple';
import {yqlTzdate} from './plugins/yql-tzdate';
import {yqlTzdatetime} from './plugins/yql-tzdatetime';
import {yqlTztimestamp} from './plugins/yql-tztimestamp';
import {yqlUint64} from './plugins/yql-uint64';
import {yqlUtf8} from './plugins/yql-utf8';
import {yqlUuid} from './plugins/yql-uuid';
import {yqlVariant} from './plugins/yql-variant';
import {yqlYson} from './plugins/yql-yson';
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
_plugins.list = list(_format);
_plugins.map = map(_format);
_plugins.string = string(_format);
_plugins.number = int64(_format);
_plugins.int64 = int64(_format);
_plugins.uint64 = uint64(_format);
_plugins.double = double(_format);
_plugins.boolean = boolean(_format);
_plugins.null = nullPlugin(_format);
_plugins.tagged = tagged(_format);

// YQL
_plugins['yql.list'] = yqlList(_format);
_plugins['yql.stream'] = yqlStream(_format);
_plugins['yql.tuple'] = yqlTuple(_format);
_plugins['yql.struct'] = yqlStruct(_format);
_plugins['yql.dict'] = yqlDict(_format);
_plugins['yql.string'] = yqlString(_format);
_plugins['yql.utf8'] = yqlUtf8(_format);
// yql.int[8|16|32] should have the same l&f as yql.int64
_plugins['yql.int64'] = yqlInt64(_format);
_plugins['yql.int8'] = _plugins['yql.int64'];
_plugins['yql.int16'] = _plugins['yql.int64'];
_plugins['yql.int32'] = _plugins['yql.int64'];
// yql.uint[8|16|32] should have the same l&f as yql.uint64
_plugins['yql.uint64'] = yqlUint64(_format);
_plugins['yql.uint8'] = _plugins['yql.uint64'];
_plugins['yql.uint16'] = _plugins['yql.uint64'];
_plugins['yql.uint32'] = _plugins['yql.uint64'];
// yql.float should have the same l&f as yql.double
_plugins['yql.double'] = yqlDouble(_format);
_plugins['yql.float'] = _plugins['yql.double'];
_plugins['yql.decimal'] = yqlDecimal(_format);
_plugins['yql.bool'] = yqlBool(_format);
_plugins['yql.date'] = yqlDate(_format);
_plugins['yql.date32'] = _plugins['yql.date'];
_plugins['yql.datetime'] = yqlDatetime(_format);
_plugins['yql.datetime64'] = _plugins['yql.datetime'];
_plugins['yql.timestamp'] = yqlTimestamp(_format);
_plugins['yql.timestamp64'] = _plugins['yql.timestamp'];
_plugins['yql.tzdate'] = yqlTzdate(_format);
_plugins['yql.tzdate32'] = _plugins['yql.tzdate'];
_plugins['yql.tzdatetime'] = yqlTzdatetime(_format);
_plugins['yql.tzdatetime64'] = _plugins['yql.tzdatetime'];
_plugins['yql.tztimestamp'] = yqlTztimestamp(_format);
_plugins['yql.tztimestamp64'] = _plugins['yql.tztimestamp'];
_plugins['yql.interval'] = yqlInterval(_format);
_plugins['yql.interval64'] = _plugins['yql.interval'];
_plugins['yql.uuid'] = yqlUuid(_format);
_plugins['yql.null'] = yqlNull(_format);
_plugins['yql.variant'] = yqlVariant(_format);
_plugins['yql.enum'] = yqlEnum(_format);
_plugins['yql.set'] = yqlSet(_format);
_plugins['yql.json'] = yqlJson(_format);
_plugins['yql.yson'] = yqlYson(_format);
_plugins['yql.tagged'] = yqlTagged(_format);
_plugins['yql.pg'] = yqlPg(_format);

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
