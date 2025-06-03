const recruitService = require('../service/recruitService');

module.exports = {
    // 모집글 생성
    createRecruit: async (req, res) => {
        try {
            const { title, content, location, close_at } = req.body;

            if (!title || !content || !location || !close_at) {
                return res
                    .status(400)
                    .json({ message: '모든 항목을 입력해 주세요.' });
            }

            const newRecruit = await recruitService.createRecruit({
                title,
                content,
                location,
                close_at: new Date(close_at),
                is_closed: false,
            });

            return res.status(201).json(newRecruit);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: '서버 에러' });
        }
    },

    // 모집글 전체 조회
    getAllRecruits: async (req, res) => {
        try {
            const recruits = await recruitService.getAllRecruits();
            return res.status(200).json(recruits);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: '서버 에러' });
        }
    },

    // 특정 모집글 조회
    getRecruitById: async (req, res) => {
        try {
            const { id } = req.params;
            const recruit = await recruitService.getRecruitById(Number(id));

            if (!recruit) {
                return res
                    .status(404)
                    .json({ message: '모집글을 찾을 수 없습니다.' });
            }

            return res.status(200).json(recruit);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: '서버 에러' });
        }
    },

    // 모집 마감 처리
    closeRecruit: async (req, res) => {
        try {
            const { id } = req.params;
            const closed = await recruitService.closeRecruit(Number(id));

            if (!closed) {
                return res
                    .status(404)
                    .json({ message: '모집글을 찾을 수 없습니다.' });
            }

            return res.status(200).json({ message: '모집 마감 처리됨' });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: '서버 에러' });
        }
    },
};
