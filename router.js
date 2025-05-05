const fs = require('fs');
const path = require('path');
const queryManager = require('./src/class/QueryManager');

/**
 * @param {import('express').Express} app
 */
module.exports = function (app) {
    const controllersDir = path.join(__dirname, 'src/controllers/');
    const servicesDir = path.join(__dirname, 'src/services/');

    const controllerFiles = fs.readdirSync(controllersDir).filter((file) => file.endsWith('.js'));

    for (const file of controllerFiles) {
        const baseName = file.replace('.js', '').split('.')[0];
        const controllerPath = path.join(controllersDir, file);
        const servicePath = path.join(servicesDir, `${baseName}.service.js`);

        try {
            const Controller = require(controllerPath);

            if (!fs.existsSync(servicePath)) {
                console.log(servicePath);
                console.warn(`[SKIP] Serviço não encontrado para o controlador: ${baseName}`);
                continue;
            }

            const Service = require(servicePath);
            const service = new Service(queryManager);
            const controller = new Controller(service, queryManager);

            if (!controller.name || !controller.router) {
                console.warn(`[SKIP] Controlador inválido: ${baseName}`);
                continue;
            }

            app.use(`/${controller.name}`, controller.router);
            console.log(`[OK] Registrado: ${controller.name}`);
        } catch (error) {
            console.error(`[ERROR] Falha ao carregar ${baseName}:`, error);
        }
    }
};
