module.exports = function (/*_format*/) {
    const utils = require('../utils/format');

    const chunkConfigs = [
        {length: 4, reverse: true},
        {length: 2, reverse: true},
        {length: 2, reverse: true},
        {length: 2, reverse: false},
        {length: 6, reverse: false},
    ];

    function uuid(node /*, settings, level*/) {
        let position = 0;
        const chunks = [];
        const value = node.$binary ? atob(node.$value) : node.$value;

        chunkConfigs.forEach(function (config) {
            const chunk = value
                .substr(position, config.length)
                .split(utils.EMPTY_STRING)
                .map(function (char) {
                    return utils.toPaddedHex(char.charCodeAt(0), 2);
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
