import logger from '../../helpers/logger';
import error from '../../helpers/error';

// Listen uncaught exception
process.on('unhandledRejection', (err) => {
    // normalize error
    // eslint-disable-next-line no-param-reassign
    err = error.normalize(err);

    // logger error
    logger.error(err.stack);
});

// Listen uncaught exception
process.on('uncaughtException', (err) => {
    // normalize error
    // eslint-disable-next-line no-param-reassign
    err = error.normalize(err);

    // logger error
    logger.error(err.stack);

    // exit
    process.exit(1);
});

