const { Controller } = require('../utils/Controller');
const { BadRequestError } = require('../utils/errors');

/**
 * @typedef {import('express').Request & { user: {id: number } }} Request
 * @typedef {import('express').Response} Response
 * @typedef {import('../utils/QueryManager')} QueryManager
 * @typedef {import('../services/transactions.service')} TransactionsService
 */

class TransactionsController extends Controller {
    /**
     * @param {TransactionsService} service
     * @param {QueryManager} queryManager
     */
    constructor(service, queryManager) {
        super('transactions');
        this.service = service;
        this.qm = queryManager;

        this.register('POST', '/', this.create.bind(this), 201, true);
        this.register('GET', '/', this.find.bind(this), 200, true);
        this.register('PATCH', '/:id([0-9]+)', this.update.bind(this), 200, true);
        this.register('DELETE', '/:id([0-9]+)', this.delete.bind(this), 204, true);
    }

    /**
     * @param {Request} req
     */
    async create(req) {
        const transaction = await this.service.createTransaction(req.body);
        return { transaction };
    }

    /**
     * @param {Request} req
     */
    async find(req) {
        const filters = req.query;
        const userId = req.user.id;
        const [transactions, total] = await this.service.findTransactions({ ...filters, userId });

        return { transactions, total };
    }

    /**
     * @param {Request} req
     */
    async update(req) {
        const userId = req.user.id;
        const transactionId = req.params.id;
        await this.service.updateTransaction({ ...req.body, userId, transactionId });

        return { message: 'Transação alterada com sucesso!' };
    }

    /**
     * @param {Request} req
     */
    async delete(req) {
        const userId = req.user.id;
        const transactionId = req.params.id;
        await this.service.deleteTransaction({ userId, transactionId });

        return {};
    }
}

module.exports = TransactionsController;
