module.exports = function (/*_format*/) {
    const TIMESTAMP_MULTIPLIER = 1000;

    function datetime(node /*, settings, level*/) {
        const timestamp = Number(node.$value) * TIMESTAMP_MULTIPLIER;
        const dateTime = new Date(timestamp);
        const year = dateTime.getFullYear();
        if (year <= 0) {
            dateTime.setFullYear(year - 1);
        }
        if (isNaN(dateTime.valueOf())) {
            return 'Invalid datetime';
        }
        return dateTime.toISOString().replace(/\.\d{3}Z$/, 'Z');
    }

    datetime.isScalar = true;

    return datetime;
};
