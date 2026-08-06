import type {PluginFactory, PluginNode} from './types';
import {yqlDatePluginFactory} from './yql-date';

export const yqlTimestampPluginFactory: PluginFactory = function (/*_format*/) {
    const dateConverter = yqlDatePluginFactory((_node, _settings, _level) => '');

    const INVALID_MOCK = 'Invalid timestamp';

    const isValid = (datetime: string): boolean => {
        return /^[+-]?\d+-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{6}Z$/.test(datetime);
    };

    function padMicroseconds(microseconds = BigInt(0)): string {
        return `${microseconds}`.padStart(3, '0');
    }

    function getTimePart(microsedonds = BigInt(0)): string {
        let microsecondsReminder = microsedonds % 1000n;
        const milliseconds = microsedonds / 1000n;
        const dateTime = new Date(Number(milliseconds));

        if (microsecondsReminder < 0) {
            microsecondsReminder = microsecondsReminder + 1000n;
            const millis = dateTime.getMilliseconds();
            dateTime.setMilliseconds(millis - 1);
        }

        const dateTimeISO = dateTime
            .toISOString()
            .replace('Z', padMicroseconds(microsecondsReminder) + 'Z');

        return dateTimeISO.split('T')[1];
    }

    const getSeconds = (microseconds = BigInt(0)): number => {
        const MICROSECONDS_IN_SECOND = 1_000_000n;

        if (microseconds === 0n) return 0;

        let seconds = microseconds / MICROSECONDS_IN_SECOND;

        const remainsMicroseconds = microseconds % MICROSECONDS_IN_SECOND;

        if (remainsMicroseconds !== 0n && microseconds < 0n) {
            seconds -= 1n;
        }

        return Number(seconds);
    };

    function timestamp(node: PluginNode /*, settings, level*/): string {
        try {
            const SECONDS_IN_DAY = 86_400;

            const microseconds = BigInt(node.$value as string);

            const seconds = getSeconds(microseconds);

            const days = Math.floor(seconds / SECONDS_IN_DAY);

            const date = dateConverter({$type: 'yql.date', $value: days}, {}, 0);

            const timestampISO = `${(date as string).split('T')[0]}T${getTimePart(microseconds)}`;

            return isValid(timestampISO) ? timestampISO : INVALID_MOCK;
        } catch (e) {
            return INVALID_MOCK;
        }
    }

    timestamp.isScalar = true;

    return timestamp;
}
