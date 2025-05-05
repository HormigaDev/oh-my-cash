const { NotFoundError, HttpError, ForbiddenError, ConflictError } = require('../utils/errors');
const Service = require('../utils/Service');
const categorySchema = require('../schemas/category.schema');

/**
 * @typedef {import('../utils/QueryManager')} QueryManager
 */

class CategoriesService extends Service {
    /**
     * @param {QueryManager} queryManager
     */
    constructor(queryManager) {
        super();
        this.qm = queryManager;
    }

    async createCategory(model) {
        try {
            this.validate(model, categorySchema);
            if (await this.findByName(model.userId, model.name)) {
                throw new ConflictError(`Já existe uma categoria com o nome "${model.name}".`);
            }

            const query = this.qm
                .getQuery('categories.create')
                .setParams([model.userId, model.name]);
            const id = await query.execute();

            const category = await this.findById(id);
            delete category.userId;
            return category;
        } catch (error) {
            !(error instanceof HttpError) &&
                console.log(`CategoriesServices/createCategory: ${error}`);
            throw error;
        }
    }

    async findById(id) {
        const category = await this.qm.getOne('categories.find-by-id', [id]);
        if (!category) {
            throw new NotFoundError(`Categoria com o ID "${id}" não encontrada.`);
        }

        return category;
    }

    async findByName(userId, name) {
        const category = await this.qm.getOne('categories.find-by-name', [userId, name]);
        return category;
    }

    async findCategories(userId) {
        try {
            const query = this.qm.getQuery('categories.find').setParams([userId]);
            const categories = await query.fetch();
            return categories;
        } catch (error) {
            !(error instanceof HttpError) &&
                console.log(`CategoriesServices/findCategories: ${error}`);
            throw error;
        }
    }

    async updateCategory({ userId, categoryId, name }) {
        try {
            const category = await this.findById(categoryId);
            if (category.userId !== userId) {
                throw new ForbiddenError(
                    `Categoria com ID: "${categoryId}" não percente ao usuário informado.`,
                );
            }

            const query = this.qm
                .getQuery('categories.update')
                .setParams([name, userId, categoryId]);
            await query.execute();
        } catch (error) {
            !(error instanceof HttpError) &&
                console.log(`CategoriesServices/updateCategory: ${error}`);
            throw error;
        }
    }

    async deleteCategory({ userId, categoryId }) {
        try {
            const category = await this.findById(categoryId);
            if (category.userId !== userId) {
                throw new ForbiddenError(
                    `Categoria com ID: "${categoryId}" não percente ao usuário informado.`,
                );
            }

            const query = this.qm.getQuery('categories.delete').setParams([userId, categoryId]);
            await query.execute();
        } catch (error) {
            !(error instanceof HttpError) &&
                console.log(`CategoriesServices/deleteCategory: ${error}`);
            throw error;
        }
    }
}

module.exports = CategoriesService;
