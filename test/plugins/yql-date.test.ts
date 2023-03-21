import { describe, expect, test } from "@jest/globals";
const unipika = require("../..")();

describe("plugins", function () {
  describe("yql-date", function () {
    var _format = unipika.format;

    test("Date", function () {
      expect(
        _format(
          {
            $type: "yql.date",
            $value: "10957",
          },
          {
            asHTML: false,
          }
        )
      ).toBe("2000-01-01");
    });

    test("Datetime", function () {
      expect(
        _format(
          {
            $type: "yql.datetime",
            $value: "946688523",
          },
          {
            asHTML: false,
          }
        )
      ).toBe("2000-01-01T01:02:03Z");
    });

    test("Timestamp", function () {
      expect(
        _format(
          {
            $type: "yql.timestamp",
            $value: "946688523432001",
          },
          {
            asHTML: false,
          }
        )
      ).toBe("2000-01-01T01:02:03.432001Z");
    });

    test("Interval multiples", function () {
      expect(
        _format(
          {
            $type: "yql.interval",
            $value: "1506703188146832",
          },
          {
            asHTML: false,
          }
        )
      ).toBe(
        "17438\u00a0days 16\u00a0hours 39\u00a0minutes 48\u00a0seconds 146832\u00a0microseconds"
      );
    });

    test("Interval singles", function () {
      _format(
        {
          $type: "yql.interval",
          $value: "90061000001",
        },
        {
          asHTML: false,
        }
      ),
        "1\u00a0day 1\u00a0hour 1\u00a0minute 1\u00a0second 1\u00a0microsecond";
    });

    test("Interval negative", function () {
      expect(
        _format(
          {
            $type: "yql.interval",
            $value: "-90000000001",
          },
          {
            asHTML: false,
          }
        )
      ).toBe("-1\u00a0day 1\u00a0hour 1\u00a0microsecond");
    });

    test("Interval zero", function () {
      expect(
        _format(
          {
            $type: "yql.interval",
            $value: "0",
          },
          {
            asHTML: false,
          }
        )
      ).toBe("0");
    });

    test("Invalid date", function () {
      expect(
        _format(
          {
            $type: "yql.date",
            $value: "1e30",
          },
          {
            asHTML: false,
          }
        )
      ).toBe("Invalid date");
    });

    test("Invalid datetime", function () {
      expect(
        _format(
          {
            $type: "yql.datetime",
            $value: "1e30",
          },
          {
            asHTML: false,
          }
        )
      ).toBe("Invalid datetime");
    });

    test("Invalid timestamp", function () {
      expect(
        _format(
          {
            $type: "yql.timestamp",
            $value: "1e30",
          },
          {
            asHTML: false,
          }
        )
      ).toBe("Invalid timestamp");
    });
  });
});
