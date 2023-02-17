module.exports = function (_format) {
    var mapFragment = require('../utils/map-fragment')(_format);

    function yqlVariant(node, settings, level) {
        var currentValue = node.$value;

        return mapFragment(currentValue, settings, level - 1);
    }

    return yqlVariant;
};
