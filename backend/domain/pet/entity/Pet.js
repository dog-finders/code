const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'Pet',
    tableName: 'pet',
    columns: {
        id: { type: Number, primary: true, generated: true },
        name: { type: String, length: 50 },
        birth: { type: 'date' },
        personality: {
            type: 'enum',
            enum: ['ACTIVE', 'CALM', 'SOCIAL', 'SHY'],
        },
        isVaccinated: { type: Boolean },
        createdAt: { type: 'timestamp', createDate: true },
        updatedAt: { type: 'timestamp', updateDate: true },
    },
    relations: {
        user: {
            type: 'many-to-one',
            target: 'User',
            joinColumn: true,
            onDelete: 'CASCADE',
        },
    },
});//
