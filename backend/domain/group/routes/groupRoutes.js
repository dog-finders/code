import express from 'express';
import { AppDataSource } from '../../../data-source.js';
import { Group } from '../entity/group.js';  // 오타 수정: goup -> group

const router = express.Router();

// 모집글 작성
router.post('/', async (req, res) => {
    try {
        const { location, title, content, close_at } = req.body;

        if (!location || !title || !content || !close_at) {
            return res.status(400).json({ message: '필수 항목 누락' });
        }

        const groupRepo = AppDataSource.getRepository(Group);

        const newGroup = groupRepo.create({
            location,
            title,
            content,
            close_at: new Date(close_at),
            is_closed: false,  // 서비스에서 넣었던 기본값도 반영
        });

        await groupRepo.save(newGroup);

        res.status(201).json({ message: '모집글 작성 완료', group: newGroup });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 에러' });
    }
});

// 모집글 목록 조회
router.get('/', async (req, res) => {
    try {
        const groupRepo = AppDataSource.getRepository(Group);
        const groups = await groupRepo.find({
            order: { created_at: 'DESC' },
        });
        res.status(200).json(groups);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 에러' });
    }
});

// 특정 모집글 조회
router.get('/:id', async (req, res) => {
    try {
        const groupRepo = AppDataSource.getRepository(Group);
        const group = await groupRepo.findOneBy({ id: Number(req.params.id) });

        if (!group) {
            return res.status(404).json({ message: '그룹을 찾을 수 없습니다.' });
        }

        res.status(200).json(group);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 에러' });
    }
});

// 모집 마감 처리
router.patch('/:id/close', async (req, res) => {
    try {
        const groupRepo = AppDataSource.getRepository(Group);
        const group = await groupRepo.findOneBy({ id: Number(req.params.id) });

        if (!group) {
            return res.status(404).json({ message: '그룹을 찾을 수 없습니다.' });
        }

        group.is_closed = true;
        await groupRepo.save(group);

        res.status(200).json({ message: '모집 마감 처리됨' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '서버 에러' });
    }
});

export default router;
