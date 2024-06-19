module.exports = function (/*_format*/) {
    const utils = require('../utils/format');

    const TIMESTAMP_DIVISOR = 1000;

    function padMicroseconds(microseconds) {
        const ms = String(microseconds);
        return utils.repeatChar('0', 3 - ms.length) + ms;
    }

    function timestamp(node /*, settings, level*/) {
        try {
            const value = BigInt(node.$value);
            const divisor = BigInt(TIMESTAMP_DIVISOR);
            const microseconds = value % divisor;
            const timestampVal = value / divisor;
            const dateTime = new Date(Number(timestampVal));
            return dateTime.toISOString().replace('Z', '') + padMicroseconds(microseconds) + 'Z';
        } catch (e) {
            return 'Invalid timestamp';
        }
    }

    timestamp.isScalar = true;

    return timestamp;
};
