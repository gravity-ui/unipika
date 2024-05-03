module.exports = function (_format) {
    const utils = require('../utils/format');
    const jsonConverter = require('../converters/raw-to-unipika');

    function yqlJson(node, settings, level) {
        settings = Object.assign({}, settings, {
            format: utils.JSON,
            showDecoded: false,
            compact: false,
            escapeWhitespace: true,
        });
        let value = node.$value;
        try {
            value = JSON.parse(node.$value);
        } catch (e) {
            console.error('Invalid JSON string', node.$value);
        }
        return _format(jsonConverter(value, settings), settings, level);
    }

    return yqlJson;
};
