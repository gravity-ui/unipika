module.exports = function (/*_format*/) {
    var TIMESTAMP_MULTIPLIER = 1000;
    var ISO_SUB_LENGTH = '2000-01-01T01:02:03'.length;

    function datetime(node/*, settings, level*/) {
        var timestamp = Number(node.$value) * TIMESTAMP_MULTIPLIER;
        var dateTime = new Date(timestamp);
        if (isNaN(dateTime.valueOf())) {
            return 'Invalid datetime';
        }
        return dateTime.toISOString().substr(0, ISO_SUB_LENGTH) + 'Z';
    }

    datetime.isScalar = true;

    return datetime;
};
