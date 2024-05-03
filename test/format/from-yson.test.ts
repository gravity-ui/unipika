import {describe, expect, test} from '@jest/globals';

import {toHTMLText, toPlainText} from '../utils';

const unipika = require('../..')();

describe('format', function () {
    const _formatFromYSON = unipika.formatFromYSON;

    function runTestCases(io, settings) {
        io.forEach(function (output, input) {
            describe('Gives correct output for: ' + JSON.stringify(input), function () {
                Object.keys(output).forEach(function (format) {
                    test('Format - ' + format, function () {
                        expect(output[format].plain).toBe(
                            toPlainText(_formatFromYSON, input, format, settings),
                        );
                        expect(output[format].html).toBe(
                            toHTMLText(_formatFromYSON, input, format, settings),
                        );
                    });
                });
            });
        });
    }

    describe('formatFromYSON', function () {
        test('Exports', function () {
            expect(_formatFromYSON).toBeDefined();
        });

        test('isFunction', function () {
            expect(_formatFromYSON).toBeInstanceOf(Function);
        });

        describe('Test plain and html output', function () {
            const io = new Map();

            // Support for $incomplete
            io.set(
                {$incomplete: true, $value: 'Foo'},
                {
                    json: {
                        plain: '"Foo"',
                        html: '<span class="string incomplete"><span class="quote">&quot;</span>Foo<span class="quote">&quot;</span></span>',
                    },

                    yson: {
                        plain: '"Foo"',
                        html: '<span class="string incomplete"><span class="quote">&quot;</span>Foo<span class="quote">&quot;</span></span>',
                    },
                },
            );

            io.set(
                {$attributes: {bar: 'baz'}, $incomplete: true, $value: 'Foo'},
                {
                    json: {
                        plain: '{"$attributes": {"bar": "baz"},"$value": "Foo"}',
                        html: '{<span class="string special-key"><span class="quote">&quot;</span>$attributes<span class="quote">&quot;</span></span>: {<span class="string key"><span class="quote">&quot;</span>bar<span class="quote">&quot;</span></span>: <span class="string"><span class="quote">&quot;</span>baz<span class="quote">&quot;</span></span>},<span class="string special-key"><span class="quote">&quot;</span>$value<span class="quote">&quot;</span></span>: <span class="string incomplete"><span class="quote">&quot;</span>Foo<span class="quote">&quot;</span></span>}',
                    },

                    yson: {
                        plain: '<"bar" = "baz">"Foo"',
                        html: '<<span class="string key"><span class="quote">&quot;</span>bar<span class="quote">&quot;</span></span> = <span class="string"><span class="quote">&quot;</span>baz<span class="quote">&quot;</span></span>><span class="string incomplete"><span class="quote">&quot;</span>Foo<span class="quote">&quot;</span></span>',
                    },
                },
            );

            io.set(
                {$attributes: {}, $incomplete: true, $value: 'Foo'},
                {
                    json: {
                        plain: '"Foo"',
                        html: '<span class="string incomplete"><span class="quote">&quot;</span>Foo<span class="quote">&quot;</span></span>',
                    },

                    yson: {
                        plain: '"Foo"',
                        html: '<span class="string incomplete"><span class="quote">&quot;</span>Foo<span class="quote">&quot;</span></span>',
                    },
                },
            );

            // Support for $type
            io.set(
                {$type: 'boolean', $value: 'true'},
                {
                    json: {
                        plain: 'true',
                        html: '<span class="boolean">true</span>',
                    },

                    yson: {
                        plain: '%true',
                        html: '<span class="boolean">%true</span>',
                    },
                },
            );

            io.set(
                {$type: 'boolean', $value: 'false'},
                {
                    json: {
                        plain: 'false',
                        html: '<span class="boolean">false</span>',
                    },

                    yson: {
                        plain: '%false',
                        html: '<span class="boolean">%false</span>',
                    },
                },
            );

            io.set(
                {$type: 'int64', $value: '42'},
                {
                    json: {
                        plain: '42',
                        html: '<span class="int64">42</span>',
                    },

                    yson: {
                        plain: '42',
                        html: '<span class="int64">42</span>',
                    },
                },
            );

            io.set(
                {$type: 'uint64', $value: '42'},
                {
                    json: {
                        plain: '42',
                        html: '<span class="uint64">42</span>',
                    },

                    yson: {
                        plain: '42u',
                        html: '<span class="uint64">42u</span>',
                    },
                },
            );

            io.set(
                {$type: 'double', $value: '3.14'},
                {
                    json: {
                        plain: '3.14',
                        html: '<span class="double">3.14</span>',
                    },

                    yson: {
                        plain: '3.14',
                        html: '<span class="double">3.14</span>',
                    },
                },
            );

            // Strings
            io.set('Foo', {
                json: {
                    plain: '"Foo"',
                    html:
                        '<span class="string">' +
                        '<span class="quote">&quot;</span>' +
                        'Foo' +
                        '<span class="quote">&quot;</span>' +
                        '</span>',
                },

                yson: {
                    plain: '"Foo"',
                    html:
                        '<span class="string">' +
                        '<span class="quote">&quot;</span>' +
                        'Foo' +
                        '<span class="quote">&quot;</span>' +
                        '</span>',
                },
            });
            // 0 - 7
            io.set('\x00\x01\x02\x03\x04\x05\x06\x07', {
                json: {
                    plain: '"\\u0000\\u0001\\u0002\\u0003\\u0004\\u0005\\u0006\\u0007"',
                    html:
                        '<span class="string">' +
                        '<span class="quote">&quot;</span>' +
                        '\\u0000\\u0001\\u0002\\u0003\\u0004\\u0005\\u0006\\u0007' +
                        '<span class="quote">&quot;</span>' +
                        '</span>',
                },

                yson: {
                    plain: '"\\0\\1\\2\\3\\4\\5\\6\\7"',
                    html:
                        '<span class="string">' +
                        '<span class="quote">&quot;</span>' +
                        '\\0\\1\\2\\3\\4\\5\\6\\7' +
                        '<span class="quote">&quot;</span>' +
                        '</span>',
                },
            });
            // 8 - 15
            io.set('\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f', {
                json: {
                    plain: '"\\b\\t\\n\\u000b\\f\\r\\u000e\\u000f"',
                    html:
                        '<span class="string">' +
                        '<span class="quote">&quot;</span>' +
                        '<span class="escape">\\b\\t\\n</span>\\u000b<span class="escape">\\f\\r</span>\\u000e\\u000f' +
                        '<span class="quote">&quot;</span>' +
                        '</span>',
                },

                yson: {
                    plain: '"\\x08\\t\\n\\x0b\\x0c\\r\\x0e\\x0f"',
                    html:
                        '<span class="string">' +
                        '<span class="quote">&quot;</span>' +
                        '\\x08<span class="escape">\\t\\n</span>\\x0b\\x0c<span class="escape">\\r</span>\\x0e\\x0f' +
                        '<span class="quote">&quot;</span>' +
                        '</span>',
                },
            });
            // 16 - 23
            io.set('\x10\x11\x12\x13\x14\x15\x16\x17', {
                json: {
                    plain: '"\\u0010\\u0011\\u0012\\u0013\\u0014\\u0015\\u0016\\u0017"',
                    html:
                        '<span class="string">' +
                        '<span class="quote">&quot;</span>' +
                        '\\u0010\\u0011\\u0012\\u0013\\u0014\\u0015\\u0016\\u0017' +
                        '<span class="quote">&quot;</span>' +
                        '</span>',
                },

                yson: {
                    plain: '"\\x10\\x11\\x12\\x13\\x14\\x15\\x16\\x17"',
                    html:
                        '<span class="string">' +
                        '<span class="quote">&quot;</span>' +
                        '\\x10\\x11\\x12\\x13\\x14\\x15\\x16\\x17' +
                        '<span class="quote">&quot;</span>' +
                        '</span>',
                },
            });
            // 24 - 31
            io.set('\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f', {
                json: {
                    plain: '"\\u0018\\u0019\\u001a\\u001b\\u001c\\u001d\\u001e\\u001f"',
                    html:
                        '<span class="string">' +
                        '<span class="quote">&quot;</span>' +
                        '\\u0018\\u0019\\u001a\\u001b\\u001c\\u001d\\u001e\\u001f' +
                        '<span class="quote">&quot;</span>' +
                        '</span>',
                },

                yson: {
                    plain: '"\\x18\\x19\\x1a\\x1b\\x1c\\x1d\\x1e\\x1f"',
                    html:
                        '<span class="string">' +
                        '<span class="quote">&quot;</span>' +
                        '\\x18\\x19\\x1a\\x1b\\x1c\\x1d\\x1e\\x1f' +
                        '<span class="quote">&quot;</span>' +
                        '</span>',
                },
            });

            // Short escapes
            io.set('\b\f\n\r\t\v\0', {
                json: {
                    plain: '"\\b\\f\\n\\r\\t\\u000b\\u0000"',
                    html:
                        '<span class="string">' +
                        '<span class="quote">&quot;</span>' +
                        '<span class="escape">\\b\\f\\n\\r\\t</span>\\u000b\\u0000' +
                        '<span class="quote">&quot;</span>' +
                        '</span>',
                },

                yson: {
                    plain: '"\\x08\\x0c\\n\\r\\t\\x0b\\0"',
                    html:
                        '<span class="string">' +
                        '<span class="quote">&quot;</span>' +
                        '\\x08\\x0c<span class="escape">\\n\\r\\t</span>\\x0b\\0' +
                        '<span class="quote">&quot;</span>' +
                        '</span>',
                },
            });

            // C-escape specifics
            io.set('\u00000 \u000ba \u0000 \u000b', {
                json: {
                    plain: '"\\u00000 \\u000ba \\u0000 \\u000b"',
                    html:
                        '<span class="string">' +
                        '<span class="quote">&quot;</span>' +
                        '\\u00000 \\u000ba \\u0000 \\u000b' +
                        '<span class="quote">&quot;</span>' +
                        '</span>',
                },

                yson: {
                    plain: '"\\0000 \\013a \\0 \\x0b"',
                    html:
                        '<span class="string">' +
                        '<span class="quote">&quot;</span>' +
                        '\\0000 \\013a \\0 \\x0b' +
                        '<span class="quote">&quot;</span>' +
                        '</span>',
                },
            });

            // Escape quotes and backslashes
            io.set('"', {
                json: {
                    plain: '"\\""',
                    html:
                        '<span class="string">' +
                        '<span class="quote">&quot;</span>' +
                        '\\&quot;' +
                        '<span class="quote">&quot;</span>' +
                        '</span>',
                },

                yson: {
                    plain: '"\\""',
                    html:
                        '<span class="string">' +
                        '<span class="quote">&quot;</span>' +
                        '\\&quot;' +
                        '<span class="quote">&quot;</span>' +
                        '</span>',
                },
            });

            io.set('\\', {
                json: {
                    plain: '"\\\\"',
                    html:
                        '<span class="string">' +
                        '<span class="quote">&quot;</span>' +
                        '\\\\' +
                        '<span class="quote">&quot;</span>' +
                        '</span>',
                },

                yson: {
                    plain: '"\\\\"',
                    html:
                        '<span class="string">' +
                        '<span class="quote">&quot;</span>' +
                        '\\\\' +
                        '<span class="quote">&quot;</span>' +
                        '</span>',
                },
            });

            // Boolean
            io.set(true, {
                json: {
                    plain: 'true',
                    html: '<span class="boolean">true</span>',
                },

                yson: {
                    plain: '%true',
                    html: '<span class="boolean">%true</span>',
                },
            });

            io.set(false, {
                json: {
                    plain: 'false',
                    html: '<span class="boolean">false</span>',
                },

                yson: {
                    plain: '%false',
                    html: '<span class="boolean">%false</span>',
                },
            });

            // Number
            io.set(42, {
                json: {
                    plain: '42',
                    html: '<span class="number">42</span>',
                },

                yson: {
                    plain: '42',
                    html: '<span class="number">42</span>',
                },
            });

            // Null/Entity
            io.set(null, {
                json: {
                    plain: 'null',
                    html: '<span class="null">null</span>',
                },

                yson: {
                    plain: '#',
                    html: '<span class="null">#</span>',
                },
            });

            // List
            io.set([1, 2, 3], {
                json: {
                    plain: '[1,2,3]',
                    html: '[<span class="number">1</span>,<span class="number">2</span>,<span class="number">3</span>]',
                },

                yson: {
                    plain: '[1;2;3]',
                    html: '[<span class="number">1</span>;<span class="number">2</span>;<span class="number">3</span>]',
                },
            });

            io.set([42], {
                json: {
                    plain: '[42]',
                    html: '[<span class="number">42</span>]',
                },

                yson: {
                    plain: '[42]',
                    html: '[<span class="number">42</span>]',
                },
            });

            io.set([], {
                json: {
                    plain: '[]',
                    html: '[]',
                },

                yson: {
                    plain: '[]',
                    html: '[]',
                },
            });

            // Map
            io.set(
                {foo: 'bar'},
                {
                    json: {
                        plain: '{"foo": "bar"}',
                        html: '{<span class="string key"><span class="quote">&quot;</span>foo<span class="quote">&quot;</span></span>: <span class="string"><span class="quote">&quot;</span>bar<span class="quote">&quot;</span></span>}',
                    },

                    yson: {
                        plain: '{"foo" = "bar"}',
                        html: '{<span class="string key"><span class="quote">&quot;</span>foo<span class="quote">&quot;</span></span> = <span class="string"><span class="quote">&quot;</span>bar<span class="quote">&quot;</span></span>}',
                    },
                },
            );

            // Sorted keys
            io.set(
                {c: 'car', b: 'butterfly', a: 'apple'},
                {
                    json: {
                        plain: '{"a": "apple","b": "butterfly","c": "car"}',
                        html: '{<span class="string key"><span class="quote">&quot;</span>a<span class="quote">&quot;</span></span>: <span class="string"><span class="quote">&quot;</span>apple<span class="quote">&quot;</span></span>,<span class="string key"><span class="quote">&quot;</span>b<span class="quote">&quot;</span></span>: <span class="string"><span class="quote">&quot;</span>butterfly<span class="quote">&quot;</span></span>,<span class="string key"><span class="quote">&quot;</span>c<span class="quote">&quot;</span></span>: <span class="string"><span class="quote">&quot;</span>car<span class="quote">&quot;</span></span>}',
                    },

                    yson: {
                        plain: '{"a" = "apple";"b" = "butterfly";"c" = "car"}',
                        html: '{<span class="string key"><span class="quote">&quot;</span>a<span class="quote">&quot;</span></span> = <span class="string"><span class="quote">&quot;</span>apple<span class="quote">&quot;</span></span>;<span class="string key"><span class="quote">&quot;</span>b<span class="quote">&quot;</span></span> = <span class="string"><span class="quote">&quot;</span>butterfly<span class="quote">&quot;</span></span>;<span class="string key"><span class="quote">&quot;</span>c<span class="quote">&quot;</span></span> = <span class="string"><span class="quote">&quot;</span>car<span class="quote">&quot;</span></span>}',
                    },
                },
            );

            io.set(
                {},
                {
                    json: {
                        plain: '{}',
                        html: '{}',
                    },

                    yson: {
                        plain: '{}',
                        html: '{}',
                    },
                },
            );

            // Attributes
            io.set(
                {$value: 'baz', $attributes: {foo: 'bar'}},
                {
                    json: {
                        plain: '{"$attributes": {"foo": "bar"},"$value": "baz"}',
                        html: '{<span class="string special-key"><span class="quote">&quot;</span>$attributes<span class="quote">&quot;</span></span>: {<span class="string key"><span class="quote">&quot;</span>foo<span class="quote">&quot;</span></span>: <span class="string"><span class="quote">&quot;</span>bar<span class="quote">&quot;</span></span>},<span class="string special-key"><span class="quote">&quot;</span>$value<span class="quote">&quot;</span></span>: <span class="string"><span class="quote">&quot;</span>baz<span class="quote">&quot;</span></span>}',
                    },

                    yson: {
                        plain: '<"foo" = "bar">"baz"',
                        html: '<<span class="string key"><span class="quote">&quot;</span>foo<span class="quote">&quot;</span></span> = <span class="string"><span class="quote">&quot;</span>bar<span class="quote">&quot;</span></span>><span class="string"><span class="quote">&quot;</span>baz<span class="quote">&quot;</span></span>',
                    },
                },
            );

            // Empty input (undefined)
            io.set(undefined, {
                json: {
                    plain: '',
                    html: '',
                },

                yson: {
                    plain: '',
                    html: '',
                },
            });

            runTestCases(io, {
                break: false,
                indent: 0,
                decodeUTF8: false,
                showDecoded: false,
                nonBreakingIndent: false,
            });
        });

        describe('settings.compact === true', function () {
            const io = new Map();

            io.set(
                {foo: {bar: 'baz'}},
                {
                    json: {
                        plain: '{"foo": {"bar": "baz"}}',
                        html: '{<span class="string key"><span class="quote">&quot;</span>foo<span class="quote">&quot;</span></span>: {<span class="string key"><span class="quote">&quot;</span>bar<span class="quote">&quot;</span></span>: <span class="string"><span class="quote">&quot;</span>baz<span class="quote">&quot;</span></span>}}',
                    },

                    yson: {
                        plain: '{"foo" = {"bar" = "baz"}}',
                        html: '{<span class="string key"><span class="quote">&quot;</span>foo<span class="quote">&quot;</span></span> = {<span class="string key"><span class="quote">&quot;</span>bar<span class="quote">&quot;</span></span> = <span class="string"><span class="quote">&quot;</span>baz<span class="quote">&quot;</span></span>}}',
                    },
                },
            );

            io.set(
                {foo: [42]},
                {
                    json: {
                        plain: '{"foo": [42]}',
                        html: '{<span class="string key"><span class="quote">&quot;</span>foo<span class="quote">&quot;</span></span>: [<span class="number">42</span>]}',
                    },

                    yson: {
                        plain: '{"foo" = [42]}',
                        html: '{<span class="string key"><span class="quote">&quot;</span>foo<span class="quote">&quot;</span></span> = [<span class="number">42</span>]}',
                    },
                },
            );

            io.set(
                {foo: [1, 2, 3]},
                {
                    json: {
                        plain: '{"foo": [\n    1,\n    2,\n    3\n]}',
                        html: '{<span class="string key"><span class="quote">&quot;</span>foo<span class="quote">&quot;</span></span>: [\n    <span class="number">1</span>,\n    <span class="number">2</span>,\n    <span class="number">3</span>\n]}',
                    },

                    yson: {
                        plain: '{"foo" = [\n    1;\n    2;\n    3\n]}',
                        html: '{<span class="string key"><span class="quote">&quot;</span>foo<span class="quote">&quot;</span></span> = [\n    <span class="number">1</span>;\n    <span class="number">2</span>;\n    <span class="number">3</span>\n]}',
                    },
                },
            );

            io.set(
                {foo: [[42]]},
                {
                    json: {
                        plain: '{"foo": [[42]]}',
                        html: '{<span class="string key"><span class="quote">&quot;</span>foo<span class="quote">&quot;</span></span>: [[<span class="number">42</span>]]}',
                    },

                    yson: {
                        plain: '{"foo" = [[42]]}',
                        html: '{<span class="string key"><span class="quote">&quot;</span>foo<span class="quote">&quot;</span></span> = [[<span class="number">42</span>]]}',
                    },
                },
            );

            io.set([{foo: 'bar'}], {
                json: {
                    plain: '[{"foo": "bar"}]',
                    html:
                        '[{' +
                        '<span class="string key"><span class="quote">&quot;</span>foo<span class="quote">&quot;</span></span>' +
                        ': ' +
                        '<span class="string"><span class="quote">&quot;</span>bar<span class="quote">&quot;</span></span>' +
                        '}]',
                },

                yson: {
                    plain: '[{"foo" = "bar"}]',
                    html:
                        '[{' +
                        '<span class="string key"><span class="quote">&quot;</span>foo<span class="quote">&quot;</span></span>' +
                        ' = ' +
                        '<span class="string"><span class="quote">&quot;</span>bar<span class="quote">&quot;</span></span>' +
                        '}]',
                },
            });

            io.set([{foo: 'bar', baz: 42}], {
                json: {
                    plain: '[{\n    "baz": 42,\n    "foo": "bar"\n}]',
                    html: '[{\n    <span class="string key"><span class="quote">&quot;</span>baz<span class="quote">&quot;</span></span>: <span class="number">42</span>,\n    <span class="string key"><span class="quote">&quot;</span>foo<span class="quote">&quot;</span></span>: <span class="string"><span class="quote">&quot;</span>bar<span class="quote">&quot;</span></span>\n}]',
                },

                yson: {
                    plain: '[{\n    "baz" = 42;\n    "foo" = "bar"\n}]',
                    html: '[{\n    <span class="string key"><span class="quote">&quot;</span>baz<span class="quote">&quot;</span></span> = <span class="number">42</span>;\n    <span class="string key"><span class="quote">&quot;</span>foo<span class="quote">&quot;</span></span> = <span class="string"><span class="quote">&quot;</span>bar<span class="quote">&quot;</span></span>\n}]',
                },
            });

            io.set(
                {foo: {foo: {foo: {a: 1, b: 2}}}},
                {
                    json: {
                        plain: '{"foo": {"foo": {"foo": {\n    "a": 1,\n    "b": 2\n}}}}',
                        html: '{<span class="string key"><span class="quote">&quot;</span>foo<span class="quote">&quot;</span></span>: {<span class="string key"><span class="quote">&quot;</span>foo<span class="quote">&quot;</span></span>: {<span class="string key"><span class="quote">&quot;</span>foo<span class="quote">&quot;</span></span>: {\n    <span class="string key"><span class="quote">&quot;</span>a<span class="quote">&quot;</span></span>: <span class="number">1</span>,\n    <span class="string key"><span class="quote">&quot;</span>b<span class="quote">&quot;</span></span>: <span class="number">2</span>\n}}}}',
                    },

                    yson: {
                        plain: '{"foo" = {"foo" = {"foo" = {\n    "a" = 1;\n    "b" = 2\n}}}}',
                        html: '{<span class="string key"><span class="quote">&quot;</span>foo<span class="quote">&quot;</span></span> = {<span class="string key"><span class="quote">&quot;</span>foo<span class="quote">&quot;</span></span> = {<span class="string key"><span class="quote">&quot;</span>foo<span class="quote">&quot;</span></span> = {\n    <span class="string key"><span class="quote">&quot;</span>a<span class="quote">&quot;</span></span> = <span class="number">1</span>;\n    <span class="string key"><span class="quote">&quot;</span>b<span class="quote">&quot;</span></span> = <span class="number">2</span>\n}}}}',
                    },
                },
            );

            io.set(
                {foo: {foo: {foo: 'bar'}}},
                {
                    json: {
                        plain: '{"foo": {"foo": {"foo": "bar"}}}',
                        html: '{<span class="string key"><span class="quote">&quot;</span>foo<span class="quote">&quot;</span></span>: {<span class="string key"><span class="quote">&quot;</span>foo<span class="quote">&quot;</span></span>: {<span class="string key"><span class="quote">&quot;</span>foo<span class="quote">&quot;</span></span>: <span class="string"><span class="quote">&quot;</span>bar<span class="quote">&quot;</span></span>}}}',
                    },

                    yson: {
                        plain: '{"foo" = {"foo" = {"foo" = "bar"}}}',
                        html: '{<span class="string key"><span class="quote">&quot;</span>foo<span class="quote">&quot;</span></span> = {<span class="string key"><span class="quote">&quot;</span>foo<span class="quote">&quot;</span></span> = {<span class="string key"><span class="quote">&quot;</span>foo<span class="quote">&quot;</span></span> = <span class="string"><span class="quote">&quot;</span>bar<span class="quote">&quot;</span></span>}}}',
                    },
                },
            );

            io.set(
                {
                    $attributes: {foo: 'bar'},
                    $value: 'baz',
                },
                {
                    json: {
                        plain: '{\n    "$attributes": {"foo": "bar"},\n    "$value": "baz"\n}',
                        html: '{\n    <span class="string special-key"><span class="quote">&quot;</span>$attributes<span class="quote">&quot;</span></span>: {<span class="string key"><span class="quote">&quot;</span>foo<span class="quote">&quot;</span></span>: <span class="string"><span class="quote">&quot;</span>bar<span class="quote">&quot;</span></span>},\n    <span class="string special-key"><span class="quote">&quot;</span>$value<span class="quote">&quot;</span></span>: <span class="string"><span class="quote">&quot;</span>baz<span class="quote">&quot;</span></span>\n}',
                    },

                    yson: {
                        plain: '<"foo" = "bar">"baz"',
                        html: '<<span class="string key"><span class="quote">&quot;</span>foo<span class="quote">&quot;</span></span> = <span class="string"><span class="quote">&quot;</span>bar<span class="quote">&quot;</span></span>><span class="string"><span class="quote">&quot;</span>baz<span class="quote">&quot;</span></span>',
                    },
                },
            );

            runTestCases(io, {
                break: true,
                indent: 4,
                decodeUTF8: false,
                showDecoded: false,
                compact: true,
                nonBreakingIndent: false,
            });
        });

        describe('settings.compact === false', function () {
            const io = new Map();

            io.set([], {
                json: {
                    plain: '[]',
                    html: '[]',
                },

                yson: {
                    plain: '[]',
                    html: '[]',
                },
            });

            io.set(
                {},
                {
                    json: {
                        plain: '{}',
                        html: '{}',
                    },

                    yson: {
                        plain: '{}',
                        html: '{}',
                    },
                },
            );

            runTestCases(io, {
                break: false,
                indent: 0,
                decodeUTF8: false,
                showDecoded: false,
                compact: false,
                nonBreakingIndent: false,
            });
        });

        describe('settings.escapeWhitespace', function () {
            const io = new Map();

            io.set('Error:\n\tFoo :13\n\tFoo :42', {
                json: {
                    plain: '"Error:\n\tFoo :13\n\tFoo :42"',
                    html: '<span class="string"><span class="quote">&quot;</span>Error:\n\tFoo :13\n\tFoo :42<span class="quote">&quot;</span></span>',
                },

                yson: {
                    plain: '"Error:\n\tFoo :13\n\tFoo :42"',
                    html: '<span class="string"><span class="quote">&quot;</span>Error:\n\tFoo :13\n\tFoo :42<span class="quote">&quot;</span></span>',
                },
            });

            io.set(' Hello    World ', {
                json: {
                    plain: '" Hello    World "',
                    html: '<span class="string"><span class="quote">&quot;</span> Hello    World <span class="quote">&quot;</span></span>',
                },

                yson: {
                    plain: '" Hello    World "',
                    html: '<span class="string"><span class="quote">&quot;</span> Hello    World <span class="quote">&quot;</span></span>',
                },
            });

            io.set('\n\t', {
                json: {
                    plain: '"\n\t"',
                    html: '<span class="string"><span class="quote">&quot;</span>\n\t<span class="quote">&quot;</span></span>',
                },

                yson: {
                    plain: '"\n\t"',
                    html: '<span class="string"><span class="quote">&quot;</span>\n\t<span class="quote">&quot;</span></span>',
                },
            });

            runTestCases(io, {
                break: false,
                indent: 0,
                decodeUTF8: false,
                showDecoded: false,
                escapeWhitespace: false,
                nonBreakingIndent: false,
            });
        });

        describe('Miscellaneous', function () {
            test('Unescape keys in yson', function () {
                let settings = {
                    format: 'yson',
                    indent: 0,
                    decodeUTF8: false,
                    showDecoded: false,
                    break: false,
                    asHTML: false,
                    nonBreakingIndent: false,
                };

                expect(
                    '{"$attributes" = {"append" = "false"};"$value" = "//home/username/table"}',
                ).toBe(
                    _formatFromYSON(
                        {
                            $$attributes: {
                                append: 'false',
                            },
                            $$value: '//home/username/table',
                        },
                        settings,
                    ),
                );

                settings = {
                    format: 'yson',
                    indent: 0,
                    decodeUTF8: false,
                    showDecoded: true,
                    break: false,
                    asHTML: false,
                    nonBreakingIndent: false,
                };

                expect(
                    '{"$attributes" = {"append" = "false"};"$value" = "//home/username/table"}',
                ).toBe(
                    _formatFromYSON(
                        {
                            $$attributes: {
                                append: 'false',
                            },
                            $$value: '//home/username/table',
                        },
                        settings,
                    ),
                );
            });

            test('Correct indentation yson', function () {
                const settings = {
                    format: 'yson',
                    indent: 4,
                    break: true,
                    asHTML: false,
                    nonBreakingIndent: false,
                };

                expect('<\n    "append" = "false"\n>\n"//home/username/table"').toBe(
                    _formatFromYSON(
                        {
                            $attributes: {
                                append: 'false',
                            },
                            $value: '//home/username/table',
                        },
                        settings,
                    ),
                );
            });

            test('Correct indentation json', function () {
                const settings = {
                    format: 'json',
                    indent: 4,
                    break: true,
                    asHTML: false,
                    nonBreakingIndent: false,
                };

                expect(
                    '{\n' +
                        '    "$attributes": {\n' +
                        '        "append": "false"\n' +
                        '    },\n' +
                        '    "$value": "//home/username/table"\n' +
                        '}',
                ).toBe(
                    _formatFromYSON(
                        {
                            $attributes: {
                                append: 'false',
                            },
                            $value: '//home/username/table',
                        },
                        settings,
                    ),
                );
            });

            test('Valid JSON that can be parsed with JSON.parse', function () {
                const settings = {
                    format: 'json',
                    indent: 0,
                    break: false,
                    asHTML: false,
                    nonBreakingIndent: false,
                };

                function tryParsingAsJSON(value) {
                    const serialized = _formatFromYSON(value, settings);

                    JSON.parse(serialized);
                }

                expect(function () {
                    tryParsingAsJSON({
                        $attributes: {
                            append: 'false',
                        },
                        $value: '//home/username/table',
                    });
                }).not.toThrow();

                expect(function () {
                    tryParsingAsJSON('"');
                }).not.toThrow();

                expect(function () {
                    tryParsingAsJSON('\\');
                }).not.toThrow();

                expect(function () {
                    tryParsingAsJSON('\b\f\n\r\t');
                }).not.toThrow();

                // 0 - 7
                expect(function () {
                    tryParsingAsJSON('\u0000\u0001\u0002\u0003\u0004\u0005\u0006\u0007');
                }).not.toThrow();

                // 8 - 15
                expect(function () {
                    tryParsingAsJSON('\u0008\u0009\u000a\u000b\u000c\u000d\u000e\u000f');
                }).not.toThrow();

                // 16 - 23
                expect(function () {
                    tryParsingAsJSON('\u0010\u0011\u0012\u0013\u0014\u0015\u0016\u0017');
                }).not.toThrow();

                // 24 - 31
                expect(function () {
                    tryParsingAsJSON('\u0018\u0019\u001a\u001b\u001c\u001d\u001e\u001f');
                }).not.toThrow();
            });
        });
    });
});
