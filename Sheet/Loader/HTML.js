;Sheet.Loader.HTML = (function($, document, String) {
	"use strict";
	function HTML(tables) {
		if (tables !== undefined) {
			this.tables = tables;
			this.count = tables.length;
		} else {
			this.tables = [];
			this.count = 0;
		}

		this.cellIds = {};
		this.jS = null;
		this.handler = null;
	}

	HTML.prototype = {
		bindJS: function(jS) {
			this.jS = jS;
			return this;
		},
		bindHandler: function(handler) {
			this.handler = handler;
			return this;
		},
		bindActionUI: function(spreadsheetIndex, actionUI) {
			actionUI.loadedFrom = this.tables[spreadsheetIndex];
		},
		size: function(spreadsheetIndex) {
			var size = {
					cols: 0,
					rows: 0
				},
				tables = this.tables,
				table,
				rows,
				firstRow,
				firstRowColumns;

			if ((table = tables[spreadsheetIndex]) === undefined) return size;
			if ((rows = table.querySelectorAll('tr')) === undefined) return size;
			if ((firstRow = rows[0]) === undefined) return size;
			if ((firstRowColumns = firstRow.children) === undefined) return size;

			return {
				rows: rows.length,
				cols: firstRowColumns.length
			};
		},
		getWidth: function(sheetIndex, columnIndex) {
			var tables = this.tables,
				table = tables[sheetIndex],
				columns,
				width;

			columns = table.querySelectorAll('col');

			if (columns.length > columnIndex) {
				width = columns[columnIndex].style.width.replace('px', '') || Sheet.defaultColumnWidth;
				return width * 1;
			}

			return Sheet.defaultColumnWidth;
		},
		getHeight: function(sheetIndex, rowIndex) {
			var tables = this.tables,
				table = tables[sheetIndex],
				rows,
				row,
				height;

			rows = table.querySelectorAll('tr');

			if (rows.length > rowIndex) {
				row = rows[rowIndex];

				height = row.style.height.replace('px', '') || Sheet.defaultRowHeight;

				return height * 1;
			}

			return Sheet.defaultRowHeight;
		},
		isHidden: function(sheetIndex) {
			var tables = this.tables,
				table = tables[sheetIndex];

			return table.style.display === 'none';
		},
		setHidden: function(sheetIndex, isHidden) {
			var tables = this.tables,
				table = tables[sheetIndex];

			if (isHidden) {
				table.style.display = 'none';
			} else {
				table.style.display = '';
			}

			return this;
		},
		addRow: function(sheetIndex, rowIndex, spreadsheetRow) {
			var table = this.tables[sheetIndex],
				columnIndex = 0,
				size = this.size(sheetIndex),
				columnMax = size.cols,
				rowsMax = size.rows,
				rows,
				row = document.createElement('tr'),
				tBody;

			if (table === undefined) return this;

			tBody = table.querySelector('tBody');
			rows = tBody.children;

			for (;columnIndex < columnMax; columnIndex++) {
				row.appendChild(
					spreadsheetRow[columnIndex].loadedFrom = document.createElement('td')
				);
			}

			if (rowIndex === undefined) {
				tBody.appendChild(row);
			} else if (rowIndex < rowsMax) {
				tBody.insertBefore(row, rows[rowIndex + 1]);
			}

			return this;
		},
		addColumn: function(sheetIndex, columnIndex, spreadsheetCells) {
			var table = this.tables[sheetIndex],
				rowIndex = 0,
				rows,
				row,
				td,
				size = this.size(sheetIndex),
				rowMax = size.rows,
				columnMax = size.cols,
				tBody;

			if (table === undefined) return this;

			tBody = table.querySelector('tBody');
			rows = tBody.children;

			if (columnIndex === undefined) {
				for (; rowIndex < rowMax; rowIndex++) {
					row = rows[rowIndex];
					td = document.createElement('td');
					spreadsheetCells[rowIndex].loadedFrom = td;
					row.append(td);
				}
			} else if (columnIndex < columnMax) {
				for (; rowIndex < rowMax; rowIndex++) {
					row = rows[rowIndex];
					td = document.createElement('td');
					spreadsheetCells[rowIndex].loadedFrom = td;
					row.insertBefore(td, row.children[columnIndex + 1]);
				}
			}

			return this;
		},
		deleteRow: function(sheetIndex, rowIndex) {
			var table = this.tables[sheetIndex],
				rows,
				hiddenRows,
				hiddenI,
				tBody;

			if (table === undefined) return this;

			tBody = table.querySelector('tBody');
			rows = tBody.children;

			if (rows.length > rowIndex) {
				tBody.removeChild(rows[rowIndex]);
			}

			if (
				table.hasAttribute('data-hiddenrows')
				(hiddenRows = table.getAttribute('data-hiddenrows').split(','))
				&& (hiddenI = hiddenRows.indexOf(rowIndex)) > -1
			) {
				hiddenRows.splice(hiddenI, 1);
				table.setAttribute('data-hiddenrows', hiddenRows.join(','));
			}

			return this;
		},
		deleteColumn: function(sheetIndex, columnIndex) {
			var table = this.tables[sheetIndex],
				rows,
				row,
				columns,
				rowIndex = 0,
				rowMax,
				hiddenColumns,
				hiddenI,
				tBody;

			if (table === undefined) return this;

			tBody = table.querySelector('tBody');
			rows = tBody.children;
			rowMax = rows.length;

			for(;rowIndex < rowMax; rowIndex++) {
				row = rows[rowIndex];
				columns = row.children;

				if (columnIndex.length > columnIndex) {
					row.removeChild(columns[columnIndex]);
				}
			}

			if (
				table.hasAttribute('data-hiddencolumns')
				&& (hiddenColumns = table.getAttribute('data-hiddencolumns').split(','))
				&& (hiddenI = hiddenColumns.indexOf(columnIndex)) > -1
			) {
				hiddenColumns.splice(hiddenI, 1);
				table.setAttribute('data-hiddencolumns', hiddenColumns.join(','));
			}

			return this;
		},
		setupTD: function(cell, td) {
			if (cell.covered) {
				td.style.visibility = 'hidden';
				return this;
			}

			var jS = this.jS,
				htmlCell = cell.loadedFrom,
				needsAbsolute = false,
				height = 0,
				width = 0,
				rowspan,
				colspan,
				rowMax,
				columnMax,
				rowIndex = cell.rowIndex,
				columnIndex = cell.columnIndex,
				nextCell;

			if (htmlCell.hasAttribute('class')) td.className = cell.className;
			if (htmlCell.hasAttribute('style')) td.setAttribute('style', htmlCell.getAttribute('style'));

			if (htmlCell.hasAttribute('rowspan')) {
				td.setAttribute('rowspan', rowspan = htmlCell.getAttribute('rowspan'));
				rowMax = rowIndex + (rowspan * 1);
				needsAbsolute = true;
			}
			if (htmlCell.hasAttribute('colspan')) {
				td.setAttribute('colspan', colspan = htmlCell.getAttribute('colspan'));
				columnMax = columnIndex + (colspan * 1);
				needsAbsolute = true;
			}

			if (needsAbsolute) {
				if (rowMax === undefined) {
					rowMax = rowIndex + 1;
				}
				if (columnMax === undefined) {
					columnMax = columnMax + 1;
				}
				td.style.position = 'absolute';
				td.style.borderBottomWidth =
				td.style.borderRightWidth = '1px';
				for (;rowIndex < rowMax; rowIndex++) {
					height += this.getHeight(cell.sheetIndex, rowIndex) + 2;
					if (cell.rowIndex !== rowIndex && (nextCell = jS.getCell(cell.sheetIndex, rowIndex, cell.columnIndex)) !== null) {
						nextCell.covered = true;
						nextCell.defer = cell;
					}
				}
				for (;columnIndex < columnMax; columnIndex++) {
					width += this.getWidth(cell.sheetIndex, columnIndex);
					if (cell.columnIndex !== columnIndex && (nextCell = jS.getCell(cell.sheetIndex, cell.rowIndex, columnIndex)) !== null) {
						nextCell.covered = true;
						nextCell.defer = cell;
					}
				}
				height -= 1;
				width -= 1;

				td.style.width = width + 'px';
				td.style.height = height + 'px';
			}

			return this;
		},
		getCell: function(sheetIndex, rowIndex, columnIndex) {
			var tables = this.tables,
				table,
				rows,
				row,
				cell;

			if ((table = tables[sheetIndex]) === undefined) return null;
			if ((rows = table.querySelectorAll('tr')) === undefined) return null;
			if ((row = rows[rowIndex]) === undefined) return null;
			if ((cell = row.children[columnIndex]) === undefined) return null;

			return cell;
		},
		jitCell: function(sheetIndex, rowIndex, columnIndex) {
			var tdCell = this.getCell(sheetIndex, rowIndex, columnIndex);

			if (tdCell === null) return null;

			if (tdCell.getCell !== undefined) {
				return tdCell.getCell();
			}

			var jitCell,
				id,
				value,
				formula,
				cellType,
				uneditable,
				hasId,
				hasValue,
				hasFormula,
				hasCellType,
				hasUneditable;

			id = tdCell.getAttribute('id');
			value = tdCell.innerHTML;
			formula = tdCell.getAttribute('data-formula');
			cellType = tdCell.getAttribute('data-celltype');
			uneditable = tdCell.getAttribute('data-uneditable');

			hasId = id !== null;
			hasValue = value.length > 0;
			hasFormula = formula !== null;
			hasCellType = cellType !== null;
			hasUneditable = uneditable !== null;

			jitCell = new Sheet.Cell(sheetIndex, null, this.jS, this.handler);
			jitCell.rowIndex = rowIndex;
			jitCell.columnIndex = columnIndex;
			jitCell.loadedFrom = tdCell;
			jitCell.loader = this;

			if (hasId) jitCell.id = id;

			if (hasFormula) jitCell.formula = formula;
			if (hasCellType) jitCell.cellType = cellType;
			if (hasUneditable) jitCell.uneditable = uneditable;


			if (hasValue) {
				jitCell.value = new String(value);
			}
			else {
				jitCell.value = new String();
			}

			jitCell.value.cell = jitCell;


			tdCell.getCell = function() {
				return jitCell;
			};

			return jitCell;
		},
		jitCellById: function(id, sheetIndex, callback) {
			switch(this.cellIds[id]) {
				//we do want this function to run, we have not defined anything yet
				case undefined:break;
				//we do not want this function to run, we've already tried to look for this cell, and assigned it null
				case null: return this;
				//we already have this cell, lets return it
				default:
					callback(this.cellIds[id].requestCell());
					break;
			}

			var loader = this,
				tables = this.tables,
				sheetMax = (sheetIndex < 0 ? tables.length - 1: sheetIndex + 1),
				table,
				rowIndex,
				rowMax,
				rows,
				row,
				columnIndex,
				columnMax,
				columns,
				column,
                cell;

			if (sheetIndex < 0) {
				sheetIndex = 0;
			}

			for(;sheetIndex < sheetMax;sheetIndex++) {
				table = tables[sheetIndex];
				rows = table.querySelectorAll('tr');
				if (rows.length < 1) continue;
				rowIndex = 0;
				rowMax = rows.length;

				for (; rowIndex < rowMax; rowIndex++) {

					row = rows[rowIndex];
					columns = row.children;
					columnIndex = 0;
					columnMax = columns.length;

					for (; columnIndex < columnMax; columnIndex++) {
						column = columns[columnIndex];

						if (column === null) continue;

						if (column.id !== null && column.id.length > 0) {
							this.cellIds[column.id] = {
								cell: column,
								sheetIndex: sheetIndex,
								rowIndex: rowIndex,
								columnIndex: columnIndex,
								requestCell: function() {
									return loader.jitCell(this.sheetIndex, this.rowIndex, this.columnIndex);
								}
							};
						}
					}
				}
			}

			if (this.cellIds[id] !== undefined) {
                cell = this.cellIds[id].requestCell();
				callback(cell);
			} else {
				this.cellIds[id] = null;
			}

			return this;
		},
		title: function(sheetIndex) {
			var tables = this.tables,
				table;

			if ((table = tables[sheetIndex]) === undefined) return '';

			return table.getAttribute('title');
		},
		hideRow: function(actionUI, rowIndex) {
			var table = actionUI.loadedFrom,
				hiddenRows;

			if (table.hasAttribute('data-hiddenrows')) {
				hiddenRows = arrHelpers.toNumbers(table.getAttribute('data-hiddenrows').split(','));
			} else {
				hiddenRows = [];
			}

			if (hiddenRows.indexOf(rowIndex) < 0) {
				hiddenRows.push(rowIndex);
				hiddenRows.sort(function (a, b) { return a - b; });
			}

			table.setAttribute('data-hiddenrows', hiddenRows.join(','));

			return hiddenRows;
		},
		hideColumn: function(actionUI, columnIndex) {
			var table = actionUI.loadedFrom,
				hiddenColumns;

			if (table.hasAttribute('data-hiddencolumns')) {
				hiddenColumns = arrHelpers.toNumbers(table.getAttribute('data-hiddencolumns').split(','));
			} else {
				hiddenColumns = [];
			}

			if (hiddenColumns.indexOf(columnIndex) < 0) {
				hiddenColumns.push(columnIndex);
				hiddenColumns.sort(function (a, b) { return a - b; });
			}

			table.setAttribute('data-hiddencolumns', hiddenColumns.join(','));

			return hiddenColumns;
		},
		showRow: function(actionUI, rowIndex) {
			var table = actionUI.loadedFrom,
				hiddenRows,
				i;

			if (table.hasAttribute('data-hiddenrows')) {
				hiddenRows = arrHelpers.toNumbers(table.getAttribute('data-hiddenrows').split(','));
			} else {
				hiddenRows = [];
			}

			if ((i = hiddenRows.indexOf(rowIndex)) > -1) {
				hiddenRows.splice(i, 1);
			}

			table.setAttribute('data-hiddenrows', hiddenRows.join(','));

			return hiddenRows;
		},
		showColumn: function(actionUI, columnIndex) {
			var table = actionUI.loadedFrom,
				hiddenColumns,
				i;

			if (table.hasAttribute('data-hiddencolumns')) {
				hiddenColumns = arrHelpers.toNumbers(table.getAttribute('data-hiddencolumns').split(','));
			} else {
				hiddenColumns = [];
			}

			if ((i = hiddenColumns.indexOf(columnIndex)) > -1) {
				hiddenColumns.splice(i, 1);
			}

			table.setAttribute('data-hiddencolumns', hiddenColumns.join(','));

			return hiddenColumns;
		},
		hiddenRows: function(actionUI) {
			var hiddenRowsString = actionUI.loadedFrom.getAttribute('data-hiddenrows'),
				hiddenRows = null;

			if (hiddenRowsString !== null) {
				hiddenRows = arrHelpers.toNumbers(hiddenRowsString.split(','));
			} else {
				hiddenRows = [];
			}

			return hiddenRows;
		},
		hiddenColumns: function(actionUI) {
			var hiddenColumnsString = actionUI.loadedFrom.getAttribute('data-hiddencolumns'),
				hiddenColumns = null;

			if (hiddenColumnsString !== null) {
				hiddenColumns = arrHelpers.toNumbers(hiddenColumnsString.split(','));
			} else {
				hiddenColumns = [];
			}

			return hiddenColumns;
		},
		hasSpreadsheetAtIndex: function(index) {
			return (this.tables[index] !== undefined);
		},
		getSpreadsheetIndexByTitle: function(title) {
			var tables = this.tables,
				max = this.count,
				i = 0,
				tableTitle;

			title = title.toLowerCase();

			for(;i < max; i++) {
				if (tables[i] !== undefined) {
					tableTitle = tables[i].getAttribute('title');
					if (tableTitle !== undefined && tableTitle !== null && tableTitle.toLowerCase() == title) {
						return i;
					}
				}
			}

			return -1;
		},
		addSpreadsheet: function(table, atIndex) {
			table = table || document.createElement('table');
			if (atIndex === undefined) {
				this.tables.push(table);
			} else {
				this.tables.splice(atIndex, 0, table);
			}
			this.count = this.tables.length;
		},
		getCellAttribute: function(cell, attribute) {
			return cell.getAttribute(attribute);
		},
		setCellAttribute: function(cell, attribute, value) {
			cell.setAttribute(attribute, value);
		},
		setCellAttributes: function(cell, attributes) {
			var i;
			for (i in attributes) if (i !== undefined && attributes.hasOwnProperty(i)) {
				cell.setAttribute(i, attributes[i]);
			}

			return this;
		},


		/**
		 *
		 * @param {Sheet.Cell} cell
		 */
		setDependencies: function(cell) {
			return this;
		},

		addDependency: function(parentCell, dependencyCell) {
			return this;
		},

		cycleCells: function(sheetIndex, fn) {
			var tables = this.tables,
				table,
				rows,
				columns,
				cell,
				row,
				rowIndex,
				columnIndex;

			if ((table = tables[sheetIndex]) === undefined) return;
			if ((rowIndex = (rows = table.querySelectorAll('tr')).length) < 1) return;
			if (rows[0].children.length < 1) return;

			rowIndex--;
			do
			{
				row = rows[rowIndex];
				columns = row.children;
				columnIndex = columns.length;
				do
				{
					cell = columns[columnIndex];
					fn.call(cell, sheetIndex, rowIndex, columnIndex);
				}
				while (columnIndex-- > 0);
			}
			while (rowIndex-- > 0);

			return this;
		},
		cycleCellsAll: function(fn) {
			var tables = this.tables,
				sheetIndex = tables.length;

			if (sheetIndex < 0) return;

			do
			{
				this.cycleCells(sheetIndex, fn);
			}
			while (sheetIndex-- > 0);

			return this;
		},

		toTables: function() {
			return this.tables;
		},

		fromSheet: function(doNotTrim) {
			doNotTrim = (doNotTrim == undefined ? false : doNotTrim);

			var output = [],
				jS = this.jS,
				i = 1 * jS.i,
				pane,
				spreadsheet,
				sheet = jS.spreadsheets.length - 1,
				tables,
				table,
				tBody,
				colGroup,
				col,
				row,
				column,
				parentAttr,
				tr,
				td,
				cell,
				attr,
				cl,
				parent,
				rowHasValues,
				parentEle,
				parentHeight;

			if (sheet < 0) return output;

			do {
				rowHasValues = false;
				jS.i = sheet;
				jS.evt.cellEditDone();
				pane = jS.obj.pane();
				table = document.createElement('table');
				tBody = document.createElement('tBody');
				colGroup = document.createElement('colGroup');
				table.setAttribute('title', jS.obj.table().attr('title'));
				table.setAttribute('data-frozenatrow', pane.action.frozenAt.row);
				table.setAttribute('data-frozenatcol', pane.action.frozenAt.col);
				table.appendChild(colGroup);
				table.appendChild(tBody);

				output.unshift(table);

				spreadsheet = jS.spreadsheets[sheet];
				row = spreadsheet.length;
				do {
					parentEle = spreadsheet[row][1].td.parentNode;
					parentHeight = parentEle.style['height'];
					tr = document.createElement('tr');
					tr.style.height = (parentHeight ? parentHeight : jS.s.colMargin + 'px');

					column = spreadsheet[row].length;
					do {
						cell = spreadsheet[row][column];
						td = document.createElement('td');
						attr = cell.td.attributes;

						if (doNotTrim || rowHasValues || attr['class'] || cell['formula'] || cell['value'] || attr['style']) {
							rowHasValues = true;

							cl = (attr['class'] ? $.trim(
								(attr['class'].value || '')
									.replace(jS.cl.uiCellActive , '')
									.replace(jS.cl.uiCellHighlighted, '')
							) : '');

							parent = cell.td.parentNode;

							tr.insertBefore(td, tr.firstChild);

							if (!tr.style.height) {
								tr.style.height = (parent.style.height ? parent.style.height : jS.s.colMargin + 'px');
							}

							if (cell['formula']) td.setAttribute('data-formula', cell['formula']);
							if (cell['cellType']) td.setAttribute('cellType', cell['cellType']);
							if (cell['value']) td.setAttribute('value', cell['value']);
							if (cell['uneditable']) td.setAttribute('uneditable', cell['uneditable']);
							if (cell['cache']) td.setAttribute('cache', cell['cache']);
							if (cell['id']) td.setAttribute('id', cell['id']);
							if (attr['style'] && attr['style'].value) td.setAttribute('style', attr['style'].value);


							if (cl.length) {
								td.className = cl;
							}
							if (attr['rowspan']) td['rowspan'] = attr['rowspan'].value;
							if (attr['colspan']) td['colspan'] = attr['colspan'].value;

							if (row * 1 == 1) {
								col = document.createElement('col');
								col.style.width = $(jS.col(null, column)).css('width');
								colGroup.insertBefore(col, colGroup.firstChild);
							}
						}
					} while (column-- > 1);

					if (rowHasValues) {
						tBody.insertBefore(tr, tBody.firstChild);
					}

				} while (row-- > 1);
			} while (sheet--);
			jS.i = i;

			return this.json = output;
		},
		type: HTML,
		typeName: 'Sheet.Loader.HTML',

		clearCaching: function() {
			return this;
		}
	};

	HTML.maxStoredDependencies = 100;

	return HTML;
})(jQuery, document, String);
