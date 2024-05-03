module.exports = function (/*_format*/) {
    const TIMESTAMP_MULTIPLIER = 24 * 60 * 60 * 1000; // number of milliseconds in a day
    const ISO_SUB_LENGTH = '2000-01-01'.length;

    function date(node /*, settings, level*/) {
        const timestamp = Number(node.$value) * TIMESTAMP_MULTIPLIER;
        const dateTime = new Date(timestamp);
        if (isNaN(dateTime.valueOf())) {
            return 'Invalid date';
        }
        return dateTime.toISOString().substr(0, ISO_SUB_LENGTH);
    }

    date.isScalar = true;

    return date;
};
