export type FormatSettings = {
    asHTML?: boolean;
    escapeWhitespace?: boolean;
    highlightControlCharacter?: boolean;
    nonBreakingIndent?: boolean;
    break?: boolean;
    indent?: number;
    compact?: boolean;
    format?: string;
    normalizeUrl?: (url: string) => string;
    limitListLength?: number;
    limitMapLength?: number;
};

export type FormatNode = {
    $type: string;
    $value: unknown;
    $category?: string;
    $incomplete?: boolean | number;
    $original_value?: string;
    $binary?: boolean;
    $key?: boolean;
    $special_key?: boolean;
    $optional?: number;
    [key: symbol]: FormatNode | undefined;
};

/**
 * A scalar value that can be produced by a plugin or passed through the
 * wrapping functions (`wrapScalar`/`wrapComplex`/`wrapOptional`). Includes
 * `string` (the common case), `number`, `boolean`, and `null`.
 */
export type ScalarValue = string | number | boolean | null;

function parseSetting(
    settings: FormatSettings | null | undefined,
    name: string,
    defaultValue: unknown,
): unknown {
    return settings && typeof settings[name as keyof FormatSettings] !== 'undefined'
        ? settings[name as keyof FormatSettings]
        : defaultValue;
}

function returnAsIs(_settings: FormatSettings, value: unknown): unknown {
    return value;
}

// Char utils
function repeatChar(char: string, repeatCount: number): string {
    let string = '';
    for (let i = 0; i < repeatCount; i++) {
        string += char;
    }
    return string;
}

function toPaddedHex(charCode: number, digits: number): string {
    return (repeatChar('0', digits) + charCode.toString(16)).substr(-digits);
}

function toPaddedOctal(charCode: number, digits: number): string {
    return (repeatChar('0', digits) + charCode.toString(8)).substr(-digits);
}

function isControlCharacter(charCode: number): boolean {
    return (charCode < 32 && charCode >= 0) || (charCode >= 0x7f && charCode <= 0x9f);
}

function charIsOctal(char: string): boolean {
    return char >= '0' && char <= '7';
}

function nextCharNotOctal(
    initialString: string,
    initialLength: number,
    currentIndex: number,
): boolean {
    return !(currentIndex < initialLength - 1 && charIsOctal(initialString[currentIndex + 1]));
}

function charIsHex(char: string): boolean {
    return (
        (char >= '0' && char <= '9') || (char >= 'a' && char <= 'f') || (char >= 'A' && char <= 'F')
    );
}

function nextCharNotHex(
    initialString: string,
    initialLength: number,
    currentIndex: number,
): boolean {
    return !(currentIndex < initialLength - 1 && charIsHex(initialString[currentIndex + 1]));
}

// String utils
const JSON = 'json';
const YSON = 'yson';

const EMPTY_STRING = '';
const WHITESPACE = ' ';
const NON_BREAKING_WHITESPACE = '\xa0';
const LINE_FEED = '\n';

// Taken from underscore.js _.escape
const escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;',
};
const unescapeMap = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
    '&#x60;': '`',
};
const createEscaper = function (map: Record<string, string>) {
    const escaper = function (match: string): string {
        return map[match];
    };
    const source = '(?:' + Object.keys(map).join('|') + ')';
    const testRegexp = RegExp(source);
    const replaceRegexp = RegExp(source, 'g');
    return function (string: string | null): string {
        string = string === null ? '' : String(string);
        return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
};
const escape = createEscaper(escapeMap);
const unescape = createEscaper(unescapeMap);

function normalizeUrl(url: string, settings: FormatSettings): string {
    try {
        if (settings.normalizeUrl) {
            return settings.normalizeUrl(url);
        }
        return encodeURI(url);
    } catch (error) {
        console.error('unipika: An error occured during normalizeUrl call', {url}, error);
        return '';
    }
}

function whitespaceNeedsHighlighting(
    initialString: string,
    initialLength: number,
    currentIndex: number,
): boolean {
    if (currentIndex === 0 || currentIndex === initialLength - 1) {
        // Whitespace at the beginning or end of string
        return true;
    }

    if (initialString[currentIndex - 1] === ' ' || initialString[currentIndex + 1] === ' ') {
        // Subsequent whitespaces
        return true;
    }

    return false;
}

function appendHighlightedCharacter(
    char: string,
    asHTML: boolean,
    previousCharHighlighted: boolean,
): string {
    if (asHTML) {
        char = escape(char);

        if (!previousCharHighlighted) {
            char = '<span class="escape">' + char; // Start escaping charachters
        }
    }

    return char;
}

function appendCharacter(char: string, asHTML: boolean, previousCharHighlighted: boolean): string {
    if (asHTML) {
        char = escape(char);

        if (previousCharHighlighted) {
            char = '</span>' + char; // Finish escaping charachers
        }
    }

    return char;
}

function appendDoubleQuote(asHTML: boolean, previousCharHighlighted: boolean): string {
    let char = '"';

    if (asHTML) {
        char = '<span class="quote">' + escape(char) + '</span>';

        if (previousCharHighlighted) {
            char = '</span>' + char; // Finish escaping charachers
        }
    }

    return char;
}

function escapeJSONString(settings: FormatSettings, value: string): string {
    const initialString = value,
        initialLength = value.length,
        asHTML = settings.asHTML ?? false;
    let escapedString = '',
        currentChar: string,
        currentCode: number,
        escapedChar: string,
        previousCharHighlighted = false;

    // Wrap in double quotes
    escapedString += appendDoubleQuote(asHTML, previousCharHighlighted);

    for (let i = 0; i < initialLength; i++) {
        currentChar = initialString.charAt(i);
        currentCode = initialString.charCodeAt(i);

        if (currentChar === '"' || currentChar === '\\') {
            // Escape quotes and backslash
            escapedChar = '\\' + currentChar;
            escapedString += appendCharacter(escapedChar, asHTML, previousCharHighlighted);
            previousCharHighlighted = false;
        } else if (currentChar === '\n' || currentChar === '\t') {
            if (settings.escapeWhitespace) {
                // Escape control characters with simple escape sequences
                const whitespaceEscapes = {
                    '\n': '\\n',
                    '\t': '\\t',
                };
                escapedChar = whitespaceEscapes[currentChar];
                escapedString += appendHighlightedCharacter(
                    escapedChar,
                    asHTML,
                    previousCharHighlighted,
                );
                previousCharHighlighted = true;
            } else {
                escapedString += appendCharacter(currentChar, asHTML, previousCharHighlighted);
                previousCharHighlighted = false;
            }
        } else if (currentChar === '\b' || currentChar === '\f' || currentChar === '\r') {
            // Escape control characters with simple escape sequences
            const controlEscapes = {
                '\b': '\\b',
                '\f': '\\f',
                '\r': '\\r',
            };
            escapedChar = controlEscapes[currentChar];
            escapedString += appendHighlightedCharacter(
                escapedChar,
                asHTML,
                previousCharHighlighted,
            );
            previousCharHighlighted = true;
        } else if (isControlCharacter(currentCode)) {
            // Escape other control characters with unicode escape sequences
            escapedChar = '\\u' + toPaddedHex(currentCode, 4);
            if (settings.highlightControlCharacter) {
                escapedString += appendHighlightedCharacter(
                    escapedChar,
                    asHTML,
                    previousCharHighlighted,
                );
                previousCharHighlighted = true;
            } else {
                escapedString += appendCharacter(escapedChar, asHTML, previousCharHighlighted);
                previousCharHighlighted = false;
            }
        } else if (
            currentChar === ' ' &&
            settings.escapeWhitespace &&
            whitespaceNeedsHighlighting(initialString, initialLength, i)
        ) {
            // Highlight suspicious whitespace
            escapedChar = ' ';
            escapedString += appendHighlightedCharacter(
                escapedChar,
                asHTML,
                previousCharHighlighted,
            );
            previousCharHighlighted = true;
        } else {
            escapedString += appendCharacter(currentChar, asHTML, previousCharHighlighted);
            previousCharHighlighted = false;
        }
    }

    // Wrap in double quotes
    escapedString += appendDoubleQuote(asHTML, previousCharHighlighted);

    return escapedString;
}

function escapeYSONString(settings: FormatSettings, value: string): string {
    const initialString = value,
        initialLength = value.length,
        asHTML = settings.asHTML ?? false;

    let escapedString = '',
        currentChar,
        currentCode,
        escapedChar,
        previousCharHighlighted = false;

    // Wrap in double quotes
    escapedString += appendDoubleQuote(asHTML, previousCharHighlighted);

    for (let i = 0; i < initialLength; i++) {
        currentChar = initialString.charAt(i);
        currentCode = initialString.charCodeAt(i);

        if (currentChar === '"' || currentChar === '\\') {
            // Escape quotes and backslash
            escapedChar = '\\' + currentChar;
            escapedString += appendCharacter(escapedChar, asHTML, previousCharHighlighted);
            previousCharHighlighted = false;
        } else if (currentChar === '\r') {
            // Escape control characters with simple escape sequences
            const carriageEscape = {
                '\r': '\\r',
            };
            escapedChar = carriageEscape[currentChar];
            escapedString += appendHighlightedCharacter(
                escapedChar,
                asHTML,
                previousCharHighlighted,
            );
            previousCharHighlighted = true;
        } else if (currentChar === '\n' || currentChar === '\t') {
            if (settings.escapeWhitespace) {
                // Escape control characters with simple escape sequences
                const whitespaceEscapes = {
                    '\n': '\\n',
                    '\t': '\\t',
                };
                escapedChar = whitespaceEscapes[currentChar];
                escapedString += appendHighlightedCharacter(
                    escapedChar,
                    asHTML,
                    previousCharHighlighted,
                );
                previousCharHighlighted = true;
            } else {
                escapedString += appendCharacter(currentChar, asHTML, previousCharHighlighted);
                previousCharHighlighted = false;
            }
        } else if (currentCode <= 126 && currentCode >= 32) {
            if (
                currentChar === ' ' &&
                settings.escapeWhitespace &&
                whitespaceNeedsHighlighting(initialString, initialLength, i)
            ) {
                // Highlight suspicious whitespace
                escapedChar = ' ';
                escapedString += appendHighlightedCharacter(
                    escapedChar,
                    asHTML,
                    previousCharHighlighted,
                );
                previousCharHighlighted = true;
            } else {
                // Show "as is"
                escapedString += appendCharacter(currentChar, asHTML, previousCharHighlighted);
                previousCharHighlighted = false;
            }
        } else if (
            currentCode < 8 &&
            currentCode >= 0 &&
            nextCharNotOctal(initialString, initialLength, i)
        ) {
            escapedChar = '\\' + toPaddedOctal(currentCode, 1);
            escapedString += appendCharacter(escapedChar, asHTML, previousCharHighlighted);
            previousCharHighlighted = false;
        } else if (nextCharNotHex(initialString, initialLength, i)) {
            escapedChar = '\\x' + toPaddedHex(currentCode, 2);
            escapedString += appendCharacter(escapedChar, asHTML, previousCharHighlighted);
            previousCharHighlighted = false;
        } else {
            escapedChar = '\\' + toPaddedOctal(currentCode, 3);
            escapedString += appendCharacter(escapedChar, asHTML, previousCharHighlighted);
            previousCharHighlighted = false;
        }
    }

    // Wrap in double quotes
    escapedString += appendDoubleQuote(asHTML, previousCharHighlighted);

    return escapedString;
}

function escapeHTMLString(settings: FormatSettings, value: string): string {
    const initialString = value,
        initialLength = value.length,
        asHTML = settings.asHTML ?? false;
    let escapedString = '',
        currentChar;

    // Wrap in double quotes
    escapedString += appendDoubleQuote(asHTML, false);

    for (let i = 0; i < initialLength; i++) {
        currentChar = initialString.charAt(i);
        escapedString += appendCharacter(currentChar, asHTML, false);
    }

    // Wrap in double quotes
    escapedString += appendDoubleQuote(asHTML, false);

    return escapedString;
}

function binaryToHex(settings: FormatSettings, string: string): string {
    return string
        .split(EMPTY_STRING)
        .map(function (char) {
            const charCode = char.charCodeAt(0);

            if (charCode > 255) {
                throw new Error('unipika: input string is not binary.');
            }

            return toPaddedHex(charCode, 2);
        })
        .join(settings.nonBreakingIndent ? NON_BREAKING_WHITESPACE : WHITESPACE);
}

function escapeYSONBinaryString(settings: FormatSettings, value: string): string {
    // String should be utf8-encoded
    return binaryToHex(settings, value);
}

function escapeYQLBinaryString(settings: FormatSettings, value: string): string {
    // TODO add possibility to fail gracefully in case data is corrupted
    return binaryToHex(settings, atob(value));
}

// Formatting utils
const YSON_ATTRIBUTES_START = '<';
const YSON_ATTRIBUTES_END = '>';
const OBJECT_START = '{';
const OBJECT_END = '}';
const ARRAY_START = '[';
const ARRAY_END = ']';

function getIndent(settings: FormatSettings, level: number): string {
    const space = settings.nonBreakingIndent ? NON_BREAKING_WHITESPACE : WHITESPACE;
    return (
        (settings.break ? LINE_FEED : EMPTY_STRING) +
        repeatChar(space, (settings.indent || 0) * level)
    );
}

const JSON_EXPRESSION_TERMINATOR = ',';

function getExpressionTerminator(settings: FormatSettings): string {
    if (settings.format === YSON) {
        return ';';
    } /*if (settings.format === JSON) */ else {
        return ',';
    }
}

const JSON_KEY_VALUE_SEPARATOR = ':' + WHITESPACE;

function getKeyValueSeparator(settings: FormatSettings): string {
    const space = settings.nonBreakingIndent ? NON_BREAKING_WHITESPACE : WHITESPACE;
    if (settings.format === YSON) {
        return space + '=' + space;
    } /*if (settings.format === JSON)*/ else {
        return ':' + space;
    }
}

function getAttributesStart(settings: FormatSettings): string {
    if (settings.format === JSON) {
        return OBJECT_START;
    } else if (settings.format === YSON) {
        return YSON_ATTRIBUTES_START;
    }
    return '';
}

function getAttributesEnd(settings: FormatSettings): string {
    if (settings.format === JSON) {
        return OBJECT_END + getExpressionTerminator(settings);
    } else if (settings.format === YSON) {
        return YSON_ATTRIBUTES_END;
    }
    return '';
}

function drawFullView(weight: number, settings: FormatSettings): boolean {
    return weight > 1 || (weight === 1 && !settings.compact);
}

function drawCompactView(weight: number, settings: FormatSettings): boolean {
    return weight === 1 && Boolean(settings.compact);
}

//from https://www.postgresql.org/docs/current/catalog-pg-type.html#CATALOG-TYPCATEGORY-TABLE
const validCategories = new Set([
    'A',
    'B',
    'C',
    'D',
    'E',
    'G',
    'I',
    'N',
    'P',
    'R',
    'S',
    'T',
    'U',
    'V',
    'X',
    'Z',
]);

function validateCategory(category: string | undefined): boolean {
    if (!category) {
        return false;
    }
    return validCategories.has(category.toUpperCase());
}

function wrapScalar(
    node: FormatNode,
    settings: FormatSettings,
    formattedValue: ScalarValue,
): ScalarValue {
    let className = /*'unipika-' + */ node.$type.replaceAll('.', '_');
    let title = '';

    if (validateCategory(node.$category)) {
        className +=
            WHITESPACE +
            'pg_category_' +
            /*'unipika-' + */ (node.$category as string).toLowerCase();
    }

    if (node.$incomplete) {
        className += WHITESPACE + /*'unipika-' + */ 'incomplete';
    }

    if (node.$binary) {
        className += WHITESPACE + /*'unipika-' + */ 'binary';
    }

    if (node.$key) {
        className += WHITESPACE + /*'unipika-' + */ 'key';
    }

    if (node.$special_key) {
        className += WHITESPACE + /*'unipika-' + */ 'special-key';
    }

    if (node.$incomplete && node.$original_value) {
        title = node.$original_value;
    }

    return settings.asHTML
        ? '<span' +
              (title ? ' title="' + escape(title) + '"' : '') +
              ' class="' +
              className +
              '">' +
              String(formattedValue) +
              '</span>'
        : formattedValue;
}

function wrapComplex(
    node: FormatNode,
    settings: FormatSettings,
    formattedValue: ScalarValue,
): ScalarValue {
    let className = /*'unipika-' + */ '';
    let title = '';

    if (node.$incomplete) {
        className += WHITESPACE + /*'unipika-' + */ 'incomplete';
    }

    if (node.$incomplete && node.$original_value) {
        title = node.$original_value;
    }

    // TODO: remove after https://st.yandex-team.ru/YT-12530
    if (node.$type === 'yql.yson' && node.$incomplete) {
        return settings.asHTML && className
            ? '<span class="' + className + '"></span>'
            : formattedValue;
    }
    //

    return settings.asHTML && className
        ? '<span' +
              (title ? ' title="' + escape(title) + '"' : '') +
              ' class="' +
              className +
              '">' +
              String(formattedValue) +
              '</span>'
        : formattedValue;
}

function wrapOptional(
    node: FormatNode,
    settings: FormatSettings,
    formattedValue: ScalarValue,
    parentKey: symbol,
): ScalarValue {
    if (node.$value !== null) return formattedValue;

    let optionalLevels = node.$optional || 0;
    let parent = node[parentKey];

    while (parent?.$type === 'yql.tagged') {
        if (typeof parent.$optional === 'number' && !Number.isNaN(parent.$optional)) {
            optionalLevels += parent.$optional;
        }
        parent = parent[parentKey];
    }

    if (optionalLevels === 0) return formattedValue;

    const prefix = new Array(optionalLevels).fill('[').join('');
    const suffix = new Array(optionalLevels).fill(']').join('');

    if (settings.asHTML) {
        return (
            '<span class="optional">' +
            prefix +
            '</span>' +
            String(formattedValue) +
            '<span class="optional">' +
            suffix +
            '</span>'
        );
    }

    return prefix + String(formattedValue) + suffix;
}

function unescapeKeyValue(value: unknown): unknown {
    // $$attributes is an escape for $attributes key (not a special key)
    /*
        JSON presentation
        {
            "$$attributes": {
                "hello": "world"
            },
            "$$value": "foo"
        }

        YSON presentation
        {
            "$attributes" = {
                "hello" = "world";
            };
            "$value" = "foo";
        };
    */

    return typeof value === 'string' ? value.replace(/^\$\$/, '$') : value;
}

export {
    parseSetting,
    repeatChar,
    escapeJSONString,
    escapeYSONString,
    escapeHTMLString,
    escapeYSONBinaryString,
    escapeYQLBinaryString,
    unescapeKeyValue,
    returnAsIs,
    escape,
    unescape,
    normalizeUrl,
    getAttributesEnd,
    getAttributesStart,
    getKeyValueSeparator,
    getExpressionTerminator,
    getIndent,
    OBJECT_START,
    OBJECT_END,
    ARRAY_START,
    ARRAY_END,
    YSON_ATTRIBUTES_START,
    YSON_ATTRIBUTES_END,
    JSON_EXPRESSION_TERMINATOR,
    JSON_KEY_VALUE_SEPARATOR,
    EMPTY_STRING,
    WHITESPACE,
    NON_BREAKING_WHITESPACE,
    LINE_FEED,
    JSON,
    YSON,
    drawFullView,
    drawCompactView,
    wrapScalar,
    wrapComplex,
    wrapOptional,
    // Exports for unit testing
    toPaddedHex,
    toPaddedOctal,
    binaryToHex,
};
