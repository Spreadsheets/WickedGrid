tf.test('Behaviour Testing: Adding Rows @ End', function(tf) {
	var div = $('<div>')
			.append(tableify('original'))
			.sheet(),
		jS = div.getSheet(),
		td,
		headers;

	jS.controlFactory.addRow();

	td = div.find('table.jS td:contains("original")');

	headers = div.find('table.jS tr:not(:first) th');

	tf.assertEquals(td[0].parentNode.rowIndex, 1, 'original @ expected location');
	tf.assertEquals(td[0].parentNode.nextSibling.rowIndex, 2, 'added @ expected location');
	tf.assertEquals(div.find('table.jS td').length, 1 * 2, 'cell count is correct');
	tf.assertEquals(headers.text(), '12', 'headers are correct');
	div.getSheet().kill();
});

tf.test('Behaviour Testing: Adding Rows @ Before 1', function(tf) {
	var div = $('<div>')
			.append(tableify('original'))
			.sheet(),
		jS = div.getSheet(),
		td,
		headers;

	jS.controlFactory.addRow(1, true);

	td = div.find('table.jS td:contains("original")');

	headers = div.find('table.jS tr:not(:first) th');

	tf.assertEquals(td[0].parentNode.rowIndex, 2, 'original @ expected location');
	tf.assertEquals(td[0].parentNode.nextSibling, null, 'added @ expected location');
	tf.assertEquals(div.find('table.jS td').length, 1 * 2, 'cell count is correct');
	tf.assertEquals(headers.text(), '12', 'headers are correct');
	div.getSheet().kill();

});

tf.test('Behaviour Testing: Adding Rows @ After 1', function(tf) {
	var div = $('<div>')
			.append(tableify('original'))
			.sheet(),
		jS = div.getSheet(),
		td,
		headers;

	jS.controlFactory.addRow(1);

	td = div.find('table.jS td:contains("original")');

	headers = div.find('table.jS tr:not(:first) th');

	tf.assertEquals(td[0].parentNode.rowIndex, 1, 'original @ expected location');
	tf.assertNotEquals(td[0].parentNode.nextSibling, null, 'added @ expected location');
	tf.assertEquals(div.find('table.jS td').length, 1 * 2, 'cell count is correct');
	tf.assertEquals(headers.text(), '12', 'headers are correct');
	div.getSheet().kill();

});

tf.test('Behaviour Testing: Adding Rows @ Before 3', function(tf) {
	var div = $('<div>')
			.append(tableify('original1\n\
original2'
			))
			.sheet(),
		jS = div.getSheet(),
		td,
		headers;

	jS.controlFactory.addRow(2, true);

	td = div.find('table.jS td:contains("original1")');

	headers = div.find('table.jS tr:not(:first) th');

	tf.assertEquals(td[0].parentNode.rowIndex, 1, 'original @ expected location');
	tf.assertEquals(td.parent().next().children().filter('td').html(), '', 'added @ expected location');
	tf.assertEquals(div.find('table.jS td').length, 1 * 3, 'cell count is correct');
	tf.assertEquals(headers.text(), '123', 'headers are correct');
	div.getSheet().kill();
});

tf.test('Behaviour Testing: Adding Columns @ End', function(tf) {
	var div = $('<div>')
			.append(tableify('original'))
			.sheet(),
		jS = div.getSheet(),
		td,
		headers;

	jS.controlFactory.addColumn();

	td = div.find('table.jS td:contains("original")');

	headers = div.find('table.jS tr:first th');

	tf.assertEquals(td[0].cellIndex, 1, 'original @ expected location');
	tf.assertEquals(td[0].nextSibling.cellIndex, 2, 'added @ expected location');
	tf.assertEquals(div.find('table.jS td').length, 1 * 2, 'cell count is correct');
	tf.assertEquals(headers.text(), 'AB', 'headers are correct');
	div.getSheet().kill();

});

tf.test('Behaviour Testing: Adding Columns @ Before 1', function(tf) {
	var div = $('<div>')
			.append(tableify('original'))
			.sheet(),
		jS = div.getSheet(),
		td,
		headers;

	jS.controlFactory.addColumn(1, true);

	td = div.find('table.jS td:contains("original")');

	headers = div.find('table.jS tr:first th');

	tf.assertEquals(td[0].cellIndex, 2, 'original @ expected location');
	tf.assertEquals(td[0].nextSibling, null, 'added @ expected location');
	tf.assertEquals(div.find('table.jS td').length, 1 * 2, 'cell count is correct');
	tf.assertEquals(headers.text(), 'AB', 'headers are correct');
	div.getSheet().kill();

});

tf.test('Behaviour Testing: Adding Columns @ After 1', function(tf) {
	var div = $('<div>')
			.append(tableify('original'))
			.sheet(),
		jS = div.getSheet(),
		td,
		headers;

	jS.controlFactory.addColumn(1);

	td = div.find('table.jS td:contains("original")');

	headers = div.find('th.jSBarTop');

	tf.assertEquals(td[0].cellIndex, 1, 'original @ expected location');
	tf.assertNotEquals(td[0].nextSibling, null, 'added @ expected location');
	tf.assertEquals(div.find('table.jS td').length, 1 * 2, 'cell count is correct');
	tf.assertEquals(headers.text(), 'AB', 'headers are correct');
	div.getSheet().kill();

});

tf.test('Behaviour Testing: Adding Columns @ Before 2', function(tf) {
	var div = $('<div>')
			.append(tableify('original1\toriginal2'
			))
			.sheet(),
		jS = div.getSheet(),
		td,
		headers;

	jS.controlFactory.addColumn(2, true);

	td = div.find('table.jS td:contains("original1")');

	headers = div.find('table.jS tr:first th');

	tf.assertEquals(td[0].cellIndex, 1, 'original @ expected location');
	tf.assertEquals(td.next().html(), '', 'added @ expected location');
	tf.assertEquals(div.find('table.jS td').length, 1 * 3, 'cell count is correct');
	tf.assertEquals(headers.text(), 'ABC', 'headers are correct');
	div.getSheet().kill();
});