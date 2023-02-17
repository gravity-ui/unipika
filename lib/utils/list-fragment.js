module.exports = function (_format) {
    var utils = require('./format');

    function listFragment(value, settings, level) {
        var isListOutOfLimit = settings.limitListLength > 0 && value.length > settings.limitListLength;
        var nodes = isListOutOfLimit ? value.slice(0, settings.limitListLength - 1) : value
        return nodes
            .map(function (currentNode) {
                return _format(currentNode, settings, level + 1);
            })
            .concat(isListOutOfLimit ? ['... ' + (value.length - settings.limitListLength + 1) + ' hidden items'] : [])
            .join(utils.EXPRESSION_TERMINATOR(settings) + utils.INDENT(settings, level));
    }

    return listFragment;
};
