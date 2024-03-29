var fs = require('fs'),
	path = require('path'),
	mailer = require("nodemailer");

var myInformations = function(req, res){
	req.models.user.get(req.session.id, function(err, result){
		if(!err){
			res.render('user/myInformations', {user : result});
		}
		else{
			res.writeHead(301, {Location: '/home'});
			res.end();
		}
	});
}

var modifyMyInfos = function(req, res){
	req.models.user.get(req.session.id, function(err, result){
		if(!err){
			for(var key in req.body){
				if(key != "password"){
					result[key] = req.body[key];
				}
				else if(req.body.password != ""){
					result.password = req.body.password;
				}
	        }
	        result.save(function(err){
	        	if(err)
	        		console.log(err);
	        	res.writeHead(301, {Location: '/myInformations'} );
				res.end();
	        });	        
		}
		else{
			res.writeHead(301, {Location: '/myInformations'} );
			res.end();
		}
	});
}

var resetPassword = function(req, res){
	req.models.user.find({emailAddress: req.body.emailAddress}, function(err, result){
		console.log(err);
		if(!err){
			result[0].password = generatePassword(req.body.emailAddress);
			result[0].save(function(err){
				if(err)
					console.log(err);
				res.writeHead(301, {Location: '/'});
				res.end();
			});
		}
		else{
			res.writeHead(301, {Location: '/lostPassword'});
			res.end();
		}
	});
}

function generatePassword(mail){
	var newPass = Math.random().toString(36).slice(-8);
	sendMail(mail, newPass);
	return ""+sha1(newPass);
}

function sendMail(mail, pass){
	var smtpTransport = mailer.createTransport("SMTP",{
		service: "Gmail",  // sets automatically host, port and connection security settings
		auth: {
		   user: "parcmetreisep@gmail.com",
		   pass: "np4:89!B9"
		}
	});

	smtpTransport.sendMail(
		{  //email options
			from: "parcmetreisep@gmail.com", // sender address.  Must be the same as authenticated user if using Gmail.
			to: mail, // receiver
			subject: "Réinitialisation du mot de passe", // subject
			text: "Bonjour,\n\nVotre mot de passe est : " + pass + "\n\n À bientôt sur Monster Attack" // body
		},
		function(error, response){  //callback
			if(error){
			   console.log(error);
			}else{
			   console.log("Message sent: " + response.message);
			}
			smtpTransport.close(); // shut down the connection pool, no more messages.  Comment this line out to continue sending emails.
		}
	);
}

function sha1(e){function t(e,t){var n=e<<t|e>>>32-t;return n}function n(e){var t="";var n;var r;var i;for(n=0;n<=6;n+=2){r=e>>>n*4+4&15;i=e>>>n*4&15;t+=r.toString(16)+i.toString(16)}return t}function r(e){var t="";var n;var r;for(n=7;n>=0;n--){r=e>>>n*4&15;t+=r.toString(16)}return t}function i(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t}var s;var o,u;var a=new Array(80);var f=1732584193;var l=4023233417;var c=2562383102;var h=271733878;var p=3285377520;var d,v,m,g,y;var b;e=i(e);var w=e.length;var E=new Array;for(o=0;o<w-3;o+=4){u=e.charCodeAt(o)<<24|e.charCodeAt(o+1)<<16|e.charCodeAt(o+2)<<8|e.charCodeAt(o+3);E.push(u)}switch(w%4){case 0:o=2147483648;break;case 1:o=e.charCodeAt(w-1)<<24|8388608;break;case 2:o=e.charCodeAt(w-2)<<24|e.charCodeAt(w-1)<<16|32768;break;case 3:o=e.charCodeAt(w-3)<<24|e.charCodeAt(w-2)<<16|e.charCodeAt(w-1)<<8|128;break}E.push(o);while(E.length%16!=14)E.push(0);E.push(w>>>29);E.push(w<<3&4294967295);for(s=0;s<E.length;s+=16){for(o=0;o<16;o++)a[o]=E[s+o];for(o=16;o<=79;o++)a[o]=t(a[o-3]^a[o-8]^a[o-14]^a[o-16],1);d=f;v=l;m=c;g=h;y=p;for(o=0;o<=19;o++){b=t(d,5)+(v&m|~v&g)+y+a[o]+1518500249&4294967295;y=g;g=m;m=t(v,30);v=d;d=b}for(o=20;o<=39;o++){b=t(d,5)+(v^m^g)+y+a[o]+1859775393&4294967295;y=g;g=m;m=t(v,30);v=d;d=b}for(o=40;o<=59;o++){b=t(d,5)+(v&m|v&g|m&g)+y+a[o]+2400959708&4294967295;y=g;g=m;m=t(v,30);v=d;d=b}for(o=60;o<=79;o++){b=t(d,5)+(v^m^g)+y+a[o]+3395469782&4294967295;y=g;g=m;m=t(v,30);v=d;d=b}f=f+d&4294967295;l=l+v&4294967295;c=c+m&4294967295;h=h+g&4294967295;p=p+y&4294967295}var b=r(f)+r(l)+r(c)+r(h)+r(p);return b.toLowerCase()}

exports.myInformations = myInformations;
exports.modifyMyInfos = modifyMyInfos;
exports.resetPassword = resetPassword;