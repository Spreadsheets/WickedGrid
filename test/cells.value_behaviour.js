tf.test('Value Behaviour: Angle Brackets', function() {
	var div = $('<div>')
			.append(tableify('="<b>test</b>"'))
			.sheet(),
		jS = div.getSheet(),
		td;

	td = div.find('table.jS td');

	tf.assertEquals(td[0].innerHTML, '&lt;b&gt;test&lt;/b&gt;', 'greater than, less than');
	div.getSheet().kill();
});

tf.test('Value Behaviour: Line Breaks', function() {
	var div = $('<div>')
			.append('<table><tr><td data-formula="\'test\n\
\n\
\n\
test\'"></td></tr></table>')
			.sheet(),
		jS = div.getSheet(),
		td;

	td = div.find('table.jS td');

	tf.assertEquals(td.find('br').length, 3, 'expected number of br elements');
	div.getSheet().kill();
});