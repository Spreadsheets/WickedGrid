tf.test('Value Behaviour: Angle Brackets', function() {
	var table = $(tableify('="<b>test</b>"')),
		div = $('<div>')
			.append(table)
			.sheet(),
		jS = div.getSheet(),
		td;

	td = div.find('table.jS td');

	tf.assertEquals(td[0].innerHTML, '&lt;b&gt;test&lt;/b&gt;', 'greater than, less than');
	div.getSheet().kill();
});

tf.test('Value Behaviour: Line Breaks', function() {
	var div = $('<div>')
			.append('<table><tr><td data-formula="\'test\n\
\n\
\n\
test\'"></td></tr></table>')
			.sheet(),
		jS = div.getSheet(),
		td;

	td = div.find('table.jS td');

	tf.assertEquals(td.find('br').length, 3, 'expected number of br elements');
	div.getSheet().kill();
});


tf.test('Value Behaviour: Parenthesis', function() {
	var div = $('<div>')
			.append(tableify('=IF((((100 + 100) + 100) + 100) > 100, TRUE, FALSE)\t\n\
100\t'))
			.sheet(),
		jS = div.getSheet(),
		td,
		cellValue;

	td = div.find('table.jS td');
	td[0].jSCell.updateValue(function(_cellValue) {
		cellValue = _cellValue;
	});
	tf.assertEquals(cellValue.valueOf(), true);
	div.getSheet().kill();
});


tf.test('Value Behaviour: html non-transference', function() {
	var div = $('<div>')
			.append('<table><tr><td data-formula="dropdown(1,2,3,4,5,6,7,8)">8</td><td data-formula="A1"></tr></table>')
			.sheet(),
		jS = div.getSheet(),
		td;

	td = div.find('table.jS td');

	tf.assertEquals(td.eq(1)[0].innerHTML, '8', 'html stayed where it was supposed to');
	div.getSheet().kill();
});