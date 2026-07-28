// Type declarations for the vendored utf8.js (Mathias Bynens utf8.js v2.1.2
// with a local `allowTruncatedEnd` patch — see vendor/utf8.js).
//
// This is a temporary hand-written declaration for the vendored copy. It is
// NOT the npm `@types/utf8` package: the vendored `decode` accepts an options
// object with `allowTruncatedEnd`, which the upstream npm package does not.
//
// Structured as a real module (not an ambient `declare module`) so that the
// relative import `require('../../vendor/utf8')` in lib/utils/utf8.js resolves
// to this sibling declaration file.

export type Utf8DecodeOptions = {
    /**
     * When `true`, a truncated multibyte sequence at the end of the input
     * is dropped gracefully (the partial code point is omitted) instead of
     * throwing `Error('Invalid byte index')`. Genuinely invalid bytes still
     * throw. Used by the yson converter for `$incomplete` strings.
     */
    allowTruncatedEnd?: boolean;
};

export function encode(string: string): string;
export function decode(byteString: string, options?: Utf8DecodeOptions): string;

export const version: string;
