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

;Sheet.JSONLoader = (function($, document, String) {
	"use strict";
	function Constructor(json) {
		if (json !== undefined) {
			this.json = json;
			this.count = json.length;
		} else {
			this.json = [];
			this.count = 0;
		}
	}

	Constructor.prototype = {
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

			return width;
		},
		getHeight: function(sheetIndex, rowIndex) {
			var json = this.json,
				jsonSpreadsheet = json[sheetIndex] || {},
				rows = jsonSpreadsheet.rows || [],
				row = rows[rowIndex] || {},
				height = row.height || Sheet.defaultRowHeight;

			return height;
		},
		isHidden: function(sheetIndex) {
			var json = this.json,
				jsonSpreadsheet = json[sheetIndex] || {},
				metadata = jsonSpreadsheet.metadata || {};

			return metadata.hidden === true;
		},
		setMetadata: function(sheetIndex, metadata) {
			var json = this.json,
				jsonSpreadsheet = json[sheetIndex] || {},
				jsonMetadata = jsonSpreadsheet.metadata || (jsonSpreadsheet.metadata = {});

			var i;
			for (i in metadata) if (metadata.hasOwnProperty(i)) {
				jsonMetadata[i] = metadata[i];
			}

			return this;
		},
		setupCell: function(sheetIndex, rowIndex, columnIndex, jS) {
			var td = document.createElement('td'),
				cell = this.jitCell(sheetIndex, rowIndex, columnIndex, jS, jS.cellHandler),
				jsonCell,
				html;

			if (cell === null) return cell;
			jsonCell = cell.loadedFrom;
			if (jsonCell === null) return null;


			if (cell.hasOwnProperty('formula')) {
				td.setAttribute('data-formula', cell['formula'] || '');
				if (cell.hasOwnProperty('value') && cell.value !== null) {
					html = cell.value.hasOwnProperty('html') ? cell.value.html : cell.value;
					switch (typeof html) {
						case 'object':
							if (html.appendChild !== undefined) {
								td.appendChild(html);
								break;
							}
						case 'string':
						default:
							td.innerHTML = html;
							break;
					}
				}
				if (jsonCell.hasOwnProperty('cache')) {
					td.innerHTML = jsonCell['cache'];
				}
			} else if (jsonCell['cellType'] !== undefined) {
				td.setAttribute('data-celltype', jsonCell['cellType']);
				cell.cellType = jsonCell['cellType'];
				if (jsonCell.hasOwnProperty('cache')) {
					td.innerHTML = jsonCell['cache'];
				}
			}
			else {
				td.innerHTML = cell['value'];
			}


			if (jsonCell['class'] !== undefined) td.className = jsonCell['class'];
			if (jsonCell['style'] !== undefined) td.setAttribute('style', jsonCell['style']);
			if (jsonCell['rowspan'] !== undefined) td.setAttribute('rowspan', jsonCell['rowspan']);
			if (jsonCell['colspan'] !== undefined) td.setAttribute('colspan', jsonCell['colspan']);
			if (jsonCell['uneditable'] !== undefined) td.setAttribute('data-uneditable', jsonCell['uneditable']);

			if (jsonCell['id'] !== undefined) {
				td.setAttribute('id', jsonCell['id']);
				cell.id = jsonCell['id'];
			}

			td.jSCell = cell;
			cell.td = td;
			cell.sheetIndex = sheetIndex;
			cell.rowIndex = rowIndex;
			cell.columnIndex = columnIndex;

			return cell;
		},
		getCell: function(sheetIndex, rowIndex, columnIndex) {
			var json = this.json,
				jsonSpreadsheet,
				rows,
				row,
				cell;

			if ((jsonSpreadsheet = json[sheetIndex]) === undefined) return null;
			if ((rows = jsonSpreadsheet.rows) === undefined) return null;
			if ((row = rows[rowIndex - 1]) === undefined) return null;
			if ((cell = row.columns[columnIndex - 1]) === undefined) return null;

			return cell;
		},
		jitCell: function(sheetIndex, rowIndex, columnIndex, jS, cellHandler) {
			var jsonCell = this.getCell(sheetIndex, rowIndex, columnIndex);

			if (jsonCell === null) return null;

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
				cellType,
				uneditable,
				dependency,
				dependencies,
				jsonDependency,
				hasId,
				hasTd,
				hasValue,
				hasCache,
				hasFormula,
				hasCellType,
				hasUneditable,
				hasDependencies;

			id = jsonCell['id'];
			value = jsonCell['value'];
			cache = jsonCell['cache'];
			formula = jsonCell['formula'];
			cellType = jsonCell['cellType'];
			uneditable = jsonCell['uneditable'];
			dependencies = jsonCell['dependencies'];

			hasId = (id !== undefined && id !== null);
			hasValue = (value !== undefined && value !== null);
			hasCache = (cache !== undefined && cache !== null && cache !== '');
			hasFormula = (formula !== undefined && formula !== null);
			hasCellType = (cellType !== undefined && cellType !== null);
			hasUneditable = (uneditable !== undefined && uneditable !== null);
			hasDependencies = (dependencies !== undefined && dependencies !== null);

			jitCell = new Sheet.Cell(sheetIndex, null, jS, cellHandler);
			jitCell.rowIndex = rowIndex;
			jitCell.columnIndex = columnIndex;
			jitCell.loadedFrom = jsonCell;
			jitCell.loader = this;

			if (hasId) jitCell.id = id;

			if (hasCache) {
				jitCell.html = cache;
				jitCell.needsUpdated = false;
			} else {
				jitCell.needsUpdated = (hasFormula || hasCellType || jitCell.hasOperator.test(value));
			}

			if (hasFormula) jitCell.formula = formula;
			if (hasCellType) jitCell.cellType = cellType;
			if (hasUneditable) jitCell.uneditable = uneditable;


			if (hasValue) {
				jitCell.value = new String(value);
			}
			else {
				jitCell.value = new String();
			}

			if (hasDependencies) {
				max = dependencies.length;
				for (i = 0; i < max; i++) {
					jsonDependency = dependencies[i];
					dependency = this.jitCell(jsonDependency['sheet'], jsonDependency['row'], jsonDependency['column'], jS, cellHandler);
					if (dependency !== null) {
						jitCell.dependencies.push(dependency);
					}
				}
			}

			jitCell.value.cell = jitCell;


			jsonCell.getCell = function() {
				return jitCell;
			};

			return jitCell;
		},
		title: function(sheetIndex) {
			var json = this.json,
				jsonSpreadsheet;

			if ((jsonSpreadsheet = json[sheetIndex]) === undefined) return '';

			return jsonSpreadsheet.title || '';
		},
		hiddenRows: function(sheetIndex) {
			var metadata = this.json[sheetIndex].metadata || {},
				jsonHiddenRows = metadata.hiddenRows || [],
				max = jsonHiddenRows.length,
				result = [],
				i = 0;

			for (;i < max; i++) result.push(jsonHiddenRows[i]);

			return result;
		},
		hiddenColumns: function(sheetIndex) {
			var metadata = this.json[sheetIndex].metadata || {},
				jsonHiddenColumns = metadata.hiddenColumns || [],
				max = jsonHiddenColumns.length,
				result = [],
				i = 0;

			for (;i < max; i++) result.push(jsonHiddenColumns[i]);

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
				jsonTitle = json[i].title;
				if (jsonTitle !== undefined && jsonTitle !== null && jsonTitle.toLowerCase() == title) {
					return i;
				}
			}

			return -1;
		},
		addSpreadsheet: function(jsonSpreadsheet, atIndex) {
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
			for (i in attributes) {
				if (attributes.hasOwnProperty(i)) {
					cell[i] = attributes[i];
				}
			}

			return this;
		},


		/**
		 *
		 * @param {Sheet.Cell} cell
		 */
		setDependencies: function(cell) {
			var i = 0,
				loadedFrom = cell.loadedFrom,
				dependencies = cell.dependencies,
				dependency,
				max = dependencies.length,
				jsonDependencies = loadedFrom.dependencies = [];

			for(;i<max;i++) {
				dependency = dependencies[i];
				jsonDependencies.push({
					sheet: dependency.sheetIndex,
					row: dependency.rowIndex,
					column: dependency.columnIndex
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
				sheet: dependencyCell.sheetIndex,
				row: dependencyCell.rowIndex,
				column: dependencyCell.columnIndex
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

			rowIndex--;
			do
			{
				row = rows[rowIndex];
				columns = row.columns;
				columnIndex = columns.length - 1;
				do
				{
					jsonCell = columns[columnIndex];
					fn.call(jsonCell, sheetIndex, rowIndex + 1, columnIndex + 1);
				}
				while (columnIndex-- > 0);
			}
			while (rowIndex-- > 0);

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
		 * @param {Object} jS required, the jQuery.sheet instance
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
		fromSheet: function(jS, doNotTrim) {
			doNotTrim = (doNotTrim == undefined ? false : doNotTrim);

			var output = [],
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
					parentEle = spreadsheet[row][1].td[0].parentNode;
					parentHeight = parentEle.style['height'];
					jsonRow = {
						"columns": [],
						"height": (parentHeight ? parentHeight.replace('px', '') : jS.s.colMargin)
					};

					column = spreadsheet[row].length - 1;
					do {
						cell = spreadsheet[row][column];
						jsonColumn = {};
						attr = cell.td[0].attributes;

						if (doNotTrim || rowHasValues || attr['class'] || cell['formula'] || cell['value'] || attr['style']) {
							rowHasValues = true;

							cl = (attr['class'] ? $.trim(
								(attr['class'].value || '')
									.replace(jS.cl.uiCellActive , '')
									.replace(jS.cl.uiCellHighlighted, '')
							) : '');

							parent = cell.td[0].parentNode;

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
		type: Constructor,
		typeName: 'Sheet.JSONLoader'
	};

	return Constructor;
})(jQuery, document, String);
