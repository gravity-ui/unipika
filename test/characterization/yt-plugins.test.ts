import {describe, expect, test} from '@jest/globals';

const unipika = require('../..');

const {format} = unipika;

const S = {asHTML: false, break: false, compact: true, indent: 0, nonBreakingIndent: false};
const H = {asHTML: true, break: false, compact: true, indent: 0};

describe('characterization: YT scalar plugins returning raw $value', () => {
    describe('boolean', () => {
        test('true json', () => {
            expect(format({$type: 'boolean', $value: true}, Object.assign({}, S, {format: 'json'}))).toBe(
                'true',
            );
        });

        test('false json', () => {
            expect(
                format({$type: 'boolean', $value: false}, Object.assign({}, S, {format: 'json'})),
            ).toBe('false');
        });

        test('true yson', () => {
            expect(format({$type: 'boolean', $value: true}, Object.assign({}, S, {format: 'yson'}))).toBe(
                '%true',
            );
        });

        test('false yson', () => {
            expect(
                format({$type: 'boolean', $value: false}, Object.assign({}, S, {format: 'yson'})),
            ).toBe('%false');
        });

        test('true html', () => {
            expect(format({$type: 'boolean', $value: true}, Object.assign({}, H, {format: 'json'}))).toBe(
                '<span class="boolean">true</span>',
            );
        });
    });

    describe('null', () => {
        test('null json', () => {
            expect(format({$type: 'null', $value: null}, Object.assign({}, S, {format: 'json'}))).toBe(
                'null',
            );
        });

        test('null yson', () => {
            expect(format({$type: 'null', $value: null}, Object.assign({}, S, {format: 'yson'}))).toBe(
                '#',
            );
        });

        test('null html', () => {
            expect(format({$type: 'null', $value: null}, Object.assign({}, H, {format: 'json'}))).toBe(
                '<span class="null">null</span>',
            );
        });
    });

    describe('int64', () => {
        test('int64 json', () => {
            expect(format({$type: 'int64', $value: '42'}, Object.assign({}, S, {format: 'json'}))).toBe(
                '42',
            );
        });

        test('int64 html', () => {
            expect(format({$type: 'int64', $value: '42'}, Object.assign({}, H, {format: 'json'}))).toBe(
                '<span class="int64">42</span>',
            );
        });
    });

    describe('uint64', () => {
        test('uint64 json', () => {
            expect(format({$type: 'uint64', $value: '42'}, Object.assign({}, S, {format: 'json'}))).toBe(
                '42',
            );
        });

        test('uint64 yson', () => {
            expect(format({$type: 'uint64', $value: '42'}, Object.assign({}, S, {format: 'yson'}))).toBe(
                '42u',
            );
        });
    });
});
