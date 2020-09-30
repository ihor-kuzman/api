import fs from 'fs-extra';
import path from 'path';
import moment from 'moment';
import winston from 'winston';

import config from './config';

// Setup winston logger
const logger = winston.createLogger({
    level: config.get('server.logger.level'),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple(),
            ),
        }),
    ],
    exitOnError: false,
});

// Add transports by node env
if (process.env.NODE_ENV === 'production') {
    // Create "logger" folder
    fs.mkdirpSync(config.get('server.logger.dest'));

    // Add transports
    logger.add(new winston.transports.File({
        level: 'debug',
        format: winston.format.printf((info) => {
            const level = info[Symbol.for('level')];
            const splat = info[Symbol.for('splat')];

            const ts = moment.utc().format();
            const message = info.message.trim();
            const metadata = splat ? ` ${JSON.stringify(splat)}` : '';

            return `${(level === 'warn' ? 'warning' : level).toUpperCase()} [${ts}] -- ${message}${metadata}`;
        }),
        filename: path.resolve(config.get('server.logger.dest'), 'debug.log'),
    }));
    logger.add(new winston.transports.File({
        level: 'warn',
        filename: path.resolve(config.get('server.logger.dest'), 'warn.log'),
    }));
    logger.add(new winston.transports.File({
        level: 'error',
        filename: path.resolve(config.get('server.logger.dest'), 'error.log'),
    }));
}

// Export logger
export default logger;
