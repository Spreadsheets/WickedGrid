tf.test('Formula: Dependencies', function() {
	var table = tableify('=ABS(-500)\t=A1+A2\t=B1\n\
100\t0\t0\n'),
		tableHtml = $(table).html(),
		div = $('<div>')
			.append(table)
			.sheet(),
		jS = div.getSheet(),
		A1 = jS.spreadsheets[0][1][1], B1 = jS.spreadsheets[0][1][2], C1 = jS.spreadsheets[0][1][3],
		A2 = jS.spreadsheets[0][2][1], B2 = jS.spreadsheets[0][2][2], C2 = jS.spreadsheets[0][2][3];

	//thawing, so force values to resolve
	A1.updateValue();
	A2.updateValue();
	B1.updateValue();
	B2.updateValue();
	C1.updateValue();
	C2.updateValue();

	tf.assert(test.assertEqual(A1.dependencies[0], B1), 'A1 is a dependency of B1');
	tf.assert(test.assertEqual(A2.dependencies[0], B1), 'A2 is a dependency of B1');
	tf.assert(test.assertEqual(B1.dependencies[0], C1), 'B1 is a dependency of C1');
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
				columns: [{},{formula:'Sheet1!A1 + 100'}]
			}]
		},{
			title: '3',
			rows: [{
				columns: [{},{formula:'Sheet1!A1 + 100'}]
			}]
		}],
		loader = new Sheet.JSONLoader(spreadsheets),
		div = $('<div>')
			.sheet({
				loader: loader,
				minSize: {
					rows: 1,
					cols: 1
				}
			}),
		jS = div.getSheet(),
		sheet1A1 = jS.getCell(0, 1, 1), sheet1B1 = jS.getCell(0, 1, 2),
		sheet2A1 = jS.getCell(1, 1, 1), sheet2B1 = jS.getCell(1, 1, 2),
		sheet3A1 = jS.getCell(2, 1, 1), sheet3B1 = jS.getCell(2, 1, 2);

	sheet1A1.updateValue();
	sheet1B1.updateValue();
	sheet2A1.updateValue();
	sheet2B1.updateValue();
	sheet3A1.updateValue();
	sheet3B1.updateValue();
	//thawing, so force values to resolve
	sheet1A1.value = 100;
	sheet1A1.setNeedsUpdated();
	sheet1A1.updateValue();

	tf.assertSame(sheet1B1.value.valueOf(), 101, 'value is correct');
	tf.assertSame(sheet1B1.loadedFrom.cache, 101, 'cache is correct');
	tf.assertSame(sheet2B1.value.valueOf(), 200, 'value is correct');
	tf.assertSame(sheet2B1.loadedFrom.cache, 200, 'cache is correct');
	tf.assertSame(sheet3B1.value.valueOf(), 200, 'value is correct');
	tf.assertSame(sheet3B1.loadedFrom.cache, 200, 'cache is correct');
	div.getSheet().kill();
});
