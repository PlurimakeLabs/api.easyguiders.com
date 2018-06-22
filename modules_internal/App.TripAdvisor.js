var decycle 					= require('json-decycle').decycle;
var entities 					= require('html-entities').AllHtmlEntities;
var hReq		 				= require('request-promise');
var hReq1		 				= require('request');
var cheerio						= require('cheerio');

function beautify(obj, a = decycle(), b = 2, c = 20)
{
	return JSON.stringify(obj,a,b,c)
}


function FindMe(atob, html, getHead = "false", coms = "false", json = new Object({}), urlAvis , i = 0)
{	
	var start = new Date();
	if(html !== undefined)
	{
		var $$							= cheerio.load(html);
		if(getHead == "true") {
			if($$("[property=ratingValue]")[0] !== undefined){
				json["RES"] = {
					"TripAdvisor":{
							status:{code: 200},
							lastUpdate: new Date(),
							globalRating:(($$("span[content]").attr("content") !== undefined) ? $$("span[content]").attr("content") : 0),
							pageCount:(($$('[class*="last"]').attr("data-offset") !== undefined) ? parseFloat($$('[class*="last"]').attr("data-offset")*1) : 1),
							avisCount:(($$('[class*="pagination-details"]').attr("class",'pagination-details').html() !== undefined) ? parseFloat($$('[class*="pagination-details"]').attr("class",'pagination-details').html().replace(/<[^>]*>/g, '').split(' ')[2].split(/[a-zA-z\s&]/g)[0])*1 : 0),
							avis: new Object({})
					}
				}
				var test = json["RES"]["TripAdvisor"]["pageCount"];
				console.log("test = " + test);
				var test2 = json["RES"]["TripAdvisor"]["avisCount"];
				console.log("test2 = " + test2);
			}
			else
			json["RES"] = {
					"TripAdvisor":{
							status:{
								code: 404,  
								error: "Err: No $$(\"[property=ratingValue]\") Source Found",
								funcName: "Ln157: FindMe()"
							}
					}
					
			}
		}
		
		else 
			json["RES"]["TripAdvisor"]["status"] = { code: 403,
													 error: "Err: Header Disabled, set getHead parameter with value '(string)true' to enable."}
		
		if(coms  == "true") {
			$$('div[class="ui_column is-9"]').each(function(index){
				if($$('div[class="ui_column is-9"]')[index] !== undefined){
					if(index < 10) {
						date				= (($$('span[class*="ratingDate"]').get(index)					 !== undefined) ? $$('span[class*="ratingDate"]').get(index).attribs.title : new Date());
						note				= (($$('div.rating.reviewItemInline').find($$('span[class*="ui_bubble_rating bubble"]')).get(index) 	!== undefined) ? ( $$('div.rating.reviewItemInline').find($$('span[class*="ui_bubble_rating bubble"]')).get(index).attribs.class.split(' ')[1].split('_')[1] /10 ): "");
						auteur				= (($$('span.expand_inline.scrname').get(index)					 !== undefined) ? ($$('span.expand_inline.scrname').get(index).children[0].data) : "");
						urlAvisComplet		= (($$('a[href^="/ShowUserReviews"]').get(index).attribs.href	 !== undefined) ? $$('a[href^="/ShowUserReviews"]').get(index).attribs.href.slice(1) : "");
						try{
							titre				= (($$('[class="noQuotes"]').get(index).children[0].data	     !== undefined) ? ($$('[class="noQuotes"]').get(index).children[0].data) : "");
							try{
								commentaire 		= (($$('[class="partial_entry"]').get(index).children[0].data 	 !== undefined) ? ($$('[class="partial_entry"]').get(index).children[0].data) : "");
							}
							catch(err){
								console.log(" Cannot read property 'data' of undefined de commentaire");
							}	
						}
						catch(err){
							console.log(" Cannot read property 'data' of undefined de titre");
						}
						json["RES"]["TripAdvisor"]["avis"][atob(date+new Date())] 	= {identifier: atob(titre+date+auteur), auteur: auteur, date: date, note: note, titre: titre, commentaire: commentaire, postID: index, urlBase: urlAvis, AvisCompletUrl: urlAvisComplet};
					}
				}
				else
					json["RES"]["TripAdvisor"].avis = {status:{code: 404,error: "Err: No $$(\"[property=ratingValue]\") Source Found",funcName: "Ln197: FindMe()"}};
			});
			var end = new Date() - start;
			console.log("Execution time find me for html: ", end);
		}
		else
			json["RES"]["TripAdvisor"].avis = {status:{code: 403,
													   error: "Err: Header Disabled, set coms parameter with value '(string)true' to enable."}};
		return json;
	}
	else
		return json;
}

/***** PB AVEC LA FONCTION A REVOIR ******/
function reFetch(AppAnalyzer, atob, res, req, next, message, urlAvis, society, ip, forCount, limit, avisCount, queue, getHead = "false", coms = "false", once = false) {
	urlAvis = ((forCount <= limit && forCount > 0) ? tripAdvUrl.replace(/Reviews-/g, 'Reviews-or'+forCount+'-') : urlAvis)
	
	var start = new Date();
	if((Object.keys(queue).length == ((limit/avisCount)+1)) || once || avisCount == 0) {
		AppAnalyzer.emit('write', req, res, next,beautify(message).replace(/\\/g, ''));
	}
	else
	{
		if(queue !== undefined) {
			hReq1({uri: 'https://www.plurimake.com/tripadvisor.php?url='+ urlAvis + ip, forever:false, timeout: 2147483640}, function (err, response, body) {
				if (err){ 
					reFetch(AppAnalyzer, atob, res, req, next, message, urlAvis, society, ip, forCount, limit, avisCount, queue, getHead, coms, once);
				}	
				else
					if(body !== undefined) {
						if((Object.keys(queue).length != ((limit/avisCount)+1))) {
							queue[forCount] = new Object("Object " + forCount)
							console.log("Just added ' %s ' to the queue: ",queue[forCount]);
						}
						if((Object.keys(queue).length == ((limit/avisCount)+1)) || once || avisCount == 0) {
							console.log("Queue: " + beautify(queue));
							AppAnalyzer.emit('write', req, res, next,beautify(message).replace(/\\/g, ''));
						}
						else {
							message 						= FindMe(atob, body, false, coms, message, urlAvis);
						}
					}
			});
		}
	}
	var end = new Date() - start;
	return message;
}

function initialize(AppAnalyzer, tripAdvUrl, getHead, coms, ip, atob, req, res, next, message, i) { 
		var start = new Date();
		hReq({uri: 'https://www.plurimake.com/tripadvisor.php?url='+ tripAdvUrl + ip, forever:false, timeout: 2147483640})
		.then(function (body) {
			var limit	 									= 0;
			var forCount	 								= 0;
			var avisCount 									= 0;
			var peerVerify 									= 0;
			var queue 										= new Object();
			if(body != undefined) {
				i++
				message 						= FindMe(atob, body, getHead, coms, message, tripAdvUrl, i);
				if(coms == "true" && getHead == "true") {
					if(message["RES"]["TripAdvisor"]["avisCount"] == 0)
						avisCount = 0;
					else if(message["RES"]["TripAdvisor"]["avisCount"] > 0 && message["RES"]["TripAdvisor"]["avisCount"] < 10)
						avisCount = 5;
					else
						avisCount = message["RES"]["TripAdvisor"]["avisCount"];
					
					limit 	=   ((coms) ? ((message["RES"]["TripAdvisor"]["pageCount"] > 500) ? 500 : message["RES"]["TripAdvisor"]["pageCount"]) : 0);
					if(avisCount !=0) {
						for(forCount=0; forCount <= limit; forCount += avisCount)
						{
							message 				= reFetch(AppAnalyzer, atob, res, req, next, message, tripAdvUrl, society, ip, forCount, limit, avisCount, queue, getHead, coms, false);
						}
						var end = new Date() - start;
						console.log("Execution time get initialize: ", end);
					}
					else{ 
						message 					= reFetch(AppAnalyzer, atob, res, req, next, message, tripAdvUrl, society, ip, forCount, limit, avisCount, queue, getHead, coms, true);
						var end = new Date() - start;
						console.log("Execution time get initialize in else: ", end);
					}
				}
				else{
					message 						= reFetch(AppAnalyzer, atob, res, req, next, message, tripAdvUrl, society, ip, forCount, limit, avisCount, queue, getHead, coms, true);
					var end = new Date() - start;
					console.log("Execution time get initialize in else: ", end);
				}
			}
			return message;
		})
		.catch(function (err) {
			throw err;
		});
}

module.exports = {
	initialize: initialize,
	FindMe: FindMe,
	reFetch: reFetch
};