module.exports = function (/*_format*/) {
    var utils = require('../utils/format');

    var chunkConfigs = [
        { length: 4, reverse: true },
        { length: 2, reverse: true },
        { length: 2, reverse: true },
        { length: 2, reverse: false },
        { length: 6, reverse: false }
    ];

    function uuid(node/*, settings, level*/) {
        var position = 0;
        var chunks = [];
        var value = node.$binary ? atob(node.$value) : node.$value;

        chunkConfigs
            .forEach(function (config) {
                var chunk =value
                    .substr(position, config.length)
                    .split(utils.EMPTY_STRING)
                    .map(function (char) {
                        return utils.toPaddedHex(char.charCodeAt(0), 2)
                    });

                position += config.length;
                if (config.reverse) {
                    chunk.reverse();
                }
                chunks.push(chunk.join(utils.EMPTY_STRING));
            });

        return chunks.join('-');
    }

    uuid.isScalar = true;

    return uuid;
};
