import type {PluginFactory, PluginNode} from './types';

export const yqlTztimestamp: PluginFactory = function (/*_format*/) {
    function tztimestamp(node: PluginNode /*, settings, level*/) {
        return node.$value;
    }

    tztimestamp.isScalar = true;

    return tztimestamp;
};
