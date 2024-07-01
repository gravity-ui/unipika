import {describe, expect, test} from '@jest/globals';

import {toHTMLText, toPlainText} from '../utils';

const unipika = require('../..')();

function stringifyOrEmpty(obj) {
    return obj !== undefined ? ' ' + JSON.stringify(obj) : '';
}

describe('format', function () {
    const _serialize = unipika.formatValue;

    function runTestCases(io, format, settings) {
        io.forEach(function (output, input) {
            test(
                'Gives correct output for: ' + JSON.stringify(input) + stringifyOrEmpty(settings),
                function () {
                    expect(output[format].plain).toBe(
                        toPlainText(_serialize, input, format, settings),
                    );
                    expect(output[format].html).toBe(
                        toHTMLText(_serialize, input, format, settings),
                    );
                },
            );
        });
    }

    describe('formatOptional', function () {
        test('Exports', function () {
            expect(_serialize).toBeDefined();
        });

        test('isFunction', function () {
            expect(_serialize).toBeInstanceOf(Function);
        });

        describe('Test optional type output', function () {
            const io = new Map();

            //null should be displayed with as many square brackets as $optional property equals
            io.set(
                {$type: 'yql.null', $value: null, $optional: 2},
                {
                    json: {
                        plain: '[[null]]',
                        html: '<span class="optional">[[</span><span class="yql_null">null</span><span class="optional">]]</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.null', $value: null, $optional: 1},
                {
                    json: {
                        plain: '[null]',
                        html: '<span class="optional">[</span><span class="yql_null">null</span><span class="optional">]</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.null', $value: null, $optional: 0},
                {
                    json: {
                        plain: null,
                        html: '<span class="yql_null">null</span>',
                    },
                },
            );
            //non-null values should de displayed without square brackets
            io.set(
                {$type: 'yql.int32', $value: 5, $optional: 2},
                {
                    json: {
                        plain: 5,
                        html: '<span class="yql_int32">5</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.int32', $value: 5, $optional: 0},
                {
                    json: {
                        plain: 5,
                        html: '<span class="yql_int32">5</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.int8', $value: 5, $optional: 2},
                {
                    json: {
                        plain: 5,
                        html: '<span class="yql_int8">5</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.int8', $value: 5, $optional: 0},
                {
                    json: {
                        plain: 5,
                        html: '<span class="yql_int8">5</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.int16', $value: 5, $optional: 2},
                {
                    json: {
                        plain: 5,
                        html: '<span class="yql_int16">5</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.int16', $value: 5, $optional: 0},
                {
                    json: {
                        plain: 5,
                        html: '<span class="yql_int16">5</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.int64', $value: 5, $optional: 2},
                {
                    json: {
                        plain: 5,
                        html: '<span class="yql_int64">5</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.int64', $value: 5, $optional: 0},
                {
                    json: {
                        plain: 5,
                        html: '<span class="yql_int64">5</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.uint32', $value: 5, $optional: 2},
                {
                    json: {
                        plain: 5,
                        html: '<span class="yql_uint32">5</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.uint32', $value: 5, $optional: 0},
                {
                    json: {
                        plain: 5,
                        html: '<span class="yql_uint32">5</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.uint8', $value: 5, $optional: 2},
                {
                    json: {
                        plain: 5,
                        html: '<span class="yql_uint8">5</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.uint8', $value: 5, $optional: 0},
                {
                    json: {
                        plain: 5,
                        html: '<span class="yql_uint8">5</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.uint16', $value: 5, $optional: 2},
                {
                    json: {
                        plain: 5,
                        html: '<span class="yql_uint16">5</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.uint16', $value: 5, $optional: 0},
                {
                    json: {
                        plain: 5,
                        html: '<span class="yql_uint16">5</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.uint64', $value: 5, $optional: 2},
                {
                    json: {
                        plain: 5,
                        html: '<span class="yql_uint64">5</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.uint64', $value: 5, $optional: 0},
                {
                    json: {
                        plain: 5,
                        html: '<span class="yql_uint64">5</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.double', $value: 5, $optional: 2},
                {
                    json: {
                        plain: 5,
                        html: '<span class="yql_double">5</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.double', $value: 5, $optional: 0},
                {
                    json: {
                        plain: 5,
                        html: '<span class="yql_double">5</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.float', $value: 5, $optional: 2},
                {
                    json: {
                        plain: 5,
                        html: '<span class="yql_float">5</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.float', $value: 5, $optional: 0},
                {
                    json: {
                        plain: 5,
                        html: '<span class="yql_float">5</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.decimal', $value: 5, $optional: 2},
                {
                    json: {
                        plain: 5,
                        html: '<span class="yql_decimal">5</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.decimal', $value: 5, $optional: 0},
                {
                    json: {
                        plain: 5,
                        html: '<span class="yql_decimal">5</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.bool', $value: true, $optional: 2},
                {
                    json: {
                        plain: true,
                        html: '<span class="yql_bool">true</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.bool', $value: true, $optional: 0},
                {
                    json: {
                        plain: true,
                        html: '<span class="yql_bool">true</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.enum', $value: 1, $optional: 2},
                {
                    json: {
                        plain: 1,
                        html: '<span class="yql_enum">1</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.enum', $value: 1, $optional: 0},
                {
                    json: {
                        plain: 1,
                        html: '<span class="yql_enum">1</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.tztimestamp', $value: 1, $optional: 2},
                {
                    json: {
                        plain: 1,
                        html: '<span class="yql_tztimestamp">1</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.tztimestamp', $value: 1, $optional: 0},
                {
                    json: {
                        plain: 1,
                        html: '<span class="yql_tztimestamp">1</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.tztimestamp64', $value: 1, $optional: 2},
                {
                    json: {
                        plain: 1,
                        html: '<span class="yql_tztimestamp64">1</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.tztimestamp64', $value: 1, $optional: 0},
                {
                    json: {
                        plain: 1,
                        html: '<span class="yql_tztimestamp64">1</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.date', $value: 15000, $optional: 2},
                {
                    json: {
                        plain: '2011-01-26',
                        html: '<span class="yql_date">2011-01-26</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.date', $value: 15000, $optional: 0},
                {
                    json: {
                        plain: '2011-01-26',
                        html: '<span class="yql_date">2011-01-26</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.date32', $value: 53375807, $optional: 2},
                {
                    json: {
                        plain: '+148107-12-31',
                        html: '<span class="yql_date32">+148107-12-31</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.date32', $value: 53375807, $optional: 0},
                {
                    json: {
                        plain: '+148107-12-31',
                        html: '<span class="yql_date32">+148107-12-31</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.datetime', $value: 1714767545, $optional: 2},
                {
                    json: {
                        plain: '2024-05-03T20:19:05Z',
                        html: '<span class="yql_datetime">2024-05-03T20:19:05Z</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.datetime', $value: 1714767545, $optional: 0},
                {
                    json: {
                        plain: '2024-05-03T20:19:05Z',
                        html: '<span class="yql_datetime">2024-05-03T20:19:05Z</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.datetime64', $value: 4611669811199, $optional: 2},
                {
                    json: {
                        plain: '+148107-12-31T23:59:59Z',
                        html: '<span class="yql_datetime64">+148107-12-31T23:59:59Z</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.datetime64', $value: 4611669811199, $optional: 0},
                {
                    json: {
                        plain: '+148107-12-31T23:59:59Z',
                        html: '<span class="yql_datetime64">+148107-12-31T23:59:59Z</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.timestamp', $value: 1714767545000000, $optional: 2},
                {
                    json: {
                        plain: '2024-05-03T20:19:05.000000Z',
                        html: '<span class="yql_timestamp">2024-05-03T20:19:05.000000Z</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.timestamp', $value: 1714767545000000, $optional: 0},
                {
                    json: {
                        plain: '2024-05-03T20:19:05.000000Z',
                        html: '<span class="yql_timestamp">2024-05-03T20:19:05.000000Z</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.timestamp64', $value: '4611669811199999999', $optional: 2},
                {
                    json: {
                        plain: '+148107-12-31T23:59:59.999999Z',
                        html: '<span class="yql_timestamp64">+148107-12-31T23:59:59.999999Z</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.timestamp64', $value: '4611669811199999999', $optional: 0},
                {
                    json: {
                        plain: '+148107-12-31T23:59:59.999999Z',
                        html: '<span class="yql_timestamp64">+148107-12-31T23:59:59.999999Z</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.tzdate', $value: 1, $optional: 2},
                {
                    json: {
                        plain: 1,
                        html: '<span class="yql_tzdate">1</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.tzdate', $value: 1, $optional: 0},
                {
                    json: {
                        plain: 1,
                        html: '<span class="yql_tzdate">1</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.tzdate32', $value: 1, $optional: 2},
                {
                    json: {
                        plain: 1,
                        html: '<span class="yql_tzdate32">1</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.tzdate32', $value: 1, $optional: 0},
                {
                    json: {
                        plain: 1,
                        html: '<span class="yql_tzdate32">1</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.tzdatetime', $value: 1, $optional: 2},
                {
                    json: {
                        plain: 1,
                        html: '<span class="yql_tzdatetime">1</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.tzdatetime', $value: 1, $optional: 0},
                {
                    json: {
                        plain: 1,
                        html: '<span class="yql_tzdatetime">1</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.tzdatetime64', $value: 1, $optional: 2},
                {
                    json: {
                        plain: 1,
                        html: '<span class="yql_tzdatetime64">1</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.tzdatetime64', $value: 1, $optional: 0},
                {
                    json: {
                        plain: 1,
                        html: '<span class="yql_tzdatetime64">1</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.uuid', $value: atob('mbzuoAuc+E67bWu5vTgKEQ=='), $optional: 2},
                {
                    json: {
                        plain: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
                        html: '<span class="yql_uuid">a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.uuid', $value: atob('mbzuoAuc+E67bWu5vTgKEQ=='), $optional: 0},
                {
                    json: {
                        plain: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
                        html: '<span class="yql_uuid">a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11</span>',
                    },
                },
            );

            io.set(
                {$type: 'yql.interval', $value: 1, $optional: 2},
                {
                    json: {
                        plain: '1 microsecond',
                        html: '<span class="yql_interval">1 microsecond</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.interval', $value: 1, $optional: 0},
                {
                    json: {
                        plain: '1 microsecond',
                        html: '<span class="yql_interval">1 microsecond</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.interval64', $value: 1123123, $optional: 2},
                {
                    json: {
                        plain: '1 second 123123 microseconds',
                        html: '<span class="yql_interval64">1 second 123123 microseconds</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.interval64', $value: 1123123, $optional: 0},
                {
                    json: {
                        plain: '1 second 123123 microseconds',
                        html: '<span class="yql_interval64">1 second 123123 microseconds</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.string', $value: 'a', $optional: 2},
                {
                    json: {
                        plain: '"a"',
                        html: '<span class="yql_string"><span class="quote">&quot;</span>a<span class="quote">&quot;</span></span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.string', $value: 'a', $optional: 0},
                {
                    json: {
                        plain: '"a"',
                        html: '<span class="yql_string"><span class="quote">&quot;</span>a<span class="quote">&quot;</span></span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.utf8', $value: 'a', $optional: 2},
                {
                    json: {
                        plain: '"a"',
                        html: '<span class="yql_utf8"><span class="quote">&quot;</span>a<span class="quote">&quot;</span></span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.utf8', $value: 'a', $optional: 0},
                {
                    json: {
                        plain: '"a"',
                        html: '<span class="yql_utf8"><span class="quote">&quot;</span>a<span class="quote">&quot;</span></span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.pg.varbit', $value: '001', $category: 'V'},
                {
                    json: {
                        plain: '001',
                        html: '<span class="yql_pg_varbit pg_category_v">001</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.pg.varbit', $value: '001', $category: 'I'},
                {
                    json: {
                        plain: '001',
                        html: '<span class="yql_pg_varbit pg_category_i">001</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.pg.varbit', $value: '001', $category: 'S'},
                {
                    json: {
                        plain: '001',
                        html: '<span class="yql_pg_varbit pg_category_s">001</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.pg.varbit', $value: '001', $category: 'E'},
                {
                    json: {
                        plain: '001',
                        html: '<span class="yql_pg_varbit pg_category_e">001</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.pg.varbit', $value: '001', $category: 'N'},
                {
                    json: {
                        plain: '001',
                        html: '<span class="yql_pg_varbit pg_category_n">001</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.pg.varbit', $value: '001', $category: 'A'},
                {
                    json: {
                        plain: '001',
                        html: '<span class="yql_pg_varbit pg_category_a">001</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.pg.varbit', $value: '001', $category: 'C'},
                {
                    json: {
                        plain: '001',
                        html: '<span class="yql_pg_varbit pg_category_c">001</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.pg.varbit', $value: '001', $category: 'D'},
                {
                    json: {
                        plain: '001',
                        html: '<span class="yql_pg_varbit pg_category_d">001</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.pg.varbit', $value: '001', $category: 'B'},
                {
                    json: {
                        plain: '001',
                        html: '<span class="yql_pg_varbit pg_category_b">001</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.pg.varbit', $value: '001', $category: 'T'},
                {
                    json: {
                        plain: '001',
                        html: '<span class="yql_pg_varbit pg_category_t">001</span>',
                    },
                },
            );
            io.set(
                {$type: 'yql.pg.varbit', $value: '001', $category: 'G'},
                {
                    json: {
                        plain: '001',
                        html: '<span class="yql_pg_varbit pg_category_g">001</span>',
                    },
                },
            );
            runTestCases(io, 'json', {
                break: false,
                indent: 0,
                nonBreakingIndent: false,
            });
        });
    });
});
