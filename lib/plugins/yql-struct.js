module.exports = function (_format) {
    const utils = require('../utils/format');
    const mapFragment = require('../utils/map-fragment')(_format);

    function yqlStruct(node, settings, level) {
        let resultString = '';
        const currentValue = node.$value;
        const numberOfKeys = currentValue.length;

        const STRUCT_START = '(';
        const STRUCT_END = ')';

        if (utils.drawFullView(numberOfKeys, settings)) {
            resultString += STRUCT_START + utils.getIndent(settings, level);
            resultString += mapFragment(currentValue, settings, level);
            resultString += utils.getIndent(settings, level - 1) + STRUCT_END;
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
