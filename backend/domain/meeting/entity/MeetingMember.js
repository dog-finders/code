const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "MeetingMember",
  tableName: "meeting_member",
  columns: {
    id: { type: Number, primary: true, generated: true },
    meetingId: { type: Number },
    memberId: { type: String },
  },
});
