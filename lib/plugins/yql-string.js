module.exports = function (/*_format*/) {
    const utils = require('../utils/format');

    function string(node, settings /*, level*/) {
        if (node.$binary) {
            // Binary strings are presented as hex (binary strings are those that cannot be decoded)
            return settings.binaryAsHex
                ? utils.escapeYQLBinaryString(settings, node.$value)
                : atob(node.$value);
        }

        if (settings.escapeYQLStrings) {
            return utils.escapeJSONString(settings, node.$value);
        } else {
            return utils.escapeHTMLString(settings, node.$value);
        }
    }

    string.isScalar = true;

    return string;
};
