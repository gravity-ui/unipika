import {describe, expect, test} from '@jest/globals';

const unipika = require('../..')();

describe('converters', function () {
    describe('yql-to-unipika', function () {
        const yqlToYson = unipika.converters.yql;

        test('Boolean', function () {
            const result = yqlToYson([true, ['DataType', 'Bool']]);
            expect(result).toEqual({
                $type: 'yql.bool',
                $value: true,
            });
        });

        test('String', function () {
            const result = yqlToYson(['Some value', ['DataType', 'String']]);
            expect(result).toEqual({
                $type: 'yql.string',
                $value: 'Some value',
            });
        });

        test('Utf8', function () {
            const result = yqlToYson(['Some value', ['DataType', 'Utf8']]);
            expect(result).toEqual({
                $type: 'yql.utf8',
                $value: 'Some value',
            });
        });
        test('PG int4', function () {
            const result = yqlToYson([4, ['PgType', 'int4', 'N']]);
            expect(result).toEqual({
                $type: 'yql.pg.int4',
                $value: 4,
                $category: 'N',
            });
        });

        test('Binary string', function () {
            const result = yqlToYson([['Some value'], ['DataType', 'String']]);
            expect(result).toEqual({
                $binary: true,
                $type: 'yql.string',
                $value: 'Some value',
            });
        });

        test('Optional', function () {
            const dataType = ['OptionalType', ['DataType', 'Int64']];
            expect(yqlToYson([[], dataType])).toEqual({
                $type: 'yql.null',
                $value: null,
            });
            expect(yqlToYson([null, dataType])).toEqual({
                $type: 'yql.null',
                $value: null,
            });
            expect(yqlToYson([['42'], dataType])).toEqual({
                $type: 'yql.int64',
                $value: '42',
                $optional: 1,
            });
        });

        test('JsonDocument', function () {
            const dataType = ['OptionalType', ['DataType', 'JsonDocument']];
            expect(yqlToYson([[], dataType])).toEqual({
                $type: 'yql.null',
                $value: null,
            });
            expect(yqlToYson([null, dataType])).toEqual({
                $type: 'yql.null',
                $value: null,
            });
            expect(
                yqlToYson([
                    ['{"email":"<i onclick=\'alert(123)\'>User</i> <user@example.com>"}'],
                    dataType,
                ]),
            ).toEqual({
                $type: 'yql.json',
                $value: '{"email":"<i onclick=\'alert(123)\'>User</i> <user@example.com>"}',
                $optional: 1,
            });
        });

        test('Struct', function () {
            const dataType = [
                'StructType',
                [
                    ['a', ['DataType', 'Int64']],
                    ['b', ['DataType', 'Double']],
                    ['c', ['DataType', 'String']],
                    ['d', ['PgType', 'string']],
                ],
            ];
            const data = ['2', '3.1', 'x', 'pgvalue'];
            const result = {
                $type: 'yql.struct',
                $value: [
                    [
                        {
                            $type: 'yql.string',
                            $key: true,
                            $value: 'a',
                        },
                        {
                            $type: 'yql.int64',
                            $value: '2',
                        },
                    ],
                    [
                        {
                            $type: 'yql.string',
                            $key: true,
                            $value: 'b',
                        },
                        {
                            $type: 'yql.double',
                            $value: '3.1',
                        },
                    ],
                    [
                        {
                            $type: 'yql.string',
                            $key: true,
                            $value: 'c',
                        },
                        {
                            $type: 'yql.string',
                            $value: 'x',
                        },
                    ],
                    [
                        {
                            $type: 'yql.string',
                            $key: true,
                            $value: 'd',
                        },
                        {
                            $type: 'yql.pg.string',
                            $value: 'pgvalue',
                        },
                    ],
                ],
            };
            expect(yqlToYson([data, dataType])).toEqual(result);
        });

        test('Tuple', function () {
            const dataType = [
                'TupleType',
                [
                    ['DataType', 'Int64'],
                    ['DataType', 'String'],
                    ['DataType', 'Double'],
                    ['PgType', 'int4', 'N'],
                ],
            ];
            const data = ['1', 'foo', '4.321', 4];
            const result = {
                $type: 'yql.tuple',
                $value: [
                    {
                        $type: 'yql.int64',
                        $value: '1',
                    },
                    {
                        $type: 'yql.string',
                        $value: 'foo',
                    },
                    {
                        $type: 'yql.double',
                        $value: '4.321',
                    },
                    {
                        $type: 'yql.pg.int4',
                        $value: 4,
                        $category: 'N',
                    },
                ],
            };
            expect(yqlToYson([data, dataType])).toEqual(result);
        });

        test('List', function () {
            const dataType = ['ListType', ['DataType', 'String']];
            const data = ['a', 'при\nем', ['/wD+hTI='], '1'];
            const result = {
                $type: 'yql.list',
                $value: [
                    {
                        $type: 'yql.string',
                        $value: 'a',
                    },
                    {
                        $type: 'yql.string',
                        $value: 'при\nем',
                    },
                    {
                        $binary: true,
                        $type: 'yql.string',
                        $value: '/wD+hTI=',
                    },
                    {
                        $type: 'yql.string',
                        $value: '1',
                    },
                ],
            };
            expect(yqlToYson([data, dataType])).toEqual(result);
        });
        test('PG List', function () {
            const dataType = ['ListType', ['PgType', 'string', 'S']];
            const data = ['a', 'при\nем', '1'];
            const result = {
                $type: 'yql.list',
                $value: [
                    {
                        $type: 'yql.pg.string',
                        $value: 'a',
                        $category: 'S',
                    },
                    {
                        $type: 'yql.pg.string',
                        $value: 'при\nем',
                        $category: 'S',
                    },
                    {
                        $type: 'yql.pg.string',
                        $value: '1',
                        $category: 'S',
                    },
                ],
            };
            expect(yqlToYson([data, dataType])).toEqual(result);
        });

        test('Dict', function () {
            const dataType = ['DictType', ['DataType', 'Uint64'], ['DataType', 'Int64']];
            const data = [
                ['0', '1'],
                ['1', '2'],
                ['2', '3'],
                ['3', '4'],
                ['4', '3'],
                ['5', '2'],
            ];
            const result = {
                $type: 'yql.dict',
                $value: [
                    [
                        {
                            $type: 'yql.uint64',
                            $value: '0',
                        },
                        {
                            $type: 'yql.int64',
                            $value: '1',
                        },
                    ],
                    [
                        {
                            $type: 'yql.uint64',
                            $value: '1',
                        },
                        {
                            $type: 'yql.int64',
                            $value: '2',
                        },
                    ],
                    [
                        {
                            $type: 'yql.uint64',
                            $value: '2',
                        },
                        {
                            $type: 'yql.int64',
                            $value: '3',
                        },
                    ],
                    [
                        {
                            $type: 'yql.uint64',
                            $value: '3',
                        },
                        {
                            $type: 'yql.int64',
                            $value: '4',
                        },
                    ],
                    [
                        {
                            $type: 'yql.uint64',
                            $value: '4',
                        },
                        {
                            $type: 'yql.int64',
                            $value: '3',
                        },
                    ],
                    [
                        {
                            $type: 'yql.uint64',
                            $value: '5',
                        },
                        {
                            $type: 'yql.int64',
                            $value: '2',
                        },
                    ],
                ],
            };
            expect(yqlToYson([data, dataType])).toEqual(result);
        });

        test('Stream', function () {
            const dataType = ['StreamType', ['DataType', 'Int32']];
            const data = ['1', '2'];
            const result = {
                $type: 'yql.stream',
                $value: [
                    {
                        $type: 'yql.int32',
                        $value: '1',
                    },
                    {
                        $type: 'yql.int32',
                        $value: '2',
                    },
                ],
            };
            expect(yqlToYson([data, dataType])).toEqual(result);
        });

        test('Variant Tuple', function () {
            // Тесты дополнительно завернуты в StreamType, чтобы проверить одновременную конвертацию
            // разных индексов данных на одном примере
            const dataType = [
                'StreamType',
                [
                    'VariantType',
                    [
                        'TupleType',
                        [
                            ['DataType', 'Int32'],
                            ['DataType', 'Int64'],
                        ],
                    ],
                ],
            ];
            const data = [
                ['0', '1'],
                ['1', '1'],
            ];
            const result = {
                $type: 'yql.stream',
                $value: [
                    {
                        $type: 'yql.variant',
                        $value: [
                            [
                                {
                                    $type: 'yql.int32',
                                    $key: true,
                                    $value: '0',
                                },
                                {
                                    $type: 'yql.int32',
                                    $value: '1',
                                },
                            ],
                        ],
                    },
                    {
                        $type: 'yql.variant',
                        $value: [
                            [
                                {
                                    $type: 'yql.int32',
                                    $key: true,
                                    $value: '1',
                                },
                                {
                                    $type: 'yql.int64',
                                    $value: '1',
                                },
                            ],
                        ],
                    },
                ],
            };
            expect(yqlToYson([data, dataType])).toEqual(result);
        });

        test('Variant Struct', function () {
            // Тесты дополнительно завернуты в StreamType, чтобы проверить одновременную конвертацию
            // разных индексов данных на одном примере
            const dataType = [
                'StreamType',
                [
                    'VariantType',
                    [
                        'StructType',
                        [
                            ['a', ['DataType', 'Int32']],
                            ['b', ['DataType', 'String']],
                        ],
                    ],
                ],
            ];
            const data = [
                ['0', '34'],
                ['1', 'qwe'],
            ];
            const result = {
                $type: 'yql.stream',
                $value: [
                    {
                        $type: 'yql.variant',
                        $value: [
                            [
                                {
                                    $type: 'yql.string',
                                    $key: true,
                                    $value: 'a',
                                },
                                {
                                    $type: 'yql.int32',
                                    $value: '34',
                                },
                            ],
                        ],
                    },
                    {
                        $type: 'yql.variant',
                        $value: [
                            [
                                {
                                    $type: 'yql.string',
                                    $key: true,
                                    $value: 'b',
                                },
                                {
                                    $type: 'yql.string',
                                    $value: 'qwe',
                                },
                            ],
                        ],
                    },
                ],
            };
            expect(yqlToYson([data, dataType])).toEqual(result);
        });

        test('Enum', function () {
            const dataType = [
                'VariantType',
                [
                    'StructType',
                    [
                        ['a', ['VoidType']],
                        ['b', ['VoidType']],
                    ],
                ],
            ];
            const data = ['1', 'Void'];
            const result = {
                $type: 'yql.enum',
                $value: 'b',
            };
            expect(yqlToYson([data, dataType])).toEqual(result);
        });

        test('Set', function () {
            const dataType = ['DictType', ['DataType', 'Int32'], ['VoidType']];
            const data = [
                ['2', 'Void'],
                ['1', 'Void'],
            ];
            const result = {
                $type: 'yql.set',
                $value: [
                    {
                        $type: 'yql.int32',
                        $value: '2',
                    },
                    {
                        $type: 'yql.int32',
                        $value: '1',
                    },
                ],
            };
            console.log(yqlToYson([data, dataType]));
            expect(yqlToYson([data, dataType])).toEqual(result);
        });

        test('Void Type', function () {
            const dataType = ['VoidType'];
            const data = 'Void';
            const result = {
                $type: 'yql.null',
                $value: null,
            };
            expect(yqlToYson([data, dataType])).toEqual(result);
        });

        test('Null Type', function () {
            const dataType = ['NullType'];
            const data = 'Void';
            const result = {
                $type: 'yql.null',
                $value: null,
            };
            expect(yqlToYson([data, dataType])).toEqual(result);
        });

        describe('TaggedType', function () {
            describe('With inline src', function () {
                test('Image/jpeg', function () {
                    const dataType = ['TaggedType', 'image/jpeg', ['DataType', 'String']];
                    const data = 'image';
                    const result = {
                        $type: 'yql.tagged',
                        $tag: 'image/jpeg',
                        $value: {
                            $type: 'yql.string',
                            $value: 'image',
                        },
                    };

                    expect(yqlToYson([data, dataType])).toEqual(result);
                });
                test('Struct tagged as Image/jpeg', function () {
                    const dataType = [
                        'TaggedType',
                        'image/jpeg',
                        [
                            'StructType',
                            [
                                ['src', ['DataType', 'String']],
                                ['width', ['DataType', 'Int32']],
                            ],
                        ],
                    ];
                    const data = ['inlinesrc', '1200'];
                    const result = {
                        $type: 'yql.tagged',
                        $tag: 'image/jpeg',
                        $value: {
                            $type: 'tag_value',
                            $value: {
                                src: 'inlinesrc',
                                width: '1200',
                            },
                        },
                    };
                    expect(yqlToYson([data, dataType])).toEqual(result);
                });
                test('Struct tagged with invalid data as Image/jpeg', function () {
                    const dataType = [
                        'TaggedType',
                        'image/jpeg',
                        ['StructType', [['width', ['DataType', 'Int32']]]],
                    ];
                    const data = ['1200'];
                    const result = {
                        $type: 'yql.struct',
                        $value: [
                            [
                                {
                                    $type: 'yql.string',
                                    $value: 'width',
                                    $key: true,
                                },
                                {
                                    $type: 'yql.int32',
                                    $value: '1200',
                                },
                            ],
                        ],
                    };
                    expect(yqlToYson([data, dataType])).toEqual(result);
                });
            });
            describe('With url src', function () {
                test('Struct tagged as videourl (with domain as regexp in validateSrcUrl setting)', function () {
                    const dataType = [
                        'TaggedType',
                        'videourl',
                        [
                            'StructType',
                            [
                                ['src', ['DataType', 'String']],
                                ['width', ['DataType', 'Int32']],
                            ],
                        ],
                    ];
                    const data = ['http://foo.com', '1200'];
                    const result = {
                        $type: 'yql.tagged',
                        $tag: 'videourl',
                        $value: {
                            $type: 'tag_value',
                            $value: {
                                src: 'http://foo.com',
                                width: '1200',
                            },
                        },
                    };

                    const validateSrcUrl = (domain) => {
                        const url = new URL(domain);
                        const host = url ? url.host : '';
                        const re = /\S*foo\S*/;
                        return host.match(re);
                    };

                    expect(yqlToYson([data, dataType], {validateSrcUrl})).toEqual(result);
                });

                test('Struct tagged as videourl (without domain in validateSrcUrl setting)', function () {
                    const dataType = [
                        'TaggedType',
                        'videourl',
                        [
                            'StructType',
                            [
                                ['src', ['DataType', 'String']],
                                ['width', ['DataType', 'Int32']],
                            ],
                        ],
                    ];
                    const data = ['http://foo.com', '1200'];
                    const result = {
                        $type: 'yql.struct',
                        $value: [
                            [
                                {
                                    $type: 'yql.string',
                                    $value: 'src',
                                    $key: true,
                                },
                                {
                                    $type: 'yql.string',
                                    $value: 'http://foo.com',
                                },
                            ],
                            [
                                {
                                    $type: 'yql.string',
                                    $value: 'width',
                                    $key: true,
                                },
                                {
                                    $type: 'yql.int32',
                                    $value: '1200',
                                },
                            ],
                        ],
                    };

                    expect(yqlToYson([data, dataType])).toEqual(result);
                });
                test('Imageurl with valid src', function () {
                    const dataType = ['TaggedType', 'imageurl', ['DataType', 'String']];
                    const data = 'image';
                    const result = {
                        $type: 'yql.tagged',
                        $tag: 'imageurl',
                        $value: {
                            $type: 'yql.string',
                            $value: 'image',
                        },
                    };
                    const validateSrcUrl = (value: string) => {
                        return value === 'image';
                    };
                    expect(yqlToYson([data, dataType], {validateSrcUrl})).toEqual(result);
                });
                test('Imageurl with invalid src', function () {
                    const dataType = ['TaggedType', 'imageurl', ['DataType', 'String']];
                    const data = 'image';
                    const result = {
                        $type: 'yql.string',
                        $value: 'image',
                    };
                    expect(yqlToYson([data, dataType])).toEqual(result);
                });
                test('Struct tagged as videourl without src', function () {
                    const dataType = [
                        'TaggedType',
                        'videourl',
                        [
                            'StructType',
                            [
                                ['text', ['DataType', 'String']],
                                ['title', ['DataType', 'String']],
                            ],
                        ],
                    ];
                    const data = ['Foo', 'Foo title'];
                    const result = {
                        $type: 'yql.struct',
                        $value: [
                            [
                                {$type: 'yql.string', $value: 'text', $key: true},
                                {$type: 'yql.string', $value: 'Foo'},
                            ],
                            [
                                {$type: 'yql.string', $value: 'title', $key: true},
                                {$type: 'yql.string', $value: 'Foo title'},
                            ],
                        ],
                    };

                    expect(yqlToYson([data, dataType])).toEqual(result);
                });

                test('Struct tagged as imageurl with invalid data (src should not be optional)', function () {
                    const dataType = [
                        'TaggedType',
                        'imageurl',
                        [
                            'StructType',
                            [
                                ['maxHeight', ['DataType', 'Int32']],
                                ['maxWidth', ['DataType', 'Int32']],
                                ['src', ['OptionalType', ['DataType', 'String']]],
                            ],
                        ],
                    ];
                    const data = [
                        '200',
                        '200',
                        [
                            {
                                $value: 'http://foo.com',
                                $type: 'string',
                            },
                        ],
                    ];
                    const result = {
                        $type: 'yql.struct',
                        $value: [
                            [
                                {
                                    $type: 'yql.string',
                                    $value: 'maxHeight',
                                    $key: true,
                                },
                                {
                                    $type: 'yql.int32',
                                    $value: '200',
                                },
                            ],
                            [
                                {
                                    $type: 'yql.string',
                                    $value: 'maxWidth',
                                    $key: true,
                                },
                                {
                                    $type: 'yql.int32',
                                    $value: '200',
                                },
                            ],
                            [
                                {
                                    $type: 'yql.string',
                                    $value: 'src',
                                    $key: true,
                                },
                                {
                                    $type: 'yql.string',
                                    $value: {
                                        $value: 'http://foo.com',
                                        $type: 'string',
                                    },
                                    $optional: 1,
                                },
                            ],
                        ],
                    };
                    expect(yqlToYson([data, dataType])).toEqual(result);
                });
            });
            describe('Link', function () {
                test('Named url', function () {
                    const dataType = [
                        'TaggedType',
                        'url',
                        [
                            'StructType',
                            [
                                ['href', ['DataType', 'String']],
                                ['text', ['DataType', 'String']],
                                ['title', ['DataType', 'String']],
                            ],
                        ],
                    ];
                    const data = ['http://foo.com', 'Foo', 'Foo title'];
                    const result = {
                        $type: 'yql.tagged',
                        $tag: 'url',
                        $value: {
                            $type: 'tag_value',
                            $value: {
                                href: 'http://foo.com',
                                text: 'Foo',
                                title: 'Foo title',
                            },
                        },
                    };

                    expect(yqlToYson([data, dataType])).toEqual(result);
                });
                test('Named url without href', function () {
                    const dataType = [
                        'TaggedType',
                        'url',
                        [
                            'StructType',
                            [
                                ['text', ['DataType', 'String']],
                                ['title', ['DataType', 'String']],
                            ],
                        ],
                    ];
                    const data = ['Foo', 'Foo title'];
                    const result = {
                        $type: 'yql.struct',
                        $value: [
                            [
                                {$type: 'yql.string', $value: 'text', $key: true},
                                {$type: 'yql.string', $value: 'Foo'},
                            ],
                            [
                                {$type: 'yql.string', $value: 'title', $key: true},
                                {$type: 'yql.string', $value: 'Foo title'},
                            ],
                        ],
                    };

                    expect(yqlToYson([data, dataType])).toEqual(result);
                });
                test('Url with invalid data', function () {
                    const dataType = [
                        'TaggedType',
                        'url',
                        ['StructType', [['href', ['OptionalType', ['DataType', 'Yson']]]]],
                    ];
                    const data = [
                        [
                            {
                                $value: 'http://foo.com',
                                $type: 'string',
                            },
                        ],
                    ];
                    const result = {
                        $type: 'yql.struct',
                        $value: [
                            [
                                {
                                    $type: 'yql.string',
                                    $value: 'href',
                                    $key: true,
                                },
                                {
                                    $type: 'yql.yson',
                                    $value: {
                                        $value: 'http://foo.com',
                                        $type: 'string',
                                    },
                                    $optional: 1,
                                },
                            ],
                        ],
                    };

                    expect(yqlToYson([data, dataType])).toEqual(result);
                });
            });
        });

        test('Struct: omitStructNull', function () {
            const dataType = [
                'StructType',
                [
                    ['a', ['OptionalType', ['DataType', 'Int64']]],
                    ['b', ['DataType', 'Int64']],
                ],
            ];
            const data = [[], '2'];
            const resultWithoutParam = {
                $type: 'yql.struct',
                $value: [
                    [
                        {
                            $type: 'yql.string',
                            $key: true,
                            $value: 'a',
                        },
                        {
                            $type: 'yql.null',
                            $value: null,
                        },
                    ],
                    [
                        {
                            $type: 'yql.string',
                            $key: true,
                            $value: 'b',
                        },
                        {
                            $type: 'yql.int64',
                            $value: '2',
                        },
                    ],
                ],
            };
            const resultWithParam = {
                $type: 'yql.struct',
                $value: [
                    [
                        {
                            $type: 'yql.string',
                            $key: true,
                            $value: 'b',
                        },
                        {
                            $type: 'yql.int64',
                            $value: '2',
                        },
                    ],
                ],
            };
            expect(yqlToYson([data, dataType])).toEqual(resultWithoutParam);
            expect(yqlToYson([data, dataType], {omitStructNull: true})).toEqual(resultWithParam);
        });

        test('Truncated List', function () {
            const dataType = ['ListType', ['DataType', 'String']];
            const data = ['1', '2', '3', '4'];
            const result = {
                $type: 'yql.list',
                $value: [
                    {
                        $type: 'yql.string',
                        $value: '1',
                    },
                    {
                        $type: 'yql.string',
                        $value: '2',
                    },
                ],
                $incomplete: true,
            };
            expect(yqlToYson([data, dataType], {maxListSize: 2})).toEqual(result);
        });

        test('YSON with column named val without treatValAsData setting', function () {
            const dataType = ['ListType', ['StructType', [['column0', ['DataType', 'Yson']]]]];
            const data = [[{val: {$value: '2', $type: 'int64'}, a: {$value: '1', $type: 'int64'}}]];
            const result = {
                $type: 'yql.list',
                $value: [
                    {
                        $type: 'yql.struct',
                        $value: [
                            [
                                {
                                    $key: true,
                                    $type: 'yql.string',
                                    $value: 'column0',
                                },
                                {
                                    $type: 'yql.yson',
                                    $value: {
                                        a: {
                                            $type: 'int64',
                                            $value: '1',
                                        },
                                        val: {
                                            $type: 'int64',
                                            $value: '2',
                                        },
                                    },
                                },
                            ],
                        ],
                    },
                ],
            };
            expect(yqlToYson([data, dataType])).toEqual(result);
        });

        test('YSON with column named val with treatValAsData setting', function () {
            const dataType = ['ListType', ['StructType', [['column0', ['DataType', 'Yson']]]]];
            const data = [[{val: {$value: '2', $type: 'int64'}, a: {$value: '1', $type: 'int64'}}]];
            const result = {
                $type: 'yql.list',
                $value: [
                    {
                        $type: 'yql.struct',
                        $value: [
                            [
                                {
                                    $key: true,
                                    $type: 'yql.string',
                                    $value: 'column0',
                                },
                                {
                                    $type: 'yql.yson',
                                    $value: {
                                        $type: 'int64',
                                        $value: '2',
                                    },
                                },
                            ],
                        ],
                    },
                ],
            };
            expect(yqlToYson([data, dataType], {treatValAsData: true})).toEqual(result);
        });

        test('Regular strings get truncated', function () {
            const text =
                "We're no strangers to love\nYou know the rules and so do I\nA full commitment's what I'm thinking of\nYou wouldn't get this from any other guy";
            const maxStringSize = 25;

            const dataType = ['DataType', 'String'];
            const data = text;

            const actual = yqlToYson([data, dataType], {maxStringSize: maxStringSize});

            expect(actual.$value).toEqual("We're no strangers to lov");
            expect(actual.$value.length).toEqual(25);
        });

        describe('Binary strings get truncated', function () {
            test('with no tail bytes in base64', function () {
                const text =
                    "We're no strangers to love\nYou know the rules and so do I\nA full commitment's what I'm thinking of\nYou wouldn't get this from any other guy";
                const base64 = btoa(text);
                const maxStringSize = 24;

                const dataType = ['DataType', 'String'];
                const data = [base64];

                const yson = yqlToYson([data, dataType], {maxStringSize: maxStringSize});

                expect(atob(yson.$value)).toEqual("We're no strangers to lo");
                expect(atob(yson.$value).length).toEqual(24);
            });

            test('with 1 tail byte in base64', function () {
                const text =
                    "We're no strangers to love\nYou know the rules and so do I\nA full commitment's what I'm thinking of\nYou wouldn't get this from any other guy";
                const base64 = btoa(text);
                const maxStringSize = 25;

                const dataType = ['DataType', 'String'];
                const data = [base64];

                const yson = yqlToYson([data, dataType], {maxStringSize: maxStringSize});

                expect(atob(yson.$value)).toEqual("We're no strangers to lov");
                expect(atob(yson.$value).length).toEqual(25);
            });

            test('with 2 tail bytes in base64', function () {
                const text =
                    "We're no strangers to love\nYou know the rules and so do I\nA full commitment's what I'm thinking of\nYou wouldn't get this from any other guy";
                const base64 = btoa(text);
                const maxStringSize = 26;

                const dataType = ['DataType', 'String'];
                const data = [base64];

                const yson = yqlToYson([data, dataType], {maxStringSize: maxStringSize});

                expect(atob(yson.$value)).toEqual("We're no strangers to love");
                expect(atob(yson.$value).length).toEqual(26);
            });
        });
    });
});
