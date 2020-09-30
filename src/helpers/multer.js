import path from 'path';
import multer from 'multer';
import { Forbidden } from 'http-errors';

import config from './config';

// Export multer
export default multer({
    dest: config.get('server.multer.dest'),
    fileFilter: (req, file, done) => {
        // get extension
        const ext = path.extname(file.originalname);

        // filter formats
        if (config.get('server.multer.filter').indexOf(ext) !== -1) {
            done(null, true);
        } else {
            done(new Forbidden(`Only "${config.get('server.multer.filter')}" are allow`), false);
        }
    },
});
