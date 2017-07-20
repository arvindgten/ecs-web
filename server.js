'use strict';

const express = require( 'express' );
const cookieParser = require( 'cookie-parser' );

var requestModule = require( 'request' );
var fs = require('fs');

// Constants
const PORT = 80;


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
	ALL_LANGUAGE:	{ hostName: "www.pratilipi.com",        mobileHostName: "m.pratilipi.com", displayLanguage: Language.ENGLISH,	    filterLanguage: null,               isTestEnvironment: false },
	HINDI:			{ hostName: "hindi.pratilipi.com",      mobileHostName: "hi.pratilipi.com", displayLanguage: Language.HINDI,		filterLanguage: Language.HINDI,     isTestEnvironment: false },
	GUJARATI:		{ hostName: "gujarati.pratilipi.com",   mobileHostName: "gu.pratilipi.com", displayLanguage: Language.GUJARATI,  filterLanguage: Language.GUJARATI,  isTestEnvironment: false },
	TAMIL:			{ hostName: "tamil.pratilipi.com",      mobileHostName: "ta.pratilipi.com", displayLanguage: Language.TAMIL,		filterLanguage: Language.TAMIL,     isTestEnvironment: false },
	MARATHI:		{ hostName: "marathi.pratilipi.com",    mobileHostName: "mr.pratilipi.com", displayLanguage: Language.MARATHI,	filterLanguage: Language.MARATHI,   isTestEnvironment: false },
	MALAYALAM:		{ hostName: "malayalam.pratilipi.com",  mobileHostName: "ml.pratilipi.com", displayLanguage: Language.MALAYALAM,	filterLanguage: Language.MALAYALAM, isTestEnvironment: false },
	BENGALI:		{ hostName: "bengali.pratilipi.com",    mobileHostName: "bn.pratilipi.com", displayLanguage: Language.BENGALI,	filterLanguage: Language.BENGALI,   isTestEnvironment: false },
	KANNADA:		{ hostName: "kannada.pratilipi.com",    mobileHostName: "kn.pratilipi.com", displayLanguage: Language.KANNADA,	filterLanguage: Language.KANNADA,   isTestEnvironment: false },
	TELUGU:			{ hostName: "telugu.pratilipi.com",     mobileHostName: "te.pratilipi.com", displayLanguage: Language.TELUGU,		filterLanguage: Language.TELUGU,    isTestEnvironment: false },

	GAMMA_ALL_LANGUAGE:	{ hostName: "gamma.pratilipi.com",          mobileHostName: "m-gamma.pratilipi.com", displayLanguage: Language.ENGLISH,		filterLanguage: null,               isTestEnvironment: true },
	GAMMA_HINDI:			{ hostName: "hindi-gamma.pratilipi.com",        mobileHostName: "hi-gamma.pratilipi.com", displayLanguage: Language.HINDI,		filterLanguage: Language.HINDI,     isTestEnvironment: true },
	GAMMA_GUJARATI:		    { hostName: "gujarati-gamma.pratilipi.com",     mobileHostName: "gu-gamma.pratilipi.com", displayLanguage: Language.GUJARATI,	filterLanguage: Language.GUJARATI,  isTestEnvironment: true },
	GAMMA_TAMIL:			{ hostName: "tamil-gamma.pratilipi.com",        mobileHostName: "ta-gamma.pratilipi.com", displayLanguage: Language.TAMIL,		filterLanguage: Language.TAMIL,     isTestEnvironment:  true },
	GAMMA_MARATHI:		    { hostName: "marathi-gamma.pratilipi.com",      mobileHostName: "mr-gamma.pratilipi.com", displayLanguage: Language.MARATHI,	filterLanguage: Language.MARATHI,   isTestEnvironment:  true },
	GAMMA_MALAYALAM:		{ hostName: "malayalam-gamma.pratilipi.com",    mobileHostName: "ml-gamma.pratilipi.com", displayLanguage: Language.MALAYALAM,	filterLanguage: Language.MALAYALAM, isTestEnvironment: true },
	GAMMA_BENGALI:		    { hostName: "bengali-gamma.pratilipi.com",      mobileHostName: "bn-gamma.pratilipi.com", displayLanguage: Language.BENGALI,	filterLanguage: Language.BENGALI,   isTestEnvironment: true },
	GAMMA_KANNADA:		    { hostName: "kannada-gamma.pratilipi.com",      mobileHostName: "kn-gamma.pratilipi.com", displayLanguage: Language.KANNADA,	filterLanguage: Language.KANNADA,   isTestEnvironment: true },
	GAMMA_TELUGU:		    { hostName: "telugu-gamma.pratilipi.com",       mobileHostName: "te-gamma.pratilipi.com", displayLanguage: Language.TELUGU,		filterLanguage: Language.TELUGU,    isTestEnvironment:  true },

	DEVO_ALL_LANGUAGE:	{ hostName: "devo.pratilipi.com",       mobileHostName: "m-devo.pratilipi.com",  displayLanguage: Language.ENGLISH,	    filterLanguage: null,               isTestEnvironment:   true },
	DEVO_HINDI:			{ hostName: "hindi-devo.pratilipi.com",     mobileHostName: "hi-devo.pratilipi.com", displayLanguage: Language.HINDI,		filterLanguage: Language.HINDI,     isTestEnvironment:   true },
	DEVO_GUJARATI:		{ hostName: "gujarati-devo.pratilipi.com",  mobileHostName: "gu-devo.pratilipi.com", displayLanguage: Language.GUJARATI,	filterLanguage: Language.GUJARATI,  isTestEnvironment:  true },
	DEVO_TAMIL:			{ hostName: "tamil-devo.pratilipi.com",     mobileHostName: "ta-devo.pratilipi.com", displayLanguage: Language.TAMIL,		filterLanguage: Language.TAMIL,     isTestEnvironment:   true },
	DEVO_MARATHI:		{ hostName: "marathi-devo.pratilipi.com",   mobileHostName: "mr-devo.pratilipi.com", displayLanguage: Language.MARATHI,	    filterLanguage: Language.MARATHI,   isTestEnvironment: true },
	DEVO_MALAYALAM:		{ hostName: "malayalam-devo.pratilipi.com", mobileHostName: "ml-devo.pratilipi.com", displayLanguage: Language.MALAYALAM,	filterLanguage: Language.MALAYALAM, isTestEnvironment: true },
	DEVO_BENGALI:		{ hostName: "bengali-devo.pratilipi.com",   mobileHostName: "bn-devo.pratilipi.com", displayLanguage: Language.BENGALI,	    filterLanguage: Language.BENGALI,   isTestEnvironment:  true },

	ALPHA:	{ hostName: "localhost:8080", mobileHostName: "localhost:8080", displayLanguage: Language.HINDI, displayLanguage: Language.HINDI, isTestEnvironment: true }
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

const APPENGINE_ENDPOINT =
		( process.env.STAGE === 'gamma' || process.env.STAGE === 'prod' ) ?
		"https://api.pratilipi.com" : "https://devo-pratilipi.appspot.com";
const UNEXPECTED_SERVER_EXCEPTION = { "message": "Some exception occurred at server. Please try again." };

// App
const app = express();

// Health
app.get( '/health', (req, res, next) => {
	res.send( Date.now() + "" );
});

// Redirect to www.pratilipi.com
app.use( (req, res, next) => {
	console.log( req.headers.host );
	if( _getWebsite( req.headers.host ) == null )
		res.redirect( 301, 'https://www.pratilipi.com/?redirect=ecs' );
	else
		next();
});

// cookie parser
app.use( cookieParser() );

// access_token
app.use( (req, res, next) => {
	var blackListFormats = [ '.html', '.css', '.js', '.png', '.jpg', '.svg', '.ico' ];
	var isStaticRequest = false;
	blackListFormats.forEach( function( format ) {
		if( req.path.endsWith( format ) ) {
			isStaticRequest = true;
			return;
		}
	});
	if( isStaticRequest ) {
		next();
	} else {
		var accessToken = req.cookies[ "access_token" ];
		if( accessToken === undefined ) {
			requestModule( APPENGINE_ENDPOINT + "/user/accesstoken", (error, response, body) => {
				if( error ) {
					console.log( 'GET_ACCESSTOKEN_ERROR:: ', error );
					res.status(500).send( UNEXPECTED_SERVER_EXCEPTION );
				} else {
					accessToken = JSON.parse( body )[ "accessToken" ];
					res.cookie( 'access_token', accessToken, { maxAge: 30 * 86400, httpOnly: false } );
					next();
				}
			});
		} else {
			next();
		}
	}
});

app.get( '/*', (req, res, next) => {

	var content = null;
	var website = _getWebsite( req.headers.host );

	if( req.path === '/pwa-stylesheets/css/style.css' ) {
		content = fs.readFileSync( 'src/pwa-stylesheets/style.css', 'utf8' );
		res.set( 'Content-Type', 'text/css' );
	} else if( req.path === '/pwa-sw-' + website.__name__ + '.js' ) {
		content = fs.readFileSync( 'src/pwa-service-worker' + req.path );
		res.set( 'Content-Type', 'text/javascript' );
	} else if( req.path === '/favicon.ico' ) {
		next();
	} else if( req.path.indexOf( '/pwa-images/' ) === 0 ) {
		content = fs.readFileSync( 'src' + req.path );
	} else if( req.path.indexOf( '/resources/' ) === 0 || req.path.indexOf( '/stylesheets/' ) === 0 ) {
		content = "";
		res.set( 'Content-Type', 'text/plain' );
	} else if( req.path === "/pwa-manifest-" + website.__name__ + ".json" ) {
		content = fs.readFileSync( 'src/pwa-manifest' + "/pwa-manifest-" + website.__name__ + ".json", 'utf8' );
		res.set( 'Content-Type', 'application/json' );
	} else {
		console.log( "Serving html file to url : ",  req.url );
		content = fs.readFileSync( 'src/pwa-markup/PWA-' + website.__name__ + '.html', 'utf8' );
		res.set( 'Content-Type', 'text/html' );
	}
	res.send( content );
});

app.listen( PORT );
