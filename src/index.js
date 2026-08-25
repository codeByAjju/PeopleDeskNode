import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import models from './models/index.js';
import register from './routes/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('port', process.env.PORT || 3001);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use('/public', express.static(path.join(__dirname, '../public')));

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const { sequelize } = models;
sequelize.authenticate()
    .then(() => {
        console.log('Database connected');
        return sequelize.sync();
    })
    .then(() => {
        console.log('Database is synchronized');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

register(app);

app.listen(app.get('port'), () => {
    console.log(`Server started on port ${app.get('port')}`);
});
