const express = require('express'); // Import of Express web framework
const router = express.Router(); // Destructure of HTTP router for server

const validateObjectId = require('../../middleware/util/validateObjectId');
const { logger } = require('../../middleware/log/winston'); // Import of winston for error/info logging

// Guild Model - Using Mongoose Model
const nexusError = require('../../middleware/util/throwError'); // Custom Error handling for Nexus
const httpErrorHandler = require('../../middleware/util/httpError'); // Custom HTTP error sending for Nexus
const { Guild } = require('../../models/guild');

// @route   GET api/guild
// @Desc    Get all Guilds
// @access  Public
router.get('/', async function(req, res) {
	logger.info('GET Route: api/guild requested...');
	try {
		const guilds = await Guild.find();
		res.status(200).json(guilds);
	}
	catch (err) {
		logger.error(err.message, { meta: err.stack });
		res.status(500).send(err.message);
	}
});

// @route   GET api/guild/:id
// @Desc    Get a single guild by ID
// @access  Public
router.get('/:id', validateObjectId, async function(req, res) {
	logger.info('GET Route: api/guild/:id requested...');
	try {
		const guild = await Guild.findById({ _id: req.params.id });
		if (guild != null) {
			res.status(200).json(guild);
		}
		else {
			nexusError(`There is no guild with the ID ${req.params.id}`, 400);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   POST api/guild
// @Desc    Post a new guild
// @access  Public
router.post('/', async function(req, res) {
	logger.info('POST Route: api/guild call made...');

	try {
		let newGuild = new Guild(req.body);
		await newGuild.validateGuild();
		const docs = await Guild.find({ guildName: req.body.name });

		if (docs.length < 1) {
			newGuild = await newGuild.save();
			logger.info(`${newGuild.name} guild created for ${newGuild.team.name} ...`);
			res.status(200).json(newGuild);
		}
		else {
			nexusError(`${newGuild.name} guild already exists!`, 400);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   DELETE api/guild/:id
// @Desc    Delete a guild
// @access  Public
router.delete('/:id', validateObjectId, async function (req, res) {
	logger.info('DEL Route: api/guild/:id call made...');
	const id = req.params.id;

	try {
		const guild = await Guild.findByIdAndRemove(id);
		if (guild != null) {
			logger.info(`${guild.name} with the id ${id} was deleted!`);
			res.status(200).send(`${guild.name} with the id ${id} was deleted!`);
		}
		else {
			nexusError(`No guild with the id ${id} exists!`, 404);
		}
	}
	catch (err) {
		httpErrorHandler(res, err);
	}
});

// @route   PATCH api/guilds/deleteAll
// @desc    Delete All Guilds
// @access  Public
router.patch('/deleteAll', async function (req, res) {
	const data = await Guild.deleteMany();
	console.log(data);
	return res.status(200).send(`We wiped out ${data.deletedCount} Guilds!`);
});

module.exports = router;