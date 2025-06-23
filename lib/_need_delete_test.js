const unipika = require('./unipika');
const settings = {
    escapeWhitespace: false,
    decodeUTF8: true,
    binaryAsHex: true,
    escapeYQLStrings: true,
    omitStructNull: true,
    copyFormattedValue: false,
    relativeScaleY: true,
    srcUrlPatterns: [
        '^https://([\\w-]+.)?s3.yandex.net(:443)?/',
        '^https://([\\w-]+.)?(s3(-staff)?.)?mdst?.yandex.net(:443)?/',
        '^https?://(proxy.)?sandbox.yandex-team.ru(:443)?/',
        '^https://paste.yandex-team.ru(:443)?/',
        '^https://(beta.)?nirvana.yandex-team.ru(:443)?/',
        '^https://asdb.hitman.yandex-team.ru(:443)?/',
        '^https://(storage|grafana|bb|fml|watson-api|stat).yandex-team.ru(:443)?/',
        '^https://raw.github.yandex-team.ru(:443)?/',
        '^https://speechbase.voicetech.yandex-team.ru/getaudio/',
        '^https://static-maps.yandex.ru/',
        '^https://avatars.dzeninfra.ru/',
    ],
    customNumberFormatter: null,
};

const test = {
    $type: 'yql.tagged',
    $tag: 'foo',
    $value: {
        $type: 'yql.null',
        $value: null,
        $optional: 1,
    },
    $optional: 1,
};

const formatTest = unipika.format(test, {
    ...settings,
    asHTML: false,
}); // возвращает [null], вместо [[null]]

console.log('formatTest :>> ', formatTest);
