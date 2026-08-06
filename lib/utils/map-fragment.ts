import * as utils from './format';
import type {FormatNode, FormatSettings} from './format';

type FormatFunction = (node: unknown, settings: FormatSettings, level: number) => string;

export function mapFragmentFactory(
    _format: FormatFunction,
): (value: Array<[FormatNode, unknown]>, settings: FormatSettings, level: number) => string {
    const SORTABLE_TYPES = {
        string: null,
        'yql.string': null,
    };

    function sortKeys(
        keyValuePairA: [FormatNode, unknown],
        keyValuePairB: [FormatNode, unknown],
    ): number {
        const currentKeyA = keyValuePairA[0];
        const currentKeyB = keyValuePairB[0];

        return Object.prototype.hasOwnProperty.call(SORTABLE_TYPES, currentKeyA.$type) &&
            Object.prototype.hasOwnProperty.call(SORTABLE_TYPES, currentKeyB.$type) &&
            (currentKeyA.$value as string) > (currentKeyB.$value as string)
            ? 1
            : -1;
    }

    function mapFragment(
        value: Array<[FormatNode, unknown]>,
        settings: FormatSettings,
        level: number,
    ): string {
        let keyValues = value.slice().sort(sortKeys);

        const limitMapLength = settings.limitMapLength ?? 0;
        const isMapOutOfLimit = limitMapLength > 0 && value.length > limitMapLength;
        if (isMapOutOfLimit) {
            keyValues = keyValues.slice(0, limitMapLength - 1);
        }

        return keyValues
            .map(function (keyValuePair) {
                let resultString = '';

                resultString += _format(keyValuePair[0], settings, level + 1);
                resultString += utils.getKeyValueSeparator(settings);
                resultString += _format(keyValuePair[1], settings, level + 1);

                return resultString;
            })
            .concat(
                isMapOutOfLimit
                    ? ['... ' + (value.length - limitMapLength + 1) + ' hidden keys']
                    : [],
            )
            .join(utils.getExpressionTerminator(settings) + utils.getIndent(settings, level));
    }

    return mapFragment;
}
