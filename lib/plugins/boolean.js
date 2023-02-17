module.exports = function (/*_format*/) {
    function boolean(node, settings/*, level*/) {
        return settings.format === 'yson' ?
            ('%' + node.$value) :
            node.$value;
    }

    boolean.isScalar = true;

    return boolean;
};
