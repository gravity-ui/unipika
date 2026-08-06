import type {PluginFactory, PluginNode} from './types';

export const yqlEnumPluginFactory: PluginFactory = function (/*_format*/) {
    function yqlEnum(node: PluginNode /*, _settings, _level*/) {
        return node.$value;
    }

    yqlEnum.isScalar = true;

    return yqlEnum;
};
