module.exports = function (/*_format*/) {
    const utils = require('../utils/format');

    const PARTS = [
        {
            name: 'microsecond',
            divisor: 1000000,
        },
        {
            name: 'second',
            divisor: 60,
        },
        {
            name: 'minute',
            divisor: 60,
        },
        {
            name: 'hour',
            divisor: 24,
        },
        {
            name: 'day',
        },
    ];

    function interval(node /*, settings, level*/) {
        const sign = Number(node.$value) < 0 ? '-' : '';
        let value = Math.abs(node.$value);

        if (value === 0) {
            return '0';
        }

        const stringifiedInterval = PARTS.map(function (item) {
            let partialValue = value;
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
                const partialValue = item[0];
                const suffix = partialValue > 1 ? 's' : '';
                return partialValue + utils.NON_BREAKING_WHITESPACE + item[1] + suffix;
            })
            .join(utils.WHITESPACE);

        return sign + stringifiedInterval;
    }

    interval.isScalar = true;

    return interval;
};
