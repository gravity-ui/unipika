module.exports = function (/*_format*/) {
    var utils = require('../utils/format');

    function escapeString(settings, value) {
        return settings.format === 'json' ?
            utils.escapeJSONString(settings, value) :
            utils.escapeYSONString(settings, value);
    }

    function string(node, settings/*, level*/) {
        var value;
        var decodedValue;

        if (node.$key && settings.format === 'yson') {
            value = utils.unescapeKeyValue(node.$value);
            decodedValue = utils.unescapeKeyValue(node.$decoded_value);
        } else {
            value = node.$value;
            decodedValue = node.$decoded_value;
        }

        if (node.$binary) {
            // Binary strings are presented as hex (binary strings are those that cannot be decoded)
            return settings.binaryAsHex ?
                utils.escapeYSONBinaryString(settings, value) :
                escapeString(settings, value);
        } else {

            return settings.showDecoded ?
                utils.escapeJSONString(settings, decodedValue) :
                escapeString(settings, value);
        }
    }

    string.isScalar = true;

    return string;
};
