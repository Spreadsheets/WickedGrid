tf.test('Formula Financial: FV', function() {
	$('#sheet').html("");
	var table = tableify('=FV(7.5%/12, 2*12, -250, -5000, 1)'),
		div = $('#sheet')
			.append(table),
		td,
		headers,
		wg = setup(div[0]),
		cell = wg.getCell(0, 0, 0);

	cell.updateValue();

	tf.assertEquals(cell.value.valueOf().toFixed(2), "12298.46", 'Correct value');
	wg.kill();
});