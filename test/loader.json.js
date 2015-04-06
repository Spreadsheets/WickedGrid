tf.test('Loader (json) : Cache updating', function() {
	var loader = new Sheet.JSONLoader([{
			rows: [{
				columns: [
					{//A
						cellType: 'currency',
						formula: 'IF("Inputs Sheet"!B1<>"", "Inputs Sheet"!B1, 0)'
					}
				]
			}]
		},{
			title: 'Inputs Sheet',
			rows: [{
				columns: [{
						cellType: 'currency',
						value: '1'
					},
					{
						cellType: 'currency',
						formula: 'IF(1<>0, 1000, 0)'
					}
				]
			}]
		}]),
		div = $('<div>')
			.sheet({
				loader: loader,
				minSize: {
					rows: 1,
					cols: 1
				}
			}),
		jS = div.getSheet(),
		cell = jS.getCell(1,1,2),
		jsonCell = cell.loadedFrom;

	cell.updateValue();

	tf.assertEquals(jsonCell.cache, '$1,000.00', 'loader cell cache');
	tf.assertEquals(cell.value, "1000", 'leader cell value');

	cell = jS.getCell(1, 1, 1);
	jsonCell = cell.loadedFrom;
	cell.updateValue();

	tf.assertEquals(jsonCell.cache, '$1.00', 'loader cell cache');
	tf.assertEquals(cell.value, "1", 'leader cell value');
	div.getSheet().kill();


});

tf.test('Loader (json) : Cache reading', function() {
	var loader = new Sheet.JSONLoader([{
			rows: [{
				columns: [{//A
					cellType: 'currency',
					formula: 'IF("Inputs Sheet"!B1<>"", "Inputs Sheet"!B1, 0)',
					cache: '0',
					value: 0
				}]
			}]
		},{
			title: 'Inputs Sheet',
			rows: [{
				columns: [{
					cellType: 'currency',
					value: 1,
					cache: '$1.00'
				},
				{
					cellType: 'currency',
					formula: 'IF(1<>0, 1000, 0)',
					value: 1000,
					cache: '$1,000.00',
					dependencies: [{
						sheet:0,
						row:1,
						column:1
					}]
				}]
			}]
		}]),
		div = $('<div>')
			.sheet({
				loader: loader,
				minSize: {
					rows: 1,
					cols: 1
				}
			}),
		jS = div.getSheet(),
		cell;


	cell = jS.getCell(0, 1, 1);
	cell.updateValue();
	tf.assertEquals(cell.td.innerHTML, '0', 'loader cell cache');
	div.getSheet().kill();
});

tf.test('Loader (json) : Dependency reading with cell type', function() {
	var loader = new Sheet.JSONLoader([{
			rows: [{
				columns: [{//A
					cellType: 'currency',
					value: 100,
					dependencies: [{
						sheet:1,
						row:1,
						column:1
					}]
				}]
			}]
		},{
			title: 'Inputs Sheet',
			rows: [{
				columns: [{
					cellType: 'currency',
					formula: 'Sheet1!A1 + 100'
				}]
			}]
		}]),
		div = $('<div>')
			.sheet({
				loader: loader,
				minSize: {
					rows: 1,
					cols: 1
				}
			}),
		jS = div.getSheet(),
		cell;


	cell = jS.getCell(0,1,1);
	cell.updateValue();
	cell = jS.getCell(1,1,1);
	cell.updateValue();
	tf.assertEquals(cell.value.html, '$200.00', 'dependency was tracked correctly in spreadsheet');
	tf.assertEquals(cell.loadedFrom.cache, '$200.00', 'dependency was tracked correctly in json');
	div.getSheet().kill();
});

tf.test('Loader (json) : Calc cell cache', function() {
	var loader = new Sheet.JSONLoader([{
			rows: [{
				columns: [{value: 100},{value:100},{value:100},{value:100},{value:100}]
			},{
				columns: [{formula: 'sum(A1:E1)'},{},{},{},{}]
			}]
		}]),
		div = $('<div>')
			.sheet({
				loader: loader,
				minSize: {
					rows: 1,
					cols: 1
				}
			}),
		jS = div.getSheet(),
		cell;

	jS.calc(0, true);


	cell = jS.getCell(0,2,1).loadedFrom;
	tf.assertEquals(cell.cache, 500, 'Expected value');
	div.getSheet().kill();
});

tf.test('Loader (json) : Calc All cell cache', function() {
	var loader = new Sheet.JSONLoader([{
			rows: [{
				columns: [{value: 100},{value:100},{value:100},{value:100},{value:100}]
			},{
				columns: [{formula: 'sum(A1:E1)'},{},{},{},{}]
			}]
		},{
			rows: [{
				columns: [{value: 1},{value:1},{value:1},{value:1},{value:1}]
			},{
				columns: [{formula: 'sum(A1:E1)'},{},{},{},{}]
			}]
		}]),
		div = $('<div>')
			.sheet({
				loader: loader,
				minSize: {
					rows: 1,
					cols: 1
				}
			}),
		jS = div.getSheet(),
		cell1,
		cell2;

	jS.calcAll(true);


	cell1 = jS.getCell(0,2,1).loadedFrom;
	cell2 = jS.getCell(1,2,1).loadedFrom;
	tf.assertEquals(cell1.cache, 500, 'Expected value');
	tf.assertEquals(cell2.cache, 5, 'Expected value');
	div.getSheet().kill();
});

tf.test('Loader (json) : html non transference', function() {
	var loader = new Sheet.JSONLoader([{
			rows: [{
				columns: [{value: 100},{value:200},{value:300},{value:400},{value:500}]
			},{
				columns: [{formula: 'dropdown(A1:E1)'},{},{},{},{}]
			},{
				columns: [{formula: 'A2'},{},{},{},{}]
			}]
		}]),
		div = $('<div>')
			.sheet({
				loader: loader,
				minSize: {
					rows: 3,
					cols: 5
				}
			}),
		jS = div.getSheet(),
		cell,
		select;

	jS.calcAll(true);

	jS.getCell(0,3,1).updateValue();
	cell = jS.getCell(0,2,1);
	cell.updateValue();
	select = cell.td.children[0];
	tf.assertEquals(select.getAttribute('class'), 'jSDropdown', 'Expected class');
	tf.assertEquals(select.getAttribute('id'), 'dropdown0_2_1_0', 'Expected id');
	tf.assertEquals(select.getAttribute('name'), 'dropdown0_2_1_0', 'Expected name');
	tf.assertEquals(select.children[0].getAttribute('value'), '100', 'Expected child value');
	tf.assertEquals(select.children[1].getAttribute('value'), '200', 'Expected child value');
	tf.assertEquals(select.children[2].getAttribute('value'), '300', 'Expected child value');
	tf.assertEquals(select.children[3].getAttribute('value'), '400', 'Expected child value');
	tf.assertEquals(select.children[4].getAttribute('value'), '500', 'Expected child value');
	tf.assertEquals(select.children[0].innerHTML, '100', 'Expected child html');
	tf.assertEquals(select.children[1].innerHTML, '200', 'Expected child html');
	tf.assertEquals(select.children[2].innerHTML, '300', 'Expected child html');
	tf.assertEquals(select.children[3].innerHTML, '400', 'Expected child html');
	tf.assertEquals(select.children[4].innerHTML, '500', 'Expected child html');
	jS.kill();
});

tf.test('Cell Operator: Percent Addition', function() {
	var loader = new Sheet.JSONLoader([{
			rows: [{
				columns: [{formula: 'Sheet1!B1 + 1'},{value: '60 %'}]
			}]
		}]),
		div = $('<div>')
			.sheet({
				loader: loader
			}),
		jS = div.getSheet(),
		td;

	jS.getCell(0,1,1).updateValue();

	td = div.find('table.jS td').first();

	tf.assertEquals(td.html(), '1.6', 'html is properly displayed');
	tf.assertEquals(td[0].jSCell.value.valueOf(), 1.6, 'value remains a number');
	div.getSheet().kill();
});


tf.test('Loader (json): Missing Sheet & Cell', function() {
	var loader = new Sheet.JSONLoader([{
			rows: [{
				columns: [{formula: 'Sheet2!A1 + "Missing Sheet"!A1 +  + "Missing Sheet"!A2 +  + "Missing Sheet"!A3 +  + "Missing Sheet"!A4'}]
			}]
		},{
			rows: [{
				columns: [{value: '60 %'}]
			}]
		}]),
		div = $('<div>')
			.sheet({
				loader: loader
			}),
		jS = div.getSheet(),
		td,
		cell = jS.getCell(0,1,1);

	cell.updateValue();

	td = cell.td;

	tf.assertEquals(td.innerHTML, '0.6', 'html is properly displayed');
	tf.assertEquals(cell.value.valueOf(), 0.6, 'value remains a number');
	div.getSheet().kill();
});

tf.test('Loader (json): Hidden Rows', function() {
	var rowsRaw = '[' +
			(new Array(99)).join('\n  {"columns": [{},{},{},{},{}]},') +
			'\n  {"columns": [{},{},{},{},{}]}' +
		']',
		rows = JSON.parse(rowsRaw),
		loader = new Sheet.JSONLoader([{
			metadata: {
				hiddenRows: [5,10,15,20]
			},
			rows: rows
		}]),
		div = $('<div>')
			.appendTo('body')
			.sheet({
				loader: loader,
				minSize: {
					rows: 25,
					cols: 5
				}
			}),
		jS = div.getSheet(),
		tr,
		style,
		cell = jS.getCell(0,5,1);

	tr = cell.td.parentNode;

	tf.assertEquals(cell.rowIndex, 5, 'Proper row is selected');
	tf.assertEquals(tr.parentNode, null, 'Row is hidden');
	div.detach();
	div.getSheet().kill();
});

tf.test('Loader (json): Hidden Columns', function() {
	var columnsRaw = '[' + (new Array(99)).join('{},') + '{}' + ']',
		rowsRaw = '[' +
			(new Array(99)).join('\n  {"columns": ' + columnsRaw + '},') +
			'\n  {"columns": ' + columnsRaw + '}' +
			']',
		rows = JSON.parse(rowsRaw),
		loader = new Sheet.JSONLoader([{
			metadata: {
				hiddenColumns: [5,10,15,20]
			},
			rows: rows
		}]),
		div = $('<div>')
			.appendTo('body')
			.sheet({
				loader: loader,
				minSize: {
					rows: 25,
					cols: 5
				}
			}),
		jS = div.getSheet(),
		td,
		style,
		cell = jS.getCell(0,1,5);

	td = cell.td;
	style = getComputedStyle(td);

	tf.assertEquals(cell.columnIndex, 5, 'Proper column is selected');
	tf.assertEquals(style['display'], 'none', 'Column is hidden');
	div.detach();
	div.getSheet().kill();
});

tf.test('Loader (json): Scroll Offset with Hidden Rows', function() {
	var rowsRaw = '[' +
			(new Array(99)).join('\n  {"columns": [{},{},{},{},{}]},') +
			'\n  {"columns": [{},{},{},{},{}]}' +
			']',
		rows = JSON.parse(rowsRaw),
		loader = new Sheet.JSONLoader([{
			metadata: {
				hiddenRows: [5,10,15,20]
			},
			rows: rows
		}]),
		div = $('<div>')
			.appendTo('body')
			.sheet({
				loader: loader,
				minSize: {
					rows: 25,
					cols: 5
				}
			}),
		jS = div.getSheet(),
		tr,
		td,
		cell = jS.getCell(0,25,1);

	td = cell.td || {};
	tr = td.parentNode || null;

	tf.assertEquals(cell.rowIndex, 25, 'Proper row is selected');
	tf.assertNotEquals(tr.parentNode, null, 'Row is displayed');

	cell = jS.getCell(0,26,1);

	tf.assertEquals(cell.rowIndex, 26, 'Following row is selected');
	tf.assertEquals(cell.td, null, 'Following row is not yet displayed/created');

	div.detach();
	div.getSheet().kill();
});

tf.test('Loader (json): Scroll Offset with Hidden Columns', function() {
	var columnsRaw = '[' + (new Array(99)).join('{},') + '{}' + ']',
		rowsRaw = '[' +
			(new Array(99)).join('\n  {"columns": ' + columnsRaw + '},') +
			'\n  {"columns": ' + columnsRaw + '}' +
			']',
		rows = JSON.parse(rowsRaw),
		loader = new Sheet.JSONLoader([{
			metadata: {
				hiddenColumns: [5,10,15,20]
			},
			rows: rows
		}]),
		div = $('<div>')
			.appendTo('body')
			.sheet({
				loader: loader,
				minSize: {
					rows: 1,
					cols: 25
				}
			}),
		jS = div.getSheet(),
		tr,
		td,
		style,
		cell = jS.getCell(0,1,29);

	td = cell.td || null;
	style = td ? getComputedStyle(td) : {};

	tf.assertEquals(cell.columnIndex, 29, 'Proper column is selected');
	tf.assertEquals(style['display'] || '', 'table-cell', 'Column is displayed');

	cell = jS.getCell(0,1,30);

	tf.assertEquals(cell.columnIndex, 30, 'Following column is selected');
	tf.assertEquals(cell.td, null, 'Following column is not yet displayed/created');

	div.detach();
	div.getSheet().kill();
});