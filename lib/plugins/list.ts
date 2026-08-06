import * as utils from '../utils/format';
import {listFragmentFactory} from '../utils/list-fragment';

import type {PluginFactory, PluginNode, PluginSettings} from './types';

export const list: PluginFactory = function (_format) {
    const listFragment = listFragmentFactory(_format);

    function list(node: PluginNode, settings: PluginSettings, level: number): string {
        let resultString = '';
        const currentValue = node.$value as Array<unknown>;
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
