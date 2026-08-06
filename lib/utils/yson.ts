import {type as discoverType} from './type';

export const TYPE_KEY = '$type';
export const VALUE_KEY = '$value';
export const ATTRIBUTES_KEY = '$attributes';
export const INCOMPLETE_KEY = '$incomplete';
export const BINARY_KEY = '$binary';

/**
 * Returns true if node is not falsy,
 * node has a specified property,
 * and property value is not undefined.
 * @param {Object} node
 * @param {String} property
 * @returns {*|Boolean}
 */
export function hasSpecialProperty(node, property) {
    return (
        node &&
        Object.prototype.hasOwnProperty.call(node, property) &&
        typeof node[property] !== 'undefined'
    );
}

export function value(node) {
    return hasSpecialProperty(node, VALUE_KEY) ? node[VALUE_KEY] : node;
}

export function attributes(node) {
    return hasSpecialProperty(node, ATTRIBUTES_KEY) ? node[ATTRIBUTES_KEY] : {};
}

export function type(node) {
    return hasSpecialProperty(node, TYPE_KEY) ? node[TYPE_KEY] : discoverType(value(node));
}
