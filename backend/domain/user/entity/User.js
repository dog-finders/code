const EntitySchema = require('typeorm').EntitySchema;

module.exports = new EntitySchema({
    name: 'User',
    tableName: 'user',
    columns: {
        id: { type: Number, primary: true, generated: true },
        createdAt: { type: 'timestamp', createDate: true },
        updatedAt: { type: 'timestamp', updateDate: true },
        name: { type: String, length: 50 },
        loginId: { type: String, length: 100, unique: true },
        password: { type: String, length: 200 },
        phone: { type: String, length: 30 },
        birthdate: { type: String, length: 10 },
        email: { type: String, length: 50, unique: true },
        address: { type: String },
        rating: { type: Number, nullable: true },
        personality: {
            type: 'enum',
            enum: ['ACTIVE', 'CALM', 'SOCIAL', 'SHY'],
        }, // 예시 enuma
    },
});
