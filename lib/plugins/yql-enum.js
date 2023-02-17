module.exports = function (_format) {
    function yqlEnum(node, settings, level) {
        return node.$value;
    }

    yqlEnum.isScalar = true;

    return yqlEnum;
};
