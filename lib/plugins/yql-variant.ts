import {mapFragmentFactory} from '../utils/map-fragment';

import type {PluginFactory, PluginNode, PluginSettings} from './types';

export const yqlVariant: PluginFactory = function (_format) {
    const mapFragment = mapFragmentFactory(_format);

    function yqlVariant(node: PluginNode, settings: PluginSettings, level: number): string {
        const currentValue = node.$value as Array<[PluginNode, unknown]>;

        return mapFragment(currentValue, settings, level - 1);
    }

    return yqlVariant;
};
