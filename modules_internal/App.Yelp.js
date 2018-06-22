var decycle 					= require('json-decycle').decycle;
var entities 					= require('html-entities').AllHtmlEntities;
var hReq		 				= require('request-promise');
var hReq1		 				= require('request');

function beautify(obj, a = decycle(), b = 2, c = 20)
{
	return JSON.stringify(obj,a,b,c)
}

function initialize(AppAnalyzer, req, res, next, message) { 
			return AppAnalyzer.emit('write', req, res, next,beautify(message));
		})
		.catch(function (err) {
			throw err;
		});
}

module.exports = {
	initialize: initialize,
};