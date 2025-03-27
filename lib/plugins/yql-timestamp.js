module.exports = function (/*_format*/) {
    const utils = require('../utils/format');

    const TIMESTAMP_DIVISOR = 1000;

    function padMicroseconds(microseconds) {
        const ms = String(microseconds);
        return utils.repeatChar('0', 3 - ms.length) + ms;
    }

    function removeLeadingZeros(str) {
        return str.replace(/^(-)?0+/, '$1');
    }

    function timestamp(node /*, settings, level*/) {
        try {
            const value = BigInt(node.$value);
            const divisor = BigInt(TIMESTAMP_DIVISOR);

            let microseconds = value % divisor;
            const milliseconds = value / divisor;
            const dateTime = new Date(Number(milliseconds));
            const year = dateTime.getFullYear();
            if (year <= 0) {
                dateTime.setFullYear(year - 1);
            }

            if (microseconds < 0) {
                microseconds = microseconds + divisor;
                const millis = dateTime.getMilliseconds();
                dateTime.setMilliseconds(millis - 1);
            }
            const dateTimeStr =
                dateTime.toISOString().replace('Z', '') + padMicroseconds(microseconds) + 'Z';
            return removeLeadingZeros(dateTimeStr);
        } catch (e) {
            return 'Invalid timestamp';
        }
    }

    timestamp.isScalar = true;

    return timestamp;
};
