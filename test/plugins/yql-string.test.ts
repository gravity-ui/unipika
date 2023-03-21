/* global chai, describe, it, beforeEach */
var assert = chai.assert;

describe('plugins', function () {
    describe('yql-string', function () {
        var _format = unipika.format;

        it('simple', function () {
            assert.strictEqual(
                _format({
                    $type: 'yql.string',
                    $value: 'Some value'
                }, {
                    asHTML: false
                }),
                '"Some value"'
            );
        });

        it('string escape', function () {
            assert.strictEqual(
                _format({
                    $type: 'yql.string',
                    $value: '\n\t\u0000\\\"'
                }, {
                    asHTML: false
                }),
                '"\\n\\t\\u0000\\\\\\\""'
            );
        });

        it('string escape no', function () {
            assert.strictEqual(
                _format({
                    $type: 'yql.string',
                    $value: '\n\t\u0000\\\"'
                }, {
                    asHTML: false,
                    escapeYQLStrings: false
                }),
                '"\n\t\u0000\\\""'
            );
        });

        it('binary as hex', function () {
            assert.strictEqual(
                _format({
                    $binary: true,
                    $type: 'yql.string',
                    $value: btoa('Some value')
                }, {
                    asHTML: false,
                    binaryAsHex: true
                }),
                '53 6f 6d 65 20 76 61 6c 75 65'
            );
        });

        it('binary as is', function () {
            assert.strictEqual(
                _format({
                    $binary: true,
                    $type: 'yql.string',
                    $value: btoa('Some value')
                }, {
                    asHTML: false,
                    binaryAsHex: false
                }),
                'Some value'
            );
        });

        it('incorrect binary', function () {
            var value = {
                $binary: true,
                $type: 'yql.string',
                $value: 'Not base64-encoded string'
            };

            assert.throws(function () {
                _format(value, { binaryAsHex: true });
            }, Error);

            assert.throws(function () {
                _format(value, { binaryAsHex: false });
            }, Error);
        });
    });
});
