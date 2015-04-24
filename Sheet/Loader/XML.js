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

;Sheet.Loader.XML = (function($, document) {
	"use strict";

	/**
	 *
	 * @param {String|jQuery|HTMLElement} xml - schema:<textarea disabled=disabled>
	 * <spreadsheets>
	 *	 <spreadsheet title="spreadsheet title">
	 *		 <metadata>
	 *			 <widths>
	 *				 <width>120</width>
	 *				 <width>80</width>
	 *			 </widths>
	 *			 <frozenAt>
	 *				 <row>0</row>
	 *				 <col>0</col>
	 *			 </frozenAt>
	 *		 </metadata>
	 *		 <rows>
	 *			 <row height=15>
	 *				  <columns>
	 *					  <column>
	 *						  <cellType></cellType>
	 *						  <formula>=cell formula</formula>
	 *						  <value>cell value</value>
	 *						  <style>cells style</style>
	 *						  <class>cells class</class>
	 *					  </column>
	 *					  <column></column>
	 *				  </columns>
	 *			  </row>
	 *			 <row height=15>
	 *				  <columns>
	 *					  <column>
	 *						  <cellType></cellType>
	 *						  <formula>=cell formula</formula>
	 *						  <value>cell value</value>
	 *						  <style>cells style</style>
	 *						  <class>cells class</class>
	 *					  </column>
	 *					  <column></column>
	 *				  </columns>
	 *			  </row>
	 *		 </rows>
	 *	 </spreadsheet>
	 * </spreadsheets></textarea>
	 */
	function Constructor(xml) {
		if (xml !== undefined) {
			this.xml = $.parseXML(xml);
			this.spreadsheets = this.xml.getElementsByTagName('spreadsheets')[0].getElementsByTagName('spreadsheet');
			this.count = this.xml.length;
		} else {
			this.xml = null;
			this.spreadsheets = null;
			this.count = 0;
		}
	}

	Constructor.prototype = {
		size: function(spreadsheetIndex) {
			var xmlSpreadsheet = this.xml[spreadsheetIndex],
				rows = xmlSpreadsheet.rows,
				firstRow = rows[0],
				firstRowColumns = firstRow.columns;

			return {
				rows: rows.length,
				cols: firstRowColumns.length
			};
		},
		setWidth: function(sheetIndex, columnIndex, colElement) {
			var spreadsheets = this.spreadsheets,
				xmlSpreadsheet = spreadsheets[sheetIndex],
				metadata = xmlSpreadsheet.getElementsByTagName('metadata')[0] || {},
				widths = metadata.getElementsByTagName('width') || [],
				widthElement = widths[columnIndex],
				width = (widthElement.textContent || widthElement.text);

			colElement.style.width = width + 'px';
		},
		setRowHeight: function(sheetIndex, rowIndex, barTd) {
			var spreadsheets = this.spreadsheets,
				xmlSpreadsheet,
				rows,
				row,
				height;

			if ((xmlSpreadsheet = spreadsheets[sheetIndex]) === undefined) return;
			if ((rows = xmlSpreadsheet.getElementsByTagName('rows')[0].getElementsByTagName('row')) === undefined) return;
			if ((row = rows[rowIndex]) === undefined) return;
			if ((height = row.attributes['height'].nodeValue) === undefined) return;

			barTd.style.height = height + 'px';
		},
		setupCell: function(sheetIndex, rowIndex, columnIndex, blankCell, blankTd) {
			var spreadsheets = this.spreadsheets,
				xmlSpreadsheet,
				row,
				cell,
				jitCell;

			if ((xmlSpreadsheet = spreadsheets[sheetIndex]) === undefined) return false;
			if ((row = xmlSpreadsheet.getElementsByTagName('rows')[0].getElementsByTagName('row')[rowIndex - 1]) === undefined) return false;
			if ((cell = row.getElementsByTagName('columns')[0].getElementsByTagName('column')[columnIndex - 1]) === undefined) return false;

			blankCell.cellType = cell.attributes['cellType'].nodeValue || '';

			if ((jitCell = cell.jitCell) !== undefined) {
				blankCell.html = jitCell.html;
				blankCell.state = jitCell.state;
				blankCell.cellType = jitCell.cellType;
				blankCell.value = jitCell.value;
				blankCell.uneditable = jitCell.uneditable;
				blankCell.sheet = jitCell.sheet;
				blankCell.dependencies = jitCell.dependencies;
			}

			if (cell.attributes['formula']) {
				blankCell.formula = cell.attributes['formula'].nodeValue || '';
				blankTd.setAttribute('data-formula', cell.attributes['formula'].nodeValue || '');
			} else {
				blankTd.innerHTML = blankCell.value = cell.attributes['value'].nodeValue || '';
			}

			blankTd.className = cell.attributes['class'].nodeValue || '';
			blankTd.setAttribute('style', cell.attributes['style'].nodeValue || '');

			if (cell.attributes['rowspan']) blankTd.setAttribute('rowspan', cell.attributes['rowspan'].nodeValue || '');
			if (cell.attributes['colspan']) blankTd.setAttribute('colspan', cell.attributes['colspan'].nodeValue || '');

			return true;
		},
		getCell: function(sheetIndex, rowIndex, columnIndex) {
			//TODO
			return null;
		},
		jitCell: function(sheetIndex, rowIndex, columnIndex) {
			var spreadsheets = this.spreadsheets,
				xmlSpreadsheet,
				row,
				cell;

			if ((xmlSpreadsheet = spreadsheets[sheetIndex]) === undefined) return false;
			if ((row = xmlSpreadsheet.getElementsByTagName('rows')[0].getElementsByTagName('row')[rowIndex - 1]) === undefined) return false;
			if ((cell = row.getElementsByTagName('columns')[0].getElementsByTagName('column')[columnIndex - 1]) === undefined) return false;

			return {
				td: {
					cellIndex: columnIndex,
					parentNode:{
						rowIndex: rowIndex
					},
					html: function() {}
				},
				html: [],
				state: [],
				cellType: cell.attributes['cellType'].nodeValue || '',
				formula: cell.attributes['formula'].nodeValue || '',
				value: cell.attributes['value'].nodeValue || '',
				type: 'cell',
				sheet: sheetIndex,
				id: null
			}
		},
		title: function(sheetIndex) {
			var spreadsheets = this.spreadsheets,
				spreadsheet;

			if ((spreadsheet = spreadsheets[sheetIndex]) === undefined) return '';

			return (spreadsheet.attributes['title'] ? spreadsheet.attributes['title'].nodeValue : '');
		},
		getSpreadsheetIndexByTitle: function(title) {
			//TODO
		},
		addSpreadsheet: function(xmlSpreadsheet, atIndex) {
			//TODO
			if (atIndex === undefined) {
				this.spreadsheets.append.push(jsonSpreadsheet);
			} else {
				this.json.splice(atIndex, 0, jsonSpreadsheet);
			}
			this.count = this.json.length;
		},
		setCellAttribute: function(cell, attribute, value) {
			//TODO
		},
		/**
		 * @returns {*|jQuery|HTMLElement} a simple html table
		 * @memberOf Sheet.XMLLoader
		 */
		toTables: function() {
			var xml = this.xml,
				tables = $([]),
				spreadsheets = xml.getElementsByTagName('spreadsheets')[0].getElementsByTagName('spreadsheet'),
				spreadsheet,
				rows,
				row,
				columns,
				column,
				attr,
				metadata,
				frozenat,
				frozenatrow,
				frozenatcol,
				widths,
				width,
				height;

			for (var i = 0; i < spreadsheets.length; i++) {
				spreadsheet = spreadsheets[i];
				var table = $(document.createElement('table')).attr('title', (spreadsheet.attributes['title'] ? spreadsheet.attributes['title'].nodeValue : '')),
					colgroup = $(document.createElement('colgroup')).appendTo(table),
					tbody = $(document.createElement('tbody')).appendTo(table);

				tables = tables.add(table);

				rows = spreadsheet.getElementsByTagName('rows')[0].getElementsByTagName('row');
				metadata = spreadsheet.getElementsByTagName('metadata')[0];

				for (var l = 0; l < rows.length; l++) {//row
					row = rows[l];
					var tr = $(document.createElement('tr')).appendTo(tbody);

					if (height = row.attributes['height']) {
						height = (height.nodeValue || '').replace('px','');
						tr
							.css('height', height)
							.attr('height', height + 'px');
					}

					columns = row.getElementsByTagName('columns')[0].getElementsByTagName('column');
					for (var m = 0; m < columns.length; m++) {
						column = columns[m];
						var td = $(document.createElement('td')).appendTo(tr),
							formula = column.getElementsByTagName('formula')[0],
							cellType = column.getElementsByTagName('cellType')[0],
							value = column.getElementsByTagName('value')[0],
							style = column.getElementsByTagName('style')[0],
							cl = column.getElementsByTagName('class')[0],
							rowspan = column.getElementsByTagName('rowspan')[0],
							colspan = column.getElementsByTagName('colspan')[0],
							id = column.getElementsByTagName('id')[0];

						if (formula) td.attr('data-formula', '=' + (formula.textContent || formula.text));
						if (cellType) td.attr('data-celltype', cellType.textContent || cellType.text);
						if (value) td.html(value.textContent || value.text);
						if (style) td.attr('style', style.textContent || style.text);
						if (cl) td.attr('class', cl.textContent || cl.text);
						if (rowspan) td.attr('rowspan', rowspan.textContent || rowspan.text);
						if (colspan) td.attr('colspan', colspan.textContent || colspan.text);
						if (id) td.attr('id', id.textContent || id.text);
					}
				}

				widths = metadata.getElementsByTagName('width');
				for (var l = 0; l < widths.length; l++) {
					width = (widths[l].textContent || widths[l].text).replace('px', '');
					$(document.createElement('col'))
						.attr('width', width)
						.css('width', width + 'px')
						.appendTo(colgroup);
				}

				frozenat = metadata.getElementsByTagName('frozenAt')[0];
				if (frozenat) {
					frozenatcol = frozenat.getElementsByTagName('col')[0];
					frozenatrow = frozenat.getElementsByTagName('row')[0];

					if (frozenatcol) table.attr('data-frozenatcol', (frozenatcol.textContent || frozenatcol.text) * 1);
					if (frozenatrow) table.attr('data-frozenatrow', (frozenatrow.textContent || frozenatrow.text) * 1);
				}
			}
			return tables;
		},

		/**
		 * Create xml from jQuery.sheet Sheet instance
		 * @param {Object} jS the jQuery.sheet instance
		 * @param {Boolean} [doNotTrim] cut down on added json by trimming to only edited area
		 * @param {Boolean} [doNotParse] skips turning the created xml string back into xml
		 * @returns {String} - schema:<textarea disabled=disabled>
		 * <spreadsheets>
		 *	 <spreadsheet title="spreadsheet title">
		 *		 <metadata>
		 *			 <widths>
		 *				 <width>120px</width>
		 *				 <width>80px</width>
		 *			 </widths>
		 *		 </metadata>
		 *		 <rows>
		 *			 <row height="15px">
		 *				  <columns>
		 *					  <column>
		 *						  <cellType></cellType>
		 *						  <formula>=cell formula</formula>
		 *						  <value>cell value</value>
		 *						  <style>cells style</style>
		 *						  <class>cells class</class>
		 *					  </column>
		 *					  <column></column>
		 *				  </columns>
		 *			  </row>
		 *			 <row height="15px">
		 *				  <columns>
		 *					  <column>
		 *						  <cellType></cellType>
		 *						  <formula>=cell formula</formula>
		 *						  <value>cell value</value>
		 *						  <style>cells style</style>
		 *						  <class>cells class</class>
		 *					  </column>
		 *					  <column></column>
		 *				  </columns>
		 *			  </row>
		 *		 </rows>
		 *	 </spreadsheet>
		 * </spreadsheets></textarea>
		 * @memberOf Sheet.XMLLoader
		 */
		fromSheet: function(jS, doNotTrim, doNotParse) {
			doNotTrim = (doNotTrim == undefined ? false : doNotTrim);
			var output = '',
				i = 1 * jS.i,
				sheet = jS.spreadsheets.length - 1,
				xmlSpreadsheet,
				spreadsheet,
				row,
				column,
				parentAttr,
				xmlRow,
				xmlColumn,
				xmlColumns,
				cell,
				attr,
				cl,
				parent,
				frozenAt,
				rowHasValues,
				widths,
				parentEle,
				parentHeight;

			if (sheet < 0) return output;

			do {
				rowHasValues = false;
				jS.i = sheet;
				jS.evt.cellEditDone();
				frozenAt = $.extend({}, jS.obj.pane().actionUI.frozenAt);
				widths = [];

				spreadsheet = jS.spreadsheets[sheet];
				row = spreadsheet.length - 1;
				xmlRow = '';
				do {
					xmlColumns = '';
					column = spreadsheet[row].length - 1;
					do {
						xmlColumn = '';
						cell = spreadsheet[row][column];
						attr = cell.td[0].attributes;
						cl = (attr['class'] ? $.trim(
							(attr['class'].value || '')
								.replace(jS.cl.uiCellActive, '')
								.replace(jS.cl.uiCellHighlighted, '')
						) : '');

						if (doNotTrim || rowHasValues || cl || cell.formula || cell.value || attr['style']) {
							rowHasValues = true;

							xmlColumn += '<column>';

							if (cell.formula) xmlColumn += '<formula>' + cell.formula + '</formula>';
							if (cell.cellType) xmlColumn += '<cellType>' + cell.cellType + '</cellType>';
							if (cell.value) xmlColumn += '<value>' + cell.value + '</value>';
							if (attr['style']) xmlColumn += '<style>' + attr['style'].value + '</style>';
							if (cl) xmlColumn += '<class>' + cl + '</class>';
							if (attr['rowspan']) xmlColumn += '<rowspan>' + attr['rowspan'].value + '</rowspan>';
							if (attr['colspan']) xmlColumn += '<colspan>' + attr['colspan'].value + '</colspan>';
							if (attr['id']) xmlColumn += '<id>' + attr['id'].value + '</id>';

							xmlColumn += '</column>';

							xmlColumns = xmlColumn + xmlColumns;

							if (row * 1 == 1) {
								widths[column] = '<width>' + $(jS.col(null, column)).css('width').replace('px', '') + '</width>';
							}
						}

					} while (column -- > 1);

					if (xmlColumns) {
						parentEle = spreadsheet[row][1].td[0].parentNode;
						parentHeight = parentEle.style['height'];
						xmlRow = '<row height="' + (parentHeight ? parentHeight.replace('px', '') : jS.s.colMargin) + '">' +
							'<columns>' +
							xmlColumns +
							'</columns>' +
							'</row>' + xmlRow;
					}

				} while (row-- > 1);
				xmlSpreadsheet = '<spreadsheet title="' + (jS.obj.table().attr('title') || '') + '">' +
					'<rows>' +
					xmlRow +
					'</rows>' +
					'<metadata>' +
					(
						frozenAt.row || frozenAt.col ?
							'<frozenAt>' +
								(frozenAt.row ? '<row>' + frozenAt.row + '</row>' : '') +
								(frozenAt.col ? '<col>' + frozenAt.col + '</col>' : '') +
								'</frozenAt>' :
							''
						) +
					'<widths>' + widths.join('') + '</widths>' +
					'</metadata>' +
					'</spreadsheet>';

				output = xmlSpreadsheet + output;
			} while (sheet--);

			jS.i = i;

			output = '<?xml version="1.0" encoding="UTF-8"?><spreadsheets xmlns="http://www.w3.org/1999/xhtml">' + output + '</spreadsheets>';

			if (doNotParse !== true) {
				this.xml = $.parseXML(output);
			}

			return output;
		},
		type: Constructor,
		typeName: 'Sheet.XMLLoader'
	};

	return Constructor;
})(jQuery, document);
