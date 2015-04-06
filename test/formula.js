tf.test('Formula: Dependencies', function() {
	var table = tableify('=ABS(-500)\t=A1+A2\t=B1\n\
100\t0\t0\n'),
		tableHtml = $(table).html(),
		div = $('<div>')
			.append(table)
			.sheet({
				initCalcRows: 2,
				initCalcCols: 3
			}),
		jS = div.getSheet(),
		A1 = jS.spreadsheets[0][1][1], B1 = jS.spreadsheets[0][1][2], C1 = jS.spreadsheets[0][1][3],
		A2 = jS.spreadsheets[0][2][1], B2 = jS.spreadsheets[0][2][2], C2 = jS.spreadsheets[0][2][3];

	tf.assertEquals(A1.dependencies[0], B1, 'A1 is a dependency of B1');
	tf.assertEquals(B1.dependencies[0], C1, 'C1 is a dependency of B1');
	tf.assertEquals(B1.dependencies[0], C1, 'B1 is a dependency of C1');
	div.getSheet().kill();
});


tf.test('Formula: Proper number parsing', function() {
	var table = tableify('=SUM(1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1)'),
		div = $('<div>')
			.append(table)
			.sheet(),
		jS = div.getSheet(),
		A1 = jS.getCell(0, 1, 1);

	A1.updateValue();

	tf.assertEquals(A1.value.valueOf(), 20, 'Correct value');
	div.getSheet().kill();
});


tf.test('Formula: Proper cell parsing', function() {
	var table = tableify('=SUM(B1)\t185.50'),
		div = $('<div>')
			.append(table)
			.sheet(),
		jS = div.getSheet(),
		A1 = jS.getCell(0, 1, 1);

	A1.updateValue();

	tf.assertEquals(A1.value.valueOf(), 185.50, 'Correct value');
	div.getSheet().kill();
});


tf.test('Formula: Proper cell & value parsing', function() {
	var table = tableify('=SUM(B1, 200)\t185.50'),
		div = $('<div>')
			.append(table)
			.sheet(),
		jS = div.getSheet(),
		A1 = jS.getCell(0, 1, 1);

	A1.updateValue();

	tf.assertEquals(A1.value.valueOf(), 385.50, 'Correct value');
	div.getSheet().kill();
});

tf.test('Formula: Dependencies from JSON', function() {
	var spreadsheets = [{
			title: '1',
			rows: [{
				columns: [{},{formula:'A1 + 1'}]
			}]
		},{
			title: '2',
			rows: [{
				columns: [{},{formula:'Sheet1!A1 + 33'}]
			}]
		},{
			title: '3',
			rows: [{
				columns: [{},{formula:'Sheet1!A1 + 66'}]
			}]
		}],
		loader = new Sheet.JSONLoader(spreadsheets),
		div = $('<div>')
			.sheet({
				loader: loader
			}),
		jS = div.getSheet(),
		sheet1B1 = jS.getCell(0, 1, 2),
		sheet2B1 = jS.getCell(1, 1, 2),
		sheet3B1 = jS.getCell(2, 1, 2);

	sheet1B1.updateValue();
	sheet2B1.updateValue();
	sheet3B1.updateValue();

	tf.assertSame(sheet1B1.value.valueOf(), 1, 'sheet1B1 value is correct');
	tf.assertSame(sheet1B1.loadedFrom.cache, 1, 'sheet1B1 cache is correct');
	tf.assertSame(sheet2B1.value.valueOf(), 33, 'sheet2B1 value is correct');
	tf.assertSame(sheet2B1.loadedFrom.cache, 33, 'sheet2B1 cache is correct');
	tf.assertSame(sheet3B1.value.valueOf(), 66, 'sheet3B1 value is correct');
	tf.assertSame(sheet3B1.loadedFrom.cache, 66, 'sheet3B1 cache is correct');
	div.getSheet().kill();
});
