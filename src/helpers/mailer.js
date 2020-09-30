import nodemailer from 'nodemailer';
import htmlToText from 'html-to-text';

import config from './config';
import logger from './logger';

class Mailer {
    constructor() {
        this.mailer = nodemailer.createTransport(config.get('server.mailer'));
    }

    async sendMail(data) {
        // convert html to text
        if (data.html && !data.text) {
            data.text = htmlToText.fromString(data.html).trim();
        }

        // log mail
        if (data.text) {
            logger.info(`Mailer:\n${data.text}`);
        }

        // send mail if production
        if (process.env.NODE_ENV === 'production') {
            await this.mailer.sendMail(data);
        }
    }
}

export default new Mailer();
