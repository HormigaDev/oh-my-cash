module.exports = {
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
    $email: {
        type: 'string',
        length: [5, 100],
        rules: [
            {
                validation: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
                onFail: '$fullPath não é um email válido',
            },
        ],
    },
    $password: {
        type: 'string',
        length: [12, 255],
        rules: [
            {
                validation: (value) =>
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/.test(value),
                onFail: '$fullPath deve ser uma senha com ao menos: 1 minúscula, 1 maiúscula, 1 número, 1 caracter especial (!@#$%^&*()_+-=[]{}|;:\'",.<>/?).',
            },
        ],
    },
};
