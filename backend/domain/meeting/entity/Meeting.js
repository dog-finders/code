const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Meeting",
  tableName: "meeting",
  columns: {
    id: { type: Number, primary: true, generated: true },
    title: { type: String },
    hostId: { type: String },
    hostName: { type: String },   // ★ 추가됨
    createdAt: { type: "datetime", default: () => "CURRENT_TIMESTAMP" },
    recruitId: { type: Number, nullable: true }, // ★ 추가됨
  },
  relations: {
    // ★ Recruit 엔티티와 ManyToOne 관계 설정
    recruit: {
      type: "many-to-one",
      target: "Recruit",
      joinColumn: { name: "recruitId", referencedColumnName: "id" },
      nullable: true,
      eager: false
    }
  }
});
