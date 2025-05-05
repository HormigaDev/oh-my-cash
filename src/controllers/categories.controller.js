const { Controller } = require('../class/Controller');
const { BadRequestError } = require('../class/errors');

/**
 * @typedef {import('express').Request & { user: {id: number } }} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('../class/QueryManager')} QueryManager
 * @typedef {import('../services/categories.service')} CategoriesService
 */

class CategoriesController extends Controller {
    /**
     * @param {CategoriesService} service
     * @param {QueryManager} queryManager
     */
    constructor(service, queryManager) {
        super('categories');
        this.service = service;
        this.qm = queryManager;

        this.register('POST', '/', this.create.bind(this), 201, true);
        this.register('GET', '/', this.find.bind(this), 200, true);
        this.register('PUT', '/:id([0-9]+)', this.update.bind(this), 200, true);
        this.register('DELETE', '/:id([0-9]+)', this.delete.bind(this), 204, true);
    }

    /**
     * @param {Request} req
     */
    async create(req) {
        const name = req.body.name;
        if (!name) {
            throw new BadRequestError('Por favor informe um nome para a categoria.');
        }
        const category = await this.service.createCategory({ userId: req.user.id, name });
        return { category };
    }

    /**
     * @param {Request} req
     */
    async find(req) {
        const userId = req.user.id;
        const categories = await this.service.findCategories(userId);

        return { categories };
    }

    /**
     * @param {Request} req
     */
    async update(req) {
        const userId = req.user.id;
        const categoryId = parseInt(req.params.id);
        if (categoryId <= 0) {
            throw new BadRequestError('ID da categoria inválido.');
        }
        const name = req.body.name;
        if (!name) {
            throw new BadRequestError('Por favor informe um nome para a categoria.');
        }

        await this.service.updateCategory({ userId, categoryId, name });

        return { message: 'Categoria atualizada com sucesso!' };
    }

    /**
     * @param {Request} req
     */
    async delete(req) {
        const userId = req.user.id;
        const categoryId = parseInt(req.params.id);
        if (categoryId <= 0) {
            throw new BadRequestError('ID da categoria inválido.');
        }

        await this.service.deleteCategory({ userId, categoryId });

        return {};
    }
}

module.exports = CategoriesController;
