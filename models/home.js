var crypto = require('crypto');

var home = function(req, res){
	var data = Array();
	if(req.session.pseudo){
		data.push({isConnected: true, pseudo: req.session.pseudo, level: req.session.level, score: req.session.score});
	}
	else{
		data.push({isConnected: false});
	}
	res.render('home/home', data[0]);
}

var register = function(req, res){
	req.models.user.create(req.body, function(err, result){
		if(!err){
			res.writeHead(301, {Location: '/connexion'});
			res.end();
		}
		else{
			res.writeHead(301, {Location: '/register'});
			res.end();
		}
	});
}

var connexion = function(req, res){
	req.models.user.find({emailAddress: req.body.emailAddress, password: crypto.createHash('sha1').update(req.body.password).digest('hex')}, function(err, result){
		console.log(err);
		console.log(result);
		if(!err && result.length == 1){
			req.session.id = result[0].id; req.session.pseudo = result[0].pseudo; req.session.level = result[0].level; req.session.score = result[0].score;
			res.writeHead(301, {Location: '/home'});
			res.end();
		}
		else{
			res.writeHead(301, {Location: '/connexion'});
			res.end();
		}
	});
}

exports.home = home;
exports.register = register;
exports.connexion = connexion;