import type {PluginFactory, PluginNode} from './types';
import {yqlDatePluginFactory} from './yql-date';

export const yqlDatetimePluginFactory: PluginFactory = function (/*_format*/) {
    const dateConverter = yqlDatePluginFactory((_node, _settings, _level) => '');

    const INVALID_MOCK = 'Invalid datetime';

    const TIMESTAMP_MULTIPLIER = 1000;
    const SECONDS_IN_DAY = 86_400;

    function isValidDate(date: string): boolean {
        return /^[+-]?\d+-\d{2}-\d{2}$/.test(date);
    }

    function datetimeConverter(node: PluginNode /*, settings, level*/): string {
        const seconds = Number(node.$value);

        const milliseconds = seconds * TIMESTAMP_MULTIPLIER;
        const days = Math.floor(seconds / SECONDS_IN_DAY);

        const dateTime = new Date(milliseconds);

        if (isNaN(dateTime.valueOf())) {
            return INVALID_MOCK;
        }

        const dateTimeISO = dateTime.toISOString();

        const timeISO = `T${dateTimeISO.split('T')[1].replace('.000Z', 'Z')}`;

        const date = dateConverter({$type: 'yql.date', $value: days}, {}, 0);

        if (!isValidDate(date as string)) return INVALID_MOCK;

        return `${date}${timeISO}`;
    }

    datetimeConverter.isScalar = true;

    return datetimeConverter;
}
