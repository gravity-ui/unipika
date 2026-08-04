module.exports = function (/*_format*/) {
    function yqlEnum(node /*, _settings, _level*/) {
        return node.$value;
    }

    yqlEnum.isScalar = true;

    return yqlEnum;
};
