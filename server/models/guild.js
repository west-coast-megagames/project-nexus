const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GuildSchema = new Schema({
	model: { type: String, default: 'Guild' },
	guildName: { type: String },
	guildID: { type: String },
	owner: { type: String },
	announcementID: { type: String }
});

const Guild = mongoose.model('Guild', GuildSchema);

module.exports = { Guild };
