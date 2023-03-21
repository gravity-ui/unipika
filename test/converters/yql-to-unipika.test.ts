import { describe, expect, test, beforeEach } from "@jest/globals";
const unipika = require("../..")();

describe("converters", function () {
  describe("yql-to-unipika", function () {
    var yqlToYson = unipika.converters.yql;

    test("Boolean", function () {
      var result = yqlToYson([true, ["DataType", "Bool"]]);
      expect(result).toEqual({
        $type: "yql.bool",
        $value: true,
      });
    });

    test("String", function () {
      var result = yqlToYson(["Some value", ["DataType", "String"]]);
      expect(result).toEqual({
        $type: "yql.string",
        $value: "Some value",
      });
    });

    test("Utf8", function () {
      var result = yqlToYson(["Some value", ["DataType", "Utf8"]]);
      expect(result).toEqual({
        $type: "yql.utf8",
        $value: "Some value",
      });
    });

    test("Binary string", function () {
      var result = yqlToYson([["Some value"], ["DataType", "String"]]);
      expect(result).toEqual({
        $binary: true,
        $type: "yql.string",
        $value: "Some value",
      });
    });

    test("Optional", function () {
      var dataType = ["OptionalType", ["DataType", "Int64"]];
      expect(yqlToYson([[], dataType])).toEqual({
        $type: "yql.null",
        $value: null,
      });
      expect(yqlToYson([null, dataType])).toEqual({
        $type: "yql.null",
        $value: null,
      });
      expect(yqlToYson([["42"], dataType])).toEqual({
        $type: "yql.int64",
        $value: "42",
        $optional: 1,
      });
    });

    test("Struct", function () {
      var dataType = [
        "StructType",
        [
          ["a", ["DataType", "Int64"]],
          ["b", ["DataType", "Double"]],
          ["c", ["DataType", "String"]],
        ],
      ];
      var data = ["2", "3.1", "x"];
      var result = {
        $type: "yql.struct",
        $value: [
          [
            {
              $type: "yql.string",
              $key: true,
              $value: "a",
            },
            {
              $type: "yql.int64",
              $value: "2",
            },
          ],
          [
            {
              $type: "yql.string",
              $key: true,
              $value: "b",
            },
            {
              $type: "yql.double",
              $value: "3.1",
            },
          ],
          [
            {
              $type: "yql.string",
              $key: true,
              $value: "c",
            },
            {
              $type: "yql.string",
              $value: "x",
            },
          ],
        ],
      };
      expect(yqlToYson([data, dataType])).toEqual(result);
    });

    test("Tuple", function () {
      var dataType = [
        "TupleType",
        [
          ["DataType", "Int64"],
          ["DataType", "String"],
          ["DataType", "Double"],
        ],
      ];
      var data = ["1", "foo", "4.321"];
      var result = {
        $type: "yql.tuple",
        $value: [
          {
            $type: "yql.int64",
            $value: "1",
          },
          {
            $type: "yql.string",
            $value: "foo",
          },
          {
            $type: "yql.double",
            $value: "4.321",
          },
        ],
      };
      expect(yqlToYson([data, dataType])).toEqual(result);
    });

    test("List", function () {
      var dataType = ["ListType", ["DataType", "String"]];
      var data = ["a", "при\nем", ["/wD+hTI="], "1"];
      var result = {
        $type: "yql.list",
        $value: [
          {
            $type: "yql.string",
            $value: "a",
          },
          {
            $type: "yql.string",
            $value: "при\nем",
          },
          {
            $binary: true,
            $type: "yql.string",
            $value: "/wD+hTI=",
          },
          {
            $type: "yql.string",
            $value: "1",
          },
        ],
      };
      expect(yqlToYson([data, dataType])).toEqual(result);
    });

    test("Dict", function () {
      var dataType = [
        "DictType",
        ["DataType", "Uint64"],
        ["DataType", "Int64"],
      ];
      var data = [
        ["0", "1"],
        ["1", "2"],
        ["2", "3"],
        ["3", "4"],
        ["4", "3"],
        ["5", "2"],
      ];
      var result = {
        $type: "yql.dict",
        $value: [
          [
            {
              $type: "yql.uint64",
              $value: "0",
            },
            {
              $type: "yql.int64",
              $value: "1",
            },
          ],
          [
            {
              $type: "yql.uint64",
              $value: "1",
            },
            {
              $type: "yql.int64",
              $value: "2",
            },
          ],
          [
            {
              $type: "yql.uint64",
              $value: "2",
            },
            {
              $type: "yql.int64",
              $value: "3",
            },
          ],
          [
            {
              $type: "yql.uint64",
              $value: "3",
            },
            {
              $type: "yql.int64",
              $value: "4",
            },
          ],
          [
            {
              $type: "yql.uint64",
              $value: "4",
            },
            {
              $type: "yql.int64",
              $value: "3",
            },
          ],
          [
            {
              $type: "yql.uint64",
              $value: "5",
            },
            {
              $type: "yql.int64",
              $value: "2",
            },
          ],
        ],
      };
      expect(yqlToYson([data, dataType])).toEqual(result);
    });

    test("Stream", function () {
      var dataType = ["StreamType", ["DataType", "Int32"]];
      var data = ["1", "2"];
      var result = {
        $type: "yql.stream",
        $value: [
          {
            $type: "yql.int32",
            $value: "1",
          },
          {
            $type: "yql.int32",
            $value: "2",
          },
        ],
      };
      expect(yqlToYson([data, dataType])).toEqual(result);
    });

    test("Variant Tuple", function () {
      // Тесты дополнительно завернуты в StreamType, чтобы проверить одновременную конвертацию
      // разных индексов данных на одном примере
      var dataType = [
        "StreamType",
        [
          "VariantType",
          [
            "TupleType",
            [
              ["DataType", "Int32"],
              ["DataType", "Int64"],
            ],
          ],
        ],
      ];
      var data = [
        ["0", "1"],
        ["1", "1"],
      ];
      var result = {
        $type: "yql.stream",
        $value: [
          {
            $type: "yql.variant",
            $value: [
              [
                {
                  $type: "yql.int32",
                  $key: true,
                  $value: "0",
                },
                {
                  $type: "yql.int32",
                  $value: "1",
                },
              ],
            ],
          },
          {
            $type: "yql.variant",
            $value: [
              [
                {
                  $type: "yql.int32",
                  $key: true,
                  $value: "1",
                },
                {
                  $type: "yql.int64",
                  $value: "1",
                },
              ],
            ],
          },
        ],
      };
      expect(yqlToYson([data, dataType])).toEqual(result);
    });

    test("Variant Struct", function () {
      // Тесты дополнительно завернуты в StreamType, чтобы проверить одновременную конвертацию
      // разных индексов данных на одном примере
      var dataType = [
        "StreamType",
        [
          "VariantType",
          [
            "StructType",
            [
              ["a", ["DataType", "Int32"]],
              ["b", ["DataType", "String"]],
            ],
          ],
        ],
      ];
      var data = [
        ["0", "34"],
        ["1", "qwe"],
      ];
      var result = {
        $type: "yql.stream",
        $value: [
          {
            $type: "yql.variant",
            $value: [
              [
                {
                  $type: "yql.string",
                  $key: true,
                  $value: "a",
                },
                {
                  $type: "yql.int32",
                  $value: "34",
                },
              ],
            ],
          },
          {
            $type: "yql.variant",
            $value: [
              [
                {
                  $type: "yql.string",
                  $key: true,
                  $value: "b",
                },
                {
                  $type: "yql.string",
                  $value: "qwe",
                },
              ],
            ],
          },
        ],
      };
      expect(yqlToYson([data, dataType])).toEqual(result);
    });

    test("Enum", function () {
      var dataType = [
        "VariantType",
        [
          "StructType",
          [
            ["a", ["VoidType"]],
            ["b", ["VoidType"]],
          ],
        ],
      ];
      var data = ["1", "Void"];
      var result = {
        $type: "yql.enum",
        $value: "b",
      };
      expect(yqlToYson([data, dataType])).toEqual(result);
    });

    test("Set", function () {
      var dataType = ["DictType", ["DataType", "Int32"], ["VoidType"]];
      var data = [
        ["2", "Void"],
        ["1", "Void"],
      ];
      var result = {
        $type: "yql.set",
        $value: [
          {
            $type: "yql.int32",
            $value: "2",
          },
          {
            $type: "yql.int32",
            $value: "1",
          },
        ],
      };
      console.log(yqlToYson([data, dataType]));
      expect(yqlToYson([data, dataType])).toEqual(result);
    });

    test("Void Type", function () {
      var dataType = ["VoidType"];
      var data = "Void";
      var result = {
        $type: "yql.null",
        $value: null,
      };
      expect(yqlToYson([data, dataType])).toEqual(result);
    });

    test("Null Type", function () {
      var dataType = ["NullType"];
      var data = "Void";
      var result = {
        $type: "yql.null",
        $value: null,
      };
      expect(yqlToYson([data, dataType])).toEqual(result);
    });

    test("TaggedType", function () {
      var dataType = ["TaggedType", "image/jpeg", ["DataType", "String"]];
      var data = "image";
      var result = {
        $type: "yql.tagged",
        $tag: "image/jpeg",
        $value: {
          $type: "yql.string",
          $value: "image",
        },
      };
      expect(yqlToYson([data, dataType])).toEqual(result);
    });

    test("TaggedType: named url", function () {
      var dataType = [
        "TaggedType",
        "url",
        [
          "StructType",
          [
            ["href", ["DataType", "String"]],
            ["text", ["DataType", "String"]],
            ["title", ["DataType", "String"]],
          ],
        ],
      ];
      var data = ["http://foo.com", "Foo", "Foo title"];
      var result = {
        $type: "yql.tagged",
        $tag: "url",
        $value: {
          $type: "tag_value",
          $value: {
            href: "http://foo.com",
            text: "Foo",
            title: "Foo title",
          },
        },
      };

      expect(yqlToYson([data, dataType])).toEqual(result);
    });

    test("TaggedType: named url without href", function () {
      var dataType = [
        "TaggedType",
        "url",
        [
          "StructType",
          [
            ["text", ["DataType", "String"]],
            ["title", ["DataType", "String"]],
          ],
        ],
      ];
      var data = ["Foo", "Foo title"];
      var result = {
        $type: "yql.struct",
        $value: [
          [
            { $type: "yql.string", $value: "text", $key: true },
            { $type: "yql.string", $value: "Foo" },
          ],
          [
            { $type: "yql.string", $value: "title", $key: true },
            { $type: "yql.string", $value: "Foo title" },
          ],
        ],
      };

      expect(yqlToYson([data, dataType])).toEqual(result);
    });

    test("TaggedType: struct tagged as videourl", function () {
      var dataType = [
        "TaggedType",
        "videourl",
        [
          "StructType",
          [
            ["src", ["DataType", "String"]],
            ["width", ["DataType", "Int32"]],
          ],
        ],
      ];
      var data = ["http://foo.com", "1200"];
      var result = {
        $type: "yql.tagged",
        $tag: "videourl",
        $value: {
          $type: "tag_value",
          $value: {
            src: "http://foo.com",
            width: "1200",
          },
        },
      };

      expect(yqlToYson([data, dataType])).toEqual(result);
    });

    test("TaggedType: struct tagged as videourl without src", function () {
      var dataType = [
        "TaggedType",
        "videourl",
        [
          "StructType",
          [
            ["text", ["DataType", "String"]],
            ["title", ["DataType", "String"]],
          ],
        ],
      ];
      var data = ["Foo", "Foo title"];
      var result = {
        $type: "yql.struct",
        $value: [
          [
            { $type: "yql.string", $value: "text", $key: true },
            { $type: "yql.string", $value: "Foo" },
          ],
          [
            { $type: "yql.string", $value: "title", $key: true },
            { $type: "yql.string", $value: "Foo title" },
          ],
        ],
      };

      expect(yqlToYson([data, dataType])).toEqual(result);
    });

    test("Struct: omitStructNull", function () {
      var dataType = [
        "StructType",
        [
          ["a", ["OptionalType", ["DataType", "Int64"]]],
          ["b", ["DataType", "Int64"]],
        ],
      ];
      var data = [[], "2"];
      var resultWithoutParam = {
        $type: "yql.struct",
        $value: [
          [
            {
              $type: "yql.string",
              $key: true,
              $value: "a",
            },
            {
              $type: "yql.null",
              $value: null,
            },
          ],
          [
            {
              $type: "yql.string",
              $key: true,
              $value: "b",
            },
            {
              $type: "yql.int64",
              $value: "2",
            },
          ],
        ],
      };
      var resultWithParam = {
        $type: "yql.struct",
        $value: [
          [
            {
              $type: "yql.string",
              $key: true,
              $value: "b",
            },
            {
              $type: "yql.int64",
              $value: "2",
            },
          ],
        ],
      };
      expect(yqlToYson([data, dataType])).toEqual(resultWithoutParam);
      expect(yqlToYson([data, dataType], { omitStructNull: true })).toEqual(
        resultWithParam
      );
    });

    test("Truncated List", function () {
      var dataType = ["ListType", ["DataType", "String"]];
      var data = ["1", "2", "3", "4"];
      var result = {
        $type: "yql.list",
        $value: [
          {
            $type: "yql.string",
            $value: "1",
          },
          {
            $type: "yql.string",
            $value: "2",
          },
        ],
        $incomplete: true,
      };
      expect(yqlToYson([data, dataType], { maxListSize: 2 })).toEqual(result);
    });
  });
});