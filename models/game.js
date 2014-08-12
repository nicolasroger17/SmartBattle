var fs = require('fs'),
	path = require('path');

var chooseMap = function(req, res){
	fs.readdir(path.resolve(__dirname, "../webroot/maps"), function(err, data){
		if(!err){
			var names = Array();
			for(var i = 0; i < files.length; i++){
				names.push(files[i].substring(0, files[i].length - 5));
			}
			res.render('game/chooseMap', {maps: names});
		}
		else{
			console.log(err);
		}
	});
}

var game = function(req, res){
	fs.readFile(path.resolve(__dirname, "../webroot/maps/" + req.params.map + ".json"), function(err, data){
		if(!err){
			res.render('game/game', {map: JSON.parse(data)});
		}
		else{
			console.log(err);
			res.writeHead(301, {Location: '/home'});
			res.end();
		}
	});
}

exports.chooseMap = chooseMap;
exports.game = game;