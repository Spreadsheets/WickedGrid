tf.test('Formula Financial: FV', function() {
	var table = tableify('=FV(7.5%/12, 2*12, -250, -5000, 1)'),
		div = $('<div>')
			.append(table)
			.sheet(),
		jS = div.getSheet(),
		A1 = jS.getCell(0, 1, 1);

	A1.updateValue();

	tf.assertEquals(A1.value.valueOf().toFixed(2), "12298.46", 'Correct value');
	div.getSheet().kill();
});