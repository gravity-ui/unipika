import type {PluginFactory, PluginNode, PluginSettings} from './types';

export const int64PluginFactory: PluginFactory = function (/*_format*/) {
    function int64(node: PluginNode, settings: PluginSettings /*, level*/) {
        let value = node.$value;
        if (typeof settings.customNumberFormatter === 'function') {
            value = settings.customNumberFormatter(node.$value, node.$type);
        }
        return value;
    }

    int64.isScalar = true;

    return int64;
};
