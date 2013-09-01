var watch = false;

var arguments = process.argv.slice(2);
arguments.forEach(function (argument) {
	switch (argument) {
		case 'watch': watch = true; break;
		default:
			console.warn('Unknown Argument "'+argument+'"');
	}
})

var fs = require('fs');
var mustache = require('mustache');


generateAll();

if (watch) {
	fs.watch('./templates', function (event, filename) {
		generateAll();
	});
	fs.watch('./config.json', function (event, filename) {
		generateAll();
	});
}

function generateAll() {
	var config = JSON.parse(fs.readFileSync('./config.json'));
	var template = fs.readFileSync('./templates/index.mustache', 'utf8');
	var partials = {};

	config.partials.forEach(function (partial) {
		partials[partial] = fs.readFileSync('./templates/'+partial+'.mustache', 'utf8');
	});

	generate('de', 'index.html');

	function generate(language, filename) {
		console.log('generating: '+filename);

		var parameters = config.main;

		Object.keys(config.phrases).forEach(function (key) {
			parameters[key] = config.phrases[key][language];
		});

		var html = mustache.render(template, parameters, partials);

		fs.writeFileSync('../webapp/'+filename, html, 'utf8');	
	}
}
