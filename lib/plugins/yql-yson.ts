import {convert as ysonConverter} from '../converters/yson-to-unipika';
import * as utils from '../utils/format';

import type {FormatFunction, PluginFactory, PluginNode, PluginSettings} from './types';

export const yqlYson: PluginFactory = function (_format: FormatFunction) {
    function yqlYson(node: PluginNode, settings: PluginSettings, level: number): string {
        settings = JSON.parse(JSON.stringify(settings));
        settings.format = utils.YSON;
        return _format(ysonConverter(node.$value, settings), settings, level);
    }

    return yqlYson;
};
