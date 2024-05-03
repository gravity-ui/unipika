module.exports = function (/*_format*/) {
    const TIMESTAMP_MULTIPLIER = 1000;
    const ISO_SUB_LENGTH = '2000-01-01T01:02:03'.length;

    function datetime(node /*, settings, level*/) {
        const timestamp = Number(node.$value) * TIMESTAMP_MULTIPLIER;
        const dateTime = new Date(timestamp);
        if (isNaN(dateTime.valueOf())) {
            return 'Invalid datetime';
        }
        return dateTime.toISOString().substr(0, ISO_SUB_LENGTH) + 'Z';
    }

    datetime.isScalar = true;

    return datetime;
};
