module.exports = function (_format) {
    const utils = require('../utils/format');
    const listFragment = require('../utils/list-fragment')(_format);

    const TUPLE_START = '(';
    const TUPLE_END = ')';

    function yqlTuple(node, settings, level) {
        let resultString = '';
        const currentValue = node.$value;
        const listLength = currentValue.length;

        if (utils.drawFullView(listLength, settings)) {
            resultString += TUPLE_START + utils.getIndent(settings, level);
            resultString += listFragment(currentValue, settings, level);
            resultString += utils.getIndent(settings, level - 1) + TUPLE_END;
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
