'use strict';

const express = require('express');

var fs = require('fs');

// Constants
const PORT = 8080;

// App
const app = express();
app.get( '/*', function( req, res ) {
	// var content = fs.readFileSync( 'test.html', 'utf8' );
	console.log( "yolo" );
	res.send( "No sir!" );
});

app.listen( PORT );
