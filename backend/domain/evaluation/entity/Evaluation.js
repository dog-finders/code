const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Evaluation',
  tableName: 'evaluation',
  columns: {
    id: { type: 'int', primary: true, generated: true },
    meetingId: { type: 'int' },
    evaluatorId: { type: 'int' },
    evaluatedId: { type: 'int' },
    punctuality: { type: 'int' },
    sociability: { type: 'int' },
    aggressiveness: { type: 'int' },
    createdAt: { type: 'timestamp', createDate: true },
  },
  relations: {
    evaluator: { type: 'many-to-one', target: 'User', joinColumn: { name: 'evaluatorId' } },
    evaluated: { type: 'many-to-one', target: 'User', joinColumn: { name: 'evaluatedId' } },
  },
});