module.exports = [
    {
        name: 'asHTML',
        type: 'checkbox',
        value: true
    },
    {
        name: 'break',
        type: 'checkbox',
        value: true
    },
    {
        name: 'indent',
        type: 'radiobutton',
        options: [2, 4],
        value: 4
    },
    {
        name: 'format',
        type: 'radiobutton',
        options: ['json', 'yson'],
        value: 'json'
    },
    {
        name: 'showDecoded',
        type: 'checkbox',
        value: true
    },
    {
        name: 'binaryAsHex',
        type: 'checkbox',
        value: true
    },
    {
        name: 'compact',
        type: 'checkbox',
        value: false
    },
    {
        name: 'escapeWhitespace',
        type: 'checkbox',
        value: true
    },
    {
        name: 'escapeYQLStrings',
        type: 'checkbox',
        value: true
    },
    {
        name: 'nonBreakingIndent',
        type: 'checkbox',
        value: true
    },
    {
        name: 'omitStructNull',
        type: 'checkbox',
        value: false
    },
    {
        name: 'maxListSize',
        type: 'radiobutton',
        options: [0, 1, 2, 3],
        value: 0
    },
    {
        name: 'maxStringSize',
        type: 'radiobutton',
        options: [0, 100, 500, 10000]
    },
    {
        name: 'limitMapLength',
        type: 'radiobutton',
        options: [0, 1, 3, 10],
        value: 0
    },
    {
        name: 'limitListLength',
        type: 'radiobutton',
        options: [0, 1, 3, 10],
        value: 0
    }
];
