tf.test('Cells Inputs: Dropdown Values from Cells', function() {
	var loader = new Sheet.JSONLoader([{
			rows: [
				{columns: [
					{formula: 'DROPDOWN(A2:J2)', value: 9},
					{formula: 'DROPDOWN(A3:J3)', value: 'd'}
				]},
				{columns: [
					{value: 1},
					{value: 2},
					{value: 3},
					{value: 4},
					{value: 5},
					{value: 6},
					{value: 7},
					{value: 8},
					{value: 9},
					{value: 10}
				]},
				{columns: [
					{value: 'a'},
					{value: 'b'},
					{value: 'c'},
					{value: 'd'},
					{value: 'e'},
					{value: 'f'},
					{value: 'g'},
					{value: 'h'},
					{value: 'i'},
					{value: 'j'}
				]}
			]
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
		cell1 = jS.getCell(0,1,1),
		cell2 = jS.getCell(0,1,2);

	//ensure values have been resolved
	cell1.updateValue();
	cell2.updateValue();

	tf.assertSame(cell1.value.valueOf(), '9', 'Value is correct');
	tf.assertSame(cell1.value.html.nodeName, 'SELECT', 'Node is correct for input type');
	tf.assertSame(cell1.value.html.selectedIndex, 8, 'Correct index selected');

	tf.assertSame(cell2.value.valueOf(), 'd', 'Value is correct');
	tf.assertSame(cell2.value.html.nodeName, 'SELECT', 'Node is correct for input type');
	tf.assertSame(cell2.value.html.selectedIndex, 3, 'Correct index selected');

	div.detach();
	div.getSheet().kill();
});

tf.test('Cells Inputs: Dropdown Values from Literal', function() {
	var loader = new Sheet.JSONLoader([{
			rows: [
				{columns: [
					{formula: 'DROPDOWN(1,2,3,4,5,6,7,8,9,10)', value: 9},
					{formula: 'DROPDOWN("a","b","c","d","e","f","g","h","i","j")', value: 'd'}
				]}
			]
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
		cell1 = jS.getCell(0,1,1),
		cell2 = jS.getCell(0,1,2);

	//ensure values have been resolved
	cell1.updateValue();
	cell2.updateValue();

	tf.assertSame(cell1.value.valueOf(), '9', 'Value is correct');
	tf.assertSame(cell1.value.html.nodeName, 'SELECT', 'Node is correct for input type');
	tf.assertSame(cell1.value.html.selectedIndex, 8, 'Correct index selected');

	tf.assertSame(cell2.value.valueOf(), 'd', 'Value is correct');
	tf.assertSame(cell2.value.html.nodeName, 'SELECT', 'Node is correct for input type');
	tf.assertSame(cell2.value.html.selectedIndex, 3, 'Correct index selected');

	div.detach();
	div.getSheet().kill();
});


tf.test('Cells Inputs: Checkbox Value from Cell', function() {
	var loader = new Sheet.JSONLoader([{
			rows: [
				{columns: [
					{formula: 'CHECKBOX(A2)', value: 1},
					{formula: 'CHECKBOX(A3)', value: ''}
				]},
				{columns: [
					{value: 1}
				]},
				{columns: [
					{value: 'a'}
				]}
			]
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
		cell1 = jS.getCell(0,1,1),
		cell2 = jS.getCell(0,1,2);

	//ensure values have been resolved
	cell1.updateValue();
	cell2.updateValue();

	tf.assertSame(cell1.value.valueOf(), '1', 'Value is correct');
	tf.assertSame(cell1.value.html.firstChild.nodeName, 'INPUT', 'Node is correct for input type');
	tf.assertSame(cell1.value.html.firstChild.getAttribute('type'), 'checkbox', 'Node is correct for input type');
	tf.assertSame(cell1.value.html.firstChild.checked, true, 'Node (input) is checked');

	tf.assertSame(cell2.value.valueOf(), '', 'Value is correct');
	tf.assertSame(cell2.value.html.firstChild.nodeName, 'INPUT', 'Node is correct for input type');
	tf.assertSame(cell2.value.html.firstChild.getAttribute('type'), 'checkbox', 'Node is correct for input type');
	tf.assertSame(cell2.value.html.firstChild.checked, false, 'Node (input) is not checked');

	div.detach();
	div.getSheet().kill();
});