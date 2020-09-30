import express from 'express';
import session from 'express-session';

import config from './helpers/config';
import logger from './helpers/logger';
import redis from './helpers/redis';
import twig from './helpers/twig';

import './common/patches/moment';

import './patches/node/process';
import './patches/express/layer';
import './patches/express/view';

import { configure, listen } from './common/app';

import register from './modules';

const RedisStore = require('connect-redis')(session);

// Create app
const app = express();

// Create IO server
app.io = require('socket.io')();

// Set app engine
app.engine('twig', twig.render);

// App config
configure(app);

// Body parser
app.use(express.urlencoded(config.get('server.parser')));
app.use(express.json(config.get('server.parser')));

// Session
app.use(session({
    name: 'sid',
    secret: config.get('server.session.secret'),
    saveUninitialized: true,
    resave: false,
    cookie: {
        secure: false,
    },
    store: new RedisStore({
        client: redis.createClient({
            url: config.get('server.redis.uri'),
        }),
    }),
}));

// IO
app.use((req, res, next) => {
    req.io = app.io;
    next();
});

// Register modules
async function index() {
    await register(app);

    // Log loading status
    logger.info('Modules successfully registered');

    // Create HTTP server
    const host = config.get('server.host');
    const port = config.get('server.port');
    const server = listen(app, logger, host, port);

    // Setup IO server
    app.io.serveClient(false);
    app.io.attach(server);
}

index()
    .catch((err) => {
        logger.error(err.stack || err);
        process.exit(1);
    });
