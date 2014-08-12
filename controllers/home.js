var model = require('../models/home');

module.exports.controller = function(app) {
	app.get('/', function(req, res) {
		model.home(req, res);
	});

	app.get('/home', function(req, res) {
		model.home(req, res);
	});

	app.get('/connexion', function(req, res) {
		res.render('home/connexion');
		app.post('/connexion', function(req, res) {
			model.connexion(req, res);
		});
	});

	app.get('/register', function(req, res) {
		res.render('home/register');
		app.post('/register', function(req, res) {
			model.register(req, res);
		});
	});

	app.get('/deconnexion', function(req, res) {
		req.session.destroy();
		res.writeHead(301, {Location: '/'} );
		res.end();
	});
}