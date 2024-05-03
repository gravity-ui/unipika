import {beforeEach, describe, expect, test} from '@jest/globals';

const unipika = require('../..')();

describe('plugins', function () {
    describe('tagged asHTML', () => {
        let settings = {};

        beforeEach(() => {
            settings = {
                asHTML: true,
            };
        });

        test('String url', function () {
            expect(
                unipika.format(
                    {
                        $type: 'tagged',
                        $tag: 'url',
                        $value: {
                            $type: 'yql.string',
                            $value: 'http://example.com',
                        },
                    },
                    settings,
                ),
            ).toBe(
                '<a class="yql_tagged tagged tag_url" target="_blank" href="http://example.com">http://example.com</a>',
            );
        });

        test('Named url without text', function () {
            expect(
                unipika.format(
                    {
                        $type: 'tagged',
                        $tag: 'url',
                        $value: {
                            $type: 'tag_value',
                            $value: {
                                href: 'http://example.com',
                            },
                        },
                    },
                    settings,
                ),
            ).toBe(
                '<a class="yql_tagged tagged tag_url" target="_blank" href="http://example.com">http://example.com</a>',
            );
        });

        test('Named url with text', function () {
            expect(
                unipika.format(
                    {
                        $type: 'tagged',
                        $tag: 'url',
                        $value: {
                            $type: 'tag_value',
                            $value: {
                                href: 'http://example.com',
                                text: 'Example',
                                title: 'Abc',
                            },
                        },
                    },
                    settings,
                ),
            ).toBe(
                '<a class="yql_tagged tagged tag_url" target="_blank" href="http://example.com" title="Abc">Example</a>',
            );
        });

        test('Url with html special symbols', function () {
            expect(
                unipika.format(
                    {
                        $type: 'tagged',
                        $tag: 'url',
                        $value: {
                            $type: 'tag_value',
                            $value: {
                                text: 'Example',
                                href: 'http://example.com/?param1=<>"&param2=`\'',
                            },
                        },
                    },
                    settings,
                ),
            ).toBe(
                '<a class="yql_tagged tagged tag_url" target="_blank" href="http://example.com/?param1=%3C%3E%22&param2=%60\'">Example</a>',
            );
        });

        test('String video url', function () {
            expect(
                unipika.format(
                    {
                        $type: 'tagged',
                        $tag: 'videourl',
                        $value: {
                            $type: 'yql.string',
                            $value: 'http://example.com',
                        },
                    },
                    settings,
                ),
            ).toBe(
                '<video class="yql_tagged tagged tag_video" controls src="http://example.com"></video>',
            );
        });

        test('Struct tagged as video', function () {
            expect(
                unipika.format(
                    {
                        $type: 'tagged',
                        $tag: 'videourl',
                        $value: {
                            $type: 'tag_value',
                            $value: {
                                src: 'http://example.com',
                                width: 800,
                                height: 600,
                            },
                        },
                    },
                    settings,
                ),
            ).toBe(
                '<video class="yql_tagged tagged tag_video" controls src="http://example.com" style="width:800px;height:600px"></video>',
            );
        });
    });

    describe('tagged asHTML with h.yandex-team.ru', function () {
        let settings = {};

        beforeEach(() => {
            settings = {
                asHTML: true,
                normalizeUrl: (url) => {
                    return 'https://h.yandex-team.ru/?' + encodeURIComponent(url);
                },
            };
        });

        test('String url', function () {
            expect(
                unipika.format(
                    {
                        $type: 'tagged',
                        $tag: 'url',
                        $value: {
                            $type: 'yql.string',
                            $value: 'http://example.com',
                        },
                    },
                    settings,
                ),
            ).toBe(
                '<a class="yql_tagged tagged tag_url" target="_blank" href="https://h.yandex-team.ru/?http%3A%2F%2Fexample.com">http://example.com</a>',
            );
        });

        test('Named url without text', function () {
            expect(
                unipika.format(
                    {
                        $type: 'tagged',
                        $tag: 'url',
                        $value: {
                            $type: 'tag_value',
                            $value: {
                                href: 'http://example.com',
                            },
                        },
                    },
                    settings,
                ),
            ).toBe(
                '<a class="yql_tagged tagged tag_url" target="_blank" href="https://h.yandex-team.ru/?http%3A%2F%2Fexample.com">http://example.com</a>',
            );
        });

        test('Named url with text', function () {
            expect(
                unipika.format(
                    {
                        $type: 'tagged',
                        $tag: 'url',
                        $value: {
                            $type: 'tag_value',
                            $value: {
                                href: 'http://example.com',
                                text: 'Example',
                                title: 'Abc',
                            },
                        },
                    },
                    settings,
                ),
            ).toBe(
                '<a class="yql_tagged tagged tag_url" target="_blank" href="https://h.yandex-team.ru/?http%3A%2F%2Fexample.com" title="Abc">Example</a>',
            );
        });

        test('Url with html special symbols', function () {
            expect(
                unipika.format(
                    {
                        $type: 'tagged',
                        $tag: 'url',
                        $value: {
                            $type: 'tag_value',
                            $value: {
                                text: 'Example',
                                href: 'http://example.com/?param1=<>"&param2=`\'',
                            },
                        },
                    },
                    settings,
                ),
            ).toBe(
                '<a class="yql_tagged tagged tag_url" target="_blank" href="https://h.yandex-team.ru/?http%3A%2F%2Fexample.com%2F%3Fparam1%3D%3C%3E%22%26param2%3D%60\'">Example</a>',
            );
        });

        test('String video url', function () {
            expect(
                unipika.format(
                    {
                        $type: 'tagged',
                        $tag: 'videourl',
                        $value: {
                            $type: 'yql.string',
                            $value: 'http://example.com',
                        },
                    },
                    settings,
                ),
            ).toBe(
                '<video class="yql_tagged tagged tag_video" controls src="https://h.yandex-team.ru/?http%3A%2F%2Fexample.com"></video>',
            );
        });

        test('Struct tagged as video', function () {
            expect(
                unipika.format(
                    {
                        $type: 'tagged',
                        $tag: 'videourl',
                        $value: {
                            $type: 'tag_value',
                            $value: {
                                src: 'http://example.com',
                                width: 800,
                                height: 600,
                            },
                        },
                    },
                    settings,
                ),
            ).toBe(
                '<video class="yql_tagged tagged tag_video" controls src="https://h.yandex-team.ru/?http%3A%2F%2Fexample.com" style="width:800px;height:600px"></video>',
            );
        });
    });

    describe('tagged as text', () => {
        let settings = {};
        beforeEach(() => {
            settings = {
                asHTML: false,
            };
        });

        test('Struct tagged as video raw', function () {
            expect(
                unipika.format(
                    {
                        $type: 'tagged',
                        $tag: 'videourl',
                        $value: {
                            $type: 'tag_value',
                            $value: {
                                src: 'http://example.com',
                                width: 800,
                                height: 600,
                            },
                        },
                    },
                    settings,
                ),
            ).toBe('http://example.com');
        });

        test('Imageurl as plain output', function () {
            expect(
                unipika.format(
                    {
                        $type: 'tagged',
                        $tag: 'imageurl',
                        $value: {
                            $type: 'tag_value',
                            $value: {
                                maxHeight: '200',
                                maxWidth: '200',
                                src: 'http://example.com',
                            },
                        },
                    },
                    settings,
                ),
            ).toBe('http://example.com');
        });

        test('Image blob as plain output', function () {
            expect(
                unipika.format(
                    {
                        $type: 'tagged',
                        $tag: 'image/svg',
                        $value: {
                            $type: 'tag_value',
                            $value: {
                                maxHeight: '200',
                                maxWidth: '200',
                                src: '<svg><circle r="2" x="0" y="0"/></svg>',
                            },
                        },
                    },
                    settings,
                ),
            ).toBe(
                'data:image/svg+xml;base64,&lt;svg&gt;&lt;circle r=&quot;2&quot; x=&quot;0&quot; y=&quot;0&quot;/&gt;&lt;/svg&gt;',
            );
        });

        test('String video url raw', function () {
            expect(
                unipika.format(
                    {
                        $type: 'tagged',
                        $tag: 'videourl',
                        $value: {
                            $type: 'yql.string',
                            $value: 'http://example.com',
                        },
                    },
                    settings,
                ),
            ).toBe('http://example.com');
        });
    });

    describe('tagged as text with h.yandex-team.ru', () => {
        let settings = {};
        beforeEach(() => {
            settings = {
                asHTML: false,
                normalizeUrl: (url) => {
                    return 'https://h.yandex-team.ru/?' + encodeURIComponent(url);
                },
            };
        });

        test('Struct tagged as video raw', function () {
            expect(
                unipika.format(
                    {
                        $type: 'tagged',
                        $tag: 'videourl',
                        $value: {
                            $type: 'tag_value',
                            $value: {
                                src: 'http://example.com',
                                width: 800,
                                height: 600,
                            },
                        },
                    },
                    settings,
                ),
            ).toBe('https://h.yandex-team.ru/?http%3A%2F%2Fexample.com');
        });

        test('Imageurl as plain output', function () {
            expect(
                unipika.format(
                    {
                        $type: 'tagged',
                        $tag: 'imageurl',
                        $value: {
                            $type: 'tag_value',
                            $value: {
                                maxHeight: '200',
                                maxWidth: '200',
                                src: 'http://example.com',
                            },
                        },
                    },
                    settings,
                ),
            ).toBe('https://h.yandex-team.ru/?http%3A%2F%2Fexample.com');
        });

        test('Image blob as plain output', function () {
            expect(
                unipika.format(
                    {
                        $type: 'tagged',
                        $tag: 'image/svg',
                        $value: {
                            $type: 'tag_value',
                            $value: {
                                maxHeight: '200',
                                maxWidth: '200',
                                src: '<svg><circle r="2" x="0" y="0"/></svg>',
                            },
                        },
                    },
                    settings,
                ),
            ).toBe(
                'data:image/svg+xml;base64,&lt;svg&gt;&lt;circle r=&quot;2&quot; x=&quot;0&quot; y=&quot;0&quot;/&gt;&lt;/svg&gt;',
            );
        });

        test('String video url raw', function () {
            expect(
                unipika.format(
                    {
                        $type: 'tagged',
                        $tag: 'videourl',
                        $value: {
                            $type: 'yql.string',
                            $value: 'http://example.com',
                        },
                    },
                    settings,
                ),
            ).toBe('https://h.yandex-team.ru/?http%3A%2F%2Fexample.com');
        });
    });
});
