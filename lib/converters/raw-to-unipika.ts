import type {FormatNode} from '../utils/format';
import {type as getType} from '../utils/type';

const VALUE = '$value';
const TYPE = '$type';

const SERIALIZE_SAFE: Record<string, null> = {
    string: null,
    number: null, // Does not include NaN, Infinity, -Infinity
    boolean: null,
    null: null,
    object: null, // Does not include regex, domElement etc...
    array: null,
};

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

// Converter must not mutate original data
function normalize(node: unknown): FormatNode {
    const nodeType = getType(node);

    if (!Object.prototype.hasOwnProperty.call(SERIALIZE_SAFE, nodeType)) {
        throw new Error('unipika: invalid input - node type "' + nodeType + '" is not supported.');
    }

    return {
        $type: mapType(nodeType),
        $value: node,
    };
}

type RawSettings = {
    [key: string]: unknown;
};

function restructureMap(
    nodeValue: Record<string, unknown>,
    settings: RawSettings,
): [FormatNode, FormatNode][] {
    return Object.keys(nodeValue).map(function (key) {
        const convertedKey = normalize(key);

        if (key === '$attributes' || key === '$value' || key === '$incomplete' || key === '$type') {
            convertedKey.$special_key = true;
        } else {
            convertedKey.$key = true;
        }

        return [convertedKey, convert(nodeValue[key], settings)];
    });
}

function convertMapValue(node: FormatNode, settings: RawSettings): FormatNode {
    node[VALUE] = restructureMap(node[VALUE] as Record<string, unknown>, settings);
    return node;
}

function convertListValue(node: FormatNode, settings: RawSettings): FormatNode {
    node[VALUE] = (node[VALUE] as unknown[]).map(function (currentNode) {
        return convert(currentNode, settings);
    });
    return node;
}

export function convert(node: unknown, settings?: RawSettings): FormatNode {
    let type: string;

    let normalized: FormatNode = normalize(node);

    if (normalized) {
        type = normalized[TYPE];

        if (type === 'map') {
            normalized = convertMapValue(normalized, settings || {});
        } else if (type === 'list') {
            normalized = convertListValue(normalized, settings || {});
        }
    }

    return normalized;
}
