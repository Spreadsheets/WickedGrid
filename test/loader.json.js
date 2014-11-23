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
		cell;


	loader.jitCell(1, 1, 2, jS, jS.cellHandler).updateValue();
	cell = loader.getCell(1, 1, 2);
	tf.assertEquals(cell.cache, '$1,000.00', 'loader cell cache');
	tf.assertEquals(cell.value, "1000", 'leader cell value');
	loader.jitCell(1, 1, 1, jS, jS.cellHandler).updateValue();
	cell = loader.getCell(1, 1, 1);
	tf.assertEquals(cell.cache, '$1.00', 'loader cell cache');
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