tf.test('Cell Types: None', function() {
	var div = $('<div>')
			.append('<table><tr><td>100</td></tr></table>')
			.sheet(),
		jS = div.getSheet(),
		td;

	td = div.find('table.jS td');

	tf.assertEquals(td.html(), '100');
	div.getSheet().kill();
});


tf.test('Cell Types: Currency & rounding', function() {
	var div = $('<div>')
			.append('<table><tr><td data-celltype="currency">100.123</td></tr></table>')
			.sheet(),
		jS = div.getSheet(),
		td;

	td = div.find('table.jS td');

	tf.assertEquals(td.html(), '$100.12');
	tf.assertEquals(td[0].jSCell.value, 100.123);
	div.getSheet().kill();
});


tf.test('Cell Types: Currency', function() {
	var div = $('<div>')
			.append('<table><tr><td data-celltype="currency">100</td></tr></table>')
			.sheet(),
		jS = div.getSheet(),
		td;

	td = div.find('table.jS td');

	tf.assertEquals(td.html(), '$100.00');
	tf.assertEquals(td[0].jSCell.value, 100);
	div.getSheet().kill();
});


tf.test('Cell Types: Date', function() {
	var div = $('<div>')
			.append('<table><tr><td data-celltype="date">1/1/2020</td></tr></table>')
			.sheet(),
		jS = div.getSheet(),
		td = div.find('table.jS td'),
		cell = td[0].jSCell,
		val;

	cell.updateValue(function(_val) {
		val = _val;
	});

	tf.assertEquals(val.toString(), Globalize.parseDate('1/1/2020').toString(), 'valueOverride is correct');
	tf.assertEquals(cell.value, '1/1/2020', 'value is correct');
	div.getSheet().kill();
});


tf.test('Cell Types: Number', function() {
	var div = $('<div>')
			.append('<table><tr><td data-celltype="number">100</td></tr></table>')
			.sheet(),
		jS = div.getSheet(),
		td;

	td = div.find('table.jS td');

	tf.assertSame(td[0].jSCell.value.valueOf(), 100);
	div.getSheet().kill();
});


tf.test('Cell Types: Percent', function() {
	var div = $('<div>')
			.append('<table><tr><td data-celltype="percent">.1</td></tr></table>')
			.sheet(),
		jS = div.getSheet(),
		td;

	td = div.find('table.jS td');

	tf.assertEquals(td.html(), '10.00 %', 'html is properly displayed');
	tf.assertEquals(td[0].jSCell.value.valueOf(), 0.1, 'value remains a number');
	div.getSheet().kill();
});

tf.test('Cell Types: Percent Addition', function() {
	var div = $('<div>')
			.append('<table><tr><td data-formula="Sheet1!B1 + 1"></td><td data-celltype="percent">.1</td></tr></table>')
			.sheet(),
		jS = div.getSheet(),
		td,
		cell = jS.getCell(0,1,1);

	cell.updateValue();

	tf.assertEquals(cell.td.innerHTML, '1.1', 'html is properly displayed');
	tf.assertEquals(cell.value.valueOf(), 1.1, 'value remains a number');
	div.getSheet().kill();
});