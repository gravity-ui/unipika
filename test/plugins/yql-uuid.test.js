/* global chai, describe, it, beforeEach */
var assert = chai.assert;

describe('plugins', function () {
    describe('yql-uuid', function () {
        var _format = unipika.format;

        it('simple', function () {
            assert.strictEqual(
                _format({
                    $type: 'yql.uuid',
                    $value: atob('mbzuoAuc+E67bWu5vTgKEQ==')
                }, {
                    asHTML: false
                }),
                'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
            );
        });
    });
});
