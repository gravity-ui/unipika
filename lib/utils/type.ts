// Based on https://gist.github.com/jonbretman/7257628

type TypeString =
    | 'undefined'
    | 'null'
    | 'element'
    | 'object'
    | 'array'
    | 'string'
    | 'number'
    | 'boolean'
    | 'function'
    | 'regexp'
    | 'nan'
    | 'infinity'
    | 'symbol';

export function type(o: unknown): TypeString {
    // handle corner cases for old IE and PhantomJS
    if (o === undefined) {
        return 'undefined';
    }

    if (o === null) {
        return 'null';
    }

    // handle DOM elements
    if (
        o &&
        ((o as {nodeType?: number}).nodeType === 1 || (o as {nodeType?: number}).nodeType === 9)
    ) {
        return 'element';
    }

    const s = Object.prototype.toString.call(o);
    const result = s.substring('[object '.length, s.length - 1).toLowerCase();

    // handle NaN and Infinity
    if (result === 'number') {
        if (isNaN(o as number)) {
            return 'nan';
        }

        if (!isFinite(o as number)) {
            return 'infinity';
        }
    }

    return result as TypeString;
}

// Explicit is* methods (replacing the former generateMethod loop).
// Each checks type(o) against the lowercased type name.

export function isNull(o: unknown): boolean {
    return type(o) === 'null';
}

export function isUndefined(o: unknown): boolean {
    return type(o) === 'undefined';
}

export function isObject(o: unknown): boolean {
    return type(o) === 'object';
}

export function isArray(o: unknown): boolean {
    return type(o) === 'array';
}

export function isString(o: unknown): boolean {
    return type(o) === 'string';
}

export function isNumber(o: unknown): boolean {
    return type(o) === 'number';
}

export function isBoolean(o: unknown): boolean {
    return type(o) === 'boolean';
}

export function isFunction(o: unknown): boolean {
    return type(o) === 'function';
}

export function isRegExp(o: unknown): boolean {
    return type(o) === 'regexp';
}

export function isElement(o: unknown): boolean {
    return type(o) === 'element';
}

export function isNaNType(o: unknown): boolean {
    return type(o) === 'nan';
}

// NOTE: isInfinite checks against 'infinite' (not 'infinity'), matching the
// original generated behavior — a latent bug preserved for runtime parity.
// The comparison is cast to `string` to avoid TS flagging the dead branch.
export function isInfinite(o: unknown): boolean {
    return (type(o) as string) === 'infinite';
}

export function isSymbol(o: unknown): boolean {
    return type(o) === 'symbol';
}

// Attach is* methods to the type function, preserving the original
// `type.isString`, `type.isNumber`, etc. access pattern (part of the public
// `utils.type` export surface exposed via index.ts).
type.isString = isString;
type.isNumber = isNumber;
type.isBoolean = isBoolean;
type.isFunction = isFunction;
type.isObject = isObject;
type.isArray = isArray;
type.isRegExp = isRegExp;
type.isElement = isElement;
type.isNull = isNull;
type.isUndefined = isUndefined;
type.isSymbol = isSymbol;
type.isNaN = isNaNType;
type.isInfinite = isInfinite;
