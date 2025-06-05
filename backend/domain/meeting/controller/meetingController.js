const { getRepository } = require('typeorm');
const Meeting = require('../entity/Meeting');
const MeetingMember = require('../entity/MeetingMember');
const User = require('../../user/entity/User');

exports.findAllMeetings = () => getRepository(Meeting).find();
exports.findMeetingById = (id) => getRepository(Meeting).findOne({ where: { id } });
exports.findMembersByMeetingId = (meetingId) => getRepository(MeetingMember).find({ where: { meetingId } });
exports.saveMeeting = (data) => getRepository(Meeting).save(data);
exports.saveMember = (data) => getRepository(MeetingMember).save(data);
exports.deleteMeeting = (id) => getRepository(Meeting).delete(id);
exports.deleteMembers = (meetingId) => getRepository(MeetingMember).delete({ meetingId });
exports.findUserById = (id) => getRepository(User).findOne({ where: { id } });
