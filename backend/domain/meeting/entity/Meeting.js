const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Meeting",
  tableName: "meeting",
  columns: {
    id: { type: Number, primary: true, generated: true },
    title: { type: String },
    hostId: { type: String },
    hostName: { type: String },   // ★ 추가
    createdAt: { type: "datetime", default: () => "CURRENT_TIMESTAMP" },
    recruitId: { type: Number, nullable: true },
  },
});
