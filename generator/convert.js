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

		parameters.charts = {};

		function generateChart(data) {
			var svg = [];
			var height = 500;
			var min = data[0];
			var max = data[data.length-1];
			var positiveHeight = max*height/(max - min)
			var width = 99/98; 

			var path = [];
			data.forEach(function (value, index) {
				var h = positiveHeight*value/max;
				var x = 99*index/98+'%';
				var y = value < 0 ? positiveHeight : positiveHeight-h; 
				var w = width+'%';
				var c = value < 0 ? '#faa' : '#aaa';
				svg.push('<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+Math.abs(h)+'" style="fill:'+c+';stroke:'+c+';stroke-width:0.1" />');
				path.push(x+','+y);
			});

			svg.push('<polyline points="'+path.join(' ')+'" style="stroke:#000; stroke-width:3px"/>')

			svg = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100%" height="'+height+'">'
				+ svg.join('\n')
				+ '</svg>';

			return svg;
		}

		parameters.charts.wealth_distribution = generateChart(parameters.values.wealth_distribution, 400);

		var html = mustache.render(template, parameters, partials);

		fs.writeFileSync('../webapp/'+filename, html, 'utf8');	
	}
}
