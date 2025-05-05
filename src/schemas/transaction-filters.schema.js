const IdValidation = {
    type: 'number',
    convert: true,
    rules: [
        {
            validation: (value) => Number.isInteger(value) && value > 0,
            onFail: '$fullPath deve ser um número inteiro positivo.',
        },
    ],
};

module.exports = {
    _$categoryId: IdValidation,

    _$type: {
        type: ['string', 'object'],
        rules: [
            {
                validation: (value) =>
                    ['income', 'expense'].includes(value) ||
                    (Array.isArray(value) && value.every((v) => ['income', 'expense'].includes(v))),
                onFail: '$fullPath deve ser "income", "expense" ou uma lista destes.',
            },
        ],
    },

    _$amount: {
        type: 'object',
        $schema: {
            $value: {
                type: 'number',
                convert: true,
            },
            $operator: {
                type: 'string',
                rules: [
                    {
                        validation: (value) => ['=', '!=', '<', '<=', '>', '>='].includes(value),
                        onFail: '$fullPath operador inválido.',
                    },
                ],
            },
        },
    },

    _$date: {
        type: 'object',
        $schema: {
            $value: {
                type: 'string',
                rules: [
                    {
                        validation: (value) => /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value),
                        onFail: '$fullPath deve estar no formato yyyy-mm-dd.',
                    },
                    {
                        validation(value) {
                            const date = new Date(value);
                            return (
                                !isNaN(date.getTime()) && value === date.toISOString().split('T')[0]
                            );
                        },
                        onFail: '$fullPath não representa uma data real válida.',
                    },
                ],
            },
            $operator: {
                type: 'string',
                rules: [
                    {
                        validation: (value) => ['=', '!=', '<', '<=', '>', '>='].includes(value),
                        onFail: '$fullPath operador inválido.',
                    },
                ],
            },
        },
    },

    _$dateRange: {
        type: 'object',
        $schema: {
            _$from: {
                type: 'string',
                rules: [
                    {
                        validation: (value) => /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value),
                        onFail: '$fullPath deve estar no formato yyyy-mm-dd.',
                    },
                ],
            },
            _$to: {
                type: 'string',
                rules: [
                    {
                        validation: (value) => /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value),
                        onFail: '$fullPath deve estar no formato yyyy-mm-dd.',
                    },
                ],
            },
        },
    },

    _$description: {
        type: 'string',
        length: [1, 255],
    },

    $userId: IdValidation,

    $pagination: {
        type: 'object',
        $schema: {
            $limit: {
                type: 'number',
                convert: true,
                rules: [
                    {
                        validation: (value) => Number.isInteger(value) && value > 0,
                        onFail: '$fullPath deve ser um inteiro positivo.',
                    },
                    {
                        validation: (value) => [10, 20, 30, 50, 100].includes(value),
                        onFail: '$fullPath deve ser um dos seguintes valores: 10, 20, 30, 50 ou 100.',
                    },
                ],
            },
            $page: {
                type: 'number',
                convert: true,
                rules: [
                    {
                        validation: (value) => Number.isInteger(value) && value > 0,
                        onFail: '$fullPath deve ser um inteiro positivo.',
                    },
                ],
            },
        },
    },

    $orderBy: {
        type: 'object',
        $schema: {
            $order: {
                type: 'string',
                rules: [
                    {
                        validation: (value) => ['asc', 'desc'].includes(value),
                        onFail: '$fullPath deve ser "asc" ou "desc".',
                    },
                ],
            },
            $column: {
                type: 'string',
                rules: [
                    {
                        validation: (value) => ['date', 'amount', 'type'].includes(value),
                        onFail: '$fullPath deve ser uma das colunas válidas: "date", "amount", "type".',
                    },
                ],
            },
        },
    },
};
