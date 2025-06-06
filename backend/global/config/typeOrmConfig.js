const dotenv = require('dotenv');
dotenv.config();

const path = require('path');
const multer = require('multer');
const fs = require('fs');

// 'uploads/pets' 디렉터리가 없으면 생성합니다.
const uploadPath = path.join(__dirname, '../../../uploads/pets');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// 파일 저장을 위한 Multer storage 설정입니다.
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

// Multer 미들웨어 인스턴스입니다.
const upload = multer({ storage });

// 이 파일에서는 TypeORM 연결(DataSource)을 직접 다루지 않으므로 관련 코드를 제거하고,
// 파일 업로드(multer) 설정만 export 합니다.
module.exports = {
  upload,
};
