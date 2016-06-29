tf.test('Formula Shifting: Adding Column Before "B" Column (C becomes D in A column)', function(tf) {
	var div = $('<div>')
			.append(tableify('=C1\t \t \n\
=C2\t \t \n\
=C3\t \t \n'))
			.sheet(),
		jS = div.getSheet(),
		td;

	jS.controlFactory.addColumn(2, true);

	tf.assertEquals(jS.getCell(0,1,1).formula, 'D1', 'Formula shifted correctly');
	tf.assertEquals(jS.getCell(0,2,1).formula, 'D2', 'Formula shifted correctly');
	tf.assertEquals(jS.getCell(0,3,1).formula, 'D3', 'Formula shifted correctly');
	tf.assertEquals(div.find('table.jS td').length, 4 * 3, 'cell count is correct');
	div.getSheet().kill();
});


tf.test('Formula Shifting: Deleting "B" Column (C becomes B in A column)', function(tf) {
	var div = $('<div>')
			.append(tableify('=C1\t \t \n\
=C2\t \t \n\
=C3\t \t \n'))
			.sheet(),
		jS = div.getSheet(),
		td;

	jS.deleteColumn(2);

	tf.assertEquals(jS.getCell(0,1,1).formula, 'B1', 'Formula shifted correctly');
	tf.assertEquals(jS.getCell(0,2,1).formula, 'B2', 'Formula shifted correctly');
	tf.assertEquals(jS.getCell(0,3,1).formula, 'B3', 'Formula shifted correctly');
	tf.assertEquals(div.find('table.jS td').length, 2 * 3, 'cell count is correct');
	div.getSheet().kill();
});

tf.test('Formula Shifting: Deleting "B" Column (A stays as A)', function(tf) {
	var div = $('<div>')
			.append(tableify(' \t \t=A1\n\
 \t \t=A2\n\
 \t \t=A3\n'))
			.sheet(),
		jS = div.getSheet(),
		td;

	jS.deleteColumn(2);

	tf.assertEquals(jS.getCell(0,1,2).formula, 'A1', 'Formula shifted correctly');
	tf.assertEquals(jS.getCell(0,2,2).formula, 'A2', 'Formula shifted correctly');
	tf.assertEquals(jS.getCell(0,3,2).formula, 'A3', 'Formula shifted correctly');
	tf.assertEquals(div.find('table.jS td').length, 2 * 3, 'cell count is correct');
	div.getSheet().kill();
});

tf.test('Formula Shifting: Deleting "B" Column ($C stays as $C)', function(tf) {
	var div = $('<div>')
			.append(tableify('=$C1\t \t \n\
=$C2\t \t \n\
=$C3\t \t \n'))
			.sheet(),
		jS = div.getSheet(),
		td;

	jS.deleteColumn(2);

	tf.assertEquals(jS.getCell(0,1,1).formula, '$C1', 'Formula shifted correctly');
	tf.assertEquals(jS.getCell(0,2,1).formula, '$C2', 'Formula shifted correctly');
	tf.assertEquals(jS.getCell(0,3,1).formula, '$C3', 'Formula shifted correctly');
	tf.assertEquals(div.find('table.jS td').length, 2 * 3, 'cell count is correct');
	div.getSheet().kill();
});


tf.test('Formula Shifting: Adding Row Before 2 Row (3 becomes 4 in row 1)', function(tf) {
	var div = $('<div>')
			.append(tableify('=A3\t=B3\t=C3\n\
 \t \t \n\
 \t \t \n'))
			.sheet(),
		jS = div.getSheet(),
		td;

	jS.controlFactory.addRow(2, true);

	tf.assertEquals(jS.getCell(0,1,1).formula, 'A4', 'Formula shifted correctly');
	tf.assertEquals(jS.getCell(0,1,2).formula, 'B4', 'Formula shifted correctly');
	tf.assertEquals(jS.getCell(0,1,3).formula, 'C4', 'Formula shifted correctly');
	tf.assertEquals(div.find('table.jS td').length, 4 * 3, 'cell count is correct');
	div.getSheet().kill();
});


tf.test('Formula Shifting: Deleting Row 2 (3 becomes 2)', function(tf) {
	var div = $('<div>')
			.append(tableify('=A3\t=B3\t=C3\n\
 \t \t \n\
 \t \t \n'))
			.sheet(),
		jS = div.getSheet(),
		td;

	jS.deleteRow(2);

	tf.assertEquals(jS.getCell(0,1,1).formula, 'A2', 'Formula shifted correctly');
	tf.assertEquals(jS.getCell(0,1,2).formula, 'B2', 'Formula shifted correctly');
	tf.assertEquals(jS.getCell(0,1,3).formula, 'C2', 'Formula shifted correctly');
	tf.assertEquals(div.find('table.jS td').length, 2 * 3, 'cell count is correct');
	div.getSheet().kill();
});

tf.test('Formula Shifting: Deleting 2 Row (1 stays as 1)', function(tf) {
	var div = $('<div>')
			.append(tableify(' \t \t \n\
 \t \t \n\
=A1\t=B1\t=C1\n'))
			.sheet(),
		jS = div.getSheet(),
		td;

	jS.deleteRow(2);

	tf.assertEquals(jS.getCell(0,2,1).formula, 'A1', 'Formula shifted correctly');
	tf.assertEquals(jS.getCell(0,2,2).formula, 'B1', 'Formula shifted correctly');
	tf.assertEquals(jS.getCell(0,2,3).formula, 'C1', 'Formula shifted correctly');
	tf.assertEquals(div.find('table.jS td').length, 2 * 3, 'cell count is correct');
	div.getSheet().kill();
});

tf.test('Formula Shifting: Deleting Row 2 ($3 stays as $3)', function(tf) {
	var div = $('<div>')
			.append(tableify('=A$3\t=B$3\t=C$3\n\
 \t \t \n\
 \t \t \n'))
			.sheet(),
		jS = div.getSheet(),
		td;

	jS.deleteRow(2);

	tf.assertEquals(jS.getCell(0,1,1).formula, 'A$3', 'Formula shifted correctly');
	tf.assertEquals(jS.getCell(0,1,2).formula, 'B$3', 'Formula shifted correctly');
	tf.assertEquals(jS.getCell(0,1,3).formula, 'C$3', 'Formula shifted correctly');
	tf.assertEquals(div.find('table.jS td').length, 2 * 3, 'cell count is correct');
	div.getSheet().kill();
});



tf.test('Formula Shifting: Deleting Row 2 & Column 2 ($C$3 stays as $C$3)', function(tf) {
	var div = $('<div>')
			.append(tableify('=$C$3\t \t \n\
 \t \t \n\
 \t \t \n'))
			.sheet(),
		jS = div.getSheet(),
		td;

	jS.deleteRow(2);
	jS.deleteColumn(2);

	tf.assertEquals(jS.getCell(0,1,1).formula, '$C$3', 'Formula shifted correctly');
	tf.assertEquals(div.find('table.jS td').length, 2 * 2, 'cell count is correct');
	div.getSheet().kill();
});