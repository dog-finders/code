const EntitySchema = require('typeorm').EntitySchema;

module.exports = new EntitySchema({
    name: 'User',
    tableName: 'users',
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true,
        },
        name: {
            type: 'varchar',
            length: 50,
        },
        email: {
            type: 'varchar',
            length: 100,
            unique: true,
        },
        password: {
            type: 'varchar',
            length: 255,
        },
        role: {
            type: 'enum',
            enum: ['USER', 'ADMIN'],
            default: 'USER',
        },
        isActive: {
            type: 'boolean',
            default: true,
        },
        createdAt: {
            type: 'timestamp',
            createDate: true,
        },
        updatedAt: {
            type: 'timestamp',
            updateDate: true,
        },
    },
});
