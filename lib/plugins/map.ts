import * as utils from '../utils/format';
import {mapFragmentFactory} from '../utils/map-fragment';

export function mapPluginFactory(_format) {
    const mapFragment = mapFragmentFactory(_format);

    function map(node, settings, level) {
        let resultString = '';
        const currentValue = node.$value;
        const numberOfKeys = currentValue.length;

        if (utils.drawFullView(numberOfKeys, settings)) {
            resultString += utils.OBJECT_START + utils.getIndent(settings, level);
            resultString += mapFragment(currentValue, settings, level);
            resultString += utils.getIndent(settings, level - 1) + utils.OBJECT_END;
        } else if (utils.drawCompactView(numberOfKeys, settings)) {
            resultString += utils.OBJECT_START;
            resultString += mapFragment(currentValue, settings, level - 1);
            resultString += utils.OBJECT_END;
        } else {
            resultString += utils.OBJECT_START + utils.OBJECT_END;
        }
        return resultString;
    }

    return map;
}
