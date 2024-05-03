module.exports = function (_format) {
    const utils = require('../utils/format');
    const ysonConverter = require('../converters/yson-to-unipika');

    function yqlYson(node, settings, level) {
        settings = JSON.parse(JSON.stringify(settings));
        settings.format = utils.YSON;
        return _format(ysonConverter(node.$value, settings), settings, level);
    }

    return yqlYson;
};
