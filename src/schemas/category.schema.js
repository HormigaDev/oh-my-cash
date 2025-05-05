module.exports = {
    $userId: {
        type: 'number',
        rules: [
            {
                validation: (value) => value > 0,
                onFail: '$fullPath deve ser um número maior que zero.',
            },
        ],
    },
    $name: {
        type: 'string',
        length: [2, 100],
        rules: [
            {
                validation: (value) => /^[a-zA-Z0-9 ]+$/.test(value),
                onFail: '$fullPath deve ser alfanumérico (pode conter espaços)',
            },
        ],
    },
};
