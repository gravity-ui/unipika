module.exports = function (/*_format*/) {
    const utils = require('../utils/format');

    const TIMESTAMP_DIVISOR = 1000;

    const MICROSECONDS_IN_DAY = 86_400_000_000;

    function padMicroseconds(microseconds) {
        const ms = String(microseconds);
        return utils.repeatChar('0', 3 - ms.length) + ms;
    }

    function timestamp(node /*, settings, level*/) {
        try {
            const value = BigInt(node.$value);
            const divisor = BigInt(TIMESTAMP_DIVISOR);
            const microsecondsInDay = BigInt(MICROSECONDS_IN_DAY);

            let microseconds = value % divisor;
            const milliseconds = value / divisor;
            const dateTime = new Date(Number(milliseconds));
            const year = dateTime.getFullYear();
            if (year <= 0) {
                dateTime.setFullYear(year - 1);
            }

            if (microseconds < 0) {
                microseconds = (microseconds + microsecondsInDay) % divisor;
                const millis = dateTime.getMilliseconds();
                dateTime.setMilliseconds(millis - 1);
            }
            return dateTime.toISOString().replace('Z', '') + padMicroseconds(microseconds) + 'Z';
        } catch (e) {
            return 'Invalid timestamp';
        }
    }

    timestamp.isScalar = true;

    return timestamp;
};
