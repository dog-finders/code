// backend/domain/recruit/controller/recruitRouter.js
const express = require('express');
const router = express.Router();
const recruitService = require('../service/recruitService');

// 모집 신청 전체 조회
router.get('/', async (req, res, next) => {
  try {
    const recruits = await recruitService.getAllRecruits();
    res.json(recruits);
  } catch (err) {
    next(err);
  }
});

// 모집 신청 생성
router.post('/', async (req, res, next) => {
  try {
    const { userId, groupId, role, status } = req.body;
    if (!userId || !groupId || !role) {
      return res.status(400).json({ message: 'userId, groupId, role are required' });
    }

    const recruit = await recruitService.createRecruit({
      user: { id: userId },
      group: { id: groupId },
      role,
      status: status || 'pending',
    });

    res.status(201).json(recruit);
  } catch (err) {
    next(err);
  }
});

// 모집 신청 수정
router.put('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const { role, status } = req.body;

    if (!role && !status) {
      return res.status(400).json({ message: 'role or status required' });
    }

    const updated = await recruitService.updateRecruit(id, { role, status });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
