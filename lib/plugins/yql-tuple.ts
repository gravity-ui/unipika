import * as utils from '../utils/format';
import {listFragmentFactory} from '../utils/list-fragment';

import type {PluginFactory, PluginNode, PluginSettings} from './types';

export const yqlTuplePluginFactory: PluginFactory = function (_format) {
    const listFragment = listFragmentFactory(_format);

    const TUPLE_START = '(';
    const TUPLE_END = ')';

    function yqlTuple(node: PluginNode, settings: PluginSettings, level: number): string {
        let resultString = '';
        const currentValue = node.$value as Array<unknown>;
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
