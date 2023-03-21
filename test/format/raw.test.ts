/* global chai, describe, it, beforeEach */
var assert = chai.assert;

function stringifyOrEmpty(obj) {
    return obj !== undefined ? ' ' + JSON.stringify(obj) : '';
}

describe('format', function () {
    var _serialize = unipika.formatRaw;

    function runTestCases(io, format, settings) {
        io.forEach(function (output, input) {
            it('Gives correct output for: ' + JSON.stringify(input) + stringifyOrEmpty(settings), function () {
                assert.strictEqual(output[format].plain, testUtils.toPlainText(_serialize, input, format, settings));
                assert.strictEqual(output[format].html, testUtils.toHTMLText(_serialize, input, format, settings));
            });
        });
    }

    describe('formatRaw', function () {
        it('Exports', function () {
            assert.isDefined(_serialize);
        });

        it('isFunction', function () {
            assert.isFunction(_serialize);
        });

        describe('Test plain and html output', function () {
            var io = new Map();

            // Support for $incomplete
            io.set({ $incomplete: true, $value: 'Foo' }, {
                json: {
                    plain: '{"$incomplete": true,"$value": "Foo"}',
                    html: '{<span class="string special-key"><span class="quote">&quot;</span>$incomplete<span class="quote">&quot;</span></span>: <span class="boolean">true</span>,<span class="string special-key"><span class="quote">&quot;</span>$value<span class="quote">&quot;</span></span>: <span class="string"><span class="quote">&quot;</span>Foo<span class="quote">&quot;</span></span>}'
                }
            });

            io.set({ $attributes: { bar: 'baz' }, $incomplete: true, $value: 'Foo' }, {
                json: {
                    plain: '{"$attributes": {"bar": "baz"},"$incomplete": true,"$value": "Foo"}',
                    html: '{<span class="string special-key"><span class="quote">&quot;</span>$attributes<span class="quote">&quot;</span></span>: {<span class="string key"><span class="quote">&quot;</span>bar<span class="quote">&quot;</span></span>: <span class="string"><span class="quote">&quot;</span>baz<span class="quote">&quot;</span></span>},<span class="string special-key"><span class="quote">&quot;</span>$incomplete<span class="quote">&quot;</span></span>: <span class="boolean">true</span>,<span class="string special-key"><span class="quote">&quot;</span>$value<span class="quote">&quot;</span></span>: <span class="string"><span class="quote">&quot;</span>Foo<span class="quote">&quot;</span></span>}'
                }
            });

            io.set({ $attributes: {}, $incomplete: true, $value: 'Foo' }, {
                json: {
                    plain: '{"$attributes": {},"$incomplete": true,"$value": "Foo"}',
                    html: '{<span class="string special-key"><span class="quote">&quot;</span>$attributes<span class="quote">&quot;</span></span>: {},<span class="string special-key"><span class="quote">&quot;</span>$incomplete<span class="quote">&quot;</span></span>: <span class="boolean">true</span>,<span class="string special-key"><span class="quote">&quot;</span>$value<span class="quote">&quot;</span></span>: <span class="string"><span class="quote">&quot;</span>Foo<span class="quote">&quot;</span></span>}'
                }
            });

            // Support for $type
            io.set({ $type: 'boolean', $value: 'true' }, {
                json: {
                    plain: '{"$type": "boolean","$value": "true"}',
                    html: '{<span class="string special-key"><span class="quote">&quot;</span>$type<span class="quote">&quot;</span></span>: <span class="string"><span class="quote">&quot;</span>boolean<span class="quote">&quot;</span></span>,<span class="string special-key"><span class="quote">&quot;</span>$value<span class="quote">&quot;</span></span>: <span class="string"><span class="quote">&quot;</span>true<span class="quote">&quot;</span></span>}'
                }
            });

            io.set({ $type: 'boolean', $value: 'false' }, {
                json: {
                    plain: '{"$type": "boolean","$value": "false"}',
                    html: '{<span class="string special-key"><span class="quote">&quot;</span>$type<span class="quote">&quot;</span></span>: <span class="string"><span class="quote">&quot;</span>boolean<span class="quote">&quot;</span></span>,<span class="string special-key"><span class="quote">&quot;</span>$value<span class="quote">&quot;</span></span>: <span class="string"><span class="quote">&quot;</span>false<span class="quote">&quot;</span></span>}'
                }
            });

            io.set({ $type: 'int64', $value: '42' }, {
                json: {
                    plain: '{"$type": "int64","$value": "42"}',
                    html: '{<span class="string special-key"><span class="quote">&quot;</span>$type<span class="quote">&quot;</span></span>: <span class="string"><span class="quote">&quot;</span>int64<span class="quote">&quot;</span></span>,<span class="string special-key"><span class="quote">&quot;</span>$value<span class="quote">&quot;</span></span>: <span class="string"><span class="quote">&quot;</span>42<span class="quote">&quot;</span></span>}'
                }
            });

            io.set({ $type: 'uint64', $value: '42' }, {
                json: {
                    plain: '{"$type": "uint64","$value": "42"}',
                    html: '{<span class="string special-key"><span class="quote">&quot;</span>$type<span class="quote">&quot;</span></span>: <span class="string"><span class="quote">&quot;</span>uint64<span class="quote">&quot;</span></span>,<span class="string special-key"><span class="quote">&quot;</span>$value<span class="quote">&quot;</span></span>: <span class="string"><span class="quote">&quot;</span>42<span class="quote">&quot;</span></span>}'
                }
            });

            io.set({ $type: 'double', $value: '3.14' }, {
                json: {
                    plain: '{"$type": "double","$value": "3.14"}',
                    html: '{<span class="string special-key"><span class="quote">&quot;</span>$type<span class="quote">&quot;</span></span>: <span class="string"><span class="quote">&quot;</span>double<span class="quote">&quot;</span></span>,<span class="string special-key"><span class="quote">&quot;</span>$value<span class="quote">&quot;</span></span>: <span class="string"><span class="quote">&quot;</span>3.14<span class="quote">&quot;</span></span>}'
                }
            });

            // Strings
            io.set('Foo', {
                json: {
                    plain: '"Foo"',
                    html: '<span class="string">' +
                    '<span class="quote">&quot;</span>' +
                    'Foo' +
                    '<span class="quote">&quot;</span>' +
                    '</span>'
                }
            });
            // 0 - 7
            io.set('\x00\x01\x02\x03\x04\x05\x06\x07', {
                json: {
                    plain: '"\\u0000\\u0001\\u0002\\u0003\\u0004\\u0005\\u0006\\u0007"',
                    html: '<span class="string">' +
                    '<span class="quote">&quot;</span>' +
                    '\\u0000\\u0001\\u0002\\u0003\\u0004\\u0005\\u0006\\u0007' +
                    '<span class="quote">&quot;</span>' +
                    '</span>'
                }
            });
            // 8 - 15
            io.set('\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f', {
                json: {
                    plain: '"\\b\\t\\n\\u000b\\f\\r\\u000e\\u000f"',
                    html: '<span class="string">' +
                    '<span class="quote">&quot;</span>' +
                    '<span class="escape">\\b\\t\\n</span>\\u000b<span class="escape">\\f\\r</span>\\u000e\\u000f' +
                    '<span class="quote">&quot;</span>' +
                    '</span>'
                }
            });
            // 16 - 23
            io.set('\x10\x11\x12\x13\x14\x15\x16\x17', {
                json: {
                    plain: '"\\u0010\\u0011\\u0012\\u0013\\u0014\\u0015\\u0016\\u0017"',
                    html: '<span class="string">' +
                    '<span class="quote">&quot;</span>' +
                    '\\u0010\\u0011\\u0012\\u0013\\u0014\\u0015\\u0016\\u0017' +
                    '<span class="quote">&quot;</span>' +
                    '</span>'
                }
            });
            // 24 - 31
            io.set('\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f', {
                json: {
                    plain: '"\\u0018\\u0019\\u001a\\u001b\\u001c\\u001d\\u001e\\u001f"',
                    html: '<span class="string">' +
                    '<span class="quote">&quot;</span>' +
                    '\\u0018\\u0019\\u001a\\u001b\\u001c\\u001d\\u001e\\u001f' +
                    '<span class="quote">&quot;</span>' +
                    '</span>'
                }
            });

            // Short escapes
            io.set('\b\f\n\r\t\v\0', {
                json: {
                    plain: '"\\b\\f\\n\\r\\t\\u000b\\u0000"',
                    html: '<span class="string">' +
                    '<span class="quote">&quot;</span>' +
                    '<span class="escape">\\b\\f\\n\\r\\t</span>\\u000b\\u0000' +
                    '<span class="quote">&quot;</span>' +
                    '</span>'
                }
            });

            // C-escape specifics
            io.set('\u00000 \u000ba \u0000 \u000b', {
                json: {
                    plain: '"\\u00000 \\u000ba \\u0000 \\u000b"',
                    html: '<span class="string">' +
                    '<span class="quote">&quot;</span>' +
                    '\\u00000 \\u000ba \\u0000 \\u000b' +
                    '<span class="quote">&quot;</span>' +
                    '</span>'
                }
            });

            // Escape quotes and backslashes
            io.set('"', {
                json: {
                    plain: '"\\""',
                    html: '<span class="string">' +
                    '<span class="quote">&quot;</span>' +
                    '\\&quot;' +
                    '<span class="quote">&quot;</span>' +
                    '</span>'
                }
            });

            io.set('\\', {
                json: {
                    plain: '"\\\\"',
                    html: '<span class="string">' +
                    '<span class="quote">&quot;</span>' +
                    '\\\\' +
                    '<span class="quote">&quot;</span>' +
                    '</span>'
                }
            });

            // Boolean
            io.set(true, {
                json: {
                    plain: 'true',
                    html: '<span class="boolean">true</span>'
                }
            });

            io.set(false, {
                json: {
                    plain: 'false',
                    html: '<span class="boolean">false</span>'
                }
            });

            // Number
            io.set(42, {
                json: {
                    plain: '42',
                    html: '<span class="number">42</span>'
                }
            });

            // Null/Entity
            io.set(null, {
                json: {
                    plain: 'null',
                    html: '<span class="null">null</span>'
                }
            });

            // List
            io.set([1, 2, 3], {
                json: {
                    plain: '[1,2,3]',
                    html: '[<span class="number">1</span>,<span class="number">2</span>,<span class="number">3</span>]'
                }
            });

            io.set([42], {
                json: {
                    plain: '[42]',
                    html: '[<span class="number">42</span>]'
                }
            });

            io.set([], {
                json: {
                    plain: '[]',
                    html: '[]'
                }
            });

            // Map
            io.set({ foo: 'bar' }, {
                json: {
                    plain: '{"foo": "bar"}',
                    html: '{<span class="string key"><span class="quote">&quot;</span>foo<span class="quote">&quot;</span></span>: <span class="string"><span class="quote">&quot;</span>bar<span class="quote">&quot;</span></span>}'
                }
            });

// Sorted keys
            io.set({ c: 'car', b: 'butterfly',  a: 'apple' }, {
                json: {
                    plain: '{"a": "apple","b": "butterfly","c": "car"}',
                    html: '{<span class="string key"><span class="quote">&quot;</span>a<span class="quote">&quot;</span></span>: <span class="string"><span class="quote">&quot;</span>apple<span class="quote">&quot;</span></span>,<span class="string key"><span class="quote">&quot;</span>b<span class="quote">&quot;</span></span>: <span class="string"><span class="quote">&quot;</span>butterfly<span class="quote">&quot;</span></span>,<span class="string key"><span class="quote">&quot;</span>c<span class="quote">&quot;</span></span>: <span class="string"><span class="quote">&quot;</span>car<span class="quote">&quot;</span></span>}'
                }
            });

            io.set({}, {
                json: {
                    plain: '{}',
                    html: '{}'
                }
            });

// Attributes
            io.set({ $value: 'baz', $attributes: { foo: 'bar' } }, {
                json: {
                    plain: '{"$attributes": {"foo": "bar"},"$value": "baz"}',
                    html: '{<span class="string special-key"><span class="quote">&quot;</span>$attributes<span class="quote">&quot;</span></span>: {<span class="string key"><span class="quote">&quot;</span>foo<span class="quote">&quot;</span></span>: <span class="string"><span class="quote">&quot;</span>bar<span class="quote">&quot;</span></span>},<span class="string special-key"><span class="quote">&quot;</span>$value<span class="quote">&quot;</span></span>: <span class="string"><span class="quote">&quot;</span>baz<span class="quote">&quot;</span></span>}'
                }
            });

// Empty input (undefined)
            io.set(undefined, {
                json: {
                    plain: '',
                    html: ''
                }
            });

            runTestCases(io, 'json', {
                break: false,
                indent: 0,
                nonBreakingIndent: false
            });
        });

        describe('settings.highlightControlCharacter', function () {
            const io = new Map();

            // 0 - 7
            io.set('\x00\x01\x02\x03\x04\x05\x06\x07', {
                json: {
                    plain: '"\\u0000\\u0001\\u0002\\u0003\\u0004\\u0005\\u0006\\u0007"',
                    html: '<span class="string">' +
                        '<span class="quote">&quot;</span>' +
                        '<span class="escape">' +
                        '\\u0000\\u0001\\u0002\\u0003\\u0004\\u0005\\u0006\\u0007' +
                        '</span>' +
                        '<span class="quote">&quot;</span>' +
                        '</span>'
                }
            });
            io.set('\x00\x01\x02\x03\x04\x05\x06\x07', {
                json: {
                    plain: '"\\u0000\\u0001\\u0002\\u0003\\u0004\\u0005\\u0006\\u0007"',
                    html: '<span class="string">' +
                        '<span class="quote">&quot;</span>' +
                        '<span class="escape">' +
                        '\\u0000\\u0001\\u0002\\u0003\\u0004\\u0005\\u0006\\u0007' +
                        '</span>' +
                        '<span class="quote">&quot;</span>' +
                        '</span>'
                }
            });

            // 8 - 15
            io.set('\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f', {
                json: {
                    plain: '"\\b\\t\\n\\u000b\\f\\r\\u000e\\u000f"',
                    html: '<span class="string">' +
                        '<span class="quote">&quot;</span>' +
                        '<span class="escape">\\b\\t\\n\\u000b\\f\\r\\u000e\\u000f</span>' +
                        '<span class="quote">&quot;</span>' +
                        '</span>'
                }
            });
            // 16 - 23
            io.set('\x10\x11\x12\x13\x14\x15\x16\x17', {
                json: {
                    plain: '"\\u0010\\u0011\\u0012\\u0013\\u0014\\u0015\\u0016\\u0017"',
                    html: '<span class="string">' +
                        '<span class="quote">&quot;</span>' +
                        '<span class="escape">' +
                        '\\u0010\\u0011\\u0012\\u0013\\u0014\\u0015\\u0016\\u0017' +
                        '</span>' +
                        '<span class="quote">&quot;</span>' +
                        '</span>'
                }
            });
            // 24 - 31
            io.set('\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f', {
                json: {
                    plain: '"\\u0018\\u0019\\u001a\\u001b\\u001c\\u001d\\u001e\\u001f"',
                    html: '<span class="string">' +
                        '<span class="quote">&quot;</span>' +
                        '<span class="escape">' +
                        '\\u0018\\u0019\\u001a\\u001b\\u001c\\u001d\\u001e\\u001f' +
                        '</span>' +
                        '<span class="quote">&quot;</span>' +
                        '</span>'
                }
            });

            // Short escapes
            io.set('\b\f\n\r\t\v\0', {
                json: {
                    plain: '"\\b\\f\\n\\r\\t\\u000b\\u0000"',
                    html: '<span class="string">' +
                        '<span class="quote">&quot;</span>' +
                        '<span class="escape">\\b\\f\\n\\r\\t\\u000b\\u0000</span>' +
                        '<span class="quote">&quot;</span>' +
                        '</span>'
                }
            });

            // C-escape specifics
            io.set('\u00000 \u000ba \u0000 \u000b', {
                json: {
                    plain: '"\\u00000 \\u000ba \\u0000 \\u000b"',
                    html: '<span class="string">' +
                        '<span class="quote">&quot;</span>' +
                        '<span class="escape">\\u0000</span>' +
                        '0 ' +
                        '<span class="escape">\\u000b</span>' +
                        'a ' +
                        '<span class="escape">\\u0000</span>' +
                        ' ' +
                        '<span class="escape">\\u000b</span>' +
                        '<span class="quote">&quot;</span>' +
                        '</span>'
                }
            });

            runTestCases(io, 'json', {
                break: false,
                indent: 0,
                nonBreakingIndent: false,
                highlightControlCharacter: true,
            });
        });

        describe('settings.compact does not affect', function () {
            var io = new Map();

            io.set({ foo: { bar: 'baz' } }, {
                json: {
                    plain: '{\n    "foo": {\n        "bar": "baz"\n    }\n}',
                    html: '{\n    <span class="string key"><span class="quote">&quot;</span>foo<span class="quote">&quot;</span></span>: {\n        <span class="string key"><span class="quote">&quot;</span>bar<span class="quote">&quot;</span></span>: <span class="string"><span class="quote">&quot;</span>baz<span class="quote">&quot;</span></span>\n    }\n}'
                }
            });

            io.set({ foo: [42] }, {
                json: {
                    plain: '{\n    "foo": [\n        42\n    ]\n}',
                    html: '{\n    <span class="string key"><span class="quote">&quot;</span>foo<span class="quote">&quot;</span></span>: [\n        <span class="number">42</span>\n    ]\n}'
                }
            });

            io.set({ foo: [1, 2, 3] }, {
                json: {
                    plain: '{\n    "foo": [\n        1,\n        2,\n        3\n    ]\n}',
                    html: '{\n    <span class="string key"><span class="quote">&quot;</span>foo<span class="quote">&quot;</span></span>: [\n        <span class="number">1</span>,\n        <span class="number">2</span>,\n        <span class="number">3</span>\n    ]\n}'
                }
            });

            io.set({ foo: [[[42]]] }, {
                json: {
                    plain: '{\n    "foo": [\n        [\n            [\n                42\n            ]\n        ]\n    ]\n}',
                    html: '{\n    <span class="string key"><span class="quote">&quot;</span>foo<span class="quote">&quot;</span></span>: [\n        [\n            [\n                <span class="number">42</span>\n            ]\n        ]\n    ]\n}'
                }
            });

            io.set({ foo: { foo: { foo: { a: 1, b: 2 } } } }, {
                json: {
                    plain: '{\n    "foo": {\n        "foo": {\n            "foo": {\n                "a": 1,\n                "b": 2\n            }\n        }\n    }\n}',
                    html: '{\n    <span class="string key"><span class="quote">&quot;</span>foo<span class="quote">&quot;</span></span>: {\n        <span class="string key"><span class="quote">&quot;</span>foo<span class="quote">&quot;</span></span>: {\n            <span class="string key"><span class="quote">&quot;</span>foo<span class="quote">&quot;</span></span>: {\n                <span class="string key"><span class="quote">&quot;</span>a<span class="quote">&quot;</span></span>: <span class="number">1</span>,\n                <span class="string key"><span class="quote">&quot;</span>b<span class="quote">&quot;</span></span>: <span class="number">2</span>\n            }\n        }\n    }\n}'
                }
            });

            io.set({ foo: { foo: { foo: 'bar' } } }, {
                json: {
                    plain: '{\n    "foo": {\n        "foo": {\n            "foo": "bar"\n        }\n    }\n}',
                    html: '{\n    <span class="string key"><span class="quote">&quot;</span>foo<span class="quote">&quot;</span></span>: {\n        <span class="string key"><span class="quote">&quot;</span>foo<span class="quote">&quot;</span></span>: {\n            <span class="string key"><span class="quote">&quot;</span>foo<span class="quote">&quot;</span></span>: <span class="string"><span class="quote">&quot;</span>bar<span class="quote">&quot;</span></span>\n        }\n    }\n}'
                }
            });

            io.set(
                {
                    $attributes: { foo: 'bar' },
                    $value: 'baz'
                },
                {
                    json: {
                        plain: '{\n    "$attributes": {\n        "foo": "bar"\n    },\n    "$value": "baz"\n}',
                        html: '{\n    <span class="string special-key"><span class="quote">&quot;</span>$attributes<span class="quote">&quot;</span></span>: {\n        <span class="string key"><span class="quote">&quot;</span>foo<span class="quote">&quot;</span></span>: <span class="string"><span class="quote">&quot;</span>bar<span class="quote">&quot;</span></span>\n    },\n    <span class="string special-key"><span class="quote">&quot;</span>$value<span class="quote">&quot;</span></span>: <span class="string"><span class="quote">&quot;</span>baz<span class="quote">&quot;</span></span>\n}'
                    }
                }
            );

            runTestCases(io, 'json', {
                break: true,
                indent: 4,
                compact: true,
                nonBreakingIndent: false
            });
        });

        describe('settings.escapeWhitespace does not affect', function () {
            var io = new Map();

            io.set('Error:\n\tFoo :13\n\tFoo :42', {
                json: {
                    plain: '"Error:\\n\\tFoo :13\\n\\tFoo :42"',
                    html: '<span class="string"><span class="quote">&quot;</span>Error:<span class="escape">\\n\\t</span>Foo :13<span class="escape">\\n\\t</span>Foo :42<span class="quote">&quot;</span></span>'
                }
            });

            io.set(' Hello    World ', {
                json: {
                    plain: '" Hello    World "',
                    html: '<span class="string"><span class="quote">&quot;</span><span class="escape"> </span>Hello<span class="escape">    </span>World<span class="escape"> </span><span class="quote">&quot;</span></span>'
                }
            });

            io.set('\n\t', {
                json: {
                    plain: '"\\n\\t"',
                    html:  '<span class="string"><span class="quote">&quot;</span><span class="escape">\\n\\t</span><span class="quote">&quot;</span></span>'
                }
            });

            runTestCases(io, 'json', {
                break: true,
                indent: 4,
                escapeWhitespace: false,
                nonBreakingIndent: false
            });
        });

        describe('Miscellaneous', function () {
            it('Correct indentation json', function () {
                var settings = {
                    format: 'json',
                    indent: 4,
                    break: true,
                    asHTML: false,
                    nonBreakingIndent: false
                };

                assert.strictEqual(
                    '{\n' +
                    '    "$attributes": {\n' +
                    '        "append": "false"\n' +
                    '    },\n' +
                    '    "$value": "//home/username/table"\n' +
                    '}',
                    _serialize({
                        $attributes: {
                            append: 'false'
                        },
                        $value: '//home/username/table'
                    }, settings)
                );
            });

            it('Valid JSON that can be parsed with JSON.parse', function () {
                var settings = {
                    format: 'json',
                    indent: 0,
                    break: false,
                    asHTML: false,
                    nonBreakingIndent: false
                };

                function tryParsingAsJSON(value) {
                    var serialized = _serialize(value, settings);

                    JSON.parse(serialized);
                }

                assert.doesNotThrow(function () {
                    tryParsingAsJSON({
                        $attributes: {
                            append: 'false'
                        },
                        $value: '//home/username/table'
                    });
                });

                assert.doesNotThrow(function () {
                    tryParsingAsJSON('"');
                });

                assert.doesNotThrow(function () {
                    tryParsingAsJSON('\\');
                });

                assert.doesNotThrow(function () {
                    tryParsingAsJSON('\b\f\n\r\t');
                });

                // 0 - 7
                assert.doesNotThrow(function () {
                    tryParsingAsJSON('\u0000\u0001\u0002\u0003\u0004\u0005\u0006\u0007');
                });

                // 8 - 15
                assert.doesNotThrow(function () {
                    tryParsingAsJSON('\u0008\u0009\u000a\u000b\u000c\u000d\u000e\u000f');
                });

                // 16 - 23
                assert.doesNotThrow(function () {
                    tryParsingAsJSON('\u0010\u0011\u0012\u0013\u0014\u0015\u0016\u0017');
                });

                // 24 - 31
                assert.doesNotThrow(function () {
                    tryParsingAsJSON('\u0018\u0019\u001a\u001b\u001c\u001d\u001e\u001f');
                });
            });
        });
    });
});
