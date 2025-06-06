const { DataSource } = require('typeorm');
const path = require('path');
const dotenv = require('dotenv');
const multer = require('multer');
const fs = require('fs');

// 엔티티 파일들을 직접 require 합니다.
const User = require('../../domain/user/entity/User');
const Pet = require('../../domain/pet/entity/Pet');
const Recruit = require('../../domain/recruit/entity/Recruit');
const Meeting = require('../../domain/meeting/entity/Meeting');
const MeetingMember = require('../../domain/meeting/entity/MeetingMember');
const Attend = require('../../domain/attend/entity/Attend');
const Evaluation = require('../../domain/evaluation/entity/Evaluation');

dotenv.config();

// TypeORM 0.3.x 방식의 DataSource 설정
const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dogdb',
  synchronize: true, // 개발 환경에서만 true로 사용
  logging: true,
  entities: [User, Pet, Recruit, Meeting, MeetingMember, Attend, Evaluation],
});

// multer 설정 (파일 업로드용)
const uploadPath = path.join(__dirname, '../../../uploads/pets');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

// DataSource와 upload를 함께 내보냅니다.
module.exports = {
  AppDataSource,
  upload,
};
