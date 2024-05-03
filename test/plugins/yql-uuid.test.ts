import {describe, expect, test} from '@jest/globals';

const unipika = require('../..')();

describe('plugins', function () {
    describe('yql-uuid', function () {
        const _format = unipika.format;

        test('simple', function () {
            expect(
                _format(
                    {
                        $type: 'yql.uuid',
                        $value: atob('mbzuoAuc+E67bWu5vTgKEQ=='),
                    },
                    {
                        asHTML: false,
                    },
                ),
            ).toBe('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
        });
    });
});
