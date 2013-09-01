#!/usr/bin/env node

/* modules */
var fs = require('fs');
var mustache = require('mustache');
var config = require('./config.js');

var template = fs.readFileSync('templates/index.mustache', 'utf8');

generate('de', 'index.html');

function generate(language, filename) {
	var parameters = config.main;
	Object.keys(config.phrases).forEach(function (key) {
		parameters[key] = config.phrases[key][language];
	});

	var html = mustache.render(template, parameters);

	fs.writeFileSync('../webapp/'+filename, html, 'utf8');	
}
