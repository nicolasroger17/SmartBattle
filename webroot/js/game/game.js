var MAP_DATA, MONSTERS_DATA, TOWERS_DATA, CASE_SIZE = 60, BOARD_SIZE = {};

var towers = {}, monsters = {}, bullets = {};

var towerNb = 0, monsterNb = 0, bulletNb = 0;

var currentWave = 0;

$(document).ready(function(){
    $.ajax({
        url: "/webroot/ressources/maps/" + getMapName() + ".json",
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

/**
* Parse the url to get the map name
**/
function getMapName(){
	return window.location.pathname.replace("/game/", "");
}

/**
* Define the best path for the map
* sets the listener on the buttons
**/
function initializeGame(){
	var path = astar.entry(MAP_DATA.map);
	optimizePath(path);
	MAP_DATA.startPos = $(".block[type='start']").position();
	$("#start").click(function(){
		startWave();
	});
	$(".block[type='wall']").each(function(){
		$(this).click(function(){
			placeTower($(this));
		});
	});
	defineGameBoundaries();
}

/**
* Define the game boundaries
* to check if a bullet is out
**/
function defineGameBoundaries(){
	BOARD_SIZE.x1 = 0;
	BOARD_SIZE.x2 = $("#gameboard").width();
	BOARD_SIZE.y1 = 0;
	BOARD_SIZE.y2 = $("#gameboard").height();
}

/**
* Calculate the parameters left and top
* for each position from the size of the case
* and the starting point
**/
function optimizePath(path){
	MAP_DATA.path = Array();
	MAP_DATA.path.push({x: path[0].x * CASE_SIZE, y: path[0].y * CASE_SIZE});

	for(var i = 1; i < path.length; i++){
		MAP_DATA.path.push({x: (path[i].x - path[i - 1].x) * CASE_SIZE, y: (path[i].y - path[i - 1].y) * CASE_SIZE});
	}
}

/**
* Start the wave by creating releasing the monsters
**/
function startWave(){
	updateImpact();
	var wave = setInterval(function(){
		var id = "monster" + monsterNb;
		var type = MAP_DATA.waves[currentWave][monsterNb];
		monsterNb++;

		var top = MAP_DATA.path[0].x + ((CASE_SIZE - MONSTERS_DATA[type].height) / 2);
		var left = MAP_DATA.path[0].y + ((CASE_SIZE - MONSTERS_DATA[type].width) / 2);
		$("#gameboard").append("<div id='" + id + "' class='monster' type='" + type + 
			"' style='top: " + top + "px; left: " + left + "px;'></div>");
		moveMonster(type, id);

		if(monsterNb == MAP_DATA.waves[currentWave].length){
			currentWave++;
			monsterNb = 0;
			clearInterval(wave);
		}
	}, 1000);
}

/**
* Make the monster move and add it
* to monsters list
**/
function moveMonster(type, id){
	var pos = 1;
	var e = $("#" + id);

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
	monsters[id] = {element: e, id: id, health: MONSTERS_DATA[type].health, interval: move};
}

/**
* Create a tower at the desired location
* make it search for the nearest enemy
* and fire at it
**/
function placeTower(element){
	var pos = element.position();
	var id = "tower" + towerNb;
	towerNb++;

	var tower = "<div class='tower' id='" + id + "' type='minigun' style='top: " + pos.top + "px; left: " + pos.left + "px;'></div>";
	$("#gameboard").append(tower);
	var t = $("#" + id);
	rangeShower(t);

	var target,
		inter = setInterval(function(){
		if($(".monster").length > 0){
			var nearest = "#" + t.nearest($(".monster")).attr("id");
			if(!target || !monsters[target.substring(1, target.length)] || !isInRange(t, target)){
				target = nearest;
			}

			if(isInRange(t, target)){
				t.pointat({target: target});
				fire(t);
			}				
		}
	}, 200);
	towers[id] = {element: t, id: id, interval: inter};
}

function rangeShower(tower){
	var range = TOWERS_DATA[tower.attr("type")].range,
		size = 30 - range;
		
	tower.hover(
		function(){
			tower.append("<div id='range" + tower.attr("id") + "' " +
			"class='range'" +
			"style='height: " + (range * 2) + "px; width: " + (range * 2) + "px; " + 
			"left: " + size + "px; top : " + size + "px;'" +
			"'></div>");
		},
		function(){
			$("#range" + tower.attr("id")).remove();
		}
	);
}

/**
* check if the nearest side of a monster
* is in range of the tower
**/
function isInRange(element, nearest){
	nearest = $(nearest);
	var t = {}, m = {};

	t.x = parseInt(element.css("left")) + 30;
	t.y = parseInt(element.css("top")) + 30;
	t.range = TOWERS_DATA[element.attr("type")].range;

	m.type = nearest.attr("type");
	m.x = parseInt(nearest.css("left")) + 30;
	m.y = parseInt(nearest.css("top")) + 30;	
	m.addWidth = MONSTERS_DATA[m.type]['width'] / 2;
	m.addHeight = MONSTERS_DATA[m.type]['height'] / 2;

	if(m.x <= t.x){
		m.x += m.addWidth;
	}
	else{
		m.x -= m.addWidth;
	}

	if(m.y <= t.y){
		m.y += m.addHeight;
	}
	else{
		m.y -= m.addHeight;
	}

	if(distance(t, m) <= t.range)
		return true;

	return false
}

function distance(tower, monster){
	return Math.sqrt(Math.pow((monster.y - tower.y), 2) + Math.pow((monster.x - tower.x), 2));
}

/**
* For each bullet, determine the equation
* to have a straight line
* make the bullet move and destroy it
* if it is out of the boundaries
**/
function fire(element){
	var trajectory = determineEquation(element, getRotation(element));
	var pos = element.offset();
	var id = "bullet" + bulletNb;
	bulletNb++;

	$("#gameboard").append("<div id='" + id + "' class='bullet' style='top: " +
		trajectory.getY(0) + "px; left: " + trajectory.getX(0) + "px;'></div>");
	var e = $("#" + id);

	var pointsIncr = 1;
	var bInter = setInterval(function(){
		e.css("opacity", 1);
		checkIfBulletIsOut(id);	
		e.css("top", trajectory.getY(pointsIncr));
		e.css("left", trajectory.getX(pointsIncr));
		pointsIncr++;
	}, 200);
	bullets[id] = {element: e, id: id, interval: bInter, damage: 10};
}

/**
* Check if a bullet is not
* inside the gameboard
* and destroy it if it is the case
**/
function checkIfBulletIsOut(id){
	var pos = bullets[id].element.position();
	if(pos.top < BOARD_SIZE.y1
		|| pos.top > BOARD_SIZE.y2
		|| pos.left < BOARD_SIZE.x1
		|| pos.left > BOARD_SIZE.x2){
		destroyBullet(bullets[id]);
	}
}

/**
* Convert the rotation matrix
* into a rotation in degree
**/
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

/**
* Find the equation of the line
* for a bullet from the angle of the turret
* and its position
**/
function determineEquation(element, angle){
	var x1 = parseInt(element.css("left")) + 30 - 2;
	var y1 = parseInt(element.css("top")) + 30 - 2;
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

/**
* Update the position of the moving elements
* and check if there are collision
**/
function updateImpact(){
	checkCollisions = setInterval(function(){
		updateMonsterPosition();
		updateBulletPosition();
		checkCollision();
	}, 10);
}

/**
* Update the position of the monsters
**/
function updateMonsterPosition(){
	$(".monster").each(function(){
		var p = $(this).offset();
		monsters[$(this).attr("id")].x1 = p.left;
		monsters[$(this).attr("id")].x2 = p.left + $(this).width();
		monsters[$(this).attr("id")].y1 = p.top;
		monsters[$(this).attr("id")].y2 = p.top + $(this).height();
	});
}

/**
* Update the position of the bullets
**/
function updateBulletPosition(){
	$(".bullet").each(function(){
		var p = $(this).offset();
		bullets[$(this).attr("id")].x = p.left;
		bullets[$(this).attr("id")].y = p.top;
	});
}

/**
* Check if there is a collision
* between a monster and a bullet
* if so, destroy the bullet and
* lower the life of the monster
**/
function checkCollision(){
	for (mKey in monsters) {
        for (bKey in bullets) {
	        if(monsters[mKey]
	        	&& bullets[bKey].x >= monsters[mKey].x1
				&& bullets[bKey].x <= monsters[mKey].x2
				&& bullets[bKey].y >= monsters[mKey].y1
				&& bullets[bKey].y <= monsters[mKey].y2){
	        	lowerHealth(monsters[mKey], bullets[bKey].damage);
				destroyBullet(bullets[bKey]);
	        }
	    }
    }
}

/**
* Remove the bullet from the DOM
* clear the interval that make it moves
* and remove it from the bullets list
**/
function destroyBullet(bullet){
	bullet.element.remove();
	clearInterval(bullet.interval);
	delete bullets[bullet.id];
	
}

/**
* Lower the life of a monster
* by the damages of the turret
**/
function lowerHealth(monster, damage){
	monster.health -= damage;
	if(monster.health <= 0){
		destroyMonster(monster);
	}
}

/**
* Remove the monster from the DOM
* clear the interval that make it moves
* and remove it from the monsters list
**/
function destroyMonster(monster){
	monster.element.remove();
	clearInterval(monster.interval);
	delete monsters[monster.id];	
}

/**
* Give the size of a json array
**/
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};