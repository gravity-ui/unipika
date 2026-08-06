import * as utils from './format';
import type {FormatSettings} from './format';

type FormatFunction = (node: unknown, settings: FormatSettings, level: number) => string;

export function listFragmentFactory(_format: FormatFunction) {
    function listFragment(value: Array<unknown>, settings: FormatSettings, level: number): string {
        const limitListLength = settings.limitListLength ?? 0;
        const isListOutOfLimit = limitListLength > 0 && value.length > limitListLength;
        const nodes = isListOutOfLimit ? value.slice(0, limitListLength - 1) : value;
        return nodes
            .map(function (currentNode) {
                return _format(currentNode, settings, level + 1);
            })
            .concat(
                isListOutOfLimit
                    ? ['... ' + (value.length - limitListLength + 1) + ' hidden items']
                    : [],
            )
            .join(utils.getExpressionTerminator(settings) + utils.getIndent(settings, level));
    }

    return listFragment;
}
