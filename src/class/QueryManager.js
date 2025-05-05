const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

const pool = new Pool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    port: process.env.DATABASE_PORT || 5432,
});

/**
 * Clase que representa uma query SQL parametrizada e executável
 */
class Query {
    /** @type {Pool} */
    #pool;

    /** @type {string} */
    #sql;

    /** @type {Array<any>} */
    #params;

    /** @type {import('pg').PoolClient} */
    #client;

    /** @type {Array<string>} */
    #sqlList;

    /**
     * @param {string | Array<string>} sql - A instrução SQL base ou Lista de instruções
     * @param {Pool} pool - Pool de conexões PostgreSQL
     */
    constructor(sql, pool, client = null) {
        if (!sql || (typeof sql !== 'string' && typeof sql !== 'object' && !Array.isArray(sql))) {
            throw new Error('SQL inválido fornecido à instância Query.');
        }
        if (Array.isArray(sql)) {
            this.#sql = sql.shift();
            this.#sqlList = sql;
        } else {
            this.#sql = sql;
        }
        this.#pool = pool;
        this.#client = client;
        this.#params = [];
    }

    /**
     * Substitui identificadores internos na SQL (por exemplo: nomes de colunas ou tabelas).
     *! ⚠️ ATENÇÃO: Este método insere valores diretamente na string da SQL.
     *! ⚠️ DEVE SER USADO APENAS com valores internos e controlados (como nomes de colunas/tabelas conhecidas).
     *! ❌ NUNCA utilize este método com dados provenientes do cliente ou do frontend.
     *
     * @param {string} id - Nome do marcador (ex: ":column")
     * @param {string} value - Valor a ser inserido diretamente (ex: "created_at")
     * @returns {Query}
     */
    interpolate(id, value) {
        const regex = new RegExp(`{{${id.replace(/[^a-zA-Z0-9_]/g, '')}}}`, 'g');
        this.#sql = this.#sql.replace(regex, value);
        return this;
    }

    /**
     * Estabelece a seguinte query na lista de queries
     * @returns {boolean}
     */
    nextQuery() {
        if (this.#sqlList && this.#sqlList.length) {
            this.#sql = this.#sqlList.shift();
            return true;
        }
        return false;
    }

    /**
     * Define os parâmetros posicionais da query (ex: valores para $1, $2...)
     * @param {Array<unknown>} params
     * @returns {Query}
     */
    setParams(params) {
        this.#params = params;
        return this;
    }

    /**
     * executa a query e devolve o id do registro se tiver
     * @returns {Promise<number | null>}
     */
    async execute() {
        const client = this.#client || (await this.#pool?.connect());
        try {
            const res = await client.query(this.#sql, this.#params);
            const row = res.rows?.[0] || {};
            return row.id || null;
        } catch (err) {
            console.error('Erro ao executar query:', err.message, '\nSQL:', this.#sql);
            throw err;
        } finally {
            if (!this.#client) client.release();
        }
    }

    /**
     * Executa a query e devolve os resultados
     * @returns {Promise<Array<any>>}
     */
    async fetch() {
        const client = this.#client || (await this.#pool?.connect());
        try {
            const result = await client.query(this.#sql, this.#params);
            return result.rows || [];
        } catch (err) {
            console.error('Erro ao executar query:', err.message, '\nSQL:', this.#sql);
            throw err;
        } finally {
            if (!this.#client) client.release();
        }
    }

    /**
     * Executa a query para contar os resultados
     * @returns {Promise<number>}
     */
    async count() {
        const wherePattern = /\bwhere\b[\s\S]+?(?=(\border\b|\blimit\b|\boffset\b|$))/i;
        const fromPattern = /from\s+([\w.]+)(?:\s+(\w+))?/i;

        const originalSql = this.#sql;
        const fromMatch = originalSql.match(fromPattern);
        if (!fromMatch) {
            throw new Error('Cláusula FROM não encontrada na SQL original.');
        }

        const table = fromMatch[1];
        const alias = fromMatch[2] ? ` ${fromMatch[2]}` : '';

        const whereMatch = originalSql.match(wherePattern);
        const whereClause = whereMatch ? whereMatch[0] : '';

        let countSql = `select count(*) as total from ${table}${alias} ${whereClause}`;
        countSql = countSql.replace(/;+\s*$/, '');

        const client = this.#client || (await this.#pool?.connect());
        try {
            const result = await client.query(countSql, this.#params);
            return parseInt(result.rows?.[0]?.total) || 0;
        } catch (err) {
            console.error('Erro ao executar a query-count:', err.message, '\nSQL:', countSql);
            throw err;
        } finally {
            if (!this.#client) client.release();
        }
    }

    /**
     * Commita uma transação
     * @returns {Promise<void>}
     */
    async commit() {
        if (!this.#client) {
            return console.warn('Não existe transação para esta query.');
        }
        try {
            await this.#client.query('commit;');
        } catch (err) {
            console.error(`Erro ao commitar: ${err}`);
            await this.#client.query('rollback;');
            throw err;
        } finally {
            this.#client.release();
        }
    }

    /**
     * Desfaz alterações dentro de uma transação
     * @returns {Promise<void>}
     */
    async rollback() {
        if (!this.#client) {
            return console.warn('Não existe transação para esta query.');
        }
        try {
            await this.#client.query('rollback');
        } catch (err) {
            console.warn(`Erro ao fazer rollback: ${err}`);
        } finally {
            this.#client.release();
        }
    }
}

/**
 * Classe que carrega e gerencia múltiplas queries SQL de arquivos
 */
class QueryManager {
    /** @type {Object.<string, Object.<string, Query>>} */
    #queries = {};

    /**
     * @param {string} dirPath - Caminho até a pasta com os arquivos .sql
     * @param {Pool} pool - Instância do pool de conexões PostgreSQL
     */
    constructor(dirPath, pool) {
        this.pool = pool;
        this.#parseQueriesFromFiles(dirPath);
    }

    /**
     * Lê todos os arquivos .sql no diretório e registra as queries
     * @param {string} dirPath
     */
    #parseQueriesFromFiles(dirPath) {
        const files = fs.readdirSync(dirPath).filter((file) => file.endsWith('.sql'));

        for (const file of files) {
            const fileName = file.slice(0, -4);
            const content = fs.readFileSync(path.join(dirPath, file), 'utf-8');

            let buffer = [];
            let currentId = null;

            const lines = content.split('\n');
            for (const line of lines) {
                const trimmed = line.trim();

                if (trimmed.startsWith('--')) {
                    if (currentId) {
                        this.#addQuery(fileName, currentId, buffer.join('\n').trim());
                        buffer = [];
                    }
                    currentId = trimmed.slice(2).trim();
                } else if (currentId) {
                    buffer.push(line);
                }
            }

            if (currentId && buffer.length > 0) {
                this.#addQuery(fileName, currentId, buffer.join('\n').trim());
            }
        }
    }

    /**
     * Registra uma query no cache interno
     * @param {string} controller
     * @param {string} id
     * @param {string} sql
     */
    #addQuery(controller, id, sql) {
        if (!this.#queries[controller]) {
            this.#queries[controller] = {};
        }
        this.#queries[controller][id] = sql;
    }

    /**
     * Recupera uma query com base no identificador "controller.query-id"
     * @param {string} identifier
     * @returns {Query}
     */
    getQuery(identifier) {
        const regExp = /^[a-zA-Z]+[a-zA-Z0-9\._-]*\.[a-zA-Z0-9\._-]+$/;
        if (!Array.isArray(identifier) && !regExp.test(identifier)) {
            throw new Error(`Identificador de query inválido: ${identifier}`);
        }
        if (Array.isArray(identifier)) {
            let queries = [];
            for (const _id of identifier) {
                if (!regExp.test(id)) {
                    throw new Error(`Identificador de query inválido: ${_id}`);
                }

                const [controller, id] = _id.split('.');
                const sql = this.#queries[controller]?.[id];
                if (!sql) {
                    throw new Error(`Query não encontrada: ${identifier}`);
                }

                queries.push(sql);
            }
            const query = new Query(queries, this.pool);
            return query;
        }

        const [controller, id] = identifier.split('.');
        const sql = this.#queries[controller]?.[id];
        if (!sql) {
            throw new Error(`Query não encontrada: ${identifier}`);
        }

        const query = new Query(sql, this.pool);

        return query;
    }

    /**
     * @param {string} identifier
     * @param {Array} params
     * @returns {any}
     */
    async getOne(identifier, params = []) {
        const query = this.getQuery(identifier).setParams(params);
        const rows = await query.fetch();
        return rows[0];
    }

    /**
     * Inicia uma transação no banco de dados
     * @param {string | Array<string>} identifier
     * @returns {Promise<Query>}
     */
    async beginTransaction(identifier) {
        const regExp = /^[a-zA-Z]+[a-zA-Z0-9\._-]*\.[a-zA-Z0-9\._-]+$/;
        if (!Array.isArray(identifier) && !regExp.test(identifier)) {
            throw new Error(`Identificador de query inválido: ${identifier}`);
        }
        if (Array.isArray(identifier)) {
            let queries = [];
            for (const _id of identifier) {
                if (!regExp.test(_id)) {
                    throw new Error(`Identificador de query inválido: ${_id}`);
                }

                const [controller, id] = _id.split('.');
                const sql = this.#queries[controller]?.[id];
                if (!sql) {
                    throw new Error(`Query não encontrada: ${identifier}`);
                }

                queries.push(sql);
            }
            const client = await this.pool.connect();
            await client.query('begin transaction;');
            const query = new Query(queries, null, client);

            return query;
        }

        const [controller, id] = identifier.split('.');
        const sql = this.#queries[controller]?.[id];
        if (!sql) {
            throw new Error(`Query não encontrada: ${identifier}`);
        }

        const client = await this.pool.connect();
        await client.query('begin transaction;');
        const query = new Query(sql, null, client);

        return query;
    }
}

const qm = new QueryManager(path.join(__dirname, '../database/queries/'), pool);

module.exports = qm;
