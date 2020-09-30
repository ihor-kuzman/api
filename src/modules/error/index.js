import { NotFound } from 'http-errors';

import logger from '../../helpers/logger';
import error from '../../helpers/error';

export default {
    name: 'error',
    handler(app) {
        // catch 404 and forward to error handler
        app.use((req, res, next) => {
            next(new NotFound(`Not Found: ${req.url}`));
        });

        // error handler
        app.use((err, req, res, next) => {
            // normalize error
            const { status, message, stack } = error.normalize(err);

            // logger error
            logger.error(stack);

            // render the error page
            res.status(status || 400);
            res.json({
                success: false,
                message,
            });
        });
    },
};
