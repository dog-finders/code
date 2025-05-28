const { DataSource } = require('typeorm');
const path = require('path');
const dotenv = require('dotenv');

const User = require('../../domain/user/entity/User');

dotenv.config();

const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    dropSchema: true,
    entities: [User],
});
module.exports = { AppDataSource };
