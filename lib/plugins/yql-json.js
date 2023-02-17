module.exports = function (_format) {
    var utils = require('../utils/format');
    var jsonConverter = require('../converters/raw-to-unipika');

    function yqlJson(node, settings, level) {
        settings = Object.assign({}, settings, {
            format: utils.JSON,
            showDecoded: false,
            compact: false,
            escapeWhitespace: true
        });
        var value = node.$value;
        try {
            value = JSON.parse(node.$value);
        } catch (e) {
            console.error('Invalid JSON string', node.$value);
        }
        return _format(
            jsonConverter(value, settings),
            settings,
            level
        );
    }

    return yqlJson;
};
