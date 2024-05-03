import {beforeEach, describe, expect, test} from '@jest/globals';

const unipika = require('../..')();

describe('converters', function () {
    describe('yson-to-unipika', function () {
        let _ysonToUnipika;

        beforeEach(function (done) {
            _ysonToUnipika = unipika.converters.yson;
            done();
        });

        test('Exports', function () {
            expect(_ysonToUnipika).toBeDefined();
        });

        test('isFunction', function () {
            expect(_ysonToUnipika).toBeInstanceOf(Function);
        });

        describe('Gives correct output for...', function () {
            const io = new Map();

            io.set(null, {$type: 'null', $value: null});

            io.set({$type: 'null', $value: null}, {$type: 'null', $value: null});

            io.set(true, {$type: 'boolean', $value: true});

            io.set({$type: 'boolean', $value: true}, {$type: 'boolean', $value: true});

            io.set(false, {$type: 'boolean', $value: false});

            io.set({$type: 'boolean', $value: false}, {$type: 'boolean', $value: false});

            io.set('foo', {$type: 'string', $value: 'foo', $decoded_value: 'foo'});

            io.set(
                {$type: 'string', $value: 'foo'},
                {$type: 'string', $value: 'foo', $decoded_value: 'foo'},
            );

            io.set('oÐ', {$type: 'string', $value: 'oÐ', $binary: true});

            io.set({$type: 'string', $value: 'oÐ'}, {$type: 'string', $value: 'oÐ', $binary: true});

            io.set(42, {$type: 'number', $value: 42});

            io.set({$type: 'number', $value: 42}, {$type: 'number', $value: 42});

            io.set([], {$type: 'list', $value: []});

            io.set([1, 2, 3], {
                $type: 'list',
                $value: [
                    {$type: 'number', $value: 1},
                    {$type: 'number', $value: 2},
                    {$type: 'number', $value: 3},
                ],
            });

            io.set({}, {$type: 'map', $value: []});

            io.set(
                {foo: 'bar'},
                {
                    $type: 'map',
                    $value: [
                        [
                            {
                                $type: 'string',
                                $value: 'foo',
                                $decoded_value: 'foo',
                                $key: true,
                            },
                            {$type: 'string', $value: 'bar', $decoded_value: 'bar'},
                        ],
                    ],
                },
            );

            io.set(
                {
                    $value: 'foo',
                    $attributes: {
                        bar: 'baz',
                    },
                    $type: 'string',
                    $incomplete: true,
                },
                {
                    $value: 'foo',
                    $attributes: [
                        [
                            {
                                $type: 'string',
                                $value: 'bar',
                                $decoded_value: 'bar',
                                $key: true,
                            },
                            {$type: 'string', $value: 'baz', $decoded_value: 'baz'},
                        ],
                    ],
                    $type: 'string',
                    $decoded_value: 'foo',
                    $incomplete: true,
                },
            );

            // Tagged, Valid input for tag "url" - yeilding simple url
            io.set(
                {
                    $type: 'string',
                    $value: 'https://example.com',
                    $attributes: {_type_tag: 'url'},
                },
                {
                    $type: 'tagged',
                    $tag: 'url',
                    $value: {
                        $type: 'tag_value',
                        $value: {
                            href: 'https://example.com',
                        },
                    },
                    $attributes: [],
                },
            );

            // Valid input for tag "url"
            io.set(
                {
                    $value: {
                        href: 'https://example.com',
                        text: 'Example',
                        title: 'Example title',
                    },
                    $attributes: {_type_tag: 'url'},
                },
                {
                    $type: 'tagged',
                    $tag: 'url',
                    $value: {
                        $type: 'tag_value',
                        $value: {
                            href: 'https://example.com',
                            text: 'Example',
                            title: 'Example title',
                        },
                    },
                    $attributes: [],
                },
            );

            // Valid input for tag "url"
            io.set(
                {
                    $value: {
                        href: {
                            $type: 'string',
                            $value: 'https://example.com',
                        },
                        text: 'Example',
                        title: 'Example title',
                    },
                    $attributes: {_type_tag: 'url'},
                },
                {
                    $type: 'tagged',
                    $tag: 'url',
                    $value: {
                        $type: 'tag_value',
                        $value: {
                            href: 'https://example.com',
                            text: 'Example',
                            title: 'Example title',
                        },
                    },
                    $attributes: [],
                },
            );

            // Cannot convert, invalid input for "url" tag - converting to map type
            io.set(
                {
                    $value: {text: 'bar'},
                    $attributes: {_type_tag: 'url'},
                },
                {
                    $type: 'map',
                    $value: [
                        [
                            {
                                $type: 'string',
                                $value: 'text',
                                $decoded_value: 'text',
                                $key: true,
                            },
                            {$type: 'string', $value: 'bar', $decoded_value: 'bar'},
                        ],
                    ],
                    $attributes: [
                        [
                            {
                                $type: 'string',
                                $value: '_type_tag',
                                $decoded_value: '_type_tag',
                                $key: true,
                            },
                            {$type: 'string', $value: 'url', $decoded_value: 'url'},
                        ],
                    ],
                },
            );

            // Valid input with additional attributes
            io.set(
                {
                    $type: 'string',
                    $value: 'https://example.com/myimage.png',
                    $attributes: {
                        _type_tag: 'imageurl',
                        foo: 'bar',
                    },
                },
                {
                    $type: 'tagged',
                    $tag: 'imageurl',
                    $value: {
                        $type: 'string',
                        $value: 'https://example.com/myimage.png',
                    },
                    $attributes: [
                        [
                            {
                                $type: 'string',
                                $value: 'foo',
                                $decoded_value: 'foo',
                                $key: true,
                            },
                            {$type: 'string', $value: 'bar', $decoded_value: 'bar'},
                        ],
                    ],
                },
            );

            io.forEach(function (output, input) {
                test('Input - ' + JSON.stringify(input), function () {
                    // console.log('actual', JSON.stringify(_ysonToUnipika(input), null, 2));
                    // console.log('expected', JSON.stringify(output, null, 2));
                    expect(_ysonToUnipika(input)).toEqual(output);
                });

                test('Does not corrupt input - ' + JSON.stringify(input), function () {
                    //console.log('actual', JSON.stringify(_ysonToUnipika(input)));
                    //console.log('expected', JSON.stringify(output));
                    const copiedInput = JSON.parse(JSON.stringify(input));
                    expect(input).toEqual(copiedInput);
                });
            });
        });

        test('Handles invalid input', function () {
            const io = [
                function () {},
                /42/,
                {$value: NaN},
                {$value: Infinity},
                {$value: -Infinity},
                {$value: undefined},
                {$value: 'foo', $attributes: 'bar'},
                {$value: 'foo', $type: {}},
                [1, undefined, 3],
            ];

            io.forEach(function (input) {
                expect(function () {
                    _ysonToUnipika(input);
                }).toThrowError();
            });
        });
    });
});
