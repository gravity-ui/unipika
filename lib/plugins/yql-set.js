import * as utils from '../utils/format';
import {listFragmentFactory} from '../utils/list-fragment';

export function yqlSetPluginFactory(_format) {
    const listFragment = listFragmentFactory(_format);

    const SET_START = '{';
    const SET_END = '}';

    function yqlSet(node, settings, level) {
        let resultString = '';
        const currentValue = node.$value;
        const listLength = currentValue.length;

        if (utils.drawFullView(listLength, settings)) {
            resultString += SET_START + utils.getIndent(settings, level);
            resultString += listFragment(currentValue, settings, level);
            resultString += utils.getIndent(settings, level - 1) + SET_END;
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
}
