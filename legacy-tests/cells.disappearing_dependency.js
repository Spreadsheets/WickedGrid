tf.test('Disappearing Dependency: Column 3 Disappears', function(tf) {
	var div = $('<div>')
			.append(tableify('=C1\t \t \n\
=C2\t \t \n\
=C3\t \t \n'))
			.sheet(),
		jS = div.getSheet(),
		td;

	jS.deleteColumn(3);

	tf.assertEquals(jS.getCell(0,1,1).formula, '#REF!1', 'Formula shifted correctly');
	tf.assertEquals(jS.getCell(0,2,1).formula, '#REF!2', 'Formula shifted correctly');
	tf.assertEquals(jS.getCell(0,3,1).formula, '#REF!3', 'Formula shifted correctly');
	tf.assertEquals(div.find('table.jS td').length, 2 * 3, 'cell count is correct');
	div.getSheet().kill();
});

tf.test('Disappearing Dependency: Row 3 Disappears', function(tf) {
	var div = $('<div>')
			.append(tableify('=A3\t=B3\t=C3\n\
 \t \t \n\
 \t \t \n'))
			.sheet(),
		jS = div.getSheet(),
		td;

	jS.deleteRow(3);

	tf.assertEquals(jS.getCell(0,1,1).formula, 'A#REF!', 'Formula shifted correctly');
	tf.assertEquals(jS.getCell(0,1,2).formula, 'B#REF!', 'Formula shifted correctly');
	tf.assertEquals(jS.getCell(0,1,3).formula, 'C#REF!', 'Formula shifted correctly');
	tf.assertEquals(div.find('table.jS td').length, 2 * 3, 'cell count is correct');
	div.getSheet().kill();
});

tf.test('Disappearing Dependency: Column & Row (C3 Disappears)', function(tf) {
	var div = $('<div>')
			.append(tableify('=C3\t \t \n\
 \t \t \n\
 \t \t \n'))
			.sheet(),
		jS = div.getSheet(),
		td;

	jS.deleteRow(3);
	jS.deleteColumn(3);

	tf.assertEquals(jS.getCell(0,1,1).formula, '#REF!#REF!', 'Formula shifted correctly');
	tf.assertEquals(div.find('table.jS td').length, 2 * 2, 'cell count is correct');
	div.getSheet().kill();
});