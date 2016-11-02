
tf.test('Behaviour Testing: Highlighting Rows', function(tf) {
	$('#sheet').html("");
	var div = $('#sheet')
			.append(tableify('original1\t\toriginal2')),
		td,
		headers,
		wg = setup(div[0]),
		cell = wg.getCell(0, 0, 0);

	td = div.find('table.wg-table td:contains("original")');
	$(td[0]).mousedown();
	tf.assertEquals(td[0].className, ' ui-state-highlight', 'original1 highlighted correctly');
	$(td[0].nextSibling).mousedown();
	tf.assertEquals(td[0].nextSibling.className, ' ui-state-highlight', 'original2 highlighted correctly');
	wg.kill();
});

tf.test('Behaviour Testing: Highlighting Rows after deleting column', function(tf) {
	$('#sheet').html("");
	var div = $('#sheet')
			.append(tableify('original1\t\toriginal2')),
		td,
		headers,
		wg = setup(div[0]),
		cell = wg.getCell(0, 0, 0);
	wg.deleteColumn(1);

	td = div.find('table.wg-table td:contains("original1")');
	$(td[0]).mousedown();
	tf.assertEquals(td[0].className, ' ui-state-highlight', 'original1 @ expected location');
	$(td[0].nextSibling).mousedown();
	tf.assertEquals(td[0].nextSibling.className, ' ui-state-highlight', 'added @ expected location');
	wg.kill();
});