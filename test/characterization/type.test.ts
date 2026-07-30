import {describe, expect, test} from '@jest/globals';

const {type} = require('../../lib/utils/type');

describe('characterization: utils/type', () => {
    describe('type()', () => {
        test('undefined -> "undefined"', () => {
            expect(type(undefined)).toBe('undefined');
        });

        test('null -> "null"', () => {
            expect(type(null)).toBe('null');
        });

        test('NaN -> "nan"', () => {
            expect(type(NaN)).toBe('nan');
        });

        test('Infinity -> "infinity"', () => {
            expect(type(Infinity)).toBe('infinity');
        });

        test('-Infinity -> "infinity"', () => {
            expect(type(-Infinity)).toBe('infinity');
        });

        test('number -> "number"', () => {
            expect(type(42)).toBe('number');
        });

        test('string -> "string"', () => {
            expect(type('foo')).toBe('string');
        });

        test('boolean -> "boolean"', () => {
            expect(type(true)).toBe('boolean');
        });

        test('function -> "function"', () => {
            expect(type(function () {})).toBe('function');
        });

        test('arrow function -> "function"', () => {
            expect(type(() => {})).toBe('function');
        });

        test('array -> "array"', () => {
            expect(type([1, 2, 3])).toBe('array');
        });

        test('object -> "object"', () => {
            expect(type({a: 1})).toBe('object');
        });

        test('regexp -> "regexp"', () => {
            expect(type(/foo/)).toBe('regexp');
        });

        test('symbol -> "symbol"', () => {
            expect(type(Symbol('s'))).toBe('symbol');
        });
    });

    describe('is* methods (generated)', () => {
        test('isString', () => {
            expect(type.isString('foo')).toBe(true);
            expect(type.isString(42)).toBe(false);
            expect(type.isString(null)).toBe(false);
        });

        test('isNumber', () => {
            expect(type.isNumber(42)).toBe(true);
            expect(type.isNumber('42')).toBe(false);
            expect(type.isNumber(NaN)).toBe(false);
            expect(type.isNumber(Infinity)).toBe(false);
        });

        test('isBoolean', () => {
            expect(type.isBoolean(true)).toBe(true);
            expect(type.isBoolean(false)).toBe(true);
            expect(type.isBoolean(0)).toBe(false);
        });

        test('isFunction', () => {
            expect(type.isFunction(function () {})).toBe(true);
            expect(type.isFunction(() => {})).toBe(true);
            expect(type.isFunction(42)).toBe(false);
        });

        test('isObject', () => {
            expect(type.isObject({})).toBe(true);
            expect(type.isObject([])).toBe(false);
            expect(type.isObject(null)).toBe(false);
        });

        test('isArray', () => {
            expect(type.isArray([])).toBe(true);
            expect(type.isArray([1])).toBe(true);
            expect(type.isArray({})).toBe(false);
        });

        test('isRegExp -> isRegexp', () => {
            // The generated method is named isRegExp but checks against 'regexp'
            expect(type.isRegExp(/foo/)).toBe(true);
            expect(type.isRegExp('foo')).toBe(false);
        });

        test('isNull', () => {
            expect(type.isNull(null)).toBe(true);
            expect(type.isNull(undefined)).toBe(false);
            expect(type.isNull(0)).toBe(false);
        });

        test('isUndefined', () => {
            expect(type.isUndefined(undefined)).toBe(true);
            expect(type.isUndefined(null)).toBe(false);
            expect(type.isUndefined('')).toBe(false);
        });

        test('isSymbol', () => {
            expect(type.isSymbol(Symbol('s'))).toBe(true);
            expect(type.isSymbol('s')).toBe(false);
        });

        test('isElement (DOM element)', () => {
            const fakeElement = {nodeType: 1};
            expect(type.isElement(fakeElement)).toBe(true);
            const fakeDocument = {nodeType: 9};
            expect(type.isElement(fakeDocument)).toBe(true);
            expect(type.isElement({})).toBe(false);
            expect(type.isElement(null)).toBe(false);
        });

        test('isNaN', () => {
            expect(type.isNaN(NaN)).toBe(true);
            expect(type.isNaN(42)).toBe(false);
            expect(type.isNaN('NaN')).toBe(false);
        });

        test('isInfinite — BUG: never returns true (mismatch "infinite" vs "infinity")', () => {
            // The types array has 'Infinite' -> method isInfinite checks
            // type(o) === 'infinite', but type() returns 'infinity' for Infinity.
            // So isInfinite is broken by design and always returns false.
            expect(type.isInfinite(Infinity)).toBe(false);
            expect(type.isInfinite(-Infinity)).toBe(false);
            expect(type.isInfinite(42)).toBe(false);
            expect(type.isInfinite(NaN)).toBe(false);
        });
    });

    describe('is* methods are real functions on the type object', () => {
        test('all 13 is* methods exist as functions', () => {
            const names = [
                'isNull',
                'isUndefined',
                'isObject',
                'isArray',
                'isString',
                'isNumber',
                'isBoolean',
                'isFunction',
                'isRegExp',
                'isElement',
                'isNaN',
                'isInfinite',
                'isSymbol',
            ];
            names.forEach((name) => {
                expect(typeof type[name]).toBe('function');
            });
        });
    });
});
