module.exports = function (_format) {

    var utils = require('../utils/format');
    var listFragment = require('../utils/list-fragment')(_format);

    var SET_START = '{';
    var SET_END = '}';

    function yqlSet(node, settings, level) {
        var resultString = '';
        var currentValue = node.$value;
        var listLength = currentValue.length;

        if (utils.drawFullView(listLength, settings)) {
            resultString += SET_START + utils.INDENT(settings, level);
            resultString += listFragment(currentValue, settings, level);
            resultString += utils.INDENT(settings, level - 1) + SET_END;
        } else if (utils.drawCompactView(listLength, settings)) {
            resultString += SET_START;
            resultString += listFragment(currentValue, settings, level);
            resultString += SET_END;
        } else {
            resultString += SET_START + SET_END;
        }

        return resultString;
    }

    yqlSet.isScalar = true;

    return yqlSet;
};
