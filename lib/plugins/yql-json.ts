import {convert as jsonConverter} from '../converters/raw-to-unipika';
import * as utils from '../utils/format';

import type {FormatFunction, PluginFactory, PluginNode, PluginSettings} from './types';

export const yqlJson: PluginFactory = function (_format: FormatFunction) {
    function yqlJson(node: PluginNode, settings: PluginSettings, level: number): string {
        settings = Object.assign({}, settings, {
            format: utils.JSON,
            showDecoded: false,
            compact: false,
            escapeWhitespace: true,
        });
        let value = node.$value;
        try {
            value = JSON.parse(String(node.$value));
        } catch (e) {
            console.error('Invalid JSON string', node.$value);
        }
        return _format(jsonConverter(value, settings), settings, level);
    }

    return yqlJson;
};
