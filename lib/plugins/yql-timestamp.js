module.exports = function (/*_format*/) {
    const dateConverter = require('./yql-date');

    const isValid = (datetime) => {
        return /^[+-]?\d+-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{6}Z$/.test(datetime);
    };

    function padMicroseconds(microseconds = Number()) {
        return `${microseconds}`.padStart(3, '0');
    }

    function getTimePart(microsedonds = BigInt()) {
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

    function timestamp(node /*, settings, level*/) {
        try {
            // debugger;
            const MICROSECONDS_IN_SECOND = 1_000_000n;
            const SECONDS_IN_DAY = 86_400;

            const microseconds = BigInt(node.$value);

            const seconds = String(node.$value).slice(0, -6);

            console.log('seconds :>> ', seconds);

            const days = Math.floor(Number(seconds) / SECONDS_IN_DAY);

            // console.log('days :>> ', days);

            // const seconds = Math.floor(Number(microseconds / MICROSECONDS_IN_SECOND));

            // const days = Math.floor(seconds / SECONDS_IN_DAY);

            const date = dateConverter()({$value: days});

            const timestampISO = `${date.split('T')[0]}T${getTimePart(microseconds)}`;

            return isValid(timestampISO) ? timestampISO : 'Invalid timestamp';
        } catch (e) {
            return 'Invalid timestamp';
        }
    }

    timestamp.isScalar = true;

    return timestamp;
};
