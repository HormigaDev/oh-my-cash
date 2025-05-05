const { Controller } = require('../class/Controller');
const { BadRequestError } = require('../class/errors');

/**
 * @typedef {import('express').Request & { user: { id: number } }} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('../class/QueryManager')} QueryManager
 * @typedef {import('../services/users.service')} UsersService
 */

class UsersController extends Controller {
    /**
     * @param {UsersService} service
     * @param {QueryManager} queryManager
     */
    constructor(service, queryManager) {
        super('users');
        this.service = service;
        this.qm = queryManager;

        this.register('POST', '/', this.create.bind(this), 201);
        this.register('POST', '/get-token', this.getToken.bind(this), 200);

        // rotas protegidas
        this.register('GET', '/me', this.get.bind(this), 200, true);
        this.register('PATCH', '/inactive', this.inactive.bind(this), 200, true);
        this.register('DELETE', '/me', this.delete.bind(this), 204, true);
        this.register('PUT', '/me', this.update.bind(this), 200, true);
        this.register('PATCH', '/me', this.updatePartial.bind(this), 200, true);
    }

    /**
     * @param {Request} req
     */
    async create(req) {
        const user = await this.service.createUser(req.body);
        return { user };
    }

    /**
     * @param {Request} req
     */
    async getToken(req) {
        const { email, password } = req.body;
        const token = await this.service.getToken(email, password);
        return { token };
    }

    /**
     * @param {Request} req
     */
    async get(req) {
        const id = req.user.id;
        if (!id) {
            throw new BadRequestError('ID inválido');
        }

        const user = await this.service.findById(id);
        return { user };
    }

    /**
     * @param {Request} req
     */
    async inactive(req) {
        await this.service.inactiveUser(req.user.id);
        return { message: 'Usurio inativado com sucesso!' };
    }

    /**
     * @param {Request} req
     */
    async delete(req) {
        const id = req.user.id;
        await this.service.deleteUser(id);
        return {};
    }

    /**
     * @param {Request} req
     */
    async update(req) {
        await this.service.updateUser(req.user.id, req.body);
        return { message: 'Usuário atualizado com sucesso!' };
    }

    /**
     * @param {Request} req
     */
    async updatePartial(req) {
        await this.service.updateUserPartial(req.user.id, req.body);
        return { message: 'Usuário atualizado com sucesso!' };
    }
}

module.exports = UsersController;
