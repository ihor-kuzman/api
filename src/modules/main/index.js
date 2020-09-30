import uniqid from 'uniqid';

import routes from './routes';

export default {
    name: 'main',
    models: require.context('./models', false, /\.js$/),
    handler(app) {
        const db = {};

        app.use('/', routes);

        app.get('/todos', (req, res) => {
            db.todos = db.todos || [];
            res.json(db.todos);
        });
        app.post('/todos', (req, res) => {
            const todo = {
                id: uniqid(),
                text: req.body.text,
            };
            db.todos = db.todos || [];
            db.todos.push(todo);
            res.json(todo);
        });
        app.delete('/todos/:id', (req, res) => {
            db.todos = db.todos || [];
            db.todos = db.todos.filter(item => item.id !== req.params.id);
            res.json({});
        });

        app.get('/', (req, res, next) => {
            if (db.views) {
                db.views++;
                res.setHeader('Content-Type', 'text/html');
                res.write(`<p>views: ${db.views}</p>`);
                res.end();
            } else {
                db.views = 1;
                res.end('welcome to the session demo. refresh!');
            }
        });
    },
};
