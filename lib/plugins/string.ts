import * as utils from '../utils/format';

import type {PluginFactory, PluginNode, PluginSettings} from './types';

export const string: PluginFactory = function (/*_format*/) {
    function escapeString(settings: PluginSettings, value: unknown): string {
        return settings.format === 'json'
            ? utils.escapeJSONString(settings, String(value))
            : utils.escapeYSONString(settings, String(value));
    }

    function string(node: PluginNode, settings: PluginSettings /*, level*/): string {
        let value: unknown;
        let decodedValue: unknown;

        if (node.$key && settings.format === 'yson') {
            value = utils.unescapeKeyValue(node.$value);
            decodedValue = utils.unescapeKeyValue(node.$decoded_value);
        } else {
            value = node.$value;
            decodedValue = node.$decoded_value;
        }

        if (node.$binary) {
            // Binary strings are presented as hex (binary strings are those that cannot be decoded)
            return settings.binaryAsHex
                ? utils.escapeYSONBinaryString(settings, String(value))
                : escapeString(settings, value);
        } else {
            return settings.showDecoded
                ? utils.escapeJSONString(settings, String(decodedValue))
                : escapeString(settings, value);
        }
    }

    string.isScalar = true;

    return string;
};
