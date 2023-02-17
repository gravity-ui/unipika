module.exports = function (_format) {
    var utils = require('../utils/format');
    var mapFragment = require('../utils/map-fragment')(_format);

    function map(node, settings, level) {
        var resultString = '';
        var currentValue = node.$value;
        var numberOfKeys = currentValue.length;

        if (utils.drawFullView(numberOfKeys, settings)) {
            resultString += utils.OBJECT_START + utils.INDENT(settings, level);
            resultString += mapFragment(currentValue, settings, level);
            resultString += utils.INDENT(settings, level - 1) + utils.OBJECT_END;
        } else if (utils.drawCompactView(numberOfKeys, settings)) {
            resultString += utils.OBJECT_START;
            resultString += mapFragment(currentValue, settings, level - 1);
            resultString += utils.OBJECT_END;
        } else {
            resultString += utils.OBJECT_START + utils.OBJECT_END;
        }
        return resultString;
    }

    return map;
};
