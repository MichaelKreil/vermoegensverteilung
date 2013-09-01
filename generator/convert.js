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

	generate('de',    'index_de.html');
	generate('de,at', 'index_at.html');

	function generate(language, filename) {
		console.log('generating: '+filename);

		var parameters = config.main;
		parameters.values = {};
		parameters.phrases = {};

		language.split(',').forEach(function (code) {
			Object.keys(config.phrases).forEach(function (key) {
				if (config.phrases[key][code]) parameters.phrases[key] = config.phrases[key][code];
			});
			Object.keys(config.values).forEach(function (key) {
				if (config.values[key][code]) parameters.values[key] = config.values[key][code];
			});
		});

		Object.keys(parameters.values).forEach(function (key) {
			if (typeof parameters.values[key] == 'string') {
				parameters.values[key+'_'+parameters.values[key]] = true;
			}
		});

		var html = mustache.render(template, parameters, partials);

		fs.writeFileSync('../webapp/'+filename, html, 'utf8');	
	}
}
