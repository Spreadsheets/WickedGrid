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
			 * @param {Array} json array of spreadsheets - schema:<pre>
			 * [{ // sheet 1, can repeat
			 *  "title": "Title of spreadsheet",
			 *  "metadata": {
			 *      "widths": [
			 *          120, //widths for each column, required
			 *          80
			 *      ]
			 *  },
			 *  "rows": [
			 *      { // row 1, repeats for each column of the spreadsheet
			 *          "height": 18, //optional
			 *          "columns": [
			 *              { //column A
			 *                  "cellType":"", //optional
			 *                  "class": "css classes", //optional
			 *                  "formula": "=cell formula", //optional
			 *                  "value": "value", //optional
			 *                  "style": "css cell style" //optional
			 *              },
			 *              {} //column B
			 *          ]
			 *      },
			 *      { // row 2
			 *          "height": 18, //optional
			 *          "columns": [
			 *              { // column A
			 *                  "cellType":"", //optional
			 *                  "class": "css classes", //optional
			 *                  "formula": "=cell formula", //optional
			 *                  "value": "value", //optional
			 *                  "style": "css cell style" //optional
			 *              },
			 *              {} // column B
			 *          ]
			 *      }
			 *  ]
			 * }]</pre>
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
							if (column['rowspan']) td.attr('rowspan', column['rowspan'] || '');
							if (column['colspan']) td.attr('colspan', column['colspan'] || '');
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
			 * @param {String|jQuery|HTMLElement} xml - schema:<textarea disabled=disabled>
			 * <spreadsheets>
			 *     <spreadsheet title="spreadsheet title">
			 *         <metadata>
			 *             <widths>
			 *                 <width>120</width>
			 *                 <width>80</width>
			 *             </widths>
             *             <frozenAt>
             *                 <row>0</row>
             *                 <col>0</col>
             *             </frozenAt>
			 *         </metadata>
			 *         <rows>
			 *             <row height=15>
			 *                  <columns>
			 *                      <column>
             *                          <cellType></cellType>
			 *                          <formula>=cell formula</formula>
			 *                          <value>cell value</value>
			 *                          <style>cells style</style>
			 *                          <class>cells class</class>
			 *                      </column>
			 *                      <column></column>
			 *                  </columns>
			 *              </row>
			 *             <row height=15>
			 *                  <columns>
			 *                      <column>
             *                          <cellType></cellType>
			 *                          <formula>=cell formula</formula>
			 *                          <value>cell value</value>
			 *                          <style>cells style</style>
			 *                          <class>cells class</class>
			 *                      </column>
			 *                      <column></column>
			 *                  </columns>
			 *              </row>
			 *         </rows>
			 *     </spreadsheet>
			 * </spreadsheets></textarea>
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
								cl = column.getElementsByTagName('class')[0]
								rowspan = column.getElementsByTagName('rowspan')[0],
								colspan = column.getElementsByTagName('colspan')[0];

							if (formula) td.attr('data-formula', '=' + (formula.textContent || formula.text));
                            if (cellType) td.attr('data-celltype', cellType.textContent || cellType.text);
							if (value) td.html(value.textContent || value.text);
							if (style) td.attr('style', style.textContent || style.text);
							if (cl) td.attr('class', cl.textContent || cl.text);
							if (rowspan) td.attr('rowspan', rowspan.textContent || rowspan.text);
							if (colspan) td.attr('colspan', colspan.textContent || colspan.text);
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
			 * @returns {Array}  - schema:<pre>
			 * [{ // sheet 1, can repeat
			 *  "title": "Title of spreadsheet",
			 *  "metadata": {
			 *      "widths": [
			 *          "120px", //widths for each column, required
			 *          "80px"
			 *      ],
			 *      "frozenAt": {row: 0, col: 0}
			 *  },
			 *  "rows": [
			 *      { // row 1, repeats for each column of the spreadsheet
			 *          "height": "18px", //optional
			 *          "columns": [
			 *              { //column A
			 *                  "cellType":"", //optional
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
			 *                  "cellType":"", //optional
			 *                  "class": "css classes", //optional
			 *                  "formula": "=cell formula", //optional
			 *                  "value": "value", //optional
			 *                  "style": "css cell style" //optional
			 *              },
			 *              {} // column B
			 *          ]
			 *      }
			 *  ]
			 * }]</pre>
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
						parentEle = spreadsheet[row][1].td[0].parentNode;
						parentHeight = parentEle.style['height'];
						jsonRow = {
								"height": null,
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
								if (attr['style'] && attr['style'].value) jsonColumn['style'] = attr['style'].value;

								if (cl.length) {
									jsonColumn['class'] = cl;
								}
								if (attr['rowspan']) jsonColumn['rowspan'] = attr['rowspan'].value;
								if (attr['colspan']) jsonColumn['colspan'] = attr['colspan'].value;
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
			 * @returns {String} - schema:<textarea disabled=disabled>
			 * <spreadsheets>
			 *     <spreadsheet title="spreadsheet title">
			 *         <metadata>
			 *             <widths>
			 *                 <width>120px</width>
			 *                 <width>80px</width>
			 *             </widths>
			 *         </metadata>
			 *         <rows>
			 *             <row height="15px">
			 *                  <columns>
			 *                      <column>
             *                          <cellType></cellType>
			 *                          <formula>=cell formula</formula>
			 *                          <value>cell value</value>
			 *                          <style>cells style</style>
			 *                          <class>cells class</class>
			 *                      </column>
			 *                      <column></column>
			 *                  </columns>
			 *              </row>
			 *             <row height="15px">
			 *                  <columns>
			 *                      <column>
             *                          <cellType></cellType>
			 *                          <formula>=cell formula</formula>
			 *                          <value>cell value</value>
			 *                          <style>cells style</style>
			 *                          <class>cells class</class>
			 *                      </column>
			 *                      <column></column>
			 *                  </columns>
			 *              </row>
			 *         </rows>
			 *     </spreadsheet>
			 * </spreadsheets></textarea>
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
								if (attr['rowspan']) xmlColumn += '<rowspan>' + attr['rowspan'].value + '</rowspan>';
								if (attr['colspan']) xmlColumn += '<colspan>' + attr['colspan'].value + '</colspan>';

								xmlColumn += '</column>';

								xmlColumns = xmlColumn + xmlColumns;
							}

							if (row * 1 == 1) {
								widths[column] = '<width>' + $(jS.col(null, column)).css('width').replace('px', '') + '</width>';
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
				return '<?xml version="1.0" encoding="UTF-8"?><spreadsheets xmlns="http://www.w3.org/1999/xhtml">' + output + '</spreadsheets>';
			}
		}
	};
})(jQuery, document);
