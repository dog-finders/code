// global/config/typeOrmConfig.js (이미 잘 작성됨 가정)
const dotenv = require('dotenv');
dotenv.config();

const { DataSource } = require('typeorm');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const User = require('../../domain/user/entity/User');
const Pet = require('../../domain/pet/entity/Pet');
const Recruit = require('../../domain/recruit/entity/Recruit');

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'test',
  synchronize: true,
  dropSchema: false,
  logging: true,
  entities: [User, Pet, Recruit],
});

const uploadPath = path.join(__dirname, '../../../uploads/pets');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

module.exports = {
  AppDataSource,
  upload,
};