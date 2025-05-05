const jwt = require('jsonwebtoken');
const { HttpError, UnauthorizedError, ForbiddenError } = require('../utils/errors');
const qm = require('../utils/QueryManager');
const UsersService = require('../services/users.service');

const publicRoutes = [];

/**
 * Middleware de autenticação JWT para rotas protegidas.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function authMiddleware(req, res, next) {
    const path = req.path;
    const method = req.method;

    // Verifica se a rota atual exige autenticação
    const isPublic = publicRoutes.find(
        (r) => r.route === path && (!r.method || r.method.toUpperCase() === method),
    );

    if (isPublic) return next();

    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('Token de autenticação não fornecido.');
        }

        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET;

        if (!secret) {
            throw new Error('JWT_SECRET não definido nas variáveis de ambiente.');
        }

        const payload = jwt.verify(token, secret);

        const usersService = new UsersService(qm);
        const user = await usersService.findById(payload?.id);
        if (user.status === 'inactive') {
            throw new ForbiddenError('Usuário inativo.');
        }

        // Dados do usuário autenticado disponíveis para os handlers
        req.user = payload || { id: null };

        next();
    } catch (error) {
        if (error instanceof HttpError) {
            res.status(error.code).json({ message: error.message });
        } else if (error.name === 'JsonWebTokenError') {
            res.status(401).json({ message: 'Token inválido.' });
        } else if (error.name === 'TokenExpiredError') {
            res.status(401).json({ message: 'Token expirado.' });
        } else {
            console.error(error);
            res.status(500).json({
                message: 'Ocorreu um erro inesperado. Tente novamente em alguns instantes.',
            });
        }
    }
}

module.exports = { middleware: authMiddleware, publicRoutes };
