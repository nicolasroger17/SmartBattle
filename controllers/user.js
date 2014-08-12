var model = require('../models/user');

module.exports.controller = function(app) {

	app.get('/lostPassword', function(req, res) {
		if(!req.session.pseudo){
			res.render('user/lostPassword');
		}
		else{
			res.writeHead(301,
			  {Location: '/home'}
			);
			res.end();
		}
	});

	app.post('/resetPassword', function(req, res){
		model.resetPassword(req, res);
	});

}