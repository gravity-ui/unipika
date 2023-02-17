(function () {
    'use strict';

    var discoverType = require('./type');

    var TYPE_KEY = '$type';
    var VALUE_KEY = '$value';
    var ATTRIBUTES_KEY = '$attributes';
    var INCOMPLETE_KEY = '$incomplete';
    var BINARY_KEY = '$binary';

    /**
     * Returns true if node is not falsy,
     * node has a specified property,
     * and property value is not undefined.
     * @param {Object} node
     * @param {String} property
     * @returns {*|Boolean}
     */
    function hasSpecialProperty(node, property) {
        return node && node.hasOwnProperty(property) && typeof node[property] !== 'undefined';
    }

    function value(node) {
        return hasSpecialProperty(node, VALUE_KEY) ? node[VALUE_KEY] : node;
    }

    function attributes(node) {
        return hasSpecialProperty(node, ATTRIBUTES_KEY) ? node[ATTRIBUTES_KEY] : {};
    }

    function type(node) {
        return hasSpecialProperty(node, TYPE_KEY) ? node[TYPE_KEY] : discoverType(value(node));
    }

    module.exports = {
        hasSpecialProperty: hasSpecialProperty,
        attributes: attributes,
        value: value,
        type: type,
        ATTRIBUTES_KEY: ATTRIBUTES_KEY,
        VALUE_KEY: VALUE_KEY,
        TYPE_KEY: TYPE_KEY,
        INCOMPLETE_KEY: INCOMPLETE_KEY,
        BINARY_KEY: BINARY_KEY
    };
})();
