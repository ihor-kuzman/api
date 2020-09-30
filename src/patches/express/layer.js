import Layer from 'express/lib/router/layer';

/**
 * Handle the request for the layer.
 *
 * @override
 * @private
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {Function} next - Next middleware
 */
Layer.prototype.handle_request = function handle(req, res, next) {
    // store handler
    const fn = this.handle;

    if (fn.length > 3) {
        // not a standard request handler
        next();
        return;
    }

    // call handler
    try {
        Promise.resolve(fn(req, res, next)).catch(next);
    } catch (err) {
        next(err);
    }
};

/**
 * Handle the error for the layer.
 *
 * @override
 * @private
 * @param {Error} error - Express error
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {Function} next - Next middleware
 */
Layer.prototype.handle_error = function handleError(error, req, res, next) {
    // store handler
    const fn = this.handle;

    // not a standard error handler
    if (fn.length !== 4) {
        next(error);
        return;
    }

    // call handler
    try {
        Promise.resolve(fn(error, req, res, next)).catch(next);
    } catch (err) {
        next(err);
    }
};
