var tsv = {
parse : function(source){
	var ini_rows = source.split("\n"), table = [], cols = [], table2 =[], cols2 = [], quote = false;
	for (var i = 0; i < ini_rows.length; i++) {
		var ini_cols = ini_rows[i].split("\t")
		for (var j = 0; j < ini_cols.length; j++) {
			cell = ini_cols[j];

			if (! quote) {
// quote on 				
				if (cell.match(/^"$|^".*[^"]$/) && (j == (ini_cols.length - 1 ))) {
					//console.log('quote on');
					quote = true;
					cols2 = cols.concat();
					cols.push(cell);
					cols2.push(cell.substr(1));
					table2 = [];
					for (var t = 0; t < table.length; t++) {
						table2[t] = table[t].concat();
					}
					
				} else {
// no quote
					//console.log('no quote');
					cols.push(cell);

				}
			} else {
				if ( cell.match(/^$|^.*[^"]$/)) {
					if (j == (ini_cols.length - 1 )) {
// quote cont
						//console.log('quote cont');
						cols.push(cell);
						cols2[cols2.length -1] = cols2[cols2.length -1] + "\n" + cell;
// quote break
					} else {
						//console.log('quote break');
						quote = false;
						cols.push(cell);
					}
				} else {
// qoute off
					//console.log('quote off');
					quote = false;
					table = [];
					for (var t = 0; t < table2.length; t++) {

						table[t] = table2[t].concat();
					}
					cols2[cols2.length -1] = cols2[cols2.length -1] + "\n" + cell.substr(0,cell.length - 1);
					cols = cols2.concat();
				}
			}
			
		}

		table.push(cols.concat());
		cols = [];
		//console.log(table);
		//console.log(table2);
	}
	return table;
}
}
