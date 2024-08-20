module.exports = function (/*_format*/) {
    const TIMESTAMP_MULTIPLIER = 24 * 60 * 60 * 1000; // number of milliseconds in a day

    function date(node /*, settings, level*/) {
        const timestamp = Number(node.$value) * TIMESTAMP_MULTIPLIER;
        const dateTime = new Date(timestamp);
        const year = dateTime.getFullYear();
        if (year <= 0) {
            dateTime.setFullYear(year - 1);
        }
        if (isNaN(dateTime.valueOf())) {
            return 'Invalid date';
        }
        return dateTime.toISOString().split('T')[0];
    }

    date.isScalar = true;

    return date;
};
