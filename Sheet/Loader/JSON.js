/**
 * @project jQuery.sheet() The Ajax Spreadsheet - http://code.google.com/p/jquerysheet/
 * @author RobertLeePlummerJr@gmail.com
 * $Id: jquery.sheet.dts.js 933 2013-08-28 12:59:30Z robertleeplummerjr $
 * Licensed under MIT
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

;Sheet.Loader.JSON = (function($, document, String) {
	"use strict";
	function JSONLoader(json) {
		if (json !== undefined) {
			this.json = json;
			this.count = json.length;
		} else {
			this.json = [];
			this.count = 0;
		}

		this.cellIds = {};
		this.jS = null;
		this.handler = null;
	}

	JSONLoader.prototype = {
		bindJS: function(jS) {
			this.jS = jS;
			return this;
		},
		bindHandler: function(handler) {
			this.handler = handler;
			return this;
		},
		bindActionUI: function(spreadsheetIndex, actionUI) {
			actionUI.loadedFrom = this.json[spreadsheetIndex];
		},
		size: function(spreadsheetIndex) {
			var size = {
					cols: 0,
					rows: 0
				},
				json = this.json,
				jsonSpreadsheet,
				rows,
				firstRow,
				firstRowColumns;

			if ((jsonSpreadsheet = json[spreadsheetIndex]) === undefined) return size;
			if ((rows = jsonSpreadsheet.rows) === undefined) return size;
			if ((firstRow = rows[0]) === undefined) return size;
			if ((firstRowColumns = firstRow.columns) === undefined) return size;

			return {
				rows: rows.length,
				cols: firstRowColumns.length
			};
		},
		getWidth: function(sheetIndex, columnIndex) {
			var json = this.json,
				jsonSpreadsheet = json[sheetIndex] || {},
				metadata = jsonSpreadsheet.metadata || {},
				widths = metadata.widths || [],
				width = widths[columnIndex] || Sheet.defaultColumnWidth;

			return width * 1;
		},
		getHeight: function(sheetIndex, rowIndex) {
			var json = this.json,
				jsonSpreadsheet = json[sheetIndex] || {},
				rows = jsonSpreadsheet.rows || [],
				row = rows[rowIndex] || {},
				height = row.height || Sheet.defaultRowHeight;

			return height * 1;
		},
		isHidden: function(sheetIndex) {
			var json = this.json,
				jsonSpreadsheet = json[sheetIndex] || {},
				metadata = jsonSpreadsheet.metadata || {};

			return metadata.hidden === true;
		},
		setHidden: function(sheetIndex, isHidden) {
			var json = this.json,
				jsonSpreadsheet = json[sheetIndex] || {},
				metadata = jsonSpreadsheet.metadata || {};

			metadata.hidden = isHidden;

			return this;
		},
		addRow: function(sheetIndex, rowIndex, spreadsheetCells) {
			var json = this.json[sheetIndex],
				columnIndex = 0,
				columnMax = this.size(sheetIndex).cols,
				rows,
				row = {
					columns: []
				},
				jsonCell,
				columns = row.columns;

			if (json === undefined) return this;

			rows = json.rows;

			for (;columnIndex < columnMax; columnIndex++) {
				jsonCell = {};
				spreadsheetCells[columnIndex] = jsonCell;
				columns.push(jsonCell);
			}

			if (rowIndex === undefined) {
				rows.push(row);
			} else if (rowIndex < rows.length) {
				rows.splice(rowIndex, 0, row);
			}

			return this;
		},
		addColumn: function(sheetIndex, columnIndex, spreadsheetCells) {
			var json = this.json[sheetIndex],
				rowIndex = 0,
				rows,
				jsonCell,
				size = this.size(sheetIndex),
				rowMax = size.rows,
				columnMax = size.cols;

			if (json === undefined) return this;

			rows = json.rows;

			if (columnIndex === undefined) {
				for (; rowIndex < rowMax; rowIndex++) {
					jsonCell = {};
					spreadsheetCells[rowIndex].loadedFrom = jsonCell;
					rows[rowIndex].columns.push(jsonCell);
				}
			} else if (columnIndex < columnMax) {
				for (; rowIndex < rowMax; rowIndex++) {
					jsonCell = {};
					spreadsheetCells[rowIndex].loadedFrom = jsonCell;
					rows[rowIndex].columns.splice(columnIndex, 0, jsonCell);
				}
			}

			return this;
		},
		deleteRow: function(sheetIndex, rowIndex) {
			var json = this.json[sheetIndex],
				rows,
				metadata,
				hiddenRows,
				hiddenI;

			if (json === undefined) return this;

			rows = json.rows;

			if (rows.length > rowIndex) {
				rows.splice(rowIndex, 1);
			}

			if (
				(metadata = json.metadata) !== undefined
				&& (hiddenRows = metadata.hiddenRows) !== undefined
				&& (hiddenI = hiddenRows.indexOf(rowIndex)) > -1
			) {
				hiddenRows.splice(hiddenI, 1);
			}

			return this;
		},
		deleteColumn: function(sheetIndex, columnIndex) {
			var json = this.json[sheetIndex],
				rows,
				row,
				columns,
				rowIndex = 0,
				rowMax,
				metadata,
				hiddenColumns,
				hiddenI;

			if (json === undefined) return this;

			rows = json.rows;
			rowMax = rows.length;

			for(;rowIndex < rowMax; rowIndex++) {
				row = rows[rowIndex];
				columns = row.columns;

				if (columnIndex.length > columnIndex) {
					columns.splice(columnIndex, 1);
				}
			}

			if (
				(metadata = json.metadata) !== undefined
				&& (hiddenColumns = metadata.hiddenColumns) !== undefined
				&& (hiddenI = hiddenColumns.indexOf(columnIndex)) > -1
			) {
				hiddenColumns.splice(hiddenI, 1);
			}

			return this;
		},
		setupTD: function(cell, td) {
			if (cell.covered) {
				td.style.visibility = 'hidden';
				return this;
			}

			var jS = this.jS,
				jsonCell = cell.loadedFrom,
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

			if (jsonCell['class'] !== undefined) td.className = jsonCell['class'];
			if (jsonCell['id'] !== undefined) td.setAttribute('id', jsonCell['id']);
			if (jsonCell['style'] !== undefined) td.setAttribute('style', jsonCell['style']);

			if (jsonCell['rowspan'] !== undefined) {
				td.setAttribute('rowspan', rowspan = jsonCell['rowspan']);
				rowMax = rowIndex + (rowspan * 1);
				needsAbsolute = true;
			}
			if (jsonCell['colspan'] !== undefined) {
				td.setAttribute('colspan', colspan = jsonCell['colspan']);
				columnMax = columnIndex + (colspan * 1);
				needsAbsolute = true;
			}

			if (needsAbsolute) {
				//make values optional
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
			var json = this.json,
				jsonSpreadsheet,
				rows,
				row,
				cell;

			if ((jsonSpreadsheet = json[sheetIndex]) === undefined) return;
			if ((rows = jsonSpreadsheet.rows) === undefined) return;
			if ((row = rows[rowIndex]) === undefined) return;
			if ((cell = row.columns[columnIndex]) === undefined) return;

			//null is faster in json, so here turn null into an object
			if (cell === null) {
				cell = row.columns[columnIndex] = {};
			}

			return cell;
		},
		jitCell: function(sheetIndex, rowIndex, columnIndex) {
			var jsonCell = this.getCell(sheetIndex, rowIndex, columnIndex);

			if (jsonCell === undefined) return null;

			if (jsonCell.getCell !== undefined) {
				return jsonCell.getCell();
			}

			var jitCell,
				i,
				id,
				max,
				value,
				cache,
				formula,
				parsedFormula,
				cellType,
				uneditable,
				dependency,
				dependencies,
				jsonDependency,
				hasId,
				hasValue,
				hasCache,
				hasFormula,
				hasParsedFormula,
				hasCellType,
				hasUneditable,
				hasDependencies;

			id = jsonCell['id'];
			value = jsonCell['value'];
			cache = jsonCell['cache'];
			formula = jsonCell['formula'];
			parsedFormula = jsonCell['parsedFormula'];
			cellType = jsonCell['cellType'];
			uneditable = jsonCell['uneditable'];
			dependencies = jsonCell['dependencies'];

			hasId = (id !== undefined && id !== null);
			hasValue = (value !== undefined && value !== null);
			hasCache = (cache !== undefined && cache !== null && (cache + '').length > 0);
			hasFormula = (formula !== undefined && formula !== null && formula !== '');
			hasParsedFormula = (parsedFormula !== undefined && parsedFormula !== null);
			hasCellType = (cellType !== undefined && cellType !== null);
			hasUneditable = (uneditable !== undefined && uneditable !== null);
			hasDependencies = (dependencies !== undefined && dependencies !== null);

			jitCell = new Sheet.Cell(sheetIndex, null, this.jS, this.handler);
			jitCell.rowIndex = rowIndex;
			jitCell.columnIndex = columnIndex;
			jitCell.loadedFrom = jsonCell;
			jitCell.loader = this;

			if (hasId) jitCell.id = id;

			if (hasFormula) jitCell.formula = formula;
			if (hasParsedFormula) jitCell.parsedFormula = parsedFormula;
			if (hasCellType) jitCell.cellType = cellType;
			if (hasUneditable) jitCell.uneditable = uneditable;


			if (hasValue) {
				jitCell.value = new String(value);
			}
			else {
				jitCell.value = new String();
			}

			if (hasCache) {
				jitCell.value.html = cache;
				jitCell.needsUpdated = false;
			} else {
				jitCell.needsUpdated = (hasFormula || hasCellType || jitCell.hasOperator.test(value));
			}

			if (hasDependencies) {
				max = dependencies.length;
				for (i = 0; i < max; i++) {
					jsonDependency = dependencies[i];
					dependency = this.jitCell(jsonDependency['s'], jsonDependency['r'], jsonDependency['c']);
					//dependency was found
					if (dependency !== null) {
						jitCell.dependencies.push(dependency);
					}

					//dependency was not found, so cache cannot be accurate, so reset it and remove all dependencies
					else {
						jitCell.dependencies = [];
						jsonCell['dependencies'] = [];
						jitCell.setNeedsUpdated(true);
						jitCell.value = new String();
					}
				}
			}

			jitCell.value.cell = jitCell;


			jsonCell.getCell = function() {
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
				json = this.json,
				sheetMax = (sheetIndex < 0 ? json.length - 1: sheetIndex + 1),
				sheet,
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
				sheet = json[sheetIndex];
				rows = sheet.rows;
				if (rows.length < 1) continue;
				rowIndex = 0;
				rowMax = rows.length;

				for (; rowIndex < rowMax; rowIndex++) {

					row = rows[rowIndex];
					columns = row.columns;
					columnIndex = 0;
					columnMax = columns.length;

					for (; columnIndex < columnMax; columnIndex++) {
						column = columns[columnIndex];

						if (column === null) continue;

						if (typeof column['id'] === 'string') {
							this.cellIds[column['id']] = {
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
			var json = this.json,
				jsonSpreadsheet;

			if ((jsonSpreadsheet = json[sheetIndex]) === undefined) return '';

			return jsonSpreadsheet.title || '';
		},
		hideRow: function(actionUI, rowIndex) {
			var json = actionUI.loadedFrom,
				metadata = json.metadata || (json.metadata = {}),
				hiddenRows = metadata.hiddenRows || (metadata.hiddenRows = []);

			if (hiddenRows.indexOf(rowIndex) < 0) {
				hiddenRows.push(rowIndex);
				hiddenRows.sort(function (a, b) { return a - b; });
			}

			return hiddenRows;
		},
		hideColumn: function(actionUI, columnIndex) {
			var json = actionUI.loadedFrom,
				metadata = json.metadata || (json.metadata = {}),
				hiddenColumns = metadata.hiddenColumns || (metadata.hiddenColumns = []);

			if (hiddenColumns.indexOf(columnIndex) < 0) {
				hiddenColumns.push(columnIndex);
				hiddenColumns.sort(function (a, b) { return a - b; });
			}

			return hiddenColumns;
		},
		showRow: function(actionUI, rowIndex) {
			var json = actionUI.loadedFrom,
				metadata = json.metadata || (json.metadata = {}),
				hiddenRows = metadata.hiddenRows || (metadata.hiddenRows = []),
				i;

			if ((i = hiddenRows.indexOf(rowIndex)) > -1) {
				hiddenRows.splice(i, 1);
			}

			return hiddenRows;
		},
		showColumn: function(actionUI, columnIndex) {
			var json = actionUI.loadedFrom,
				metadata = json.metadata || (json.metadata = {}),
				hiddenColumns = metadata.hiddenColumns || (metadata.hiddenColumns = []),
				i;

			if ((i = hiddenColumns.indexOf(columnIndex)) > -1) {
				hiddenColumns.splice(i, 1);
			}

			return hiddenColumns;
		},
		hiddenRows: function(actionUI) {
			var json = actionUI.loadedFrom,
				metadata = json.metadata || (json.metadata = {}),
				hiddenRows = metadata.hiddenRows || (metadata.hiddenRows = []),
				max = hiddenRows.length,
				result = [],
				i = 0;

			for (;i < max; i++) result.push(hiddenRows[i]);

			return result;
		},
		hiddenColumns: function(actionUI) {
			var json = actionUI.loadedFrom,
				metadata = json.metadata || (json.metadata = {}),
				hiddenColumns = metadata.hiddenColumns || (metadata.hiddenColumns = []),
				max = hiddenColumns.length,
				result = [],
				i = 0;

			for (;i < max; i++) result.push(hiddenColumns[i]);

			return result;
		},
		hasSpreadsheetAtIndex: function(index) {
			return (this.json[index] !== undefined);
		},
		getSpreadsheetIndexByTitle: function(title) {
			var json = this.json,
				max = this.count,
				i = 0,
				jsonTitle;

			title = title.toLowerCase();

			for(;i < max; i++) {
				if (json[i] !== undefined) {
					jsonTitle = json[i].title;
					if (jsonTitle !== undefined && jsonTitle !== null && jsonTitle.toLowerCase() == title) {
						return i;
					}
				}
			}

			return -1;
		},
		addSpreadsheet: function(jsonSpreadsheet, atIndex) {
			jsonSpreadsheet = jsonSpreadsheet || {};

			if (atIndex === undefined) {
				this.json.push(jsonSpreadsheet);
			} else {
				this.json.splice(atIndex, 0, jsonSpreadsheet);
			}
			this.count = this.json.length;
		},
		getCellAttribute: function(cell, attribute) {
			return cell[attribute];
		},
		setCellAttribute: function(cell, attribute, value) {
			cell[attribute] = value;
		},
		setCellAttributes: function(cell, attributes) {
			var i;
			for (i in attributes) if (i !== undefined && attributes.hasOwnProperty(i)) {
				cell[i] = attributes[i];
			}

			return this;
		},


		/**
		 *
		 * @param {Sheet.Cell} cell
		 */
		setDependencies: function(cell) {
			//TODO: need to handle the cell's cache that are dependent on this one so that it changes when it is in view
			//some cells just have a ridiculous amount of dependencies
			if (cell.dependencies.length > JSONLoader.maxStoredDependencies) {
				delete cell.loadedFrom['dependencies'];
				return this;
			}

			var i = 0,
				loadedFrom = cell.loadedFrom,
				dependencies = cell.dependencies,
				dependency,
				max = dependencies.length,
				jsonDependencies = loadedFrom['dependencies'] = [];

			for(;i<max;i++) {
				dependency = dependencies[i];
				jsonDependencies.push({
					s: dependency.sheetIndex,
					r: dependency.rowIndex,
					c: dependency.columnIndex
				});
			}

			return this;
		},

		addDependency: function(parentCell, dependencyCell) {
			var loadedFrom = parentCell.loadedFrom;

			if (loadedFrom.dependencies === undefined) {
				loadedFrom.dependencies = [];
			}

			loadedFrom.dependencies.push({
				s: dependencyCell.sheetIndex,
				r: dependencyCell.rowIndex,
				c: dependencyCell.columnIndex
			});

		    return this;
		},

		cycleCells: function(sheetIndex, fn) {
			var json = this.json,
				jsonSpreadsheet,
				rows,
				columns,
				jsonCell,
				row,
				rowIndex,
				columnIndex;

			if ((jsonSpreadsheet = json[sheetIndex]) === undefined) return;
			if ((rowIndex = (rows = jsonSpreadsheet.rows).length) < 1) return;
			if (rows[0].columns.length < 1) return;

			do
			{
				row = rows[rowIndex];
				columns = row.columns;
				columnIndex = columns.length - 1;
				do
				{
					jsonCell = columns[columnIndex];
					fn.call(jsonCell, sheetIndex, rowIndex, columnIndex);
				}
				while (columnIndex-- >= 0);
			}
			while (rowIndex-- >= 0);

			return this;
		},
		cycleCellsAll: function(fn) {
			var json = this.json,
				sheetIndex = json.length - 1;

			if (sheetIndex < 0) return;

			do
			{
				this.cycleCells(sheetIndex, fn);
			}
			while (sheetIndex-- > 0);

			return this;
		},
		/**
		 * Create a table from json
		 * @param {Array} json array of spreadsheets - schema:<pre>
		 * [{ // sheet 1, can repeat
		 *  "title": "Title of spreadsheet",
		 *  "metadata": {
		 *	  "widths": [
		 *		  120, //widths for each column, required
		 *		  80
		 *	  ]
		 *  },
		 *  "rows": [
		 *	  { // row 1, repeats for each column of the spreadsheet
		 *		  "height": 18, //optional
		 *		  "columns": [
		 *			  { //column A
		 *				  "cellType": "", //optional
		 *				  "class": "css classes", //optional
		 *				  "formula": "=cell formula", //optional
		 *				  "value": "value", //optional
		 *				  "style": "css cell style", //optional
		 *				  "uneditable": true, //optional
		 *				  "cache": "" //optional
		 *			  },
		 *			  {} //column B
		 *		  ]
		 *	  },
		 *	  { // row 2
		 *		  "height": 18, //optional
		 *		  "columns": [
		 *			  { // column A
		 *				  "cellType": "", //optional
		 *				  "class": "css classes", //optional
		 *				  "formula": "=cell formula", //optional
		 *				  "value": "value", //optional
		 *				  "style": "css cell style" //optional
		 *				  "uneditable": true, //optional
		 *				  "cache": "" //optional
		 *			  },
		 *			  {} // column B
		 *		  ]
		 *	  }
		 *  ]
		 * }]</pre>
		 * @returns {*|jQuery|HTMLElement} a simple html table
		 * @memberOf Sheet.JSONLoader
		 */
		toTables: function() {

			var json = this.json,
				max = this.count,
				tables = $([]),
				spreadsheet,
				rows,
				row,
				columns,
				column,
				metadata,
				widths,
				width,
				frozenAt,
				hiddenRows,
				hiddenColumns,
				height,
				table,
				colgroup,
				col,
				tr,
				td,
				i = 0,
				j,
				k;


			for (; i < max; i++) {
				spreadsheet = json[i];
				table = $(document.createElement('table'));
				if (spreadsheet['title']) table.attr('title', spreadsheet['title'] || '');

				tables = tables.add(table);

				rows = spreadsheet['rows'];
				for (j = 0; j < rows.length; j++) {
					row = rows[j];
					if (height = (row['height'] + '').replace('px','')) {
						tr = $(document.createElement('tr'))
							.attr('height', height)
							.css('height', height + 'px')
							.appendTo(table);
					}
					columns = row['columns'];
					for (k = 0; k < columns.length; k++) {
						column = columns[k];
						td = $(document.createElement('td'))
							.appendTo(tr);

						if (column['class']) td.attr('class', column['class'] || '');
						if (column['style']) td.attr('style', column['style'] || '');
						if (column['formula']) td.attr('data-formula', (column['formula'] ? '=' + column['formula'] : ''));
						if (column['cellType']) td.attr('data-celltype', column['cellType'] || '');
						if (column['value']) td.html(column['value'] || '');
						if (column['uneditable']) td.html(column['uneditable'] || '');
						if (column['rowspan']) td.attr('rowspan', column['rowspan'] || '');
						if (column['colspan']) td.attr('colspan', column['colspan'] || '');
						if (column['id']) td.attr('id', column['id'] || '');
						if (column['cache']) td.html(column['cache']);
					}
				}

				if (metadata = spreadsheet['metadata']) {
					if (widths = metadata['widths']) {
						colgroup = $(document.createElement('colgroup'))
							.prependTo(table);
						for(k = 0; k < widths.length; k++) {
							width = (widths[k] + '').replace('px', '');
							col = $(document.createElement('col'))
								.attr('width', width)
								.css('width', width + 'px')
								.appendTo(colgroup);
						}
					}
					if (frozenAt = metadata['frozenAt']) {
						if (frozenAt['row']) {
							table.attr('data-frozenatrow', frozenAt['row']);
						}
						if (frozenAt['col']) {
							table.attr('data-frozenatcol', frozenAt['col']);
						}
					}

					if (hiddenRows = metadata['hiddenRows']) {
						table.attr('data-hiddenrows', hiddenRows.join(','));
					}

					if (hiddenColumns = metadata['hiddenColumns']) {
						table.attr('data-hiddencolumns', hiddenColumns.join(','));
					}
				}
			}

			return tables;
		},

		/**
		 * Create json from jQuery.sheet Sheet instance
		 * @param {Boolean} [doNotTrim] cut down on added json by trimming to only edited area
		 * @returns {Array}  - schema:<pre>
		 * [{ // sheet 1, can repeat
				 *  "title": "Title of spreadsheet",
				 *  "metadata": {
				 *	  "widths": [
				 *		  "120px", //widths for each column, required
				 *		  "80px"
				 *	  ],
				 *	  "frozenAt": {row: 0, col: 0},
				 *	  "hiddenRows": [1,2,3],
				 *	  "hiddenColumns": [1,2,3]
				 *  },
				 *  "rows": [
				 *	  { // row 1, repeats for each column of the spreadsheet
				 *		  "height": "18px", //optional
				 *		  "columns": [
				 *			  { //column A
				 *				  "cellType": "", //optional
				 *				  "class": "css classes", //optional
				 *				  "formula": "=cell formula", //optional
				 *				  "value": "value", //optional
				 *				  "style": "css cell style", //optional
				 *				  "uneditable": false,  //optional
				 *				  "cache": "",  //optional
				 *				  "id": "" //optional
				 *			  },
				 *			  {} //column B
				 *		  ]
				 *	  },
				 *	  { // row 2
				 *		  "height": "18px", //optional
				 *		  "columns": [
				 *			  { // column A
				 *				  "cellType": "", //optional
				 *				  "class": "css classes", //optional
				 *				  "formula": "=cell formula", //optional
				 *				  "value": "value", //optional
				 *				  "style": "css cell style", //optional
				 *				  "uneditable": true, //optional
				 *				  "cache": "", //optional
				 *				  "id": "" //optional
				 *			  },
				 *			  {} // column B
				 *		  ]
				 *	  }
				 *  ]
				 * }]</pre>
		 * @memberOf Sheet.JSONLoader
		 */
		fromSheet: function(doNotTrim) {
			doNotTrim = (doNotTrim == undefined ? false : doNotTrim);

			var output = [],
				jS = this.jS,
				i = 1 * jS.i,
				pane,
				sheet = jS.spreadsheets.length - 1,
				jsonSpreadsheet,
				spreadsheet,
				row,
				column,
				parentAttr,
				jsonRow,
				jsonColumn,
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
				jsonSpreadsheet = {
					"title": (jS.obj.table().attr('title') || ''),
					"rows": [],
					"metadata": {
						"widths": [],
						"frozenAt": {
							"row": pane.actionUI.frozenAt.row,
							"col": pane.actionUI.frozenAt.col
						}
					}
				};

				output.unshift(jsonSpreadsheet);

				spreadsheet = jS.spreadsheets[sheet];
				row = spreadsheet.length - 1;
				do {
					parentEle = spreadsheet[row][1].td.parentNode;
					parentHeight = parentEle.style['height'];
					jsonRow = {
						"columns": [],
						"height": (parentHeight ? parentHeight.replace('px', '') : jS.s.colMargin)
					};

					column = spreadsheet[row].length - 1;
					do {
						cell = spreadsheet[row][column];
						jsonColumn = {};
						attr = cell.td.attributes;

						if (doNotTrim || rowHasValues || attr['class'] || cell['formula'] || cell['value'] || attr['style']) {
							rowHasValues = true;

							cl = (attr['class'] ? $.trim(
								(attr['class'].value || '')
									.replace(jS.cl.uiCellActive , '')
									.replace(jS.cl.uiCellHighlighted, '')
							) : '');

							parent = cell.td.parentNode;

							jsonRow.columns.unshift(jsonColumn);

							if (!jsonRow["height"]) {
								jsonRow["height"] = (parent.style['height'] ? parent.style['height'].replace('px' , '') : jS.s.colMargin);
							}

							if (cell['formula']) jsonColumn['formula'] = cell['formula'];
							if (cell['cellType']) jsonColumn['cellType'] = cell['cellType'];
							if (cell['value']) jsonColumn['value'] = cell['value'];
							if (cell['uneditable']) jsonColumn['uneditable'] = cell['uneditable'];
							if (cell['cache']) jsonColumn['cache'] = cell['cache'];
							if (cell['id']) jsonColumn['id'] = cell['id'];
							if (attr['style'] && attr['style'].value) jsonColumn['style'] = attr['style'].value;


							if (cl.length) {
								jsonColumn['class'] = cl;
							}
							if (attr['rowspan']) jsonColumn['rowspan'] = attr['rowspan'].value;
							if (attr['colspan']) jsonColumn['colspan'] = attr['colspan'].value;

							if (row * 1 == 1) {
								jsonSpreadsheet.metadata.widths.unshift($(jS.col(null, column)).css('width').replace('px', ''));
							}
						}
					} while (column-- > 1);

					if (rowHasValues) {
						jsonSpreadsheet.rows.unshift(jsonRow);
					}

				} while (row-- > 1);
			} while (sheet--);
			jS.i = i;

			return this.json = output;
		},
		type: JSONLoader,
		typeName: 'Sheet.JSONLoader',

		clearCaching: function() {
			var json = this.json,
				spreadsheet,
				row,
				rows,
				column,
				columns,
				sheetIndex = 0,
				rowIndex,
				columnIndex,
				sheetMax = json.length,
				rowMax,
				columnMax;

			for (;sheetIndex < sheetMax; sheetIndex++) {
				spreadsheet = json[sheetIndex];
				rows = spreadsheet['rows'];
				rowMax = rows.length;

				for (rowIndex = 0; rowIndex < rowMax; rowIndex++) {
					row = rows[rowIndex];
					columns = row['columns'];
					columnMax = columns.length;

					for (columnIndex = 0; columnIndex < columnMax; columnIndex++) {
						column = columns[columnIndex];

						if (column === null) continue;

						delete column['cache'];
						delete column['dependencies'];
						delete column['parsedFormula'];
					}
				}
			}

			return this;
		},

		/**
		 *
		 */
		download: function(rowSplitAt) {
			rowSplitAt = rowSplitAt || 500;

			var w = window.open(),
				d,
				entry,
				json = this.json,
				i = 0,
				max = json.length - 1,
				spreadsheet;


			//popup blockers
			if (w !== undefined) {
				d = w.document;
				d.write('<html>\
	<head id="head"></head>\
	<body>\
		<div id="entry">\
		</div>\
	</body>\
</html>');

				entry = $(d.getElementById('entry'));

				while (i <= max) {
					spreadsheet = json[i];

					//strategy: slice spreadsheet into parts so JSON doesn't get overloaded and bloated
					if (spreadsheet.rows.length > rowSplitAt) {
						var spreadsheetPart = {
								title: spreadsheet.title,
								metadata: spreadsheet.metadata,
								rows: []
							},
							rowParts = [],
							rowIndex = 0,
							row,
							rows = spreadsheet.rows,
							rowCount = rows.length,
							fileIndex = 1,
							setIndex = 0,
							addFile = function(json, index) {
								entry.append(document.createElement('br'));
								entry
									.append(
										$(document.createElement('a'))
											.attr('download', spreadsheet.title + '-part' + index +'.json')
											.attr('href', URL.createObjectURL(new Blob([JSON.stringify(json)], {type: "application/json"})))
											.text(spreadsheet.title + ' - part ' + index)
									);
							};

						addFile(spreadsheetPart, fileIndex);
						/*entry
							.append(
								document.createElement('br')
							)
							.append(
								$(document.createElement('a'))
									.attr('download', spreadsheet.title + '-part' + fileIndex +'.json')
									.attr('href', new Blob([JSON.stringify()], {type: "application/json"}))
									.text(spreadsheet.title + ' part:' + fileIndex)
							);*/

						while (rowIndex < rowCount) {
							if (setIndex === rowSplitAt) {
								setIndex = 0;
								fileIndex++;

								addFile(rowParts, fileIndex);

								rowParts = [];
							}
							rowParts.push(rows[rowIndex]);
							setIndex++;
							rowIndex++
						}

						if (rowParts.length > 0) {
							fileIndex++;
							addFile(rowParts, fileIndex);
						}
					}

					//strategy: stringify sheet and output
					else {
						entry
							.append(
								document.createElement('br')
							)
							.append(
								$(document.createElement('a'))
									.attr('download', spreadsheet.title + '.json')
									.attr('href', URL.createObjectURL(new Blob([JSON.stringify(spreadsheet)], {type: "application/json"})))
									.text(spreadsheet.title)
							);
					}
					i++;
				}


				d.close();
				w.focus();
			}
		}
	};

	JSONLoader.maxStoredDependencies = 100;

	return JSONLoader;
})(jQuery, document, String);
