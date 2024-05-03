(function () {
    'use strict';

    const getType = require('../utils/type');

    const VALUE = '$value';
    const TYPE = '$type';

    const SERIALIZE_SAFE = {
        string: null,
        number: null, // Does not include NaN, Infinity, -Infinity
        boolean: null,
        null: null,
        object: null, // Does not include regex, domElement etc...
        array: null,
    };

    function mapType(type) {
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
    function normalize(node) {
        const nodeType = getType(node);

        if (!Object.prototype.hasOwnProperty.call(SERIALIZE_SAFE, nodeType)) {
            throw new Error(
                'unipika: invalid input - node type "' + nodeType + '" is not supported.',
            );
        }

        return {
            $type: mapType(nodeType),
            $value: node,
        };
    }

    function restructureMap(nodeValue, settings) {
        return Object.keys(nodeValue).map(function (key) {
            const convertedKey = normalize(key);

            if (
                key === '$attributes' ||
                key === '$value' ||
                key === '$incomplete' ||
                key === '$type'
            ) {
                convertedKey.$special_key = true;
            } else {
                convertedKey.$key = true;
            }

            return [convertedKey, convert(nodeValue[key], settings)];
        });
    }

    function convertMapValue(node, settings) {
        node[VALUE] = restructureMap(node[VALUE], settings);
        return node;
    }

    function convertListValue(node, settings) {
        node[VALUE] = node[VALUE].map(function (currentNode) {
            return convert(currentNode, settings);
        });
        return node;
    }

    const convert = function (node, settings) {
        let type;

        node = normalize(node);

        if (node) {
            type = node[TYPE];

            if (type === 'map') {
                node = convertMapValue(node, settings);
            } else if (type === 'list') {
                node = convertListValue(node, settings);
            }
        }

        return node;
    };

    module.exports = convert;
})();
