module.exports = function (_format) {
    const utils = require('./format');

    const SORTABLE_TYPES = {
        string: null,
        'yql.string': null,
    };

    function sortKeys(keyValuePairA, keyValuePairB) {
        const currentKeyA = keyValuePairA[0];
        const currentKeyB = keyValuePairB[0];

        return (Object.prototype.hasOwnProperty.call(SORTABLE_TYPES, currentKeyA.$type) &&
            Object.prototype.hasOwnProperty.call(SORTABLE_TYPES, currentKeyB.$type) &&
            currentKeyA.$value) > currentKeyB.$value
            ? 1
            : -1;
    }

    function mapFragment(value, settings, level) {
        let keyValues = value.slice().sort(sortKeys);

        const isMapOutOfLimit =
            settings.limitMapLength > 0 && value.length > settings.limitMapLength;
        if (isMapOutOfLimit) {
            keyValues = keyValues.slice(0, settings.limitMapLength - 1);
        }

        return keyValues
            .map(function (keyValuePair) {
                let resultString = '';

                resultString += _format(keyValuePair[0], settings, level + 1);
                resultString += utils.getKeyValueSeparator(settings);
                resultString += _format(keyValuePair[1], settings, level + 1);

                return resultString;
            })
            .concat(
                isMapOutOfLimit
                    ? ['... ' + (value.length - settings.limitMapLength + 1) + ' hidden keys']
                    : [],
            )
            .join(utils.getExpressionTerminator(settings) + utils.getIndent(settings, level));
    }

    return mapFragment;
};
