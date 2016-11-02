tf.test('Formula: Math - ABS', function() {
	$('#sheet').html("");
	var div = $('#sheet')
			.append(tableify('=ABS(-500)')),
		wg = setup(div[0]),
		td = div.find('table.wg-table td:first');

	tf.assertEquals(td.html(), 500, td.attr('data-formula'));
	wg.kill();
});

tf.test('Formula: Transpose', function() {
	$('#sheet').html("");
	var table1 = tableify("=TRANSPOSE(SHEET2!A2:A10)\t\t\t\t\t\t\t\t\t\n\
=TRANSPOSE(A1:I1)\t\t\t\t\t\t\t\t\t\n\
\t\t\t\t\t\t\t\t\t\t\n\
\t\t\t\t\t\t\t\t\t\t\n\
\t\t\t\t\t\t\t\t\t\t\n\
\t\t\t\t\t\t\t\t\t\t\n\
\t\t\t\t\t\t\t\t\t\t\n\
\t\t\t\t\t\t\t\t\t\t\n\
\t\t\t\t\t\t\t\t\t\t\n\
\t\t\t\t\t\t\t\t\t\t"),
		table2 = tableify("Density	Viscosity	Temperature\n\
0.457	3.55	500\n\
0.525	3.25	400\n\
0.616	2.93	300\n\
0.675	2.75	250\n\
0.746	2.57	200\n\
0.835	2.38	150\n\
0.946	2.17	100\n\
1.09	1.95	50\n\
1.29	1.71	0"),
		div = $('#sheet')
			.append(table1)
			.append(table2),
		wg = setup(div[0]),
		cell = wg.getCell(0, 0, 0);

	cell.updateValue();

	tf.assertEquals(cell.value.valueOf(), 0.457, 'value = ' + cell.value.valueOf() + ', should = ' + 0.457);

	wg.kill();
});

tf.test('Formula: SUM and MAX', function() {
	$('#sheet').html("");
	var table1 = tableify("Density	Temperature\n\
0.1 	10\n\
0.2 	10\n\
0.3 	10\n\
0.4 	10\n\
0.5 	10\n\
0.6 	10\n\
0.7 	10\n\
=SUM(A1:A8) 	=MAX(A1:A8)"),
		div = $('#sheet')
			.append(table1)
		wg = setup(div[0]),
		cell = wg.getCell(0, 8, 0),
		cell1 = wg.getCell(0, 8, 1);

	cell.updateValue();
	cell1.updateValue();

	tf.assertEquals(cell.value.valueOf(), 2.8, 'value = ' + cell.value.valueOf() + ', should = ' + 2.8);
	tf.assertEquals(cell1.value.valueOf(), 0.7, 'value = ' + cell1.value.valueOf() + ', should = ' + 0.7);

	wg.kill();
});

tf.test('Formula: Updatation', function() {
	$('#sheet').html("");
	var table1 = tableify("Density	Temperature\n\
0.1 	10\n\
0.2 	10\n\
0.3 	10\n\
0.4 	10\n\
0.5 	10\n\
0.6 	10\n\
0.7 	10\n\
=SUM(A1:A8) 	=MAX(A1:A8)"),
		div = $('#sheet')
			.append(table1)
		wg = setup(div[0]),
		cell = wg.getCell(0, 8, 0),
		cell1 = wg.getCell(0, 8, 1),
		cell2 = wg.getCell(0, 5, 0),
		cell3 = wg.getCell(0, 2, 0);

	cell.updateValue();
	cell1.updateValue();

	tf.assertEquals(cell.value.valueOf(), 2.8, 'value = ' + cell.value.valueOf() + ', should = ' + 2.8);
	tf.assertEquals(cell1.value.valueOf(), 0.7, 'value = ' + cell1.value.valueOf() + ', should = ' + 0.7);

	// update values
	$(cell2.td).mousedown().dblclick();
	$('textarea')[1].value = 0.9;
	$("textarea.wg-in-place-edit").select().trigger({type: 'keydown', which: 13, keyCode: 13});

	cell2.updateValue();
	tf.assertEquals(cell.value.valueOf(), 3.2, 'value = ' + cell.value.valueOf() + ', should = ' + 3.2);
	tf.assertEquals(cell1.value.valueOf(), 0.9, 'value = ' + cell1.value.valueOf() + ', should = ' + 0.9);

	$(cell3.td).mousedown().dblclick();
	$('textarea')[1].value = 0.5;
	$("textarea.wg-in-place-edit").select().trigger({type: 'keydown', which: 13, keyCode: 13});

	cell3.updateValue();
	tf.assertEquals(cell.value.valueOf(), 3.5, 'value = ' + cell.value.valueOf() + ', should = ' + 3.5);
	tf.assertEquals(cell1.value.valueOf(), 0.9, 'value = ' + cell1.value.valueOf() + ', should = ' + 0.9);

	wg.kill();
});