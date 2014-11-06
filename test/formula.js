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
