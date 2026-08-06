import {convert as ysonConverter} from '../converters/yson-to-unipika';
import * as utils from '../utils/format';

import type {PluginFactory, PluginNode, PluginSettings} from './types';

export const yqlYsonPluginFactory: PluginFactory = function (_format) {
    function yqlYson(node: PluginNode, settings: PluginSettings, level: number): string {
        settings = JSON.parse(JSON.stringify(settings));
        settings.format = utils.YSON;
        return _format(ysonConverter(node.$value, settings), settings, level);
    }

    return yqlYson;
};
