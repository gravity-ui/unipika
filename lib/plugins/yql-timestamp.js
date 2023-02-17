module.exports = function (/*_format*/) {
    var utils = require('../utils/format');

    var TIMESTAMP_DIVISOR = 1000;
    var ISO_SUB_LENGTH = '2000-01-01T01:02:03.000'.length;

    function padMicroseconds(microseconds) {
        var ms = String(microseconds);
        return utils.repeatChar('0', 3 - ms.length) + ms;
    }

    function timestamp(node/*, settings, level*/) {
        var value = Number(node.$value);
        var microseconds = value % TIMESTAMP_DIVISOR;
        var timestamp = value / TIMESTAMP_DIVISOR;
        var dateTime = new Date(timestamp);
        if (isNaN(dateTime.valueOf())) {
            return 'Invalid timestamp';
        }
        return dateTime.toISOString().substr(0, ISO_SUB_LENGTH) + padMicroseconds(microseconds) + 'Z';
    }

    timestamp.isScalar = true;

    return timestamp;
};
