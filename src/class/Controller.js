const { HttpError } = require('./errors');
const { publicRoutes } = require('../middlewares/authMiddleware');

class Controller {
    /**
     * @type {object}
     */
    $schema;

    constructor(name) {
        this.name = name;
        this.router = require('express').Router();
    }

    /**
     *
     * @param {'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'} type
     * @param {string} endpoint
     * @param {Function} callback
     */
    register(type, endpoint, callback, code = 200, isProtected = false) {
        const method = type.toLocaleLowerCase();
        if (!['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
            throw new Error(`Método HTTP inválido: ${type}`);
        }

        if (!isProtected) {
            publicRoutes.push({
                route: `/${this.name}${endpoint}`,
                method,
            });
        }

        this.router[method](
            endpoint,
            /**
             * @param {import('express').Request} req
             * @param {import('express').Response} res
             */
            async (req, res) => {
                try {
                    const result = await callback(req, res);
                    if (!res.headersSent) {
                        res.status(code).json(result);
                    }
                } catch (error) {
                    if (error instanceof HttpError) {
                        res.status(error.code).json({ message: error.message });
                    } else {
                        res.status(500).json({
                            message: `Ocorreu um erro inesperado. Tente novamente em alguns instantes.`,
                        });
                        console.log(error);
                    }
                }
            },
        );
    }
}

module.exports = {
    Controller,
};
