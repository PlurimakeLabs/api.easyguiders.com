var decycle 					= require('json-decycle').decycle;
var entities 					= require('html-entities').AllHtmlEntities;
var hReq		 				= require('request-promise');
function beautify(obj, a = decycle(), b = 2, c = 20)
{
	return JSON.stringify(obj,a,b,c)
}

function initialize(AppAnalyzer, GooglePID, key, req, res, next, message, i) {
		hReq({uri: "https://maps.googleapis.com/maps/api/place/details/json?place_id=" + GooglePID + "&key=" + key, forever:false, timeout: 2147483640})
		.then(function (body) {
			if(body != undefined) {
				message["RES"]["Google"] = JSON.parse(body);
				message["RES"]["Google"].lastUpdate = new Date();
			}
			return AppAnalyzer.emit('write', req, res, next,beautify(message));
		})
		.catch(function (err) {
			throw err;
		});
}


/** EXPORT DES FONCTIONS **/
module.exports = {
	initialize: initialize
};