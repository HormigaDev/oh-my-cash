const qs = require('qs');

const queryParserMiddleware = (req, _, next) => {
    req.query = qs.parse(req.query);
    next();
};

module.exports = {
    middleware: queryParserMiddleware,
};
