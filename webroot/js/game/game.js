var MAP_DATA;
var MONSTERS_DATA;
var TOWERS_DATA;
var CASE_SIZE = 60;
var DOCUMENT_SIZE = {};

var nbTowers = 0;
var currentWave = 0;

$(document).ready(function(){
    $.ajax({
        url: "/webroot/ressources/maps/first.json",
        success: function (data) {
        	MAP_DATA = data;
        	initializeGame();
        }
    });
    $.ajax({
        url: "/webroot/ressources/monsters.json",
        success: function (data) {
        	MONSTERS_DATA = data;
        }
    });
    $.ajax({
        url: "/webroot/ressources/towers.json",
        success: function (data) {
        	TOWERS_DATA = data;
        }
    });
});

function initializeGame(){
	var path = astar.entry(MAP_DATA.map);
	optimizePath(path);
	MAP_DATA.startPos = $(".block[type='start']").position();
	$("#start").click(function(){
		startWave();
	});
	$(".block[type='obstacle']").each(function(){
		$(this).click(function(){
			placeTower($(this));
		});
	});
	DOCUMENT_SIZE.x = $(document).width();
	DOCUMENT_SIZE.y = $(document).height();
}

function optimizePath(path){
	MAP_DATA.path = Array();
	MAP_DATA.path.push({x: path[0].x * CASE_SIZE, y: path[0].y * CASE_SIZE});

	for(var i = 1; i < path.length; i++){
		MAP_DATA.path.push({x: (path[i].x - path[i - 1].x) * CASE_SIZE, y: (path[i].y - path[i - 1].y) * CASE_SIZE});
	}
}

function startWave(){
	var numero = 0;
	var wave = setInterval(function(){
		var type = MAP_DATA.monsters[currentWave][numero];
		var top = MAP_DATA.path[0].x + ((CASE_SIZE - MONSTERS_DATA[type].height) / 2);
		var left = MAP_DATA.path[0].y + ((CASE_SIZE - MONSTERS_DATA[type].width) / 2);
		$("#gameboard").append("<div id='monster" + numero + "' class='monster " + type + 
			"' style='top: " + top + "px; left: " + left + "px;'></div>");
		moveMonster(numero);
		numero++;

		if(numero == MAP_DATA.monsters[currentWave].length){
			currentWave++;
			clearInterval(wave);
		}
	}, 300);
}

function moveMonster(numero){
	var pos = 1;
	var move = setInterval(function(){
		var newTop = parseInt($("#monster" + numero).css("top")) + MAP_DATA.path[pos].x;
		var newLeft = parseInt($("#monster" + numero).css("left")) + MAP_DATA.path[pos].y;
		$("#monster" + numero).css("top", newTop);
		$("#monster" + numero).css("left", newLeft);
		pos++;

		if(pos == MAP_DATA.path.length){
			setTimeout(function(){
				$("#monster" + numero).remove();
			}, 600);
			clearInterval(move);
		}
	}, 600);
}

var towerInter = Array();
function placeTower(element){
	var pos = element.position();
	var tower = "<div class='tower' id='tower" + nbTowers + "' style='top: " + pos.top + "px; left: " + pos.left + "px;'></div>"
	$("#gameboard").append(tower);
	var t = $("#tower" + nbTowers);
	var inter = setInterval(function(){
		if($(".monster").length > 0){			
			t.pointat({target: "#" + t.nearest($(".monster"))[0].id});
			fire(t);
		}
	}, 200);
	nbTowers++;
}

var nbBullets = 0;
function fire(element){
	var move = 	moves(getRotation(element));
	var pos = element.offset();
	log(element.css("top"));
	log(pos);
	$("#gameboard").append("<div id='bullet" + nbBullets + "' class='bullet' style='top: " +
		pos.top + "px; left: " + (pos.left + 30) + "px;'></div>");
	var e = $("#bullet" + nbBullets);
	var bInter = setInterval(function(){
		destroyBulletIfOut(e, bInter);
		e.css("top", e.css("top") + move.y);
		e.css("left", e.css("left") + move.x);
	}, 1000);
	nbBullets++;
}

function destroyBulletIfOut(bullet, inter){
	//log(bullet);
	var pos = bullet.position();
	//log(pos);
	if(pos.top <= 0 || pos.top > DOCUMENT_SIZE.y
		|| pos.left < 0 || pos.left > DOCUMENT_SIZE.x){
		bullet[0].remove();
		clearInterval(inter);
		//log(bullet[0].id + " destroyed");
	}
}

function getRotation(element){
	var tr = element.css("transform");
	var values = tr.split('(')[1];
	    values = values.split(')')[0];
	    values = values.split(',');

	var a = values[0];
	var b = values[1];
	var c = values[2];
	var d = values[3];

	return Math.round(Math.atan2(b, a) * (180/Math.PI));
}

function moves(rotation){
	rotation = rotationTo360(rotation);
    rotation = (Math.PI * rotation / 180);
    var move = {x: 1, y: 1};
    var h = Math.sqrt(2);
    if(rotation <= 90){
        move.x = h * ((180 * Math.sin(rotation)) / Math.PI);
        move.y = -h * ((180 * Math.cos(rotation)) / Math.PI);
    }
    else if(rotation > 90 && rotation <= 180){
        move.x = h * ((180 * Math.sin(rotation - 90)) / Math.PI);
        move.y = h * ((180 * Math.cos(rotation - 90)) / Math.PI);
    }
    else if(rotation > 180 && rotation <= 270){
        move.x = -h * ((180 * Math.sin(rotation - 180)) / Math.PI);
        move.y = h * ((180 * Math.cos(rotation - 180)) / Math.PI);
    }
    else if(rotation > 270){
        move.x = -h * ((180 * Math.sin(270 - rotation)) / Math.PI);
        move.y = -h * ((180 * Math.cos(270 - rotation)) / Math.PI);
    }
    move.x /= 10;
    move.y /= 10;
    log(move);
    return move;
}

function rotationTo360(rot){
	if(rot < 0)
		rot += 360;
	return rot;
}

function log(m){
	console.log(m);
}