import {describe, expect, test} from '@jest/globals';

const unipika = require('../..')();

describe('plugins', function () {
    describe('yql-string', function () {
        const _format = unipika.format;
        const binaryTypes = ['yql.string', 'yql.utf8'];

        test('simple', function () {
            expect(
                _format(
                    {
                        $type: 'yql.string',
                        $value: 'Some value',
                    },
                    {
                        asHTML: false,
                    },
                ),
            ).toBe('"Some value"');
        });

        test('string escape', function () {
            expect(
                _format(
                    {
                        $type: 'yql.string',
                        $value: '\n\t\u0000\\"',
                    },
                    {
                        asHTML: false,
                    },
                ),
            ).toBe('"\\n\\t\\u0000\\\\\\""');
        });

        test('string escape no', function () {
            expect(
                _format(
                    {
                        $type: 'yql.string',
                        $value: '\n\t\u0000\\"',
                    },
                    {
                        asHTML: false,
                        escapeYQLStrings: false,
                    },
                ),
            ).toBe('"\n\t\u0000\\""');
        });

        describe.each(binaryTypes)('%s binary', function (type) {
            const makeBinaryValue = (value: string) => ({
                $binary: true,
                $type: type,
                $value: btoa(value),
            });

            test('escapes decoded value in HTML mode', function () {
                const payload = '<style>div{opacity:0.8}</style><div>injected</div>&<>"\'`&lt;';
                const typeClass = type.replace('.', '_');

                expect(
                    _format(makeBinaryValue(payload), {
                        asHTML: true,
                        binaryAsHex: false,
                    }),
                ).toBe(
                    `<span class="${typeClass} binary">&lt;style&gt;div{opacity:0.8}&lt;/style&gt;&lt;div&gt;injected&lt;/div&gt;&amp;&lt;&gt;&quot;&#x27;&#x60;&amp;lt;</span>`,
                );
            });

            test('renders decoded value only as text in the DOM', function () {
                const payload = '<style>div{opacity:0.8}</style><div>injected</div>';
                const container = document.createElement('div');

                container.innerHTML = _format(makeBinaryValue(payload), {
                    asHTML: true,
                    binaryAsHex: false,
                });

                expect(container.children).toHaveLength(1);
                expect(container.querySelector('style')).toBeNull();
                expect(container.querySelector('div')).toBeNull();

                const span = container.firstElementChild;
                expect(span?.tagName).toBe('SPAN');
                expect(span?.childNodes).toHaveLength(1);
                expect(span?.firstChild?.nodeType).toBe(Node.TEXT_NODE);
                expect(span?.textContent).toBe(payload);
            });

            test('preserves decoded bytes outside HTML mode', function () {
                const allBytes = Array.from({length: 256}, function (_, index) {
                    return String.fromCharCode(index);
                }).join('');

                expect(
                    _format(makeBinaryValue('Some value'), {
                        asHTML: false,
                        binaryAsHex: false,
                    }),
                ).toBe('Some value');
                expect(
                    _format(makeBinaryValue(allBytes), {
                        asHTML: false,
                        binaryAsHex: false,
                    }),
                ).toBe(allBytes);
            });

            test.each([false, true])(
                'preserves hexadecimal output with asHTML: %s',
                function (asHTML) {
                    const hexValue = '53 6f 6d 65 20 76 61 6c 75 65';
                    const formattedValue = _format(makeBinaryValue('Some value'), {
                        asHTML,
                        binaryAsHex: true,
                    });

                    expect(formattedValue).toBe(
                        asHTML
                            ? `<span class="${type.replace('.', '_')} binary">${hexValue}</span>`
                            : hexValue,
                    );
                },
            );

            test('uses hexadecimal output by default', function () {
                expect(_format(makeBinaryValue('Some value'), {asHTML: false})).toBe(
                    '53 6f 6d 65 20 76 61 6c 75 65',
                );
            });

            test.each([
                {asHTML: false, binaryAsHex: false},
                {asHTML: false, binaryAsHex: true},
                {asHTML: true, binaryAsHex: false},
                {asHTML: true, binaryAsHex: true},
            ])('rejects invalid base64 with settings $asHTML/$binaryAsHex', function (settings) {
                expect(function () {
                    _format(
                        {
                            $binary: true,
                            $type: type,
                            $value: 'Not base64-encoded string',
                        },
                        settings,
                    );
                }).toThrow(Error);
            });
        });

        test('escapes binary String data formatted through the YQL converter', function () {
            const payload = '<style>div{opacity:0.8}</style><div>injected</div>';

            expect(
                unipika.formatFromYQL([[btoa(payload)], ['DataType', 'String']], {
                    asHTML: true,
                    binaryAsHex: false,
                }),
            ).toBe(
                '<span class="yql_string binary">&lt;style&gt;div{opacity:0.8}&lt;/style&gt;&lt;div&gt;injected&lt;/div&gt;</span>',
            );
        });
    });
});
