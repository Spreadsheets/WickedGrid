/**
 * MegaTable
 * Load infinite sized tables in the browser with a fixed number of elements
 * @constructor
 */
var MegaTable = (function(document) {
	"use strict";

	var charSize = function() {
		var characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
			el = document.createElement('span'),
			size;

		el.innerHTML = characters;
		document.body.appendChild(el);

		size = {
			width: el.offsetWidth / characters.length,
			height: el.offsetHeight
		};

		el.parentNode.removeChild(el);

		return size;
	};

	/**
	 *
	 * @param {Object} settings inherits values from MegaTable.defaultSettings
	 * @constructor
	 */
	function MegaTable(settings) {

		var table = this.table = document.createElement('table'),
			colGroup = this.colGroup = document.createElement('colGroup'),
			tBody = this.tBody = document.createElement('tBody'),
			defaults = MegaTable.defaultSettings,
			i;

		this.charSize = charSize();

		for(i in defaults) if (defaults.hasOwnProperty(i)) {
			if (settings[i] === undefined) settings[i] = defaults[i];
		}

		this.rowIndex = 0;
		this.columnIndex = 0;

		this._columnStartIndex = 1;
		this._rowStartIndex = 1;

		this.rows = settings.rows;
		this.columns = settings.columns;
		this.updateCorner = settings.updateCorner;
		this.updateCell = settings.updateCell;
		this.updateRowHeader = settings.updateRowHeader;
		this.updateColumnHeader = settings.updateColumnHeader;

		table.appendChild(colGroup);
		table.appendChild(tBody);

		if (settings.strict) {
			table.style.tableLayout = 'fixed';
			table.style.width = '0px';
		}
		table.className = 'mega-table';

		this._createMegaTableDOM();

		if (settings.element !== null) {
			settings.element.appendChild(table);
		}
	}

	MegaTable.prototype = {
		setRowStartIndex: function(rowIndex) {
			if (rowIndex < 1) {
				rowIndex = 1;
			} else if (rowIndex > this.rows) {
				rowIndex = this.rows;
			}

			this._rowStartIndex = rowIndex;

			return this;
		},
		setColumnStartIndex: function(columnIndex) {
			if (columnIndex < 1) {
				columnIndex = 1;
			} else if (columnIndex > this.columns) {
				columnIndex = this.columns;
			}

			this._columnStartIndex = columnIndex;

			return this;
		},
		/**
		 *
		 * @param {Number} rowIndex
		 * @param {Number} columnIndex
		 */
		update: function (rowIndex, columnIndex) {
			return this
				.updateRows(rowIndex)
				.updateColumns(columnIndex);
		},

		/**
		 * @param {Number} rowIndex
		 */
		updateRows: function (rowIndex) {
			var up = 0,
				down = 0,
				detachedRow;

			if (this.rowIndex > rowIndex) {
				up = this.rowIndex - rowIndex;

				if (up > this.rows) {
					up -= this.rows;
					this.rowIndex = rowIndex + up;
				}
			} else if (this.rowIndex < rowIndex) {
				down = rowIndex - this.rowIndex;

				if (down > this.rows) {
					down -= this.rows;
					this.rowIndex = rowIndex - down;
				}
			}

			if (up > 0) {
				while (up > 0) {
					this.rowIndex--;
					detachedRow = this._moveBottomRowHeaderToTop();
					this._moveBottomRowToTop(detachedRow);
					up--;
				}
				this._updateCorner();
			}

			else if (down > 0) {
				while (down > 0) {
					this.rowIndex++;
					detachedRow = this._moveTopRowHeaderToBottom();
					this._moveTopRowToBottom(detachedRow);
					down--;
				}
				this._updateCorner();
			}

			return this;
		},

		/**
		 *
		 * @param {Number} columnIndex
		 */
		updateColumns: function (columnIndex) {
			var left = 0,
				right = 0;

			if (this.columnIndex > columnIndex) {
				left = this.columnIndex - columnIndex;

				if (left > this.columns) {
					left -= this.columns;
					this.columnIndex = columnIndex + left;
				}
			} else if (this.columnIndex < columnIndex) {
				right = columnIndex - this.columnIndex;

				if (right > this.columns) {
					right -= this.columns;
					this.columnIndex = columnIndex - right;
				}
			}

			if (left > 0) {
				this.table.style.visibility = 'hidden';
				while (left > 0) {
					this.columnIndex--;

					this
						._moveRightColumnHeaderToLeft()
						._moveRightColumnToLeft();

					left--;
				}
				this.table.style.visibility = '';
			}

			else if (right > 0) {
				this.table.style.visibility = 'hidden';
				while (right > 0) {
					this.columnIndex++;

					this
						._moveLeftColumnHeaderToRight()
						._moveLeftColumnToRight();

					right--;
				}
				this.table.style.visibility = '';
			}

			return this;
		},

		newRowAt: function(rowIndex) {
			var row = this._moveBottomRowHeaderToIndex(rowIndex);
			return this
				._moveBottomRowToIndex(row, rowIndex)
				._updateRowHeadersFollowing(rowIndex);
		},
		newColumnAt: function(columnIndex) {
			return this
				._moveRightColumnHeaderToIndex(columnIndex)
				._moveRightColumnToIndex(columnIndex)
				._updateColumnHeadersFollowing(columnIndex);
		},

		//used in instantiation
		_createCornerDOM: function (tr) {
			var th = this.cornerTh = document.createElement('th'),
				col = this.cornerCol = document.createElement('col');

			col.style.width = '14px';

			tr.appendChild(th);

			this.updateCorner(th, col);

			this.colGroup.appendChild(col);

			return this;
		},

		_createColumnHeaderDOM: function () {
			var tr = document.createElement('tr'),
				colGroup = this.colGroup,
				columnIndex = this.columnIndex,
				columns = this.columns,
				i = 0,
				th,
				col;

			this._createCornerDOM(tr);

			this.tBody.appendChild(tr);

			for (; i <= columns; i++) {
				th = document.createElement('th');
				tr.appendChild(th);
				col = document.createElement('col');
				colGroup.appendChild(col);

				this.updateColumnHeader(columnIndex + i, th, col);
			}

			return this;
		},

		_createRowHeaderDOM: function (tr, i) {
			var th = document.createElement('th');
			tr.appendChild(th);
			this.updateRowHeader(i, th);

			return this;
		},

		_createMegaTableDOM: function () {
			var tBody = this.tBody,
				max = this.rows,
				rowIndex = this.rowIndex,
				columns = this.columns,
				i = 0,
				columnIndex = 0,
				tr,
				td;

			this._createColumnHeaderDOM();

			for (; i <= max; i++) {
				columnIndex = 0;
				tr = document.createElement('tr');

				this._createRowHeaderDOM(tr, rowIndex + i);

				tBody.appendChild(tr);
				for (; columnIndex <= columns; columnIndex++) {
					td = document.createElement('td');
					tr.appendChild(td);
					this.updateCell(rowIndex + i, columnIndex, td);
				}
			}

			return this;
		},



		//used in updating
		_updateCorner: function() {
			var tBody = this.tBody,
				col = this.cornerCol,
				targetRow = tBody.lastChild,
				th = targetRow.firstChild,
				newWidth,
				minWidth = 20;

			newWidth = this.charSize.width * (th.textContent || th.innerText).length;
			//set a minimum width, because css doesn't respect this on col in FF
			newWidth = (newWidth > minWidth ? newWidth : minWidth);

			if (newWidth !== col._width || col._width === undefined) {
				col._width = newWidth;
				col.style.width = newWidth + 'px';
			}

			return this;
		},
		_moveRightColumnHeaderToLeft: function() {
			var parent = this.tBody.children[0],
				colGroup = this.colGroup,
				col = colGroup.lastChild,
				header = parent.lastChild;

			parent.removeChild(header);
			colGroup.removeChild(col);

			while(header.lastChild !== null) {
				header.removeChild(header.lastChild);
			}

			if (header.hasAttribute('style')) header.removeAttribute('style');
			if (header.hasAttribute('class')) header.className = '';

			if (col.hasAttribute('style')) col.removeAttribute('style');
			if (col.hasAttribute('class')) col.className = '';

			this.updateColumnHeader(this.columnIndex, header, col, MegaTable.left);

			//insert after corner
			parent.insertBefore(header, parent.children[this._columnStartIndex]);
			colGroup.insertBefore(col, colGroup.children[this._columnStartIndex]);

			return this;
		},
		_moveRightColumnHeaderToIndex: function(columnIndex) {
			var parent = this.tBody.children[0],
				colGroup = this.colGroup,
				col = colGroup.lastChild,
				header = parent.lastChild;

			if (columnIndex < 1) {
				columnIndex = 1;
			} else if (columnIndex > this.columns) {
				columnIndex = this.columns;
			}

			parent.removeChild(header);
			colGroup.removeChild(col);

			while(header.lastChild !== null) {
				header.removeChild(header.lastChild);
			}

			if (header.hasAttribute('style')) header.removeAttribute('style');
			if (header.hasAttribute('class')) header.className = '';

			if (col.hasAttribute('style')) col.removeAttribute('style');
			if (col.hasAttribute('class')) col.className = '';

			this.updateColumnHeader(this.columnIndex + columnIndex, header, col);

			//insert before corner
			parent.insertBefore(header, parent.children[columnIndex]);
			colGroup.insertBefore(col, colGroup.children[columnIndex]);

			return this;
		},
		_moveLeftColumnHeaderToRight: function() {
			var parent = this.tBody.children[0],
				colGroup = this.colGroup,
				col = colGroup.children[this._columnStartIndex],
				header = parent.children[this._columnStartIndex];

			parent.removeChild(header);
			colGroup.removeChild(col);

			while(header.lastChild !== null) {
				header.removeChild(header.lastChild);
			}

			if (header.hasAttribute('style')) header.removeAttribute('style');
			if (header.hasAttribute('class')) header.className = '';

			if (col.hasAttribute('style')) col.removeAttribute('style');
			if (col.hasAttribute('class')) col.className = '';

			this.updateColumnHeader(this.columnIndex + parent.children.length, header, col, MegaTable.right);

			//insert at end
			parent.appendChild(header);
			colGroup.appendChild(col);

			return this;
		},

		_moveBottomRowHeaderToTop: function() {
			var parent = this.tBody,
				header = parent.lastChild.children[0];

			//we intentionally leave the node detached here because the body manages it
			parent.removeChild(header.parentNode);

			while(header.lastChild !== null) {
				header.removeChild(header.lastChild);
			}

			if (header.hasAttribute('style')) header.removeAttribute('style');
			if (header.hasAttribute('class')) header.className = '';

			this.updateRowHeader(this.rowIndex, header, MegaTable.up);

			return header.parentNode;
		},
		_moveBottomRowHeaderToIndex: function(rowIndex) {
			var parent = this.tBody,
				header = parent.lastChild.children[0];

			if (rowIndex < 1) {
				rowIndex = 1;
			} else if (rowIndex > this.rows) {
				rowIndex = this.rows;
			}

			//we intentionally leave the node detached here because the body manages it
			parent.removeChild(header.parentNode);

			while(header.lastChild !== null) {
				header.removeChild(header.lastChild);
			}

			if (header.hasAttribute('style')) header.removeAttribute('style');
			if (header.hasAttribute('class')) header.className = '';

			this.updateRowHeader(this.rowIndex + rowIndex, header);

			return header.parentNode;
		},
		_moveTopRowHeaderToBottom: function() {
			var parent = this.tBody,
				header = parent.children[this._rowStartIndex].children[0];

			//we intentionally leave the node detached here because the body manages it
			parent.removeChild(header.parentNode);

			while(header.lastChild !== null) {
				header.removeChild(header.lastChild);
			}

			if (header.hasAttribute('style')) header.removeAttribute('style');
			if (header.hasAttribute('class')) header.className = '';

			this.updateRowHeader(this.rowIndex + parent.children.length, header, MegaTable.down);

			return header.parentNode;
		},

		_moveBottomRowToTop: function (row) {
			var children = row.children,
				max = children.length,
				element,
				i;

			for (i = 1; i < max; i++) {
				element = children[i];

				while(element.firstChild) {
					element.removeChild(element.firstChild);
				}

				if (element.hasAttribute('style')) element.removeAttribute('style');
				if (element.hasAttribute('colSpan')) element.removeAttribute('colSpan');
				if (element.hasAttribute('rowSpan')) element.removeAttribute('rowSpan');
				if (element.hasAttribute('class')) element.className = '';

				this.updateCell(this.rowIndex, this.columnIndex + i - 1, element, MegaTable.up);
			}

			this.tBody.insertBefore(row, this.tBody.children[this._rowStartIndex]);

			return this;
		},

		_moveBottomRowToIndex: function (row, rowIndex) {
			var children = row.children,
				max = children.length,
				element,
				i;

			if (rowIndex < 1) {
				rowIndex = 1;
			} else if (rowIndex > this.rows) {
				rowIndex = this.rows;
			}

			for (i = 1; i < max; i++) {
				element = children[i];

				while(element.firstChild) {
					element.removeChild(element.firstChild);
				}

				if (element.hasAttribute('style')) element.removeAttribute('style');
				if (element.hasAttribute('colSpan')) element.removeAttribute('colSpan');
				if (element.hasAttribute('rowSpan')) element.removeAttribute('rowSpan');
				if (element.hasAttribute('class')) element.className = '';

				this.updateCell(this.rowIndex + rowIndex, this.columnIndex + i - 1, element);
			}

			this.tBody.insertBefore(row, this.tBody.children[rowIndex]);

			return this;
		},

		_moveTopRowToBottom: function (row) {
			var children = row.children,
				max = children.length,
				element,
				i;

			for (i = 1; i < max; i++) {
				element = children[i];

				while(element.firstChild) {
					element.removeChild(element.firstChild);
				}

				if (element.hasAttribute('style')) element.removeAttribute('style');
				if (element.hasAttribute('colSpan')) element.removeAttribute('colSpan');
				if (element.hasAttribute('rowSpan')) element.removeAttribute('rowSpan');
				if (element.hasAttribute('class')) element.className = '';

				this.updateCell(this.rowIndex + this.tBody.children.length, this.columnIndex + i - 1, element, MegaTable.down);
			}

			this.tBody.insertBefore(row, null);

			return this;
		},

		_moveRightColumnToLeft: function () {
			var rows = this.tBody.children,
				max = rows.length,
				row,
				element,
				i;

			for (i = 1; i < max; i++) {
				row = rows[i];
				element = row.lastChild;
				row.removeChild(element);

				while(element.firstChild) {
					element.removeChild(element.firstChild);
				}

				if (element.hasAttribute('style')) element.removeAttribute('style');
				if (element.hasAttribute('colSpan')) element.removeAttribute('colSpan');
				if (element.hasAttribute('rowSpan')) element.removeAttribute('rowSpan');
				if (element.hasAttribute('class')) element.className = '';

				this.updateCell(this.rowIndex + i - 1, this.columnIndex, element, MegaTable.left);

				row.insertBefore(element, row.children[this._columnStartIndex]);
			}

			return this;
		},

		_moveRightColumnToIndex: function (columnIndex) {
			var rows = this.tBody.children,
				max = rows.length,
				row,
				element,
				i;

			if (columnIndex < 1) {
				columnIndex = 1;
			}

			for (i = 1; i < max; i++) {
				row = rows[i];
				element = row.lastChild;
				row.removeChild(element);

				while(element.firstChild) {
					element.removeChild(element.firstChild);
				}

				if (element.hasAttribute('style')) element.removeAttribute('style');
				if (element.hasAttribute('colSpan')) element.removeAttribute('colSpan');
				if (element.hasAttribute('rowSpan')) element.removeAttribute('rowSpan');
				if (element.hasAttribute('class')) element.className = '';

				this.updateCell(this.rowIndex + i - 1, this.columnIndex + columnIndex, element);

				row.insertBefore(element, row.children[columnIndex]);
			}

			return this;
		},

		_moveLeftColumnToRight: function () {
			var rows = this.tBody.children,
				max = rows.length - 1,
				row,
				columnIndexEnd = this.columnIndex + rows[0].children.length,
				element,
				i;

			for (i = 1; i < max; i++) {
				row = rows[i];
				element = row.children[this._columnStartIndex];
				row.removeChild(element);

				while(element.firstChild) {
					element.removeChild(element.firstChild);
				}

				if (element.hasAttribute('style')) element.removeAttribute('style');
				if (element.hasAttribute('colSpan')) element.removeAttribute('colSpan');
				if (element.hasAttribute('rowSpan')) element.removeAttribute('rowSpan');
				if (element.hasAttribute('class')) element.className = '';

				this.updateCell(this.rowIndex + i - 1, columnIndexEnd, element, MegaTable.right);

				row.insertBefore(element, null);
			}

			return this;
		},

		_updateRowHeadersFollowing: function(rowIndex) {
			var i = rowIndex,
				max = this.rows,
				rows = this.tBody.children,
				header;

			for(;i < max;i++) {
				header = rows[i].children[0];
				if (header.hasAttribute('style')) header.removeAttribute('style');
				if (header.hasAttribute('class')) header.className = '';
				this.updateRowHeader(this.rowIndex + i, header);
			}

			return this;
		},
		_updateColumnHeadersFollowing: function(columnIndex) {
			var i = columnIndex,
				max = this.columns,
				headers = this.tBody.children[0].children,
				colGroup = this.colGroup,
				cols = colGroup.children,
				header,
				col;

			for(;i < max;i++) {
				header = headers[i];
				col = cols[i];
				if (header.hasAttribute('style')) header.removeAttribute('style');
				if (header.hasAttribute('class')) header.className = '';

				if (col.hasAttribute('style')) col.removeAttribute('style');
				if (col.hasAttribute('class')) col.className = '';

				this.updateColumnHeader(this.columnIndex + i, header, col);
			}

			return this;
		}
	};

	/**
	 *
	 * @type {Object}
	 */
	MegaTable.defaultSettings = {
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
		 * turns on strict mode so that size comes strictly from col elements
		 * @type {Boolean}
		 */
		strict: false,

		updateCorner: function(th, col) {},

		/**
		 * callback for when a table data element needs updated
		 * @type {Function}
		 * @param {Number} row
		 * @param {Number} column
		 * @param {HTMLTableCellElement} td
		 * @param {Number} direction
		 */
		updateCell: function(row, column, td, direction) {},

		/**
		 * callback for when a table row header element needs updated
		 * @type {Function}
		 * @param {Number} i
		 * @param {HTMLTableCellElement} th
		 * @param {Number} direction
		 */
		updateRowHeader: function(i, th, direction) {},

		/**
		 * callback for when a table column header element needs updated
		 * @type {Function}
		 * @param {Number} i
		 * @param {HTMLTableCellElement} th
		 * @param {HTMLTableColElement} col
		 * @param {Number} direction
		 */
		updateColumnHeader: function(i, th, col, direction) {}
	};

	MegaTable.left = 0;
	MegaTable.right = 1;
	MegaTable.up = 2;
	MegaTable.down = 3;

	return MegaTable;
})(document);