module.exports = function (/*_format*/) {
    function tzdatetime(node /*, settings, level*/) {
        return node.$value;
    }

    tzdatetime.isScalar = true;

    return tzdatetime;
};
