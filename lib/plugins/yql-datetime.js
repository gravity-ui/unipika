module.exports = function (/*_format*/) {
    const dateConverter = require('./yql-date');

    const TIMESTAMP_MULTIPLIER = 1000;
    const SECONDS_IN_DAY = 86_400;

    function datetimeConverter(node /*, settings, level*/) {
        const seconds = Number(node.$value);

        const milliseconds = seconds * TIMESTAMP_MULTIPLIER;
        const days = Math.floor(seconds / SECONDS_IN_DAY);

        const dateTime = new Date(milliseconds);

        if (isNaN(dateTime.valueOf())) {
            return 'Invalid datetime';
        }

        const dateTimeISO = dateTime.toISOString();

        const timeISO = `T${dateTimeISO.split('T')[1].replace('.000Z', 'Z')}`;

        const date = dateConverter()({$value: days});

        return `${date}${timeISO}`;
    }

    datetimeConverter.isScalar = true;

    return datetimeConverter;
};
