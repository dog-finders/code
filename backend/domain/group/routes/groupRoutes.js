import express from 'express';
import { AppDataSource } from '../../../data-source.js';
import { Group } from '../entity/goup.js';

const router = express.Router();

// 모집글 작성a
router.post('/', async (req, res) => {
    const { location, title, content, close_at } = req.body;

    if (!location || !title || !content || !close_at) {
        return res.status(400).json({ message: '필수 항목 누락' });
    }

    const groupRepo = AppDataSource.getRepository(Group);
    const newGroup = groupRepo.create({
        location,
        title,
        content,
        close_at,
    });

    await groupRepo.save(newGroup);
    res.status(201).json({ message: '모집글 작성 완료', group: newGroup });
});

// 모집글 목록 조회
router.get('/', async (req, res) => {
    const groupRepo = AppDataSource.getRepository(Group);
    const groups = await groupRepo.find({
        order: { created_at: 'DESC' },
    });
    res.json(groups);
});

export default router;
