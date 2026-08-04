module.exports = function (/*_format*/) {
    function entity(node, settings /*, level*/) {
        return settings.format === 'yson' ? '#' : node.$value;
    }

    entity.isScalar = true;

    return entity;
};
