(function () {
    'use strict';

    function parseSetting(settings, name, defaultValue) {
        return settings && typeof settings[name] !== 'undefined' ? settings[name] : defaultValue;
    }

    function returnAsIs(settings, value) {
        return value;
    }

    // Char utils
    function repeatChar(char, repeatCount) {
        let string = '';
        for (let i = 0; i < repeatCount; i++) {
            string += char;
        }
        return string;
    }

    function toPaddedHex(charCode, digits) {
        return (repeatChar('0', digits) + charCode.toString(16)).substr(-digits);
    }

    function toPaddedOctal(charCode, digits) {
        return (repeatChar('0', digits) + charCode.toString(8)).substr(-digits);
    }

    function isControlCharacter(charCode) {
        return (charCode < 32 && charCode >= 0) || (charCode >= 0x7f && charCode <= 0x9f);
    }

    function charIsOctal(char) {
        return char >= '0' && char <= '7';
    }

    function nextCharNotOctal(initialString, initialLength, currentIndex) {
        return !(currentIndex < initialLength - 1 && charIsOctal(initialString[currentIndex + 1]));
    }

    function charIsHex(char) {
        return (
            (char >= '0' && char <= '9') ||
            (char >= 'a' && char <= 'f') ||
            (char >= 'A' && char <= 'F')
        );
    }

    function nextCharNotHex(initialString, initialLength, currentIndex) {
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
    const createEscaper = function (map) {
        const escaper = function (match) {
            return map[match];
        };
        const source = '(?:' + Object.keys(map).join('|') + ')';
        const testRegexp = RegExp(source);
        const replaceRegexp = RegExp(source, 'g');
        return function (string) {
            string = string === null ? '' : String(string);
            return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
        };
    };
    const escape = createEscaper(escapeMap);
    const unescape = createEscaper(unescapeMap);

    function normalizeUrl(url, settings) {
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

    function whitespaceNeedsHighlighting(initialString, initialLength, currentIndex) {
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

    function appendHighlightedCharacter(char, asHTML, previousCharHighlighted) {
        if (asHTML) {
            char = escape(char);

            if (!previousCharHighlighted) {
                char = '<span class="escape">' + char; // Start escaping charachters
            }
        }

        return char;
    }

    function appendCharacter(char, asHTML, previousCharHighlighted) {
        if (asHTML) {
            char = escape(char);

            if (previousCharHighlighted) {
                char = '</span>' + char; // Finish escaping charachers
            }
        }

        return char;
    }

    function appendDoubleQuote(asHTML, previousCharHighlighted) {
        let char = '"';

        if (asHTML) {
            char = '<span class="quote">' + escape(char) + '</span>';

            if (previousCharHighlighted) {
                char = '</span>' + char; // Finish escaping charachers
            }
        }

        return char;
    }

    function escapeJSONString(settings, value) {
        const initialString = value,
            initialLength = value.length,
            asHTML = settings.asHTML;
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
            } else if (currentChar === '\n' || currentChar === '\t') {
                if (settings.escapeWhitespace) {
                    // Escape control characters with simple escape sequences
                    escapedChar = {
                        '\n': '\\n',
                        '\t': '\\t',
                    }[currentChar];
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
                escapedChar = {
                    '\b': '\\b',
                    '\f': '\\f',
                    '\r': '\\r',
                }[currentChar];
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

    function escapeYSONString(settings, value) {
        const initialString = value,
            initialLength = value.length,
            asHTML = settings.asHTML;

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
                escapedChar = {
                    '\r': '\\r',
                }[currentChar];
                escapedString += appendHighlightedCharacter(
                    escapedChar,
                    asHTML,
                    previousCharHighlighted,
                );
                previousCharHighlighted = true;
            } else if (currentChar === '\n' || currentChar === '\t') {
                if (settings.escapeWhitespace) {
                    // Escape control characters with simple escape sequences
                    escapedChar = {
                        '\n': '\\n',
                        '\t': '\\t',
                    }[currentChar];
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

    function escapeHTMLString(settings, value) {
        const initialString = value,
            initialLength = value.length,
            asHTML = settings.asHTML;
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

    function binaryToHex(settings, string) {
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

    function escapeYSONBinaryString(settings, value) {
        // String should be utf8-encoded
        return binaryToHex(settings, value);
    }

    function escapeYQLBinaryString(settings, value) {
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

    function getIndent(settings, level) {
        const space = settings.nonBreakingIndent ? NON_BREAKING_WHITESPACE : WHITESPACE;
        return (
            (settings.break ? LINE_FEED : EMPTY_STRING) + repeatChar(space, settings.indent * level)
        );
    }

    const JSON_EXPRESSION_TERMINATOR = ',';

    function getExpressionTerminator(settings) {
        if (settings.format === YSON) {
            return ';';
        } /*if (settings.format === JSON) */ else {
            return ',';
        }
    }

    const JSON_KEY_VALUE_SEPARATOR = ':' + WHITESPACE;

    function getKeyValueSeparator(settings) {
        const space = settings.nonBreakingIndent ? NON_BREAKING_WHITESPACE : WHITESPACE;
        if (settings.format === YSON) {
            return space + '=' + space;
        } /*if (settings.format === JSON)*/ else {
            return ':' + space;
        }
    }

    function getAttributesStart(settings) {
        if (settings.format === JSON) {
            return OBJECT_START;
        } else if (settings.format === YSON) {
            return YSON_ATTRIBUTES_START;
        }
    }

    function getAttributesEnd(settings) {
        if (settings.format === JSON) {
            return OBJECT_END + getExpressionTerminator(settings);
        } else if (settings.format === YSON) {
            return YSON_ATTRIBUTES_END;
        }
    }

    function drawFullView(weight, settings) {
        return weight > 1 || (weight === 1 && !settings.compact);
    }

    function drawCompactView(weight, settings) {
        return weight === 1 && settings.compact;
    }

    function wrapScalar(node, settings, formattedValue) {
        let className = /*'unipika-' + */ node.$type.replace('.', '_');
        let title = '';

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
                  formattedValue +
                  '</span>'
            : formattedValue;
    }

    function wrapComplex(node, settings, formattedValue) {
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
                  formattedValue +
                  '</span>'
            : formattedValue;
    }

    function wrapOptional(node, settings, formattedValue) {
        if (node.$optional > 0 && node.$value === null) {
            const prefix = new Array(node.$optional).fill('[').join('');
            const suffix = new Array(node.$optional).fill(']').join('');
            if (settings.asHTML) {
                return (
                    '<span class="optional">' +
                    prefix +
                    '</span>' +
                    formattedValue +
                    '<span class="optional">' +
                    suffix +
                    '</span>'
                );
            } else {
                return prefix + formattedValue + suffix;
            }
        } else {
            return formattedValue;
        }
    }

    function unescapeKeyValue(value) {
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

    module.exports = {
        parseSetting: parseSetting,
        repeatChar: repeatChar,
        escapeJSONString: escapeJSONString,
        escapeYSONString: escapeYSONString,
        escapeHTMLString: escapeHTMLString,
        escapeYSONBinaryString: escapeYSONBinaryString,
        escapeYQLBinaryString: escapeYQLBinaryString,
        unescapeKeyValue: unescapeKeyValue,
        returnAsIs: returnAsIs,
        escape: escape,
        unescape: unescape,

        normalizeUrl,

        getAttributesEnd: getAttributesEnd,
        getAttributesStart: getAttributesStart,
        getKeyValueSeparator: getKeyValueSeparator,
        getExpressionTerminator: getExpressionTerminator,
        getIndent: getIndent,

        OBJECT_START: OBJECT_START,
        OBJECT_END: OBJECT_END,
        ARRAY_START: ARRAY_START,
        ARRAY_END: ARRAY_END,
        YSON_ATTRIBUTES_START: YSON_ATTRIBUTES_START,
        YSON_ATTRIBUTES_END: YSON_ATTRIBUTES_END,

        JSON_EXPRESSION_TERMINATOR: JSON_EXPRESSION_TERMINATOR,
        JSON_KEY_VALUE_SEPARATOR: JSON_KEY_VALUE_SEPARATOR,

        EMPTY_STRING: EMPTY_STRING,
        WHITESPACE: WHITESPACE,
        NON_BREAKING_WHITESPACE: NON_BREAKING_WHITESPACE,
        LINE_FEED: LINE_FEED,

        JSON: JSON,
        YSON: YSON,

        drawFullView: drawFullView,
        drawCompactView: drawCompactView,
        wrapScalar: wrapScalar,
        wrapComplex: wrapComplex,
        wrapOptional: wrapOptional,

        // Exports for unit testing
        toPaddedHex: toPaddedHex,
        toPaddedOctal: toPaddedOctal,
        binaryToHex: binaryToHex,
    };
})();
