var express = require('express'),
    orm = require('orm'),
    app = express(),
    path = require('path'),
    server = require('http'),
    ent = require('ent'), // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
    fs = require('fs'),
    crypto = require('crypto'),
    conf = require('./config/conf.js')();

app.set('port', process.env.PORT || 8080) // défini le port du serveur
.use('/webroot', express.static(__dirname + '/webroot')) // rend le dossier webroot public
//configuration des classes pour l'ORM 
.use(orm.express(conf, {
   define: function (db, models) {
    // les utilisateurs
      models.user = db.define("user", {
         pseudo     : String,
         emailAddress : String,
         password     : String,
         level       : Number,
         score       : Number
      },
      {
        id: ['id'],
        hooks: {
            beforeCreate: function() {
              this.password = crypto.createHash('sha1').update(this.password).digest('hex');
              this.level = 0;
              this.score = 0;
            }
        },
        methods: {
            // add methods 
         },
         validations: {
            id: orm.enforce.unique("id already taken!"),
            emailAddress: orm.enforce.unique({ ignoreCase: true }, "mail already taken!")
         },
         cache   : false
      })
   }
}))
.set('views', __dirname + '/views') // défini le dossier contenant les vu pour fs
.set('view engine', 'ejs') // défini ejs comme le gérant des templates
.use(express.favicon())
.use(express.logger('dev')) // active le mode developpeur pour la console du serveur
.use(express.json()) // sert à gérer les données envoyez par formulaires
.use(express.urlencoded()) // idem
.use(express.methodOverride())
.use(express.cookieParser('SecretCookie')) // sert à gérer les sessions (grain de sel)
.use(express.session()) // sert à gérer les sessions
.use(app.router); // permet de router les sessions

fs.readdirSync('./controllers').forEach(function (file) {
  if(file.substr(-3) == '.js') {
      route = require('./controllers/' + file);
      route.controller(app);
  }
});

// démarre le serveur
server.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});