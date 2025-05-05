const { BadRequestError, UnprocessableEntityError } = require('./errors');

class Service {
    constructor() {}

    validate(model, schema, basePath = '') {
        for (const [key, rules] of Object.entries(schema)) {
            if (!key.startsWith('$') && !key.startsWith('_$')) continue;

            const isOptional = key.startsWith('_$');
            const propName = key.replace(/^[_$]+/, '');
            let value = model[propName];
            const fullPath = basePath ? `${basePath}.${propName}` : propName;

            if (isOptional && value === undefined) continue;

            if (!isOptional && value === undefined) {
                throw new BadRequestError(`${fullPath} é obrigatório, mas não foi enviado.`);
            }

            if (rules.$schema) {
                this.validate(value || {}, rules.$schema, fullPath);
                continue;
            }

            if (rules.type) {
                const types = Array.isArray(rules.type) ? rules.type : [rules.type];

                if (!types.includes(typeof value)) {
                    if (rules.convert) {
                        const converters = {
                            number: Number,
                            string: String,
                            boolean: (v) => {
                                if (v === 'true' || v === true) return true;
                                if (v === 'false' || v === false) return false;
                                throw new Error('Conversão para booleano inválida');
                            },
                        };

                        for (const targetType of types) {
                            try {
                                if (converters[targetType]) {
                                    const converted = converters[targetType](value);
                                    if (typeof converted === targetType) {
                                        value = converted;
                                        model[propName] = converted;
                                        break;
                                    }
                                }
                            } catch {}
                        }
                    }

                    if (!types.includes(typeof value)) {
                        throw new BadRequestError(
                            `${fullPath} deve ser do tipo ${types.join(
                                ' ou ',
                            )}. Tipo enviado: ${typeof value}`,
                        );
                    }
                }
            }

            if (typeof value === 'string' || Array.isArray(value)) {
                const len = value.length;
                if (Array.isArray(rules.length)) {
                    const [min, max] = rules.length;
                    if (len < min || len > max) {
                        throw new BadRequestError(
                            `${fullPath} deve ter comprimento entre ${min} e ${max}.`,
                        );
                    }
                } else if (typeof rules.length === 'number') {
                    if (len !== rules.length) {
                        throw new BadRequestError(
                            `${fullPath} deve ter comprimento máximo de ${rules.length}`,
                        );
                    }
                }
            }

            if (Array.isArray(rules.rules)) {
                for (const ruleObj of rules.rules) {
                    try {
                        if (!ruleObj.validation(value)) {
                            throw new BadRequestError(
                                ruleObj.onFail.replace('$fullPath', `"${fullPath}"`) ||
                                    `${fullPath} falhou em uma validação das regras.`,
                            );
                        }
                    } catch (error) {
                        if (error instanceof BadRequestError) throw error;
                        throw new UnprocessableEntityError(
                            `${fullPath} lançou erro durante a validação personalizada. Objeto inválido.`,
                        );
                    }
                }
            }
        }
    }
}

module.exports = Service;
