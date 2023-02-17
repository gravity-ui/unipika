/* global chai, describe, it, beforeEach */
var assert = chai.assert;

function stringifyOrEmpty(obj) {
    return obj !== undefined ? " " + JSON.stringify(obj) : "";
}

describe("format", function () {
    var _serialize = unipika.formatValue;

    function runTestCases(io, format, settings) {
        io.forEach(function (output, input) {
            it(
                "Gives correct output for: " +
                    JSON.stringify(input) +
                    stringifyOrEmpty(settings),
                function () {
                    assert.strictEqual(
                        output[format].plain,
                        testUtils.toPlainText(
                            _serialize,
                            input,
                            format,
                            settings
                        )
                    );
                    assert.strictEqual(
                        output[format].html,
                        testUtils.toHTMLText(
                            _serialize,
                            input,
                            format,
                            settings
                        )
                    );
                }
            );
        });
    }

    describe("formatOptional", function () {
        it("Exports", function () {
            assert.isDefined(_serialize);
        });

        it("isFunction", function () {
            assert.isFunction(_serialize);
        });

        describe("Test optional type output", function () {
            var io = new Map();

            //null should be displayed with as many square brackets as $optional property equals
            io.set(
                { $type: "yql.null", $value: null, $optional: 2 },
                {
                    json: {
                        plain: "[[null]]",
                        html: '<span class="optional">[[</span><span class="yql_null">null</span><span class="optional">]]</span>',
                    },
                }
            );
            io.set(
                { $type: "yql.null", $value: null, $optional: 1 },
                {
                    json: {
                        plain: "[null]",
                        html: '<span class="optional">[</span><span class="yql_null">null</span><span class="optional">]</span>',
                    },
                }
            );
            io.set(
                { $type: "yql.null", $value: null, $optional: 0 },
                {
                    json: {
                        plain: null,
                        html: '<span class="yql_null">null</span>',
                    },
                }
            );
            //non-null values should de displayed without square brackets
            io.set(
                { $type: "yql.int32", $value: 5, $optional: 2 },
                {
                    json: {
                        plain: 5,
                        html: '<span class="yql_int32">5</span>',
                    },
                }
            );
            io.set(
                { $type: "yql.int32", $value: 5, $optional: 0 },
                {
                    json: {
                        plain: 5,
                        html: '<span class="yql_int32">5</span>',
                    },
                }
            );
            runTestCases(io, "json", {
                break: false,
                indent: 0,
                nonBreakingIndent: false,
            });
        });
    });
});
