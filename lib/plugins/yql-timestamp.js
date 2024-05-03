module.exports = function (/*_format*/) {
    const utils = require('../utils/format');

    const TIMESTAMP_DIVISOR = 1000;
    const ISO_SUB_LENGTH = '2000-01-01T01:02:03.000'.length;

    function padMicroseconds(microseconds) {
        const ms = String(microseconds);
        return utils.repeatChar('0', 3 - ms.length) + ms;
    }

    function timestamp(node /*, settings, level*/) {
        const value = Number(node.$value);
        const microseconds = value % TIMESTAMP_DIVISOR;
        const timestamp = value / TIMESTAMP_DIVISOR;
        const dateTime = new Date(timestamp);
        if (isNaN(dateTime.valueOf())) {
            return 'Invalid timestamp';
        }
        return (
            dateTime.toISOString().substr(0, ISO_SUB_LENGTH) + padMicroseconds(microseconds) + 'Z'
        );
    }

    timestamp.isScalar = true;

    return timestamp;
};
