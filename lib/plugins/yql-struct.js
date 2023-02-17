module.exports = function (_format) {
    var utils = require('../utils/format');
    var mapFragment = require('../utils/map-fragment')(_format);

    function yqlStruct(node, settings, level) {
        var resultString = '';
        var currentValue = node.$value;
        var numberOfKeys = currentValue.length;

        var STRUCT_START = '(';
        var STRUCT_END = ')';

        if (utils.drawFullView(numberOfKeys, settings)) {
            resultString += STRUCT_START + utils.INDENT(settings, level);
            resultString += mapFragment(currentValue, settings, level);
            resultString += utils.INDENT(settings, level - 1) + STRUCT_END;
        } else if (utils.drawCompactView(numberOfKeys, settings)) {
            resultString += STRUCT_START;
            resultString += mapFragment(currentValue, settings, level - 1);
            resultString += STRUCT_END;
        } else {
            resultString += STRUCT_START + STRUCT_END;
        }
        return resultString;
    }

    return yqlStruct;
};
