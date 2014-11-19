tf.test('Loader (json) : Cache updating', function() {
	var loader = new Sheet.JSONLoader([{
			rows: [{
				columns: [
					{//A
						cellType: 'currency',
						formula: 'IF("Inputs!B1<>"", Inputs!B1, 0)'
					}
				]
			}]
		},{
			title: 'Inputs Sheet',
			rows: [{
				columns: [{},
					{
						cellType: 'currency',
						formula: 'IF(1<>0, 1000, 0)',
						value: " "
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

	div.getSheet().kill();


});