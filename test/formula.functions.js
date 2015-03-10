tf.test('Formula: Math - ABS', function() {
	var div = $('<div>')
			.append(tableify('=ABS(-500)'))
			.sheet(),
		td = div.find('table.jS td:first');

	tf.assertEquals(td.html(), 500, td.attr('data-formula'));
	div.getSheet().kill();
});

tf.test('Formula: Transpose', function() {
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
		div = $('<div>')
			.append(table1)
			.append(table2)
			.sheet(),
		jS  = div.getSheet(),
		cell = jS.getCell(0, 1, 1);

	cell.updateValue();

	tf.assertEquals(cell.value.valueOf(), 0.457, 'value = ' + cell.value.valueOf() + ', should = ' + 0.457);

	div.getSheet().kill();
});