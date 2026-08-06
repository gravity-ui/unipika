import type {PluginFactory, PluginNode, PluginSettings} from './types';

export const uint64PluginFactory: PluginFactory = function (/*_format*/) {
    function uint64(node: PluginNode, settings: PluginSettings /*, level*/) {
        const value = node.$value;
        if (typeof settings.customNumberFormatter === 'function') {
            return String(settings.customNumberFormatter(node.$value, node.$type));
        }
        return settings.format === 'yson' ? value + 'u' : value;
    }

    uint64.isScalar = true;

    return uint64;
};
