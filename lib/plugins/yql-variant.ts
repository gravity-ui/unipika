import {mapFragmentFactory} from '../utils/map-fragment';

export function yqlVariantPluginFactory(_format) {
    const mapFragment = mapFragmentFactory(_format);

    function yqlVariant(node, settings, level) {
        const currentValue = node.$value;

        return mapFragment(currentValue, settings, level - 1);
    }

    return yqlVariant;
}
