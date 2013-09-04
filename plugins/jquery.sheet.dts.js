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

(function($, doc) {
	/**
	 * @namespace
	 * @memberOf jQuery.sheet
	 */
	jQuery.sheet.dts = {
		/**
		 * @memberOf jQuery.sheet.dts
		 * @namespace
		 */
		toTables: {

			/**
			 * Create a table from json
			 * @param {Array} json array of spreadsheets - schema:
			 * [{ // sheet 1, can repeat
			 *  "title": "Title of spreadsheet",
			 *  "metadata": {
			 *      "widths": [
			 *          "120px", //widths for each column, required
			 *          "80px"
			 *      ]
			 *  },
			 *  "rows": [
			 *      { // row 1, repeats for each column of the spreadsheet
			 *          "height": "18px", //optional
			 *          "columns": [
			 *              { //column A
			 *                  "class": "css classes", //optional
			 *                  "formula": "=cell formula", //optional
			 *                  "value": "value", //optional
			 *                  "style": "css cell style" //optional
			 *              },
			 *              {} //column B
			 *          ]
			 *      },
			 *      { // row 2
			 *          "height": "18px", //optional
			 *          "columns": [
			 *              { // column A
			 *                  "class": "css classes", //optional
			 *                  "formula": "=cell formula", //optional
			 *                  "value": "value", //optional
			 *                  "style": "css cell style" //optional
			 *              },
			 *              {} // column B
			 *          ]
			 *      }
			 *  ]
			 * }]
			 * @returns {*|jQuery|HTMLElement} a simple html table
			 * @memberOf jQuery.sheet.dts.toTables
			 */
			json: function(json) {

				var tables = $([]),
					spreadsheet,
					rows,
					row,
					columns,
					column,
					metadata,
					widths,
					width,
					frozenAt,
					height;

				for (var i = 0; i < json.length; i++) {
					spreadsheet = json[i];
					var table = $(doc.createElement('table'));
					if (spreadsheet['title']) table.attr('title', spreadsheet['title'] || '');

					tables = tables.add(table);

					rows = spreadsheet['rows'];
					for (var j = 0; j < rows.length; j++) {
						row = rows[j];
						if (height = (row['height'] + '').replace('px','')) {
							var tr = $(doc.createElement('tr'))
								.attr('height', height)
								.css('height', height + 'px')
								.appendTo(table);
						}
						columns = row['columns'];
						for (var k = 0; k < columns.length; k++) {
							column = columns[k];
							var td = $(doc.createElement('td'))
								.appendTo(tr);

							if (column['class']) td.attr('class', column['class'] || '');
							if (column['style']) td.attr('style', column['style'] || '');
							if (column['formula']) td.attr('data-formula', (column['formula'] ? '=' + column['formula'] : ''));
							if (column['cellType']) td.attr('data-celltype', column['cellType'] || '');
							if (column['value']) td.html(column['value'] || '');
						}
					}

					if (metadata = spreadsheet['metadata']) {
						if (widths = metadata['widths']) {
							var colgroup = $(doc.createElement('colgroup'))
								.prependTo(table);
							for(var k = 0; k < widths.length; k++) {
								width = (widths[k] + '').replace('px', '');
								var col = $(doc.createElement('col'))
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
					}
				}

				return tables;
			},

			/**
			 *
			 * @param {String|jQuery|HTMLElement} xml - schema:
			 * &lt;spreadsheets&gt;
			 *     &lt;spreadsheet title="spreadsheet title"&gt;
			 *         &lt;metadata&gt;
			 *             &lt;widths&gt;
			 *                 &lt;width&gt;120px&lt;/width&gt;
			 *                 &lt;width&gt;80px&lt;/width&gt;
			 *             &lt;/widths&gt;
			 *         &lt;/metadata&gt;
			 *         &lt;rows&gt;
			 *             &lt;row height="15px"&gt;
			 *                  &lt;columns&gt;
			 *                      &lt;column&gt;
			 *                          &lt;formula&gt;=cell formula&lt;/formula&gt;
			 *                          &lt;value&gt;cell value&lt;/value&gt;
			 *                          &lt;style&gt;cells style&lt;/style&gt;
			 *                          &lt;class&gt;cells class&lt;/class&gt;
			 *                      &lt;/column&gt;
			 *                      &lt;column&gt;&lt;/column&gt;
			 *                  &lt;/columns&gt;
			 *              &lt;/row&gt;
			 *             &lt;row height="15px"&gt;
			 *                  &lt;columns&gt;
			 *                      &lt;column&gt;
			 *                          &lt;formula&gt;=cell formula&lt;/formula&gt;
			 *                          &lt;value&gt;cell value&lt;/value&gt;
			 *                          &lt;style&gt;cells style&lt;/style&gt;
			 *                          &lt;class&gt;cells class&lt;/class&gt;
			 *                      &lt;/column&gt;
			 *                      &lt;column&gt;&lt;/column&gt;
			 *                  &lt;/columns&gt;
			 *              &lt;/row&gt;
			 *         &lt;/rows&gt;
			 *     &lt;/spreadsheet&gt;
			 * &lt;/spreadsheets&gt;
			 * @returns {*|jQuery|HTMLElement} a simple html table
			 * @memberOf jQuery.sheet.dts.toTables
			 */
			xml: function(xml) {
				xml = $.parseXML(xml);

				var tables = $([]),
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
					var table = $(doc.createElement('table')).attr('title', (spreadsheet.attributes['title'] ? spreadsheet.attributes['title'].nodeValue : '')),
						colgroup = $(doc.createElement('colgroup')).appendTo(table),
						tbody = $(doc.createElement('tbody')).appendTo(table);

					tables = tables.add(table);

					rows = spreadsheet.getElementsByTagName('rows')[0].getElementsByTagName('row');
					metadata = spreadsheet.getElementsByTagName('metadata')[0];

					for (var l = 0; l < rows.length; l++) {//row
						row = rows[l];
						var tr = $(doc.createElement('tr')).appendTo(tbody);

						if (height = row.attributes['height']) {
							height = (height.nodeValue || '').replace('px','');
							tr
								.css('height', height)
								.attr('height', height + 'px');
						}

						columns = row.getElementsByTagName('columns')[0].getElementsByTagName('column');
						for (var m = 0; m < columns.length; m++) {
							column = columns[m];
							var td = $(doc.createElement('td')).appendTo(tr),
								formula = column.getElementsByTagName('formula')[0],
								cellType = column.getElementsByTagName('cellType')[0],
								value = column.getElementsByTagName('value')[0],
								style = column.getElementsByTagName('style')[0],
								cl = column.getElementsByTagName('class')[0];

							if (formula) td.attr('data-formula', '=' + (formula.textContent || formula.text));
                            if (cellType) td.attr('data-celltype', cellType.textContent || cellType.text);
							if (value) td.html(value.textContent || value.text);
							if (style) td.attr('style', style.textContent || style.text);
							if (cl) td.attr('class', cl.textContent || cl.text);
						}
					}

					widths = metadata.getElementsByTagName('width');
					for (var l = 0; l < widths.length; l++) {
						width = (widths[l].textContent || widths[l].text).replace('px', '');
						$(doc.createElement('col'))
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
			}
		},

		/**
		 * @namespace
		 * @memberOf jQuery.sheet.dts
		 */
		fromTables: {
			/**
			 * Create a table from json
			 * @param {Object} jS required, the jQuery.sheet instance
			 * @param {Boolean} [doNotTrim] cut down on added json by trimming to only edited area
			 * @returns {Array}  - schema:
			 * [{ // sheet 1, can repeat
			 *  "title": "Title of spreadsheet",
			 *  "metadata": {
			 *      "widths": [
			 *          "120px", //widths for each column, required
			 *          "80px"
			 *      ]
			 *  },
			 *  "rows": [
			 *      { // row 1, repeats for each column of the spreadsheet
			 *          "height": "18px", //optional
			 *          "columns": [
			 *              { //column A
			 *                  "class": "css classes", //optional
			 *                  "formula": "=cell formula", //optional
			 *                  "value": "value", //optional
			 *                  "style": "css cell style" //optional
			 *              },
			 *              {} //column B
			 *          ]
			 *      },
			 *      { // row 2
			 *          "height": "18px", //optional
			 *          "columns": [
			 *              { // column A
			 *                  "class": "css classes", //optional
			 *                  "formula": "=cell formula", //optional
			 *                  "value": "value", //optional
			 *                  "style": "css cell style" //optional
			 *              },
			 *              {} // column B
			 *          ]
			 *      }
			 *  ]
			 * }]
			 * @memberOf jQuery.sheet.dts.fromTables
			 */
			json: function(jS, doNotTrim) {
				doNotTrim = (doNotTrim == undefined ? false : doNotTrim);

				var output = [],
					i = 1 * jS.i,
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
					rowHasValues;


				if (sheet < 0) return output;

				do {
					rowHasValues = false;
					jS.i = sheet;
					jS.evt.cellEditDone();
					jsonSpreadsheet = {
						"title": (jS.obj.table().attr('title') || ''),
						"rows": [],
						"metadata": {
							"widths": [],
							"frozenAt": $.extend({}, jS.frozenAt())
						}
					};

					output.unshift(jsonSpreadsheet);

					spreadsheet = jS.spreadsheets[sheet];
					row = spreadsheet.length - 1;
					do {
						parentAttr = spreadsheet[row][1].td[0].parentNode.attributes;
						jsonRow = {
							"height": null,
							"columns": [],
							"height": (parentAttr['height'] ? parentAttr['height'].value.replace('px', '') : jS.s.colMargin)
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
									jsonRow["height"] = (parent.attributes['height'] ? parent.attributes['height'].value.replace('px' , '') : jS.s.colMargin);
								}

								if (cell['formula']) jsonColumn['formula'] = cell['formula'];
                                if (cell['cellType']) jsonColumn['cellType'] = cell['cellType'];
								if (cell['value']) jsonColumn['value'] = cell['value'];
								if (attr['style'] && attr['style'].value) jsonColumn['style'] = attr['style'].value;

								if (cl.length) {
									jsonColumn['class'] = cl;
								}
							}

							if (row * 1 == 1) {
								jsonSpreadsheet.metadata.widths.unshift($(jS.col(null, column)).css('width').replace('px', ''));
							}
						} while (column-- > 1);

						if (rowHasValues) {
							jsonSpreadsheet.rows.unshift(jsonRow);
						}

					} while (row-- > 1);
				} while (sheet--);
				jS.i = i;

				return output;
			},

			/**
			 * Create a table from xml
			 * @param {Object} jS the jQuery.sheet instance
			 * @param {Boolean} [doNotTrim] cut down on added json by trimming to only edited area
			 * @returns {String} - schema:
			 * &lt;spreadsheets&gt;
			 *     &lt;spreadsheet title="spreadsheet title"&gt;
			 *         &lt;metadata&gt;
			 *             &lt;widths&gt;
			 *                 &lt;width&gt;120px&lt;/width&gt;
			 *                 &lt;width&gt;80px&lt;/width&gt;
			 *             &lt;/widths&gt;
			 *         &lt;/metadata&gt;
			 *         &lt;rows&gt;
			 *             &lt;row height="15px"&gt;
			 *                  &lt;columns&gt;
			 *                      &lt;column&gt;
			 *                          &lt;formula&gt;=cell formula&lt;/formula&gt;
			 *                          &lt;value&gt;cell value&lt;/value&gt;
			 *                          &lt;style&gt;cells style&lt;/style&gt;
			 *                          &lt;class&gt;cells class&lt;/class&gt;
			 *                      &lt;/column&gt;
			 *                      &lt;column&gt;&lt;/column&gt;
			 *                  &lt;/columns&gt;
			 *              &lt;/row&gt;
			 *             &lt;row height="15px"&gt;
			 *                  &lt;columns&gt;
			 *                      &lt;column&gt;
			 *                          &lt;formula&gt;=cell formula&lt;/formula&gt;
			 *                          &lt;value&gt;cell value&lt;/value&gt;
			 *                          &lt;style&gt;cells style&lt;/style&gt;
			 *                          &lt;class&gt;cells class&lt;/class&gt;
			 *                      &lt;/column&gt;
			 *                      &lt;column&gt;&lt;/column&gt;
			 *                  &lt;/columns&gt;
			 *              &lt;/row&gt;
			 *         &lt;/rows&gt;
			 *     &lt;/spreadsheet&gt;
			 * &lt;/spreadsheets&gt;
			 * @memberOf jQuery.sheet.dts.fromTables
			 */
			xml: function(jS, doNotTrim) {
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
					rowHasValues;

				if (sheet < 0) return output;

				do {
					rowHasValues = false;
					jS.i = sheet;
					jS.evt.cellEditDone();
					frozenAt = $.extend({}, jS.frozenAt());
					widths = [];

					spreadsheet = jS.spreadsheets[sheet];
					row = spreadsheet.length - 1;
					xmlRow = '';
					do {
						xmlColumns = '';
						column = spreadsheet[row].length - 1;
						do {
							xmlColumn = '';
							var cell = spreadsheet[row][column],
								attr = cell.td[0].attributes,
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

								xmlColumn += '</column>';

								xmlColumns = xmlColumn + xmlColumns;
							}

							if (row * 1 == 1) {
								widths[column] = '<width>' + $(jS.col(null, column)).css('width').replace('px', '') + '</width>';
							}

						} while (column -- > 1);

						if (xmlColumns) {
							parentAttr = spreadsheet[row][1].td[0].parentNode.attributes;
							xmlRow = '<row height="' + (parentAttr['height'] ? parentAttr['height'].value.replace('px', '') : jS.s.colMargin) + '">' +
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
				return '<?xml version="1.0" encoding="UTF-8"?><spreadsheets xmlns="http://www.w3.org/1999/xhtml">' + output + '</spreadsheets>';
			}
		}
	};
})(jQuery, document);