const express = require('express');
const router = express.Router();

// 간단한 컨트롤러 임포트(없으면 더미 함수 작성)
const petController = require('../controller/petController');

// 모든 펫 조회
router.get('/', (req, res) => {
  res.send('모든 펫 목록입니다.');
  // 나중에 petController.getAllPets 와 연결
});

// 특정 펫 조회
router.get('/:id', (req, res) => {
  res.send(`펫 ID: ${req.params.id} 조회`);
  // 나중에 petController.getPetById 와 연결a
});

module.exports = router;
