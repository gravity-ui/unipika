module.exports = function (_format) {
    var utils = require('../utils/format');
    var listFragment = require('../utils/list-fragment')(_format);

    var TUPLE_START = '(';
    var TUPLE_END = ')';

    function yqlTuple(node, settings, level) {
        var resultString = '';
        var currentValue = node.$value;
        var listLength = currentValue.length;

        if (utils.drawFullView(listLength, settings)) {
            resultString += TUPLE_START + utils.INDENT(settings, level);
            resultString += listFragment(currentValue, settings, level);
            resultString += utils.INDENT(settings, level - 1) + TUPLE_END;
        } else if (utils.drawCompactView(listLength, settings)) {
            resultString += TUPLE_START;
            resultString += listFragment(currentValue, settings, level);
            resultString += TUPLE_END;
        } else {
            resultString += TUPLE_START + TUPLE_END;
        }

        return resultString;
    }

    return yqlTuple;
};
