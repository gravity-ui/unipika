import {convert as ysonConverter} from '../converters/yson-to-unipika';
import * as utils from '../utils/format';

export function yqlYsonPluginFactory(_format) {
    function yqlYson(node, settings, level) {
        settings = JSON.parse(JSON.stringify(settings));
        settings.format = utils.YSON;
        return _format(ysonConverter(node.$value, settings), settings, level);
    }

    return yqlYson;
}
