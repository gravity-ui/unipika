module.exports = function (/*_format*/) {
    const TIMESTAMP_MULTIPLIER = 24 * 60 * 60 * 1000; // number of milliseconds in a day

    const MIN_DAYS = -53_375_809; // соответствует дате -144169-01-01
    const MAX_DAYS = 53_375_807; // соответствует дате 148107-12-31

    const INVALID_MOCK = 'Invalid date';

    function isLeapYear(year) {
        // что бы узнать является ли отрицательный год високосным - к нем нужно прибавить 1,
        // а затем применить остальные признаки високосности - Особенность Григорианского календаря
        const y = year < 0 ? year + 1 : year;
        return y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
    }

    function getDaysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    function getDaysInMonth(year, month) {
        const monthDays = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        return monthDays[month - 1];
    }

    function dateBeforeOurEra(daysSinceUnixEpoch) {
        const daysSinceUnixEpochOfStartEra =
            new Date('0001-01-01').getTime() / TIMESTAMP_MULTIPLIER - 1;

        // интервал в днях межу отрицательной датой и датой начала света
        let daysInterval = Math.abs(daysSinceUnixEpoch - daysSinceUnixEpochOfStartEra);

        // По Григорианскому календарю перед 01-01-01 идет -01-12-31
        let currentYear = -1,
            currentMonth = 12,
            currentDay = 31;

        let daysInYear = getDaysInYear(currentYear);
        while (daysInterval >= daysInYear) {
            daysInterval -= daysInYear;
            currentYear -= 1;
            daysInYear = getDaysInYear(currentYear);
        }

        let daysInMonth = getDaysInMonth(currentYear, currentMonth);
        while (daysInterval >= daysInMonth) {
            daysInterval -= daysInMonth;
            currentMonth -= 1;
            daysInMonth = getDaysInMonth(currentYear, currentMonth);
        }

        currentDay = getDaysInMonth(currentYear, currentMonth);

        currentDay -= daysInterval;

        const monthString = `${currentMonth}`.padStart(2, '0');
        const dayString = `${currentDay}`.padStart(2, '0');

        return `${currentYear}-${monthString}-${dayString}`;
    }

    function dateConverter(node /*, settings, level*/) {
        const daysSinceUnixEpoch = Number(node.$value);

        if (daysSinceUnixEpoch < MIN_DAYS || daysSinceUnixEpoch > MAX_DAYS) return INVALID_MOCK;

        const milliseconds = daysSinceUnixEpoch * TIMESTAMP_MULTIPLIER;

        const date = new Date(milliseconds);

        if (isNaN(date.valueOf())) return INVALID_MOCK;

        const year = date.getUTCFullYear();

        if (year <= 0) return dateBeforeOurEra(daysSinceUnixEpoch);

        const dateISO = date.toISOString();

        return dateISO.replace(/[+]?(\d+)/, year).split('T')[0];
    }

    dateConverter.isScalar = true;

    return dateConverter;
};
