import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import noCache from 'nocache';

export function listen(app, logger, host, port) {
    return http.createServer(app)
        .on('listening', () => {
            logger.info(`Listening on ${port} in ${process.env.NODE_ENV || 'development'} mode`);
        })
        .on('error', (err) => {
            // handle syscall error
            if (err.syscall !== 'listen') {
                throw err;
            }

            // handle specific listen errors with friendly messages
            switch (err.code) {
                case 'EACCES':
                    logger.error(`Port ${port} requires elevated privileges`);
                    process.exit(1);
                    break;
                case 'EADDRINUSE':
                    logger.error(`Port ${port} is already in use`);
                    process.exit(1);
                    break;
                default:
                    throw err;
            }
        })
        .listen(port, host);
}

export function configure(app) {
    // App config
    app.set('trust proxy', true);

    // Middleware
    app.use(cors());
    app.use(helmet({
        xssFilter: false,
    }));
    app.use(noCache());

    // Custom
    app.use((req, res, next) => {
        req.originalPath = req.baseUrl + req.path;
        next();
    });

    //
    return app;
}
