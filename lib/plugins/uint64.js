module.exports = function (/*_format*/) {
    function uint64(node, settings/*, level*/) {
        var value = node.$value;
        if (typeof settings.customNumberFormatter === 'function') {
            return settings.customNumberFormatter(node.$value, node.$type);
        }
        return settings.format === 'yson' ?
            (value + 'u') :
            value;
    }

    uint64.isScalar = true;

    return uint64;
};
