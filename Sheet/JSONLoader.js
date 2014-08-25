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

;Sheet.JSONLoader = (function($, document) {
    "use strict";
    function Constructor(json) {
        this.json = json;
        this.count = json.length;
    }

    Constructor.prototype = {
        size: function(spreadsheetIndex) {
            var jsonSpreadsheet = this.json[spreadsheetIndex],
                rows = jsonSpreadsheet.rows,
                firstRow = rows[0],
                firstRowColumns = firstRow.columns;

            return {
                rows: rows.length,
                cols: firstRowColumns.length
            };
        },
        setWidth: function(sheetIndex, columnIndex, colElement) {
            var json = this.json,
                jsonSpreadsheet = json[sheetIndex],
                metadata = jsonSpreadsheet.metadata || {},
                widths = metadata.widths || [],
                width = widths[columnIndex];

            colElement.style.width = width + 'px';
        },
        setRowHeight: function(sheetIndex, rowIndex, barTd) {
            var json = this.json,
                jsonSpreadsheet = json[sheetIndex],
                row = jsonSpreadsheet.rows[rowIndex],
                height = row.height;

            barTd.style.height = height + 'px';
        },
        setupCell: function(sheetIndex, rowIndex, columnIndex, blankCell, blankTd) {
            var json = this.json,
                jsonSpreadsheet,
                row,
                cell;

            if ((jsonSpreadsheet = json[sheetIndex]) === undefined) return;
            if ((row = jsonSpreadsheet.rows[rowIndex - 1]) === undefined) return;
            if ((cell = row.columns[columnIndex - 1]) === undefined) return;

            blankCell.cellType = cell['cellType'] || '';

            if (cell['formula']) {
                blankCell.formula = cell['formula'] || '';
                blankTd.setAttribute('data-formula', cell['formula'] || '');
            } else {
                blankTd.innerHTML = blankCell.value = cell['value'] || '';
            }

            blankTd.className = cell['class'] || '';
            blankTd.setAttribute('style', cell['style'] || '');

            if (cell['rowspan']) blankTd.setAttribute('rowspan', cell['rowspan'] || '');
            if (cell['colspan']) blankTd.setAttribute('colspan', cell['colspan'] || '');
        },
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
         * @memberOf Sheet.JSONLoader
         */
        toTables: function() {

            var json = this.json,
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
                height;

            for (var i = 0; i < json.length; i++) {
                spreadsheet = json[i];
                var table = $(document.createElement('table'));
                if (spreadsheet['title']) table.attr('title', spreadsheet['title'] || '');

                tables = tables.add(table);

                rows = spreadsheet['rows'];
                for (var j = 0; j < rows.length; j++) {
                    row = rows[j];
                    if (height = (row['height'] + '').replace('px','')) {
                        var tr = $(document.createElement('tr'))
                            .attr('height', height)
                            .css('height', height + 'px')
                            .appendTo(table);
                    }
                    columns = row['columns'];
                    for (var k = 0; k < columns.length; k++) {
                        column = columns[k];
                        var td = $(document.createElement('td'))
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
                        var colgroup = $(document.createElement('colgroup'))
                            .prependTo(table);
                        for(var k = 0; k < widths.length; k++) {
                            width = (widths[k] + '').replace('px', '');
                            var col = $(document.createElement('col'))
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
         * @memberOf Sheet.JSONLoader
         */
        fromTables: function(jS, doNotTrim) {
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
                rowHasValues,
                parentEle,
                parentHeight;

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
                        "frozenAt": $.extend({}, jS.obj.pane().actionUI.frozenAt)
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
	    getCellValue: function() {

	    }
    };

    return Constructor;
})(jQuery, document);
