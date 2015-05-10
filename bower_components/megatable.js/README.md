# megaTable.js
displaying infinite sized tables with fixed number of dom elements

Usage:
```javascript
new MegaTable({
	element: document.getElementById('myElement')
});
```

Settings:
```javascript
{
	/**
	 * element you want mega table in
	 * @type {Element}
	 */
	element: null,

	/**
	 * number of rows you'd like your table to have
	 * @type {Number}
	 */
	rows: 10,

	/**
	 * number of columns you'd like your table to have
	 * @type {Number}
	 */
	columns: 10,

	/**
	 * callback for when a table data element needs updated
	 * @type {Function}
	 * @param {Number} row
	 * @param {Number} column
	 * @param {HTMLTableCellElement} td
	 */
	updateCell: function(row, column, td) {},

	/**
	 * callback for when a table row header element needs updated
	 * @type {Function}
	 * @param {Number} i
	 * @param {HTMLTableCellElement} th
	 */
	updateRowHeader: function(i, th) {},

	/**
	 * callback for when a table column header element needs updated
	 * @type {Function}
	 * @param {Number} i
	 * @param {HTMLTableCellElement} th
	 * @param {HTMLTableColElement} col
	 */
	updateColumnHeader: function(i, th, col) {},

	/**
	 * turns on strict mode so that size comes strictly from col elements
	 * @type {Boolean}
	 */
	strict: false
}
```