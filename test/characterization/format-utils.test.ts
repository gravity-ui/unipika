import {describe, expect, test} from '@jest/globals';

const utils = require('../../lib/utils/format');

describe('characterization: utils/format', () => {
    describe('escape / unescape', () => {
        test('escape escapes HTML special chars', () => {
            expect(utils.escape('&<>"\'`')).toBe('&amp;&lt;&gt;&quot;&#x27;&#x60;');
        });

        test('escape coerces null to empty string', () => {
            expect(utils.escape(null)).toBe('');
        });

        test('escape coerces non-string to string', () => {
            expect(utils.escape(42)).toBe('42');
        });

        test('unescape reverses escape', () => {
            expect(utils.unescape('&<>"&#x27;&#x60;')).toBe('&<>"\'`');
        });
    });

    describe('escapeJSONString', () => {
        test('wraps in double quotes', () => {
            expect(utils.escapeJSONString({asHTML: false}, 'foo')).toBe('"foo"');
        });

        test('escapes quotes and backslash', () => {
            expect(utils.escapeJSONString({asHTML: false}, 'a"b\\c')).toBe('"a\\"b\\\\c"');
        });

        test('escapes \\n, \\t, \\b, \\f, \\r', () => {
            expect(utils.escapeJSONString({asHTML: false, escapeWhitespace: true}, '\n\t\b\f\r')).toBe(
                '"\\n\\t\\b\\f\\r"',
            );
        });

        test('does not escape \\n/\\t when escapeWhitespace is false', () => {
            expect(utils.escapeJSONString({asHTML: false, escapeWhitespace: false}, 'a\nb\tc')).toBe(
                '"a\nb\tc"',
            );
        });

        test('escapes control characters as \\uXXXX', () => {
            expect(utils.escapeJSONString({asHTML: false}, String.fromCharCode(1))).toBe('"\\u0001"');
        });

        test('asHTML wraps quotes in span.quote (quote char is HTML-escaped)', () => {
            expect(utils.escapeJSONString({asHTML: true}, 'foo')).toBe(
                '<span class="quote">&quot;</span>foo<span class="quote">&quot;</span>',
            );
        });

        test('asHTML highlights escaped whitespace', () => {
            const result = utils.escapeJSONString({asHTML: true, escapeWhitespace: true}, '\n');
            expect(result).toContain('<span class="escape">\\n</span>');
        });
    });

    describe('escapeYSONString', () => {
        test('wraps in double quotes', () => {
            expect(utils.escapeYSONString({asHTML: false}, 'foo')).toBe('"foo"');
        });

        test('escapes quotes and backslash', () => {
            expect(utils.escapeYSONString({asHTML: false}, 'a"b\\c')).toBe('"a\\"b\\\\c"');
        });

        test('escapes \\r', () => {
            expect(utils.escapeYSONString({asHTML: false}, '\r')).toBe('"\\r"');
        });

        test('escapes low control chars as octal when next char is not octal', () => {
            expect(utils.escapeYSONString({asHTML: false}, String.fromCharCode(1) + 'x')).toBe(
                '"\\1x"',
            );
        });

        test('escapes high chars as hex when next char is not hex', () => {
            // char code 200 (0xc8) -> \xc8
            expect(utils.escapeYSONString({asHTML: false}, String.fromCharCode(200) + 'x')).toBe(
                '"\\xc8x"',
            );
        });
    });

    describe('escapeHTMLString', () => {
        test('wraps in quotes and escapes each char', () => {
            expect(utils.escapeHTMLString({asHTML: true}, '<b>')).toBe(
                '<span class="quote">&quot;</span>&lt;b&gt;<span class="quote">&quot;</span>',
            );
        });
    });

    describe('binaryToHex', () => {
        test('joins with space by default', () => {
            expect(utils.binaryToHex({nonBreakingIndent: false}, '\x00\x01')).toBe('00 01');
        });

        test('joins with non-breaking space when nonBreakingIndent', () => {
            expect(utils.binaryToHex({nonBreakingIndent: true}, '\x00\x01')).toBe('00\xa001');
        });

        test('throws on non-binary char (>255)', () => {
            expect(() => utils.binaryToHex({nonBreakingIndent: false}, 'я')).toThrowError();
        });
    });

    describe('escapeYSONBinaryString / escapeYQLBinaryString', () => {
        test('escapeYSONBinaryString converts binary to hex', () => {
            expect(utils.escapeYSONBinaryString({nonBreakingIndent: false}, '\xab\xcd')).toBe(
                'ab cd',
            );
        });

        test('escapeYQLBinaryString decodes base64 then converts to hex', () => {
            // base64 of \xab\xcd is "q80="
            expect(utils.escapeYQLBinaryString({nonBreakingIndent: false}, 'q80=')).toBe('ab cd');
        });
    });

    describe('normalizeUrl', () => {
        test('uses settings.normalizeUrl when provided', () => {
            expect(utils.normalizeUrl('http://foo', {normalizeUrl: () => 'custom'})).toBe('custom');
        });

        test('uses encodeURI by default', () => {
            expect(utils.normalizeUrl('http://foo bar', {})).toBe('http://foo%20bar');
        });

        test('returns empty string on error', () => {
            expect(
                utils.normalizeUrl('http://foo', {
                    normalizeUrl: () => {
                        throw new Error('boom');
                    },
                }),
            ).toBe('');
        });
    });

    describe('getIndent', () => {
        test('returns empty + spaces when break is false', () => {
            expect(utils.getIndent({break: false, indent: 4, nonBreakingIndent: false}, 1)).toBe(
                '    ',
            );
        });

        test('returns line feed + spaces when break is true', () => {
            expect(utils.getIndent({break: true, indent: 2, nonBreakingIndent: false}, 2)).toBe(
                '\n    ',
            );
        });

        test('uses non-breaking space when nonBreakingIndent', () => {
            expect(utils.getIndent({break: false, indent: 1, nonBreakingIndent: true}, 1)).toBe(
                '\xa0',
            );
        });
    });

    describe('getKeyValueSeparator', () => {
        test('json format uses ": "', () => {
            expect(utils.getKeyValueSeparator({format: 'json', nonBreakingIndent: false})).toBe(
                ': ',
            );
        });

        test('yson format uses " = "', () => {
            expect(utils.getKeyValueSeparator({format: 'yson', nonBreakingIndent: false})).toBe(
                ' = ',
            );
        });
    });

    describe('getExpressionTerminator', () => {
        test('json format returns ","', () => {
            expect(utils.getExpressionTerminator({format: 'json'})).toBe(',');
        });

        test('yson format returns ";"', () => {
            expect(utils.getExpressionTerminator({format: 'yson'})).toBe(';');
        });
    });

    describe('getAttributesStart / getAttributesEnd', () => {
        test('json attributes start is {', () => {
            expect(utils.getAttributesStart({format: 'json'})).toBe('{');
        });

        test('yson attributes start is <', () => {
            expect(utils.getAttributesStart({format: 'yson'})).toBe('<');
        });

        test('json attributes end is },', () => {
            expect(utils.getAttributesEnd({format: 'json'})).toBe('},');
        });

        test('yson attributes end is >', () => {
            expect(utils.getAttributesEnd({format: 'yson'})).toBe('>');
        });
    });

    describe('drawFullView / drawCompactView', () => {
        test('drawFullView true when weight > 1', () => {
            expect(utils.drawFullView(2, {compact: false})).toBe(true);
        });

        test('drawFullView true when weight === 1 and not compact', () => {
            expect(utils.drawFullView(1, {compact: false})).toBe(true);
        });

        test('drawFullView false when weight === 1 and compact', () => {
            expect(utils.drawFullView(1, {compact: true})).toBe(false);
        });

        test('drawCompactView true when weight === 1 and compact', () => {
            expect(utils.drawCompactView(1, {compact: true})).toBe(true);
        });

        test('drawCompactView false when weight > 1', () => {
            expect(utils.drawCompactView(2, {compact: true})).toBe(false);
        });
    });

    describe('wrapScalar', () => {
        test('plain text returns formattedValue when asHTML is false', () => {
            expect(utils.wrapScalar({$type: 'string'}, {asHTML: false}, 'val')).toBe('val');
        });

        test('asHTML wraps in span with class from $type', () => {
            expect(utils.wrapScalar({$type: 'string'}, {asHTML: true}, 'val')).toBe(
                '<span class="string">val</span>',
            );
        });

        test('asHTML adds incomplete class when $incomplete', () => {
            expect(
                utils.wrapScalar({$type: 'string', $incomplete: true}, {asHTML: true}, 'val'),
            ).toBe('<span class="string incomplete">val</span>');
        });

        test('asHTML adds binary class when $binary', () => {
            expect(
                utils.wrapScalar({$type: 'string', $binary: true}, {asHTML: true}, 'val'),
            ).toBe('<span class="string binary">val</span>');
        });

        test('asHTML adds key class when $key', () => {
            expect(utils.wrapScalar({$type: 'string', $key: true}, {asHTML: true}, 'val')).toBe(
                '<span class="string key">val</span>',
            );
        });

        test('asHTML adds special-key class when $special_key', () => {
            expect(
                utils.wrapScalar({$type: 'string', $special_key: true}, {asHTML: true}, 'val'),
            ).toBe('<span class="string special-key">val</span>');
        });

        test('asHTML adds title when $incomplete and $original_value', () => {
            expect(
                utils.wrapScalar(
                    {$type: 'string', $incomplete: true, $original_value: 'orig'},
                    {asHTML: true},
                    'val',
                ),
            ).toBe('<span title="orig" class="string incomplete">val</span>');
        });

        test('replaces dots in $type with underscores for class name', () => {
            expect(utils.wrapScalar({$type: 'yql.tagged'}, {asHTML: true}, 'val')).toBe(
                '<span class="yql_tagged">val</span>',
            );
        });

        test('adds pg_category class when $category is valid', () => {
            expect(utils.wrapScalar({$type: 'string', $category: 'S'}, {asHTML: true}, 'val')).toBe(
                '<span class="string pg_category_s">val</span>',
            );
        });
    });

    describe('wrapComplex', () => {
        test('plain text returns formattedValue when asHTML is false', () => {
            expect(utils.wrapComplex({$type: 'list'}, {asHTML: false}, 'val')).toBe('val');
        });

        test('asHTML returns formattedValue when no className', () => {
            expect(utils.wrapComplex({$type: 'list'}, {asHTML: true}, 'val')).toBe('val');
        });

        test('asHTML wraps in span when $incomplete', () => {
            expect(
                utils.wrapComplex({$type: 'list', $incomplete: true}, {asHTML: true}, 'val'),
            ).toBe('<span class=" incomplete">val</span>');
        });

        test('yql.yson + $incomplete returns empty span', () => {
            expect(
                utils.wrapComplex({$type: 'yql.yson', $incomplete: true}, {asHTML: true}, 'val'),
            ).toBe('<span class=" incomplete"></span>');
        });
    });

    describe('wrapOptional', () => {
        const parentKey = Symbol('parent');

        test('returns formattedValue when $value is not null', () => {
            expect(utils.wrapOptional({$value: 'x'}, {asHTML: false}, 'val', parentKey)).toBe('val');
        });

        test('returns formattedValue when optionalLevels is 0', () => {
            expect(utils.wrapOptional({$value: null}, {asHTML: false}, 'val', parentKey)).toBe(
                'val',
            );
        });

        test('wraps with brackets when $optional is set', () => {
            expect(
                utils.wrapOptional({$value: null, $optional: 2}, {asHTML: false}, 'val', parentKey),
            ).toBe('[[val]]');
        });

        test('asHTML wraps brackets in span.optional', () => {
            expect(
                utils.wrapOptional({$value: null, $optional: 1}, {asHTML: true}, 'val', parentKey),
            ).toBe('<span class="optional">[</span>val<span class="optional">]</span>');
        });
    });

    describe('unescapeKeyValue', () => {
        test('strips leading $$ from string', () => {
            expect(utils.unescapeKeyValue('$$attributes')).toBe('$attributes');
        });

        test('returns non-string value as is', () => {
            expect(utils.unescapeKeyValue(42)).toBe(42);
        });
    });

    describe('parseSetting', () => {
        test('returns setting value when defined', () => {
            expect(utils.parseSetting({foo: 'bar'}, 'foo', 'baz')).toBe('bar');
        });

        test('returns default when setting is undefined', () => {
            expect(utils.parseSetting({}, 'foo', 'baz')).toBe('baz');
        });

        test('returns default when settings is falsy', () => {
            expect(utils.parseSetting(null, 'foo', 'baz')).toBe('baz');
        });
    });

    describe('returnAsIs', () => {
        test('returns the value unchanged', () => {
            expect(utils.returnAsIs({}, 'val')).toBe('val');
        });
    });

    describe('constants', () => {
        test('exports expected constants', () => {
            expect(utils.EMPTY_STRING).toBe('');
            expect(utils.WHITESPACE).toBe(' ');
            expect(utils.NON_BREAKING_WHITESPACE).toBe('\xa0');
            expect(utils.LINE_FEED).toBe('\n');
            expect(utils.JSON).toBe('json');
            expect(utils.YSON).toBe('yson');
            expect(utils.OBJECT_START).toBe('{');
            expect(utils.OBJECT_END).toBe('}');
            expect(utils.ARRAY_START).toBe('[');
            expect(utils.ARRAY_END).toBe(']');
            expect(utils.YSON_ATTRIBUTES_START).toBe('<');
            expect(utils.YSON_ATTRIBUTES_END).toBe('>');
            expect(utils.JSON_EXPRESSION_TERMINATOR).toBe(',');
            expect(utils.JSON_KEY_VALUE_SEPARATOR).toBe(': ');
        });
    });
});
