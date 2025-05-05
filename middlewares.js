const fs = require('fs');
const path = require('path');

/**
 * @param {import('express').Express} app
 */
module.exports = function (app) {
    const middlewaresDir = path.join(__dirname, 'src/middlewares/');
    const middlewareFiles = fs.readdirSync(middlewaresDir).filter((file) => file.endsWith('.js'));
    for (const middlewareFile of middlewareFiles) {
        const middleware = require(path.join(middlewaresDir, middlewareFile)).middleware;
        app.use(middleware);
    }
};
