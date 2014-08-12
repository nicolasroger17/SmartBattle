var model = require('../models/game');

module.exports.controller = function(app) {
	app.get('/chooseMap', function(req, res) {
		model.chooseMap(req, res);
	});

	app.get('/game/:map', function(req, res) {
		model.game(req, res);
	});
}