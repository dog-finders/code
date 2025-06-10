// backend/domain/meeting/entity/Meeting.js

const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Meeting",
  tableName: "meeting",
  columns: {
    id: { type: Number, primary: true, generated: true },
    title: { type: String },
    hostId: { type: String },
    hostName: { type: String },  
    createdAt: { type: "datetime", default: () => "CURRENT_TIMESTAMP" },
    recruitId: { type: Number, nullable: true }, 
  },
  relations: {
    // Recruit 엔티티와 관계 설정
    recruit: {
      type: "many-to-one",
      target: "Recruit",
      joinColumn: { name: "recruitId", referencedColumnName: "id" },
      nullable: true,
      eager: false,
      onDelete: 'CASCADE', 
    }
  }
});