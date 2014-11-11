tf.test('Cells Hidden', function() {
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