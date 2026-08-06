import type {PluginFactory, PluginNode} from './types';

export const yqlTzdate: PluginFactory = function (/*_format*/) {
    function tzdate(node: PluginNode /*, settings, level*/) {
        return node.$value;
    }

    tzdate.isScalar = true;

    return tzdate;
};
