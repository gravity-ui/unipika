import type {PluginFactory, PluginNode, PluginSettings} from './types';

export const boolean: PluginFactory = function (/*_format*/) {
    function boolean(node: PluginNode, settings: PluginSettings /*, level*/) {
        return settings.format === 'yson' ? '%' + node.$value : node.$value;
    }

    boolean.isScalar = true;

    return boolean;
};
