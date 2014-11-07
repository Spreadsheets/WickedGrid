tf.test('Behaviour Testing: Adding Rows', function(tf) {
	//unit test
	var div = $('<div>')
			.append(tableify('original'))
			.sheet(),
		jS = div.getSheet(),
		td;

	jS.controlFactory.addRow();

	td = div.find('table.jS td:contains("original")');

	tf.assert(test.assertEquals(td[0].parentNode.rowIndex, 1), 'original @ expected location');
	tf.assert(test.assertEquals(td[0].parentNode.nextSibling.rowIndex, 2), 'added @ expected location');
	tf.assert(test.assertEquals(div.find('table.jS td').length, 1 * 2), 'cell count is correct');
	div.getSheet().kill();


	//unit test
	div = $('<div>')
		.append(tableify('original'))
		.sheet();
	jS = div.getSheet();

	jS.controlFactory.addRow(1, true);

	td = div.find('table.jS td:contains("original")');

	tf.assert(test.assertEquals(td[0].parentNode.rowIndex, 2), 'original @ expected location');
	tf.assert(test.assertEquals(td[0].parentNode.nextSibling, null), 'added @ expected location');
	tf.assert(test.assertEquals(div.find('table.jS td').length, 1 * 2), 'cell count is correct');
	div.getSheet().kill();


	//unit test
	div = $('<div>')
		.append(tableify('original1\n\
original2'
		))
		.sheet();
	jS = div.getSheet();

	jS.controlFactory.addRow(2, true);

	td = div.find('table.jS td:contains("original1")');

	tf.assert(test.assertEquals(td[0].parentNode.rowIndex, 1), 'original @ expected location');
	tf.assert(test.assertEquals(td.parent().next().children().filter('td').html(), ''), 'added @ expected location');
	tf.assert(test.assertEquals(div.find('table.jS td').length, 1 * 3), 'cell count is correct');
	div.getSheet().kill();
});

tf.test('Behaviour Testing: Adding Columns', function(tf) {
	//unit test
	var div = $('<div>')
			.append(tableify('original'))
			.sheet(),
		jS = div.getSheet(),
		td;

	jS.controlFactory.addColumn();

	td = div.find('table.jS td:contains("original")');

	tf.assert(test.assertEquals(td[0].cellIndex, 1), 'original @ expected location');
	tf.assert(test.assertEquals(td[0].nextSibling.cellIndex, 2), 'added @ expected location');
	tf.assert(test.assertEquals(div.find('table.jS td').length, 1 * 2), 'cell count is correct');
	div.getSheet().kill();


	//unit test
	div = $('<div>')
		.append(tableify('original'))
		.sheet();
	jS = div.getSheet();

	jS.controlFactory.addColumn(1, true);

	td = div.find('table.jS td:contains("original")');

	tf.assert(test.assertEquals(td[0].cellIndex, 2), 'original @ expected location');
	tf.assert(test.assertEquals(td[0].nextSibling, null), 'added @ expected location');
	tf.assert(test.assertEquals(div.find('table.jS td').length, 1 * 2), 'cell count is correct');
	div.getSheet().kill();


	//unit test
	div = $('<div>')
		.append(tableify('original1\toriginal2'
		))
		.sheet();
	jS = div.getSheet();

	jS.controlFactory.addColumn(2, true);

	td = div.find('table.jS td:contains("original1")');
	tf.assert(test.assertEquals(td[0].cellIndex, 1), 'original @ expected location');
	tf.assert(test.assertEquals(td.next().html(), ''), 'added @ expected location');
	tf.assert(test.assertEquals(div.find('table.jS td').length, 1 * 3), 'cell count is correct');
	div.getSheet().kill();
});