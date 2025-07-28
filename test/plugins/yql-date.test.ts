import {describe, expect, test} from '@jest/globals';

const unipika = require('../..')();
const date = require('../../lib/plugins/yql-date');
const datetime = require('../../lib/plugins/yql-datetime');
const timestamp = require('../../lib/plugins/yql-timestamp');

describe('plugins', function () {
    describe('yql-date', function () {
        const _format = unipika.format;

        test('Date', function () {
            expect(
                _format(
                    {
                        $type: 'yql.date',
                        $value: '10957',
                    },
                    {
                        asHTML: false,
                    },
                ),
            ).toBe('2000-01-01');
        });

        test('Datetime', function () {
            expect(
                _format(
                    {
                        $type: 'yql.datetime',
                        $value: '946688523',
                    },
                    {
                        asHTML: false,
                    },
                ),
            ).toBe('2000-01-01T01:02:03Z');
        });

        test('Timestamp', function () {
            expect(
                _format(
                    {
                        $type: 'yql.timestamp',
                        $value: '946688523432001',
                    },
                    {
                        asHTML: false,
                    },
                ),
            ).toBe('2000-01-01T01:02:03.432001Z');
        });

        test('Interval multiples', function () {
            expect(
                _format(
                    {
                        $type: 'yql.interval',
                        $value: '1506703188146832',
                    },
                    {
                        asHTML: false,
                    },
                ),
            ).toBe(
                '17438\u00a0days 16\u00a0hours 39\u00a0minutes 48\u00a0seconds 146832\u00a0microseconds',
            );
        });

        test('Interval singles', function () {
            expect(
                _format(
                    {
                        $type: 'yql.interval',
                        $value: '90061000001',
                    },
                    {
                        asHTML: false,
                    },
                ),
            ).toBe('1\u00a0day 1\u00a0hour 1\u00a0minute 1\u00a0second 1\u00a0microsecond');
        });

        test('Interval negative', function () {
            expect(
                _format(
                    {
                        $type: 'yql.interval',
                        $value: '-90000000001',
                    },
                    {
                        asHTML: false,
                    },
                ),
            ).toBe('-1\u00a0day 1\u00a0hour 1\u00a0microsecond');
        });

        test('Interval zero', function () {
            expect(
                _format(
                    {
                        $type: 'yql.interval',
                        $value: '0',
                    },
                    {
                        asHTML: false,
                    },
                ),
            ).toBe('0');
        });

        test('Invalid date', function () {
            expect(
                _format(
                    {
                        $type: 'yql.date',
                        $value: '1e30',
                    },
                    {
                        asHTML: false,
                    },
                ),
            ).toBe('Invalid date');
        });

        test('Invalid datetime', function () {
            expect(
                _format(
                    {
                        $type: 'yql.datetime',
                        $value: '1e30',
                    },
                    {
                        asHTML: false,
                    },
                ),
            ).toBe('Invalid datetime');
        });

        expect(date()({$value: '-719469'})).toBe('-1-02-29');

        expect(date()({$value: '53375443'})).toBe('148107-01-01');

        expect(date()({$value: '-53375750'})).toBe('-144169-02-29');

        expect(datetime()({$value: '-62162035201'})).toBe('-1-02-29T23:59:59Z');

        expect(datetime()({$value: '-62130499201'})).toBe('1-02-28T23:59:59Z');

        expect(timestamp()({$value: '-62162035199876877'})).toBe('-1-03-01T00:00:00.123123Z');

        expect(timestamp()({$value: '-4611664800000000000'})).toBe(
            '-144169-02-29T00:00:00.000000Z',
        );

        expect(timestamp()({$value: '-4611664799999999999'})).toBe(
            '-144169-02-29T00:00:00.000001Z',
        );

        expect(timestamp()({$value: '-4611640953599876877'})).toBe(
            '-144169-12-01T00:00:00.123123Z',
        );

        expect(timestamp()({$value: '-4611664799940999999'})).toBe(
            '-144169-02-29T00:00:59.000001Z',
        );

        expect(timestamp()({$value: '-4611664796400999999'})).toBe(
            '-144169-02-29T00:59:59.000001Z',
        );

        expect(timestamp()({$value: '-62135683199999999'})).toBe('-1-12-31T00:00:00.000001Z');

        expect(timestamp()({$value: '-62104147199999999'})).toBe('1-12-31T00:00:00.000001Z');

        expect(timestamp()({$value: '-62135683196999999'})).toBe('-1-12-31T00:00:03.000001Z');

        expect(timestamp()({$value: '-61784945687999979'})).toBe('12-02-11T11:05:12.000021Z'); //

        expect(timestamp()({$value: '4611669811199999999'})).toBe('148107-12-31T23:59:59.999999Z');

        test('Invalid timestamp', function () {
            expect(
                _format(
                    {
                        $type: 'yql.timestamp',
                        $value: '1e30',
                    },
                    {
                        asHTML: false,
                    },
                ),
            ).toBe('Invalid timestamp');
        });
    });
});
