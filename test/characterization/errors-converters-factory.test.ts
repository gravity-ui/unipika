import {describe, expect, test} from '@jest/globals';

const unipika = require('../..');

const {format, formatRaw, converters} = unipika;

describe('characterization: error handling', () => {
    test('raw converter throws on function input', () => {
        expect(() => {
            formatRaw(() => {}, {asHTML: false});
        }).toThrow('unipika: invalid input - node type "function" is not supported.');
    });

    test('raw converter throws on symbol input', () => {
        expect(() => {
            formatRaw(Symbol('test'), {asHTML: false});
        }).toThrow('unipika: invalid input - node type "symbol" is not supported.');
    });

    test('yson converter throws on invalid $attributes type', () => {
        const node = {
            $value: 'foo',
            $attributes: 'not-an-object',
        };
        expect(() => {
            format(node, {asHTML: false, format: 'json'}, converters.yson);
        }).toThrow('unipika: invalid input - $attributes must be an object instead got "string".');
    });

    test('yson converter throws on invalid $incomplete type', () => {
        const node = {
            $value: 'foo',
            $incomplete: 'not-a-boolean',
        };
        expect(() => {
            format(node, {asHTML: false, format: 'json'}, converters.yson);
        }).toThrow('unipika: invalid input - $attributes must be an object instead got "string".');
    });

    test('yson converter throws on invalid $type type', () => {
        const node = {
            $value: 'foo',
            $type: 42,
        };
        expect(() => {
            format(node, {asHTML: false, format: 'json'}, converters.yson);
        }).toThrow('unipika: invalid input - $type must be a string instead got "number".');
    });

    test('yson converter throws on unsupported $value type (function)', () => {
        const node = {
            $value: () => {},
        };
        expect(() => {
            format(node, {asHTML: false, format: 'json'}, converters.yson);
        }).toThrow('unipika: invalid input - $value type "function" is not supported.');
    });

    test('yql string binary with invalid base64 throws', () => {
        const node = {
            $binary: true,
            $type: 'yql.string',
            $value: 'Not base64-encoded string',
        };
        expect(() => {
            format(node, {asHTML: false, binaryAsHex: true});
        }).toThrow();
    });

    test('yql string binary with invalid base64 throws Error', () => {
        const node = {
            $binary: true,
            $type: 'yql.string',
            $value: 'Not base64-encoded string',
        };
        expect(() => {
            format(node, {asHTML: false, binaryAsHex: false});
        }).toThrow(Error);
    });
});

describe('characterization: converters.raw', () => {
    test('Exports', () => {
        expect(converters.raw).toBeDefined();
    });

    test('isFunction', () => {
        expect(converters.raw).toBeInstanceOf(Function);
    });

    test('null', () => {
        expect(converters.raw(null, {})).toEqual({$type: 'null', $value: null});
    });

    test('boolean true', () => {
        expect(converters.raw(true, {})).toEqual({$type: 'boolean', $value: true});
    });

    test('boolean false', () => {
        expect(converters.raw(false, {})).toEqual({$type: 'boolean', $value: false});
    });

    test('number', () => {
        expect(converters.raw(42, {})).toEqual({$type: 'number', $value: 42});
    });

    test('string', () => {
        expect(converters.raw('hello', {})).toEqual({$type: 'string', $value: 'hello'});
    });

    test('empty array', () => {
        expect(converters.raw([], {})).toEqual({$type: 'list', $value: []});
    });

    test('array of numbers', () => {
        expect(converters.raw([1, 2, 3], {})).toEqual({
            $type: 'list',
            $value: [
                {$type: 'number', $value: 1},
                {$type: 'number', $value: 2},
                {$type: 'number', $value: 3},
            ],
        });
    });

    test('empty object', () => {
        expect(converters.raw({}, {})).toEqual({$type: 'map', $value: []});
    });

    test('object with keys', () => {
        const result = converters.raw({a: 1}, {});
        expect(result.$type).toBe('map');
        expect(result.$value).toHaveLength(1);
        expect(result.$value[0][0]).toEqual({$type: 'string', $value: 'a', $key: true});
        expect(result.$value[0][1]).toEqual({$type: 'number', $value: 1});
    });

    test('object with $attributes key marks as special_key', () => {
        const result = converters.raw({$attributes: 'val'}, {});
        expect(result.$value[0][0].$special_key).toBe(true);
    });

    test('object with $value key marks as special_key', () => {
        const result = converters.raw({$value: 'val'}, {});
        expect(result.$value[0][0].$special_key).toBe(true);
    });

    test('object with $incomplete key marks as special_key', () => {
        const result = converters.raw({$incomplete: 'val'}, {});
        expect(result.$value[0][0].$special_key).toBe(true);
    });

    test('object with $type key marks as special_key', () => {
        const result = converters.raw({$type: 'val'}, {});
        expect(result.$value[0][0].$special_key).toBe(true);
    });

    test('nested object', () => {
        const result = converters.raw({a: {b: 1}}, {});
        expect(result.$type).toBe('map');
        expect(result.$value[0][1].$type).toBe('map');
    });

    test('nested array', () => {
        const result = converters.raw([[1, 2]], {});
        expect(result.$type).toBe('list');
        expect(result.$value[0].$type).toBe('list');
    });

    test('does not mutate original data', () => {
        const original = {a: 1};
        const originalCopy = JSON.parse(JSON.stringify(original));
        converters.raw(original, {});
        expect(original).toEqual(originalCopy);
    });
});

describe('characterization: factory function', () => {
    test('returns object with format', () => {
        expect(unipika.format).toBeDefined();
        expect(unipika.format).toBeInstanceOf(Function);
    });

    test('returns object with formatFromYSON', () => {
        expect(unipika.formatFromYSON).toBeDefined();
        expect(unipika.formatFromYSON).toBeInstanceOf(Function);
    });

    test('returns object with formatFromYQL', () => {
        expect(unipika.formatFromYQL).toBeDefined();
        expect(unipika.formatFromYQL).toBeInstanceOf(Function);
    });

    test('returns object with formatRaw', () => {
        expect(unipika.formatRaw).toBeDefined();
        expect(unipika.formatRaw).toBeInstanceOf(Function);
    });

    test('returns object with formatValue', () => {
        expect(unipika.formatValue).toBeDefined();
        expect(unipika.formatValue).toBeInstanceOf(Function);
    });

    test('returns object with formatKey', () => {
        expect(unipika.formatKey).toBeDefined();
        expect(unipika.formatKey).toBeInstanceOf(Function);
    });

    test('returns object with formatAttributes', () => {
        expect(unipika.formatAttributes).toBeDefined();
        expect(unipika.formatAttributes).toBeInstanceOf(Function);
    });

    test('returns object with converters', () => {
        expect(unipika.converters).toBeDefined();
        expect(unipika.converters.yson).toBeInstanceOf(Function);
        expect(unipika.converters.yql).toBeInstanceOf(Function);
        expect(unipika.converters.raw).toBeInstanceOf(Function);
    });

    test('returns object with utils', () => {
        expect(unipika.utils).toBeDefined();
        expect(unipika.utils.format).toBeDefined();
        expect(unipika.utils.yson).toBeDefined();
        expect(unipika.utils.utf8).toBeDefined();
        expect(unipika.utils.type).toBeDefined();
    });
});
