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

	tf.assertEquals(tdsHidden.length, 25);
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

	tf.assertEquals(tdsHidden.length, 25);
	tf.assertEquals(tdsVisible.length, 50);
	div.getSheet().kill();
	tables.remove();
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

	tf.assertEquals(tdsHidden.length, 25);
	tf.assertEquals(tdsVisible.length, 50);
	div.getSheet().kill();
	tables.remove();
	div.remove();
});