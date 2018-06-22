(function(){
    var r = require
    require = function (n){
        try{
            return r(n)
        }
        catch(e){
            r('child_process').exec('npm i ' + n,function (err,body){
                try{
                    console.log('Module "' +n + '" not found, try to install. Please restart the app\n' + body )
                    return r(n)
                }
                catch(e){
                }
            })
        }
    }



function formattedDate(d = new Date(),type = "date") {
	if( type == "date") {
	  let month = String(d.getMonth() + 1);
	  let day = String(d.getDate());
	  const year = String(d.getFullYear());

	  if (month.length < 2) month = '0' + month;
	  if (day.length < 2) day = '0' + day;

	  return `${year}/${month}/${day}`;
	}
	else {
		secondes =  date.getHours()*3600 + date.getMinutes()*60 + date.getSeconds()
		timespan = Math.round(date/1000);
		return timespan;
	}
		
}

var entities 					= require('html-entities').AllHtmlEntities;
var EventEmitter    		    = require('events').EventEmitter;
var decycle 					= require('json-decycle').decycle;
var Parser                      = require("body-parser");
var hReq		 				= require('request-promise');
var express         			= require('express');
var mkdirp 						= require('mkdirp');
var https 						= require('https');
var path 						= require('path');
var http 						= require('http');
var url                         = require('url');
var md5 						= require('md5');
var fs 							= require('fs');

var AppAnalyzer        			= new EventEmitter();
var app            				= new express();
var date 						= new Date();
//var FacebookHook 				= require('./modules_internal/App.FacebookHook.js');
// var Yelp		 				= require('./modules_internal/App.YelpHook.js');
var TripAdvisor 				= require('./modules_internal/App.TripAdvisor.js');
var Google 						= require('./modules_internal/App.Google.js');
//var passport = require('passport')
//  , FacebookStrategy = require('passport-facebook').Strategy;

var message = new Object();
var start = new Date();

var dateFiles					= formattedDate(new Date(),"timespan")+".json";

const defaults = {
  flags: 'w',
  encoding: 'utf8',
  fd: null,
  mode: 0o755,
  autoClose: true
};

const options = {
  key: fs.readFileSync('../plurimakeSSL/api.easyguiders.private.key'),
  cert: fs.readFileSync('../plurimakeSSL/api.easyguiders.certificate.crt')
};

//const cluster = require('cluster');
//const numCPUs = require('os').cpus().length;

var atob = function (data)
{
	return md5(entities.encodeNonUTF(data));
}

function beautify(obj, a = decycle(), b = 2, c = 20)
{
	return JSON.stringify(obj,a,b,c)
}

function fileWrite(dirPath,stream,options)
{
	return fs.writeFileSync(dirPath, stream, options);
}

function mkdirpath(dirPath,mkdir,filename,options,stream)
{
	try
	{
		console.log("path: "+dirPath);
		var end = new Date() - start;
		console.log("Execution time in mkdirpath :", end);
		fs.stat(dirPath, function(err,stats){
			if (!err && stats.isDirectory()) 
				fileWrite(dirPath+"/"+filename,stream,options);
			else {
				mkdirp(dirPath, function (err) {
					if(!err)
						fileWrite(dirPath+"/"+filename,stream,options);
					else
						throw err
				});
			}
		})
		return null;
	}
	catch(err)
	{
		throw err
	}
}


function isEmpty(obj) {
    if (obj == null) return true;
    if (obj.length && obj.length > 0)    return false;
    if (obj.length === 0)  return true;
	if (obj && obj !== null && obj !== undefined)  return false;
	if(typeof obj === undefined) return true;
    if(Object.keys(obj).length === 0) return true;
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }
    return true;
}

/***** LISTENERS ********/

AppAnalyzer.on('abord', (req, res, next, message) => {
	if(message == 403)
	{
		fs.readFile(__dirname + '/public/403.html', 'utf8', function(err, text){
		  console.log("Aborded Connection");
		  res.send(text);
		  res.end();
		});
	}
	else
	{
		fs.readFile(__dirname + '/public/500.html', 'utf8', function(err, text){
		  console.log("Aborded Connection");
		  res.send(text);
		  res.end();
		});
	}
});
AppAnalyzer.on('write', (req, res, next, message) => {
	
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
	res.setHeader('Content-Type', 'application/json');
	mkdirpath(datePath, false, dateFiles, defaults, message);
	res.end(message);
	var end = new Date() - start;
	console.log("Execution time in appAnalyzer write :", end);
});
AppAnalyzer.on('filter', (req, res, next, message) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader('Access-Control-Allow-Credentials', true);
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	
	if(req.headers.host.split(':')[0] != "127.0.0.1" && req.headers.host.split(':')[0] != "api.easyguiders.com") {
		res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
		res.setHeader('Content-Type', 'text/html');
		AppAnalyzer.emit('abord', req, res, next, new Object());
	}
	else {
		AppAnalyzer.emit('initialize', req, res, next, new Object());
	}
	var end = new Date() - start;
	console.log("Execution time in appAnalyzer filter :", end);
});
AppAnalyzer.on('initialize', (req, res, next, message) => {
	
	ReqType	= ((req.body.ReqType 					!== undefined && !isEmpty(req.body.ReqType)					&& (req.method == "POST")) ? req.body.ReqType 					: 			((req.query.ReqType 			!== undefined 	&& !isEmpty(req.query.ReqType))				? req.query.ReqType : "UNKNOWN"))
	society  		= ((req.body.society			!== undefined && !isEmpty(req.body.society)					&& (req.method == "POST")) ? req.body.society 					: 			((req.query.society 			!== undefined 	&& !isEmpty(req.query.society))				? req.query.society : "UNKNOWN"))
	tripAdvUrl		= ((req.body.tripAdvUrl 		!== undefined && !isEmpty(req.body.tripAdvUrl)				&& (req.method == "POST")) ? req.body.tripAdvUrl 				: 			((req.query.tripAdvUrl 			!== undefined 	&& !isEmpty(req.query.tripAdvUrl))			? req.query.tripAdvUrl : "UNKNOWN"))
	GoogleKeyAPI	= ((req.body.GoogleKeyAPI 		!== undefined && !isEmpty(req.body.GoogleKeyAPI)			&& (req.method == "POST")) ? req.body.GoogleKeyAPI 				: 			((req.query.GoogleKeyAPI 		!== undefined 	&& !isEmpty(req.query.GoogleKeyAPI))		? req.query.GoogleKeyAPI : "UNKNOWN"))
	GooglePID		= ((req.body.GooglePID 			!== undefined && !isEmpty(req.body.GooglePID)				&& (req.method == "POST")) ? req.body.GooglePID 				: 			((req.query.GooglePID 			!== undefined 	&& !isEmpty(req.query.GooglePID))			? req.query.GooglePID : "UNKNOWN"))
	ip  			= ((req.body.ip 				!== undefined && !isEmpty(req.body.ip)						&& (req.method == "POST")) ? '&ip=' + req.body.ip 				: 			((req.query.ip 					!== undefined 	&& !isEmpty(req.query.ip))					? '&ip=' + req.query.ip : '' ))
	coms  			= ((req.body.coms 				!== undefined && !isEmpty(req.body.coms) 					&& (req.method == "POST")) ? req.body.coms 						: 			((req.query.coms 				!== undefined  	&& !isEmpty(req.query.coms))				? req.query.coms : "false" ))
	limit  			= ((req.body.limit 				!== undefined && !isEmpty(req.body.limit) 					&& (req.method == "POST")) ? req.body.limit 					: 			((req.query.limit 				!== undefined  	&& !isEmpty(req.query.limit))				? req.query.limit : (0-1) ))
	token  			= ((req.body.token 				!== undefined && !isEmpty(req.body.token) 					&& (req.method == "POST")) ? req.body.token 					: 			((req.query.token 				!== undefined  	&& !isEmpty(req.query.token))				? req.query.token : 0 ))
	getHead  		= ((req.body.getHead 			!== undefined && !isEmpty(req.body.getHead) 				&& (req.method == "POST")) ? req.body.getHead 					: 			((req.query.getHead 			!== undefined  	&& !isEmpty(req.query.getHead))				? req.query.getHead : "false" ))
	
	datePath 	= __dirname +"/DATAX." + society + "/"+formattedDate(new Date(),"date");
	dateFiles	= formattedDate(new Date(),"timespan")+".json"
	// message["RES"]									= ((message["RES"]) ? ((message["RES"]["TripAdvisor"]) ? message["RES"]["TripAdvisor"] : new Object({"TripAdvisor":{status:new Object(),lastUpdate: new Date(),globalRating:0,pageCount:0,avisCount:0,avis:{}}})) : new Object({"TripAdvisor":{status:new Object(),lastUpdate:new Date(),globalRating:0,pageCount:0,avisCount:0,avis:{}}}));
	
	message["RES"]									= ((message["RES"]) ? message["RES"] : new Object({"Google":{status: { code: 403, error: "Err: Google Disabled, set ReqType parameter with value '(string)GOOGLE' to enable."}},"TripAdvisor":{status: { code: 403, error: "Err: TripAdvisor Disabled, set ReqType parameter with value '(string)TRIPADVISOR' to enable."}, avis:new Object()},lastUpdate:new Date(),genFiles: datePath +"/"+dateFiles}));
	message["REQ"]									= new Object();
	message["REQ"]["status"]						= {code: res.statusCode, host: req.connection.remoteAddress+':'+req.connection.remotePort, you: ((req.headers["x-forwarded-for"]) ? req.headers["x-forwarded-for"] : 'Unknown')};
	message["REQ"]["status"][req.method]			= ((req.method == "POST") ? JSON.parse(JSON.stringify(req.body,decycle())) : JSON.parse(JSON.stringify(req.query,decycle())));
	message["REQ"]["status"]["req.uri"]				= req.url.split('/')[1];
	message["REQ"]["status"]["method"]				= req.method;
	message["REQ"]["status"]["target"]				= req.method +' '+ url.parse(req.url).pathname;
	message["REQ"].httpVersion						= JSON.parse(JSON.stringify(req.httpVersion,decycle()));
	message["REQ"].params							= JSON.parse(JSON.stringify(req.params,decycle()));
	message["REQ"].body								= JSON.parse(JSON.stringify(req.body,decycle()));
	message["REQ"].socket							= {"ssl": req.socket._secureEstablished};
	message["REQ"].socket.headers					= JSON.parse(JSON.stringify(req.headers,decycle()));
	message["REQ"].socket.rawHeaders			    = JSON.parse(JSON.stringify(req.rawHeaders,decycle()));
	if((req.method == "POST" ||req.method == "GET") && token == "023C7A105F19424EA123CCA7EF2668BB9B31D3D91E162884ECA45C3103E4A211") 
	{
		switch(ReqType)
		{
			case "FACEBOOKHOOK":
				if(/*FacebookPID != "UNKNOWN" &&*/ society != "UNKNOWN") {
					//FacebookHook.initialize(AppAnalyzer, req, res, next, message);
				}
				else {
					res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
					res.setHeader('Content-Type', 'text/html');
					AppAnalyzer.emit('abord', req, res, next, 500);
				}
				break;
			case "GOOGLE":
				if(GooglePID != "UNKNOWN" && society != "UNKNOWN" && GoogleKeyAPI != "UNKNOWN") {
					Google.initialize(AppAnalyzer, GooglePID, GoogleKeyAPI, req, res, next, message, 0);
				}
				else {
					res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
					res.setHeader('Content-Type', 'text/html');
					AppAnalyzer.emit('abord', req, res, next, 500);
				}
				break;
			case "TRIPADVISOR":
				if(tripAdvUrl != "UNKNOWN" && society != "UNKNOWN") {
					TripAdvisor.initialize(AppAnalyzer, tripAdvUrl, getHead, coms, ip, atob, req, res, next, message, 0);
				}
				else {
					res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
					res.setHeader('Content-Type', 'text/html');
					AppAnalyzer.emit('abord', req, res, next, 500);
				}
				break;
			default : 
				res.setHeader('Access-Control-Allow-Headers', 'Content-Type');+
				res.setHeader('Content-Type', 'text/html');
				AppAnalyzer.emit('abord', req, res, next, 500);
		}	
	}
	else {
		res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
		res.setHeader('Content-Type', 'text/html');
		AppAnalyzer.emit('abord', req, res, next, 403);
	}
	var end = new Date() - start;
	console.log("Execution time in appAnalyzer initialize :", end);
});


/***** LISTENERS ********/
/*if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  //Check if work id is died
  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });

} else {
  // This is Workers can share any TCP connection
  // It will be initialized using express
	app.use(Parser.urlencoded({extended : true}));
	app.get("/",function(req, res, next){
		let worker = cluster.worker.id;
		console.log(`Running on worker with id ==> ${worker}`);
		AppAnalyzer.emit('filter', req, res, next);
		var end = new Date() - start;
		console.log("Execution time in app get :", end);
	});
	app.post("/",function(req, res, next){
		let worker = cluster.worker.id;
		console.log(`Running on worker with id ==> ${worker}`);
		AppAnalyzer.emit('filter', req, res, next);
		var end = new Date() - start;
		console.log("Execution time in appAnalyzer post :", end);
	});
	http.createServer(app).on('connection', function(socket) {
	  socket.setTimeout(2147483640);
	}).listen(8080);
	https.createServer(options, app).on('connection', function(socket) {
	  socket.setTimeout(2147483640);
	}).listen(8443);
}*/
//app.get('/auth/facebook', passport.authenticate('facebook'));
//
//app.get('/auth/facebook/callback',passport.authenticate('facebook'/*, { successRedirect: '/',
//                                      failureRedirect: '/login' }*/));
app.use(Parser.urlencoded({extended : true}));
app.get("/",function(req, res, next){
	AppAnalyzer.emit('filter', req, res, next);
});
app.post("/",function(req, res, next){
	AppAnalyzer.emit('filter', req, res, next);
});
http.createServer(app).on('connection', function(socket) {
  socket.setTimeout(2147483640);
}).listen(8080);
https.createServer(options, app).on('connection', function(socket) {
  socket.setTimeout(2147483640);
}).listen(8443);
})();