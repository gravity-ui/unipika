import {type as discoverType} from './type';

export const TYPE_KEY = '$type';
export const VALUE_KEY = '$value';
export const ATTRIBUTES_KEY = '$attributes';
export const INCOMPLETE_KEY = '$incomplete';
export const BINARY_KEY = '$binary';

type YsonNode = Record<string, unknown>;

/**
 * Returns true if node is not falsy,
 * node has a specified property,
 * and property value is not undefined.
 * @param node - the node to check.
 * @param property - the property name to look for.
 * @returns whether the node has a defined, non-undefined value for the property.
 */
export function hasSpecialProperty(node: YsonNode, property: string): boolean {
    return (
        Boolean(node) &&
        Object.prototype.hasOwnProperty.call(node, property) &&
        typeof node[property] !== 'undefined'
    );
}

export function value(node: YsonNode): unknown {
    return hasSpecialProperty(node, VALUE_KEY) ? node[VALUE_KEY] : node;
}

export function attributes(node: YsonNode): YsonNode {
    return hasSpecialProperty(node, ATTRIBUTES_KEY) ? (node[ATTRIBUTES_KEY] as YsonNode) : {};
}

export function type(node: YsonNode): unknown {
    return hasSpecialProperty(node, TYPE_KEY) ? node[TYPE_KEY] : discoverType(value(node));
}
