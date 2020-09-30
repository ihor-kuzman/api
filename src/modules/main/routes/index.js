import { Router } from 'express';

import brands from './brands';
import models from './models';
import galleries from './galleries';
import specs from './specs';
import ratings from './ratings';

export default new Router()
    .use('/brands', brands)
    .use('/models', models)
    .use('/galleries', galleries)
    .use('/specs', specs)
    .use('/ratings', ratings);
