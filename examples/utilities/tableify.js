/**
 * @param {String} tabSeparatedValue
 * @param {String} title
 * @returns {HTMLTableElement}
 */
var tableify = (function(document, TSV) {
	var tsv = TSV();
	return function(tabSeparatedValue, title) {

		var data = tsv.parse(tabSeparatedValue),
			table = document.createElement('table'),
			tr,
			td,
			row,
			col;

		table.setAttribute('title', title);

		while (data.length) {
			row = data.shift();
			tr = document.createElement('tr');
			table.appendChild(tr);
			while (row.length) {
				col = row.shift();
				td = document.createElement('td');
				if (col.charAt(0) === '=') {
					td.setAttribute('data-formula', col);
				} else {
					td.innerHTML = col;
				}
				tr.appendChild(td);
			}
		}

		return table;
	};
})(document, TSV);