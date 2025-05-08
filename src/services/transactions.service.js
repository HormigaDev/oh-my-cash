const { HttpError, NotFoundError, ForbiddenError, BadRequestError } = require('../utils/errors');
const Service = require('../utils/Service');
const transactionFiltersSchema = require('../schemas/transaction-filters.schema');
const transactionSchema = require('../schemas/transaction.schema');
const CategoriesService = require('./categories.service');

/**
 * @typedef {import('../utils/QueryManager')} QueryManager
 */

/**
 * @typedef {Object} TransactionFilters
 * @property {{ limit: number, page: number }} pagination - Configuração de paginação.
 * @property {{ value: number, operator: '=' | '<' | '>' | '!=' | '>=' | '<=' }} amount - Filtro de valor da transação.
 * @property {{ value: string, operator: '=' | '<' | '>' | '!=' | '>=' | '<=' }} date
 * @property {{ from: string, to: string }} dateRange
 * @property {string} description
 * @property {number} userId
 * @property {{ column: string, order: 'asc' | 'desc' }} orderBy
 */

class TransactionsService extends Service {
    /**
     * @param {QueryManager} queryManager
     */
    constructor(queryManager) {
        super();
        this.qm = queryManager;
        this.categoryService = new CategoriesService(this.qm);
    }

    async createTransaction(model) {
        this.validate(model, transactionSchema);
        const { type, userId, amount, date, description, categoryId } = model;
        const query = await this.qm.beginTransaction([
            'transactions.create',
            'transactions.add-to-category',
        ]);
        try {
            const category = await this.categoryService.findById(categoryId);
            query.setParams([
                userId,
                type,
                amount,
                date || new Date().toISOString().split('T')[0],
                description,
            ]);
            const id = await query.execute();
            query.nextQuery();

            console.log(`IDT: ${id} IDC: ${category.id}`);
            query.setParams([id, category.id]);
            await query.execute();
            await query.commit();

            return await this.findById(id);
        } catch (error) {
            await query.rollback();
            !(error instanceof HttpError) &&
                console.log(`TransactionsService/createTransaction: ${error}`);
            throw error;
        }
    }

    async findById(id) {
        const transaction = await this.qm.getOne('transactions.find-by-id', [id]);
        if (!transaction) {
            throw new NotFoundError(`Transação com ID "${id}" não encontrada.`);
        }

        return transaction;
    }

    /**
     * @param {TransactionFilters} filters
     */
    async findTransactions(filters) {
        try {
            this.validate(filters, transactionFiltersSchema);

            const {
                pagination = { limit: 10, page: 1 },
                orderBy,
                amount,
                date,
                dateRange,
                type,
                userId,
                description,
                categoryId,
            } = filters || {};

            /**
             * ! pagination e OrderBy SEMPRE devem ser validados antes de interpolá-los
             */
            const query = this.qm
                .getQuery('transactions.find')
                .interpolate('column', orderBy.column)
                .interpolate('order', orderBy.order)
                .interpolate('limit', pagination.limit)
                .interpolate('page', pagination.page - 1);

            const conditions = [];
            const params = [userId];
            let paramIndex = 3;

            if (categoryId) {
                if (Array.isArray(categoryId)) {
                    params.push(categoryId);
                } else {
                    params.push([categoryId]);
                }
            } else {
                params.push([]);
            }

            function pushCondition(sql, value) {
                conditions.push(sql.replace(/\?/g, `$${paramIndex}`));
                params.push(value);
                paramIndex++;
            }

            if (amount) {
                pushCondition(`amount ${amount.operator} ?`, amount.value);
            }
            if (date) {
                pushCondition(`transaction_date ${date.operator} ?`, date.value);
            }
            if (dateRange) {
                if (dateRange.from) {
                    pushCondition(`date >= ?`, dateRange.from);
                }
                if (dateRange.to) {
                    pushCondition(`date <= ?`, dateRange.to);
                }
            }
            if (type) {
                if (Array.isArray(type)) {
                    const placeholders = `$${paramIndex}, $${paramIndex + 1}`;
                    conditions.push(`type in (${placeholders})`);
                    paramIndex += 2;
                }
            }

            if (description) {
                conditions.push(`description ilike %$${paramIndex}%`);
            }

            query
                .interpolate(
                    'conditions',
                    `${!!conditions.length ? 'and' : ''} ${conditions.join(' and ')}`,
                )
                .setParams(params);
            const total = await query.count();
            const transactions = await query.fetch();

            return [transactions, total];
        } catch (error) {
            !(error instanceof HttpError) &&
                console.error(`TransactionsService/findTransactions: ${error}`);
            throw error;
        }
    }

    async updateTransaction(model) {
        const { $amount, $categoryId, $date, $description, $type, $userId } = transactionSchema;
        const schema = {
            _$amount: $amount,
            _$categoryId: $categoryId,
            _$date: $date,
            _$description: $description,
            _$type: $type,
            $userId,
            $transactionId: {
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
        this.validate(model, schema);
        const transaction = await this.findById(model.transactionId);

        if (transaction.userId !== model.userId) {
            throw new ForbiddenError('Usuário não autorizado para alterar este registro.');
        }

        const params = [model.userId, model.transactionId];
        const setters = [];
        let paramsIndex = 3;
        const { amount, categoryId, date, description, type } = model;
        if (!amount && !categoryId && !date && !description && !type) {
            throw new BadRequestError('Não informado nenhum campo para atualizar');
        }

        function pushSetter(sql, value) {
            setters.push(sql.replace(/\?/g, `$${paramsIndex}`));
            params.push(value);
            paramsIndex++;
        }

        if (amount) pushSetter('amount = ?', amount);
        if (date) pushSetter('date = ?', date);
        if (description) pushSetter('description = ?', description);
        if (type) pushSetter('type = ?', type);

        const query = await this.qm.beginTransaction([
            'transactions.update',
            'transactions.update-category',
        ]);

        try {
            query.interpolate('setters', setters.join(',')).setParams(params);
            if (setters.length) {
                await query.execute();
            }

            if (categoryId) {
                const category = await this.categoryService.findById(categoryId);
                query.nextQuery();

                query.setParams([transaction.id, category.id]);
                await query.execute();
            }
            await query.commit();
        } catch (error) {
            await query.rollback();
            !(error instanceof HttpError) &&
                console.error(`TransactionsService/findTransactions: ${error}`);
            throw error;
        }
    }

    async deleteTransaction({ userId, transactionId }) {
        this.validate(
            { userId, transactionId },
            {
                $userId: transactionSchema.$userId,
                $transactionId: {
                    type: 'number',
                    convert: true,
                    rules: [
                        {
                            validation: (value) => parseInt(value) > 0,
                            onFail: '$fullPath deve ser maior que zero.',
                        },
                    ],
                },
            },
        );

        try {
            const category = await this.findById(transactionId);
            if (category.userId !== userId) {
                throw new ForbiddenError('Usuário não autorizado para alterar este registro.');
            }

            const query = this.qm
                .getQuery('transactions.delete')
                .setParams([userId, transactionId]);

            await query.execute();
        } catch (error) {
            !(error instanceof HttpError) &&
                console.error(`TransactionsService/findTransactions: ${error}`);
            throw error;
        }
    }
}

module.exports = TransactionsService;
