module.exports = function (_format) {
    const utils = require('./format');

    function listFragment(value, settings, level) {
        const isListOutOfLimit =
            settings.limitListLength > 0 && value.length > settings.limitListLength;
        const nodes = isListOutOfLimit ? value.slice(0, settings.limitListLength - 1) : value;
        return nodes
            .map(function (currentNode) {
                return _format(currentNode, settings, level + 1);
            })
            .concat(
                isListOutOfLimit
                    ? ['... ' + (value.length - settings.limitListLength + 1) + ' hidden items']
                    : [],
            )
            .join(utils.getExpressionTerminator(settings) + utils.getIndent(settings, level));
    }

    return listFragment;
};
