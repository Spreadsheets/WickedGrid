Sheet.Facade = (function(document) {

	//used in instantiation
	function createCornerDOM(tr) {
		var th = document.createElement('th');
		tr.appendChild(tr);
	}

	function createColumnHeaderDOM(facade) {
		var tr = document.createElement('tr'),
			columnCount = facade.columnCount,
			headers = facade.topHeaders,
			th;

		createCornerDOM(tr);

		facade.tBody.appendChild(tr);
		for (var columnIndex = 0;columnIndex <= columnCount; columnIndex++) {
			th = document.createElement('th');
			headers.push(th);
			tr.appendChild(th);
		}
	}

	function createRowHeaderDOM(tr, headers) {
		var th = document.createElement('th');
		headers.push(th);
		tr.appendChild(th);
	}

	function createFacadeDOM(facade) {
		var tBody = facade.tBody,
			rowCount = facade.rowCount,
			bodyRows = facade.bodyRows,
			bodyRow,
			columnCount = facade.columnCount,
			headers = facade.leftHeaders,
			rowIndex = 0,
			columnIndex = 0,
			tr,
			td;

		createColumnHeaderDOM(facade);

		for (;rowIndex <= rowCount; rowIndex++) {
			columnIndex = 0;
			tr = document.createElement('tr');
			bodyRow = [];
			bodyRows.push(bodyRow);

			createRowHeaderDOM(tr, headers);

			tBody.appendChild(tr);
			for (;columnIndex <= columnCount; columnIndex++) {
				td = document.createElement('td');
				td.columnIndex = columnIndex;
				td.rowIndex = rowIndex;
				bodyRow.push(td);
				tr.appendChild(td);
			}
		}
	}

	//used in updating
	function updateColumnHeaders(facade) {
		var headers = facade.topHeaders,
			header,
			max = headers.length,
			i = 0;

		for (;i<max;i++) {
			header = headers[i];
			header.innerHTML = jSE.columnLabelString(i + facade.columnIndex);
		}
	}

	function updateRowHeaders(facade) {
		var headers = facade.leftHeaders,
			header,
			max = headers.length,
			i = 0;

		for (;i<max;i++) {
			header = headers[i];
			header.innerHTML = i + facade.rowIndex;
		}
	}

	/**
	 *
	 * @param {HTMLTableCellElement} td
	 * @param {Sheet.Cell} cell
	 */
	function updateCell(td, cell) {
		td.innerHTML = '';

		if (cell !== undefined) {
			cell.td = td;
			cell.displayValue();
		}
	}

	function updateBody(facade) {
		var spreadsheet =  facade.spreadsheet,
			columnIndex = facade.columnIndex,
			rowIndex = facade.rowIndex,
			bodyRows = facade.bodyRows,
			max = bodyRows.length,
			bodyRow,
			element,
			i = 0,
			cell,
			row,
			j;

		for (;i<max;i++) {
			bodyRow = bodyRows[i];
			row = spreadsheet[i + rowIndex];

			for (j=0;j<max;j++) {
				cell = row[j + columnIndex];
				element = bodyRow[j];

				updateCell(element, cell);
			}
		}
	}

	/**
	 *
	 * @param {Number} rowCount
	 * @param {Number} columnCount
	 * @param {[[Sheet.Cell]]} spreadsheet
	 * @constructor
	 */
	function Facade(rowCount, columnCount, spreadsheet) {
		this.rowCount = rowCount;
		this.columnCount = columnCount;
		this.spreadsheet = spreadsheet;
		this.topHeaders = [];
		this.leftHeaders = [];
		this.bodyRows = [];
		this.rowIndex = 0;
		this.columnIndex = 0;

		var table = this.table = document.createElement('table'),
			colGroup = this.colGroup = document.createElement('colGroup'),
			tBody = this.tBody = document.createElement('tBody');

		createFacadeDOM(this);
	}

	Facade.prototype = {
		update: function(rowIndex, columnIndex) {
			this.rowIndex = rowIndex;
			this.columnIndex = columnIndex;

			updateColumnHeaders(this);
			updateRowHeaders(this);
			updateBody(this);
		}
	};

	return Facade;
})(document);