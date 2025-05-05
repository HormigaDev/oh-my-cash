module.exports = {
    $type: {
        type: 'string',
        rules: [
            {
                validation: (value) => ['income', 'expense'].includes(value),
                onFail: '$fullPath deve ser "income" ou "expense".',
            },
        ],
    },
    $userId: {
        type: 'number',
        convert: true,
        rules: [
            {
                validation: (value) => parseInt(value) > 0,
                onFail: '$fullPath deve ser maior que zero.',
            },
        ],
    },
    $amount: {
        type: 'number',
        convert: true,
        rules: [
            {
                validation: (value) => parseFloat(value) !== 0,
                onFail: '$fullPath valor da transação não pode estar zerado.',
            },
        ],
    },
    _$date: {
        type: 'string',
        rules: [
            {
                validation: (value) => /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value),
                onFail: '$fullPath deve ser uma data válida no formato yyyy-mm-dd.',
            },
            {
                validation(value) {
                    const date = new Date(value);
                    return !isNaN(date.getTime()) && value === date.toISOString().split('T')[0];
                },
                onFail: '$fullPath não representa uma data real válida.',
            },
        ],
    },
    $description: {
        type: 'string',
        length: [10, 5000],
    },
    $categoryId: {
        type: 'number',
        convert: true,
        rules: [
            {
                validation: (value) => parseInt(value) > 0,
                onFail: '$fullPath deve ser maior que zero.',
            },
        ],
    },
};
