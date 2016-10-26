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
			.append(tableify('original\t\toriginal')),
		td,
		headers,
		wg = setup(div[0]),
		cell = wg.getCell(0, 0, 0);
	wg.deleteColumn(1);

	td = div.find('table.wg-table td:contains("original")');
	$(td[0]).mousedown();
	tf.assertEquals(td[0].className, ' ui-state-highlight', 'original @ expected location');
	$(td[0].nextSibling).mousedown();
	tf.assertEquals(td[0].nextSibling.className, ' ui-state-highlight', 'added @ expected location');
	wg.kill();
});