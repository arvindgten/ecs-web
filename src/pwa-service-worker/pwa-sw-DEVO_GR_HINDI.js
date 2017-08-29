(function() {

	'use strict';

	var localFilesToCache = [
		'.',
		'pwa-stylesheets/css/style.css?300820170215',
		'pwa-images/404.svg',
		'pwa-images/library-empty.svg',
		'pwa-images/NewSprite_2.png',
		'pwa-images/notifications-empty.svg',
		'pwa-images/sprite-av-black.png',
		'resources/css/style.css',
		'resources/css/style-basic.css',
		'resources/js/tinymce-writer/app.js',
		'resources/js/tinymce-writer/suggester.js',
		'resources/icons-writer.svg',
		'stylesheets/Authorization.png',
		'stylesheets/PageNotFound.png',
		'stylesheets/Server.png'
	];

	var externalFilesToCache = [
		'https://www.ptlp.co/resource-all/pwa/js/jkkrrsh.js',
		'https://www.ptlp.co/resource-all/pwa/css/bmmg.css',
		'https://www.ptlp.co/resource-all/pwa/js/bmg.js',
		'https://www.ptlp.co/resource-all/font/font-hi.css'
	];

	var STATIC_VERSION = "300820170215";
	var DYNAMIC_VERSION = "7";
	var staticCacheName = 'pratilipi-cache-static-' + STATIC_VERSION;
	var dynamicCacheName = 'pratilipi-cache-dynamic-' + DYNAMIC_VERSION;

	var hostName = "https://gr-hindi.ptlp.co";
	var apiPrefix = "https://gr-hindi.ptlp.co";

	/* Cache Keys */
	var PWA_INDEX_HTML = "app-shell-300820170215.html";
	var INIT_BANNER_LIST = "init-banner-list.json";
	var TRENDING_SEARCH_KEYWORDS = "trending-search-keywords.json";


	self.addEventListener( 'install', function(event) {
		console.log( "sw-install: " + staticCacheName );
		event.waitUntil(
			caches.open( staticCacheName )
			.then( function(cache) {
				return cache.addAll( localFilesToCache );
			}).then( function() { // index.html
				fetch( "/" ).then( function(response) {
					if( response.ok ) {
						caches.open( staticCacheName ).then( function(cache) {
							cache.put( PWA_INDEX_HTML, response );
						});
					}
				});
//			}).then( function() { // CDN
//				for( var i = 0; i < externalFilesToCache.length; i++ ) {
//					fetch( externalFilesToCache[i] ).then( function(response) {
//						if( response.ok ) {
//							caches.open( staticCacheName ).then( function(cache) {
//								cache.put( response.clone().url, response );
//							});
//						}
//					});
//				}
			}).then( function() {
				self.skipWaiting();
			})
		);
	});

	self.addEventListener( 'activate', function(event) {
		console.log( "sw-activate: " + dynamicCacheName );
		var cacheWhitelist = [staticCacheName, dynamicCacheName];
		event.waitUntil(
			caches.keys().then( function(cacheNames) {
				return Promise.all(
					cacheNames.map( function(cacheName) {
						if( cacheWhitelist.indexOf(cacheName) === -1 ) {
							return caches.delete( cacheName );
						}
					})
				);
			})
		);
	});

	self.addEventListener( 'fetch', function(event) {
		var url = event.request.url;
		// App Shell
		if( url.indexOf( hostName ) > -1
			&& url.indexOf( hostName + "/api?" ) === -1 // Batch Api Calls
			&& url.indexOf( hostName + "/api/" ) === -1 // Individual Api Calls
			&& url.indexOf( hostName + "/api.pratilipi/" ) === -1 // Legacy writer panel api calls
			&& url.indexOf( hostName + "/filebrowser/" ) === -1 // Legacy writer panel api calls
			&& url.indexOf( hostName + "/polymer/" ) === -1 // Legacy writer panel api calls
			&& url.indexOf( hostName + "/theme.pratilipi/" ) === -1 // Legacy writer panel api calls
			&& url.indexOf( hostName + "/pwa-sw-DEVO_GR_HINDI.js" ) === -1
			&& url.indexOf( hostName + "/pratilipi-write?" ) === -1
			&& url.indexOf( hostName + "/write?" ) === -1
			&& url.indexOf( hostName + "/theme.pratilipi/" ) === -1 // Old writer panel resources
			&& url !== ( hostName + "/admin" )
			&& url.indexOf( hostName + "/admin/" ) === -1
			&& url.indexOf( hostName + "/elements.hi" ) === -1
			&& url.indexOf( hostName + "/edit-event" ) === -1
			&& url.indexOf( hostName + "/edit-blog" ) === -1
			&& url !== ( hostName + "/sitemap" )
			&& url.indexOf( hostName + "/sitemap?" ) === -1
			&& url !== ( hostName + "/robots.txt" )
			&& url.indexOf( hostName + "/robots.txt?" ) === -1
			&& url.indexOf( hostName + "/pwa-manifest-DEVO_GR_HINDI.json" ) === -1

			/* TODO: check for static files */
			&& url.indexOf( hostName + "/pwa-stylesheets/" ) === -1
			&& url.indexOf( hostName + "/pwa-images/" ) === -1
			&& url.indexOf( hostName + "/resources/" ) === -1
			&& url.indexOf( hostName + "/stylesheets/" ) === -1
			&& url.indexOf( "loadPWA=false" ) === -1
			&& false ) {
				event.respondWith(
					caches.match( PWA_INDEX_HTML ).then( function(response) {
						if( response ) return response;
						return fetch( event.request ).then( function(response) {
							if( !response.ok ) {
								console.error( "Network request failed to fetch AppShell." );
								return "Failed to load Application! Please re-load the page!";
							}
							return caches.open( staticCacheName ).then( function(cache) {
								cache.put( PWA_INDEX_HTML, response.clone() );
								return response;
							});
						});
					})
				);
		}

		// External Resource Files
		if( externalFilesToCache[ url ] ) {
			event.respondWith(
				caches.match( url ).then( function(response) {
					if( response ) return response;
					return fetch( event.request ).then( function(response) {
						if( !response.ok ) {
							return null;
						}
						return caches.open( staticCacheName ).then( function(cache) {
							cache.put( url, response.clone() );
							return response;
						});
					});
				})
			);
		}

		// Banner List Api
		if( url.indexOf( apiPrefix + "/api/init/banner/list" ) !== -1 ) {
			cacheAndRevalidate( dynamicCacheName, INIT_BANNER_LIST, event );
		}

		// Trending Search KeywordList
		if( url.indexOf( "/api/search/trending_search" ) !== -1 ) {
			cacheAndRevalidate( dynamicCacheName, TRENDING_SEARCH_KEYWORDS, event );
		}

	});

	function cacheAndRevalidate( cacheName, cacheKey, event ) {
		event.respondWith(
			caches.open( cacheName ).then( function( cache ) {
				return cache.match( cacheKey ).then( function( response ) {
					var fetchPromise = fetch( event.request, { credentials: 'include' } ).then( function( networkResponse ) {
						cache.put( cacheKey, networkResponse.clone() );
						return networkResponse;
					});
					return response || fetchPromise;
				})
			})
		);
	}

})();
