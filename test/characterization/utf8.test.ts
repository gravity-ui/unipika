import {describe, expect, test} from '@jest/globals';

const unipika = require('../..');

const utf8 = unipika.utils.utf8;

// Helpers to build strings from raw byte values (each byte as a char code unit).
function bytes(...codes: number[]): string {
    return codes.map((c) => String.fromCharCode(c)).join('');
}

describe('characterization: utils.utf8 surface', () => {
    test('exposes encode and decode functions', () => {
        expect(typeof utf8.encode).toBe('function');
        expect(typeof utf8.decode).toBe('function');
    });
});

describe('characterization: utils.utf8.encode', () => {
    test('empty string round-trips', () => {
        expect(utf8.encode('')).toBe('');
    });

    test('ascii is unchanged by encode', () => {
        expect(utf8.encode('hello')).toBe('hello');
    });

    test('2-byte code point U+00A9 (©) encodes to 0xC2 0xA9', () => {
        expect(utf8.encode(String.fromCharCode(0xa9))).toBe(bytes(0xc2, 0xa9));
    });

    test('3-byte code point U+4E2D (中) encodes to 0xE4 0xB8 0xAD', () => {
        expect(utf8.encode(String.fromCharCode(0x4e2d))).toBe(bytes(0xe4, 0xb8, 0xad));
    });

    test('4-byte code point U+1F600 encodes to 0xF0 0x9F 0x98 0x80', () => {
        // U+1F600 as a surrogate pair: 0xD83D 0xDE00
        expect(utf8.encode(String.fromCharCode(0xd83d, 0xde00))).toBe(
            bytes(0xf0, 0x9f, 0x98, 0x80),
        );
    });

    test('mixed ascii + multibyte encodes byte-for-byte', () => {
        // 'a' + 中 + 'b'
        expect(utf8.encode('a' + String.fromCharCode(0x4e2d) + 'b')).toBe(
            bytes(0x61, 0xe4, 0xb8, 0xad, 0x62),
        );
    });

    test('encode throws on a lone high surrogate (U+D800)', () => {
        expect(() => {
            utf8.encode(String.fromCharCode(0xd800));
        }).toThrow(/surrogate/i);
    });

    test('encode throws on a lone low surrogate (U+DC00)', () => {
        expect(() => {
            utf8.encode(String.fromCharCode(0xdc00));
        }).toThrow(/surrogate/i);
    });
});

describe('characterization: utils.utf8.decode (no options)', () => {
    test('empty string round-trips', () => {
        expect(utf8.decode('')).toBe('');
    });

    test('ascii is unchanged by decode', () => {
        expect(utf8.decode('hello')).toBe('hello');
    });

    test('decodes a 3-byte sequence back to the original code point', () => {
        expect(utf8.decode(bytes(0xe4, 0xb8, 0xad))).toBe(
            String.fromCharCode(0x4e2d),
        );
    });

    test('decodes a 4-byte sequence back to the original code point', () => {
        expect(utf8.decode(bytes(0xf0, 0x9f, 0x98, 0x80))).toBe(
            String.fromCharCode(0xd83d, 0xde00),
        );
    });

    test('throws "Invalid byte index" on a truncated 3-byte sequence (1 byte)', () => {
        expect(() => {
            utf8.decode(bytes(0xe4));
        }).toThrow('Invalid byte index');
    });

    test('throws "Invalid byte index" on a truncated 3-byte sequence (2 bytes)', () => {
        expect(() => {
            utf8.decode(bytes(0xe4, 0xb8));
        }).toThrow('Invalid byte index');
    });

    test('throws "Invalid byte index" on a truncated 2-byte sequence (1 byte)', () => {
        expect(() => {
            utf8.decode(bytes(0xc2));
        }).toThrow('Invalid byte index');
    });

    test('throws "Invalid byte index" on a truncated 4-byte sequence (1 byte)', () => {
        expect(() => {
            utf8.decode(bytes(0xf0));
        }).toThrow('Invalid byte index');
    });

    test('throws "Invalid byte index" on a truncated 4-byte sequence (3 bytes)', () => {
        expect(() => {
            utf8.decode(bytes(0xf0, 0x9f, 0x98));
        }).toThrow('Invalid byte index');
    });

    test('throws "Invalid UTF-8 detected" on an invalid byte 0xFF', () => {
        expect(() => {
            utf8.decode(bytes(0xff));
        }).toThrow('Invalid UTF-8 detected');
    });
});

describe('characterization: utils.utf8.decode with allowTruncatedEnd', () => {
    test('empty string round-trips with allowTruncatedEnd', () => {
        expect(utf8.decode('', {allowTruncatedEnd: true})).toBe('');
    });

    test('ascii is unchanged with allowTruncatedEnd', () => {
        expect(utf8.decode('hello', {allowTruncatedEnd: true})).toBe('hello');
    });

    test('full 3-byte sequence decodes normally with allowTruncatedEnd', () => {
        expect(utf8.decode(bytes(0xe4, 0xb8, 0xad), {allowTruncatedEnd: true})).toBe(
            String.fromCharCode(0x4e2d),
        );
    });

    test('truncated 3-byte sequence (1 byte) returns "" instead of throwing', () => {
        expect(utf8.decode(bytes(0xe4), {allowTruncatedEnd: true})).toBe('');
    });

    test('truncated 3-byte sequence (2 bytes) returns "" instead of throwing', () => {
        expect(utf8.decode(bytes(0xe4, 0xb8), {allowTruncatedEnd: true})).toBe('');
    });

    test('truncated 2-byte sequence (1 byte) returns "" instead of throwing', () => {
        expect(utf8.decode(bytes(0xc2), {allowTruncatedEnd: true})).toBe('');
    });

    test('truncated 4-byte sequence (1 byte) returns "" instead of throwing', () => {
        expect(utf8.decode(bytes(0xf0), {allowTruncatedEnd: true})).toBe('');
    });

    test('truncated 4-byte sequence (2 bytes) returns "" instead of throwing', () => {
        expect(utf8.decode(bytes(0xf0, 0x9f), {allowTruncatedEnd: true})).toBe('');
    });

    test('truncated 4-byte sequence (3 bytes) returns "" instead of throwing', () => {
        expect(utf8.decode(bytes(0xf0, 0x9f, 0x98), {allowTruncatedEnd: true})).toBe('');
    });

    test('valid prefix before a truncated tail is preserved', () => {
        // 'a' (0x61) + truncated 3-byte (0xE4) -> "a"
        expect(utf8.decode(bytes(0x61, 0xe4), {allowTruncatedEnd: true})).toBe('a');
    });

    test('allowTruncatedEnd does NOT swallow genuinely invalid bytes', () => {
        // 0xFF is not a truncated continuation, it is an invalid leading byte.
        expect(() => {
            utf8.decode(bytes(0xff), {allowTruncatedEnd: true});
        }).toThrow('Invalid UTF-8 detected');
    });

    test('allowTruncatedEnd: false behaves like no options (throws on truncation)', () => {
        expect(() => {
            utf8.decode(bytes(0xe4), {allowTruncatedEnd: false});
        }).toThrow('Invalid byte index');
    });
});

describe('characterization: utils.utf8 round-trip', () => {
    test('ascii round-trips', () => {
        const s = 'hello world';
        expect(utf8.decode(utf8.encode(s))).toBe(s);
    });

    test('multibyte round-trips', () => {
        const s = 'a' + String.fromCharCode(0x4e2d) + 'b';
        expect(utf8.decode(utf8.encode(s))).toBe(s);
    });

    test('astral (4-byte) round-trips', () => {
        const s = String.fromCharCode(0xd83d, 0xde00);
        expect(utf8.decode(utf8.encode(s))).toBe(s);
    });
});

describe('characterization: yson converter uses allowTruncatedEnd for $incomplete', () => {
    const {converters} = unipika;

    test('truncated multibyte string WITH $incomplete gets a partial decoded value (not binary)', () => {
        // A 3-byte UTF-8 char (中 = E4 B8 AD) truncated to the first byte only.
        // With the vendored allowTruncatedEnd patch, decode does not throw; the
        // converter sets $decoded_value to the partial decode ("") and does NOT
        // mark the node as $binary. This is the behavior the patch exists for.
        const node = {
            $value: bytes(0xe4),
            $incomplete: true,
        };
        const result = converters.yson(node, {asHTML: false, format: 'json'});
        expect(result.$binary).toBeUndefined();
        expect(result.$decoded_value).toBe('');
        expect(result.$incomplete).toBe(true);
    });

    test('truncated multibyte string WITHOUT $incomplete is marked as $binary', () => {
        // Without $incomplete, allowTruncatedEnd is false, so decode throws.
        // The converter catches the error and marks the node as $binary instead
        // of producing a $decoded_value. This is the contrast that proves the
        // allowTruncatedEnd patch changes observable runtime behavior.
        const node = {
            $value: bytes(0xe4),
        };
        const result = converters.yson(node, {asHTML: false, format: 'json'});
        expect(result.$binary).toBe(true);
        expect(result.$decoded_value).toBeUndefined();
    });

    test('full multibyte string WITH $incomplete decodes to the full character', () => {
        const node = {
            $value: bytes(0xe4, 0xb8, 0xad),
            $incomplete: true,
        };
        const result = converters.yson(node, {asHTML: false, format: 'json'});
        expect(result.$binary).toBeUndefined();
        expect(result.$decoded_value).toBe(String.fromCharCode(0x4e2d));
    });
});
