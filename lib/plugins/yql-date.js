module.exports = function (/*_format*/) {
    var TIMESTAMP_MULTIPLIER = 24 * 60 * 60 * 1000; // number of milliseconds in a day
    var ISO_SLICE_INDEX = -14; // slice from the end, as the year may be big

    function date(node/*, settings, level*/) {
        var timestamp = Number(node.$value) * TIMESTAMP_MULTIPLIER;
        var dateTime = new Date(timestamp);
        if (isNaN(dateTime.valueOf())) {
            return 'Invalid date';
        }
        return dateTime.toISOString().slice(0, ISO_SLICE_INDEX);
    }

    date.isScalar = true;

    return date;
};
