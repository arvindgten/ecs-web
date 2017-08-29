/* HttpUtil */
var XMLHttpRequest = require( "xmlhttprequest" ).XMLHttpRequest;

var HttpUtil = function() {

	function processResponseText( repsonseText ) {
		try {
			return JSON.parse( repsonseText );
		} catch( err ) {
			return responseText;
		}
	};

	this.formatParams = function( params ) {
		if( params == null ) return "";
		if( typeof( params ) === "string" ) return params;
		return Object.keys( params ).map( function(key) { return key + "=" + params[key] }).join("&");
	};

	this.get = function( aUrl, headers, params, aCallback ) {
		var anHttpRequest = new XMLHttpRequest();
		anHttpRequest.onreadystatechange = function() {
			if( anHttpRequest.readyState == 4 && aCallback != null )
				aCallback( processResponseText( anHttpRequest.responseText ), anHttpRequest.status, aUrl );
		};
		anHttpRequest.open( "GET", aUrl + ( aUrl.indexOf( "?" ) > -1 ? "&" : "?" ) + this.formatParams( params ), true );
		anHttpRequest.setRequestHeader( "Content-type", "application/x-www-form-urlencoded" );
		if( headers != null ) {
			for( var key in headers )
				if( headers.hasOwnProperty(key) )
					anHttpRequest.setRequestHeader( key, headers[key] );
		}
		anHttpRequest.send( null );
	};

	this.post = function( aUrl, headers, params, aCallback ) {
		var anHttpRequest = new XMLHttpRequest();
		anHttpRequest.onreadystatechange = function() {
			if( anHttpRequest.readyState == 4 && aCallback != null )
				aCallback( processResponseText( anHttpRequest.responseText ), anHttpRequest.status, aUrl );
		};
		anHttpRequest.open( "POST", aUrl, true );
		anHttpRequest.setRequestHeader( "Content-type", "application/x-www-form-urlencoded" );
		if( headers != null ) {
			for( var key in headers )
				if( headers.hasOwnProperty(key) )
					anHttpRequest.setRequestHeader( key, headers[key] );
		}
		anHttpRequest.send( this.formatParams( params ) );
	};

};

module.exports = HttpUtil;
