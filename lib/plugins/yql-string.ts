import * as utils from '../utils/format';

import type {PluginFactory, PluginNode, PluginSettings} from './types';

export const yqlString: PluginFactory = function (/*_format*/) {
    function string(node: PluginNode, settings: PluginSettings /*, level*/): string {
        if (node.$binary) {
            // Binary strings are presented as hex (binary strings are those that cannot be decoded)
            return settings.binaryAsHex
                ? utils.escapeYQLBinaryString(settings, String(node.$value))
                : atob(String(node.$value));
        }

        if (settings.escapeYQLStrings) {
            return utils.escapeJSONString(settings, String(node.$value));
        } else {
            return utils.escapeHTMLString(settings, String(node.$value));
        }
    }

    string.isScalar = true;

    return string;
};
