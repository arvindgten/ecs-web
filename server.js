'use strict';

const express = require( 'express' );
var compression = require( 'compression' );
const cookieParser = require( 'cookie-parser' );
var fs = require( 'fs' );

var requestModule = require( 'request' );
var http = require( 'http' );
var https = require( 'https' );
var httpPromise = require( 'request-promise' );

var httpAgent = new http.Agent({ keepAlive : true });
var httpsAgent = new https.Agent({ keepAlive : true });

// Constants
const PORT = 80;
process.env.UV_THREADPOOL_SIZE = 128;

function Enum() {
	this._enums = [];
	this._lookups = {};
}

Enum.prototype = {
	getEnums: function() {
		return _enums;
	},
	forEach: function( callback ) {
		var length = this._enums.length;
		for( var i = 0; i < length; ++i ) {
			callback( this._enums[i] );
		}
	},
	addEnum: function(e) {
		this._enums.push(e);
	},
	getByName: function( name ) {
		return this[ name ];
	},
	getByValue: function( field, value ) {
		var lookup = this._lookups[ field ];
		if( lookup ) {
			return lookup[ value ];
		} else {
			this._lookups[ field ] = ( lookup = {} );
			var k = this._enums.length - 1;
			for( ; k >= 0; --k ) {
				var m = this._enums[k];
				var j = m[ field ];
				lookup[j] = m;
				if( j == value ) { return m; }
			}
		}
	return null;
	},
	toString: function() {
		return this.__name__;
	}
};

function defineEnum( definition ) {
	var e = new Enum();
	for( var k in definition ) {
		var j = definition[k];
		j[ "__name__" ] = k;
		e[k] = j;
		e.addEnum(j);
	}
	return e;
}

// Language
var Language = defineEnum({
	HINDI:      { code: "hi", name: "हिंदी",        nameEn: "Hindi" },
	GUJARATI:   { code: "gu", name: "ગુજરાતી",     nameEn: "Gujarati" },
	TAMIL:      { code: "ta", name: "தமிழ்",      nameEn: "Tamil" },
	MARATHI:    { code: "mr", name: "मराठी",		nameEn: "Marathi" },
	MALAYALAM:  { code: "ml", name: "മലയാളം",	    nameEn: "Malayalam" },
	BENGALI:    { code: "bn", name: "বাংলা",		nameEn: "Bengali" },
	TELUGU:     { code: "te", name: "తెలుగు",	    nameEn: "Telugu" },
	KANNADA:    { code: "kn", name: "ಕನ್ನಡ",	    nameEn: "Kannada" },
	ENGLISH:    { code: "en", name: "English",	nameEn: "English" }
});

// Website
var Website = defineEnum({

	ALL_LANGUAGE:	{ hostName: "www.pratilipi.com",        mobileHostName: "m.pratilipi.com", displayLanguage: Language.ENGLISH,	    filterLanguage: null },
	HINDI:			{ hostName: "hindi.pratilipi.com",      mobileHostName: "hi.pratilipi.com", displayLanguage: Language.HINDI,		filterLanguage: Language.HINDI },
	GUJARATI:		{ hostName: "gujarati.pratilipi.com",   mobileHostName: "gu.pratilipi.com", displayLanguage: Language.GUJARATI,    filterLanguage: Language.GUJARATI },
	TAMIL:			{ hostName: "tamil.pratilipi.com",      mobileHostName: "ta.pratilipi.com", displayLanguage: Language.TAMIL,		filterLanguage: Language.TAMIL },
	MARATHI:		    { hostName: "marathi.pratilipi.com",    mobileHostName: "mr.pratilipi.com", displayLanguage: Language.MARATHI,	    filterLanguage: Language.MARATHI },
	MALAYALAM:		{ hostName: "malayalam.pratilipi.com",  mobileHostName: "ml.pratilipi.com", displayLanguage: Language.MALAYALAM,	filterLanguage: Language.MALAYALAM },
	BENGALI:		    { hostName: "bengali.pratilipi.com",    mobileHostName: "bn.pratilipi.com", displayLanguage: Language.BENGALI,	    filterLanguage: Language.BENGALI },
	KANNADA:		    { hostName: "kannada.pratilipi.com",    mobileHostName: "kn.pratilipi.com", displayLanguage: Language.KANNADA,	    filterLanguage: Language.KANNADA },
	TELUGU:			{ hostName: "telugu.pratilipi.com",     mobileHostName: "te.pratilipi.com", displayLanguage: Language.TELUGU,		filterLanguage: Language.TELUGU },

	GAMMA_ALL_LANGUAGE:	{ hostName: "www-gamma.pratilipi.com",          mobileHostName: "m-gamma.pratilipi.com",  displayLanguage: Language.ENGLISH,	filterLanguage: null },
	GAMMA_HINDI:			{ hostName: "hindi-gamma.pratilipi.com",        mobileHostName: "hi-gamma.pratilipi.com", displayLanguage: Language.HINDI,		filterLanguage: Language.HINDI },
	GAMMA_GUJARATI:		{ hostName: "gujarati-gamma.pratilipi.com",     mobileHostName: "gu-gamma.pratilipi.com", displayLanguage: Language.GUJARATI,	filterLanguage: Language.GUJARATI },
	GAMMA_TAMIL:			{ hostName: "tamil-gamma.pratilipi.com",        mobileHostName: "ta-gamma.pratilipi.com", displayLanguage: Language.TAMIL,		filterLanguage: Language.TAMIL },
	GAMMA_MARATHI:		{ hostName: "marathi-gamma.pratilipi.com",      mobileHostName: "mr-gamma.pratilipi.com", displayLanguage: Language.MARATHI,	filterLanguage: Language.MARATHI },
	GAMMA_MALAYALAM:		{ hostName: "malayalam-gamma.pratilipi.com",    mobileHostName: "ml-gamma.pratilipi.com", displayLanguage: Language.MALAYALAM,	filterLanguage: Language.MALAYALAM },
	GAMMA_BENGALI:		{ hostName: "bengali-gamma.pratilipi.com",      mobileHostName: "bn-gamma.pratilipi.com", displayLanguage: Language.BENGALI,	filterLanguage: Language.BENGALI },
	GAMMA_KANNADA:		{ hostName: "kannada-gamma.pratilipi.com",      mobileHostName: "kn-gamma.pratilipi.com", displayLanguage: Language.KANNADA,	filterLanguage: Language.KANNADA },
	GAMMA_TELUGU:		{ hostName: "telugu-gamma.pratilipi.com",       mobileHostName: "te-gamma.pratilipi.com", displayLanguage: Language.TELUGU,	filterLanguage: Language.TELUGU },

	GAMMA_ALL_LANGUAGE_GR:	{ hostName: "www-gamma-gr.pratilipi.com",          mobileHostName: "m-gamma-gr.pratilipi.com",  displayLanguage: Language.ENGLISH,	filterLanguage: null },
	GAMMA_HINDI_GR:			{ hostName: "hindi-gamma-gr.pratilipi.com",        mobileHostName: "hi-gamma-gr.pratilipi.com", displayLanguage: Language.HINDI,		filterLanguage: Language.HINDI },
	GAMMA_GUJARATI_GR:		{ hostName: "gujarati-gamma-gr.pratilipi.com",     mobileHostName: "gu-gamma-gr.pratilipi.com", displayLanguage: Language.GUJARATI,	filterLanguage: Language.GUJARATI },
	GAMMA_TAMIL_GR:			{ hostName: "tamil-gamma-gr.pratilipi.com",        mobileHostName: "ta-gamma-gr.pratilipi.com", displayLanguage: Language.TAMIL,		filterLanguage: Language.TAMIL },
	GAMMA_MARATHI_GR:		{ hostName: "marathi-gamma-gr.pratilipi.com",      mobileHostName: "mr-gamma-gr.pratilipi.com", displayLanguage: Language.MARATHI,	filterLanguage: Language.MARATHI },
	GAMMA_MALAYALAM_GR:		{ hostName: "malayalam-gamma-gr.pratilipi.com",    mobileHostName: "ml-gamma-gr.pratilipi.com", displayLanguage: Language.MALAYALAM,	filterLanguage: Language.MALAYALAM },
	GAMMA_BENGALI_GR:		{ hostName: "bengali-gamma-gr.pratilipi.com",      mobileHostName: "bn-gamma-gr.pratilipi.com", displayLanguage: Language.BENGALI,	filterLanguage: Language.BENGALI },
	GAMMA_KANNADA_GR:		{ hostName: "kannada-gamma-gr.pratilipi.com",      mobileHostName: "kn-gamma-gr.pratilipi.com", displayLanguage: Language.KANNADA,	filterLanguage: Language.KANNADA },
	GAMMA_TELUGU_GR:		    { hostName: "telugu-gamma-gr.pratilipi.com",       mobileHostName: "te-gamma-gr.pratilipi.com", displayLanguage: Language.TELUGU,	filterLanguage: Language.TELUGU },

	DEVO_ALL_LANGUAGE:{ hostName: "www-devo.ptlp.co",       mobileHostName: "m-devo.ptlp.co", displayLanguage: Language.ENGLISH,		filterLanguage: null },
	DEVO_HINDI:       { hostName: "hindi-devo.ptlp.co",     mobileHostName: "hi-devo.ptlp.co", displayLanguage: Language.HINDI,		filterLanguage: Language.HINDI },
	DEVO_GUJARATI:    { hostName: "gujarati-devo.ptlp.co",  mobileHostName: "gu-devo.ptlp.co", displayLanguage: Language.GUJARATI,	filterLanguage: Language.GUJARATI },
	DEVO_TAMIL:       { hostName: "tamil-devo.ptlp.co",     mobileHostName: "ta-devo.ptlp.co", displayLanguage: Language.TAMIL,		filterLanguage: Language.TAMIL },
	DEVO_MARATHI:     { hostName: "marathi-devo.ptlp.co",   mobileHostName: "mr-devo.ptlp.co", displayLanguage: Language.MARATHI,	filterLanguage: Language.MARATHI },
	DEVO_MALAYALAM:   { hostName: "malayalam-devo.ptlp.co", mobileHostName: "ml-devo.ptlp.co", displayLanguage: Language.MALAYALAM,	filterLanguage: Language.MALAYALAM },
	DEVO_BENGALI:     { hostName: "bengali-devo.ptlp.co",   mobileHostName: "bn-devo.ptlp.co", displayLanguage: Language.BENGALI,	filterLanguage: Language.BENGALI },
	DEVO_TELUGU:      { hostName: "telugu-devo.ptlp.co",    mobileHostName: "te-devo.ptlp.co", displayLanguage: Language.TELUGU,	filterLanguage: Language.TELUGU },
	DEVO_KANNADA:     { hostName: "kannada-devo.ptlp.co",   mobileHostName: "kn-devo.ptlp.co", displayLanguage: Language.KANNADA,	filterLanguage: Language.KANNADA },

	DEVO_ALL_LANGUAGE_GR:{ hostName: "www-devo-gr.ptlp.co",       mobileHostName: "m-devo-gr.ptlp.co", displayLanguage: Language.ENGLISH,		filterLanguage: null },
	DEVO_HINDI_GR:       { hostName: "hindi-devo-gr.ptlp.co",     mobileHostName: "hi-devo-gr.ptlp.co", displayLanguage: Language.HINDI,		filterLanguage: Language.HINDI },
	DEVO_GUJARATI_GR:    { hostName: "gujarati-devo-gr.ptlp.co",  mobileHostName: "gu-devo-gr.ptlp.co", displayLanguage: Language.GUJARATI,	filterLanguage: Language.GUJARATI },
	DEVO_TAMIL_GR:       { hostName: "tamil-devo-gr.ptlp.co",     mobileHostName: "ta-devo-gr.ptlp.co", displayLanguage: Language.TAMIL,		filterLanguage: Language.TAMIL },
	DEVO_MARATHI_GR:     { hostName: "marathi-devo-gr.ptlp.co",   mobileHostName: "mr-devo-gr.ptlp.co", displayLanguage: Language.MARATHI,	filterLanguage: Language.MARATHI },
	DEVO_MALAYALAM_GR:   { hostName: "malayalam-devo-gr.ptlp.co", mobileHostName: "ml-devo-gr.ptlp.co", displayLanguage: Language.MALAYALAM,	filterLanguage: Language.MALAYALAM },
	DEVO_BENGALI_GR:     { hostName: "bengali-devo-gr.ptlp.co",   mobileHostName: "bn-devo-gr.ptlp.co", displayLanguage: Language.BENGALI,	filterLanguage: Language.BENGALI },
	DEVO_TELUGU_GR:      { hostName: "telugu-devo-gr.ptlp.co",    mobileHostName: "te-devo-gr.ptlp.co", displayLanguage: Language.TELUGU,	filterLanguage: Language.TELUGU },
	DEVO_KANNADA_GR:     { hostName: "kannada-devo-gr.ptlp.co",   mobileHostName: "kn-devo-gr.ptlp.co", displayLanguage: Language.KANNADA,	filterLanguage: Language.KANNADA },

	ALPHA:	{ hostName: "localhost:8080", mobileHostName: "localhost:8081", displayLanguage: Language.HINDI, displayLanguage: Language.HINDI,  }

});

function _getWebsite( hostName ) {
	var website = null;
	var basicMode;
	Website.forEach( function( web ) {
		if( web.hostName == hostName ) {
			website = web;
			basicMode = false;
			return;
		} else if( web.mobileHostName == hostName ) {
			website = web;
			basicMode = true;
			return;
		}
	});
	return website;
}

var APPENGINE_ENDPOINT;
switch( process.env.STAGE ) {
	case "devo":
		APPENGINE_ENDPOINT = "https://devo-pratilipi.appspot.com";
		break;
	case "gamma":
		APPENGINE_ENDPOINT = "https://gae-gamma.pratilipi.com";
		break;
	case "prod":
		APPENGINE_ENDPOINT = "https://gae-prod.pratilipi.com";
		break;
}

const UNEXPECTED_SERVER_EXCEPTION = { "message": "Some exception occurred at server. Please try again." };

String.prototype.contains = function( str, startIndex ) {
	return -1 !== String.prototype.indexOf.call( this, str, startIndex );
};

String.prototype.isStaticFileRequest = function() {
	var staticFileExts = [ ".html", ".css", ".js", ".ico", ".png", ".svg", ".jpg", ".jpeg" ];
	for( var i = 0; i < staticFileExts.length; i++ )
		if( this && this.endsWith( staticFileExts[i] ) ) return true;
	return false;
};

// _forwardToMini -> url might be null
function _forwardToMini( req, res ) {
	var _getMiniEndpoint = function( req ) {
		//Strip out port number
		var hostName = ( req.headers.host.match(/:/g) ) ? req.headers.host.slice( 0, req.headers.host.indexOf(":") ) : req.headers.host;
		if( hostName === "localhost" )
			return "https://hi-devo.ptlp.co";
		return "http://" + hostName + ":81";
	};
	var url = _getMiniEndpoint( req ) + req.url;
	var headers = { "Access-Token": res.locals[ "access-token" ] };
	if( req.path.isStaticFileRequest() ) {
		req.pipe( requestModule(url) ).pipe( res );
	} else {
		var options = {
			uri: url,
			headers: headers,
			method: "GET",
			agent : url.indexOf( "https://" ) >= 0 ? httpsAgent : httpAgent,
			timeout: 60000, // 60 seconds
			simple: false,
			time: true,
			resolveWithFullResponse: true
		};
		console.log( "_forwardToMini::" + url + " :: " + JSON.stringify( headers ) );
		httpPromise( options )
			.then( resp => {
				res.status( resp.statusCode ).set( resp.headers ).send( resp.body );
			})
			.catch( err => {
				console.log( "MINI_ERROR :: " + err.message );
				res.status( 500 ).send( UNEXPECTED_SERVER_EXCEPTION );
			})
		;
	}
}

// _forwardToGae -> url might be null
function _forwardToGae( url, req, res ) {
	if( ! url ) {
		url = APPENGINE_ENDPOINT + req.url;
		if( res.locals[ "access-token" ] )
			url += ( url.contains( "?" ) ? "&" : "?" ) + "accessToken=" + res.locals[ "access-token" ];
	}
	var options = {
		uri: url,
		headers: { "ECS-HostName": req.headers.host },
		method: "GET",
		agent : url.indexOf( "https://" ) >= 0 ? httpsAgent : httpAgent,
		timeout: 60000, // 60 seconds
		simple: false,
		time: true,
		resolveWithFullResponse: true
	};
	console.log( "_forwardToGae::" + url );
	httpPromise( options )
		.then( resp => {
			res.status( resp.statusCode ).set( resp.headers ).send( resp.body );
		})
		.catch( err => {
			console.log( "GAE_ERROR :: " + err.message );
			res.status( 500 ).send( UNEXPECTED_SERVER_EXCEPTION );
		})
	;
}

// App
const app = express();

// cookie parser
app.use( cookieParser() );

// gzip all responses
app.use( compression() );

// Health
app.get( '/health', (req, res, next) => {
	console.log( "Healthy!" );
	res.send( Date.now() + "" );
});


// https://www.hindi.pratilipi.com -> https://hindi.pratilipi.com
app.use( (req, res, next) => {
	var host = req.get( 'host' );
	var redirected = false;
	Website.forEach( function( web ) {
		if( host === "www." + web.hostName ) {
			return res.redirect( 301, ( req.secure ? 'https://' : 'http://' ) + web.hostName + req.originalUrl );
			redirected = true;
		} else if( host === "www." + web.mobileHostName ) {
			return res.redirect( 301, ( req.secure ? 'https://' : 'http://' ) + web.mobileHostName + req.originalUrl );
			redirected = true;
		}
	});
	if( !redirected )
		next();
});


// If nothing matches, redirect to pratilipi.com
app.use( (req, res, next) => {
	if( _getWebsite( req.headers.host ) == null )
		return res.redirect( 301, 'https://www.pratilipi.com/?redirect=ecs' );
	else
		next();
});

/*
*   http -> https redirection
*	If your app is behind a trusted proxy (e.g. an AWS ELB or a correctly configured nginx), this code should work.
*	This assumes that you're hosting your site on 80 and 443, if not, you'll need to change the port when you redirect.
*	This also assumes that you're terminating the SSL on the proxy. If you're doing SSL end to end use the answer from @basarat above. End to end SSL is the better solution.
*	app.enable('trust proxy') allows express to check the X-Forwarded-Proto header.
*/
app.enable( 'trust proxy' );
app.use( (req, res, next) => {
	if( req.secure || _getWebsite( req.headers.host ).__name__ === "ALPHA" || req.headers.host.contains( "-devo" ) ) {
		return next();
	}
	res.redirect( "https://" + req.headers.host + req.url );
});


// Remove trailing slash
app.use( (req, res, next) => {
	if( req.path !== "/" && req.originalUrl.endsWith( "/" ) )
		return res.redirect( 301, ( req.secure ? 'https://' : 'http://' ) + req.get('host') + req.originalUrl.slice(0, -1) );
	else
		next();
});

// Redirections
app.use( (req, res, next) => {
	var redirections = {};
	redirections[ "/theme.pratilipi/logo.png" ] =  "/logo.png" ;
	redirections[ "/apple-touch-icon.png" ] =  "/favicon.ico" ;
	redirections[ "/apple-touch-icon-120x120.png" ] =  "/favicon.ico" ;
	redirections[ "/apple-touch-icon-precomposed.png" ] =  "/favicon.ico" ;
	redirections[ "/apple-touch-icon-120x120-precomposed.png" ] =  "/favicon.ico" ;
	redirections[ "/about" ] =  "/about/pratilipi" ;
	redirections[ "/career" ] =  "/work-with-us" ;
	redirections[ "/authors" ] =  "/admin/authors" ;
	redirections[ "/email-templates" ] =  "/admin/email-templates" ;
	redirections[ "/batch-process" ] =  "/admin/batch-process" ;
	redirections[ "/resetpassword" ] =  "/forgot-password" ;

	if( redirections[ req.path ] )
		return res.redirect( 301, ( req.secure ? 'https://' : 'http://' ) + req.get('host') + redirections[ req.path ] );
	else
		next();

});

// Redirecting to new Pratilipi content image url
app.use( (req, res, next) => {
	if( req.path === "/api.pratilipi/pratilipi/resource" )
		return res.redirect( 301, ( req.secure ? 'https://' : 'http://' ) + req.get('host') + "/api/pratilipi/content/image" + "?" + req.url.split( '?' )[1] );
	else
		next();
});

// Crawling Urls like robots.txt, sitemap
app.get( '/*', (req, res, next) => {
	if( process.env.STAGE === "prod" ) {
		if( req.path === '/sitemap' || req.path === '/robots.txt' )
			_forwardToGae( null, req, res );
		else
			next();
	} else {
		next();
	}
});


// Crawlers - only for prod and gamma env
app.get( '/*', (req, res, next) => {

	if( process.env.STAGE === "prod" || process.env.STAGE === "gamma" ) {

		var userAgent = req.get( 'User-Agent' );
		var isCrawler = false;

		if( ! userAgent ) {
			// Do Nothing

		} else if( userAgent.contains( "Googlebot" ) ) { // Googlebot/2.1; || Googlebot-News || Googlebot-Image/1.0 || Googlebot-Video/1.0
			isCrawler = true;

		} else if( userAgent === "Google (+https://developers.google.com/+/web/snippet/)" ) { // Google+
			isCrawler = true;

		} else if( userAgent.contains( "Bingbot" ) ) { // Microsoft Bing
			isCrawler = true;

		} else if( userAgent.contains( "Slurp" ) ) { // Yahoo
			isCrawler = true;

		} else if( userAgent.contains( "DuckDuckBot" ) ) { // DuckDuckGo
			isCrawler = true;

		} else if( userAgent.contains( "Baiduspider" ) ) { // Baidu - China
			isCrawler = true;

		} else if( userAgent.contains( "YandexBot" ) ) { // Yandex - Russia
			isCrawler = true;

		} else if( userAgent.contains( "Exabot" ) ) { // ExaLead - France
			isCrawler = true;

		} else if( userAgent === "facebot"
				|| userAgent.startsWith( "facebookexternalhit/1.0" )
				|| userAgent.startsWith( "facebookexternalhit/1.1" ) ) { // Facebook Scraping requests
			isCrawler = true;

		} else if( userAgent.startsWith( "WhatsApp" ) ) { // Whatsapp
			isCrawler = true;

		} else if( userAgent.startsWith( "ia_archiver" ) ) { // Alexa Crawler
			isCrawler = true;
		}

		if( isCrawler ) {
			_forwardToMini( req, res );
		} else {
			next();
		}
	} else {
		next();
	}
});


// Redirecting to Mini website - only for prod env
app.use( (req, res, next) => {

	var web = _getWebsite( req.headers.host )
	if( req.headers.host !== web.mobileHostName && process.env.STAGE === "prod" ) {

		var userAgent = req.get( 'User-Agent' );
		var basicBrowser = false;

		if( userAgent == null || userAgent.trim() === "" ) {
			basicBrowser = true;

		} else if( userAgent.contains( "UCBrowser" ) || userAgent.contains( "UCWEB" ) ) { // UCBrowser

			 // UCBrowser on Android 4.3
			 // "Mozilla/5.0 (Linux; U; Android 4.3; en-US; GT-I9300 Build/JSS15J) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 UCBrowser/10.0.1.512 U3/0.8.0 Mobile Safari/533.1"

			basicBrowser = true; // Extreme mode

		} else if( userAgent.contains( "Opera Mobi" ) ) { // Opera Classic

			 // Opera Classic on Android 4.3
			 //  "Opera/9.80 (Android 4.3; Linux; Opera Mobi/ADR-1411061201) Presto/2.11.355 Version/12.10"

			basicBrowser = true; // Not sure whether Polymer 1.0 is supported or not

		} else if( userAgent.contains( "Opera Mini" ) ) { // Opera Mini

			 // Opera Mini on Android 4.3
			 //  "Opera/9.80 (Android; Opera Mini/7.6.40077/35.5706; U; en) Presto/2.8.119 Version/11.10"

			basicBrowser = true; // Extreme mode

		} else if( userAgent.contains( "Trident/7" ) && userAgent.contains( "rv:11" ) ) { // Microsoft Internet Explorer 11

			 // Microsoft Internet Explorer 11 on Microsoft Windows 8.1
			 //  "Mozilla/5.0 (Windows NT 6.3; WOW64; Trident/7.0; Touch; LCJB; rv:11.0) like Gecko"

			basicBrowser = true;

		} else if( userAgent.contains( "OPR" ) ) { // Opera

			// Opera on Microsoft Windows 8.1
			//   "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36 OPR/26.0.1656.24"
			// Opera on Android 4.3
			//   "Mozilla/5.0 (Linux; Android 4.3; GT-I9300 Build/JSS15J) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.102 Mobile Safari/537.36 OPR/25.0.1619.84037"

			var userAgentSubStr = userAgent.substring( userAgent.indexOf( "OPR" ) + 4 );
			var version = parseInt( userAgentSubStr.substring( 0, userAgentSubStr.indexOf( "." ) ) );
			// basicBrowser = version < 20;
			basicBrowser = false;

		} else if( userAgent.contains( "Edge" ) ) {

			// Microsoft Edge browser on Windows 10
			// Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.79 Safari/537.36 Edge/14.14393

			basicBrowser = false;

		} else if( userAgent.contains( "Chrome" ) && ! userAgent.contains( "(Chrome)" ) ) { // Google Chrome

			 // Google Chrome on Microsoft Windows 8.1
			 //   "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36"
			 // Google Chrome on Android 4.3
			 //   "Mozilla/5.0 (Linux; Android 4.3; GT-I9300 Build/JSS15J) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.59 Mobile Safari/537.36"

			var userAgentSubStr = userAgent.substring( userAgent.indexOf( "Chrome" ) + 7 );
			var version = parseInt( userAgentSubStr.substring( 0, userAgentSubStr.indexOf( "." ) ) );
			basicBrowser = version < 35;

		} else if( userAgent.contains( "Safari" ) ) { // Apple Safari

			 // Apple Safari on Microsoft Windows 8.1
			 //   Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/534.57.2 (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2

	//					if( userAgent.contains( "Version" ) ) {
	//						var userAgentSubStr = userAgent.substring( userAgent.indexOf( "Version" ) + 8 );
	//						var version = parseInt( userAgentSubStr.substring( 0, userAgentSubStr.indexOf( "." ) ) );
	//						basicBrowser = version < 8;
	//					} else {
	//						var userAgentSubStr = userAgent.substring( userAgent.indexOf( "Safari" ) + 7 );
	//						var version = parseInt( userAgentSubStr.substring( 0, userAgentSubStr.indexOf( "." ) ) );
	//						basicBrowser = version < 538 || version > 620;
	//					}

			basicBrowser = false;

		} else if( userAgent.contains( "Firefox" ) ) { // Mozilla Firefox

			 // Mozilla Firefox on Microsoft 8.1
			 //   "Mozilla/5.0 (Windows NT 6.3; WOW64; rv:33.0) Gecko/20100101 Firefox/33.0 AlexaToolbar/alxf-2.21"
			 // Mozilla Firefox on Android 4.3
			 //   "Mozilla/5.0 (Android; Mobile; rv:33.0) Gecko/33.0 Firefox/33.0"
			 // Mozilla Firefox on Linux
			 //   "Mozilla/5.0 (X11; Linux x86_64; rv:10.0) Gecko/20100101 Firefox/10.0 (Chrome)"

			var userAgentSubStr = userAgent.substring( userAgent.indexOf( "Firefox" ) + 8 );
			var version = parseInt( userAgentSubStr.substring( 0, userAgentSubStr.indexOf( "." ) ) );
			// basicBrowser = version < 28;
			basicBrowser = false;

		} else {
			basicBrowser = true;
			console.log( "UNKNOWN_USER_AGENT :: " + userAgent );
		}

		if( basicBrowser ) {
			return res.redirect( 307, ( req.secure ? 'https://' : 'http://' ) + web.mobileHostName + req.url );
		} else {
			next();
		}
	} else {
		next();
	}
});


// access_token
app.use( (req, res, next) => {

	if( req.path.isStaticFileRequest() ) {
		next();
	} else {
		var accessToken = req.cookies[ "access_token" ];
		var url = APPENGINE_ENDPOINT + "/ecs/accesstoken";
		if( accessToken ) url += "?accessToken=" + accessToken;
		requestModule( url, (error, response, body) => {
			if( error ) {
				console.log( 'ACCESS_TOKEN_ERROR :: ', error );
				res.status(500).send( UNEXPECTED_SERVER_EXCEPTION );
			} else {
				try { accessToken = JSON.parse( body )[ "accessToken" ]; } catch(e) {}
				if( ! accessToken ) {
					console.log( 'ACCESS_TOKEN_CALL_ERROR' );
					res.status(500).send( UNEXPECTED_SERVER_EXCEPTION );
				} else {
					var domain = process.env.STAGE === 'devo' ? '.ptlp.co' : '.pratilipi.com';
					if( _getWebsite( req.headers.host )[ "__name__" ] === "ALPHA" )
						domain = "localhost";
					res.locals[ "access-token" ] = accessToken;
					res.cookie( 'access_token', accessToken,
						{ domain: domain,
							path: '/',
							maxAge: 30 * 24 * 3600000, // 30 days
							httpOnly: false } );
					next();
				}
			}
		});

	}
});

// Serving mini website
app.get( '/*', (req, res, next) => {
	var web = _getWebsite( req.headers.host );
	if( req.headers.host === web.mobileHostName ) {
		_forwardToMini( req, res );
	} else {
		next();
	}
});

// Master website: www.pratilipi.com
app.get( '/*', (req, res, next) => {
	var web = _getWebsite( req.headers.host );
	if( web.__name__ === "ALL_LANGUAGE" || web.__name__ === "GAMMA_ALL_LANGUAGE" )
		_forwardToMini( req, res );
	else
		next();
});

// Other urls where PWA is not supported
app.get( '/*', (req, res, next) => {

	var forwardToMini = false;
	if( req.path === '/pratilipi-write'
		|| req.path === '/write'
		|| req.path.startsWith( '/admin/' )
		|| req.path === '/edit-event'
		|| req.path === '/edit-blog'
		|| req.url.contains( 'loadPWA=false' ) ) {
		forwardToMini = true;
	}

	// static files
	var referer = req.header( 'Referer' ) != null ? req.header( 'Referer' ) : "";
	if( req.path.isStaticFileRequest() &&
		( referer.contains( '/pratilipi-write' )
			|| referer.contains( '/write' )
			|| referer.contains( '/admin' )
			|| referer.contains( '/edit-event' )
			|| referer.contains( '/edit-blog' )
			|| referer.contains( 'loadPWA=false' ) ) ) {
		forwardToMini = true;
	}

	if( forwardToMini ) {
		_forwardToMini( req, res );
	} else {
		next();
	}
});

// TODO: NotificationFilter

// Serving PWA files
app.get( '/*', (req, res, next) => {

	var website = _getWebsite( req.headers.host );

	if( req.path === '/pwa-stylesheets/css/style.css' ) {
		fs.readFile( 'src/pwa-stylesheets/style.css', { 'encoding': 'utf8' }, (err, data) => {
			if(err) throw err;
			res.set( 'Content-Type', 'text/css' ).send(data);
		});
	} else if( req.path === '/pwa-sw-' + website.__name__ + '.js' ) {
		fs.readFile( 'src/pwa-service-worker' + req.path, { 'encoding': 'utf8' }, (err, data) => {
			if(err) throw err;
			res.set( 'Content-Type', 'text/javascript' ).send(data);
		});
	} else if( req.path === '/favicon.ico' || req.path === '/favicon.png' ) {
		res.sendfile( 'src/favicon.ico' );
	} else if( req.path.indexOf( '/pwa-images/' ) === 0 ) {
		res.sendfile( 'src' + req.path );
	} else if( req.path.indexOf( '/resources/' ) === 0 || req.path.indexOf( '/stylesheets/' ) === 0 ) {
		res.set( 'Content-Type', 'text/plain' ).send( "" );
	} else if( req.path === "/pwa-manifest-" + website.__name__ + ".json" ) {
		fs.readFile( 'src/pwa-manifest' + '/pwa-manifest-' + website.__name__ + '.json', { 'encoding': 'utf8' }, (err, data) => {
			if(err) throw err;
			res.set( 'Content-Type', 'application/json' ).send(data);
		});
	} else if( req.path === '/pratilipi-logo-144px.png' ) {
		res.sendfile( 'src' + req.path );
	} else {
		// https://github.com/expressjs/express/issues/3127
		console.log( "Serving html file to url :: ",  req.url );
		fs.readFile( 'src/pwa-markup/PWA-' + website.__name__ + '.html', { 'encoding': 'utf8' }, (err, data) => {
			if(err) throw err;
			res.set( 'Content-Type', 'text/html' ).send(data);
		});
	}
});

// Debugging
app.use( (err, req, res, next) => {
	console.error( "ERROR_STACK :: ", err.stack );
	res.status(500).json( UNEXPECTED_SERVER_EXCEPTION );
});

process.on( 'unhandledRejection', function( reason, p ) {
	console.info( "unhandledRejection ", p, " reason: ", reason );
});

process.on( 'uncaughtException', function( err ) {
	console.log( 'Error: ',  err );
});

app.listen( PORT );
