/* global chai, describe, it, beforeEach */
var assert = chai.assert;

describe('plugins', function () {
    describe('tagged', function () {
        var _format = unipika.format;

        it('String url', function () {
            assert.strictEqual(
                _format({
                    $type: 'tagged',
                    $tag: 'url',
                    $value: {
                        $type: 'yql.string',
                        $value: 'http://example.com'
                    }
                }, {
                    asHTML: true
                }),
                '<a class="yql_tagged tagged tag_url" target="_blank" href="https://h.yandex-team.ru/?http%3A%2F%2Fexample.com">http://example.com</a>'
            );
        });

        it('Named url without text', function () {
            assert.strictEqual(
                _format({
                    $type: 'tagged',
                    $tag: 'url',
                    $value: {
                        $type: 'tag_value',
                        $value: {
                            href: 'http://example.com'
                        }
                    }
                }, {
                    asHTML: true
                }),
                '<a class="yql_tagged tagged tag_url" target="_blank" href="https://h.yandex-team.ru/?http%3A%2F%2Fexample.com">http://example.com</a>'
            );
        });

        it('Named url with text', function () {
            assert.strictEqual(
                _format({
                    $type: 'tagged',
                    $tag: 'url',
                    $value: {
                        $type: 'tag_value',
                        $value: {
                            href: 'http://example.com',
                            text: 'Example',
                            title: 'Abc'
                        }
                    }
                }, {
                    asHTML: true
                }),
                '<a class="yql_tagged tagged tag_url" target="_blank" href="https://h.yandex-team.ru/?http%3A%2F%2Fexample.com" title="Abc">Example</a>'
            );
        });

        it('Url with html special symbols', function () {
            assert.strictEqual(
                _format({
                    $type: 'tagged',
                    $tag: 'url',
                    $value: {
                        $type: 'tag_value',
                        $value: {
                            text: 'Example',
                            href: 'http://example.com/?param1=<>"&param2=`\''
                        }
                    }
                }, {
                    asHTML: true
                }),
                '<a class="yql_tagged tagged tag_url" target="_blank" href="https://h.yandex-team.ru/?http%3A%2F%2Fexample.com%2F%3Fparam1%3D%3C%3E%22%26param2%3D%60\'">Example</a>'
            );
        });

        it('Imageurl as plain output', function () {
            assert.strictEqual(
                _format({
                    $type: 'tagged',
                    $tag: 'imageurl',
                    $value: {
                        $type: 'tag_value',
                        $value: {
                            'maxHeight': '200',
                            'maxWidth': '200',
                            'src': 'http://example.com'
                        }
                    }
                }, {
                    asHTML: false
                }),
                'https://h.yandex-team.ru/?http%3A%2F%2Fexample.com'
            );
        });

        it('Image blob as plain output', function () {
            assert.strictEqual(
                _format({
                    $type: 'tagged',
                    $tag: 'image/svg',
                    $value: {
                        $type: 'tag_value',
                        $value: {
                            'maxHeight': '200',
                            'maxWidth': '200',
                            'src': '<svg><circle r="2" x="0" y="0"/></svg>'
                        }
                    }
                }, {
                    asHTML: false
                }),
                'data:image/svg+xml;base64,&lt;svg&gt;&lt;circle r=&quot;2&quot; x=&quot;0&quot; y=&quot;0&quot;/&gt;&lt;/svg&gt;'
            );
        });

        it('String video url', function () {
            assert.strictEqual(
                _format({
                    $type: 'tagged',
                    $tag: 'videourl',
                    $value: {
                        $type: 'yql.string',
                        $value: 'http://example.com'
                    }
                }, {
                    asHTML: true
                }),
                '<video class="yql_tagged tagged tag_video" controls src="https://h.yandex-team.ru/?http%3A%2F%2Fexample.com"></video>'
            );
        });

        it('String video url raw', function () {
            assert.strictEqual(
                _format({
                    $type: 'tagged',
                    $tag: 'videourl',
                    $value: {
                        $type: 'yql.string',
                        $value: 'http://example.com'
                    }
                }, {
                    asHTML: false
                }),
                'https://h.yandex-team.ru/?http%3A%2F%2Fexample.com'
            );
        });

        it('Struct tagged as video', function () {
            assert.strictEqual(
                _format({
                    $type: 'tagged',
                    $tag: 'videourl',
                    $value: {
                        $type: 'tag_value',
                        $value: {
                            src: 'http://example.com',
                            width: 800,
                            height: 600
                        }
                    }
                }, {
                    asHTML: true
                }),
                '<video class="yql_tagged tagged tag_video" controls src="https://h.yandex-team.ru/?http%3A%2F%2Fexample.com" style="width:800px;height:600px"></video>'
            );
        });

        it('Struct tagged as video raw', function () {
            assert.strictEqual(
                _format({
                    $type: 'tagged',
                    $tag: 'videourl',
                    $value: {
                        $type: 'tag_value',
                        $value: {
                            src: 'http://example.com',
                            width: 800,
                            height: 600
                        }
                    }
                }, {
                    asHTML: false
                }),
                'https://h.yandex-team.ru/?http%3A%2F%2Fexample.com'
            );
        });
    });
});
