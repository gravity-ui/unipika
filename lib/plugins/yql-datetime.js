module.exports = function (/*_format*/) {
    const dateConverter = require('./yql-date');

    const INVALID_MOCK = 'Invalid datetime';

    const TIMESTAMP_MULTIPLIER = 1000;
    const SECONDS_IN_DAY = 86_400;

    function isValidDate(date) {
        return /^[+-]?\d+-\d{2}-\d{2}$/.test(date);
    }

    function datetimeConverter(node /*, settings, level*/) {
        const seconds = Number(node.$value);

        const milliseconds = seconds * TIMESTAMP_MULTIPLIER;
        const days = Math.floor(seconds / SECONDS_IN_DAY);

        const dateTime = new Date(milliseconds);

        if (isNaN(dateTime.valueOf())) {
            return INVALID_MOCK;
        }

        const dateTimeISO = dateTime.toISOString();

        const timeISO = `T${dateTimeISO.split('T')[1].replace('.000Z', 'Z')}`;

        const date = dateConverter()({$value: days});

        if (!isValidDate(date)) return INVALID_MOCK;

        return `${date}${timeISO}`;
    }

    datetimeConverter.isScalar = true;

    return datetimeConverter;
};
