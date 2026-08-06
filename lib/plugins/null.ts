import type {PluginFactory, PluginNode, PluginSettings} from './types';

export const nullPlugin: PluginFactory = function (/*_format*/) {
    function entity(node: PluginNode, settings: PluginSettings /*, level*/) {
        return settings.format === 'yson' ? '#' : node.$value;
    }

    entity.isScalar = true;

    return entity;
};
