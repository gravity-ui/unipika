(function () {
    'use strict';

    var utils = require('../utils/format');
    var getType = require('../utils/type');
    var yson = require('../utils/yson');
    var decodeString = require('../utils/utf8').decode;

    var VALUE = '$value';
    var DECODED_VALUE = '$decoded_value';
    var TYPE = '$type';
    var ATTRIBUTES = '$attributes';
    var BINARY = '$binary';
    var INCOMPLETE = '$incomplete';

    var SERIALIZE_SAFE = {
        string: null,
        number: null, // Does not include NaN, Infinity, -Infinity
        boolean: null,
        null: null,
        object: null, // Does not include regex, domElement etc...
        array: null
    };

    function mapType(type) {
        switch(type) {
            case 'array':
                return 'list';
            case 'object':
                return 'map';
            default:
                return type;
        }
    }

    function copyIncomplete(normalized, node) {
        // Reference incomplete
        if (yson.hasSpecialProperty(node, INCOMPLETE)) {
            var incompleteType = getType(node[INCOMPLETE]);

            if (incompleteType !== 'boolean') {
                throw new Error('unipika: invalid input - $attributes must be an object instead got "' + incompleteType + '".');
            }

            normalized[INCOMPLETE] = node[INCOMPLETE];
        }
    }

    function copyAttributes(normalized, node) {
        // Reference attributes
        if (yson.hasSpecialProperty(node, ATTRIBUTES)) {
            var attributesType = getType(node[ATTRIBUTES]);

            if (attributesType !== 'object') {
                throw new Error('unipika: invalid input - $attributes must be an object instead got "' + attributesType + '".');
            }

            normalized[ATTRIBUTES] = Object.assign({}, node[ATTRIBUTES]);
        }
    }

    function copyTypeAndValue(normalized, node) {
        // Add standard wrapper
        // 42 => { $value: 42 }
        normalized[VALUE] = yson.hasSpecialProperty(node, VALUE) ? node[VALUE] : node;

        var valueType = getType(normalized[VALUE]);

        if (!SERIALIZE_SAFE.hasOwnProperty(valueType)) {
            throw new Error('unipika: invalid input - $value type "' + valueType + '" is not supported.');
        }

        // Annotate with type
        // { $value: 42 } => { $value: 42, $type: 'number' }
        if (yson.hasSpecialProperty(node, TYPE)) {
            var typeType = getType(node[TYPE]);

            if (typeType !== 'undefined' && typeType !== 'string') {
                throw new Error('unipika: invalid input - $type must be a string instead got "' + typeType + '".');
            }

            normalized[TYPE] = node[TYPE];
        } else {
            normalized[TYPE] = mapType(valueType);
        }
    }

    var TAG_ATTRIBUTE_NAME = '_type_tag';

    function convertToTaggedType(normalized) {
        // YT does not have a tagged type yet, tagged type is derived from attributes
        // If value is incomplete - do not convert, show as built-in-type
        if (
            normalized.hasOwnProperty('$attributes') &&
            !normalized.hasOwnProperty('$incomplete')
        ) {
            var tagAttribute = normalized.$attributes[TAG_ATTRIBUTE_NAME];

            if (typeof tagAttribute !== 'undefined') {
                var tag = yson.value(tagAttribute);

                    var convertedValue = convertTagValue(tag, normalized);

                    if (convertedValue) {
                        normalized.$type = 'tagged';
                        normalized.$tag = tag;
                        normalized.$value = convertedValue;
                        delete normalized.$attributes[TAG_ATTRIBUTE_NAME];
                    }
            }
        }
    }

    function convertURLTagValue(normalized) {
        var value = normalized.$value;
        var type = normalized.$type;

        if (type === 'string') {
            return {
                $type: 'tag_value',
                $value: {
                    href: value
                }
            };
        } else if (type === 'map') {
            if (value.hasOwnProperty('href')) {
                return {
                    $type: 'tag_value',
                    $value: {
                        href: yson.value(value.href),
                        text: yson.value(value.text),
                        title: yson.value(value.title)
                    }
                };
            }
        }
    }

    function convertOtherTagValue(normalized) {
        return {
            $type: normalized.$type,
            $value: normalized.$value
        };
    }

    function convertTagValue(tag, normalized) {
        switch (tag) {
            case 'url':
                return convertURLTagValue(normalized)
            default:
                return convertOtherTagValue(normalized)
        }
    }

    // Converter must not mutate original data
    function normalize(node) {
        var normalized = {};

        copyTypeAndValue(normalized, node);
        copyAttributes(normalized, node);
        copyIncomplete(normalized, node);

        convertToTaggedType(normalized);

        return normalized;
    }

    var convert;

    function restructureMap(nodeValue, settings) {
        return Object.keys(nodeValue)
            .map(function (key) {
                var convertedKey = convert(normalize(key), settings);
                convertedKey.$key = true;
                return [
                    convertedKey,
                    convert(nodeValue[key], settings)
                ];
            });
    }

    function convertAttributes(node, settings) {
        node[ATTRIBUTES] = restructureMap(node[ATTRIBUTES], settings);
        return node;
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

    function convertStringValue(node, settings) {
        try {
            node[DECODED_VALUE] = settings.decodeUTF8 ?
                decodeString(node[VALUE], { allowTruncatedEnd: node[INCOMPLETE] }) :
                node[VALUE];
        } catch (e) {
            node[BINARY] = true;
        }

        return node;
    }

    convert = function (node, settings) {
        var type;

        settings = settings || {};
        settings.decodeUTF8 = utils.parseSetting(settings, 'decodeUTF8', true);

        node = normalize(node);

        if (node) {
            // CONVERT ATTRIBUTES
            if (yson.hasSpecialProperty(node, ATTRIBUTES)) {
                node = convertAttributes(node);
            }

            // CONVERT VALUES
            type = node[TYPE];

            if (type === 'map') {
                node = convertMapValue(node, settings);
            } else if (type === 'list') {
                node = convertListValue(node, settings);
            } else if (type === 'string') {
                node = convertStringValue(node, settings);
            }
        }

        return node;
    };

    module.exports = convert;
})();
