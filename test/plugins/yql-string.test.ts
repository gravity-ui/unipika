import { describe, expect, test } from "@jest/globals";
const unipika = require("../..")();

describe("plugins", function () {
  describe("yql-string", function () {
    var _format = unipika.format;

    test("simple", function () {
      expect(
        _format(
          {
            $type: "yql.string",
            $value: "Some value",
          },
          {
            asHTML: false,
          }
        )
      ).toBe('"Some value"');
    });

    test("string escape", function () {
      expect(
        _format(
          {
            $type: "yql.string",
            $value: '\n\t\u0000\\"',
          },
          {
            asHTML: false,
          }
        )
      ).toBe('"\\n\\t\\u0000\\\\\\""');
    });

    test("string escape no", function () {
      expect(
        _format(
          {
            $type: "yql.string",
            $value: '\n\t\u0000\\"',
          },
          {
            asHTML: false,
            escapeYQLStrings: false,
          }
        )
      ).toBe('"\n\t\u0000\\""');
    });

    test("binary as hex", function () {
      expect(
        _format(
          {
            $binary: true,
            $type: "yql.string",
            $value: btoa("Some value"),
          },
          {
            asHTML: false,
            binaryAsHex: true,
          }
        )
      ).toBe("53 6f 6d 65 20 76 61 6c 75 65");
    });

    test("binary as is", function () {
      expect(
        _format(
          {
            $binary: true,
            $type: "yql.string",
            $value: btoa("Some value"),
          },
          {
            asHTML: false,
            binaryAsHex: false,
          }
        )
      ).toBe("Some value");
    });

    test("incorrect binary", function () {
      var value = {
        $binary: true,
        $type: "yql.string",
        $value: "Not base64-encoded string",
      };

      expect(function () {
        _format(value, { binaryAsHex: true });
      }).toThrowError();

      expect(function () {
        _format(value, { binaryAsHex: false });
      }).toThrowError(Error);
    });
  });
});
