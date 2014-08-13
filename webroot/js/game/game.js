var mapData;
$(document).ready(function(){
    $.ajax({
        url: "/webroot/maps/first.json",
        success: function (data) {
        	mapData = data;
        	initializeGame();
        }
    });
});

function initializeGame(){
	mapData.path = astar.entry(mapData.map);
	mapData.startPos = $(".block[type='start']").position();
	$("#start").click(function(){
		start();
	});
}

function start(){
	var no = 0;
	var wave = setInterval(function(){
		var top = mapData.path[0].x * 60 + ((60 - 50) / 2);
		var left = mapData.path[0].y * 60 + ((60 - 20) / 2);
		$("#gameboard").append("<div id='monster" + no + "' class='" + mapData.monsters[mapData.currentWave][0] + 
			"' style='top: " + top + "px; left: " + left + "px;'></div>");
		moveMonster(no);
		no++;
		mapData.monsters[mapData.currentWave].shift();
		if(mapData.monsters[mapData.currentWave].length == 0){
			mapData.currentWave++;
			clearInterval(wave);
		}
	}, 300);
}

function moveMonster(no){
	var pos = 1;
	var move = setInterval(function(){
		if(pos == mapData.path.length){
			$("#monster" + no).remove();
			clearInterval(move);
		}
		var newTop = parseInt($("#monster" + no).css("top")) + (mapData.path[pos].x - mapData.path[pos - 1].x) * 60;
		var newLeft = parseInt($("#monster" + no).css("left")) + (mapData.path[pos].y - mapData.path[pos - 1].y) * 60;
		$("#monster" + no).css("top", newTop);
		$("#monster" + no).css("left", newLeft);
		pos++;
	}, 300);
}