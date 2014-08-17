var MAP_DATA;
var MONSTERS_DATA;
var TOWERS_DATA;
var CASE_SIZE = 60;
var BOARD_SIZE = {};

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
	defineGameBoundaries();
}

function defineGameBoundaries(){
	BOARD_SIZE.x1 = $("#gameboard").position().left;
	BOARD_SIZE.x2 = BOARD_SIZE.x1 + $("#gameboard").width();
	BOARD_SIZE.y1 = $("#gameboard").position().top;
	BOARD_SIZE.y2 = BOARD_SIZE.y1 + $("#gameboard").height();
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
	var trajectory = determineEquation(element, getRotation(element));
	var pos = element.offset();

	$("#gameboard").append("<div id='bullet" + nbBullets + "' class='bullet' style='top: " +
		trajectory.origin.y + "px; left: " + trajectory.origin.x + "px;'></div>");
	var e = $("#bullet" + nbBullets);

	var pointsIncr = 0;
	var bInter = setInterval(function(){
		destroyBulletIfOut(e, bInter);
		e.css("top", trajectory.getY(pointsIncr));
		e.css("left", trajectory.getX(pointsIncr));
		pointsIncr++;
	}, 200);
	nbBullets++;
}

function destroyBulletIfOut(bullet, inter){
	var pos = bullet.position();
	if(pos.top <= BOARD_SIZE.y1 || pos.top > BOARD_SIZE.y2
		|| pos.left < BOARD_SIZE.x1 || pos.left > BOARD_SIZE.x2){
		bullet[0].remove();
		clearInterval(inter);
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

function determineEquation(element, angle){
	var x1 = parseInt(element.css("left").replace("px", "")) + 30;
	var y1 = parseInt(element.css("top").replace("px", "")) + 30;
	var x2 = (CASE_SIZE / 2);
	var y2 = (CASE_SIZE / 2);

	if(angle < 0)
		angle += 360;

	if(angle >= 0 && angle <= 90){
		x2 *= Math.cos((90 - angle) * (Math.PI/180));
		y2 *= - Math.sin((90 - angle) * (Math.PI/180));
	}
	else if(angle > 90 && angle <= 180){
		x2 *= Math.sin((180 - angle) * (Math.PI/180));
		y2 *= Math.cos((180 - angle) * (Math.PI/180));
	}
	else if(angle > 180 && angle <= 270){
		x2 *= - Math.cos((270 - angle) * (Math.PI/180));
		y2 *= Math.sin((270 - angle) * (Math.PI/180));
	}
	else if(angle > 270 && angle <= 360){
		x2 *= - Math.sin((360 - angle) * (Math.PI/180));
		y2 *= - Math.cos((360 - angle) * (Math.PI/180));
	}

	return {
			origin : {x: (x1 + x2), y: (y1 + y2)},
			getX: function(incr){
				return (x1 + x2) + (incr * x2);
			},
			getY: function(incr){
				return (y1 + y2) + (incr * y2);
			}
		}
}