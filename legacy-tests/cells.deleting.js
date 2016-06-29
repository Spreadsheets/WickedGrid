tf.test('Behaviour Testing: Deleting Row @ Beginning', function(tf) {
	var div = $('<div>')
			.append(tableify('original1\toriginal2\toriginal3\n\
original4\toriginal5\toriginal6\n\
original7\toriginal8\toriginal9'))
			.sheet(),
		jS = div.getSheet(),
		td;

	jS.deleteRow(1);

	td = div.find('table.jS td:contains("original1")');

	tf.assertEquals(td.length, 0, 'correct row deleted');
	tf.assertEquals(div.find('table.jS td').length, 2 * 3, 'cell count is correct');
	div.getSheet().kill();
});

tf.test('Behaviour Testing: Deleting Row @ Middle', function(tf) {
	var div = $('<div>')
			.append(tableify('original1\toriginal2\toriginal3\n\
original4\toriginal5\toriginal6\n\
original7\toriginal8\toriginal9'))
			.sheet(),
			jS = div.getSheet(),
			td;

	jS.deleteRow(2);

	td = div.find('table.jS td:contains("original4")');

	tf.assertEquals(td.length, 0, 'correct row deleted');
	tf.assertEquals(div.find('table.jS td').length, 2 * 3, 'cell count is correct');
	div.getSheet().kill();
});

tf.test('Behaviour Testing: Deleting Row @ End', function(tf) {
	var div = $('<div>')
			.append(tableify('original1\toriginal2\toriginal3\n\
original4\toriginal5\toriginal6\n\
original7\toriginal8\toriginal9'))
			.sheet(),
		jS = div.getSheet(),
		td;

	jS.deleteRow(3);

	td = div.find('table.jS td:contains("original9")');

	tf.assertEquals(td.length, 0, 'correct row deleted');
	tf.assertEquals(div.find('table.jS td').length, 2 * 3, 'cell count is correct');
	div.getSheet().kill();
});

tf.test('Behaviour Testing: Deleting Column @ Beginning', function(tf) {
	var div = $('<div>')
			.append(tableify('original1\toriginal2\toriginal3\n\
original4\toriginal5\toriginal6\n\
original7\toriginal8\toriginal9'))
			.sheet(),
		jS = div.getSheet(),
		td;

	jS.deleteColumn(1);

	td = div.find('table.jS td:contains("original1")');

	tf.assertEquals(td.length, 0, 'correct column deleted');
	tf.assertEquals(div.find('table.jS td').length, 2 * 3, 'cell count is correct');
	div.getSheet().kill();

});

tf.test('Behaviour Testing: Deleting Column @ Middle', function(tf) {
	var div = $('<div>')
			.append(tableify('original1\toriginal2\toriginal3\n\
original4\toriginal5\toriginal6\n\
original7\toriginal8\toriginal9'))
			.sheet(),
		jS = div.getSheet(),
		td;

	jS.deleteColumn(2);

	td = div.find('table.jS td:contains("original5")');

	tf.assertEquals(td.length, 0, 'correct column deleted');
	tf.assertEquals(div.find('table.jS td').length, 2 * 3, 'cell count is correct');
	div.getSheet().kill();

});

tf.test('Behaviour Testing: Deleting Column @ End', function(tf) {
	var div = $('<div>')
			.append(tableify('original1\toriginal2\toriginal3\n\
original4\toriginal5\toriginal6\n\
original7\toriginal8\toriginal9'))
			.sheet(),
		jS = div.getSheet(),
		td;

	jS.deleteColumn(3);

	td = div.find('table.jS td:contains("original3")');
	tf.assertEquals(td.length, 0, 'correct column deleted');
	tf.assertEquals(div.find('table.jS td').length, 2 * 3, 'cell count is correct');
	div.getSheet().kill();
});