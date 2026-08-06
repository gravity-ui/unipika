import type {PluginFactory, PluginNode} from './types';

export const yqlPg: PluginFactory = function (/*_format*/) {
    function pg(node: PluginNode /*, settings, level*/): string {
        return String(node.$value);
    }

    pg.isScalar = true;

    return pg;
};
