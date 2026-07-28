import {describe, expect, test} from '@jest/globals';

const unipika = require('../..')();

const {format, formatKey, formatAttributes} = unipika;

const S = {asHTML: false, break: false, compact: true, indent: 0, nonBreakingIndent: false};
const H = {asHTML: true, break: false, compact: true, indent: 0};

describe('characterization: settings combinations', () => {
    describe('compact', () => {
        test('compact=true single element map json', () => {
            expect(
                format(
                    {
                        $type: 'map',
                        $value: [
                            [
                                {$type: 'string', $value: 'key', $decoded_value: 'key', $key: true},
                                {$type: 'string', $value: 'val', $decoded_value: 'val'},
                            ],
                        ],
                    },
                    S,
                ),
            ).toBe('{"key": "val"}');
        });
    });

    describe('binaryAsHex', () => {
        test('binaryAsHex=true yson binary string', () => {
            expect(
                format(
                    {$type: 'string', $value: 'Hello', $binary: true},
                    Object.assign({}, S, {format: 'yson', binaryAsHex: true}),
                ),
            ).toBe('48 65 6c 6c 6f');
        });

        test('binaryAsHex=true with nonBreakingIndent', () => {
            expect(
                format(
                    {$type: 'string', $value: 'Hello', $binary: true},
                    {
                        asHTML: false,
                        break: false,
                        compact: true,
                        indent: 0,
                        nonBreakingIndent: true,
                        format: 'yson',
                        binaryAsHex: true,
                    },
                ),
            ).toBe('48\u00a065\u00a06c\u00a06c\u00a06f');
        });
    });

    describe('highlightControlCharacter', () => {
        test('highlightControlCharacter=true json html', () => {
            expect(
                format(
                    {$type: 'string', $value: 'he\x01llo', $decoded_value: 'he\x01llo'},
                    Object.assign({}, H, {format: 'json', highlightControlCharacter: true}),
                ),
            ).toBe(
                '<span class="string"><span class="quote">&quot;</span>he<span class="escape">\\u0001</span>llo<span class="quote">&quot;</span></span>',
            );
        });

        test('highlightControlCharacter=false json html', () => {
            expect(
                format(
                    {$type: 'string', $value: 'he\x01llo', $decoded_value: 'he\x01llo'},
                    Object.assign({}, H, {format: 'json', highlightControlCharacter: false}),
                ),
            ).toBe(
                '<span class="string"><span class="quote">&quot;</span>he\\u0001llo<span class="quote">&quot;</span></span>',
            );
        });
    });

    describe('validateSrcUrl', () => {
        const taggedNode = {
            $type: 'tagged',
            $tag: 'url',
            $value: {
                $type: 'string',
                $value: 'https://example.com',
                $decoded_value: 'https://example.com',
            },
        };

        test('validateSrcUrl returns true for url tag', () => {
            expect(
                format(taggedNode, Object.assign({}, H, {validateSrcUrl: () => true})),
            ).toBe(
                '<a class="yql_tagged tagged tag_url" target="_blank" href="https://example.com">https://example.com</a>',
            );
        });

        test('validateSrcUrl returns false for url tag', () => {
            expect(
                format(taggedNode, Object.assign({}, H, {validateSrcUrl: () => false})),
            ).toBe(
                '<a class="yql_tagged tagged tag_url" target="_blank" href="https://example.com">https://example.com</a>',
            );
        });
    });

    describe('normalizeUrl', () => {
        const taggedNodeSpaces = {
            $type: 'tagged',
            $tag: 'url',
            $value: {
                $type: 'string',
                $value: 'https://example.com/path with spaces',
                $decoded_value: 'https://example.com/path with spaces',
            },
        };

        test('custom normalizeUrl', () => {
            expect(
                format(
                    taggedNodeSpaces,
                    Object.assign({}, H, {
                        validateSrcUrl: () => true,
                        normalizeUrl: function (url: string) {
                            return url.replace(/ /g, '_');
                        },
                    }),
                ),
            ).toBe(
                '<a class="yql_tagged tagged tag_url" target="_blank" href="https://example.com/path_with_spaces">https://example.com/path with spaces</a>',
            );
        });

        test('normalizeUrl default encodeURI', () => {
            expect(
                format(taggedNodeSpaces, Object.assign({}, H, {validateSrcUrl: () => true})),
            ).toBe(
                '<a class="yql_tagged tagged tag_url" target="_blank" href="https://example.com/path%20with%20spaces">https://example.com/path with spaces</a>',
            );
        });
    });

    describe('limitListLength', () => {
        test('truncation', () => {
            expect(
                format(
                    {
                        $type: 'list',
                        $value: [
                            {$type: 'number', $value: 1},
                            {$type: 'number', $value: 2},
                            {$type: 'number', $value: 3},
                            {$type: 'number', $value: 4},
                            {$type: 'number', $value: 5},
                        ],
                    },
                    Object.assign({}, S, {format: 'json', limitListLength: 3}),
                ),
            ).toBe('[1,2,... 3 hidden items]');
        });
    });

    describe('limitMapLength', () => {
        test('truncation', () => {
            expect(
                format(
                    {
                        $type: 'map',
                        $value: [
                            [
                                {$type: 'string', $value: 'a', $decoded_value: 'a', $key: true},
                                {$type: 'number', $value: 1},
                            ],
                            [
                                {$type: 'string', $value: 'b', $decoded_value: 'b', $key: true},
                                {$type: 'number', $value: 2},
                            ],
                            [
                                {$type: 'string', $value: 'c', $decoded_value: 'c', $key: true},
                                {$type: 'number', $value: 3},
                            ],
                        ],
                    },
                    Object.assign({}, S, {format: 'json', limitMapLength: 2}),
                ),
            ).toBe('{"a": 1,... 2 hidden keys}');
        });
    });

    describe('customNumberFormatter', () => {
        test('custom formatter applied', () => {
            expect(
                format(
                    {$type: 'int64', $value: '42'},
                    Object.assign({}, S, {
                        format: 'json',
                        customNumberFormatter: function (v: string) {
                            return '[' + v + ']';
                        },
                    }),
                ),
            ).toBe('[42]');
        });
    });

    describe('undefined input', () => {
        test('format returns empty string', () => {
            expect(format(undefined, {asHTML: false})).toBe('');
        });

        test('formatRaw returns empty string', () => {
            expect(unipika.formatRaw(undefined, {asHTML: false})).toBe('');
        });
    });
});
