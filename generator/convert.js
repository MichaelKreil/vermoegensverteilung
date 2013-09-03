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
			var html = [];
			var height = 500;
			var min = data[0];
			var max = data[data.length-1];
			var positiveHeight = max*height/(max - min)
			var width = 99/98; 

			html.push('<div style="left:0; top:0px; width:100%; height:'+positiveHeight+'px; background:rgba(0,0,0,0.1)"></div>');
			html.push('<div style="left:0; top:'+positiveHeight+'px; width:100%; height:'+(height-positiveHeight)+'px; background:rgba(255,0,0,0.1)"></div>');

			data.forEach(function (value, index) {
				var h = positiveHeight*value/max;
				var x = 99*index/98+'%';
				var y = value < 0 ? positiveHeight : positiveHeight-h; 
				var w = width+'%';
				var c = value < 0 ? '#f00' : '#000';
				html.push('<div style="left:'+x+'; top:0; width:'+w+'; height:'+height+'px;" class="selector" id="svg_bar_'+index+'">');
				html.push('<div style="left:0; top:'+y+'px; width:100%; height:'+Math.abs(h)+'px; background:'+c+'" class="bar"></div>');
				html.push('</div>');
			});

			html = '<div style="width:100%; height:'+height+'px" class="chart">'
				+ html.join('\n')
				+ '</div>';

			return html;
		}

		parameters.charts.wealth_distribution = generateChart(parameters.values.wealth_distribution, 400);

		var html = mustache.render(template, parameters, partials);

		fs.writeFileSync('../webapp/'+filename, html, 'utf8');	
	}
}
