function setup(element) {
	var settings = {};
    for (var p in WickedGrid.defaults) {
      if (WickedGrid.defaults.hasOwnProperty(p)) {
        settings[p] = settings.hasOwnProperty(p) ? settings[p] : WickedGrid.defaults[p];
      }
    }

    var $element = $(element),
        instance = $element.getWickedGrid();
    settings.useStack = false;
    settings.useMultiThreads = false;

    settings.element = element;
    settings.$element = $element;

   	WickedGrid.events.forEach(function(event) {
        $element.bind(event, settings[event]);
    });

	$element.children().each(function(i) {
        //override frozenAt settings with table's data-frozenatrow and data-frozenatcol
        var frozenAtRow = this.getAttribute('data-frozenatrow') * 1,
            frozenAtCol = this.getAttribute('data-frozenatcol') * 1;

        if (!settings.frozenAt[i]) {
          settings.frozenAt[i] = {row:0, col:0};
        }
        if (frozenAtRow) {
          settings.frozenAt[wickedGrid.i].row = frozenAtRow;
        }
        if (frozenAtCol) {
          settings.frozenAt[wickedGrid.i].col = frozenAtCol;
        }
    });


    var wickedGrid = new WickedGrid(settings);
    return wickedGrid;
}

var rowHeadersCount = '12345678910111213141516171819202122232425262728293031323334353637383940',
	ColumnHeadersCount = 'ABCDEFGHIJKLMNOPQRSTUVWXYZAAABACADAEAFAGAHAI'

tf.test('Behaviour Testing: Adding Rows @ Start', function(tf) {
	var div = $('#sheet')
			.append(tableify('original')),
		td,
		headers,
		wg = setup(div[0]),
		cell = wg.getCell(0, 0, 0);
	wg.addRow();

	td = div.find('table.wg-table td:contains("original")');

	headers = div.find('table.wg-table tr:not(:first) th');

	tf.assertEquals(td[0].parentNode.rowIndex, 2, 'original @ expected location');
	tf.assertEquals(td[0].parentNode.previousSibling.rowIndex, 1, 'added @ expected location');
	tf.assertEquals(headers.text(), rowHeadersCount, 'headers are correct');
	wg.kill();
});

tf.test('Behaviour Testing: Adding Rows @ After 0', function(tf) {
	var div = $('#sheet')
			.html(tableify('original')),
		wg = setup(div[0]),
		td,
		headers;

	wg.addRow();
	wg.addRow(true, 0);

	td = div.find('table.wg-table td:contains("original")');

	headers = div.find('table.wg-table tr:not(:first) th');

	tf.assertEquals(td[0].parentNode.rowIndex, 3, 'original @ expected location');
	tf.assertEquals(td[0].parentNode.previousSibling.rowIndex, 2, 'added @ expected location');
	tf.assertEquals(headers.text(), rowHeadersCount, 'headers are correct');
	wg.kill();
});

tf.test('Behaviour Testing: Adding Rows @ Before 3', function(tf) {
	var div = $('#sheet')
			.html(tableify('original1\n\
original2'
		)),
		wg = setup(div[0]),
		td,
		headers;

	wg.addRow(true, 0);

	td = div.find('table.wg-table td:contains("original1")');

	headers = div.find('table.wg-table tr:not(:first) th');

	tf.assertEquals(td[0].parentNode.rowIndex, 1, 'original @ expected location');
	tf.assertEquals(td.parent().next().children().filter('td').html(), '', 'added @ expected location');
	tf.assertEquals(headers.text(), rowHeadersCount, 'headers are correct');
	wg.kill();
});

tf.test('Behaviour Testing: Adding Columns @ Start', function(tf) {
	var div = $('#sheet')
			.html(tableify('original')),
		wg = setup(div[0]),
		td,
		headers;

	wg.addColumn();

	td = div.find('table.wg-table td:contains("original")');

	headers = div.find('table.wg-table tr:first th');

	tf.assertEquals(td[0].cellIndex, 2, 'original @ expected location');
	tf.assertEquals(td[0].previousSibling.cellIndex, 1, 'added @ expected location');
	tf.assertEquals(headers.text(), ColumnHeadersCount, 'headers are correct');
	wg.kill();

});


tf.test('Behaviour Testing: Adding Columns @ After 1', function(tf) {
	var div = $('#sheet')
			.html(tableify('original')),
		wg = setup(div[0]),
		td,
		headers;

	wg.addColumn(true, 0);

	td = div.find('table.wg-table td:contains("original")');

	headers = div.find('table.wg-table tr:first th');

	tf.assertEquals(td[0].cellIndex, 1, 'original @ expected location');
	tf.assertNotEquals(td[0].nextSibling, null, 'added @ expected location');
	tf.assertEquals(headers.text(), ColumnHeadersCount, 'headers are correct');
	wg.kill();

});

tf.test('Behaviour Testing: Adding Columns @ Before 2', function(tf) {
	var div = $('#sheet')
			.html(tableify('original1\toriginal2')),
		wg = setup(div[0]),
		td,
		headers;

	wg.addColumn(true, 0);

	td = div.find('table.wg-table td:contains("original1")');

	headers = div.find('table.wg-table tr:first th');

	tf.assertEquals(td[0].cellIndex, 1, 'original @ expected location');
	tf.assertEquals(td.next().html(), '', 'added @ expected location');
	tf.assertEquals(headers.text(), ColumnHeadersCount, 'headers are correct');
	wg.kill();
});
