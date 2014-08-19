var MAP_DATA;
var MONSTERS_DATA;
var TOWERS_DATA;
var CASE_SIZE = 60;
var BOARD_SIZE = {};

var towers = {};
var monsters = {};
var bullets = {};

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
	updateImpact();
	var wave = setInterval(function(){
		var type = MAP_DATA.monsters[currentWave][Object.size(monsters)];
		var top = MAP_DATA.path[0].x + ((CASE_SIZE - MONSTERS_DATA[type].height) / 2);
		var left = MAP_DATA.path[0].y + ((CASE_SIZE - MONSTERS_DATA[type].width) / 2);
		$("#gameboard").append("<div id='monster" + Object.size(monsters) + "' class='monster' type='" + type + 
			"' style='top: " + top + "px; left: " + left + "px;'></div>");
		moveMonster(type);

		if(Object.size(monsters) == MAP_DATA.monsters[currentWave].length){
			currentWave++;
			clearInterval(wave);
		}
	}, 1000);
}

function moveMonster(type){
	var pos = 1;
	var e = $("#monster" + Object.size(monsters));
	var move = setInterval(function(){		
		var newTop = parseInt(e.css("top")) + MAP_DATA.path[pos].x;
		var newLeft = parseInt(e.css("left")) + MAP_DATA.path[pos].y;
		e.css("top", newTop);
		e.css("left", newLeft);
		pos++;

		if(pos == MAP_DATA.path.length){
			setTimeout(function(){
				e.remove();
			}, 600);
			clearInterval(move);
		}
	}, 600);
	monsters[e[0].id] = {element: e, health: MONSTERS_DATA[type].health, interval: move};
}

var towerInter = Array();
function placeTower(element){
	var pos = element.position();
	var tower = "<div class='tower' id='tower" + Object.size(towers) + "' style='top: " + pos.top + "px; left: " + pos.left + "px;'></div>";
	$("#gameboard").append(tower);
	var t = $("#tower" + Object.size(towers));

	var inter = setInterval(function(){
		if($(".monster").length > 0){
			t.pointat({target: "#" + t.nearest($(".monster"))[0].id});
			fire(t);
		}
	}, 200);
	towers[t[0].id] = {element: t, interval: inter};
}

function fire(element){
	var trajectory = determineEquation(element, getRotation(element));
	var pos = element.offset();

	$("#gameboard").append("<div id='bullet" + Object.size(bullets) + "' class='bullet' style='top: " +
		trajectory.origin.y + "px; left: " + trajectory.origin.x + "px;'></div>");
	var e = $("#bullet" + Object.size(bullets));

	var pointsIncr = 1;
	var bInter = setInterval(function(){
		checkIfBulletIsOut(e[0].id, bInter);
		e.css("top", trajectory.getY(pointsIncr));
		e.css("left", trajectory.getX(pointsIncr));
		pointsIncr++;
	}, 200);
	bullets[e[0].id] = {element: e, interval: bInter, damage: 10};
}

function checkIfBulletIsOut(id){
	var pos = bullets[id].element.position();
	if(pos.top <= BOARD_SIZE.y1 || pos.top > BOARD_SIZE.y2
		|| pos.left < BOARD_SIZE.x1 || pos.left > BOARD_SIZE.x2){
		destroyBullet(bullets[id]);
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
			return (x1 + x2) + (incr * x2 * 2);
		},
		getY: function(incr){
			return (y1 + y2) + (incr * y2 * 2);
		}
	}
}

var checkCollisions;
function updateImpact(){
	checkCollisions = setInterval(function(){
		updateMonsterPosition();
		updateBulletPosition();
		checkCollision();
	}, 10);
}

var monstersPosition = Array();
function updateMonsterPosition(){
	$(".monster").each(function(){
		var p = $(this).offset();
		monsters[$(this)[0].id].x1 = p.left;
		monsters[$(this)[0].id].x2 = p.left + $(this).width();
		monsters[$(this)[0].id].y1 = p.top;
		monsters[$(this)[0].id].y2 = p.top + $(this).height();
	});
}

var bulletsPosition = Array();
function updateBulletPosition(){
	$(".bullet").each(function(){
		var p = $(this).offset();
		bullets[$(this)[0].id].x = p.left;
		bullets[$(this)[0].id].y = p.top;
	});
}

function checkCollision(){
	for (mKey in monsters) {
        for (bKey in bullets) {
        	//console.log("");
			//console.log(bullets[bKey]);
			//console.log(monsters[mKey]);
			//console.log("");
	        if(bullets[bKey].x >= monsters[mKey].x1
				&& bullets[bKey].x <= monsters[mKey].x2
				&& bullets[bKey].y >= monsters[mKey].y1
				&& bullets[bKey].y <= monsters[mKey].y2){
	        	lowerHealth(monsters[mKey], bullets[bKey].damage);
				destroyBullet(bullets[bKey]);
	        }
	    }
    }
}

function destroyBullet(bullet){
	bullet.element.remove();
	clearInterval(bullet.interval);
	delete bullets[bullet.id];
	
}

function lowerHealth(monster, damage){
	monster.health -= damage;
	if(monster.health <= 0){
		destroyMonster(monster);
	}
}

function destroyMonster(monster){
	monster.element.remove();
	clearInterval(monster.interval);
	delete monsters[monster.id];	
}

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};