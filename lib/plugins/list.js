module.exports = function (_format) {
    const utils = require('../utils/format');
    const listFragment = require('../utils/list-fragment')(_format);

    function list(node, settings, level) {
        let resultString = '';
        const currentValue = node.$value;
        const listLength = currentValue.length;

        if (utils.drawFullView(listLength, settings)) {
            resultString += utils.ARRAY_START + utils.getIndent(settings, level);
            resultString += listFragment(currentValue, settings, level);
            resultString += utils.getIndent(settings, level - 1) + utils.ARRAY_END;
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
