tf.test('Cells Hidden: Using Options (hiddenRows, hiddenColumns)', function() {
	var div = $('<div>')
			.appendTo('body')
			.append(tableify(' \t \t \t \t \n\
 \t \t \t \t \n\
 \t \t \t \t \n\
 \t \t \t \t \n\
 \t \t \t \t \n'))
			.append(tableify(' \t \t \t \t \n\
 \t \t \t \t \n\
 \t \t \t \t \n\
 \t \t \t \t \n\
 \t \t \t \t \n'))
			.append(tableify(' \t \t \t \t \n\
 \t \t \t \t \n\
 \t \t \t \t \n\
 \t \t \t \t \n\
 \t \t \t \t \n'))
			.sheet({
				hiddenRows: [[1,2],[],[1]],
				hiddenColumns: [[3,4],[],[1]]
			}),
		tables = div.find('table.jS')
			.appendTo('body')
			.show(),
		tdsHidden = tables.find('td:hidden'),
		tdsVisible = tables.find('td:visible');

	tf.assertEquals(tdsHidden.length, 10);
	tf.assertEquals(tdsVisible.length, 50);
	div.getSheet().kill();
	tables.remove();
	div.remove();
});


tf.test('Cells Hidden: Using attributes (data-hiddenrows, data-hiddencolumns)', function() {
	var table1 = tableify(' \t \t \t \t \n\
 \t \t \t \t \n\
 \t \t \t \t \n\
 \t \t \t \t \n\
 \t \t \t \t \n'),
		table2 = tableify(' \t \t \t \t \n\
 \t \t \t \t \n\
 \t \t \t \t \n\
 \t \t \t \t \n\
 \t \t \t \t \n'),
		table3 = tableify(' \t \t \t \t \n\
 \t \t \t \t \n\
 \t \t \t \t \n\
 \t \t \t \t \n\
 \t \t \t \t \n');

	table1.setAttribute('data-hiddenrows', '1,2');
	table1.setAttribute('data-hiddencolumns', '3,4');
	table3.setAttribute('data-hiddenrows', '1');
	table3.setAttribute('data-hiddencolumns', '1');

	var div = $('<div>')
			.appendTo('body')
			.append(table1)
			.append(table2)
			.append(table3)
			.sheet(),
		tables = div.find('table.jS')
			.appendTo('body')
			.show(),
		tdsHidden = tables.find('td:hidden'),
		tdsVisible = tables.find('td:visible');

	tf.assertEquals(tdsHidden.length, 10);
	tf.assertEquals(tdsVisible.length, 50);
	div.getSheet().kill();
	tables.remove();
	div.remove();
});


tf.test('Cells Hidden: Using row toggle', function() {
	var table1 = tableify(' \t \t \t \t \n\
 \t \t \t \t \n\
 \t \t \t \t \n\
 \t \t \t \t \n\
 \t \t \t \t \n');

	var div = $('<div>')
			.append(table1)
			.appendTo('body')
			.sheet(),
		jS = div.getSheet(),
		cell = jS.getCell(0, 1, 1),
		style,
		tr;

	jS.toggleHideRow(1);

	tr = cell.td.parentNode;

	tf.assertEquals(tr.parentNode, null);

	div.getSheet().kill();
	div.remove();
});

tf.test('Cells Hidden: Using column toggle', function() {
	var table1 = tableify(' \t \t \t \t \n\
 \t \t \t \t \n\
 \t \t \t \t \n\
 \t \t \t \t \n\
 \t \t \t \t \n');

	var div = $('<div>')
			.append(table1)
			.appendTo('body')
			.sheet(),
		jS = div.getSheet(),
		cell = jS.getCell(0, 1, 1),
		style;

	jS.toggleHideColumn(1);

	style = getComputedStyle(cell.td);

	tf.assertEquals(style['display'], 'none');

	div.getSheet().kill();
	div.remove();
});

tf.test('Cells Hidden: Using row range toggle', function() {
	var table1 = tableify(' \t \t \t \t \n\
 \t \t \t \t \n\
 \t \t \t \t \n\
 \t \t \t \t \n\
 \t \t \t \t \n');

	var div = $('<div>')
			.append(table1)
			.appendTo('body')
			.sheet(),
		jS = div.getSheet(),
		cell1 = jS.getCell(0, 1, 1),
		cell2 = jS.getCell(0, 5, 1);

	jS.toggleHideRowRange(1,10);

	tf.assertEquals(cell1.td.parentNode.parentNode, null, 'Row 1 is correctly hidden');
	tf.assertEquals(cell2.td.parentNode.parentNode, null, 'Row 2 is correctly hidden');

	div.getSheet().kill();
	div.remove();
});


tf.test('Cells Hidden: Using column range toggle', function() {
	var table1 = tableify(' \t \t \t \t \n\
 \t \t \t \t \n\
 \t \t \t \t \n\
 \t \t \t \t \n\
 \t \t \t \t \n');

	var div = $('<div>')
			.append(table1)
			.appendTo('body')
			.sheet(),
		jS = div.getSheet(),
		cell1 = jS.getCell(0, 1, 1),
		cell2 = jS.getCell(0, 5, 5),
		style1,
		style2;

	jS.toggleHideColumnRange(1,10);

	style1 = getComputedStyle(cell1.td);
	style2 = getComputedStyle(cell2.td);

	tf.assertEquals(style1['display'], 'none', 'Column 1 is correctly hidden');
	tf.assertEquals(style2['display'], 'none', 'Column 2 is correctly hidden');

	div.getSheet().kill();
	div.remove();
});


tf.test('Cells Hidden: Using Json (hiddenRows, hiddenColumns)', function() {
	var spreadsheets = [{
			metadata: {
				hiddenRows: [1,2],
				hiddenColumns: [3,4]
			},
			rows: [
				{
					columns: [{},{},{},{},{}]
				},
				{
					columns: [{},{},{},{},{}]
				},
				{
					columns: [{},{},{},{},{}]
				},
				{
					columns: [{},{},{},{},{}]
				},
				{
					columns: [{},{},{},{},{}]
				}
			]
		},{
			rows: [
				{
					columns: [{},{},{},{},{}]
				},
				{
					columns: [{},{},{},{},{}]
				},
				{
					columns: [{},{},{},{},{}]
				},
				{
					columns: [{},{},{},{},{}]
				},
				{
					columns: [{},{},{},{},{}]
				}
			]
		},{
			metadata: {
				hiddenRows: [1],
				hiddenColumns: [1]
			},
			rows: [
				{
					columns: [{},{},{},{},{}]
				},
				{
					columns: [{},{},{},{},{}]
				},
				{
					columns: [{},{},{},{},{}]
				},
				{
					columns: [{},{},{},{},{}]
				},
				{
					columns: [{},{},{},{},{}]
				}
			]
		}],
		loader = new Sheet.JSONLoader(spreadsheets),
		div = $('<div>')
			.appendTo('body')
			.sheet({
				loader: loader,
				minSize: {rows: 5, cols: 5}
			}),
		jS = div.getSheet(),

		//trigger all the spreadsheets to build

		tabs = jS.obj.tabContainer().children().mousedown(),
		tables = div.find('table.jS')
			.appendTo('body')
			.show(),
		tdsHidden = tables.find('td:hidden'),
		tdsVisible = tables.find('td:visible');

	tf.assertEquals(tdsHidden.length, 13);
	tf.assertEquals(tdsVisible.length, 70);
	div.getSheet().kill();
	tables.remove();
	div.remove();
});