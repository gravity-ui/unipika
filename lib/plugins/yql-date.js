module.exports = function (/*_format*/) {
    var TIMESTAMP_MULTIPLIER = 24 * 60 * 60 * 1000; // number of milliseconds in a day
    var ISO_SUB_LENGTH = '2000-01-01'.length;

    function date(node/*, settings, level*/) {
        var timestamp = Number(node.$value) * TIMESTAMP_MULTIPLIER;
        var dateTime = new Date(timestamp);
        if (isNaN(dateTime.valueOf())) {
            return 'Invalid date';
        }
        return dateTime.toISOString().substr(0, ISO_SUB_LENGTH);
    }

    date.isScalar = true;

    return date;
};
