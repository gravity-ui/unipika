import {describe, expect, test} from '@jest/globals';

import * as unipika from '../..';

const {formatFromYQL} = unipika;

const S = {asHTML: false, break: false, compact: true, indent: 0, nonBreakingIndent: false};
const H = {asHTML: true, break: false, compact: true, indent: 0};

describe('characterization: formatFromYQL', () => {
    test('Boolean', () => {
        expect(formatFromYQL([true, ['DataType', 'Bool']], S)).toBe('true');
    });

    test('Boolean html', () => {
        expect(formatFromYQL([true, ['DataType', 'Bool']], H)).toBe(
            '<span class="yql_bool">true</span>',
        );
    });

    test('Int64', () => {
        expect(formatFromYQL(['42', ['DataType', 'Int64']], S)).toBe('42');
    });

    test('Int64 html', () => {
        expect(formatFromYQL(['42', ['DataType', 'Int64']], H)).toBe(
            '<span class="yql_int64">42</span>',
        );
    });

    test('String', () => {
        expect(formatFromYQL(['hello', ['DataType', 'String']], S)).toBe('"hello"');
    });

    test('String html', () => {
        expect(formatFromYQL(['hello', ['DataType', 'String']], H)).toBe(
            '<span class="yql_string"><span class="quote">&quot;</span>hello<span class="quote">&quot;</span></span>',
        );
    });

    test('List', () => {
        expect(formatFromYQL([[1, 2, 3], ['ListType', ['DataType', 'Int64']]], S)).toBe('[1,2,3]');
    });

    test('List html', () => {
        expect(formatFromYQL([[1, 2, 3], ['ListType', ['DataType', 'Int64']]], H)).toBe(
            '[<span class="yql_int64">1</span>,<span class="yql_int64">2</span>,<span class="yql_int64">3</span>]',
        );
    });

    test('Null', () => {
        expect(formatFromYQL([null, ['NullType']], S)).toBe('null');
    });

    test('Null html', () => {
        expect(formatFromYQL([null, ['NullType']], H)).toBe(
            '<span class="yql_null">null</span>',
        );
    });

    test('Void', () => {
        expect(formatFromYQL([null, ['VoidType']], S)).toBe('Void');
    });

    test('Void html', () => {
        expect(formatFromYQL([null, ['VoidType']], H)).toBe('Void');
    });

    test('Struct', () => {
        expect(
            formatFromYQL(
                [['1', 'hello'], ['StructType', [['a', ['DataType', 'Int64']], ['b', ['DataType', 'String']]]]],
                S,
            ),
        ).toBe('("a": 1,"b": "hello")');
    });

    test('Struct html', () => {
        expect(
            formatFromYQL(
                [['1', 'hello'], ['StructType', [['a', ['DataType', 'Int64']], ['b', ['DataType', 'String']]]]],
                H,
            ),
        ).toBe(
            '(<span class="yql_string key"><span class="quote">&quot;</span>a<span class="quote">&quot;</span></span>: <span class="yql_int64">1</span>,<span class="yql_string key"><span class="quote">&quot;</span>b<span class="quote">&quot;</span></span>: <span class="yql_string"><span class="quote">&quot;</span>hello<span class="quote">&quot;</span></span>)',
        );
    });

    test('Tuple', () => {
        expect(
            formatFromYQL(
                [['1', 'hello'], ['TupleType', [['DataType', 'Int64'], ['DataType', 'String']]]],
                S,
            ),
        ).toBe('(1,"hello")');
    });

    test('Tuple html', () => {
        expect(
            formatFromYQL(
                [['1', 'hello'], ['TupleType', [['DataType', 'Int64'], ['DataType', 'String']]]],
                H,
            ),
        ).toBe(
            '(<span class="yql_int64">1</span>,<span class="yql_string"><span class="quote">&quot;</span>hello<span class="quote">&quot;</span></span>)',
        );
    });

    test('Dict', () => {
        expect(
            formatFromYQL(
                [[['1', 'a'], ['2', 'b']], ['DictType', ['DataType', 'Int64'], ['DataType', 'String']]],
                S,
            ),
        ).toBe('{2: "b",1: "a"}');
    });

    test('Dict html', () => {
        expect(
            formatFromYQL(
                [[['1', 'a'], ['2', 'b']], ['DictType', ['DataType', 'Int64'], ['DataType', 'String']]],
                H,
            ),
        ).toBe(
            '{<span class="yql_int64">2</span>: <span class="yql_string"><span class="quote">&quot;</span>b<span class="quote">&quot;</span></span>,<span class="yql_int64">1</span>: <span class="yql_string"><span class="quote">&quot;</span>a<span class="quote">&quot;</span></span>}',
        );
    });

    test('Set', () => {
        expect(
            formatFromYQL(
                [[['1', 'Void'], ['2', 'Void']], ['DictType', ['DataType', 'Int64'], ['VoidType']]],
                S,
            ),
        ).toBe('{1,2}');
    });

    test('Set html', () => {
        expect(
            formatFromYQL(
                [[['1', 'Void'], ['2', 'Void']], ['DictType', ['DataType', 'Int64'], ['VoidType']]],
                H,
            ),
        ).toBe('<span class="yql_set">{<span class="yql_int64">1</span>,<span class="yql_int64">2</span>}</span>');
    });

    test('Stream', () => {
        expect(formatFromYQL([[1, 2], ['StreamType', ['DataType', 'Int64']]], S)).toBe('[1,2]');
    });

    test('Enum', () => {
        expect(
            formatFromYQL(
                [['1', 'Void'], ['VariantType', ['StructType', [['a', ['VoidType']], ['b', ['VoidType']]]]]],
                S,
            ),
        ).toBe('b');
    });

    test('Enum html', () => {
        expect(
            formatFromYQL(
                [['1', 'Void'], ['VariantType', ['StructType', [['a', ['VoidType']], ['b', ['VoidType']]]]]],
                H,
            ),
        ).toBe('<span class="yql_enum">b</span>');
    });

    test('Variant Tuple', () => {
        expect(
            formatFromYQL(
                [['0', '42'], ['VariantType', ['TupleType', [['DataType', 'Int32'], ['DataType', 'Int64']]]]],
                S,
            ),
        ).toBe('0: 42');
    });

    test('Variant Tuple html', () => {
        expect(
            formatFromYQL(
                [['0', '42'], ['VariantType', ['TupleType', [['DataType', 'Int32'], ['DataType', 'Int64']]]]],
                H,
            ),
        ).toBe('<span class="yql_int32 key">0</span>: <span class="yql_int32">42</span>');
    });

    test('Variant Struct', () => {
        expect(
            formatFromYQL(
                [['0', '42'], ['VariantType', ['StructType', [['x', ['DataType', 'Int64']], ['y', ['DataType', 'String']]]]]],
                S,
            ),
        ).toBe('"x": 42');
    });

    test('Variant Struct html', () => {
        expect(
            formatFromYQL(
                [['0', '42'], ['VariantType', ['StructType', [['x', ['DataType', 'Int64']], ['y', ['DataType', 'String']]]]]],
                H,
            ),
        ).toBe(
            '<span class="yql_string key"><span class="quote">&quot;</span>x<span class="quote">&quot;</span></span>: <span class="yql_int64">42</span>',
        );
    });

    test('Optional Int64 with value', () => {
        expect(formatFromYQL([['42'], ['OptionalType', ['DataType', 'Int64']]], S)).toBe('42');
    });

    test('Optional Int64 null', () => {
        expect(formatFromYQL([null, ['OptionalType', ['DataType', 'Int64']]], S)).toBe('null');
    });

    test('EmptyList', () => {
        expect(formatFromYQL([[], ['EmptyListType']], S)).toBe('[]');
    });

    test('EmptyDict', () => {
        expect(formatFromYQL([[], ['EmptyDictType']], S)).toBe('{}');
    });

    test('Date', () => {
        expect(formatFromYQL(['10957', ['DataType', 'Date']], S)).toBe('2000-01-01');
    });

    test('Date html', () => {
        expect(formatFromYQL(['10957', ['DataType', 'Date']], H)).toBe(
            '<span class="yql_date">2000-01-01</span>',
        );
    });

    test('Uuid', () => {
        expect(
            formatFromYQL(['12345678-1234-1234-1234-123456789012', ['DataType', 'Uuid']], S),
        ).toBe('34333231-3635-3837-2d31-3233342d3132');
    });

    test('Uuid html', () => {
        expect(
            formatFromYQL(['12345678-1234-1234-1234-123456789012', ['DataType', 'Uuid']], H),
        ).toBe('<span class="yql_uuid">34333231-3635-3837-2d31-3233342d3132</span>');
    });

    test('Pg int4', () => {
        expect(formatFromYQL([4, ['PgType', 'int4', 'N']], S)).toBe('4');
    });

    test('Pg int4 html', () => {
        expect(formatFromYQL([4, ['PgType', 'int4', 'N']], H)).toBe(
            '<span class="yql_pg_int4 pg_category_n">4</span>',
        );
    });

    test('JsonDocument', () => {
        expect(formatFromYQL(['{"a":1}', ['DataType', 'JsonDocument']], S)).toBe('{"a": 1}');
    });

    test('JsonDocument html', () => {
        expect(formatFromYQL(['{"a":1}', ['DataType', 'JsonDocument']], H)).toBe(
            '{<span class="string key"><span class="quote">&quot;</span>a<span class="quote">&quot;</span></span>: <span class="number">1</span>}',
        );
    });

    test('Yson', () => {
        expect(formatFromYQL(['<a=1>1', ['DataType', 'Yson']], S)).toBe('"<a=1>1"');
    });

    test('Yson html', () => {
        expect(formatFromYQL(['<a=1>1', ['DataType', 'Yson']], H)).toBe(
            '<span class="string"><span class="quote">&quot;</span>&lt;a=1&gt;1<span class="quote">&quot;</span></span>',
        );
    });

    test('Tagged url', () => {
        expect(
            formatFromYQL(
                ['https://example.com', ['TaggedType', 'url', ['DataType', 'String']]],
                Object.assign({}, S, {validateSrcUrl: () => true}),
            ),
        ).toBe('"https://example.com"');
    });

    test('Tagged url html', () => {
        expect(
            formatFromYQL(
                ['https://example.com', ['TaggedType', 'url', ['DataType', 'String']]],
                Object.assign({}, H, {validateSrcUrl: () => true}),
            ),
        ).toBe(
            '<a class="yql_tagged tagged tag_url" target="_blank" href="https://example.com">https://example.com</a>',
        );
    });

    test('with break=false produces single line', () => {
        expect(
            formatFromYQL([[1, 2, 3], ['ListType', ['DataType', 'Int64']]], {
                asHTML: false,
                break: false,
                compact: true,
                indent: 0,
                nonBreakingIndent: false,
            }),
        ).toBe('[1,2,3]');
    });

    test('with compact=true single element list', () => {
        expect(
            formatFromYQL([[1], ['ListType', ['DataType', 'Int64']]], S),
        ).toBe('[1]');
    });

    test('with maxListSize truncation', () => {
        expect(
            formatFromYQL(
                [[1, 2, 3, 4, 5], ['ListType', ['DataType', 'Int64']]],
                Object.assign({}, S, {limitListLength: 3}),
            ),
        ).toBe('[1,2,... 3 hidden items]');
    });

    test('with maxStringSize truncation', () => {
        expect(
            formatFromYQL(
                ['abcdefghij', ['DataType', 'String']],
                Object.assign({}, S, {maxStringSize: 5}),
            ),
        ).toBe('"abcde"');
    });

    test('with treatValAsData', () => {
        expect(
            formatFromYQL(
                ['hello', ['DataType', 'String']],
                Object.assign({}, S, {treatValAsData: true}),
            ),
        ).toBe('"hello"');
    });

    test('with treatValAsData incomplete', () => {
        expect(
            formatFromYQL(
                ['hello', ['DataType', 'String']],
                Object.assign({}, S, {treatValAsData: true, incomplete: true}),
            ),
        ).toBe('"hello"');
    });

    test('with treatValAsData binary', () => {
        expect(
            formatFromYQL(
                ['aGVsbG8=', ['DataType', 'String']],
                Object.assign({}, S, {treatValAsData: true, binary: true}),
            ),
        ).toBe('"aGVsbG8="');
    });
});
