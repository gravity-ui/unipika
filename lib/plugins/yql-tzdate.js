module.exports = function (/*_format*/) {
    function tzdate(node/*, settings, level*/) {
        return node.$value;
    }

    tzdate.isScalar = true;

    return tzdate;
};
