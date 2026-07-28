import {describe, expect, test} from '@jest/globals';

const unipika = require('../..')();

const {format} = unipika;

const S = {asHTML: false, break: false, compact: true, indent: 0, nonBreakingIndent: false};
const H = {asHTML: true, break: false, compact: true, indent: 0};

describe('characterization: YQL plugins without dedicated tests', () => {
    describe('yql-bool', () => {
        test('true json', () => {
            expect(format({$type: 'yql.bool', $value: true}, Object.assign({}, S, {format: 'json'}))).toBe(
                'true',
            );
        });

        test('false json', () => {
            expect(
                format({$type: 'yql.bool', $value: false}, Object.assign({}, S, {format: 'json'})),
            ).toBe('false');
        });

        test('true yson', () => {
            expect(format({$type: 'yql.bool', $value: true}, Object.assign({}, S, {format: 'yson'}))).toBe(
                '%true',
            );
        });

        test('false yson', () => {
            expect(
                format({$type: 'yql.bool', $value: false}, Object.assign({}, S, {format: 'yson'})),
            ).toBe('%false');
        });

        test('true html', () => {
            expect(format({$type: 'yql.bool', $value: true}, Object.assign({}, H, {format: 'json'}))).toBe(
                '<span class="yql_bool">true</span>',
            );
        });
    });

    describe('yql-int64 / yql-int8 / yql-int16 / yql-int32', () => {
        test('yql.int64 json', () => {
            expect(
                format({$type: 'yql.int64', $value: '42'}, Object.assign({}, S, {format: 'json'})),
            ).toBe('42');
        });

        test('yql.int8 json', () => {
            expect(format({$type: 'yql.int8', $value: '42'}, Object.assign({}, S, {format: 'json'}))).toBe(
                '42',
            );
        });

        test('yql.int16 json', () => {
            expect(
                format({$type: 'yql.int16', $value: '42'}, Object.assign({}, S, {format: 'json'})),
            ).toBe('42');
        });

        test('yql.int32 json', () => {
            expect(
                format({$type: 'yql.int32', $value: '42'}, Object.assign({}, S, {format: 'json'})),
            ).toBe('42');
        });

        test('yql.int64 html', () => {
            expect(format({$type: 'yql.int64', $value: '42'}, Object.assign({}, H, {format: 'json'}))).toBe(
                '<span class="yql_int64">42</span>',
            );
        });

        test('yql.int8 html', () => {
            expect(format({$type: 'yql.int8', $value: '42'}, Object.assign({}, H, {format: 'json'}))).toBe(
                '<span class="yql_int8">42</span>',
            );
        });
    });

    describe('yql-uint64 / yql-uint8 / yql-uint16 / yql-uint32', () => {
        test('yql.uint64 json', () => {
            expect(
                format({$type: 'yql.uint64', $value: '42'}, Object.assign({}, S, {format: 'json'})),
            ).toBe('42');
        });

        test('yql.uint64 yson', () => {
            expect(
                format({$type: 'yql.uint64', $value: '42'}, Object.assign({}, S, {format: 'yson'})),
            ).toBe('42u');
        });

        test('yql.uint8 json', () => {
            expect(
                format({$type: 'yql.uint8', $value: '42'}, Object.assign({}, S, {format: 'json'})),
            ).toBe('42');
        });

        test('yql.uint16 json', () => {
            expect(
                format({$type: 'yql.uint16', $value: '42'}, Object.assign({}, S, {format: 'json'})),
            ).toBe('42');
        });

        test('yql.uint32 json', () => {
            expect(
                format({$type: 'yql.uint32', $value: '42'}, Object.assign({}, S, {format: 'json'})),
            ).toBe('42');
        });

        test('yql.uint64 html', () => {
            expect(
                format({$type: 'yql.uint64', $value: '42'}, Object.assign({}, H, {format: 'json'})),
            ).toBe('<span class="yql_uint64">42</span>');
        });
    });

    describe('yql-double / yql-float', () => {
        test('yql.double json', () => {
            expect(
                format({$type: 'yql.double', $value: '3.14'}, Object.assign({}, S, {format: 'json'})),
            ).toBe('3.14');
        });

        test('yql.float json', () => {
            expect(
                format({$type: 'yql.float', $value: '3.14'}, Object.assign({}, S, {format: 'json'})),
            ).toBe('3.14');
        });

        test('yql.double html', () => {
            expect(
                format({$type: 'yql.double', $value: '3.14'}, Object.assign({}, H, {format: 'json'})),
            ).toBe('<span class="yql_double">3.14</span>');
        });

        test('yql.float html', () => {
            expect(
                format({$type: 'yql.float', $value: '3.14'}, Object.assign({}, H, {format: 'json'})),
            ).toBe('<span class="yql_float">3.14</span>');
        });
    });

    describe('yql-decimal', () => {
        test('json', () => {
            expect(
                format({$type: 'yql.decimal', $value: '42.5'}, Object.assign({}, S, {format: 'json'})),
            ).toBe('42.5');
        });

        test('html', () => {
            expect(
                format({$type: 'yql.decimal', $value: '42.5'}, Object.assign({}, H, {format: 'json'})),
            ).toBe('<span class="yql_decimal">42.5</span>');
        });
    });

    describe('yql-null', () => {
        test('json', () => {
            expect(
                format({$type: 'yql.null', $value: null}, Object.assign({}, S, {format: 'json'})),
            ).toBe('null');
        });

        test('yson', () => {
            expect(
                format({$type: 'yql.null', $value: null}, Object.assign({}, S, {format: 'yson'})),
            ).toBe('#');
        });

        test('html', () => {
            expect(
                format({$type: 'yql.null', $value: null}, Object.assign({}, H, {format: 'json'})),
            ).toBe('<span class="yql_null">null</span>');
        });
    });

    describe('yql-utf8', () => {
        test('json', () => {
            expect(
                format({$type: 'yql.utf8', $value: 'hello'}, Object.assign({}, S, {format: 'json'})),
            ).toBe('"hello"');
        });

        test('html', () => {
            expect(
                format({$type: 'yql.utf8', $value: 'hello'}, Object.assign({}, H, {format: 'json'})),
            ).toBe('<span class="yql_utf8"><span class="quote">&quot;</span>hello<span class="quote">&quot;</span></span>');
        });
    });

    describe('yql-enum', () => {
        test('json', () => {
            expect(
                format({$type: 'yql.enum', $value: 'value1'}, Object.assign({}, S, {format: 'json'})),
            ).toBe('value1');
        });

        test('html', () => {
            expect(
                format({$type: 'yql.enum', $value: 'value1'}, Object.assign({}, H, {format: 'json'})),
            ).toBe('<span class="yql_enum">value1</span>');
        });
    });

    describe('yql-tzdate / yql-tzdatetime / yql-tztimestamp', () => {
        test('yql.tzdate json', () => {
            expect(
                format({$type: 'yql.tzdate', $value: '2000-01-01'}, Object.assign({}, S, {format: 'json'})),
            ).toBe('2000-01-01');
        });

        test('yql.tzdate html', () => {
            expect(
                format({$type: 'yql.tzdate', $value: '2000-01-01'}, Object.assign({}, H, {format: 'json'})),
            ).toBe('<span class="yql_tzdate">2000-01-01</span>');
        });

        test('yql.tzdatetime json', () => {
            expect(
                format(
                    {$type: 'yql.tzdatetime', $value: '2000-01-01T00:00:00'},
                    Object.assign({}, S, {format: 'json'}),
                ),
            ).toBe('2000-01-01T00:00:00');
        });

        test('yql.tztimestamp json', () => {
            expect(
                format(
                    {$type: 'yql.tztimestamp', $value: '2000-01-01T00:00:00.000000'},
                    Object.assign({}, S, {format: 'json'}),
                ),
            ).toBe('2000-01-01T00:00:00.000000');
        });
    });

    describe('yql-datetime', () => {
        test('json', () => {
            expect(
                format({$type: 'yql.datetime', $value: '946688523'}, Object.assign({}, S, {format: 'json'})),
            ).toBe('2000-01-01T01:02:03Z');
        });

        test('html', () => {
            expect(
                format({$type: 'yql.datetime', $value: '946688523'}, Object.assign({}, H, {format: 'json'})),
            ).toBe('<span class="yql_datetime">2000-01-01T01:02:03Z</span>');
        });

        test('invalid', () => {
            expect(
                format({$type: 'yql.datetime', $value: 'invalid'}, Object.assign({}, S, {format: 'json'})),
            ).toBe('Invalid datetime');
        });
    });

    describe('yql-timestamp', () => {
        test('json', () => {
            expect(
                format(
                    {$type: 'yql.timestamp', $value: '946688523432001'},
                    Object.assign({}, S, {format: 'json'}),
                ),
            ).toBe('2000-01-01T01:02:03.432001Z');
        });

        test('html', () => {
            expect(
                format(
                    {$type: 'yql.timestamp', $value: '946688523432001'},
                    Object.assign({}, H, {format: 'json'}),
                ),
            ).toBe('<span class="yql_timestamp">2000-01-01T01:02:03.432001Z</span>');
        });

        test('invalid', () => {
            expect(
                format(
                    {$type: 'yql.timestamp', $value: 'invalid'},
                    Object.assign({}, S, {format: 'json'}),
                ),
            ).toBe('Invalid timestamp');
        });
    });

    describe('yql-interval', () => {
        test('zero', () => {
            expect(
                format({$type: 'yql.interval', $value: '0'}, Object.assign({}, S, {format: 'json'})),
            ).toBe('0');
        });

        test('html', () => {
            expect(
                format(
                    {$type: 'yql.interval', $value: '90061000001'},
                    Object.assign({}, H, {format: 'json'}),
                ),
            ).toBe(
                '<span class="yql_interval">1\u00a0day 1\u00a0hour 1\u00a0minute 1\u00a0second 1\u00a0microsecond</span>',
            );
        });
    });

    describe('yql-list', () => {
        test('empty json', () => {
            expect(format({$type: 'yql.list', $value: []}, Object.assign({}, S, {format: 'json'}))).toBe(
                '[]',
            );
        });

        test('with elements json', () => {
            expect(
                format(
                    {
                        $type: 'yql.list',
                        $value: [
                            {$type: 'yql.int64', $value: '1'},
                            {$type: 'yql.int64', $value: '2'},
                        ],
                    },
                    Object.assign({}, S, {format: 'json'}),
                ),
            ).toBe('[1,2]');
        });

        test('html', () => {
            expect(
                format(
                    {
                        $type: 'yql.list',
                        $value: [{$type: 'yql.int64', $value: '1'}],
                    },
                    Object.assign({}, H, {format: 'json'}),
                ),
            ).toBe('[<span class="yql_int64">1</span>]');
        });
    });

    describe('yql-stream', () => {
        test('empty json', () => {
            expect(format({$type: 'yql.stream', $value: []}, Object.assign({}, S, {format: 'json'}))).toBe(
                '[]',
            );
        });

        test('with elements json', () => {
            expect(
                format(
                    {
                        $type: 'yql.stream',
                        $value: [{$type: 'yql.int64', $value: '1'}],
                    },
                    Object.assign({}, S, {format: 'json'}),
                ),
            ).toBe('[1]');
        });
    });

    describe('yql-tuple', () => {
        test('empty json', () => {
            expect(format({$type: 'yql.tuple', $value: []}, Object.assign({}, S, {format: 'json'}))).toBe(
                '()',
            );
        });

        test('with elements json', () => {
            expect(
                format(
                    {
                        $type: 'yql.tuple',
                        $value: [
                            {$type: 'yql.int64', $value: '1'},
                            {$type: 'yql.string', $value: 'a'},
                        ],
                    },
                    Object.assign({}, S, {format: 'json'}),
                ),
            ).toBe('(1,"a")');
        });

        test('html', () => {
            expect(
                format(
                    {
                        $type: 'yql.tuple',
                        $value: [{$type: 'yql.int64', $value: '1'}],
                    },
                    Object.assign({}, H, {format: 'json'}),
                ),
            ).toBe('(<span class="yql_int64">1</span>)');
        });
    });

    describe('yql-struct', () => {
        test('empty json', () => {
            expect(format({$type: 'yql.struct', $value: []}, Object.assign({}, S, {format: 'json'}))).toBe(
                '()',
            );
        });

        test('with elements json', () => {
            expect(
                format(
                    {
                        $type: 'yql.struct',
                        $value: [
                            [
                                {$type: 'yql.string', $value: 'key', $key: true},
                                {$type: 'yql.int64', $value: '1'},
                            ],
                        ],
                    },
                    Object.assign({}, S, {format: 'json'}),
                ),
            ).toBe('("key": 1)');
        });

        test('html', () => {
            expect(
                format(
                    {
                        $type: 'yql.struct',
                        $value: [
                            [
                                {$type: 'yql.string', $value: 'key', $key: true},
                                {$type: 'yql.int64', $value: '1'},
                            ],
                        ],
                    },
                    Object.assign({}, H, {format: 'json'}),
                ),
            ).toBe(
                '(<span class="yql_string key"><span class="quote">&quot;</span>key<span class="quote">&quot;</span></span>: <span class="yql_int64">1</span>)',
            );
        });
    });

    describe('yql-dict', () => {
        test('empty json', () => {
            expect(format({$type: 'yql.dict', $value: []}, Object.assign({}, S, {format: 'json'}))).toBe(
                '{}',
            );
        });

        test('with elements json', () => {
            expect(
                format(
                    {
                        $type: 'yql.dict',
                        $value: [
                            [
                                {$type: 'yql.int64', $value: '1', $key: true},
                                {$type: 'yql.string', $value: 'a'},
                            ],
                        ],
                    },
                    Object.assign({}, S, {format: 'json'}),
                ),
            ).toBe('{1: "a"}');
        });
    });

    describe('yql-set', () => {
        test('empty json', () => {
            expect(format({$type: 'yql.set', $value: []}, Object.assign({}, S, {format: 'json'}))).toBe(
                '{}',
            );
        });

        test('with elements json', () => {
            expect(
                format(
                    {
                        $type: 'yql.set',
                        $value: [{$type: 'yql.int64', $value: '1'}],
                    },
                    Object.assign({}, S, {format: 'json'}),
                ),
            ).toBe('{1}');
        });

        test('html', () => {
            expect(
                format(
                    {
                        $type: 'yql.set',
                        $value: [{$type: 'yql.int64', $value: '1'}],
                    },
                    Object.assign({}, H, {format: 'json'}),
                ),
            ).toBe('<span class="yql_set">{<span class="yql_int64">1</span>}</span>');
        });
    });

    describe('yql-variant', () => {
        test('json', () => {
            expect(
                format(
                    {
                        $type: 'yql.variant',
                        $value: [
                            [
                                {$type: 'yql.string', $value: 'key', $key: true},
                                {$type: 'yql.int64', $value: '1'},
                            ],
                        ],
                    },
                    Object.assign({}, S, {format: 'json'}),
                ),
            ).toBe('"key": 1');
        });
    });

    describe('yql-json', () => {
        test('valid json string', () => {
            expect(
                format({$type: 'yql.json', $value: '{"a":1}'}, Object.assign({}, S, {format: 'json'})),
            ).toBe('{"a": 1}');
        });

        test('html', () => {
            expect(
                format({$type: 'yql.json', $value: '{"a":1}'}, Object.assign({}, H, {format: 'json'})),
            ).toBe('{<span class="string key"><span class="quote">&quot;</span>a<span class="quote">&quot;</span></span>: <span class="number">1</span>}');
        });
    });

    describe('yql-yson', () => {
        test('json', () => {
            expect(
                format({$type: 'yql.yson', $value: '<a=1>1'}, Object.assign({}, S, {format: 'json'})),
            ).toBe('"<a=1>1"');
        });

        test('html', () => {
            expect(
                format({$type: 'yql.yson', $value: '<a=1>1'}, Object.assign({}, H, {format: 'json'})),
            ).toBe('<span class="string"><span class="quote">&quot;</span>&lt;a=1&gt;1<span class="quote">&quot;</span></span>');
        });
    });

    describe('yql-pg', () => {
        test('json', () => {
            expect(
                format(
                    {$type: 'yql.pg.int4', $value: 4, $category: 'N'},
                    Object.assign({}, S, {format: 'json'}),
                ),
            ).toBe('4');
        });

        test('html', () => {
            expect(
                format(
                    {$type: 'yql.pg.int4', $value: 4, $category: 'N'},
                    Object.assign({}, H, {format: 'json'}),
                ),
            ).toBe('<span class="yql_pg_int4 pg_category_n">4</span>');
        });

        test('pg text', () => {
            expect(
                format(
                    {$type: 'yql.pg.text', $value: 'hello', $category: 'S'},
                    Object.assign({}, S, {format: 'json'}),
                ),
            ).toBe('hello');
        });
    });
});
