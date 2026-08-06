import type {PluginFactory, PluginNode} from './types';

export const yqlTzdatetime: PluginFactory = function (/*_format*/) {
    function tzdatetime(node: PluginNode /*, settings, level*/) {
        return node.$value;
    }

    tzdatetime.isScalar = true;

    return tzdatetime;
};
