module.exports = function (/*_format*/) {
    function int64(node, settings /*, level*/) {
        let value = node.$value;
        if (typeof settings.customNumberFormatter === 'function') {
            value = settings.customNumberFormatter(node.$value, node.$type);
        }
        return value;
    }

    int64.isScalar = true;

    return int64;
};
