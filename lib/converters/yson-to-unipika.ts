import {parseSetting} from '../utils/format';
import {type as getType} from '../utils/type';
import {decode as decodeString} from '../utils/utf8';
import * as yson from '../utils/yson';

import type {ConverterNode, ConverterSettings} from './types';

const VALUE = '$value';
const DECODED_VALUE = '$decoded_value';
const TYPE = '$type';
const ATTRIBUTES = '$attributes';
const BINARY = '$binary';
const INCOMPLETE = '$incomplete';

const SERIALIZE_SAFE: Record<string, null> = {
    string: null,
    number: null, // Does not include NaN, Infinity, -Infinity
    boolean: null,
    null: null,
    object: null, // Does not include regex, domElement etc...
    array: null,
};

type YsonInput = Record<string, unknown>;

function mapType(type: string): string {
    switch (type) {
        case 'array':
            return 'list';
        case 'object':
            return 'map';
        default:
            return type;
    }
}

function copyIncomplete(normalized: ConverterNode, node: YsonInput): void {
    // Reference incomplete
    if (yson.hasSpecialProperty(node, INCOMPLETE)) {
        const incompleteType = getType(node[INCOMPLETE]);

        if (incompleteType !== 'boolean') {
            throw new Error(
                'unipika: invalid input - $attributes must be an object instead got "' +
                    incompleteType +
                    '".',
            );
        }

        normalized[INCOMPLETE] = node[INCOMPLETE] as boolean;
    }
}

function copyAttributes(normalized: ConverterNode, node: YsonInput): void {
    // Reference attributes
    if (yson.hasSpecialProperty(node, ATTRIBUTES)) {
        const attributesType = getType(node[ATTRIBUTES]);

        if (attributesType !== 'object') {
            throw new Error(
                'unipika: invalid input - $attributes must be an object instead got "' +
                    attributesType +
                    '".',
            );
        }

        normalized[ATTRIBUTES] = Object.assign({}, node[ATTRIBUTES] as Record<string, unknown>);
    }
}

function copyTypeAndValue(normalized: ConverterNode, node: YsonInput): void {
    // Add standard wrapper
    // 42 => { $value: 42 }
    normalized[VALUE] = yson.hasSpecialProperty(node, VALUE) ? node[VALUE] : node;

    const valueType = getType(normalized[VALUE]);

    if (!Object.prototype.hasOwnProperty.call(SERIALIZE_SAFE, valueType)) {
        throw new Error(
            'unipika: invalid input - $value type "' + valueType + '" is not supported.',
        );
    }

    // Annotate with type
    // { $value: 42 } => { $value: 42, $type: 'number' }
    if (yson.hasSpecialProperty(node, TYPE)) {
        const typeType = getType(node[TYPE]);

        if (typeType !== 'undefined' && typeType !== 'string') {
            throw new Error(
                'unipika: invalid input - $type must be a string instead got "' + typeType + '".',
            );
        }

        normalized[TYPE] = node[TYPE] as string;
    } else {
        normalized[TYPE] = mapType(valueType);
    }
}

const TAG_ATTRIBUTE_NAME = '_type_tag';

function convertToTaggedType(normalized: ConverterNode): void {
    // YT does not have a tagged type yet, tagged type is derived from attributes
    // If value is incomplete - do not convert, show as built-in-type
    if (
        Object.prototype.hasOwnProperty.call(normalized, ATTRIBUTES) &&
        !Object.prototype.hasOwnProperty.call(normalized, INCOMPLETE)
    ) {
        const attributes = normalized[ATTRIBUTES] as Record<string, unknown>;
        const tagAttribute = attributes[TAG_ATTRIBUTE_NAME];

        if (typeof tagAttribute !== 'undefined') {
            const tag = yson.value(tagAttribute as YsonInput);

            const convertedValue = convertTagValue(tag, normalized);

            if (convertedValue) {
                normalized.$type = 'tagged';
                normalized.$tag = tag as string;
                normalized.$value = convertedValue;
                delete attributes[TAG_ATTRIBUTE_NAME];
            }
        }
    }
}

function convertURLTagValue(normalized: ConverterNode): ConverterNode | undefined {
    const value = normalized.$value;
    const type = normalized.$type;

    if (type === 'string') {
        return {
            $type: 'tag_value',
            $value: {
                href: value,
            },
        };
    } else if (type === 'map') {
        const mapValue = value as Record<string, unknown>;
        if (Object.prototype.hasOwnProperty.call(mapValue, 'href')) {
            return {
                $type: 'tag_value',
                $value: {
                    href: yson.value(mapValue.href as YsonInput),
                    text: yson.value(mapValue.text as YsonInput),
                    title: yson.value(mapValue.title as YsonInput),
                },
            };
        }
    }
    return undefined;
}

function convertOtherTagValue(normalized: ConverterNode): ConverterNode {
    return {
        $type: normalized.$type,
        $value: normalized.$value,
    };
}

function convertTagValue(tag: unknown, normalized: ConverterNode): ConverterNode | undefined {
    switch (tag) {
        case 'url':
            return convertURLTagValue(normalized);
        default:
            return convertOtherTagValue(normalized);
    }
}

// Converter must not mutate original data
function normalize(node: unknown): ConverterNode {
    const normalized: ConverterNode = {$type: '', $value: undefined};

    copyTypeAndValue(normalized, node as YsonInput);
    copyAttributes(normalized, node as YsonInput);
    copyIncomplete(normalized, node as YsonInput);

    convertToTaggedType(normalized);

    return normalized;
}

function restructureMap(
    nodeValue: Record<string, unknown>,
    settings: ConverterSettings,
): [ConverterNode, ConverterNode][] {
    return Object.keys(nodeValue).map(function (key) {
        const convertedKey = convert(normalize(key), settings);
        convertedKey.$key = true;
        return [convertedKey, convert(nodeValue[key], settings)];
    });
}

function convertAttributes(node: ConverterNode, settings: ConverterSettings): ConverterNode {
    node[ATTRIBUTES] = restructureMap(node[ATTRIBUTES] as Record<string, unknown>, settings);
    return node;
}

function convertMapValue(node: ConverterNode, settings: ConverterSettings): ConverterNode {
    node[VALUE] = restructureMap(node[VALUE] as Record<string, unknown>, settings);
    return node;
}

function convertListValue(node: ConverterNode, settings: ConverterSettings): ConverterNode {
    node[VALUE] = (node[VALUE] as unknown[]).map(function (currentNode) {
        return convert(currentNode, settings);
    });
    return node;
}

function convertStringValue(node: ConverterNode, settings: ConverterSettings): ConverterNode {
    try {
        node[DECODED_VALUE] = settings.decodeUTF8
            ? decodeString(node[VALUE] as string, {
                  allowTruncatedEnd: node[INCOMPLETE] as boolean | undefined,
              })
            : node[VALUE];
    } catch (e) {
        node[BINARY] = true;
    }

    return node;
}

export function convert(node: unknown, settings?: ConverterSettings): ConverterNode {
    let type: string;

    const resolvedSettings: ConverterSettings = settings || {};
    resolvedSettings.decodeUTF8 = parseSetting(
        resolvedSettings as Record<string, unknown>,
        'decodeUTF8',
        true,
    ) as boolean;

    let normalized: ConverterNode = normalize(node);

    if (normalized) {
        // CONVERT ATTRIBUTES
        if (yson.hasSpecialProperty(normalized as unknown as YsonInput, ATTRIBUTES)) {
            normalized = convertAttributes(normalized, resolvedSettings);
        }

        // CONVERT VALUES
        type = normalized[TYPE];

        if (type === 'map') {
            normalized = convertMapValue(normalized, resolvedSettings);
        } else if (type === 'list') {
            normalized = convertListValue(normalized, resolvedSettings);
        } else if (type === 'string') {
            normalized = convertStringValue(normalized, resolvedSettings);
        }
    }

    return normalized;
}
