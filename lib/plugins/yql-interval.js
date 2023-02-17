module.exports = function (/*_format*/) {
    var utils = require('../utils/format');

    var PARTS = [
        {
            name: 'microsecond',
            divisor: 1000000
        },
        {
            name: 'second',
            divisor: 60
        },
        {
            name: 'minute',
            divisor: 60
        },
        {
            name: 'hour',
            divisor: 24
        },
        {
            name: 'day'
        }
    ];

    function interval(node/*, settings, level*/) {
        var sign = Number(node.$value) < 0 ? '-' : '';
        var value = Math.abs(node.$value);

        if (value === 0) {
            return '0';
        }

        var stringifiedInterval = PARTS
            .map(function (item) {
                var partialValue = value;
                if (item.divisor) {
                    partialValue = value % item.divisor;
                    value = Math.floor(value / item.divisor);
                } else {
                    partialValue = value;
                    value = 0;
                }
                return [partialValue, item.name];
            })
            .reverse()
            .filter(function (item) {
                return item[0] > 0;
            })
            .map(function (item) {
                var partialValue = item[0];
                var suffix = partialValue > 1 ? 's' : '';
                return partialValue + utils.NON_BREAKING_WHITESPACE + item[1] + suffix;
            })
            .join(utils.WHITESPACE);

        return sign + stringifiedInterval;
    }

    interval.isScalar = true;

    return interval;
};
