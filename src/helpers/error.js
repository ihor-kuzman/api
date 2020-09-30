import { ValidationError } from 'mongoose/lib/error';
import { BadRequest } from 'http-errors';

/**
 * Normalize error
 *
 * @param {Error} err - Input error
 * @returns {Error} - Normalized error
 */
function normalize(err) {
    // define error
    const error = new BadRequest('Undefined error');

    // handle error
    if (err instanceof ValidationError) {
        error.message = (err.message || error.message)
            .split('failed:').join('failed:\n -')
            .split(',').join('\n -');
    } else if (err instanceof Error) {
        error.message = err.message || error.message;
        error.status = err.status || error.status;
        error.stack = err.stack.split('at ').filter(value => !/[\\/]node_modules[\\/]/g.test(value)).join('at ');
    } else {
        error.stack = err;
    }

    // return normalized error
    return error;
}

// Export error service
export default {
    normalize,
};
