import { describe, expect, test } from "@jest/globals";
const unipika = require("../..")();

describe("plugins", function () {
  describe("tagged", function () {
    var _format = unipika.format;

    test("String url", function () {
      expect(
        _format(
          {
            $type: "tagged",
            $tag: "url",
            $value: {
              $type: "yql.string",
              $value: "http://example.com",
            },
          },
          {
            asHTML: true,
          }
        )
      ).toBe(
        '<a class="yql_tagged tagged tag_url" target="_blank" href="https://h.yandex-team.ru/?http%3A%2F%2Fexample.com">http://example.com</a>'
      );
    });

    test("Named url without text", function () {
      expect(
        _format(
          {
            $type: "tagged",
            $tag: "url",
            $value: {
              $type: "tag_value",
              $value: {
                href: "http://example.com",
              },
            },
          },
          {
            asHTML: true,
          }
        )
      ).toBe(
        '<a class="yql_tagged tagged tag_url" target="_blank" href="https://h.yandex-team.ru/?http%3A%2F%2Fexample.com">http://example.com</a>'
      );
    });

    test("Named url with text", function () {
      expect(
        _format(
          {
            $type: "tagged",
            $tag: "url",
            $value: {
              $type: "tag_value",
              $value: {
                href: "http://example.com",
                text: "Example",
                title: "Abc",
              },
            },
          },
          {
            asHTML: true,
          }
        )
      ).toBe(
        '<a class="yql_tagged tagged tag_url" target="_blank" href="https://h.yandex-team.ru/?http%3A%2F%2Fexample.com" title="Abc">Example</a>'
      );
    });

    test("Url with html special symbols", function () {
      expect(
        _format(
          {
            $type: "tagged",
            $tag: "url",
            $value: {
              $type: "tag_value",
              $value: {
                text: "Example",
                href: "http://example.com/?param1=<>\"&param2=`'",
              },
            },
          },
          {
            asHTML: true,
          }
        )
      ).toBe(
        '<a class="yql_tagged tagged tag_url" target="_blank" href="https://h.yandex-team.ru/?http%3A%2F%2Fexample.com%2F%3Fparam1%3D%3C%3E%22%26param2%3D%60\'">Example</a>'
      );
    });

    test("Imageurl as plain output", function () {
      expect(
        _format(
          {
            $type: "tagged",
            $tag: "imageurl",
            $value: {
              $type: "tag_value",
              $value: {
                maxHeight: "200",
                maxWidth: "200",
                src: "http://example.com",
              },
            },
          },
          {
            asHTML: false,
          }
        )
      ).toBe("https://h.yandex-team.ru/?http%3A%2F%2Fexample.com");
    });

    test("Image blob as plain output", function () {
      expect(
        _format(
          {
            $type: "tagged",
            $tag: "image/svg",
            $value: {
              $type: "tag_value",
              $value: {
                maxHeight: "200",
                maxWidth: "200",
                src: '<svg><circle r="2" x="0" y="0"/></svg>',
              },
            },
          },
          {
            asHTML: false,
          }
        )
      ).toBe(
        "data:image/svg+xml;base64,&lt;svg&gt;&lt;circle r=&quot;2&quot; x=&quot;0&quot; y=&quot;0&quot;/&gt;&lt;/svg&gt;"
      );
    });

    test("String video url", function () {
      expect(
        _format(
          {
            $type: "tagged",
            $tag: "videourl",
            $value: {
              $type: "yql.string",
              $value: "http://example.com",
            },
          },
          {
            asHTML: true,
          }
        )
      ).toBe(
        '<video class="yql_tagged tagged tag_video" controls src="https://h.yandex-team.ru/?http%3A%2F%2Fexample.com"></video>'
      );
    });

    test("String video url raw", function () {
      expect(
        _format(
          {
            $type: "tagged",
            $tag: "videourl",
            $value: {
              $type: "yql.string",
              $value: "http://example.com",
            },
          },
          {
            asHTML: false,
          }
        )
      ).toBe("https://h.yandex-team.ru/?http%3A%2F%2Fexample.com");
    });

    test("Struct tagged as video", function () {
      expect(
        _format(
          {
            $type: "tagged",
            $tag: "videourl",
            $value: {
              $type: "tag_value",
              $value: {
                src: "http://example.com",
                width: 800,
                height: 600,
              },
            },
          },
          {
            asHTML: true,
          }
        )
      ).toBe(
        '<video class="yql_tagged tagged tag_video" controls src="https://h.yandex-team.ru/?http%3A%2F%2Fexample.com" style="width:800px;height:600px"></video>'
      );
    });

    test("Struct tagged as video raw", function () {
      expect(
        _format(
          {
            $type: "tagged",
            $tag: "videourl",
            $value: {
              $type: "tag_value",
              $value: {
                src: "http://example.com",
                width: 800,
                height: 600,
              },
            },
          },
          {
            asHTML: false,
          }
        )
      ).toBe("https://h.yandex-team.ru/?http%3A%2F%2Fexample.com");
    });
  });
});
