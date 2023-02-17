module.exports = function (_format) {
    var utils = require('../utils/format');
    var listFragment = require('../utils/list-fragment')(_format);

    function list(node, settings, level) {
        var resultString = '';
        var currentValue = node.$value;
        var listLength = currentValue.length;

        if (utils.drawFullView(listLength, settings)) {
            resultString += utils.ARRAY_START + utils.INDENT(settings, level);
            resultString += listFragment(currentValue, settings, level);
            resultString += utils.INDENT(settings, level - 1) + utils.ARRAY_END;
        } else if (utils.drawCompactView(listLength, settings)) {
            resultString += utils.ARRAY_START;
            resultString += listFragment(currentValue, settings, level - 1);
            resultString += utils.ARRAY_END;
        } else {
            resultString += utils.ARRAY_START + utils.ARRAY_END;
        }

        return resultString;
    }

    return list;
};
