import type {PluginFactory, PluginNode} from './types';

export const yqlTzdatePluginFactory: PluginFactory = function (/*_format*/) {
    function tzdate(node: PluginNode /*, settings, level*/) {
        return node.$value;
    }

    tzdate.isScalar = true;

    return tzdate;
};
