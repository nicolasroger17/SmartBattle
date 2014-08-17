var app = require('express')(),
    express = require('express'),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    ent = require('ent'), // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
    fs = require('fs');

io.set('transports', [ 'xhr-polling', 'jsonp-polling', 'htmlfile' ]);
app.use('/public', express.static(__dirname + "/public"));

// Chargement de la page index.html
app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

var pseudoList = Array();
io.sockets.on('connection', function (socket, pseudo) {
    // Dès qu'on nous donne un pseudo, on le stocke en variable de session et on informe les autres personnes
    socket.on('nouveau_client', function(pseudo) {
        pseudo = ent.encode(pseudo);
        socket.set('pseudo', pseudo);
        pseudoList.push(pseudo);
        socket.broadcast.emit('refreshPlayers', pseudoList);
        socket.emit('refreshPlayers', pseudoList);
    });

var updateGame = false;
    socket.on('gameStart', function(){
        initializeTanks();
        socket.broadcast.emit('newGame', tanks);
        socket.emit('newGame', tanks);

        updateGame = setInterval(function(){
            updateMissiles();
            socket.broadcast.emit('updateGame', tanks, missiles);
            socket.emit('updateGame', tanks, missiles);
        }, 1);
    });

    socket.on('action', function(keyList){
        socket.get('pseudo', function(error, pseudo){
            for(var tank in tanks){
                if(tanks[tank].name == pseudo){
                    if(keyList[37]){
                        if(tanks[tank].position.left > 0)
                            tanks[tank].position.left -= 1;
                    }
                    if(keyList[38]){
                        if(tanks[tank].position.top > 0)
                            tanks[tank].position.top -= 1;
                    }
                    if(keyList[39]){
                        if(tanks[tank].position.left < 1210)
                            tanks[tank].position.left += 1;
                    }
                    if(keyList[40]){
                        if(tanks[tank].position.top < 730)
                            tanks[tank].position.top += 1;
                    }
                    if(keyList[83]){
                        tanks[tank].rotation += 1;
                    }
                    if(keyList[90]){
                        tanks[tank].rotation -= 1;
                    }
                }
            }
        });
    });

    socket.on('fire', function(){
        socket.get('pseudo', function(error, pseudo){
            for(var tank in tanks){
                if(tanks[tank].name == pseudo){
                    createMissile(tanks[tank]);
                }
            }
        });        
    });

    var tanks = Array();
    var walls = Array();
    var missiles = Array();
    var missilesCount = 0;

    var defaultPosition = Array({top: 40, left: 40}, {top: 720, left: 1200});
    function initializeTanks(){
        for(var i = 0; i < pseudoList.length; i++){
            tanks.push({name: pseudoList[i], position: defaultPosition[i], rotation: 0});
        }
    }

    var iMissiles = Array();
    function createMissile(tank){
        var move = moves(tank.rotation);
        var missile = {id: "missile"+missilesCount, rotation: tank.rotation, top: 70 + tank.position.top, left: 344 + tank.position.left, x: move.x, y: move.y};
        missiles.push(missile);
        missilesCount++;
        socket.emit('createMissile', missile);
        socket.broadcast.emit('createMissile', missile);
    }

    function moves(rotation){
        rotation = (Math.PI * rotation) / 180;
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
        return move;
    }

    function updateMissiles(){
        for(var missile in missiles){
            missiles[missile].top += missiles[missile].y;
            missiles[missile].left += missiles[missile].x;
            checkMissile(missiles[missile], missile);
        }
    }

    function checkMissile(missile, index){
        if(missile.left < 312 || missile.left > 1562 || missile.top < 40 || missile.top > 840){
            missiles.splice(index, 1);
            socket.emit('deleteMissile', missile.id);
            socket.broadcast.emit('deleteMissile', missile.id);
        }
    }

    function checkTankDestruction(){
        for(var missile in missiles){
            for(var tank in tanks){
            }
        }
    }

    function determineRotation(tank, pos){
        var currRotation = 360 - ((((Math.atan2((pos.mouseX - pos.tankX), (pos.mouseY - pos.tankY))) * 180 ) / Math.PI) + 180);
        if(Math.abs((360 + currRotation) - (360 + tank.rotation)) < 180){
            tank.rotation += 1;
        }
        else{
            tank.rotation -= 1;
        }
        return tank;
    }
});

server.listen(8080);