module.exports = function (/*_format*/) {
    const utils = require('../utils/format');

    function string(node, settings /*, level*/) {
        if (node.$binary) {
            // Binary strings are presented as hex (binary strings are those that cannot be decoded)
            if (settings.binaryAsHex) {
                return utils.escapeYQLBinaryString(settings, node.$value);
            }

            const decodedValue = atob(node.$value);
            return settings.asHTML ? utils.escape(decodedValue) : decodedValue;
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
