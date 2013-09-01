#!/usr/bin/env node

/* modules */
var fs = require('fs');
var mustache = require('mustache');
var config = require('./config.js');

var template = fs.readFileSync('./templates/index.mustache', 'utf8');
var partials = {};

config.partials.forEach(function (partial) {
	partials[partial] = fs.readFileSync('./templates/'+partial+'.mustache', 'utf8');
});

generate('de', 'index.html');

function generate(language, filename) {
	var parameters = config.main;

	Object.keys(config.phrases).forEach(function (key) {
		parameters[key] = config.phrases[key][language];
	});

	var html = mustache.render(template, parameters, partials);

	fs.writeFileSync('../webapp/'+filename, html, 'utf8');	
}
