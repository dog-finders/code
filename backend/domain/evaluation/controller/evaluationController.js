const { AppDataSource } = require('../../../global/config/typeOrmConfig');
const Evaluation = require('../entity/Evaluation');
const User = require('../../user/entity/User');

exports.submitEvaluations = async (req, res) => {
  const { meetingId, evaluations } = req.body;
  const evaluatorId = req.session.userId;

  if (!meetingId || !evaluations || !Array.isArray(evaluations)) {
    return res.status(400).json({ message: '잘못된 요청 데이터입니다.' });
  }

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    for (const eva of evaluations) {
      const { evaluatedId, punctuality, sociability, aggressiveness } = eva;
      
      const evaluatedUser = await queryRunner.manager.findOne(User, { where: { loginId: evaluatedId } });
      if (!evaluatedUser) {
        console.warn(`평가 대상 유저(${evaluatedId})를 찾을 수 없어 건너뜁니다.`);
        continue;
      }

      const evaluation = queryRunner.manager.create(Evaluation, {
        meetingId: parseInt(meetingId, 10),
        evaluatorId: evaluatorId,
        evaluatedId: evaluatedUser.id,
        punctuality: parseInt(punctuality, 10),
        sociability: parseInt(sociability, 10),
        aggressiveness: parseInt(aggressiveness, 10),
      });

      // save 메소드에 엔티티 스키마를 함께 전달
      await queryRunner.manager.save(Evaluation, evaluation);

      // 평균 점수 재계산
      const avgScores = await queryRunner.manager
        .createQueryBuilder(Evaluation, "e")
        .select("AVG(e.punctuality)", "avgPunctuality")
        .addSelect("AVG(e.sociability)", "avgSociability")
        .addSelect("AVG(e.aggressiveness)", "avgAggressiveness")
        .where("e.evaluatedId = :id", { id: evaluatedUser.id })
        .getRawOne();
      
      // 사용자 테이블 업데이트
      await queryRunner.manager.update(User, evaluatedUser.id, {
        avgPunctuality: parseFloat(avgScores.avgPunctuality || 0).toFixed(1),
        avgSociability: parseFloat(avgScores.avgSociability || 0).toFixed(1),
        avgAggressiveness: parseFloat(avgScores.avgAggressiveness || 0).toFixed(1),
      });
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