// Based on https://gist.github.com/jonbretman/7259628

export function type(o) {
    // handle corner cases for old IE and PhantomJS
    if (o === undefined) {
        return 'undefined';
    }

    if (o === null) {
        return 'null';
    }

    // handle DOM elements
    if (o && (o.nodeType === 1 || o.nodeType === 9)) {
        return 'element';
    }

    const s = Object.prototype.toString.call(o);
    const result = s.substring('[object '.length, s.length - 1).toLowerCase();

    // handle NaN and Infinity
    if (result === 'number') {
        if (isNaN(o)) {
            return 'nan';
        }

        if (!isFinite(o)) {
            return 'infinity';
        }
    }

    return result;
}

function isNull(o) {
    return type(o) === 'null';
}

function isUndefined(o) {
    return type(o) === 'undefined';
}

function isObject(o) {
    return type(o) === 'object';
}

function isArray(o) {
    return type(o) === 'array';
}

function isString(o) {
    return type(o) === 'string';
}

function isNumber(o) {
    return type(o) === 'number';
}

function isBoolean(o) {
    return type(o) === 'boolean';
}

function isFunction(o) {
    return type(o) === 'function';
}

function isRegExp(o) {
    return type(o) === 'regexp';
}

function isElement(o) {
    return type(o) === 'element';
}

function isNaNType(o) {
    return type(o) === 'nan';
}

// NOTE: isInfinite checks against 'infinite' (not 'infinity'), matching the
// original generated behavior — a latent bug preserved for runtime parity.
function isInfinite(o) {
    return type(o) === 'infinite';
}

function isSymbol(o) {
    return type(o) === 'symbol';
}

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
