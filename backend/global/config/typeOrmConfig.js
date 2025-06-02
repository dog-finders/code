const { DataSource } = require('typeorm');
const path = require('path');
const dotenv = require('dotenv');
const multer = require('multer');
const fs = require('fs');

const User = require('../../domain/user/entity/User');
const Pet = require('../../domain/pet/entity/Pet');
const Group = require('../../domain/recruit/entity/Group'); // Group 엔티티 추가

dotenv.config();

// TypeORM 설정
const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    dropSchema: false, // 운영 환경에서는 반드시 false
    logging: true,
    entities: [User, Pet, Group],
});

// multer 설정 (파일 업로드용)
const uploadPath = path.join(__dirname, '../../../uploads/pets');
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage });

module.exports = {
    AppDataSource,
    upload,
};
