import * as utils from '../utils/format';
import {mapFragmentFactory} from '../utils/map-fragment';

import type {PluginFactory, PluginNode, PluginSettings} from './types';

export const yqlStructPluginFactory: PluginFactory = function (_format) {
    const mapFragment = mapFragmentFactory(_format);

    function yqlStruct(node: PluginNode, settings: PluginSettings, level: number): string {
        let resultString = '';
        const currentValue = node.$value as Array<[PluginNode, unknown]>;
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
