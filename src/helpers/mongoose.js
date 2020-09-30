import mongoose from 'mongoose';

import config from './config';
import logger from './logger';
import error from './error';

// Create mongoose connect
mongoose.connect(config.get('server.mongoose.uri'), {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
});

// Listen connection error
mongoose.connection.on('error', (err) => {
    // normalize error
    const { stack } = error.normalize(err);

    // logger error
    logger.error(stack);

    // throw error
    throw err;
});

// Export schema and types
export const { Schema, SchemaTypes: Types } = mongoose;

// Export mongoose
export default mongoose;
