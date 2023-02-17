module.exports = function (_format) {
    var utils = require('./format');

    var SORTABLE_TYPES = {
        string: null,
        'yql.string': null
    };

    function sortKeys(keyValuePairA, keyValuePairB) {
        var currentKeyA = keyValuePairA[0];
        var currentKeyB = keyValuePairB[0];

        return (SORTABLE_TYPES.hasOwnProperty(currentKeyA.$type) &&
            SORTABLE_TYPES.hasOwnProperty(currentKeyB.$type) &&
            currentKeyA.$value) > currentKeyB.$value ? 1 : -1;
    }

    function getKeyValues(value, settings) {
        var result = value
            .slice()
            .sort(sortKeys);

        return settings.limitMapLength > 0 ? result.slice(0, settings.limitMapLength) : result;
    }

    function mapFragment(value, settings, level) {
        var keyValues = value
            .slice()
            .sort(sortKeys);

        var isMapOutOfLimit = settings.limitMapLength > 0 && value.length > settings.limitMapLength;
        if (isMapOutOfLimit) {
            keyValues = keyValues.slice(0, settings.limitMapLength - 1);
        }

        return keyValues
            .map(function (keyValuePair) {
                var resultString = '';

                resultString += _format(keyValuePair[0], settings, level + 1);
                resultString += utils.KEY_VALUE_SEPARATOR(settings);
                resultString += _format(keyValuePair[1], settings, level + 1);

                return resultString;
            })
            .concat(isMapOutOfLimit ? ['... ' + (value.length - settings.limitMapLength + 1) + ' hidden keys'] : [])
            .join(utils.EXPRESSION_TERMINATOR(settings) + utils.INDENT(settings, level));
    }

    return mapFragment;
};
