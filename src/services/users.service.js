const Service = require('../utils/Service');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userSchema = require('../schemas/user.schema');
const {
    ConflictError,
    NotFoundError,
    HttpError,
    UnauthorizedError,
    BadRequestError,
} = require('../utils/errors');
const { Times } = require('../utils/Times');
const salt = +(process.env.SALT_ROUNDS || 10);

/**
 * @typedef {import('../utils/QueryManager')} QueryManager
 */

class UsersService extends Service {
    /**
     * @param {QueryManager} queryManager
     */
    constructor(queryManager) {
        super();
        this.qm = queryManager;
    }

    async createUser(user) {
        try {
            this.validate(user, userSchema);
            const _user = await this.findByEmail(user.email);
            if (_user) {
                throw new ConflictError(`Já existe um usuário com E-mail: "${user.email}"`);
            }

            const query = this.qm
                .getQuery('users.create')
                .setParams([user.name, user.email, this.#hashPassword(user.password)]);

            const id = await query.execute();
            return await this.findById(id);
        } catch (error) {
            !(error instanceof HttpError) && console.log(`UsersService/createUser: ${error}`);
            throw error;
        }
    }

    async findById(id) {
        try {
            const user = await this.qm.getOne('users.find-by-id', [id]);
            if (!user) {
                throw new NotFoundError(`Usuário com ID "${id}" não encontrado.`);
            }

            return user;
        } catch (error) {
            !(error instanceof HttpError) && console.log(`UsersService/findById: ${error}`);
            throw error;
        }
    }

    async inactiveUser(id) {
        try {
            await this.findById(id);
            const query = this.qm
                .getQuery('users.update')
                .interpolate('column', 'status')
                .setParams([id, 'inactive']);

            await query.execute();
        } catch (error) {
            !(error instanceof HttpError) && console.log(`UsersService/inactiveUser: ${error}`);
            throw error;
        }
    }

    async deleteUser(id) {
        try {
            await this.findById(id);
            const query = this.qm.getQuery('users.delete').setParams([id]);

            await query.execute();
        } catch (error) {
            !(error instanceof HttpError) && console.log(`UsersService/deleteUser: ${error}`);
            throw error;
        }
    }

    async getToken(email, password) {
        try {
            const schema = {
                $email: userSchema.$email,
                $password: userSchema.$password,
            };
            this.validate({ email, password }, schema);
            const user = await this.findByEmail(email);
            console.log(email);
            if (!user || !this.comparePassword(password, user.password)) {
                throw new UnauthorizedError('Credenciais inválidas.');
            }

            const token = this.generateToken({ id: user.id });
            return token;
        } catch (error) {
            !(error instanceof HttpError) && console.log(`UsersService/getToken: ${error}`);
            throw error;
        }
    }

    generateToken(payload) {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('Chave secreta do JSON WEB TOKEN não definida.');
        }
        const token = jwt.sign(payload, secret, { expiresIn: Times.days(1) });

        return token;
    }

    async findByEmail(email) {
        const user = await this.qm.getOne('users.find-by-email', [email]);
        return user;
    }

    async updateUser(id, model) {
        await this.findById(id);
        this.validate(model, { $name: userSchema.$name, $email: userSchema.$email });
        const user = await this.findByEmail(model.email);
        if (user && user.id !== id) {
            throw new ConflictError(`Já existe um usuário com o email "${model.email}"`);
        }

        const query = this.qm.getQuery('users.set').setParams([id, model.name, model.email]);
        await query.execute();
    }

    async updateUserPartial(id, model) {
        await this.findById(id);
        this.validate(model, { _$name: userSchema.$name, _$email: userSchema.$email });
        if (!model.name && !model.email) {
            throw new BadRequestError('Por favor informe o dado que deseja alterar.');
        }
        if (model.email) {
            const user = await this.findByEmail(model.email);
            if (user && user.id !== id) {
                throw new ConflictError(`Já existe um usuário com o email "${model.email}"`);
            }
        }

        const query = this.qm.getQuery('users.update-partial');
        const setters = [];
        const params = [id];
        if (model.email) {
            params.push(model.email);
            setters.push(`email = $${params.length}`);
        }
        if (model.name) {
            params.push(model.name);
            setters.push(`name = $${params.length}`);
        }

        query.interpolate('setters', setters.join(',')).setParams(params);
        await query.execute();
    }

    comparePassword(password, hash) {
        return bcrypt.compareSync(password, hash);
    }

    #hashPassword(password) {
        return bcrypt.hashSync(password, salt);
    }
}

module.exports = UsersService;
