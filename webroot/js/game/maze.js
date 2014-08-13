var map = Array();
var solution = Array();
var height = 0;
var width = 0;

function solve(json) {
	    /*map = [ 
        [ 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1 ],
        [ 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1 ],
        [ 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0 ],
        [ 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1 ],
        [ 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1 ],
        [ 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1 ],
        [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
        [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ] 
    ];
    height = 8;
    width = 13;
    */
    map = json.map;
	height = json.height;
	width = json.width;

    
	for(var i = 0; i < height; i++){
    	solution.push(Array());
    	for(var j = 0; j < width; j++){
    		solution[i][j] = "NULL";
    	}
    }

    return traverse(3,0);
}

function display(){
    /*
    $(".container").append("<div id='grid' style='height:" + map.length * 60 + "px; width: " + map[0].length * 60 + "px;'></div>");
    var html = "";
    for(var i = 0; i < map.length; i++) {
        for(var j = 0; j < map[i].length; j++) {
           html += "<div class='block' type='" + map[i][j] + "'></div>";
        }
    }
    $("#grid").append(html);
    */

    $(".container").append("<div id='solution' style='height:" + solution.length * 60 + "px; width: " + solution[0].length * 60 + "px;'></div>");
    var html = "";
    for(var i = 0; i < solution.length; i++) {
        for(var j = 0; j < solution[i].length; j++) {
           html += "<div class='block' type='" + solution[i][j] + "'></div>";
        }
    }
    $("#solution").append(html);
}

function traverse(i, j) {
    console.log("--------------------------");
    console.log("");
    console.log("--------------------------");
    console.log("i : " + i + " j : " + j);
    if (!isValid(i,j)) {
        return false;
    }
    console.log("is valid");
    if ( isEnd(i, j) ) {
        solution[i][j] = "PATH";
        return true;
    } else {
        solution[i][j] = "TRIED";
    }
    console.log("is not end");
    // North
    if (traverse(i - 1, j)) {
        solution[i-1][j] = "PATH";
        return true;
    }
    console.log("is not north");
    // East
    if (traverse(i, j + 1)) {
        solution[i][j + 1] = "PATH";
        return true;
    }
    console.log("is not east");
    // South
    if (traverse(i + 1, j)) {
        solution[i + 1][j] = "PATH";
        return true;
    }
    console.log("is not south");
    // West
    if (traverse(i, j - 1)) {
        solution[i][j - 1] = "PATH";
        return true;
    }
    console.log("is not west");
    return false;
}

function isEnd(i, j) {
    return map[i][j] == "end";
}

function isValid(i, j) {
    if (inRange(i, j) && isOpen(i, j) && !isTried(i, j)) {
        return true;
    }

    return false;
}

function isOpen(i, j) {
    return map[i][j] != "obstacle";
}

function isTried(i, j) {
    return solution[i][j] == "TRIED";
}

function inRange(i, j) {
    return inHeight(i) && inWidth(j);
}

function inHeight(i) {
    return i >= 0 && i < height;
}

function inWidth(j) {
    return j >= 0 && j < width;
}