import * as utils from '../utils/format';

import type {PluginFactory, PluginNode} from './types';

export const yqlIntervalPluginFactory: PluginFactory = function (/*_format*/) {
    const toBigInt = (value: unknown): bigint => {
        if (Number.isNaN(Number(value))) return 0n;
        return BigInt(value as bigint);
    };

    const absBigInt = (value: bigint): bigint => {
        if (value < 0n) return -value;
        return value;
    };

    const PARTS = [
        {
            name: 'microsecond',
            divisor: 1000000n,
        },
        {
            name: 'second',
            divisor: 60n,
        },
        {
            name: 'minute',
            divisor: 60n,
        },
        {
            name: 'hour',
            divisor: 24n,
        },
        {
            name: 'day',
        },
    ];

    function interval(node: PluginNode /*, settings, level*/): string {
        let value = toBigInt(node.$value);

        const sign = value < 0 ? '-' : '';

        value = absBigInt(value);

        if (value === 0n) {
            return '0';
        }

        const stringifiedInterval = PARTS.map(function (item): [bigint, string] {
            let partialValue = value;

            if (item.divisor) {
                partialValue = value % item.divisor;
                value = value / item.divisor;
            } else {
                partialValue = value;
                value = 0n;
            }
            return [partialValue, item.name];
        })
            .reverse()
            .filter(function (item) {
                return item[0] > 0;
            })
            .map(function (item) {
                const partialValue = item[0];
                const suffix = partialValue > 1n ? 's' : '';
                return partialValue + utils.NON_BREAKING_WHITESPACE + item[1] + suffix;
            })
            .join(utils.WHITESPACE);

        return sign + stringifiedInterval;
    }

    interval.isScalar = true;

    return interval;
};
