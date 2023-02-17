module.exports = function (/*_format*/) {
    function tztimestamp(node/*, settings, level*/) {
        return node.$value;
    }

    tztimestamp.isScalar = true;

    return tztimestamp;
};
