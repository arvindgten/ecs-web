'use strict';

const express = require('express');

var fs = require('fs');

// Constants
const PORT = 8080;

// App
const app = express();
app.get( '/*', function( req, res ) {
	var content = null;
	if( req.path == '/pwa-sw-GAMMA_HINDI.js' ) {
		content = fs.readFileSync( 'src/pwa-service-worker/pwa-sw-GAMMA_HINDI.js' );
		res.set( 'Content-Type', 'text/javascript' );
	} else if( req.path == '/pwa-stylesheets/css/style.css' ) {
		content = fs.readFileSync( 'src/pwa-stylesheets/style.css' );
		res.set( 'Content-Type', 'text/css' );
	} else if( req.path == '/health' ) {
		content = Date.now() + "";
		res.set( 'Content-Type', 'text/plain' );
	} else {
		content = fs.readFileSync( 'src/pwa-markup/PWA-GAMMA_HINDI.html', 'utf8' );
		res.set( 'Content-Type', 'text/html' );
	}
	res.send( content );
});

app.listen( PORT );
