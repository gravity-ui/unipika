module.exports = function (_format) {
    var utils = require('../utils/format');
    var ysonConverter = require('../converters/yson-to-unipika');

    function yqlYson(node, settings, level) {
        settings = JSON.parse(JSON.stringify(settings));
        settings.format = utils.YSON;
        return _format(
            ysonConverter(node.$value, settings),
            settings,
            level
        );
    }

    return yqlYson;
};
