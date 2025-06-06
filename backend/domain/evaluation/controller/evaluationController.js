const { getRepository } = require('typeorm');
const Evaluation = require('../entity/Evaluation');
const User = require('../../user/entity/User');
const Meeting = require('../../meeting/entity/Meeting');
const MeetingMember = require('../../meeting/entity/MeetingMember');

exports.submitEvaluations = async (req, res) => {
  const { meetingId, evaluations } = req.body;
  const evaluatorId = req.session.userId;

  if (!meetingId || !evaluations || !Array.isArray(evaluations)) {
    return res.status(400).json({ message: '잘못된 요청 데이터입니다.' });
  }

  const queryRunner = getRepository(User).manager.connection.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    for (const eva of evaluations) {
        const evaluatedUser = await queryRunner.manager.findOne(User, { where: { loginId: eva.evaluatedId } });
        if (!evaluatedUser) continue;

        const evaluationData = {
            meetingId,
            evaluatorId,
            evaluatedId: evaluatedUser.id,
            punctuality: eva.punctuality,
            sociability: eva.sociability,
            aggressiveness: eva.aggressiveness,
        };
        
        await queryRunner.manager.save(Evaluation, evaluationData);

        const { avgPunc } = await queryRunner.manager
            .createQueryBuilder(Evaluation, "eva")
            .select("AVG(eva.punctuality)", "avgPunc")
            .where("eva.evaluatedId = :id", { id: evaluatedUser.id })
            .getRawOne();
        
        const { avgSoc } = await queryRunner.manager
            .createQueryBuilder(Evaluation, "eva")
            .select("AVG(eva.sociability)", "avgSoc")
            .where("eva.evaluatedId = :id", { id: evaluatedUser.id })
            .getRawOne();

        const { avgAggr } = await queryRunner.manager
            .createQueryBuilder(Evaluation, "eva")
            .select("AVG(eva.aggressiveness)", "avgAggr")
            .where("eva.evaluatedId = :id", { id: evaluatedUser.id })
            .getRawOne();
        
        const newAverages = {
            avgPunctuality: parseFloat(avgPunc).toFixed(1),
            avgSociability: parseFloat(avgSoc).toFixed(1),
            avgAggressiveness: parseFloat(avgAggr).toFixed(1),
        };

        await queryRunner.manager.update(User, evaluatedUser.id, newAverages);
    }
    
    await queryRunner.commitTransaction();
    res.status(200).json({ message: '평가가 성공적으로 제출되었습니다.' });

  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('평가 제출 에러:', error);
    res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  } finally {
    await queryRunner.release();
  }
};