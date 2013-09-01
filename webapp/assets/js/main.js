$(function () {
	$('#selfassessment').slider({
		min: 0,
		max: 10,
		step: 1,
		value: 5,
		orientation: 'horizontal',
		handle: 'triangle',
		tooltip: 'show',
		selection: 'none',
		formater: function (value) {
			return value;
		}
	});
})