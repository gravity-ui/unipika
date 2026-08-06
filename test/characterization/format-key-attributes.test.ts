import {describe, expect, test} from '@jest/globals';

import * as unipika from '../..';

const {formatKey, formatAttributes} = unipika;

const S = {asHTML: false, break: false, compact: true, indent: 0, nonBreakingIndent: false, escapeWhitespace: true};
const H = {asHTML: true, break: false, compact: true, indent: 0, escapeWhitespace: true};

describe('characterization: formatKey', () => {
    test('simple string key json plain', () => {
        expect(formatKey('hello', Object.assign({}, S, {format: 'json'}), 1)).toBe('"hello"');
    });

    test('simple string key json html', () => {
        expect(formatKey('hello', Object.assign({}, H, {format: 'json'}), 1)).toBe(
            '<span class="string special-key"><span class="quote">&quot;</span>hello<span class="quote">&quot;</span></span>',
        );
    });

    test('simple string key yson plain', () => {
        expect(formatKey('hello', Object.assign({}, S, {format: 'yson'}), 1)).toBe('"hello"');
    });

    test('simple string key yson html', () => {
        expect(formatKey('hello', Object.assign({}, H, {format: 'yson'}), 1)).toBe(
            '<span class="string special-key"><span class="quote">&quot;</span>hello<span class="quote">&quot;</span></span>',
        );
    });

    test('key with newline', () => {
        expect(formatKey('he\nllo', Object.assign({}, S, {format: 'json'}), 1)).toBe('"he\\nllo"');
    });

    test('key with tab', () => {
        expect(formatKey('he\tllo', Object.assign({}, S, {format: 'json'}), 1)).toBe('"he\\tllo"');
    });

    test('key with control character highlighted', () => {
        expect(
            formatKey(
                'he\x01llo',
                Object.assign({}, H, {format: 'json', highlightControlCharacter: true}),
                1,
            ),
        ).toBe(
            '<span class="string special-key"><span class="quote">&quot;</span>he<span class="escape">\\u0001</span>llo<span class="quote">&quot;</span></span>',
        );
    });

    test('key yson with dollar escape', () => {
        expect(formatKey('$$attributes', Object.assign({}, S, {format: 'yson'}), 1)).toBe(
            '"$$attributes"',
        );
    });

    test('key json with dollar', () => {
        expect(formatKey('$$attributes', Object.assign({}, S, {format: 'json'}), 1)).toBe(
            '"$$attributes"',
        );
    });
});

describe('characterization: formatAttributes', () => {
    const attr1 = {
        $attributes: [
            [
                {$type: 'string', $value: 'key', $decoded_value: 'key', $key: true},
                {$type: 'string', $value: 'value', $decoded_value: 'value'},
            ],
        ],
    };

    test('json plain single attribute', () => {
        expect(formatAttributes(attr1, Object.assign({}, S, {format: 'json'}), 1)).toBe(
            '{"key": "value"},',
        );
    });

    test('yson plain single attribute', () => {
        expect(formatAttributes(attr1, Object.assign({}, S, {format: 'yson'}), 1)).toBe(
            '<"key" = "value">',
        );
    });

    test('json plain multiple attributes', () => {
        const attr2 = {
            $attributes: [
                [
                    {$type: 'string', $value: 'a', $decoded_value: 'a', $key: true},
                    {$type: 'string', $value: '1', $decoded_value: '1'},
                ],
                [
                    {$type: 'string', $value: 'b', $decoded_value: 'b', $key: true},
                    {$type: 'string', $value: '2', $decoded_value: '2'},
                ],
            ],
        };
        expect(formatAttributes(attr2, Object.assign({}, S, {format: 'json'}), 1)).toBe(
            '{"a": "1","b": "2"},',
        );
    });

    test('json empty attributes', () => {
        expect(
            formatAttributes({$attributes: []}, Object.assign({}, S, {format: 'json'}), 1),
        ).toBe('{},');
    });

    test('yson empty attributes', () => {
        expect(
            formatAttributes({$attributes: []}, Object.assign({}, S, {format: 'yson'}), 1),
        ).toBe('<>');
    });

    test('json html', () => {
        expect(formatAttributes(attr1, Object.assign({}, H, {format: 'json'}), 1)).toBe(
            '{<span class="string key"><span class="quote">&quot;</span>key<span class="quote">&quot;</span></span>: <span class="string"><span class="quote">&quot;</span>value<span class="quote">&quot;</span></span>},',
        );
    });

    test('yson html', () => {
        expect(formatAttributes(attr1, Object.assign({}, H, {format: 'yson'}), 1)).toBe(
            '<<span class="string key"><span class="quote">&quot;</span>key<span class="quote">&quot;</span></span> = <span class="string"><span class="quote">&quot;</span>value<span class="quote">&quot;</span></span>>',
        );
    });
});
