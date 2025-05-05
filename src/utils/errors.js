class HttpError extends Error {
    constructor(message, code) {
        super(message);
        this.message = message;
        this.code = code;
        this.name = 'HttpError';
    }
}

class BadRequestError extends HttpError {
    constructor(message) {
        super(message, 400);
        this.name = 'BadRequestError';
    }
}

class UnauthorizedError extends HttpError {
    constructor(message) {
        super(message, 401);
        this.name = 'UnauthorizedError';
    }
}

class ForbiddenError extends HttpError {
    constructor(message) {
        super(message, 403);
        this.name = 'ForbiddenError';
    }
}

class NotFoundError extends HttpError {
    constructor(message) {
        super(message, 404);
        this.name = 'NotFoundError';
    }
}

class UnprocessableEntityError extends HttpError {
    constructor(message) {
        super(message, 422);
        this.name = 'UnprocessableEntityError';
    }
}

class ConflictError extends HttpError {
    constructor(message) {
        super(message, 409);
        this.name = 'ConflictError';
    }
}

class InternalServerError extends HttpError {
    constructor(message) {
        super(message, 500);
        this.name = 'InternalServerError';
    }
}

module.exports = {
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    UnprocessableEntityError,
    InternalServerError,
    HttpError,
};
