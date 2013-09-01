$(function () {
	$('#selfassessment').slider({
		min: 0,
		max: 100,
		step: 1,
		value: 50,
		orientation: 'horizontal',
		handle: 'triangle',
		tooltip: 'show',
		selection: 'none',
		formater: function (value) {
			if (value == 50) return 'Genau im Mittelfeld';
			if (value < 50) return '... zu den ärmsten '+(value+1)+'%';
			return '... zu den reichsten '+(101-value)+'%';
		}
	});
})