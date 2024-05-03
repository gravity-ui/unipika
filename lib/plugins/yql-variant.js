module.exports = function (_format) {
    const mapFragment = require('../utils/map-fragment')(_format);

    function yqlVariant(node, settings, level) {
        const currentValue = node.$value;

        return mapFragment(currentValue, settings, level - 1);
    }

    return yqlVariant;
};
