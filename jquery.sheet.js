/**
 * @project jQuery.sheet() The Ajax Spreadsheet - http://code.google.com/p/jquerysheet/
 * @author RobertLeePlummerJr@gmail.com
 * $Id: jquery.sheet.js 943 2013-09-04 14:57:33Z robertleeplummerjr $
 * Licensed under MIT
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

/**
 * @namespace
  * @type {Object|Function}
 */
jQuery = jQuery || window.jQuery;
(function($, doc, win, Date, String, Number, Boolean, Math, RegExp, Error) {
    /**
     * @namespace
     * @type {Object}
     * @name jQuery()
     */
    $.fn.extend({
        /**
         * @memberOf jQuery()
         * @function
         * @returns {jQuery()}
         * @description
         * <pre>
         * The jQuery.sheet plugin
         * Supports the following jQuery events
         *
         * sheetAddRow - occurs just after a row has been added
         *  arguments: e (jQuery event), jS, i (row index), isBefore, qty
         *      example:
         *          $(obj).sheet({
         *              sheetAddRow: function(e, jS, i, isBefore, qty) {
         *
         *              }
         *          });
         *      or:
         *          $(obj).bind('sheetAddRow', function(e, jS, i, isBefore, qty) {
         *
         *          })
         *          .sheet();
         *
         * sheetAddColumn - occurs just after a column has been added
         *      arguments: e (jQuery event), jS, i (column index), isBefore, qty
         *      example:
         *          $(obj).sheet({
         *              sheetAddColumn: function(e, jS, i, isBefore, qty) {
         *
         *              }
         *          });
         *      or:
         *          $(obj).bind('sheetAddColumn', function(e, jS, i, isBefore, qty) {
         *
         *          })
         *          .sheet();
         *
         * sheetSwitch - occurs after a spreadsheet has been switched
         *      arguments: e (jQuery event), jS (jQuery.sheet instance), i (spreadsheet index)
         *      example:
         *          $(obj).sheet({
         *              sheetSwitch: function(e, jS, i) {
         *
         *              }
         *          });
         *      or:
         *          $(obj).bind('sheetSwitch', function(e, jS, i) {
         *
         *          })
         *          .sheet();
         *
         * sheetRename - occurs just after a spreadsheet is renamed, to obtain new title jS.obj.table().attr('title');
         *      arguments: e (jQuery event), jS (jQuery.sheet instance), i (spreadsheet index)
         *      example:
         *          $(obj).sheet({
         *              sheetRename: function(e, jS, i) {
         *
         *              }
         *          });
         *      or:
         *          $(obj).bind('sheetRename', function(e, jS, i) {
         *
         *          })
         *          .sheet();
         *
         * sheetTabSortStart - occurs at the beginning of a sort for moving a spreadsheet around in order
         *      arguments: e (jQuery event), jS (jQuery.sheet instance), E (jQuery sortable event), ui, (jQuery ui event)
         *      example:
         *          $(obj).sheet({
         *              sheetTabSortStart: function(e, jS, E, ui) {
         *
         *              }
         *          });
         *      or:
         *          $(obj).bind('sheetTabSortStart',NPER: function(e, jS, E, ui) {
         *
         *          })
         *          .sheet();
         *
         * sheetTabSortUpdate - occurs after a sort of a spreadsheet has been completed
         *      arguments: e (jQuery event), jS (jQuery.sheet instance), E (jQuery sotable event), ui, (jQuery ui event), i (original index)
         *      example:
         *          $(obj).sheet({
         *              sheetTabSortUpdate: function(e, jS, E, ui) {
         *
         *              }
         *          });
         *      or:
         *          $(obj).bind('sheetTabSortUpdate', function(e, jS, E, ui) {
         *
         *          })
         *          .sheet();
         *
         * sheetFormulaKeydown - occurs just after keydown on either inline or static formula
         *      arguments: e (jQuery event)
         *      example:
         *          $(obj).sheet({
         *              sheetFormulaKeydown: function(e) {
         *
         *              }
         *          });
         *      or:
         *          $(obj).bind('sheetFormulaKeydown') {
         *
         *          })
         *          .sheet();
         * sheetCellEdit - occurs just before a cell has been a cell is started to edit
         *      arguments: e (jQuery event), jS (jQuery.sheet instance), cell (jQuery.sheet.instance.spreadsheet cell)
         *      example:
         *          $(obj).sheet({
         *              sheetCellEdit: function(e, jS, cell) {
         *
         *              }
         *          });
         *      or:
         *          $(obj).bind('sheetCellEdit', function(e, jS, cell) {
         *
         *          })
         *          .sheet();
         *
         * sheetCellEdited - occurs just after a cell has been updated
         *      arguments: e (jQuery event), jS (jQuery.sheet instance), cell (jQuery.sheet.instance.spreadsheet cell)
         *      example:
         *          $(obj).sheet({
         *              sheetCellEdited: function(e, jS, cell) {
         *
         *              }
         *          });
         *      or:
         *          $(obj).bind('sheetCellEdited', function(e, jS, cell) {
         *
         *          })
         *          .sheet();
         *
         * sheetCalculation - occurs just after a spreadsheet has been fully calculated
         *      arguments: e (jQuery event), jS (jQuery.sheet instance)
         *      example:
         *          $(obj).sheet({
         *              sheetCalculation: function(e, jS) {
         *
         *              }
         *          });
         *      or:
         *          $(obj).bind('sheetCalculation', function(e, jS) {
         *
         *          })
         *          .sheet();
         *
         * sheetAdd - occurs just after a spreadsheet has been added
         *      arguments: e (jQuery event), jS (jQuery.sheet instance), i (new sheet index)
         *      example:
         *          $(obj).sheet({
         *              sheetAdd: function(e, jS, i) {
         *
         *              }
         *          });
         *      or:
         *          $(obj).bind('sheetAdd', function(e, jS, i) {
         *
         *          })
         *          .sheet();
         *
         * sheetDelete - occurs just after a spreadsheet has been deleted
         *      arguments: e (jQuery event), jS (jQuery.sheet instance), i (old sheet index)
         *      example:
         *          $(obj).sheet({
         *              sheetDelete: function(e, jS, i) {
         *
         *              }
         *          });
         *      or:
         *          $(obj).bind('sheetDelete', function(e, jS, i) {
         *
         *          })
         *          .sheet();
         *
         * sheetDeleteRow - occurs just after a row has been deleted
         *      arguments: e (jQuery event), jS (jQuery.sheet instance), i (old row index)
         *      example:
         *          $(obj).sheet({
         *              sheetDeleteRow: function(e, jS, i) {
         *
         *              }
         *          });
         *      or:
         *          $(obj).bind('sheetDeleteRow', function(e, jS, i) {
         *
         *          })
         *          .sheet();
         *
         * sheetDeleteColumn - occurs just after a column as been deleted
         *      arguments: e (jQuery event), jS (jQuery.sheet instance), i (old column index)
         *      example:
         *          $(obj).sheet({
         *              sheetDeleteColumn: function(e, jS, i) {
         *
         *              }
         *          });
         *      or:
         *          $(obj).bind('sheetDeleteColumn', function(e, jS, i) {
         *
         *          })
         *          .sheet();
         *
         * sheetOpen - occurs just after a single sheet within a set of sheets has been opened, this is triggered when calling sheet, so it needs to be bound beforehand
         *      arguments: e (jQuery event), jS (jQuery.sheet instance), i (new sheet index)
         *      example:
         *          $(obj).sheet({
         *              sheetOpen: function(e, jS, i) {
         *
         *              }
         *          });
         *      or:
         *          $(obj).bind('sheetOpen', function(e, jS, i) {
         *
         *          })
         *          .sheet();
         *
         * sheetAllOpened - occurs just after all sheets have been loaded and complete user interface has been created, this is triggered when calling sheet, so it needs to be bound beforehand
         *      arguments: e (jQuery event), jS (jQuery.sheet instance)
         *      example:
         *          $(obj).sheet({
         *              sheetAllOpened: function(e, jS) {
         *
         *              }
         *          });
         *      or:
         *          $(obj).bind('sheetAllOpened', function(e, jS) {
         *
         *          })
         *          .sheet();
         *
         * sheetSave - an assistance event called when calling jS.toggleState(), but not tied to anything internally
         *      arguments: e (jQuery event), jS (jQuery.sheet instance), tables (tables from spreadsheet)
         *      example:
         *          $(obj).sheet({
         *              sheetSave: function(e, jS, tables) {
         *
         *              });
         *          }
         *      or:
         *          $(obj).bind('sheetSave', function(e, jS, tables) {
         *
         *          })
         *          .sheet();
         *
         * sheetFullScreen - triggered when the sheet goes full screen
         *      arguments: e (jQuery event), jS (jQuery.sheet instance), isFullScreen (boolean, true if full screen, false if not)
         *      example:
         *          $(obj).sheet({
         *              sheetFullScreen: function(e, jS, isFullScreen) {
         *
         *              });
         *          }
         *      or:
         *          $(obj).bind('sheetFullScreen', function(e, jS, isFullScreen) {
         *
         *          })
         *          .sheet();
         * </pre>
         *
         * @param {Object} [settings] supports the following properties/methods:
         * <pre>
         * editable {Boolean}, default true, Makes the sheet editable or viewable
         *
         * editableNames {Boolean}, default true, Allows sheets to have their names changed, depends on settings.editable being true
         *
         * barMenus {Boolean}, default true, Turns bar menus on/off
         *
         * freezableCells {Boolean}, default true, Turns ability to freeze cells on/off
         *
         * allowToggleState {Boolean}, default true, allows the spreadsheet to be toggled from write/read
         *
         * newColumnWidth {Number}, default 120, width of new columns
         *
         * title {String|Function}, title of spreadsheet, if function, expects string and is sent jS
         *
         * menuRight {String|Function}, default '', 'this' is jQuery.sheet instance. If ul object, will attempt to create menu
         *
         * menuLeft {String|Function}, default '', 'this' is jQuery.sheet instance. If ul object, will attempt to create menu
         *
         * calcOff {Boolean} default false, turns turns off ability to calculate
         *
         * lockFormulas {Boolean} default false, turns on/off the ability to edit formulas
         *
         * colMargin {Number} default 18, size of height of new cells, and width of cell bars
         *
         * boxModelCorrection {Number} default 2, if box model is detected, it adds these pixels to ensure the size of the spreadsheet controls are correct
         *
         * formulaFunctions {Object} default {}, Additional functions for formulas. Will overwrite default functions if named the same.
         *      Javascript Example:
         *          $(obj).sheet({
         *              formulaFunctions: {
         *                  NEWFUNCTION: function(arg1, arg2) {
         *                      //this = the parser's cell object object
         *                      return 'string'; //can return a string
         *                      return { //can also return an object {value: '', html: ''}
         *                          value: 'my value seen by other cells or if accessed directly',
         *                          html: $('What the end user will see on the cell this is called in')
         *                      }
         *                  }
         *              }
         *          });
         *
         *      Formula Example:
         *          =NEWFUNCTION(A1:B1, C3);
         *
         * formulaVariables {Object} default {}, Additional variables that formulas can access.
         *      Javascript Example:
         *          $(obj).sheet({
         *              formulaVariables: {
         *                  newVariable: 100
         *              }
         *          });
         *
         *      Formula Example (will output 200)
         *          =newVariable + 100
         *
         * cellSelectModel {String} default 'excel', accepts 'excel', 'oo', or 'gdrive', makes the select model act differently
         *
         * autoAddCells {Boolean} default true, allows you to add cells by selecting the last row/column and add cells by pressing either tab (column) or enter (row)
         *
         * resizableCells {Boolean} default true, turns resizing on and off for cells, depends on jQuery ui
         *
         * resizableSheet {Boolean} default true, turns resizing on and off for sheet, depends on jQuery ui
         *
         * autoFiller {Boolean} default true, turns on/off the auto filler, the little square that follows the active cell around that you can drag and fill the values of other cells in with.
         *
         * minSize {Object} default {rows: 1, cols: 1}, the minimum size of a spreadsheet
         *
         * error {Function} default function(e) { return e.error; }, is triggered on errors from the formula engine
         *
         * encode {Function} default is a special characters handler for strings only, is a 1 way encoding of the html if entered manually by the editor.  If you want to use html with a function, return an object rather than a string
         *
         * frozenAt {Object} default [{row: 0,col: 0}], Gives the ability to freeze cells at a certain row/col
         *
         * contextmenuTop {Object} default is standard list of commands for context menus when right click or click on menu dropdown
         *      Javascript example:
         *          {
         *              "What I want my command to say": function() {}
         *          }
         *
         * contextmenuLeft {Object} default is standard list of commands for context menus when right click
         *      Javascript example:
         *          {
         *              "What I want my command to say": function() {}
         *          }
         *
         * contextmenuCell {Object} default is standard list of commands for context menus when right click or click on menu dropdown
         *      Javascript example:
         *          {
         *              "What I want my command to say": function() {}
         *          }
         *
         * hiddenRows {Array} default [], Hides certain rows from being displayed initially. [sheet Index][row index]. example: [[1]] hides first row in first spreadsheet; [[]],[1]] hides first row in second spreadsheet
         *
         * hiddenColumns {Array} default [], Hides certain columns from being displayed initially. [sheet Index][column index]. example: [[1]] hides first column in first spreadsheet; [[],[1]] hides first column in second spreadsheet
         *
         * alert {Function} default function(msg) {alert(msg);}
         * prompt {Function} defalut function(msg, callback, initialValue) {callback(prompt(msg, initialValue));}
         * confirm {Function} default
         *      function(msg, callbackIfTrue, callbackIfFalse) {
         *          if (confirm(msg)) {
         *              callbackIfTrue();
         *          } else if (callbackIfFalse) {
         *              callbackIfFalse();
         *          }
         *      }
         * </pre>
         */
        sheet:function (settings) {
            var n = isNaN,
                events = $.sheet.events;

            settings = settings || {};

            $(this).each(function () {
                var globalize = Globalize,
                    me = $(this),
                    defaults = {
                        editable:true,
                        editableNames:true,
                        barMenus:true,
                        freezableCells:true,
                        allowToggleState:true,
                        menuLeft:null,
                        menuRight:null,
                        newColumnWidth:120,
                        title:null,
                        calcOff:false,
                        lockFormulas:false,
                        parent:me,
                        colMargin:18,
                        boxModelCorrection:2,
                        formulaFunctions:{},
                        formulaVariables:{},
                        cellSelectModel:'excel',
                        autoAddCells:true,
                        resizableCells:true,
                        resizableSheet:true,
                        autoFiller:true,
                        minSize:{rows:1, cols:1},
                        error:function (e) {
                            return e.error;
                        },
                        endOfNumber: false,
                        encode:function (val) {

                            switch (typeof val) {
                                case 'object':
                                    //check if it is a date
                                    if (val.getMonth) {
                                        return globalize.format(val, 'd');
                                    }

                                    return val;
                            }

                            if (!val) {
                                return val || '';
                            }
                            if (!val.replace) {
                                return val || '';
                            }
                            /*var num = $.trim(val) * 1;
                            if (!isNaN(num)) {
                                return globalize.format(num, "n10").replace(this.endOfNumber, function (orig, radix, num) {
                                    return (num ? radix : '') + (num || '');
                                });
                            }*/

                            return val
                                .replace(/&/gi, '&amp;')
                                .replace(/>/gi, '&gt;')
                                .replace(/</gi, '&lt;')
                                .replace(/\n/g, '\n<br>')
                                .replace(/\t/g, '&nbsp;&nbsp;&nbsp ')
                                .replace(/  /g, '&nbsp; ');
                        },
                        frozenAt:[],
                        contextmenuTop:{
                            "Toggle freeze columns to here":function (jS) {
                                var col = jS.getTdLocation(jS.obj.tdActive()).col;
                                jS.frozenAt().col = (jS.frozenAt().col == col ? 0 : col);
                            },
                            "Insert column after":function (jS) {
                                jS.controlFactory.addColumn(jS.colLast);
                                return false;
                            },
                            "Insert column before":function (jS) {
                                jS.controlFactory.addColumn(jS.colLast, true);
                                return false;
                            },
                            "Add column to end":function (jS) {
                                jS.controlFactory.addColumn();
                                return false;
                            },
                            "Delete this column":function (jS) {
                                jS.deleteColumn();
                                return false;
                            },
                            "Hide column":function (jS) {
                                jS.toggleHide.column();
                                return false;
                            }
                        },
                        contextmenuLeft:{
                            "Toggle freeze rows to here":function (jS) {
                                var row = jS.getTdLocation(jS.obj.tdActive()).row;
                                jS.frozenAt().row = (jS.frozenAt().row == row ? 0 : row);
                            },
                            "Insert row after":function (jS) {
                                jS.controlFactory.addRow(jS.rowLast);
                                return false;
                            },
                            "Insert row before":function (jS) {
                                jS.controlFactory.addRow(jS.rowLast, true);
                                return false;
                            },
                            "Add row to end":function (jS) {
                                jS.controlFactory.addRow();
                                return false;
                            },
                            "Delete this row":function (jS) {
                                jS.deleteRow();
                                return false;
                            },
                            "Hide row":function (jS) {
                                jS.toggleHide.row();
                                return false;
                            }
                        },
                        contextmenuCell:{
                            "Copy":false,
                            "Cut":false,
                            "Insert column after":function (jS) {
                                jS.controlFactory.addColumn(jS.colLast);
                                return false;
                            },
                            "Insert column before":function (jS) {
                                jS.controlFactory.addColumn(jS.colLast, true);
                                return false;
                            },
                            "Add column to end":function (jS) {
                                jS.controlFactory.addColumn();
                                return false;
                            },
                            "Delete this column":function (jS) {
                                jS.deleteColumn();
                                return false;
                            },
                            "line1":"line",
                            "Insert row after":function (jS) {
                                jS.controlFactory.addRow(jS.rowLast);
                                return false;
                            },
                            "Insert row before":function (jS) {
                                jS.controlFactory.addRow(jS.rowLast, true);
                                return false;
                            },
                            "Add row to end":function (jS) {
                                jS.controlFactory.addRow();
                                return false;
                            },
                            "Delete this row":function (jS) {
                                jS.deleteRow();
                                return false;
                            },
                            "line2":'line',
                            "Add spreadsheet":function (jS) {
                                jS.addSheet();
                            },
                            "Delete spreadsheet":function (jS) {
                                jS.deleteSheet();
                            }
                        },
                        hiddenRows:[],
                        hiddenColumns:[],
                        cellStartingHandlers: {
                            '$':function(val, ch) {
                                return jFN.DOLLAR.call(this, val.substring(1).replace(globalize.culture().numberFormat[','], ''), 2, ch || '$');
                            },
                            '£':function(val) {
                                return jS.s.cellStartingHandlers['$'].call(this, val, '£');
                            }
                        },
                        cellEndHandlers: {
                            '%': function(value) {
                                return value.substring(0, this.value.length - 1) / 100;
                            }
                        },
                        cellTypeHandlers: {
                            percent: function(value) {
                                var num = (n(value) ? globalize.parseFloat(value) : value * 1),
                                    result;

                                if (!n(num)) {//success
                                    result = new Number(num);
                                    result.html = globalize.format(num, 'p');
                                    return result;
                                }

                                return value;
                            },
                            date: function(value) {
                                var date = globalize.parseDate(value);
                                date.html = globalize.format(date, 'd');
                                return date;
                            },
                            time: function(value) {
                                var date = globalize.parseDate(value);
                                date.html = globalize.format(date, 't');
                                return date;
                            },
                            currency: function(value) {
                                var num = (n(value) ? globalize.parseFloat(value) : value * 1),
                                    result;

                                if (!n(num)) {//success
                                    result = new Number(num);
                                    result.html = globalize.format(num, 'c');
                                    return result;
                                }

                                return value;
                            },
                            number: function(value) {
                                var radix, result;
                                if (!settings.endOfNumber) {
                                    radix = globalize.culture().numberFormat['.'];
                                    settings.endOfNumber = new RegExp("([" + (radix == '.' ? "\." : radix) + "])([0-9]*?[1-9]+)?(0)*$");
                                }

                                if (!n(value)) {//success
                                    result = new Number(value);
                                    result.html = globalize.format(value + '', "n10")
                                        .replace(settings.endOfNumber, function (orig, radix, num) {
                                            return (num ? radix : '') + (num || '');
                                        });
                                    return result;
                                }

                                return value;
                            }
                        },
                        alert: function(msg) {
                            alert(msg);
                        },
                        prompt: function(msg, callback, initialValue) {
                            callback(prompt(msg, initialValue));
                        },
                        confirm: function(msg, callbackIfTrue, callbackIfFalse) {
                            if (confirm(msg)) {
                                callbackIfTrue();
                            } else if (callbackIfFalse) {
                                callbackIfFalse();
                            }
                        }
                    };

                //destroy already existing spreadsheet
                var jS = this.jS;
                if (jS) {
                    var tables = me.children().detach();
                    jS.kill();
                    me.html(tables);

                    for (var event in events) {
                        if (settings[events[event]]) {
                            me.unbind(events[event]);
                        }
                    }
                }

                if ((this.className || '').match(/\bnotEditable\b/i) != null) {
                    settings['editable'] = false;
                }

                for (var i in events) {
                    if (settings[events[i]]) me.bind(events[i], settings[events[i]]);
                }

                if (!$.sheet.instance.length) $.sheet.instance = [];

                this.jS = jS = $.sheet.createInstance($.extend(defaults, settings), $.sheet.instance.length);
                $.sheet.instance.push(jS);
            });
            return this;
        },

        /**
         * @memberOf jQuery()
         * @method
         * @returns {HTMLElement}
         */
        disableSelectionSpecial:function () {
            this.each(function () {
                this.onselectstart = function () {
                    return false;
                };
                this.unselectable = "on";
                this.style['-moz-user-select'] = 'none';
            });
            return this;
        },

        /**
         * @memberOf jQuery()
         * @returns {jS}
         */
        getSheet:function () {
            var me = this[0],
                jS = (me.jS || {});
            return jS;
        },

        /**
         * Get cell value
         * @memberOf jQuery()
         * @param {Number} rowIndex
         * @param {Number} colIndex
         * @param {Number} [sheetIndex] defaults to 0
         * @returns {String|Date|Number|Boolean|Null}
         */
        getCellValue:function (rowIndex, colIndex, sheetIndex) {
            var me = this[0],
                jS = (me.jS || {});

            sheetIndex = (sheetIndex || 0);

            if (jS.updateCellValue) {
                try {
                    return jS.updateCellValue(sheetIndex, rowIndex, colIndex);
                } catch (e) {}
            }
            return null;
        },

        /**
         * Set cell value
         * @memberOf jQuery()
         * @param {String|Number} value
         * @param {Number} rowIndex
         * @param {Number} colIndex
         * @param {Number} [sheetIndex] defaults to 0
         * @returns {Boolean}
         */
        setCellValue:function (value, rowIndex, colIndex, sheetIndex) {
            var me = this[0],
                jS = (me.jS || {}),
                cell;

            sheetIndex = (sheetIndex || 0);

            if (
                jS.getCell
                    && (cell = jS.getCell(rowIndex, colIndex, sheetIndex))
                ) {
                try {
                    if ((value + '').charAt(0) == '=') {
                        cell.valueOverride = cell.value = '';
                        cell.formula = value.substring(1);
                    } else {
                        cell.value = value;
                        cell.valueOverride = cell.formula = '';
                    }
                    cell.calcLast = cell.calcDependenciesLast = 0;
                    jS.updateCellValue.call(cell);
                    jS.updateCellDependencies.call(cell);
                    return true;
                } catch (e) {}
            }
            return false;
        },

        /**
         * Set cell formula
         * @memberOf jQuery()
         * @param {String} formula
         * @param {Number} rowIndex
         * @param {Number} colIndex
         * @param {Number} [sheetIndex] defaults to 0
         * @returns {Boolean}
         */
        setCellFormula:function (formula, rowIndex, colIndex, sheetIndex) {
            var me = this[0],
                jS = (me.jS || {}),
                cell;

            sheetIndex = (sheetIndex || 0);

            if (
                jS.getCell
                    && (cell = jS.getCell(rowIndex, colIndex, sheetIndex))
                ) {
                try {
                    cell.formula = formula;
                    cell.valueOverride = cell.value = '';
                    cell.calcLast = cell.calcDependenciesLast = 0;
                    jS.updateCellValue(sheetIndex, rowIndex, colIndex);
                } catch (e) {}
            }
            return this;
        },

        /**
         * Set cell html
         * @memberOf jQuery()
         * @param {*} html
         * @param {Number} rowIndex
         * @param {Number} colIndex
         * @param {Number} [sheetIndex] defaults to 0
         */
        setCellHtml:function (html, rowIndex, colIndex, sheetIndex) {
            var me = this[0],
                jS = (me.jS || {}),
                cell;

            sheetIndex = (sheetIndex || 0);

            if (
                jS.getCell
                    && (cell = jS.getCell(rowIndex, colIndex, sheetIndex))
                ) {
                try {
                    cell.html = [html];
                    cell.calcLast = cell.calcDependenciesLast = 0;
                    jS.updateCellValue(sheetIndex, rowIndex, colIndex);
                } catch (e) {}
            }
            return this;
        },

        /**
         * Detect if spreadsheet is full screen
         * @memberOf jQuery()
         * @returns {Boolean}
         */
        isSheetFullScreen:function () {
            var me = this[0],
                jS = (me.jS || {});

            if (jS.obj) {
                return jS.obj.fullScreen().is(':visible');
            }
            return false;
        },

        /**
         * Get inputs serialized from spreadsheet type_sheet-index_row-index_column-index_instance-index (dropdown_0_1_1_0 = sheet 1, row 1, column A, instance 0
         * @param {Boolean} [isArray] return serialized as array (true) or string (false, default false
         * @memberOf jQuery()
         * @returns {*}
         */
        serializeCellInputs:function (isArray) {
            var me = this[0],
                jS = (me.jS || {}),
                inputs = jS.obj.tables().find(':input');

            if (isArray) {
                return inputs.serializeArray();
            } else {
                return inputs.serialize();
            }
        },

        /**
         * prints the source of a sheet for a user to see
         * @param {Boolean} [pretty] makes html a bit easier for the user to see
         * @returns {String}
         * @memberOf jQuery()
         */
        viewSource:function (pretty) {
            var source = "";
            $(this).each(function () {
                if (pretty) {
                    source += $(this).toPrettySource();
                } else {
                    source += $(this).toCompactSource();
                }
            });
            $.print(source);

            return source;
        },

        /**
         * prints html to 1 line
         * @returns {String}
         * @memberOf jQuery()
         */
        toCompactSource:function () {
            var node = this[0];
            var result = "";
            if (node.nodeType == 1) {
                // ELEMENT_NODE
                result += "<" + node.tagName.toLowerCase();

                var n = node.attributes.length;
                for (var i = 0; i < n; i++) {
                    var key = node.attributes[i].name,
                        val = node.getAttribute(key);

                    if (val) {
                        if (key == "contentEditable" && val == "inherit") {
                            continue;
                            // IE hack.
                        }

                        if (typeof(val) == "string") {
                            result += " " + key + '="' + val.replace(/"/g, "'") + '"';
                        } else if (key == "style" && val.cssText) {
                            result += ' style="' + val.cssText + '"';
                        }
                    }
                }

                if (node.tagName == "COL") {
                    // IE hack, which doesn't like <COL..></COL>.
                    result += '/>';
                } else {
                    result += ">";
                    var childResult = "";
                    $(node.childNodes).each(function () {
                        childResult += $(this).toCompactSource();
                    });
                    result += childResult;
                    result += "</" + node.tagName.toLowerCase() + ">";
                }

            } else if (node.nodeType == 3) {
                // TEXT_NODE
                result += node.data.replace(/^\s*(.*)\s*$/g, "$1");
            }
            return result;
        },

        /**
         *  prints html to many lines, formatted for easy viewing
         * @param {String} [prefix]
         * @returns {String}
         * @memberOf jQuery()
         */
        toPrettySource:function (prefix) {
            var node = this[0],
                n,
                i;
            prefix = prefix || "";

            var result = "";
            if (node.nodeType == 1) {
                // ELEMENT_NODE
                result += "\n" + prefix + "<" + node.tagName.toLowerCase();
                n = node.attributes.length;
                for (i = 0; i < n; i++) {
                    var key = node.attributes[i].name,
                        val = node.getAttribute(key);

                    if (val) {
                        if (key == "contentEditable" && val == "inherit") {
                            continue; // IE hack.
                        }
                        if (typeof(val) == "string") {
                            result += " " + key + '="' + $.trim(val.replace(/"/g, "'")) + '"';
                        } else if (key == "style" && val.cssText) {
                            result += ' style="' + $.trim(val.cssText) + '"';
                        }
                    }
                }
                if (node.childNodes.length <= 0) {
                    if (node.tagName == "COL") {
                        result += "/>";
                    } else {
                        result += "></" + node.tagName.toLowerCase() + ">";
                    }
                } else {
                    result += ">";
                    var childResult = "";

                    n = node.childNodes.length;

                    for (i = 0; i < n; i++) {
                        childResult += $(node.childNodes[i]).toPrettySource(prefix + "  ");
                    }
                    result += childResult;
                    if (childResult.indexOf('\n') >= 0) {
                        result += "\n" + prefix;
                    }
                    result += "</" + node.tagName.toLowerCase() + ">";
                }
            } else if (node.nodeType == 3) {
                // TEXT_NODE
                result += node.data.replace(/^\s*(.*)\s*$/g, "$1");
            }
            return result;
        },

        /**
         * mousewheel event handler, not a jQuery event handler
         * @returns {HTMLElement}
         * @memberOf jQuery()
         */
        mousewheel: function(fn) {
            $(this).each(function() {
                this.onwheel = this.onmousewheel = this.onDOMMouseScroll = this.onMozMousePixelScroll = fn;
            });
            return this;
        }
    });

    /**
     * @namespace
     * @type {Object}
     * @memberOf jQuery
     * @name jQuery.sheet
     */
    $.sheet = {
        /**
         * Array of instances of jQuery.sheet, generally short-handed to jS
         * @memberOf jQuery.sheet
         */
        instance:[],

        /**
         * Contains the dependencies if you use $.sheet.preLoad();
         * @memberOf jQuery.sheet
         */
        dependencies:{
            coreCss:{css:'jquery.sheet.css'},
            jQueryUI:{script:'jquery-ui/ui/jquery-ui.min.js'},
            jQueryUIThemeRoller:{css:'jquery-ui/theme/jquery-ui.min.css'},
            globalize:{script:'plugins/globalize.js'},
            formulaParser:{script:'parser/formula/formula.js'},
            tsvParser:{script:'parser/tsv/tsv.js'},
            nearest:{script:'plugins/jquery.nearest.min.js'}
        },

        /**
         * Contains the optional plugins if you use $.sheet.preLoad();
         * @memberOf jQuery.sheet
         */
        optional:{
            //native
            advancedFn:{script:'plugins/jquery.sheet.advancedfn.js'},
            dts:{script:'plugins/jquery.sheet.dts.js'},
            financeFn:{script:'plugins/jquery.sheet.financefn.js'},

            //3rd party
            colorPicker:{
                css:'plugins/jquery.colorPicker.css',
                script:'plugins/jquery.colorPicker.min.js'
            },

            elastic:{script:'plugins/jquery.elastic.min.js'},

            globalizeCultures:{script:'plugins/globalize.cultures.js'},

            raphael:{script:'plugins/raphael-min.js'},
            gRaphael:{script:'plugins/g.raphael-min.js'},

            undoManager:{script: 'plugins/undomanager.js'},

            zeroClipboard:{script:'plugins/ZeroClipboard.js'}
        },

        /**
         * events list
         * @memberOf jQuery.sheet
         */
        events:[
            'sheetAddRow',
            'sheetAddColumn',
            'sheetSwitch',
            'sheetRename',
            'sheetTabSortStart',
            'sheetTabSortUpdate',
            'sheetCellEdit',
            'sheetCellEdited',
            'sheetCalculation',
            'sheetAdd',
            'sheetDelete',
            'sheetDeleteRow',
            'sheetDeleteColumn',
            'sheetOpen',
            'sheetAllOpened',
            'sheetSave',
            'sheetFullScreen',
            'sheetFormulaKeydown'
        ],

        /**
         * Used to load in all the required plugins and dependencies needed by sheet in it's default directories.
         * @param {String} [path] path
         * @param {Object} settings
         * @memberOf jQuery.sheet
         *
         */
        preLoad:function (path, settings) {
            path = path || '';
            settings = $.extend({
                skip: ['globalizeCultures']
            },settings);


            var write = function () {
                if (this.script) {
                    doc.write('<script src="' + path + this.script + '"></script>');
                }
                if (this.css) {
                    doc.write('<link rel="stylesheet" type="text/css" href="' + path + this.css + '"></link>');
                }
            };

            for(var i in settings.skip) {
                if (this.dependencies[settings.skip[i]]) {
                    this.dependencies[settings.skip[i]] = null;
                }
                if (this.optional[settings.skip[i]]) {
                    this.optional[settings.skip[i]] = null;
                }
            }

            $.each(this.dependencies, function () {
                write.call(this);
            });

            $.each(this.optional, function () {
                write.call(this);
            });
        },


        /**
         * Repeats a string a number of times
         * @param {String} str
         * @param {Number} num
         * @memberOf jQuery.sheet
         * @returns {String}
         */
        repeat:function (str, num) {
            var result = '';
            while (num > 0) {
                if (num & 1) {
                    result += str;
                }
                num >>= 1;
                str += str;
            }
            return result;
        },


        /**
         * Creates css for an iterated element
         * @param {String} elementName
         * @param {String} parentSelectorString
         * @param {Array} indexes
         * @param {Number} min
         * @param {String} [css]
         * @returns {String}
         * @memberOf jQuery.sheet
         */
        nthCss:function (elementName, parentSelectorString, indexes, min, css) {
            //the initial call overwrites this function so that it doesn't have to check if it is IE or not

            var scrollTester = doc.createElement('div'),
                scrollItem1 = doc.createElement('div'),
                scrollItem2 = doc.createElement('div'),
                scrollStyle = doc.createElement('style');

            doc.body.appendChild(scrollTester);
            scrollTester.setAttribute('id', 'scrollTester');
            scrollTester.appendChild(scrollItem1);
            scrollTester.appendChild(scrollItem2);
            scrollTester.appendChild(scrollStyle);

            if (scrollStyle.styleSheet && !scrollStyle.styleSheet.disabled) {
                scrollStyle.styleSheet.cssText = '#scrollTester div:nth-child(2) { display: none; }';
            } else {
                scrollStyle.innerHTML = '#scrollTester div:nth-child(2) { display: none; }';
            }

            if (this.max) {//this is where we check IE8 compatibility
                this.nthCss = function (elementName, parentSelectorString, indexes, min, css) {
                    var style = [],
                        index = indexes.length;
                    css = css || '{display: none;}';

                    do {
                        if (indexes[index] > min) {
                            style.push(parentSelectorString + ' ' + elementName + ':first-child' + this.repeat('+' + elementName, indexes[index] - 1));
                        }
                    } while (index--);

                    if (style.length) {
                        return style.join(',') + css;
                    }

                    return '';
                };
            } else {
                this.nthCss = function (elementName, parentSelectorString, indexes, min, css) {
                    var style = [],
                        index = indexes.length;
                    css = css || '{display: none;}';

                    do {
                        if (indexes[index] > min) {
                            style.push(parentSelectorString + ' ' + elementName + ':nth-child(' + indexes[index] + ')');
                        }
                    } while (index--);

                    if (style.length) {
                        return style.join(',') + css;
                    }

                    return '';
                };
            }

            doc.body.removeChild(scrollTester);

            //this looks like a nested call, but will only trigger once, since the function is overwritten from the above
            return this.nthCss(elementName, parentSelectorString, indexes, min, css);
        },

        /**
         * The instance creator of jQuery.sheet
         * @memberOf jQuery.sheet
         * @param {Object} s settings from jQuery.fn.sheet
         * @param {Number} I the index of the instance
         * @returns {jS} jS jQuery sheet instance
         */
        createInstance:function (s, I) {

            var self = this,
                //create function, it expects 2 values.
                insertAfter = function (newElement, targetElement) {
                    //target is what you want it to go after. Look for this elements parent.
                    var parent = targetElement.parentNode;

                    //if the parents lastchild is the targetElement...
                    if(parent.lastchild == targetElement) {
                        //add the newElement after the target element.
                        parent.appendChild(newElement);
                    } else {
                        // else the target has siblings, insert the new element between the target and it's next sibling.
                        parent.insertBefore(newElement, targetElement.nextSibling);
                    }
                },
                $win = $(win),
                $doc = $(doc),
                body = doc.body,
                $body = $(body),
                emptyFN = function () {},
                u = undefined,
                math = Math,
                n = isNaN,
                nAN = NaN,
                jSCellRange = function(cells) {
                    this.cells = cells || [];
                },
                jSCP = jSCellRange.prototype = {
                    clone: function() {
                        var clones = [];
                        for(var i = 0; i < this.cells.length;i++) {
                            var cell = this.cells[i],
                                clone = {
                                    value:cell.value,
                                    formula:cell.formula,
                                    td: cell.td,
                                    dependencies: cell.dependencies,
                                    needsUpdated: cell.needsUpdated,
                                    calcCount: cell.calcCount,
                                    sheet: cell.sheet,
                                    calcLast: cell.calcLast,
                                    html: cell.html,
                                    state: cell.state,
                                    jS: cell.jS,
                                    calcDependenciesLast: cell.calcDependenciesLast,
                                    style: cell.style || cell.td.attr('style') || '',
                                    cl: cell.cl || cell.td.attr('class') || ''
                                };
                            clones.push(clone);
                        }
                        return new jSCellRange(clones);
                    }
                },

                /**
                 * A single instance of a spreadsheet, shorthand, also accessible from jQuery.sheet.instance[index].
                 * Generally called by jQuery().sheet().  Exposed for the ability to override methods if needed
                 * @namespace
                 * @alias jQuery.sheet.instance[]
                 * @name jS
                 */
                jS = {
                    /**
                     * Current version of jQuery.sheet
                     * @memberOf jS
                     * @type {String}
                     */
                    version:'3.x',

                    /**
                     * The active sheet index within the a set of sheets
                     * @memberOf jS
                     * @type {Number}
                     */
                    i:0,

                    /**
                     * The instance index
                     * @memberOf jS
                     * @type {Number}
                     */
                    I:I,

                    /**
                     * The current count of sheet's within the instance
                     * @memberOf jS
                     * @type {Number}
                     */
                    sheetCount:0,

                    /**
                     * The current scrolled area, col.start, col.end, row.start, row.end
                     * @memberOf jS
                     */
                    scrolledArea:[],

                    /**
                     * The internal storage array of the spreadsheets for an instance, constructed as array 3 levels deep, spreadsheet, rows, cells, can easily be used for custom exporting/saving
                     * @memberOf jS
                     * @type {Array}
                     */
                    spreadsheets:[],

                    /**
                     * Internal storage array of controls for an instance
                     * @memberOf jS
                     */
                    controls:{
                        autoFiller:[],
                        bar:{
                            helper:[],
                            corner:[],
                            x:{
                                controls:[],
                                handleFreeze:[],
                                menu:[],
                                menuParent:[],
                                parent:[],
                                scroll:[],
                                td:[],
                                tds:function () {
                                    var tds = $([]);
                                    for (var i in this.td[jS.i]) {
                                        tds.pushStack(this.td[jS.i][i]);
                                    }
                                    return tds;
                                }
                            },
                            y:{
                                controls:[],
                                handleFreeze:[],
                                menu:[],
                                parent:[],
                                scroll:[],
                                td:[],
                                tds:function () {
                                    var tds = $([]);
                                    for (var i in this.td[jS.i]) {
                                        tds.pushStack(this.td[jS.i][i]);
                                    }
                                    return tds;
                                }
                            }
                        },
                        barMenuLeft:[],
                        barMenuTop:[],
                        barLeft:[],
                        barTop:[],
                        barTopParent:[],
                        chart:[],
                        tdMenu:[],
                        cellsEdited:[],
                        enclosure:[],
                        enclosures:null,
                        formula:null,
                        fullScreen:null,
                        header:null,
                        inPlaceEdit:[],
                        inputs:[],
                        label:null,
                        menuLeft:[],
                        menuRight:[],
                        menus:[],
                        pane:[],
                        panes:null,
                        scroll:[],
                        scrolls:null,
                        sheetAdder:null,
                        table:[],
                        tables:null,
                        tab:[],
                        tabContainer:null,
                        tabs:null,
                        title:null,
                        toggleHide:{
                            x:[],
                            y:[]
                        },
                        ui:null
                    },

                    /**
                     * Object selectors for interacting with a spreadsheet, dynamically id'd from both sheet index and instance index
                     * @memberOf jS
                     * @type {Object}
                     */
                    obj:{
                        autoFiller:function () {
                            return jS.controls.autoFiller[jS.i] || $([]);
                        },
                        barCorner:function () {
                            return jS.controls.bar.corner[jS.i] || $([]);
                        },
                        barHelper:function () {
                            return jS.controls.bar.helper[jS.i] || (jS.controls.bar.helper[jS.i] = $([]));
                        },
                        barLeft:function (i) {
                            return (jS.controls.bar.y.td[jS.i] && jS.controls.bar.y.td[jS.i][i] ? jS.controls.bar.y.td[jS.i][i] : $([]));
                        },
                        barLeftControls:function () {
                            return jS.controls.bar.y.controls[jS.i] || $([]);
                        },
                        barLefts:function () {
                            return jS.controls.bar.y.tds();
                        },
                        barHandleFreezeLeft:function () {
                            return jS.controls.bar.y.handleFreeze[jS.i] || $([]);
                        },
                        barMenuLeft:function () {
                            return jS.controls.bar.y.menu[jS.i] || $([]);
                        },
                        barTop:function (i) {
                            return (jS.controls.bar.x.td[jS.i] && jS.controls.bar.x.td[jS.i][i] ? jS.controls.bar.x.td[jS.i][i] : $([]));
                        },
                        barTopControls:function () {
                            return jS.controls.bar.x.controls[jS.i] || $([]);
                        },
                        barTops:function () {
                            return jS.controls.bar.x.tds();
                        },
                        barTopParent:function () {
                            return jS.controls.bar.x.parent[jS.i] || $([]);
                        },
                        barHandleFreezeTop:function () {
                            return jS.controls.bar.x.handleFreeze[jS.i] || $([]);
                        },
                        barMenuParentTop:function () {
                            return jS.controls.bar.x.menuParent[jS.i] || $([]);
                        },
                        barMenuTop:function () {
                            return jS.controls.bar.x.menu[jS.i] || $([]);
                        },
                        tdActive:function () {
                            return jS.cellLast.td || $([]);
                        },
                        tdMenu:function () {
                            return jS.controls.tdMenu[jS.i] || $([]);
                        },
                        cellsEdited: function () {
                            return jS.controls.cellsEdited[jS.i] || $([]);
                        },
                        chart:function () {
                            return jS.controls.chart[jS.i] || $([]);
                        },
                        enclosure:function () {
                            return jS.controls.enclosure[jS.i] || $([]);
                        },
                        enclosures:function () {
                            return jS.controls.enclosures || $([]);
                        },
                        formula:function () {
                            return jS.controls.formula || $([]);
                        },
                        fullScreen:function () {
                            return jS.controls.fullScreen || $([]);
                        },
                        header:function () {
                            return jS.controls.header || $([]);
                        },
                        highlighted: function() {
                            return jS.highlightedLast.obj || $([]);
                        },
                        menuRight:function () {
                            return jS.controls.menuRight[jS.i] || $([]);
                        },
                        inPlaceEdit:function () {
                            return jS.controls.inPlaceEdit[jS.i] || $([]);
                        },
                        inputs:function() {
                            return jS.controls.inputs[jS.i] || $([]);
                        },
                        label:function () {
                            return jS.controls.label || $([]);
                        },
                        menus:function() {
                            return jS.controls.menus[jS.i] || $([]);
                        },
                        menuLeft:function () {
                            return jS.controls.menuLeft[jS.i] || $([]);
                        },
                        pane:function () {
                            return jS.controls.pane[jS.i] || {};
                        },
                        panes:function () {
                            return jS.controls.panes || $([]);
                        },
                        parent:function () {
                            return s.parent;
                        },
                        scrollStyleX:function () {
                            return jS.controls.bar.x.scroll[jS.i] || {};
                        },
                        scrollStyleY:function () {
                            return jS.controls.bar.y.scroll[jS.i] || $([]);
                        },
                        scroll:function () {
                            return jS.controls.scroll[jS.i] || $([]);
                        },
                        scrolls:function () {
                            return jS.controls.scrolls || $([]);
                        },
                        sheetAdder:function () {
                            return jS.controls.sheetAdder || $([]);
                        },
                        table:function () {
                            return jS.controls.table[jS.i] || $([]);
                        },
                        tables:function () {
                            return jS.controls.tables || $([]);
                        },
                        tab:function () {
                            return jS.controls.tab[jS.i] || $([]);
                        },
                        tabs:function () {
                            return jS.controls.tabs || $([]);
                        },
                        tabContainer:function () {
                            return jS.controls.tabContainer || $([]);
                        },
                        toggleHideStyleX:function () {
                            return jS.controls.toggleHide.x[jS.i] || $([]);
                        },
                        toggleHideStyleY:function () {
                            return jS.controls.toggleHide.y[jS.i] || $([]);
                        },
                        title:function () {
                            return jS.controls.title || $([]);
                        },
                        ui:function () {
                            return jS.controls.ui || $([]);
                        }
                    },

                    /**
                     * Internal id's of table, used for scrolling and a few other things
                     * @memberOf jS
                     * @type {String}
                     */
                    id:'jS_' + I + '_',

                    /**
                     * Internal css classes of objects
                     * @memberOf jS
                     * @type {Object}
                     */
                    cl:{
                        autoFiller:'jSAutoFiller',
                        autoFillerHandle:'jSAutoFillerHandle',
                        autoFillerCover:'jSAutoFillerCover',
                        barCorner:'jSBarCorner',
                        barController:'jSBarController',
                        barHelper:'jSBarHelper',
                        barLeft:'jSBarLeft',
                        barHandleFreezeLeft:'jSBarHandleFreezeLeft',
                        barTop:'jSBarTop',
                        barTopMenuButton: 'jSBarTopMenuButton',
                        barHandleFreezeTop:'jSBarHandleFreezeTop',
                        barTopParent:'jSBarTopParent',
                        chart:'jSChart',
                        formula:'jSFormula',
                        formulaParent:'jSFormulaParent',
                        header:'jSHeader',
                        fullScreen:'jSFullScreen',
                        inPlaceEdit:'jSInPlaceEdit',
                        menu:'jSMenu',
                        menuFixed:'jSMenuFixed',
                        parent:'jSParent',
                        scroll:'jSScroll',
                        sheetAdder: 'jSSheetAdder',
                        table:'jS',
                        label:'jSLoc',
                        pane:'jSEditPane',
                        tab:'jSTab',
                        tabContainer:'jSTabContainer',
                        tdMenu:'jSTdMenu',
                        title:'jSTitle',
                        enclosure:'jSEnclosure',
                        ui:'jSUI',
                        uiAutoFiller:'ui-state-active',
                        uiBar:'ui-widget-header',
                        uiBarHighlight:'ui-state-active',
                        uiBarHandleFreezeLeft:'ui-state-default',
                        uiBarHandleFreezeTop:'ui-state-default',
                        uiBarMenuTop:'ui-state-default',
                        uiTdActive:'ui-state-active',
                        uiTdHighlighted:'ui-state-highlight',
                        uiControl:'ui-widget-header ui-corner-top',
                        uiControlTextBox:'ui-widget-content',
                        uiFullScreen:'ui-widget-content ui-corner-all',
                        uiInPlaceEdit:'ui-state-highlight',
                        uiMenu:'ui-widget-header',
                        uiMenuUl:'ui-widget-header',
                        uiMenuLi:'ui-widget-header',
                        uiPane: 'ui-widget-content',
                        uiParent:'ui-widget-content ui-corner-all',
                        uiTable:'ui-widget-content',
                        uiTab:'ui-widget-header',
                        uiTabActive:'ui-state-highlight'
                    },

                    /**
                     * Messages for user interface
                     * @memberOf jS
                     * @type {Object}
                     */
                    msg:{
                        addRowMulti:"How many rows would you like to add?",
                        addColumnMulti:"How many columns would you like to add?",
                        cellFind:"What are you looking for in this spreadsheet?",
                        cellNoFind:"No results found.",
                        dragToFreezeCol:"Drag to freeze column",
                        dragToFreezeRow:"Drag to freeze row",
                        addSheet:"Add a spreadsheet",
                        openSheet:"Are you sure you want to open a different sheet?  All unsaved changes will be lost.",
                        toggleHideRow:"No row selected.",
                        toggleHideColumn:"No column selected.",
                        loopDetected:"Loop Detected",
                        newSheetTitle:"What would you like the sheet's title to be?",
                        notFoundColumn:"Column not found",
                        notFoundRow:"Row not found",
                        notFoundSheet:"Sheet not found",
                        setCellRef:"Enter the name you would like to reference the cell by.",
                        sheetTitleDefault:"Spreadsheet {index}",
                        maxRowsBrowserLimitation:"You've reached the maximum amount of rows this browser supports. Try using Chrome, FireFox, or Internet Explorer 9+",
                        maxColsBrowserLimitation:"You've reached the maximum amount of columns this browser supports. Try using Chrome, FireFox, or Internet Explorer 9+",
                        maxSizeBrowserLimitationOnOpen:"The spreadsheet you are loading is larger than the maximum size of cells this browser supports. Try using Chrome, Firefox, or Internet Explorer 9+. You can an proceed, but the spreadsheet may not work as intended."
                    },

                    /**
                     * Deletes a jQuery sheet instance
                     * @memberOf jS
                     */
                    kill:function () {
                        if (!jS) {
                            return false;
                        }
                        $(doc).unbind('keydown');
                        this.obj.fullScreen().remove();
                        (this.obj.inPlaceEdit().destroy || emptyFN)();
                        s.parent
                            .trigger('sheetKill')
                            .removeClass(jS.cl.uiParent)
                            .html('');

                        s.parent[0].jS = u;

                        this.obj.menus().remove();

                        var max = $.sheet.events.length;
                        for (var i = 0; i < max; i++) {
                            s.parent.unbind($.sheet.events[i]);
                        }

                        $.sheet.instance.splice(I, 1);
                        return true;
                    },

                    /**
                     * Event trigger for jQuery sheet, wraps jQuery's trigger event to always return jS
                     * @param {String} eventType event type
                     * @param {Array} [extraParameters]
                     * @memberOf jS
                     */
                    trigger:function (eventType, extraParameters) {
                        //wrapper for $ trigger of parent, in case of further mods in the future
                        extraParameters = extraParameters || [];
                        return s.parent.triggerHandler(eventType, [jS].concat(extraParameters));
                    },

                    /**
                     * Returns all spreadsheets within an instance as an array, builds it if it doesn't exist
                     * @param [forceRebuild]
                     * @returns {Array|spreadsheets}
                     * @memberOf jS
                     */
                    spreadsheetsToArray:function (forceRebuild) {
                        if (forceRebuild || jS.spreadsheets.length == 0) {
                            jS.cycleCellsAll(function (sheet, row, col) {
                                jS.createCell(sheet, row, col);
                            });
                        }
                        return jS.spreadsheets;
                    },

                    /**
                     * Returns singe spreadsheet from a set of spreadsheets within as instance, builds if it doesn't exist
                     * @param {Boolean} forceRebuild Enforces the spreadsheet to be rebuilt
                     * @param {Number} i Spreadsheet index
                     * @memberOf jS
                     */
                    spreadsheetToArray:function (forceRebuild, i) {
                        i = (i ? i : jS.i);
                        if (!jS.spreadsheets[i]) {
                            jS.cycleCells(function (sheet, row, col) {
                                jS.createCell(sheet, row, col);
                            });
                        }
                        return jS.spreadsheets[i];
                    },

                    /**
                     * Creates a single cell within
                     * @param {Number} sheetIndex
                     * @param {Number} rowIndex
                     * @param {Number} colIndex
                     * @param {Number} [calcCount]
                     * @param {Date} [calcLast]
                     * @param {Date} [calcDependenciesLast]
                     * @returns {jSCell}
                     * @memberOf jS
                     */
                    createCell:function (sheetIndex, rowIndex, colIndex, calcCount, calcLast, calcDependenciesLast) {
                        //first create cell
                        var sheet,
                            row,
                            jSCell,
                            jSCells,
                            table,
                            colGroup,
                            col,
                            tBody,
                            tr,
                            td,
                            $td,
                            tdsX,
                            tdsY;

                        if (!(sheet = jS.spreadsheets[sheetIndex])) { //check if spreadsheet exists, if not, create it as an array
                            sheet = jS.spreadsheets[sheetIndex] = [];
                        }

                        if (!(row = sheet[rowIndex])) { //check if row exists, if not, create it
                            row = sheet[rowIndex] = [];
                        }

                        if (!(table = jS.controls.tables[sheetIndex])) {
                            return {};
                        }
                        if (!(tBody = table.tBody)) {
                            return {};
                        }
                        if (!(tr = tBody.children[rowIndex])) {
                            return {};
                        }
                        if (!(td = tr.children[colIndex])) {
                            return {};
                        }

                        $td = $(td);

                        jSCell = row[colIndex] = td.jSCell = { //create cell
                            td:$td,
                            dependencies: [],
                            formula:td.getAttribute('data-formula') || '',
                            cellType:td.getAttribute('data-celltype') || null,
                            value:td.textContent || td.innerText || '',
                            calcCount:calcCount || 0,
                            calcLast:calcLast || -1,
                            calcDependenciesLast:calcDependenciesLast || -1,
                            sheet:sheetIndex,
                            type: 'cell',
                            jS: jS,
                            state: [],
                            needsUpdated: true,
                            uneditable: td.getAttribute('data-uneditable') || false
                        };

                        if (jSCell.formula && jSCell.formula.charAt(0) == '=') {
                            jSCell.formula = jSCell.formula.substring(1);
                        }


                        //attach cells to col
                        colGroup = table.colGroup;
                        while (!(col = colGroup.children[colIndex])) {
                            //if a col doesn't exist, it adds it here
                            col = doc.createElement('col');
                            col.setAttribute('style', 'width:' + jS.s.newColumnWidth + 'px;');
                            colGroup.appendChild(col);
                        }

                        if (!(jSCells = col.jSCells)) jSCells = col.jSCells = [];
                        jSCells.unshift(jSCell);

                        //attach td to col
                        if (!col.tds) col.tds = [];
                        col.tds.unshift(td);

                        //attach col to td
                        td.col = col;
                        td.type = 'cell';
                        td.barLeft = tr.children[0];
                        td.barTop = tBody.children[0].children[colIndex];

                        //attach cells to tr
                        if (!tr.jSCells) tr.jSCells = [];
                        tr.jSCells.unshift(jSCell);

                        //attach td's to tr
                        if (!tr.tds) tr.tds = [];
                        tr.tds.unshift(td);

                        //attach cells to table
                        if (!table.jSCells) table.jSCells = [];
                        table.jSCells.unshift(jSCell);

                        //attach td's to table
                        if (!table.tds) table.tds = [];
                        table.tds.unshift(td);

                        //attach table to td
                        td.table = table;

                        //now create row
                        if (!(tdsY = jS.controls.bar.y.td[sheetIndex])) {
                            tdsY = jS.controls.bar.y.td[sheetIndex] = [];
                        }
                        if (!tdsY[rowIndex]) {
                            tdsY[rowIndex] = $(tr.children[0]);
                        }

                        if (!(tdsX = jS.controls.bar.x.td[sheetIndex])) {
                            tdsX = jS.controls.bar.x.td[sheetIndex] = [];
                        }
                        if (!tdsX[colIndex]) {
                            tdsX[colIndex] = $(tBody.children[0].children[colIndex]);
                        }

                        //return cell
                        return jSCell;
                    },

                    /**
                     * Get cell value
                     * @memberOf jS
                     * @param {Number} rowIndex
                     * @param {Number} colIndex
                     * @param {Number} [sheetIndex] defaults to 0
                     * @returns {Object|Null}
                     */
                    getCell: function (rowIndex, colIndex, sheetIndex) {
                        var spreadsheet, row, cell;
                        sheetIndex = (sheetIndex || 0);
                        if (
                            jS.spreadsheets
                                && (spreadsheet = jS.spreadsheets[sheetIndex])
                                && (row = spreadsheet[rowIndex])
                                && (cell = row[colIndex])
                            ) {
                            return cell;
                        }
                        return null;
                    },

                    /**
                     * Tracks which spreadsheet is active to intercept keystrokes for navigation
                     * @type {Boolean}
                     * @memberOf jS
                     */
                    nav:false,

                    /**
                     * Turns off all intercept keystroke navigation instances, with exception of supplied instance index
                     * @param {Boolean} nav Instance index
                     * @memberOf jS
                     */
                    setNav:function (nav) {
                        var instance = $.sheet.instance;
                        for(var i = 0; i < instance.length; i++) {
                            (instance[i] || {}).nav = false;
                        }

                        jS.nav = nav;
                    },

                    /**
                     * Creates the different objects required by sheets
                     * @memberOf jS
                     * @type {Object}
                     * @namespace
                     */
                    controlFactory:{
                        /**
                         * Creates multi rows
                         * @param {Number} [i] row index
                         * @param {Number} [qty] the number of cells you'd like to add, if not specified, a dialog will ask
                         * @param {Boolean} [isBefore] places cells before the selected cell if set to true, otherwise they will go after, or at end
                         * @param {Boolean} [skipFormulaReParse] re-parses formulas if needed
                         * @memberOf jS.controlFactory
                         */
                        addRowMulti:function (i, qty, isBefore, skipFormulaReParse) {
                            function add(qty) {
                                if (qty) {
                                    if (!n(qty)) {
                                        jS.controlFactory.addCells(i, isBefore, parseInt(qty), 'row', skipFormulaReParse);
                                        jS.trigger('sheetAddRow', [i, isBefore, qty]);
                                    }
                                }
                            }

                            if (!qty) {
                                s.prompt(
                                    jS.msg.addRowMulti,
                                    add
                                );
                            } else {
                                add(qty);
                            }
                        },

                        /**
                         * Creates multi columns
                         * @param {Number} [i] column index
                         * @param {Number} [qty] the number of cells you'd like to add, if not specified, a dialog will ask
                         * @param {Boolean} [isBefore] places cells before the selected cell if set to true, otherwise they will go after, or at end
                         * @param {Boolean} [skipFormulaReParse] re-parses formulas if needed
                         * @memberOf jS.controlFactory
                         */
                        addColumnMulti:function (i, qty, isBefore, skipFormulaReParse) {
                            function add(qty) {
                                if (qty) {
                                    if (!n(qty)) {
                                        jS.controlFactory.addCells(i, isBefore, parseInt(qty), 'col', skipFormulaReParse);
                                        jS.trigger('sheetAddColumn', [i, isBefore, qty]);
                                    }
                                }
                            }

                            if (!qty) {
                                s.prompt(
                                    jS.msg.addColumnMulti,
                                    add
                                );
                            } else {
                                add(qty);
                            }
                        },

                        /**
                         * Creates cells for sheet and the bars that go along with them
                         * @param {Number} [i] index where cells should be added, if null, cells go to end
                         * @param {Boolean} [isBefore] places cells before the selected cell if set to true, otherwise they will go after, or at end;
                         * @param {Number} [qty] how many rows/columns to add
                         * @param {String} [type] "row" or "col", default "col"
                         * @param {Boolean} [skipFormulaReParse] re-parses formulas if needed
                         * @memberOf jS.controlFactory
                         */
                        addCells:function (i, isBefore, qty, type, skipFormulaReParse) {
                            //hide the autoFiller, it can get confused
                            jS.autoFillerHide();

                            jS.setDirty(true);
                            jS.setChanged(true);
                            jS.obj.barHelper().remove();

                            var $sheet = jS.obj.table(),
                                sheet = $sheet[0],
                                sheetSize = jS.sheetSize(sheet),
                                isLast = false,
                                activeCell = jS.obj.tdActive(),
                                o;

                            qty = qty || 1;
                            type = type || 'col';

                            if (i == u) {
                                i = (type == 'row' ? sheetSize.rows : sheetSize.cols);
                                isLast = true;
                            }

                            switch (type) {
                                case "row":
                                    if ($.sheet.max) {
                                        //if current size is less than max, but the qty needed is more than the max
                                        if ($.sheet.max > sheetSize.rows && $.sheet.max <= sheetSize.rows + qty) {
                                            qty = $.sheet.max - sheetSize.rows;

                                        //if current size is more than max
                                        } else if ($.sheet.max && $.sheet.max <= sheetSize.rows + qty) {
                                            if (!jS.isBusy()) {
                                                s.alert(jS.msg.maxRowsBrowserLimitation);
                                            }
                                            return false;
                                        }
                                    }
                                    o = {
                                        el:function () {
                                            //table / tBody / tr / td
                                            var tds = jS.rowTds(sheet, i);
                                            if (!tds || !tds[0]) return [];
                                            return [tds[0].parentNode];
                                        },
                                        size:function () {
                                            if (!o.Size) {
                                                var tr = o.el()[0];
                                                o.Size = tr.children.length - 1;
                                            }
                                            return o.Size;
                                        },
                                        loc:function () {
                                            var tr = o.el();
                                            return jS.getTdLocation(tr[0].children);
                                        },
                                        trs: [],
                                        newObj:function () {
                                            var j = o.size(),
                                                tr = doc.createElement('tr');

                                            tr.setAttribute('style', 'height: ' + s.colMargin + 'px;');
                                            for (var i = 0; i <= j; i++) {
                                                var td = doc.createElement('td');
                                                if (i == 0) {
                                                    td.setAttribute('class', jS.cl.barLeft + ' ' + jS.cl.uiBar);
                                                    td.entity = 'left';
                                                    td.type = 'bar';
                                                }
                                                tr.appendChild(td);
                                            }

                                            o.trs.push(tr);

                                            return tr;
                                        },
                                        offset:{row:qty, col:0},
                                        start:function () {
                                            return {row:(isBefore ? i : i + qty)};
                                        },
                                        createCells:function () {
                                            for (var row = 0; row < o.trs.length; row++) {
                                                var offset = (isBefore ? 0 : 1) + i;
                                                jS.spreadsheets[jS.i].splice(row + offset, 0, []);
                                                for (var col = 0; col < o.trs[row].children.length; col++) {
                                                    if (col == 0) {//skip bar
                                                        jS.controls.bar.y.td[jS.i].splice(row + offset, 0, $(o.trs[row].children[col]));
                                                    } else {
                                                        jS.createCell(jS.i, row + offset, col);
                                                    }
                                                }
                                            }

                                            jS.refreshRowLabels(i);
                                        }
                                    };
                                    break;
                                case "col":
                                    if ($.sheet.max) {
                                        //if current size is less than max, but the qty needed is more than the max
                                        if ($.sheet.max > sheetSize.cols && $.sheet.max <= sheetSize.cols + qty) {
                                            qty = $.sheet.max - sheetSize.cols;

                                            //if current size is more than max
                                        } else if ($.sheet.max && $.sheet.max <= sheetSize.cols + qty) {
                                            if (!jS.isBusy()) {
                                                s.alert(jS.msg.maxColsBrowserLimitation);
                                            }
                                            return false;
                                        }
                                    }
                                    o = {
                                        el:function () {
                                            var tdStart = jS.rowTds(sheet, 1)[i],
                                                lastRow = jS.rowTds(sheet),
                                                tdEnd = lastRow[lastRow.length - 1],
                                                loc2 = jS.getTdLocation(tdEnd),

                                                tds = [];

                                            for (var j = 0; j <= loc2.row; j++) {
                                                tds.push(sheet.tBody.children[j].children[i]);
                                            }

                                            return tds;
                                        },
                                        col:function () {
                                            return jS.col(sheet, i);
                                        },
                                        cols: [],
                                        newCol:function () {
                                            var col = doc.createElement('col');
                                            col.setAttribute('style', 'width:' + jS.s.newColumnWidth + 'px;');
                                            o.cols.push(col);
                                            return col;
                                        },
                                        loc:function (tds) {
                                            tds = (tds ? tds : o.el());
                                            return jS.getTdLocation(tds[0]);
                                        },
                                        tds: [],
                                        newObj:function () {
                                            var td = doc.createElement('td');
                                            o.tds.push(td);
                                            return td;
                                        },
                                        offset:{row:0, col:qty},
                                        start:function () {
                                            return {col:(isBefore ? i : i + qty)};
                                        },
                                        createCells:function () {
                                            var rows = jS.rows(sheet);
                                            for (var row = 0; row < rows.length; row++) {
                                                var col = (isBefore ? 0 : 1) + i,
                                                    colMax = col + qty,
                                                    j = 0;
                                                for (col; col < colMax; col++) {
                                                    var td = sheet.tBody.children[row].children[col],
                                                        $td = $(td);
                                                    if (row == 0) {
                                                        jS.controls.bar.x.td[jS.i].splice(col, 0, $td);
                                                        td.innerText = jSE.columnLabelString(col);
                                                        td.className = jS.cl.barTop + ' ' + jS.cl.uiBar;
                                                        td.type = 'bar';
                                                        td.entity = 'top';

                                                        o.cols[j].setAttribute('style', 'width:' + jS.s.newColumnWidth + 'px;');
                                                        o.cols[j].bar = td;
                                                        j++;
                                                    } else {
                                                        jS.spreadsheets[jS.i][row].splice(col, 0, {});
                                                        jS.createCell(jS.i, row, col);
                                                    }
                                                }
                                            }

                                            jS.refreshColumnLabels(i);
                                        }
                                    };
                                    break;
                            }

                            var el = o.el(),
                                loc = o.loc(el),
                                col,
                                j = el.length - 1,
                                k;

                            if (isBefore) {
                                do {
                                    k = qty - 1;
                                    do {
                                        el[j].parentNode.insertBefore(o.newObj(), el[j]);
                                    } while (k--);
                                } while (j--);

                                if (o.newCol) {
                                    col = o.col();
                                    k = qty - 1;
                                    do {
                                        col.parentNode.insertBefore(o.newCol(), col);
                                    } while (k--);
                                }
                            } else {
                                do {
                                    k = qty - 1;
                                    do {
                                        insertAfter(o.newObj(), el[j]);
                                    } while (k--);
                                } while (j--);

                                if (o.newCol) {
                                    col = o.col();
                                    k = qty - 1;
                                    do {
                                        insertAfter(o.newCol(), col)
                                    } while (k--);
                                }
                            }

                            o.createCells();

                            if (!skipFormulaReParse && isLast != true) {
                                //offset formulas
                                jS.offsetFormulas(loc, o.offset, isBefore);
                            }

                            jS.obj.pane().resizeScroll(true);

                            if (activeCell && activeCell[0] && activeCell[0].cellIndex && activeCell[0].parentNode) {
                                jS.colLast = activeCell[0].cellIndex;
                                jS.rowLast = activeCell[0].parentNode.rowIndex;
                            }

                            return true;
                        },

                        /**
                         * creates single row
                         * @param {Number} [i] row index
                         * @param {Boolean} [isBefore] places cells before the selected cell if set to true, otherwise they will go after, or at end
                         * @memberOf jS.controlFactory
                         */
                        addRow:function (i, isBefore) {
                            jS.controlFactory.addCells(i, isBefore, 1, 'row');
                            jS.trigger('sheetAddRow', [i, isBefore, 1]);
                        },

                        /**
                         * creates single column
                         * @param {Number} [i], column index
                         * @param {Boolean} [isBefore] places cells before the selected cell if set to true, otherwise they will go after, or at end
                         * @memberOf jS.controlFactory
                         */
                        addColumn:function (i, isBefore) {
                            jS.controlFactory.addCells(i, isBefore, 1, 'col');
                            jS.trigger('sheetAddColumn', [i, isBefore, 1]);
                        },

                        /**
                         * Creates all the bars to the left of the spreadsheet, if they exist, they are first removed
                         * @param {jQuery|HTMLElement} table Table of spreadsheet
                         * @memberOf jS.controlFactory
                         */
                        barLeft:function (table) {
                            var tr = table.tBody.children,
                                i = tr.length - 1;

                            //table / tBody / tr
                            if (i > -1) {
                                do {
                                    tr[i].insertBefore(doc.createElement('td'), tr[i].children[0]);
                                } while(i-- > 1); //We only go till row 1, row 0 is handled by barTop with corner etc
                            }
                        },

                        /**
                         * Creates all the bars to the top of the spreadsheet on colGroup col elements, if they exist, they are first removed
                         * @param {HTMLElement} table representing spreadsheet
                         * @memberOf jS.controlFactory
                         */
                        barTop:function (table) {
                            var colGroup = table.colGroup,
                                cols = colGroup.children,
                                i,
                                trFirst = table.tBody.children[0],

                                colCorner = doc.createElement('col'), //left column & corner
                                tdCorner = doc.createElement('td'),

                                barTopParent = doc.createElement('tr');

                            //If the col elements outnumber the td's, get rid of the extra as it messes with the ui
                            while (cols.length > trFirst.children.length) {
                                colGroup.removeChild(cols[cols.length -1]);
                            }

                            colCorner.width = s.colMargin + 'px';
                            colCorner.style.width = colCorner.width;
                            colGroup.insertBefore(colCorner, colGroup.children[0]); //end col corner

                            barTopParent.appendChild(tdCorner);

                            barTopParent.className = jS.cl.barTopParent;
                            table.tBody.insertBefore(barTopParent, table.tBody.children[0]);
                            table.barTopParent = barTopParent;
                            table.corner = tdCorner;
                            jS.controls.barTopParent[jS.i] = $(barTopParent);

                            i = trFirst.children.length - 1;

                            do {
                                var td = doc.createElement('td');
                                if (!cols[i]) {
                                    cols[i] = doc.createElement('col');
                                    colGroup.insertBefore(cols[i], colCorner.nextSibling);

                                }

                                cols[i].bar = td;
                                td.col = cols[i];
                                barTopParent.insertBefore(td, tdCorner.nextSibling);
                            } while (i-- > 0);

                            table.barTop = jS.controls.barTopParent[jS.i].children();

                            return barTopParent;
                        },

                        /**
                         * Creates the draggable objects for freezing cells
                         * @type {Object}
                         * @memberOf jS.controlFactory
                         * @namespace
                         */
                        barHandleFreeze:{

                            /**
                             * @param {jQuery|HTMLElement} pane
                             * @returns {Boolean}
                             * @memberOf jS.controlFactory.barHandleFreeze
                             */
                            top:function (pane) {
                                if (jS.isBusy()) {
                                    return false;
                                }
                                var frozenAt = jS.frozenAt(),
                                    scrolledTo = jS.scrolledTo();
                                if (!(scrolledTo.end.col <= frozenAt.col + 1)) {
                                    return false;
                                }

                                jS.obj.barHelper().remove();

                                var bar = jS.obj.barTop(frozenAt.col + 1),
                                    pos = bar.position(),
                                    highlighter,
                                    offset = $(pane).offset(),
                                    handle = doc.createElement('div'),
                                    $handle = pane.freezeHandleTop = $(handle)
                                        .appendTo(pane)
                                        .addClass(jS.cl.uiBarHandleFreezeTop + ' ' + jS.cl.barHelper + ' ' + jS.cl.barHandleFreezeTop)
                                        .height(bar.height())
                                        .css('left', (pos.left - handle.clientWidth) + 'px')
                                        .attr('title', jS.msg.dragToFreezeCol),
                                    tds = pane.table.barTop;


                                jS.controls.bar.helper[jS.i] = jS.obj.barHelper().add(handle);
                                jS.controls.bar.x.handleFreeze[jS.i] = $handle;

                                jS.draggable($handle, {
                                    axis:'x',
                                    start:function () {
                                        jS.setBusy(true);

                                        highlighter = $(doc.createElement('div'))
                                            .appendTo(pane)
                                            .css('position', 'absolute')
                                            .addClass('ui-state-highlight ' + jS.cl.barHelper)
                                            .height(pane.table.corner.clientHeight)
                                            .fadeTo(0,0.33);
                                    },
                                    drag:function() {
                                        var target = jS.nearest($handle, tds).prev();
                                        if (target.length && target.position) {
                                            highlighter.width(target.position().left + target.width());
                                        }
                                    },
                                    stop:function (e, ui) {
                                        highlighter.remove();
                                        jS.setBusy(false);
                                        jS.setDirty(true);
                                        var target = jS.nearest($handle, tds);
                                        jS.obj.barHelper().remove();
                                        jS.scrolledTo().end.col = jS.frozenAt().col = jS.getTdLocation(target).col - 1;
                                        jS.evt.scroll.start('x', pane);
                                    },
                                    containment:[offset.left, offset.top, math.min(offset.left + pane.table.clientWidth, offset.left + pane.clientWidth - win.scrollBarSize.width), offset.top]
                                });

                                return true;
                            },

                            /**
                             *
                             * @param {jQuery|HTMLElement} pane
                             * @returns {Boolean}
                             * @memberOf jS.controlFactory.barHandleFreeze
                             */
                            left:function (pane) {
                                if (jS.isBusy()) {
                                    return false;
                                }
                                var frozenAt = jS.frozenAt(),
                                    scrolledTo = jS.scrolledTo();
                                if (!(scrolledTo.end.row <= (frozenAt.row + 1))) {
                                    return false;
                                }

                                jS.obj.barHelper().remove();

                                var bar = $(pane.table.tBody.children[frozenAt.row + 1].children[0]),
                                    pos = bar.position(),
                                    highlighter,
                                    offset = $(pane).offset(),
                                    handle = doc.createElement('div'),
                                    $handle = pane.freezeHandleLeft = $(handle)
                                        .appendTo(pane)
                                        .addClass(jS.cl.uiBarHandleFreezeLeft + ' ' + jS.cl.barHelper + ' ' + jS.cl.barHandleFreezeLeft)
                                        .width(bar.width())
                                        .css('top', (pos.top - handle.clientHeight) + 'px')
                                        .attr('title', jS.msg.dragToFreezeRow),
                                        trs = $(pane.table.tBody.children);

                                jS.controls.bar.helper[jS.i] = jS.obj.barHelper().add(handle);
                                jS.controls.bar.y.handleFreeze[jS.i] = $handle;

                                jS.draggable($handle, {
                                    axis:'y',
                                    start:function () {
                                        jS.setBusy(true);

                                        highlighter = $(doc.createElement('div'))
                                            .appendTo(pane)
                                            .css('position', 'absolute')
                                            .addClass('ui-state-highlight ' + jS.cl.barHelper)
                                            .width(handle.clientWidth)
                                            .fadeTo(0,0.33);
                                    },
                                    drag:function() {
                                        var target = jS.nearest($handle, trs).prev();
                                        if (target.length && target.position) {
                                            highlighter.height(target.position().top + target.height());
                                        }
                                    },
                                    stop:function (e, ui) {
                                        highlighter.remove();
                                        jS.setBusy(false);
                                        jS.setDirty(true);
                                        var target = jS.nearest($handle, trs);
                                        jS.obj.barHelper().remove();
                                        jS.scrolledTo().end.row = jS.frozenAt().row = math.max(jS.getTdLocation(target.children(0)).row - 1, 0);
                                        jS.evt.scroll.start('y', pane);
                                    },
                                    containment:[offset.left, offset.top, offset.left, math.min(offset.top + pane.table.clientHeight, offset.top + pane.clientHeight - win.scrollBarSize.height)]
                                });

                                return true;
                            },

                            /**
                             * @memberOf jS.controlFactory.barHandleFreeze
                             */
                            corner:function () {
                            }
                        },

                        /**
                         *
                         * Creates menus for contextual menus and top bar button
                         * @param bar
                         * @param menuItems
                         * @returns {jQuery|HTMLElement}
                         * @memberOf jS.controlFactory
                         */
                        menu:function (bar, menuItems) {
                            var menu, buttons = $([]);

                            switch (bar) {
                                case "top":
                                    menu = $(doc.createElement('div'))
                                        .addClass(jS.cl.uiMenu + ' ' + jS.cl.tdMenu);
                                    jS.controls.bar.x.menu[jS.i] = menu;
                                    break;
                                case "left":
                                    menu = $(doc.createElement('div'))
                                        .addClass(jS.cl.uiMenu + ' ' + jS.cl.tdMenu);
                                    jS.controls.bar.y.menu[jS.i] = menu;
                                    break;
                                case "cell":
                                    menu = $(doc.createElement('div'))
                                        .addClass(jS.cl.uiMenu + ' ' + jS.cl.tdMenu);
                                    jS.controls.tdMenu[jS.i] = menu;
                                    break;
                            }

                            jS.controls.menus[jS.i] = jS.obj.menus().add(menu);

                            menu
                                .mouseleave(function () {
                                    menu.hide();
                                })
                                .bind('contextmenu', function() {return false;})
                                .appendTo($body)
                                .hide()
                                .disableSelectionSpecial();

                            for (var msg in menuItems) {
                                if (menuItems[msg]) {
                                    if ($.isFunction(menuItems[msg])) {
                                        buttons.pushStack(
                                            $(doc.createElement('div'))
                                                .text(msg)
                                                .data('msg', msg)
                                                .click(function () {
                                                    menuItems[$(this).data('msg')].call(this, jS);
                                                    menu.hide();
                                                    return false;
                                                })
                                                .appendTo(menu)
                                                .hover(function() {
                                                    buttons.removeClass('ui-state-highlight');
                                                    $(this).addClass('ui-state-highlight');
                                                }, function() {
                                                    $(this).removeClass('ui-state-highlight');
                                                })
                                        );

                                    } else if (menuItems[msg] == 'line') {
                                        $(doc.createElement('hr')).appendTo(menu);
                                    }
                                }
                            }

                            return menu;
                        },

                        /**
                         * Creates items within menus using jQuery.sheet.instance.msg
                         * @memberOf jS.controlFactory
                         * @namespace
                         */
                        barMenu:{

                            /**
                             * @param {Object} e jQuery event
                             * @param {Number} i column
                             * @param {jQuery|HTMLElement} target
                             * @returns {*}
                             * @memberOf jS.controlFactory.barMenu
                             */
                            top:function (e, i, target) {
                                if (jS.isBusy()) {
                                    return false;
                                }
                                var menu = jS.obj.barMenuTop().hide();

                                if (!menu.length) {
                                    menu = jS.controlFactory.menu('top', s.contextmenuTop);
                                }

                                jS.obj.menus().hide();

                                if (!target) {
                                    menu
                                        .css('left', (e.pageX - 5) + 'px')
                                        .css('top', (e.pageY - 5) + 'px')
                                        .show();
                                    return menu;
                                }

                                var barMenuParentTop = jS.obj.barMenuParentTop().hide();

                                if (!barMenuParentTop.length) {

                                    barMenuParentTop = $(doc.createElement('div'))
                                        .addClass(jS.cl.uiBarMenuTop + ' ' + jS.cl.barHelper + ' ' + jS.cl.barTopMenuButton)
                                        .append(
                                            $(doc.createElement('span'))
                                                .addClass('ui-icon ui-icon-triangle-1-s')
                                        )
                                        .mousedown(function (e) {
                                            barMenuParentTop.parent()
                                                .mousedown()
                                                .mouseup();

                                            var offset = barMenuParentTop.offset();

                                            menu
                                                .css('left', (e.pageX - 5) + 'px')
                                                .css('top', (e.pageY - 5) + 'px')
                                                .show();
                                        })
                                        .blur(function () {
                                            if (menu) menu.hide();
                                        })
                                        .bind('destroy', function () {
                                            barMenuParentTop.remove();
                                            jS.controls.bar.x.menuParent[jS.i] = null;
                                        });

                                    jS.controls.bar.x.menuParent[jS.i] = barMenuParentTop;
                                }

                                barMenuParentTop
                                    .prependTo(target)
                                    .show();
                            },

                            /**
                             *
                             * @param e
                             * @param i
                             * @returns {Boolean}
                             * @memberOf jS.controlFactory.barMenu
                             */
                            left:function (e, i) {
                                if (jS.isBusy()) {
                                    return false;
                                }
                                jS.obj.barMenuLeft().hide();

                                if (i) {
                                    jS.obj.barHandleFreezeLeft().remove();
                                }
                                var menu;

                                menu = jS.obj.barMenuLeft();

                                if (!menu.length) {
                                    menu = jS.controlFactory.menu('left', s.contextmenuLeft);
                                }

                                jS.obj.menus().hide();

                                menu
                                    .css('left', (e.pageX - 5) + 'px')
                                    .css('top', (e.pageY - 5) + 'px')
                                    .show();

                                return true;
                            },

                            /**
                             * @memberOf jS.controlFactory.barMenu
                             */
                            corner:function () {
                            }
                        },


                        /**
                         * Creates contextual menus for cells (a right click menu)
                         * @param {Object} e jQuery event
                         * @returns {Boolean}
                         * @memberOf jS.controlFactory
                         */
                        tdMenu:function (e) {
                            if (jS.isBusy()) {
                                return false;
                            }
                            jS.obj.tdMenu().hide();

                            var menu = jS.obj.tdMenu();

                            if (!menu.length) {
                                menu = jS.controlFactory.menu('cell', s.contextmenuCell);
                            }

                            jS.obj.menus().hide();

                            menu
                                .css('left', (e.pageX - 5) + 'px')
                                .css('top', (e.pageY - 5) + 'px')
                                .show();

                            return true;
                        },


                        /**
                         * Creates the control/container for everything above the spreadsheet, removes them if they already exist
                         * @memberOf jS.controlFactory
                         */
                        header:function () {
                            jS.obj.header().remove();
                            jS.obj.sheetAdder().remove();
                            jS.obj.tabContainer().remove();

                            var header = doc.createElement('div'),
                                firstRow = doc.createElement('table'),
                                firstRowTr = doc.createElement('tr'),
                                secondRow,
                                secondRowTr,
                                title = doc.createElement('td'),
                                label,
                                menuLeft,
                                menuRight,
                                formula,
                                formulaParent;

                            header.appendChild(firstRow);
                            firstRow.appendChild(firstRowTr);
                            header.className = jS.cl.header + ' ' + jS.cl.uiControl;

                            jS.controls.header = $(header);

                            if (s.title) {
                                if ($.isFunction(s.title)) {
                                    s.title = jS.title(jS, I);
                                }

                                title.className = jS.cl.title;
                                jS.controls.title = $(title).html(s.title)
                            } else {
                                $(title).hide();
                            }
                            firstRowTr.appendChild(title);

                            //Sheet Menu Control
                            function makeMenu(menu) {
                                if ($.isFunction(menu)) {
                                    menu = $(menu.call(jS));
                                } else {
                                    menu = $(menu);
                                }

                                if (menu.is('ul')) {
                                    menu
                                        .find("ul").hide()
                                        .addClass(jS.cl.uiMenuUl);

                                    menu
                                        .find("li")
                                        .addClass(jS.cl.uiMenuLi)
                                        .hover(function () {
                                            $(this).find('ul:first')
                                                .hide()
                                                .show();
                                        }, function () {
                                            $(this).find('ul:first')
                                                .hide();
                                        });
                                }
                                return menu;
                            }

                            if (jS.isSheetEditable()) {
                                if (s.menuLeft) {
                                    menuLeft = doc.createElement('td');
                                    menuLeft.className = jS.cl.menu + ' ' + jS.cl.menuFixed;
                                    firstRowTr.insertBefore(menuLeft, title);

                                    jS.controls.menuLeft[jS.i] = $(menuLeft)
                                        .append(makeMenu(s.menuLeft));

                                    jS.controls.menuLeft[jS.i].find('img').load(function () {
                                        jS.sheetSyncSize();
                                    });
                                }

                                if (s.menuRight) {
                                    menuRight = doc.createElement('td');
                                    menuRight.className = jS.cl.menu + ' ' + jS.cl.menuFixed;
                                    firstRowTr.appendChild(menuRight);

                                    jS.controls.menuRight[jS.i] = $(menuRight)
                                        .append(makeMenu(s.menuRight));

                                    jS.controls.menuRight[jS.i].find('img').load(function () {
                                        jS.sheetSyncSize();
                                    });
                                }

                                label = doc.createElement('td');
                                label.className = jS.cl.label;
                                jS.controls.label = $(label);

                                //Edit box menu
                                formula = doc.createElement('textarea');
                                formula.className = jS.cl.formula;
                                formula.onkeydown = jS.evt.formula.keydown;
                                formula.onkeyup = function () {
                                    jS.obj.inPlaceEdit().value = this.value;
                                };
                                formula.onchange = function () {
                                    jS.obj.inPlaceEdit().value = this.value;
                                };
                                formula.onpaste = jS.evt.pasteOverCells;
                                formula.onfocus = function () {
                                    jS.setNav(false);
                                };
                                formula.onfocusout = function () {
                                    jS.setNav(true);
                                };
                                formula.onblur = function () {
                                    jS.setNav(true);
                                };
                                jS.controls.formula = $(formula);

                                // resizable formula area - a bit hard to grab the handle but is there!
                                var formulaResize = doc.createElement('span');
                                formulaResize.appendChild(formula);

                                secondRow = doc.createElement('table');
                                secondRowTr = doc.createElement('tr');
                                secondRow.appendChild(secondRowTr);

                                header.appendChild(secondRow);


                                formulaParent = doc.createElement('td');
                                formulaParent.className = jS.cl.formulaParent;
                                formulaParent.appendChild(formulaResize);
                                secondRowTr.appendChild(label);
                                secondRowTr.appendChild(formulaParent);

                                jS.resizableSheet($(formulaResize), {
                                    minHeight:jS.controls.formula.height(),
                                    maxHeight:78,
                                    handles:'s',
                                    resize:function (e, ui) {
                                        jS.controls.formula.height(ui.size.height);
                                    },
                                    stop: function() {
                                        jS.sheetSyncSize();
                                    }
                                });

                                var instance = $.sheet.instance;
                                for(var i = 0; i < instance.length; i++) {
                                    (instance || {}).nav = false;
                                }

                                jS.setNav(true);

                                $(doc).keydown(jS.evt.doc.keydown);
                            }

                            return header;
                        },

                        /**
                         * Creates the user interface for spreadsheets
                         * @memberOf jS.controlFactory
                         */
                        ui:function () {
                            var ui = doc.createElement('div');
                            ui.setAttribute('class', jS.cl.ui);
                            jS.controls.ui = $(ui);
                            return ui;
                        },

                        sheetAdder: function () {
                            var addSheet = doc.createElement('span');
                            if (jS.isSheetEditable()) {
                                addSheet.setAttribute('class', jS.cl.sheetAdder + ' ' + jS.cl.tab + ' ' + jS.cl.uiTab + ' ui-corner-bottom');
                                addSheet.setAttribute('title', jS.msg.addSheet);
                                addSheet.innerHTML = '&nbsp;+&nbsp;';
                                addSheet.onmousedown = function () {
                                    jS.addSheet();

                                    return false;
                                };
                                addSheet.i = -1;
                            }
                            return jS.controls.sheetAdder = $(addSheet);
                        },

                        /**
                         * Creates the tab interface for spreadsheets
                         * @memberOf jS.controlFactory
                         */
                        tabContainer:function () {
                            var tabContainer = doc.createElement('span'),
                                startPosition;
                            tabContainer.setAttribute('class', jS.cl.tabContainer);

                            tabContainer.onmousedown = function (e) {
                                e = e || win.event;

                                var i = (e.target || e.srcElement).i;
                                if (i >= 0) {
                                    jS.trigger('sheetSwitch', [i]);
                                }
                                return false;
                            };
                            tabContainer.ondblclick = function (e) {
                                e = e || win.event;
                                var i = (e.target || e.srcElement).i;
                                if (i >= 0) {
                                    jS.trigger('sheetRename', [i]);
                                }
                                return false;
                            };


                            if (jS.isSheetEditable() && $.fn.sortable) {
                                    return jS.controls.tabContainer = $(tabContainer).sortable({
                                        placeholder:'ui-state-highlight',
                                        axis:'x',
                                        forceHelperSize:true,
                                        forcePlaceholderSize:true,
                                        opacity:0.6,
                                        start:function (e, ui) {
                                            startPosition = ui.item.index();
                                            jS.trigger('sheetTabSortStart', [e, ui]);
                                        },
                                        update:function (e, ui) {
                                            jS.trigger('sheetTabSortUpdate', [e, ui, startPosition]);
                                        }
                                    });
                                }

                            return jS.controls.tabContainer = $(tabContainer);
                        },

                        /**
                         * Creates the scrolling system used by each spreadsheet
                         * @param enclosure
                         * @param pane
                         * @param sheet
                         * @memberOf jS.controlFactory
                         */
                        scrollUI:function (enclosure, pane, sheet) {
                            var scrollOuter = pane.scrollOuter = doc.createElement('div'),
                                scrollInner = pane.scrollInner = doc.createElement('div'),
                                scrollStyleX = pane.scrollStyleX = doc.createElement('style'),
                                scrollStyleY = pane.scrollStyleY = doc.createElement('style'),
                                $pane = $(pane);

                            scrollOuter.setAttribute('class', jS.cl.scroll);
                            scrollOuter.appendChild(scrollInner);

                            scrollOuter.onscroll = function() {
                                if (!jS.isBusy()) {
                                    jS.evt.scroll.scrollTo({axis:'x', pixel:scrollOuter.scrollLeft});
                                    jS.evt.scroll.scrollTo({axis:'y', pixel:scrollOuter.scrollTop});

                                    jS.autoFillerGoToTd();
                                    if (pane.inPlaceEdit) {
                                        pane.inPlaceEdit.goToTd();
                                    }
                                }
                            };

                            scrollOuter.onmousedown = function() {
                                jS.obj.barHelper().remove();
                            };

                            jS.controls.scroll[jS.i] = $(scrollOuter)
                                .disableSelectionSpecial();

                            jS.controls.scrolls = jS.obj.scrolls().add(scrollOuter);

                            scrollStyleX.updateStyle = function (indexes, style) {
                                indexes = indexes || [];

                                if (indexes.length != this.i || style) {
                                    this.i = indexes.length || this.i;

                                    style = style || self.nthCss('col', '#' + jS.id + jS.i, indexes, jS.frozenAt().col + 1) +
                                        self.nthCss('td', '#' + jS.id + jS.i + ' ' + 'tr', indexes, jS.frozenAt().col + 1);

                                    this.css(style);

                                    jS.scrolledTo();

                                    if (indexes.length) {
                                        jS.scrolledArea[jS.i].start.col = math.max(indexes.pop() || 1, 1);
                                        jS.scrolledArea[jS.i].end.col = math.max(indexes.shift() || 1, 1);
                                    }

                                    jS.obj.barHelper().remove();
                                }
                            };

                            scrollStyleY.updateStyle = function (indexes, style) {
                                indexes = indexes || [];

                                if (indexes.length != this.i || style) {
                                    this.i = indexes.length || this.i;

                                    style = style || self.nthCss('tr', '#' + jS.id + jS.i, indexes, jS.frozenAt().row + 1);

                                    this.css(style);

                                    jS.scrolledTo();

                                    if (indexes.length) {
                                        jS.scrolledArea[jS.i].start.row = math.max(indexes.pop() || 1, 1);
                                        jS.scrolledArea[jS.i].end.row = math.max(indexes.shift() || 1, 1);
                                    }

                                    jS.obj.barHelper().remove();
                                }
                            };

                            pane.appendChild(scrollStyleX);
                            pane.appendChild(scrollStyleY);

                            jS.controlFactory.styleUpdater(scrollStyleX);
                            jS.controlFactory.styleUpdater(scrollStyleY);

                            jS.controls.bar.x.scroll[jS.i] = scrollStyleX;
                            jS.controls.bar.y.scroll[jS.i] = scrollStyleY;

                            var xStyle,
                                yStyle,
                                sheetWidth,
                                sheetHeight,
                                enclosureWidth,
                                enclosureHeight,
                                firstRow = sheet.tBody.children[0];

                            pane.resizeScroll = function (justTouch) {
                                if (justTouch) {
                                    xStyle = scrollStyleX.styleString();
                                    yStyle = scrollStyleY.styleString();
                                } else {
                                    xStyle = (sheet.clientWidth <= enclosure.clientWidth ? '' : scrollStyleX.styleString());
                                    yStyle = (sheet.clientHeight <= enclosure.clientHeight ? '' : scrollStyleY.styleString());
                                }

                                scrollStyleX.updateStyle(null, ' ');
                                scrollStyleY.updateStyle(null, ' ');

                                sheetWidth = (firstRow.clientWidth || sheet.clientWidth) + 'px';
                                sheetHeight = sheet.clientHeight + 'px';
                                enclosureWidth = enclosure.clientWidth + 'px';
                                enclosureHeight = enclosure.clientHeight + 'px';

                                scrollInner.style.width = sheetWidth;
                                scrollInner.style.height = sheetHeight;

                                scrollOuter.style.width = enclosureWidth;
                                scrollOuter.style.height = enclosureHeight;

                                jS.evt.scroll.start('x', pane);
                                jS.evt.scroll.start('y', pane);

                                scrollStyleX.updateStyle(null, xStyle);
                                scrollStyleY.updateStyle(null, yStyle);

                                if (pane.inPlaceEdit) {
                                    pane.inPlaceEdit.goToTd();
                                }
                            };

                            /*
                            * Mousewheel rewrites itself the first time it is triggered in order to perform faster*/
                            var chooseMouseWheel = function (e) {
                                e = e || win.event;
                                var mousewheel;
                                if ("mousewheel" == e.type) {
                                    var div = function (a, b) {
                                            return 0 != a % b ? a : a / b;
                                        },
                                        scrollNoXY = 1;
                                    if (e.wheelDeltaX !== u) {
                                        mousewheel = function(e) {
                                            e = e || win.event;
                                            scrollOuter.scrollTop += div(-e.wheelDeltaY, scrollNoXY);
                                            scrollOuter.scrollLeft += div(-e.wheelDeltaX, scrollNoXY);
                                            return false;
                                        };
                                    } else {
                                        mousewheel = function(e) {
                                            e = e || win.event;
                                            scrollOuter.scrollTop += div(-e.wheelDelta, scrollNoXY);
                                            return false;
                                        };
                                    }
                                } else {
                                    mousewheel = function(e) {
                                        if (this.detail = (e.detail || e.deltaX || e.deltaY)) {
                                            (9 < this.detail ? this.detail = 3 : -9 > this.detail && (this.detail = -3));
                                            var top = 0, left = 0;
                                            switch (this.detail) {
                                                case 1:
                                                case -1:
                                                    left = this.detail * 50;
                                                    break;
                                                case 3:
                                                case -3:
                                                    top = this.detail * 15;
                                                    break;
                                            }

                                            scrollOuter.scrollTop += top;
                                            scrollOuter.scrollLeft += left;
                                        }
                                        return false;
                                    };
                                }
                                $pane.mousewheel(mousewheel);
                                return false;
                            };

                            $pane.mousewheel(chooseMouseWheel);

                            return scrollOuter;
                        },

                        styleUpdater: function (style){
                            if (style.styleSheet) {
                                style.css = function (css) {
                                    this.styleSheet.disabled = false;//IE8 bug, for some reason in some scenarios disabled never becomes enabled.  And even setting here don't actually set it, it just ensures that is is set to disabled = false when the time is right
                                    if (!this.styleSheet.disabled) {
                                        this.styleSheet.cssText = css;
                                    }
                                };
                                style.touch = function () {};
                                style.styleString = function() {
                                    this.styleSheet.disabled = false;//IE8 bug, for some reason in some scenarios disabled never becomes enabled.  And even setting here don't actually set it, it just ensures that is is set to disabled = false when the time is right
                                    if (!this.styleSheet.disabled) {
                                        return this.styleSheet.cssText;
                                    }
                                    return '';
                                };
                            } else {
                                style.css = function (css) {
                                    this.innerHTML = css;
                                };
                                style.touch = function () {
                                    this.innerHTML = this.innerHTML + ' ';
                                };
                                style.styleString = function() {
                                    return this.innerHTML;
                                };
                            }
                        },

                        hide:function (enclosure, pane, sheet) {
                            pane = pane || jS.obj.pane();

                            var toggleHideStyleX = doc.createElement('style'),
                                toggleHideStyleY = doc.createElement('style'),
                                hiddenRows,
                                hiddenColumns,
                                i;

                            toggleHideStyleX.updateStyle = function (e) {
                                var style = self.nthCss('col', '#' + jS.id + jS.i, jS.toggleHide.hiddenColumns[jS.i], 0) +
                                    self.nthCss('td', '#' + jS.id + jS.i + ' tr', jS.toggleHide.hiddenColumns[jS.i], 0);

                                this.css(style);

                                jS.autoFillerGoToTd();
                            };

                            toggleHideStyleY.updateStyle = function (e) {
                                var style = self.nthCss('tr', '#' + jS.id + jS.i, jS.toggleHide.hiddenRows[jS.i], 0);

                                this.css(style);

                                jS.autoFillerGoToTd();
                            };

                            jS.controls.toggleHide.x[jS.i] = $(toggleHideStyleX);
                            jS.controls.toggleHide.y[jS.i] = $(toggleHideStyleY);

                            pane.appendChild(toggleHideStyleX);
                            pane.appendChild(toggleHideStyleY);

                            jS.controlFactory.styleUpdater(toggleHideStyleX);
                            jS.controlFactory.styleUpdater(toggleHideStyleY);

                            s.hiddenColumns[jS.i] = s.hiddenColumns[jS.i] || [];
                            s.hiddenRows[jS.i] = s.hiddenRows[jS.i] || [];

                            if (!s.hiddenColumns[jS.i].length || !s.hiddenRows[jS.i].length) {
                                hiddenRows = sheet.attributes['data-hiddenrows'] || {value:''};
                                hiddenColumns = sheet.attributes['data-hiddencolumns'] || {value:''};
                                s.hiddenRows[jS.i] = arrHelpers.toNumbers(hiddenRows.value.split(','));
                                s.hiddenColumns[jS.i] = arrHelpers.toNumbers(hiddenColumns.value.split(','));
                            }

                            if (jS.s.hiddenRows[jS.i]) {
                                i = jS.s.hiddenRows[jS.i].length - 1;
                                if (i > -1) {
                                    do {
                                        jS.toggleHide.row(jS.s.hiddenRows[jS.i][i]);
                                    } while (i--);
                                }
                            }

                            if (s.hiddenColumns[jS.i]) {
                                i = s.hiddenColumns[jS.i].length - 1;
                                if (i > -1) {
                                    do {
                                        jS.toggleHide.column(s.hiddenColumns[jS.i][i]);
                                    } while (i--);
                                }
                            }
                        },

                        /**
                         * Creates the spreadsheet user interface
                         * @param {HTMLElement} ui raw user interface
                         * @param {HTMLElement} table raw table
                         * @param {Number} i the new count for spreadsheets in this instance
                         * @memberOf jS.controlFactory
                         */
                        sheetUI:function (ui, table, i) {
                            jS.i = i;

                            jS.tuneTableForSheetUse(table);

                            jS.readOnly[i] = (table.className || '').match(/\breadonly\b/i) != null;

                            var enclosure = jS.controlFactory.enclosure(table),
                                pane = enclosure.pane,
                                $pane = $(pane),
                                paneContextmenuEvent = function (e) {
                                    e = e || win.event;
                                    if (jS.isBusy()) {
                                        return false;
                                    }
                                    if (jS.isBar(e.target)) {
                                        var entity = e.target.entity,
                                            i = jS.getBarIndex[entity](e.target);

                                        if (i < 0) return false;

                                        if (jS.evt.barInteraction.first == jS.evt.barInteraction.last) {
                                            jS.controlFactory.barMenu[entity](e, i);
                                        }
                                    } else {
                                        jS.controlFactory.tdMenu(e);
                                    }
                                    return false;
                                };

                            ui.appendChild(enclosure);

                            jS.controlFactory.barTop(table);
                            jS.controlFactory.barLeft(table);

                            pane.appendChild(table);

                            if (jS.isSheetEditable()) {
                                jS.controlFactory.autoFiller(pane);
                            }

                            if (jS.isSheetEditable()) {
                                var formula = jS.obj.formula(),
                                    mouseDownEntity = "";

                                $pane.mousedown(function (e) {
                                    jS.setNav(true);
                                    if (jS.isBusy()) {
                                        return false;
                                    }

                                    if (jS.isCell(e.target)) {
                                        if (e.button == 2) {
                                            paneContextmenuEvent.call(this, e);
                                            jS.evt.cellOnMouseDown(e);
                                            return true;
                                        }
                                        jS.evt.cellOnMouseDown(e);
                                        return false;
                                    }

                                    if (jS.isBar(e.target)) { //possibly a bar
                                        if (e.button == 2) {
                                            paneContextmenuEvent.call(this, e);
                                        }
                                        mouseDownEntity = e.target.entity;
                                        jS.evt.barInteraction.select(e.target);
                                        return false;
                                    }

                                    return true;
                                });

                                pane.onmouseup = function() {
                                    mouseDownEntity = "";
                                };

                                pane.onmouseover = function (e) {
                                    e = e || win.event;
                                    e.target = e.target || e.srcElement;
                                    //This manages bar resize, bar menu, and bar selection
                                    if (jS.isBusy()) {
                                        return false;
                                    }

                                    if (!jS.isBar(e.target)) {
                                        return false;
                                    }
                                    var bar = $(e.target),
                                        entity = e.target.entity,
                                        i = jS.getBarIndex[entity](e.target);

                                    if (i < 0) {
                                        return false;
                                    }

                                    if (jS.evt.barInteraction.selecting && entity == mouseDownEntity) {
                                        jS.evt.barInteraction.last = i;

                                        jS.cellSetActiveBar(entity, jS.evt.barInteraction.first, jS.evt.barInteraction.last);
                                    } else {
                                        jS.resizeBar[entity](bar, i, pane, table);

                                        if (jS.isSheetEditable()) {
                                            jS.controlFactory.barHandleFreeze[entity](pane);

                                            if (entity == "top") {
                                                jS.controlFactory.barMenu[entity](e, i, bar);
                                            }
                                        }
                                    }

                                    return true;
                                };

                                pane.ondblclick = jS.evt.cellOnDblClick;

                                $pane
                                    .bind('contextmenu', paneContextmenuEvent)
                                    .disableSelectionSpecial()
                                    .bind('cellEdit', jS.evt.cellEdit);
                            }

                            jS.themeRoller.start(table);

                            jS.createSpreadsheet(table, i);

                            jS.checkMinSize(table);

                            jS.controlFactory.tab();

                            jS.controlFactory.hide(enclosure, pane, table);

                            jS.setChanged(true);
                        },

                        /**
                         * The viewing console for spreadsheet
                         * @returns {*|jQuery|HTMLElement}
                         * @memberOf jS.controlFactory
                         */
                        enclosure:function (table) {
                            var pane = doc.createElement('div'),
                                enclosure = doc.createElement('div'),
                                $enclosure = $(enclosure);

                            enclosure.scrollUI = jS.controlFactory.scrollUI(enclosure, pane, table);
                            enclosure.appendChild(enclosure.scrollUI);

                            pane.setAttribute('class', jS.cl.pane + ' ' + jS.cl.uiPane);
                            enclosure.appendChild(pane);
                            enclosure.setAttribute('class', jS.cl.enclosure);

                            enclosure.pane = pane;
                            enclosure.table = table;

                            pane.table = table;
                            pane.enclosure = enclosure;
                            pane.$enclosure = $enclosure;

                            table.pane = pane;
                            table.enclosure = enclosure;
                            table.$enclosure = $enclosure;

                            jS.controls.pane[jS.i] = pane;
                            jS.controls.panes = jS.obj.panes().add(pane);
                            jS.controls.enclosure[jS.i] = $enclosure;
                            jS.controls.enclosures = jS.obj.enclosures().add(enclosure);

                            return enclosure;
                        },

                        /**
                         * Adds a tab for navigation to a spreadsheet
                         * @returns {Node|jQuery}
                         * @memberOf jS.controlFactory
                         */
                        tab:function () {
                            var tab = doc.createElement('span');
                            $tab = jS.controls.tab[jS.i] = $(tab).appendTo(jS.obj.tabContainer());

                            tab.setAttribute('class', jS.cl.tab);
                            jS.sheetTab(true, function(sheetTitle) {
                                tab.innerHTML = sheetTitle;
                            });

                            tab.i = jS.i;
                            tab.setAttribute('class',jS.cl.uiTab + ' ui-corner-bottom');
                            jS.controls.tabs = jS.obj.tabs().add($tab);

                            return tab;
                        },

                        /**
                         * Creates a textarea for a user to put a value in that floats on top of the current selected cell
                         * @param {jQuery|HTMLElement} td the td to be edited
                         * @param {Boolean} selected selects the text in the inline editor
                         * @memberOf jS.controlFactory
                         */
                        inPlaceEdit:function (td, selected) {
                            td = td || jS.obj.tdActive();

                            if (!td.length) {
                                td = $(jS.rowTds(null, 1)[1]);
                                jS.cellEdit(td);
                            }

                            if (!td.length) return;

                            (jS.obj.inPlaceEdit().destroy || emptyFN)();

                            var formula = jS.obj.formula(),
                                val = formula.val(),
                                textarea,
                                $textarea,
                                pane = jS.obj.pane()

                            if (!td[0].isHighlighted) return; //If the td is a dud, we do not want a textarea

                            textarea = doc.createElement('textarea');
                            $textarea = $(textarea);
                            pane.inPlaceEdit = textarea;
                            textarea.i = jS.i;
                            textarea.className = jS.cl.inPlaceEdit + ' ' + jS.cl.uiInPlaceEdit;
                            textarea.td = td[0];
                            textarea.goToTd = function() {
                                this.offset = td.position();
                                if (!this.offset.left && !this.offset.right) {
                                    $(textarea).hide();
                                } else {
                                    this.setAttribute('style',
                                        'left:' + (this.offset.left - 1) + 'px;' +
                                        'top:' + (this.offset.top - 1) + 'px;' +
                                        'width:' + this.td.clientWidth + 'px;' +
                                        'height:' + this.td.clientHeight + 'px;' +
                                        'min-width:' + this.td.clientWidth + 'px;' +
                                        'min-height:' + this.td.clientHeight + 'px;');
                                }
                            };
                            textarea.goToTd();
                            textarea.onkeydown = jS.evt.inPlaceEdit.keydown;
                            textarea.onchange =
                            textarea.onkeyup =
                                function() { formula[0].value = textarea.value; };

                            textarea.onfocus = function () { jS.setNav(false); };

                            textarea.onblur =
                            textarea.onfocusout =
                                function () { jS.setNav(true); };

                            textarea.onpaste = jS.evt.pasteOverCells;

                            textarea.destroy = function () {
                                pane.inPlaceEdit = null;
                                jS.cellLast.isEdit = (textarea.value != val);
                                textarea.parentNode.removeChild(textarea);
                                jS.controls.inPlaceEdit[textarea.i] = false;
                            };

                            pane.appendChild(textarea);

                            textarea.onfocus();

                            jS.controls.inPlaceEdit[jS.i] = textarea;


	                        //This is a little trick to get the cursor to the end of the textarea
                            $textarea
	                            .focus()
	                            .val('')
	                            .val(formula[0].value);

                            if (selected) {
                                $textarea.select();
                            }

                            //Make the textarea resizable automatically
                            if ($.fn.elastic) {
                                $(textarea).elastic();
                            }
                        },

                        /**
                         * Created the autoFiller object
                         * @returns {*|jQuery|null}
                         * @memberOf jS.controlFactory
                         * @param {HTMLElement} pane
                         */
                        autoFiller:function (pane) {
                            if (!s.autoFiller) return false;

                            var autoFiller = doc.createElement('div'),
                                handle = doc.createElement('div'),
                                cover = doc.createElement('div');

                            autoFiller.i = jS.i;

                            autoFiller.className = jS.cl.autoFiller + ' ' + jS.cl.uiAutoFiller;
                            handle.className = jS.cl.autoFillerHandle;
                            cover.className = jS.cl.autoFillerCover;

                            autoFiller.onmousedown = function () {
                                var td = jS.obj.tdActive();
                                if (td) {
                                    var loc = jS.getTdLocation(td);
                                    jS.cellSetActive(td, loc, true, jS.autoFillerNotGroup, function () {
                                        var highlighted = jS.highlighted(),
                                            hLoc = jS.getTdLocation(highlighted.last());
                                        jS.fillUpOrDown(hLoc.row < loc.row || hLoc.col < loc.col);
                                        jS.autoFillerGoToTd(td);
                                        jS.autoFillerNotGroup = false;
                                    });
                                }

                                return false;
                            };

                            pane.autoFiller = jS.controls.autoFiller[jS.i] = $(autoFiller);
                            pane.appendChild(autoFiller);
                            return true;
                        }
                    },

                    /**
                     * Allows grouping of cells
                     * @memberOf jS
                     */
                    autoFillerNotGroup:true,


                    /**
                     * Sends tab delimited string into cells, usually a paste from external spreadsheet application
                     * @param [oldVal] what formula should be when this is done working with all the values
                     * @returns {Boolean}
                     * @memberOf jS
                     */
                    updateCellsAfterPasteToFormula:function (oldVal) {
                        var newValCount = 0,
                            formula = jS.obj.formula(),
                            last = new Date();

                        oldVal = oldVal || formula.val();

                        var loc = {row:jS.cellLast.row, col:jS.cellLast.col},
                            val = formula.val(), //once ctrl+v is hit formula now has the data we need
                            firstValue = val;

                        //at this point we need to check if there is even a cell selected, if not, we can't save the information, so clear formula editor
                        if (loc.row == 0 && loc.col == 0) {
                            return false;
                        }

                        var row = tsv.parse(val);

                        //Single cell value
                        if (!$.isArray(row)) {
                            formula.val(row);
                            jS.fillUpOrDown(false, row);
                            return true;
                        }

                        //values that need put into multi cells
                        for (var i = 0; i < row.length; i++) {
                            jS.cellLast.isEdit = true;
                            var col = row[i];
                            for (var j = 0; j < col.length; j++) {
                                newValCount++;
                                var td = jS.getTd(jS.i, i + loc.row, j + loc.col);

                                td.row = loc.row;
                                td.col = loc.col;

                                if (td.length) {
                                    if (!jS.spreadsheets[jS.i] || !jS.spreadsheets[jS.i][i + loc.row] || !jS.spreadsheets[jS.i][i + loc.row][j + loc.col]) continue;
                                    var cell = jS.spreadsheets[jS.i][i + loc.row][j + loc.col];
                                    if (cell) {
                                        s.parent.one('sheetPreCalculation', function () {
                                            if ((col[j] + '').charAt(0) == '=') { //we need to know if it's a formula here
                                                    cell.formula = col[j].substring(1);
                                                    cell.value = '';
                                                    td.data('formula', col[j]);
                                            } else {
                                                    cell.formula = '';
                                                    cell.value = col[j];
                                                    td.removeData('formula');
                                            }
                                        });
                                        jS.calcDependencies.call(cell);

                                        if (i == 0 && j == 0) { //we have to finish the current edit
                                            firstValue = col[j];
                                        }
                                    }
                                }
                            }
                        }

                        if (val != firstValue) {
                            formula.val(firstValue);
                        }

                        jS.fillUpOrDown(false, firstValue);

                        jS.evt.cellEditDone(true);

                        return true;
                    },

                    /**
                     * Event handlers for instance
                     * @memberOf jS
                     * @namespace
                     */
                    evt:{

                        inPlaceEdit:{
                            /**
                             *
                             * @param {Object} e jQuery event
                             * @returns {*}
                             * @memberOf jS.evt.inPlaceEdit
                             */
                            enter:function (e) {
                                if (e.shiftKey) {
                                    return true;
                                }
                                return jS.evt.cellSetActiveFromKeyCode(e, true);
                            },

                            /**
                             *
                             * @param {Object} e jQuery event
                             * @returns {*}
                             * @memberOf jS.evt.inPlaceEdit
                             */
                            tab:function (e) {
                                if (e.shiftKey) {
                                    return true;
                                }
                                return jS.evt.cellSetActiveFromKeyCode(e, true);
                            },
                            /**
                             * Edits the textarea that appears over cells for in place edit
                             * @param {Object} e jQuery event
                             * @returns {*}
                             * @memberOf jS.evt.inPlaceEdit
                             */
                            keydown:function (e) {
                                e = e || win.event;
                                jS.trigger('sheetFormulaKeydown', [true]);

                                switch (e.keyCode) {
                                    case key.ENTER:
                                        return jS.evt.inPlaceEdit.enter(e);
                                        break;
                                    case key.TAB:
                                        return jS.evt.inPlaceEdit.tab(e);
                                        break;
                                    case key.ESCAPE:
                                        jS.evt.cellEditAbandon();
                                        return false;
                                        break;
                                }
                            }
                        },

                        formula:{
                            /**
                             *
                             * @param {Object} e jQuery event
                             * @returns {*}
                             * @memberOf jS.evt.formula
                             */
                            keydown:function (e) {
                                e = e || win.event;
                                if (jS.readOnly[jS.i]) return false;
                                if (jS.cellLast.row < 0 || jS.cellLast.col < 0) return false;

                                jS.trigger('sheetFormulaKeydown', [false]);

                                switch (e.keyCode) {
                                    case key.C:
                                        if (e.ctrlKey) {
                                            return jS.evt.doc.copy(e);
                                        }
                                    case key.X:
                                        if (e.ctrlKey) {
                                            return jS.evt.doc.cut(e);
                                        }
                                    case key.Y:
                                        if (e.ctrlKey) {
                                            jS.evt.doc.redo(e);
                                            return false;
                                        }
                                        break;
                                    case key.Z:
                                        if (e.ctrlKey) {
                                            jS.evt.doc.undo(e);
                                            return false;
                                        }
                                        break;
                                    case key.ESCAPE:
                                        jS.evt.cellEditAbandon();
                                        return true;
                                        break;
                                    case key.ENTER:
                                        jS.evt.cellSetActiveFromKeyCode(e, true);
                                        return false;
                                        break;
                                }

                                jS.cellLast.isEdit = true;
                            },

                            /**
                             * Helper for events
                             * @param {Boolean} ifTrue
                             * @param e {Object} jQuery event
                             * @returns {*}
                             * @memberOf jS.evt.keydownHandler
                             */
                            If:function (ifTrue, e) {
                                if (ifTrue) {
                                    jS.obj.tdActive().dblclick();
                                    return true;
                                }
                                return false;
                            }
                        },

                        /**
                         * Key down handlers
                         * @memberOf jS.evt
                         */
                        doc:{
                            /**
                             *
                             * @param {Object} e jQuery event
                             * @returns {*}
                             * @memberOf jS.evt.doc
                             */
                            enter:function (e) {
                                if (!jS.cellLast.isEdit && !e.ctrlKey) {
                                    jS.obj.tdActive().dblclick();
                                }
                                return false;
                            },

                            /**
                             *
                             * @param {Object} e jQuery event
                             * @returns {*}
                             * @memberOf jS.evt.doc
                             */
                            tab:function (e) {
                                jS.evt.cellSetActiveFromKeyCode(e);
                            },

                            /**
                             *
                             * @param {Object} e jQuery event
                             * @returns {*}
                             * @memberOf jS.evt.doc
                                     */
                            findCell:function (e) {
                                if (e.ctrlKey) {
                                    jS.cellFind();
                                    return false;
                                }
                                return true;
                            },

                            /**
                             *
                             * @param {Object} e jQuery event
                             * @returns {*}
                             * @memberOf jS.evt.doc
                                     */
                            redo:function (e) {
                                if (e.ctrlKey && !jS.cellLast.isEdit) {
                                    jS.undo.manager.redo();
                                    return false;
                                }
                                return true;
                            },

                            /**
                             *
                             * @param {Object} e jQuery event
                             * @returns {*}
                             * @memberOf jS.evt.doc
                                     */
                            undo:function (e) {
                                if (e.ctrlKey && !jS.cellLast.isEdit) {
                                    jS.undo.manager.undo();
                                    return false;
                                }
                                return true;
                            },

                            /**
                             * Copy what is in the highlighted tds
                             * @param [e]
                             * @param [clearValue]
                             * @returns {Boolean}
                             */
                            copy:function (e, clearValue) {
                                var tds = jS.highlighted(true),
                                    formula = jS.obj.formula(),
                                    oldValue = formula.val(),
                                    cellsTsv = jS.toTsv(tds, clearValue);

                                formula
                                    .val(cellsTsv)
                                    .focus()
                                    .select();

                                $doc
                                    .one('keyup', function () {
                                        if (clearValue) {
                                            formula.val('');
                                        } else {
                                            formula.val(oldValue);
                                        }
                                    });

                                return true;
                            },

                            cut:function (e) {
                                return this.copy(e, true);
                            },

                            /**
                             * Manages the page up and down buttons
                             * @param {Boolean} [reverse] Go up or down
                             * @returns {Boolean}
                             * @memberOf jS.evt.doc
                             */
                            pageUpDown:function (reverse) {
                                var size = jS.sheetSize(),
                                    pane = jS.obj.pane(),
                                    paneHeight = pane.clientHeight,
                                    prevRowsHeights = 0,
                                    thisRowHeight = 0,
                                    td,
                                    i;

                                if (reverse) { //go up
                                    for (i = jS.cellLast.row; i > 0 && prevRowsHeights < paneHeight; i--) {
                                        td = jS.getTd(jS.i, i, 1);
                                        if (!td.data('hidden') && td.is(':hidden')) td.show();
                                        prevRowsHeights += td.parent().height();
                                    }
                                } else { //go down
                                    for (i = jS.cellLast.row; i < size.rows && prevRowsHeights < paneHeight; i++) {
                                        td = jS.getTd(jS.i, i, 1);
                                        prevRowsHeights += td.parent().height();
                                    }
                                }
                                jS.cellEdit(td);

                                return false;
                            },

                            /**
                             *
                             * @param {Object} e jQuery event
                             * @returns {*}
                             * @memberOf jS.evt.doc
                             */
                            keydown:function (e) {
                                e = e || win.event;
                                if (jS.readOnly[jS.i]) return false;
                                if (jS.cellLast.row < 0 || jS.cellLast.col < 0) return false;
                                var td = jS.cellLast.td;

                                if (jS.nav) {
                                    //noinspection FallthroughInSwitchStatementJS
                                    switch (e.keyCode) {
                                        case key.DELETE:
                                            jS.toTsv(null, true);
                                            jS.obj.formula().val('');
                                            break;
                                        case key.TAB:
                                            jS.evt.doc.tab(e);
                                            break;
                                        case key.ENTER:
                                            jS.evt.cellSetActiveFromKeyCode(e);
                                            break;
                                        case key.LEFT:
                                        case key.UP:
                                        case key.RIGHT:
                                        case key.DOWN:
                                            (e.shiftKey ? jS.evt.cellSetHighlightFromKeyCode(e) : jS.evt.cellSetActiveFromKeyCode(e));
                                            break;
                                        case key.PAGE_UP:
                                            jS.evt.doc.pageUpDown(true);
                                            break;
                                        case key.PAGE_DOWN:
                                            jS.evt.doc.pageUpDown();
                                            break;
                                        case key.HOME:
                                        case key.END:
                                            jS.evt.cellSetActiveFromKeyCode(e);
                                            break;
                                        case key.V:
                                            if (e.ctrlKey) {
                                                return jS.evt.formula.If(!jS.evt.pasteOverCells(e), e);
                                            } else {
                                                td.trigger('cellEdit');
                                                return true;
                                            }
                                            break;
                                        case key.Y:
                                            if (e.ctrlKey) {
                                                jS.evt.doc.redo(e);
                                                return false;
                                            } else {
                                                td.trigger('cellEdit');
                                                return true;
                                            }
                                            break;
                                        case key.Z:
                                            if (e.ctrlKey) {
                                                jS.evt.doc.undo(e);
                                                return false;
                                            } else {
                                                td.trigger('cellEdit');
                                                return true;
                                            }
                                            break;
                                        case key.ESCAPE:
                                            jS.evt.cellEditAbandon();
                                            break;
                                        case key.F:
                                            if (e.ctrlKey) {
                                                return jS.evt.formula.If(jS.evt.doc.findCell(e), e);
                                            } else {
                                                td.trigger('cellEdit');
                                                return true;
                                            }
                                            break;
                                        case key.CAPS_LOCK:
                                        case key.SHIFT:
                                        case key.ALT:
                                            break;
                                        case key.CONTROL: //we need to filter these to keep cell state
                                            jS.obj.formula().focus().select();
                                            return true;
                                            break;
                                        default:
                                            td.trigger('cellEdit');
                                            return true;
                                            break;
                                    }
                                    return false;
                                }
                            }
                        },

                        /**
                         * Used for pasting from other spreadsheets
                         * @param {Object} e jQuery event
                         * @returns {Boolean}
                         * @memberOf jS.evt
                         */
                        pasteOverCells:function (e) {
                            e = e || win.event;
                            if (e.ctrlKey || e.type == "paste") {
                                var fnAfter = function () {
                                    jS.updateCellsAfterPasteToFormula();
                                };

                                var doc = $doc
                                    .one('keyup', function () {
                                        fnAfter();
                                        fnAfter = function () {
                                        };
                                        doc.mouseup();
                                    })
                                    .one('mouseup', function () {
                                        fnAfter();
                                        fnAfter = function () {
                                        };
                                        doc.keyup();
                                    });

                                jS.setDirty(true);
                                jS.setChanged(true);
                                return true;
                            }

                            return false;
                        },

                        /**
                         * Updates a cell after edit afterward event "sheetCellEdited" is called w/ params (td, row, col, spreadsheetIndex, sheetIndex)
                         * @param {Boolean} [force] if set to true forces a calculation of the selected sheet
                         * @memberOf jS.evt
                         */
                        cellEditDone:function (force) {
                            (jS.obj.inPlaceEdit().destroy || emptyFN)();
                            if (jS.cellLast.isEdit || force) {
                                var formula = jS.obj.formula(),
                                    td = jS.obj.tdActive();

                                if (jS.isFormulaEditable(td)) {
                                    //Lets ensure that the cell being edited is actually active
                                    if (td && jS.cellLast.row > 0 && jS.cellLast.col > 0) {

                                        //This should return either a val from textbox or formula, but if fails it tries once more from formula.
                                        var v = formula.val(),
                                            cell = td[0].jSCell;

                                        if (!cell.edited) {
                                            cell.edited = true;
                                            jS.controls.cellsEdited[jS.i] = jS.obj.cellsEdited().add(cell);
                                        }

                                        s.parent.one('sheetPreCalculation', function () {
                                            if (v.charAt(0) == '=' && jS.formulaParser) {
                                                td.data('formula', v);
                                                cell.value = v;
                                                cell.formula = v;
                                            } else {
                                                td.removeData('formula');
                                                cell.value = v;
                                                cell.formula = '';
                                            }
                                        });
                                        jS.calcDependencies.call(cell);

                                        //formula.focus().select();
                                        jS.cellLast.isEdit = false;

                                        //perform final function call
                                        jS.trigger('sheetCellEdited', [cell]);
                                    }
                                }
                            }
                        },

                        /**
                         * Abandons a cell edit
                         * @param {Boolean} [skipCalc] if set to true will skip sheet calculation;
                         * @memberOf jS.evt
                         */
                        cellEditAbandon:function (skipCalc) {
                            (jS.obj.inPlaceEdit().destroy || emptyFN)();
                            jS.themeRoller.bar.clearActive();
                            jS.themeRoller.cell.clearHighlighted(null, true);

                            if (!skipCalc) {
                                jS.calc();
                            }

                            jS.cellLast.td = $([]);
                            jS.cellLast.row = 0;
                            jS.cellLast.col = 0;
                            jS.rowLast = 0;
                            jS.colLast = 0;
                            jS.highlightedLast.start = {row:0,col:0};
                            jS.highlightedLast.end = {row:0,col:0};

                            jS.labelUpdate('', true);
                            jS.obj.formula()
                                .val('')
                                .blur();

                            jS.autoFillerHide();

                            return false;
                        },


                        /**
                         * Highlights a cell from a key code
                         * @param {Object} e jQuery event
                         * @returns {Boolean}
                         * @memberOf jS.evt
                         */
                        cellSetHighlightFromKeyCode:function (e) {
                            var grid = jS.highlightedLastOrdered(),
                                size = jS.sheetSize(),
                                td = jS.obj.tdActive(),
                                loc = jS.getTdLocation(td),
                                start = grid.start,
                                end = grid.end;

                            switch (e.keyCode) {
                                case key.UP:
                                    if (start.row < loc.row) {
                                        start.row--;
                                        start.row = math.max(start.row, 1);
                                        break;
                                    }

                                    end.row--;
                                    end.row = math.max(end.row, 1);

                                    break;
                                case key.DOWN:
                                    //just beginning the highlight
                                    if (start.row === start.end) {
                                        start.row++;
                                        start.row = math.min(start.row, size.rows);
                                        break;
                                    }

                                    //if the highlight is above the active cell, then we have selected up and need to move down
                                    if (start.row < loc.row) {
                                        start.row++;
                                        start.row = math.max(start.row, 1);
                                        break;
                                    }

                                    //otherwise we increment the row, and limit it to the size of the total grid
                                    end.row++;
                                    end.row = math.min(end.row, size.rows);

                                    break;
                                case key.LEFT:
                                    if (start.col < loc.col) {
                                        start.col--;
                                        start.col = math.max(start.col, 1);
                                        break;
                                    }

                                    end.col--;
                                    end.col = math.max(end.col, 1);

                                    break;
                                case key.RIGHT:
                                    if (start.col < loc.col) {
                                        start.col++;
                                        start.col = math.min(start.col, size.cols);
                                        break;
                                    }

                                    end.col++;
                                    end.col = math.min(end.col, size.cols);

                                    break;
                            }

                            //highlight the cells
                            jS.highlightedLast.start = start;
                            jS.highlightedLast.end = end;

                            jS.cycleCellArea(function (o) {
                                jS.themeRoller.cell.setHighlighted(o.td);
                            }, start, end);

                            return false;
                        },


                        /**
                         * Activates a cell from a key code
                         * @param {Object} e jQuery event
                         * @param {Boolean} [skipMove]
                         * @returns {Boolean}
                         * @memberOf jS.evt
                         */
                        cellSetActiveFromKeyCode:function (e, skipMove) {
                            var loc = {
                                    row: jS.cellLast.row,
                                    col: jS.cellLast.col
                                },
                                overrideIsEdit = false,
                                highlighted,
                                doNotClearHighlighted = false;

                            switch (e.keyCode) {
                                case key.UP:
                                    loc.row--;
                                    break;
                                case key.DOWN:
                                    loc.row++;
                                    break;
                                case key.LEFT:
                                    loc.col--;
                                    break;
                                case key.RIGHT:
                                    loc.col++;
                                    break;
                                case key.ENTER:
                                    loc = jS.evt.incrementAndStayInGrid(jS.highlightedLastOrdered(), loc, 'row', 'col', e.shiftKey);
                                    overrideIsEdit = true;
                                    highlighted = jS.highlighted();
                                    if (highlighted.length > 1) {
                                        doNotClearHighlighted = true;
                                    } else {
                                        if (!skipMove) {
                                            loc.row += (e.shiftKey ? -1 : 1);
                                        }
                                        if (s.autoAddCells && loc.row > jS.sheetSize().rows) {
                                            jS.controlFactory.addRow();
                                        }
                                    }
                                    break;
                                case key.TAB:
                                    loc = jS.evt.incrementAndStayInGrid(jS.highlightedLastOrdered(), loc, 'col', 'row', e.shiftKey);
                                    overrideIsEdit = true;
                                    highlighted = jS.highlighted();
                                    if (highlighted.length > 1) {
                                        doNotClearHighlighted = true;
                                    } else {
                                        if (!skipMove) {
                                            loc.col += (e.shiftKey ? -1 : 1);
                                        }
                                        if (s.autoAddCells && loc.col > jS.sheetSize().cols) {
                                            jS.controlFactory.addColumn();
                                        }
                                    }
                                    break;
                                case key.HOME:
                                    loc.col = 1;
                                    break;
                                case key.END:
                                    loc.col = jS.obj.tdActive().parent().children('td').length - 1;
                                    break;
                            }

                            //we check here and make sure all values are above 0, so that we get a selected cell
                            loc.col = loc.col || 1;
                            loc.row = loc.row || 1;

                            //to get the td could possibly make keystrokes slow, we prevent it here so the user doesn't even know we are listening ;)
                            if (!jS.cellLast.isEdit || overrideIsEdit) {
                                //get the td that we want to go to
                                var td = jS.getTd(jS.i, loc.row, loc.col);

                                //if the td exists, lets go to it
                                if (td) {
                                    jS.cellEdit(td, null, doNotClearHighlighted);
                                    return false;
                                }
                            }
                            //default, can be overridden above
                            return true;
                        },

                        /**
                         * Calculate position for either horizontal movement or vertical movement within a grid, both forward and reverse
                         * @param {Object} grid
                         * @param {Object} loc
                         * @param {String} locA
                         * @param {String} locB
                         * @param {Boolean} reverse
                         * @returns {Object} loc
                         * @memberOf jS.evt
                         */
                        incrementAndStayInGrid: function (grid, loc, locA, locB, reverse) {
                            if (reverse) {
                                loc[locA]--;
                                if (loc[locA] < grid.start[locA]) {
                                    loc[locA] = grid.end[locA];
                                    loc[locB]--;
                                }
                                if (loc[locB] < grid.start[locB]) {
                                    loc[locB] = grid.end[locB];
                                }
                            } else {
                                loc[locA]++;
                                if (loc[locA] > grid.end[locA]) {
                                    loc[locA] = grid.start[locA];
                                    loc[locB]++;
                                }
                                if (loc[locB] > grid.end[locB]) {
                                    loc[locB] = grid.start[locB];
                                }
                            }

                            return loc;
                        },

                        /**
                         * Cell on mouse down
                         * @param {Object} e jQuery event
                         * @memberOf jS.evt
                         */
                        cellOnMouseDown:function (e) {


                            jS.obj.formula().blur();
                            if (e.shiftKey) {
                                jS.getTdRange(e, jS.obj.formula().val());
                            } else {
                                jS.cellEdit($(e.target), true);
                            }
                        },

                        /**
                         * Cell on double click
                         * @param {Object} e jQuery event
                         * @memberOf jS.evt
                         */
                        cellOnDblClick:function (e) {
                            if (jS.isBusy()) {
                                return false;
                            }

                            jS.controlFactory.inPlaceEdit();

                            return true;
                        },

                        cellEdit: function(e) {
                            if (jS.isBusy()) {
                                return false;
                            }

                            jS.controlFactory.inPlaceEdit(null, true);

                            return true;
                        },

                        /**
                         * Handles bar events, used for highlighting and activating
                         * @memberOf jS.evt
                         * @namespace
                         */
                        barInteraction:{

                            /**
                             * The first bar that received the event (mousedown)
                             * @memberOf jS.evt.barInteraction
                             */
                            first:0,

                            /**
                             * The last bar that received the event (mousedown)
                             * @memberOf jS.evt.barInteraction
                             */
                            last:0,

                            /**
                             * Tracks if we are in select mode
                             * @memberOf jS.evt.barInteraction
                             */
                            selecting:false,

                            /**
                             * Manages the bar selection
                             * @param {Object} o target
                             * @returns {*}
                             * @memberOf jS.evt.barInteraction
                             */
                            select:function (o) {
                                if (!o) return;
                                if (!o.type == 'bar') return;
                                var entity = o.entity, //returns "top" or "left";
                                    i = jS.getBarIndex[entity](o);

                                if (i < 0) return false;

                                jS[entity + 'Last'] = i; //keep track of last column for inserting new columns
                                jS.evt.barInteraction.last = jS.evt.barInteraction.first = i;

                                jS.cellSetActiveBar(entity, jS.evt.barInteraction.first, jS.evt.barInteraction.last);
                                jS.evt.barInteraction.first = jS.evt.barInteraction.last = jS[entity + 'Last'] = i;

                                jS.evt.barInteraction.selecting = true;
                                $doc
                                    .one('mouseup', function () {
                                        jS.evt.barInteraction.selecting = false;
                                    });

                                return false;
                            }
                        },

                        /**
                         * Manages scrolling
                         * @memberOf jS.evt
                         * @namespace
                         */
                        scroll:{

                            /**
                             * axis cache, x & y
                             * @memberOf jS.evt.scroll
                             */
                            axis:{x:{}, y:{}},

                            /**
                             * tracks the current spreadsheet size
                             * @memberOf jS.evt.scroll
                             */
                            size:{},

                            /**
                             * tracks last select cell
                             * @memberOf jS.evt.scroll
                             */
                            td:{},

                            /**
                             * prepare everything needed for a scroll, needs activated every time spreadsheet changes in size
                             * @param {String} axisName x or y
                             * @param {jQuery|HTMLElement} pane pane object
                             * @memberOf jS.evt.scroll
                             */
                            start:function (axisName, pane) {
                                jS.autoFillerHide();

                                pane = pane || jS.obj.pane();
                                var me = jS.evt.scroll,
                                    outer = pane.scrollOuter,
                                    axis = me.axis[axisName];

                                me.size = jS.sheetSize(pane.table);
                                me.td = jS.obj.tdActive();

                                axis.v = [];
                                axis.name = axisName;

                                switch (axisName || 'x') {
                                    case 'x':
                                        axis.max = me.size.cols;
                                        axis.min = 0;
                                        axis.size = me.size.cols;
                                        pane.scrollStyleX.updateStyle();
                                        axis.scrollStyle = pane.scrollStyleX;
                                        axis.area = outer.scrollWidth - outer.clientWidth;
                                        axis.sheetArea = pane.table.clientWidth - pane.table.corner.clientWidth;
                                        axis.scrollUpdate = function () {
                                            outer.scrollLeft = (axis.value) * (axis.area / axis.size);
                                        };
                                        axis.gridSize = 100 / axis.size;
                                        break;
                                    case 'y':
                                        axis.max = me.size.rows;
                                        axis.min = 0;
                                        axis.size = me.size.rows;
                                        pane.scrollStyleY.updateStyle();
                                        axis.scrollStyle = pane.scrollStyleY;
                                        axis.area = outer.scrollHeight - outer.clientHeight;
                                        axis.sheetArea = pane.table.clientHeight - pane.table.corner.clientHeight;
                                        axis.scrollUpdate = function () {
                                            outer.scrollTop = (axis.value) * (axis.area / axis.size);
                                        };
                                        axis.gridSize = 100 / axis.size;
                                        break;
                                }

                                var i = axis.max;
                                do {
                                    var position = new Number(axis.gridSize * i);
                                    position.index = i + 1;
                                    axis.v.unshift(position);
                                } while(i--);
                            },

                            /**
                             * Scrolls to a position within the spreadsheet
                             * @param {Object} pos {axis, value, pixel} if value not set, pixel is used
                             * @memberOf jS.evt.scroll
                             */
                            scrollTo:function (pos) {
                                pos = pos || {};
                                pos.axis = pos.axis || 'x';
                                pos.value = pos.value || 0;
                                pos.pixel = pos.pixel || 0;

                                if (!jS.evt.scroll.axis) {
                                    jS.evt.scroll.start(pos.axis);
                                }
                                var me = jS.evt.scroll.axis[pos.axis];

                                if (!pos.value) {
                                    pos.value = arrHelpers.closest(me.v, math.abs(pos.pixel / me.area) * 100, me.min).index;
                                }

                                pos.max = pos.max || me.max;

                                var i = ((pos.value > pos.max ? pos.max : pos.value) - me.min),
                                    indexes = [];

                                if (i >= 0) {
                                    do {
                                        indexes.push(i + me.min);
                                    } while(i-- > 0);
                                }
                                if (indexes.length) {
                                    if (me.scrollStyle) me.scrollStyle.updateStyle(indexes);
                                } else {
                                    if (me.scrollStyle) me.scrollStyle.updateStyle();
                                }

                                me.value = pos.value;
                            },

                            /**
                             * Called after scroll is done
                             * @memberOf jS.evt.scroll
                             */
                            stop:function () {
                                if (this.axis.x.scrollUpdate) this.axis.x.scrollUpdate();
                                if (this.axis.y.scrollUpdate) this.axis.y.scrollUpdate();

                                if (jS.evt.scroll.td) {
                                    jS.evt.scroll.td = null;
                                    jS.autoFillerGoToTd();
                                }
                            }
                        }
                    },

                    /**
                     *
                     * @param {Number} start index to start from
                     * @memberOf jS
                     */
                    refreshColumnLabels:function (start) {
                        start = start || 0;

                        jS.obj.barMenuParentTop().trigger('destroy');

                        var tds = jS.controls.bar.x.td[jS.i];

                        if (!tds) return;

                        for (var i = start; i < tds.length; i++) {
                            if (i) {//greater than 1 (corner)
                                tds[i].text(jSE.columnLabelString(tds[i][0].cellIndex));
                            }
                        }
                    },


                    /**
                     *
                     * @param {Number} start index to start from
                     * @param {Number} [end] index to end at
                     * @memberOf jS
                     */
                    refreshRowLabels:function (start, end) {
                        start = start || 0;

                        var tds = jS.controls.bar.y.td[jS.i];

                        if (!tds) return;

                        end = end || tds.length;

                        for (var i = start; i < end; i++) {
                            if (i) {
                                $(tds[i]).text(tds[i][0].parentNode.rowIndex);
                            }
                        }
                    },

                    /**
                     * Detects if an object is a td within a spreadsheet's table
                     * @param {jQuery|HTMLElement} o target
                     * @returns {Boolean}
                     * @memberOf jS
                     */
                    isCell:function (o) {
                        if (o && o.tagName && o.tagName == 'TD' && o.type && o.type == 'cell') {
                            return true;
                        }
                        return false;
                    },

                    /**
                     * Detects if an object is a bar td within a spreadsheet's table
                     * @param {jQuery|HTMLElement} o target
                     * @returns {Boolean}
                     * @memberOf jS
                     */
                    isBar:function (o) {
                        if (o && o.tagName && o.tagName == 'TD' && o.type && o.type == 'bar') {
                            return true;
                        }
                        return false;
                    },

                    /**
                     * Tracks read state of spreadsheet
                     * @memberOf jS
                     */
                    readOnly:[],

                    /**
                     * Detects read state of a spreadsheet
                     * @param {Number} [i] index of spreadsheet within instance
                     * @returns {Boolean}
                     * @memberOf jS
                     */
                    isSheetEditable:function (i) {
                        i = i || jS.i;
                        return (
                            s.editable == true && !jS.readOnly[i]
                            );
                    },

                    /**
                     * Detects read state of formula of an object
                     * @param {jQuery|HTMLElement} o target
                     * @returns {Boolean}
                     * @memberOf jS
                     */
                    isFormulaEditable:function (o) {
                        if (s.lockFormulas) {
                            if (o.data('formula') !== u) {
                                return false;
                            }
                        }
                        return true;
                    },

                    /**
                     * Toggles full screen mode
                     * @memberOf jS
                     */
                    toggleFullScreen:function () {
                        if (!jS) return;
                        jS.evt.cellEditDone();
                        var fullScreen = jS.obj.fullScreen(),
                            pane = jS.obj.pane();
                        if (fullScreen.is(':visible')) {
                            $win.unbind('jSResize');
                            $body.removeClass('bodyNoScroll');
                            s.parent = fullScreen[0].origParent;

                            s.parent.prepend(fullScreen.children());

                            fullScreen.remove();

                            jS.sheetSyncSize();
                            pane.resizeScroll();
                            jS.trigger('sheetFullScreen', [false]);
                        } else { //here we make a full screen
                            $body.addClass('bodyNoScroll');

                            var parent = $(s.parent),
                                fullScreen = doc.createElement('div'),
                                events = $._data(s.parent[0], 'events');

                            fullScreen.className = jS.cl.fullScreen + ' ' + jS.cl.uiFullScreen + ' ' + jS.cl.parent;

                            fullScreen.origParent = parent;
                            s.parent = jS.controls.fullScreen = $(fullScreen)
                                .append(parent.children())
                                .appendTo($body);

                            $win
                                .bind('resize', function() {
                                    $win.trigger('jSResize');
                                })
                                .bind('jSResize', function () {
                                    this.w = $win.width();
                                    this.h = $win.height();
                                    s.parent
                                        .width(this.w)
                                        .height(this.h);

                                    jS.sheetSyncSize();
                                    pane.resizeScroll();
                                })
                                .trigger('jSResize');


                            parent.trigger('sheetFullScreen', [true]);

                            for (var event in events) {
                                for (var i = 0; i < events[event].length; i++) {
                                    s.parent.bind(event, events[event][i].handler);
                                }
                            }
                        }
                    },

                    /**
                     * Assists in rename of spreadsheet
                     * @memberOf jS
                     */
                    renameSheet:function (i) {
                        if (n(i)) {
                            return false;
                        }

                        if (i > -1) {
                            jS.sheetTab();
                        }

                        return true;
                    },

                    /**
                     * Switches spreadsheet
                     * @param {Number} i index of spreadsheet within instance
                     * @memberOf jS
                     */
                    switchSheet:function (i) {
                        if (n(i)) {
                            return false;
                        }

                        if (i == -1) {
                            jS.addSheet();
                        } else if (i != jS.i) {
                            jS.setActiveSheet(i);
                            jS.calc(i);
                        }

                        return true;
                    },

                    /**
                     * Makes table object usable by sheet
                     * @param {jQuery|HTMLElement} table
                     * @returns {*}
                     * @memberOf jS
                     */
                    tuneTableForSheetUse:function (table) {
                        var $table = $(table);
                        jS.controls.table[jS.i] = $table
                            .addClass(jS.cl.table)
                            .addClass(jS.cl.uiTable)
                            .attr('id', jS.id + jS.i)
                            .attr('border', '1px')
                            .attr('cellpadding', '0')
                            .attr('cellspacing', '0');

                        jS.formatTable(table);
                        jS.sheetDecorateRemove(false, $table);

                        jS.controls.tables = jS.obj.tables().add(table);

                        //override frozenAt settings with table's data-frozenatrow and data-frozenatcol
                        var frozenAtRow = $table.attr('data-frozenatrow') * 1,
                            frozenAtCol = $table.attr('data-frozenatcol') * 1;

                        if (!jS.s.frozenAt[jS.i]) jS.s.frozenAt[jS.i] = {row:0, col:0};
                        if (frozenAtRow) jS.s.frozenAt[jS.i].row = frozenAtRow;
                        if (frozenAtCol) jS.s.frozenAt[jS.i].col = frozenAtCol;
                    },

                    /**
                     * Cycles through all the td's and turns table into spreadsheet
                     * @param {HTMLElement} table spreadsheet
                     * @param {Number} i spreadsheet index within instance
                     * @memberOf jS
                     */
                    createSpreadsheet:function (table, i) {
                        table.spreadsheet = jS.spreadsheets[i] = []; //reset the sheet's spreadsheet

                        var rows = jS.rows(table),
                            row = rows.length - 1,
                            col;
                        if (row < 0) return;
                        do {
                            col = rows[row].children.length - 1;
                            if (col < 0) return;
                            do {
                                var td = rows[row].children[col];
                                if (row > 0 && col > 0) {
                                    jS.createCell(i, row, col);
                                } else {
                                    if (col == 0 && row > 0) { //barleft
                                        td.type = 'bar';
                                        td.entity = 'left';
                                        td.innerHTML = row;
                                        td.className = jS.cl.barLeft + ' ' + jS.cl.barLeft + '_' + jS.i + ' ' + jS.cl.uiBar;
                                        td.setAttribute('style', 'height:' + td.nextSibling.style.height); //This element is generated and needs to track the height of the item just before it
                                    }

                                    if (row == 0 && col > 0) { //bartop
                                        td.type = 'bar';
                                        td.entity = 'top';
                                        td.innerHTML = jSE.columnLabelString(col);
                                        td.className = jS.cl.barTop + ' ' + jS.cl.barTop + '_' + jS.i + ' ' + jS.cl.uiBar;
                                    }

                                    if (row == 0 && col == 0) { //corner
                                        td.type = 'bar';
                                        td.entity = 'corner';
                                        td.className = jS.cl.uiBar + ' ' + ' ' + jS.cl.barCorner;
                                        jS.controls.bar.corner[jS.i] = td;
                                    }
                                }
                            } while (col--);
                        } while (row--);
                    },

                    /**
                     * Toggles cells from being hidden, not yet used needs a bit of work
                     * @memberOf jS
                     */
                    toggleHide:{
                        hiddenRows:[],
                        row:function (i) {
                            i = i || jS.rowLast;
                            if (!i) return;

                            var row = jS.rows()[i],
                                $row = $(row),
                                style = [];

                            if (!this.hiddenRows[jS.i]) this.hiddenRows[jS.i] = [];

                            if ($row.length && $.inArray(i + 1, this.hiddenRows[jS.i]) < 0) {
                                this.hiddenRows[jS.i].push(i + 1);
                            } else {
                                this.hiddenRows[jS.i].splice(this.hiddenRows[jS.i].indexOf(i + 1), 1);
                            }

                            jS.obj.toggleHideStyleY()[0].updateStyle();
                        },
                        rowShowAll:function () {
                            $.each(this.hiddenRows[jS.i] || [], function (j) {
                                $(this).removeData('hidden');
                            });
                            jS.obj.toggleHideStyleY().html('');
                            this.hiddenRows[jS.i] = [];
                        },

                        hiddenColumns:[],
                        columnIndexOffset:[],
                        column:function (i) {
                            i = i || jS.colLast;
                            if (!i) return;

                            var col = jS.cols()[i],
                                $col = $(col),
                                style = [];

                            if (!this.hiddenColumns[jS.i]) this.hiddenColumns[jS.i] = [];

                            if ($col.length && $.inArray(i + 1, this.hiddenColumns[jS.i]) < 0) {
                                this.hiddenColumns[jS.i].push(i + 1);
                            } else {
                                this.hiddenColumns[jS.i].splice(this.hiddenColumns[jS.i].indexOf(i + 1), 1);
                            }

                            jS.obj.toggleHideStyleX()[0].updateStyle();
                        },
                        columnShowAll:function () {
                            jS.obj.toggleHideStyleX().html('');
                            this.hiddenColumns[jS.i] = [];
                        }
                    },

                    /**
                     * Merges cells together
                     * @param {Object} [tds]
                     * @memberOf jS
                     */
                    merge:function (tds) {
                        tds = tds || jS.highlighted();
                        if (!tds.length) {
                            return;
                        }
                        var
                            cellsValue = [],
                            firstTd = tds[0],
                            lastTd = tds[tds.length - 1],
                            firstLocRaw = jS.getTdLocation(firstTd),
                            lastLocRaw = jS.getTdLocation(lastTd),
                            firstLoc = {},
                            lastLoc = {},
                            colSpan = 0,
                            rowSpan = 0,
                            last = new Date(),
                            i = tds.length - 1,
                            cell,
                            _td,
                            td,
                            $td,
                            loc;

                        if (firstLocRaw.row) {
                            jS.setDirty(true);
                            jS.setChanged(true);

                            if (firstLocRaw.row < lastLocRaw.row) {
                                firstLoc.row = firstLocRaw.row;
                                lastLoc.row = lastLocRaw.row;
                                td = firstTd;
                            } else {
                                firstLoc.row = lastLocRaw.row;
                                lastLoc.row = firstLocRaw.row;
                                td = lastTd;
                            }

                            if (td.getAttribute('rowSpan') || td.getAttribute('colSpan')) {
                                return false;
                            }

                            $td = $(td);

                            if (firstLocRaw.col < lastLocRaw.col) {
                                firstLoc.col = firstLocRaw.col;
                                lastLoc.col = lastLocRaw.col;
                            } else {
                                firstLoc.col = lastLocRaw.col;
                                lastLoc.col = firstLocRaw.col;
                            }

                            rowSpan = (lastLoc.row - firstLoc.row) + 1;
                            colSpan = (lastLoc.col - firstLoc.col) + 1;

                            loc = jS.getTdLocation(td);

                            do {
                                _td = tds[i];
                                cell = _td.jSCell;
                                if (cell.formula || cell.value) {
                                    cellsValue.unshift(cell.formula ? "(" + cell.formula.substring(1) + ")" : cell.value);
                                }
                                s.parent.one('sheetPreCalculation', function () {
                                    if (_td.cellIndex != loc.col || _td.parentNode.rowIndex != loc.row) {
                                        cell.formula = null;
                                        cell.value = '';
                                        cell.html = '';
                                        cell.defer = td.jSCell;
                                        cell.calcLast = last;

                                        _td.removeAttribute('data-formula');
                                        _td.removeAttribute('data-celltype')
                                        _td.innerHTML = '';
                                        _td.style.display = 'none';
                                        _td.colSpan = colSpan - (_td.cellIndex - td.cellIndex);
                                        _td.rowSpan = rowSpan - (_td.parentNode.rowIndex - td.parentNode.rowIndex);
                                    }
                                });

                                jS.calcDependencies.call(cell);
                            } while(i--);

                            td.jSCell.value = cellsValue.join(' ');
                            td.jSCell.formula = (td.jSCell.formula ? cellsValue.join(' ') : '');
                            td.jSCell.calcLast = last;

                            td.style.display = '';
                            td.setAttribute('rowSpan', rowSpan);
                            td.setAttribute('colSpan', colSpan);

                            jS.calcDependencies.call(td.jSCell);
                            jS.evt.cellEditDone();
                            jS.autoFillerGoToTd($td);
                            jS.cellSetActive($td, loc);
                        }
                        return true;
                    },

                    /**
                     * Unmerges cells together
                     * @param {jQuery} [$td]
                     * @memberOf jS
                     */
                    unmerge:function ($td) {
                        $td = $td || jS.highlighted();
                        if (!$td) {
                            return;
                        }
                        var td = $td[0],
                            loc = jS.getTdLocation(td),
                            last = new Date(),
                            row = math.max(td.getAttribute('rowSpan') * 1, 1) - 1,
                            col = math.max(td.getAttribute('colSpan') * 1, 1) - 1,
                            i = row + loc.row,
                            j,
                            _td,
                            tds = [];

                        if (row == 0 && col == 0) {
                            return false;
                        }

                        do {
                            j = loc.col + col;
                            do {
                                _td = jS.getTd(jS.i, i, j)[0];
                                _td.style.display = '';
                                _td.removeAttribute('colSpan');
                                _td.removeAttribute('rowSpan');
                                _td.jSCell.defer = null;

                                jS.calcDependencies.call(_td.jSCell, last);

                                tds.push(_td);
                            } while (j-- > loc.col);
                        } while (i-- > loc.row);

                        jS.evt.cellEditDone();
                        jS.autoFillerGoToTd($td);
                        jS.cellSetActive($td, loc);
                        jS.themeRoller.cell.setHighlighted($(tds));
                        return true;
                    },

                    /**
                     * Fills values down or up to highlighted cells from active cell;
                     * @param {Boolean} [goUp] default is down, when set to true value are filled from bottom, up;
                     * @param {String} [v] the value to set cells to, if not set, formula will be used;
                     * @param {Object} [cells]
                     * @memberOf jS
                     * @returns {Boolean}
                     */
                    fillUpOrDown:function (goUp, v, cells) {
                        jS.evt.cellEditDone();
                        cells = cells || jS.highlighted(true);

                        if (cells.length < 1) {
                            return false;
                        }

                        var activeTd = jS.obj.tdActive(),
                            last = new Date();

                        if (cells.length < 1) {
                            return false;
                        }

                        var startLoc = jS.getTdLocation(cells[0].td),
                            endLoc = jS.getTdLocation(cells[cells.length - 1].td),
                            relativeLoc = jS.getTdLocation(activeTd),
                            offset = {
                                row:0,
                                col:0
                            },
                            newV = v || activeTd[0].jSCell.value,
                            isNumber = false,
                            i = cells.length - 1,
                            fn = function() {};

                        v = v || activeTd[0].jSCell.value;

                        if (i >= 0) {
                            if (v.charAt && v.charAt(0) == '=') {
                                if (i >= 0) {
                                    do {
                                        if (!goUp) {
                                            offset.row = relativeLoc.row - endLoc.row;
                                            offset.col = relativeLoc.col - endLoc.col;
                                        } else {
                                            offset.row = relativeLoc.row - startLoc.row;
                                            offset.col = relativeLoc.col - startLoc.col;
                                        }

                                        newV = jS.reparseFormula(v, offset);

                                        s.parent.one('sheetPreCalculation', function () {
                                            cells[i].formula = newV;
                                            cells[i].value = '';
                                            cells[i].td.data('formula', newV);
                                        });

                                        jS.calcDependencies.call(cells[i], last);
                                    } while (i--);
                                    return true;
                                }
                            } else {
                                if ((isNumber = !n(newV)) || newV.length > 0) {
                                    if (isNumber && newV != '') {
                                        newV *= 1;

                                        if (goUp) {
                                            newV -= cells.length - 1;
                                        }
                                        fn = function() {
                                           newV++;
                                        };
                                    }
                                }

                                do {
                                    s.parent.one('sheetPreCalculation', function () {
                                        cells[i].formula = '';
                                        cells[i].value = newV + '';
                                        cells[i].td.removeData('formula');
                                    });

                                    jS.calcDependencies.call(cells[i], last);

                                    fn();
                                } while (i--);
                                return true;
                            }
                        }

                        return false;
                    },

                    /**
                     * Turns values into a tab separated value
                     * @param {Object} [cells]
                     * @param {String} [clearValue]
                     * @param {Object} [fnEach]
                     * @memberOf jS
                     * @returns {String}
                     */
                    toTsv:function (cells, clearValue, fnEach) {
                        cells = cells || jS.highlighted(true);
                        if (cells.type) {
                            cells = [cells];
                        }
                        fnEach = fnEach || function (loc, cell) {
                            if (clearValue) {
                                s.parent.one('sheetPreCalculation', function () {
                                    cell.formula = '';
                                    cell.value = '';
                                });
                                jS.calcDependencies.call(cell, last);
                            }
                        };
                        var cellValues = [],
                            firstLoc,
                            lastLoc,
                            minLoc = {},
                            last = new Date(),
                            i = cells.length - 1,
                            row,
                            col;

                        if (i >= 0) {
                            firstLoc = jS.getTdLocation(cells[0].td);
                            lastLoc = jS.getTdLocation(cells[cells.length - 1].td);
                            minLoc.row = math.min(firstLoc.row, lastLoc.row);
                            minLoc.col = math.min(firstLoc.col, lastLoc.col);
                            do {
                                var loc = jS.getTdLocation(cells[i].td),
                                    value = (cells[i].formula ? '=' + cells[i].formula : cells[i].value);

                                row = math.abs(loc.row - minLoc.row);
                                col = math.abs(loc.col - minLoc.col);

                                if (!cellValues[row]) cellValues[row] = [];

                                if ((value += '').match(/\n/)) {
                                    value = '"' + value + '"';
                                }

                                cellValues[row][col] = (value || '');

                                fnEach.call(cells[i].td, loc, cells[i]);
                            } while (i-- > 0);


                            i = cellValues.length - 1;
                            do {
                                cellValues[i] = cellValues[i].join('\t');
                            } while (i-- > 0);

                            return cellValues.join('\n');
                        }
                        return '';
                    },

                    /**
                     * Makes cell formulas increment within a range
                     * @param {Object} loc expects keys row,col
                     * @param {Object} offset expects keys row,col, offsets increment
                     * @param {Boolean} [isBefore] inserted before location
                     * @param {Boolean} [wasDeleted]
                     * @memberOf jS
                     */
                    offsetFormulas:function (loc, offset, isBefore, wasDeleted) {
                        var size = jS.sheetSize(),
                        //effected range is the entire spreadsheet
                            affectedRange = {
                                first:{
                                    row:1,
                                    col:1
                                },
                                last:{
                                    row:size.rows,
                                    col:size.cols
                                }
                            },
                            last = new Date(),
                            cellStack = [];



                        jS.cycleCells(function () {
                            var cell = this;
                            if (this.formula && typeof this.formula == 'string' && jS.isFormulaEditable(this.td)) {
                                this.formula = jS.reparseFormula(this.formula, offset, loc, isBefore, wasDeleted);

                                this.td.data('formula', '=' + this.formula);
                            }

                            cellStack.push(function() {
                                jS.calcDependencies.call(cell, last, true);
                            });

                        }, affectedRange.first, affectedRange.last);

                        while (cellStack.length) {
                            cellStack.pop()();
                        }

                        jS.evt.cellEditDone();
                    },

                    /**
                     * Re-parses a formula
                     * @param formula
                     * @param {Object} offset expects keys row,col, offsets increment
                     * @param {Object} [loc]
                     * @param {Boolean} [isBefore]
                     * @param {Boolean} [wasDeleted]
                     * @returns {String}
                     * @memberOf jS
                     */
                    reparseFormula:function (formula, offset, loc, isBefore, wasDeleted) {
                        return formula.replace(jSE.regEx.cell, function (ignored, col, row, pos) {
                            if (col == "SHEET") return ignored;
                            offset = offset || {loc: 0, row: 0};

                            var oldLoc = {
                                    row:row * 1,
                                    col:jSE.columnLabelIndex(col)
                                },
                                moveCol,
                                moveRow,
                                override = {
                                    row: row,
                                    col: col,
                                    use: false
                                };

                            if (loc) {
                                if (wasDeleted) {
                                    if (isBefore) {
                                        if (oldLoc.col && oldLoc.col == loc.col - 1) {
                                            override.col = '#REF!';
                                            override.use = true;
                                        }
                                        if (oldLoc.row && oldLoc.row == loc.row - 1) {
                                            override.row = '#REF!';
                                            override.use = true;
                                        }

                                        if (oldLoc.col >= loc.col) {
                                            moveCol = true;
                                        }
                                        if (oldLoc.row >= loc.row) {
                                            moveRow = true;
                                        }
                                    } else {
                                        if (loc.col && oldLoc.col == loc.col) {
                                            override.col = '#REF!';
                                            override.use = true;
                                        }
                                        if (loc.row && oldLoc.row == loc.row) {
                                            override.row = '#REF!';
                                            override.use = true;
                                        }

                                        if (loc.col && oldLoc.col > loc.col) {
                                            moveCol = true;
                                        }
                                        if (loc.row && oldLoc.row > loc.row) {
                                            moveRow = true;
                                        }
                                    }

                                    if (override.use) {
                                        return override.col + override.row;
                                    }

                                    if (moveCol) {
                                        oldLoc.col += offset.col;
                                        return jS.makeFormula(oldLoc);
                                    }

                                    if (moveRow) {
                                        oldLoc.row += offset.row;
                                        return jS.makeFormula(oldLoc);
                                    }
                                } else {
                                    if (isBefore) {
                                        if (loc.col && oldLoc.col >= loc.col) {
                                            moveCol = true;
                                        }
                                        if (loc.row && oldLoc.row >= loc.row) {
                                            moveRow = true;
                                        }
                                    } else {
                                        if (loc.col && oldLoc.col > loc.col) {
                                            moveCol = true;
                                        }
                                        if (loc.row && oldLoc.row > loc.row) {
                                            moveRow = true;
                                        }
                                    }

                                    if (moveCol) {
                                        oldLoc.col += offset.col;
                                        return jS.makeFormula(oldLoc);
                                    }

                                    if (moveRow) {
                                        oldLoc.row += offset.row;
                                        return jS.makeFormula(oldLoc);
                                    }
                                }
                            } else {
                                return jS.makeFormula(oldLoc, offset);
                            }

                            return ignored;
                        });
                    },


                    /**
                     * Reconstructs a formula
                     * @param {Object} loc expects keys row,col
                     * @param {Object} [offset] expects keys row,col
                     * @returns {String}
                     * @memberOf jS
                     */
                    makeFormula:function (loc, offset) {
                        offset = $.extend({row:0, col:0}, offset);

                        //set offsets
                        loc.col += offset.col;
                        loc.row += offset.row;

                        //0 based now
                        if (loc.col < 0) loc.col = 0;
                        if (loc.row < 0) loc.row = 0;

                        return jSE.parseCellName(loc.col, loc.row);
                    },

                    /**
                     * Cycles through a certain group of td objects in a spreadsheet table and applies a function to them
                     * @param {Function} fn the function to apply to a cell
                     * @param {Object} [firstLoc] expects keys row,col, the cell to start at
                     * @param {Object} [lastLoc] expects keys row,col, the cell to end at
                     * @param {Number} [i] spreadsheet index within instance
                     * @memberOf jS
                     */
                    cycleCells:function (fn, firstLoc, lastLoc, i) {
                        i = i || jS.i;
                        firstLoc = firstLoc || {row:1, col:1};

                        if (!lastLoc) {
                            var size = jS.sheetSize();
                            lastLoc = {row:size.rows, col:size.cols};
                        }

                        var row = lastLoc.row, col;
                        if (row < firstLoc.row) return;
                        do {
                            col = lastLoc.col;
                            do {
                                fn.call(jS.spreadsheets[i][row][col], i, row, col);
                            } while (col-- > firstLoc.col);
                        } while (row-- > firstLoc.row);
                    },

                    /**
                     * Cycles through all td objects in a spreadsheet table and applies a function to them
                     * @param fn
                     * @memberOf jS
                     */
                    cycleCellsAll:function (fn) {
                        var jSI = jS.i, i,size,endLoc;
                        for (i = 0; i <= jS.sheetCount; i++) {
                            jS.i = i;
                            size = jS.sheetSize();
                            endLoc = {row:size.rows, col:size.cols};
                            jS.cycleCells(fn, {row:0, col:0}, endLoc, i);
                        }
                        jS.i = jSI;
                    },

                    /**
                     * Cycles through a certain group of td objects in a spreadsheet table and applies a function to them, firstLoc can be bigger then lastLoc, this is more dynamic
                     * @param {Function} fn the function to apply to a cell
                     * @param {Object} firstLoc expects keys row,col, the cell to start at
                     * @param {Object} lastLoc expects keys row,col, the cell to end at
                     * @param {Boolean} [ordered] is what you are sending to this method already sorted?
                     * @param {Boolean} [increment] use increment rather than decrement, which is a bit slower
                     * @memberOf jS
                     */
                    cycleCellArea:function (fn, firstLoc, lastLoc, ordered, increment) {
                        var grid = {start:{}, end: {}},
                            rowIndex,
                            colIndex,
                            row,
                            cell,
                            i = jS.i,
                            o = {cell: [], td: []},
                            sheet = jS.spreadsheets[i],
                            arrayMethod = (increment ? 'unshift' : 'push');

                        if (ordered) {
                            grid.start = firstLoc;
                            grid.end = lastLoc;
                        } else {
                            grid.start.row = math.max(math.min(firstLoc.row, lastLoc.row), 1);
                            grid.start.col = math.max(math.min(firstLoc.col, lastLoc.col), 1);
                            grid.end.row = math.max(firstLoc.row, lastLoc.row, 1);
                            grid.end.col = math.max(firstLoc.col, lastLoc.col, 1);
                        }

                        rowIndex = grid.end.row;

                        do {
                            colIndex = grid.end.col;
                            row = sheet[rowIndex] || null;
                            do {
                                if (row) {
                                    cell = row[colIndex] || null;
                                    if (cell) {
                                        o.cell[arrayMethod](cell);
                                        o.td[arrayMethod](cell.td[0]);
                                    }
                                }
                            } while (colIndex-- > grid.start.col);
                        } while (rowIndex-- > grid.start.row);

                        if (fn) {
                            fn(o);
                        }
                    },


                    /**
                     * Adds tBody, colGroup, heights and widths to different parts of a spreadsheet
                     * @param {HTMLElement} table table object
                     * @memberOf jS
                     */
                    formatTable:function (table) {
                        var w = s.newColumnWidth,
                            h = s.colMargin,
                            children = table.children,
                            i = children.length - 1,
                            j,
                            col,
                            tBody,
                            colGroup,
                            firstTr,
                            hasTBody,
                            hasColGroup;

                        if (i > -1) {
                            do {
                                switch (children[i].nodeName) {
                                    case 'TBODY':
                                        hasTBody = true;
                                        tBody = children[i];
                                        break;
                                    case 'COLGROUP':
                                        hasColGroup = true;
                                        colGroup = children[i];
                                        break;
                                }
                            } while (i--);
                        } else {
                            var child = doc.createElement('tr');
                            //if there aren't any children, give it at least 1
                            child.appendChild(doc.createElement('td'));
                            table.appendChild(child);
                            children = table.children;
                        }

                        if (!tBody) {
                            tBody = doc.createElement('tbody');
                            do {
                                tBody.appendChild(children[0]);
                            } while (children.length);
                        }

                        if (!colGroup || colGroup.children.length < 1) {
                            colGroup = doc.createElement('colgroup');

                            table.appendChild(colGroup);
                            table.appendChild(tBody);

                            firstTr = tBody.children[0];

                            for (i = 0, j = firstTr.children.length; i < j; i++) {
                                col = doc.createElement('col');
                                colGroup.appendChild(col);
                                col.style.width = w + 'px';
                            }
                            for (i = 0, j = tBody.children.length; i < j; i++) {
                                tBody.children[i].style.height = h + 'px';
                            }
                        }

                        table.tBody = tBody;
                        table.colGroup = colGroup;
                        table.removeAttribute('width');
                        table.style.width = '';
                    },

                    /**
                     * Ensure sheet minimums have been met, if not add columns and rows
                     * @param {jQuery|HTMLElement} o table object
                     * @memberOf jS
                     */
                    checkMinSize:function (o) {
                        var size = jS.sheetSize(o),
                            addRows = s.minSize.rows || 0,
                            addCols = s.minSize.cols || 0,
                            frozenAt = jS.frozenAt();

                        addRows = (frozenAt.row > addRows ? frozenAt.row + 1 : addRows);
                        addCols = (frozenAt.col > addCols ? frozenAt.col + 1 : addCols);

                        if (size.cols < addCols) {
                            jS.controlFactory.addColumnMulti(null, addCols - size.cols);
                        }

                        if (size.rows < addRows) {
                            jS.controlFactory.addRowMulti(null, addRows - size.rows);
                        }
                    },

                    /**
                     * jQuery ui Themeroller integration
                     * @memberOf jS
                     * @namespace
                     */
                    themeRoller:{

                        /**
                         * Starts themeroller integration
                         * @param {jQuery|HTMLElement} sheet spreadsheet table
                         * @memberOf jS.themeRoller
                             */
                        start:function (sheet) {
                            jS.obj.header().addClass(jS.cl.uiControl);
                            jS.obj.label().addClass(jS.cl.uiControl);
                            jS.obj.formula().addClass(jS.cl.uiControlTextBox);
                        },

                        /**
                         * Themeroller cell interactions
                         * @memberOf jS.themeRoller
                         * @namespace
                         */
                        cell:{

                            /**
                             * Highlights object
                             * @param {jQuery|HTMLElement} [obj] td object
                             * @memberOf jS.themeRoller.cell
                             */
                            setHighlighted:function (obj) {
                                obj = obj || $([]);

                                var i,
                                    oldObjects = jS.highlightedLast.obj,
                                    x = jS.obj.scrollStyleX();

                                //_obj is the old selected items
                                if (oldObjects && oldObjects.length > 0) {
                                    i = oldObjects.length - 1;
                                    do {
                                        oldObjects[i].isHighlighted = false;
                                    } while (i-- > 0);
                                }

                                if (obj.length > 0) {
                                    i = obj.length - 1;
                                    do {
                                        if (!obj[i].isHighlighted) {
                                            obj[i].isHighlighted = true;
                                            if (!obj[i].className.match(jS.cl.uiTdHighlighted)) {
                                                obj[i].className += ' ' + jS.cl.uiTdHighlighted;
                                            }
                                        }
                                    } while (i-- > 0);
                                }

                                jS.themeRoller.cell.clearHighlighted.call(obj, oldObjects);

                                x.touch(); //Chrome has a hard time rendering table col elements when they change style, this triggers the table to be re-rendered
                            },

                            /**
                             * Detects if there is a cell highlighted
                             * @returns {Boolean}
                             * @memberOf jS.themeRoller.cell
                             */
                            isHighlighted:function () {
                                return (jS.highlightedLast.obj.length ? true : false);
                            },

                            /**
                             * Clears highlighted cells
                             * @param {Object} [obj]
                             * @param {Boolean} [force]
                             * @memberOf jS.themeRoller.cell
                             */
                            clearHighlighted:function (obj, force) {
                                if (jS.themeRoller.cell.isHighlighted()) {
                                    obj = obj || jS.highlightedLast.obj;

                                    if (obj && obj.length) {
                                        var i = obj.length - 1;
                                        do {
                                            if (!obj[i].isHighlighted || force) {
                                                obj[i].className = obj[i].className.replace(jS.cl.uiTdHighlighted, '');
                                                obj[i].isHighlighted = false;
                                            }
                                        } while (i-- > 0);
                                    }
                                }

                                if (this.length) {
                                    jS.highlightedLast.obj = this;
                                } else {
                                    jS.highlightedLast.obj = $([]);
                                }
                            }
                        },

                        /**
                         * Themeroller bar interactions
                         * @memberOf jS.themeRoller
                         * @namespace
                         */
                        bar:{

                            /**
                             * Adds initial style to bar
                             * @param {jQuery|HTMLElement} o bar object
                             * @memberOf jS.themeRoller.bar
                             */
                            style:function (o) {
                                $(o).addClass(jS.cl.uiBar);
                            },

                            /**
                             * Sets a bar to be active
                             * @param {String} direction left or top
                             * @param {HTMLElement} td index of bar
                             * @memberOf jS.themeRoller.bar
                             */
                            setActive:function (direction, td) {
                                switch (direction) {
                                    case 'top':
                                        jS.highlightedLast.barTop
                                            .removeClass(jS.cl.uiBarHighlight);
                                        jS.highlightedLast.barTop = $(td).addClass(jS.cl.uiBarHighlight);
                                        break;
                                    case 'left':
                                        jS.highlightedLast.barLeft
                                            .removeClass(jS.cl.uiBarHighlight);
                                        jS.highlightedLast.barLeft = $(td).addClass(jS.cl.uiBarHighlight);
                                        break;
                                }
                            },

                            /**
                             * Clears bars from being active
                             * @memberOf jS.themeRoller.bar
                             */
                            clearActive:function () {
                                jS.highlightedLast.barLeft
                                    .removeClass(jS.cl.uiBarHighlight);
                                jS.highlightedLast.barLeft = $([]);

                                jS.highlightedLast.barTop
                                    .removeClass(jS.cl.uiBarHighlight);
                                jS.highlightedLast.barTop = $([]);
                            }
                        },

                        /**
                         * Themeroller tab interactions
                         * @memberOf jS.themeRoller
                         * @namespace
                         */
                        tab:{

                            /**
                             * Sets a tab to be active
                             * @memberOf jS.themeRoller.tab
                             */
                            setActive:function () {
                                this.clearActive();
                                jS.obj.tab().addClass(jS.cl.uiTabActive);
                            },

                            /**
                             * Clears a tab from being active
                             * @memberOf jS.themeRoller.tab
                             */
                            clearActive:function () {
                                jS.obj.tabContainer().find('span.' + jS.cl.uiTabActive)
                                    .removeClass(jS.cl.uiTabActive);
                            }
                        }
                    },

                    /**
                     * jQuery ui resizeable integration
                     * @param {jQuery|HTMLElement} o To set resizable
                     * @param {Object} settings the settings used with jQuery ui resizable
                     * @memberOf jS
                     */
                    resizable:function (o, settings) {
                        if (!o.data('resizable')) {
                            o.resizable(settings);
                        }
                    },

                    /**
                     * Where the currect sheet is frozen at
                     * @returns {Object}
                     */
                    frozenAt:function () {
                        var frozenAt;
                        if (!(frozenAt = jS.s.frozenAt[jS.i])) frozenAt = {row:0, col:0};

                        frozenAt.row = math.max(frozenAt.row, 0);
                        frozenAt.col = math.max(frozenAt.col, 0);

                        return frozenAt;
                    },

                    /**
                     * Where the current sheet is scrolled to
                     * @returns {Object}
                     */
                    scrolledTo:function () {
                        if (!jS.scrolledArea[jS.i]) {
                            var frozenAt = jS.frozenAt();
                            jS.scrolledArea[jS.i] = {
                                start: {
                                    row:math.max(frozenAt.row, 1),
                                    col: math.max(frozenAt.col, 1)
                                },
                                end: {
                                    row:math.max(frozenAt.row, 1),
                                    col:math.max(frozenAt.col, 1)
                                }
                            };
                        }
                        return jS.scrolledArea[jS.i];
                    },

                    /**
                     * instance busy state
                     * @memberOf jS
                     */
                    busy:[],


                    /**
                     * Set the spreadsheet busy status
                     * @param {Boolean} busy
                     * @memberOf jS
                     */
                    setBusy:function (busy) {
                        if (busy) {
                            jS.busy.push(busy);
                        } else {
                            jS.busy.pop();
                        }
                    },

                    /**
                     * get the spreadsheet busy status
                     * @memberOf jS
                     * @returns {Boolean}
                     */
                    isBusy:function () {
                        return (jS.busy.length > 0);
                    },

                    /**
                     * jQuery ui draggable integration
                     * @param {jQuery|HTMLElement} o To set resizable
                     * @param {Object} settings the settings used with jQuery ui resizable
                     * @memberOf jS
                     */
                    draggable:function (o, settings) {
                        if (!o.data('jSdraggable')) {
                            o
                                .data('jSdraggable', true)
                                .draggable(settings);
                        }
                    },

                    /**
                     * jQuery nearest integration
                     * @param o
                     * @param settings
                     * @memberOf jS
                     */
                    nearest:function (o, settings) {
                        return $(o).nearest(settings);
                    },

                    /**
                     * Bar resizing
                     * @memberOf jS
                     * @namespace
                     */
                    resizeBar:{

                        /**
                         * Provides the top bar with ability to resize
                         * @param {jQuery|HTMLElement} $bar td bar object
                         * @param {Number} i index of bar
                         * @param {jQuery|HTMLElement} pane spreadsheet pane
                         * @param {jQuery|HTMLElement} sheet spreadsheet table
                         * @memberOf jS.resizeBar
                         */
                        top:function ($bar, i, pane, sheet) {
                            jS.obj.barTopControls().remove();
                            var barController = doc.createElement('div'),
                                $barController = $(barController)
                                .addClass(jS.cl.barController + ' ui-state-highlight')
                                .width($bar.width())
                                .height(0)
                                .prependTo($bar),
                                col,
                                handle;

                            jS.controls.bar.x.controls[jS.i] = jS.obj.barTopControls().add($barController);

                            jS.resizableCells($barController, {
                                handles:'e',
                                start:function (e, ui) {
                                    jS.autoFillerHide();
                                    jS.setBusy(true);
                                    col = jS.col(sheet, i);
                                    if (pane.freezeHandleTop) {
                                        pane.freezeHandleTop.remove();
                                    }
                                    col.removeAttribute('width');
                                },
                                resize:function (e, ui) {
                                    col.style.width = ui.size.width + 'px';

                                    if (pane.inPlaceEdit) {
                                        pane.inPlaceEdit.goToTd();
                                    }
                                },
                                stop:function (e, ui) {
                                    jS.setBusy(false);
                                    pane.resizeScroll();
                                    jS.followMe();
                                    jS.setDirty(true);
                                },
                                minWidth: 32
                            });

                            handle = barController.children[0];
                            handle.style.height = $bar.outerHeight() + 'px';
                            handle.style.position = 'absolute';
                        },

                        /**
                         * Provides the left bar with ability to resize
                         * @param {jQuery|HTMLElement} $bar td bar object
                         * @param {Number} i index of bar
                         * @param {jQuery|HTMLElement} pane spreadsheet pane
                         * @param {jQuery|HTMLElement} sheet spreadsheet table
                         * @memberOf jS.resizeBar
                         */
                        left:function ($bar, i, pane, sheet) {
                            jS.obj.barLeftControls().remove();
                            var offset = $bar.offset(),
                                barController = doc.createElement('div'),
                                $barController = $(barController)
                                    .addClass(jS.cl.barController + ' ui-state-highlight')
                                    .prependTo($bar)
                                    .offset({
                                        top:offset.top,
                                        left:offset.left
                                    }),
                                bar = $bar[0],
                                td = $bar.next()[0],
                                parent = td.parentNode,
                                child = doc.createElement('div'),
                                $child = $(child)
                                    .addClass('jSBarControllerChild')
                                    .height($bar.height())
                                    .prependTo($barController),
                                handle;

                            jS.controls.bar.y.controls[jS.i] = jS.obj.barLeftControls().add($barController);

                            jS.resizableCells($child, {
                                handles:'s',
                                start:function () {
                                    jS.autoFillerHide();
                                    jS.setBusy(true);
                                    if (pane.freezeHandleLeft) {
                                        pane.freezeHandleLeft.remove();
                                    }
                                    parent.removeAttribute('height');
                                    bar.removeAttribute('height');
                                    td.removeAttribute('height');
                                },
                                resize:function (e, ui) {
                                    barController.style.height =
                                        td.style.height =
                                        bar.style.height =
                                        parent.style.height =
                                        ui.size.height + 'px';

                                    if (pane.inPlaceEdit) {
                                        pane.inPlaceEdit.goToTd();
                                    }
                                },
                                stop:function (e, ui) {
                                    jS.setBusy(false);
                                    pane.resizeScroll();
                                    jS.followMe();
                                    jS.setDirty(true);
                                },
                                minHeight: 15
                            });

                            handle = child.children[0];
                            handle.style.width = $bar.outerWidth() + 'px';
                            handle.style.position = 'absolute';
                        },

                        /**
                         * Provides the corner bar, just a place holder, needed for auto events
                         * @memberOf jS.resizeBar
                         */
                        corner:function () {
                        }
                    },

                    /**
                     * Removes sheet decorations
                     * @param {Boolean} makeClone creates a clone rather than the actual object
                     * @param {jQuery|HTMLElement} sheets spreadsheet table object to remove decorations from
                     * @returns {jQuery|HTMLElement}
                     * @memberOf jS
                     */
                    sheetDecorateRemove:function (makeClone, sheets) {
                        sheets = sheets || jS.obj.tables();
                        sheets = (makeClone ? sheets.clone() : sheets);

                        //Get rid of highlighted cells and active cells
                        sheets.find('td.' + jS.cl.uiTdActive)
                            .removeClass(jS.cl.uiTdActive);

                        sheets.find('td.' + jS.cl.uiTdHighlighted)
                            .removeClass(jS.cl.uiTdHighlighted);
                        return sheets;
                    },

                    /**
                     * Updates the label so that the user knows where they are currently positioned
                     * @param {String|Object} v Value to update to, if object {col, row}
                     * @param {Boolean} [setDirect]
                     * @memberOf jS
                     */
                    labelUpdate:function (v, setDirect) {
                        if (!setDirect) {
                            v = jSE.parseCellName(v.col, v.row);
                            if (v) jS.obj.label().text(v);
                        } else {
                            jS.obj.label().text(v);
                        }
                    },

                    /**
                     * Starts td to be edited
                     * @param {jQuery|HTMLElement} td
                     * @param {Boolean} [isDrag] should be determined by if the user is dragging their mouse around setting cells
                     * @param {Boolean} [doNotClearHighlighted]
                     */
                    cellEdit:function (td, isDrag, doNotClearHighlighted) {
                        if (jS.cellLast.td.length < 1) {
                            //doNotClearHighlighted = false;
                        }

                        jS.autoFillerNotGroup = true; //make autoFiller directional again.
                        //This finished up the edit of the last cell
                        jS.evt.cellEditDone();

                        if (!td.length) return;

                        var loc = jS.getTdLocation(td),
                            cell = td[0].jSCell,
                            v;

                        if (!cell) return;
                        if (cell.uneditable) return;

                        jS.trigger('sheetCellEdit', [cell]);

                        if (!td.is(jS.cellLast.td)) {
                            jS.followMe(td);
                        } else {
                            jS.autoFillerGoToTd(td);
                        }

                        //Show where we are to the user
                        jS.labelUpdate(loc);

                        if (cell.formula) {
                            v = '=' + cell.formula;
                        } else {
                            v = cell.value;
                        }

                        var formula = jS.obj.formula()
                            .val(v)
                            .blur();

                        jS.cellSetActive(td, loc, isDrag, false, null, doNotClearHighlighted);
                    },

                    /**
                     * sets cell active to sheet, and highlights it for the user, shouldn't be called directly, should use cellEdit
                     * @param {jQuery|HTMLElement} td
                     * @param {Object} loc {col, row}
                     * @param {Boolean} [isDrag] should be determined by if the user is dragging their mouse around setting cells
                     * @param {Boolean} [directional] makes highlighting directional, only left/right or only up/down
                     * @param {Function} [fnDone] called after the cells are set active
                     * @param {Boolean} [doNotClearHighlighted]
                     * @memberOf jS
                     */
                    cellSetActive:function (td, loc, isDrag, directional, fnDone, doNotClearHighlighted) {
                        loc = loc || jS.getTdLocation(td);
                        if (loc.col != u) {
                            jS.cellLast.td = td; //save the current cell/td

                            jS.cellLast.row = jS.rowLast = loc.row;
                            jS.cellLast.col = jS.colLast = loc.col;

                            if (!doNotClearHighlighted) {
                                jS.themeRoller.cell.setHighlighted(td); //themeroll the cell and bars
                                jS.highlightedLast.start = loc;
                                jS.highlightedLast.end = loc;
                            }

                            if (!td.length) return;

                            jS.themeRoller.bar.setActive('left', td[0].barLeft);
                            jS.themeRoller.bar.setActive('top', td[0].barTop);

                            var selectModel,
                                clearHighlightedModel;

                            switch (s.cellSelectModel) {
                                case 'excel':
                                case 'gdrive':
                                    selectModel = function () {};
                                    clearHighlightedModel = function() {};//jS.themeRoller.cell.clearHighlighted;
                                    break;
                                case 'oo':
                                    selectModel = function (target) {
                                        if (jS.isCell(target)) {
                                            jS.cellEdit($(target));
                                        }
                                    };
                                    clearHighlightedModel = function () {};
                                    break;
                            }

                            if (isDrag) {
                                var locTrack = {},
                                    pane = jS.obj.pane();

                                locTrack.last = loc;//we keep track of the most recent location because we don't want tons of recursion here

                                pane.onmousemove = function (e) {
                                    e = e || win.event;
                                    e.target = e.target || e.srcElement;
                                    if (jS.isBusy()) {
                                        return false;
                                    }

                                    var locEnd = jS.highlightedLast.end = jS.getTdLocation(e.target),
                                        ok = true;

                                    //bar
                                    if (
                                        locEnd.col < 1
                                        || locEnd.row < 1
                                        || locEnd.col == nAN
                                        || locEnd.row == nAN
                                        ) {
                                        return false;
                                    }

                                    if (directional) {
                                        ok = false;
                                        if (loc.col == locEnd.col || loc.row == locEnd.row) {
                                            ok = true;
                                        }
                                    }

                                    if ((locTrack.last.col != locEnd.col || locTrack.last.row != locEnd.row) && ok) { //this prevents this method from firing too much
                                        //select active cell if needed
                                        selectModel(e.target);

                                        //highlight the cells
                                        jS.cycleCellArea(function (o) {
                                            jS.themeRoller.cell.setHighlighted(o.td);
                                        }, loc, locEnd, false, true);
                                    }
                                    jS.followMe($(e.target));
                                    var mouseY = e.clientY,
                                        mouseX = e.clientX,
                                        offset = pane.$enclosure.offset(),
                                        cellLoc = jS.getTdLocation(e.target),
                                        up = cellLoc.row,
                                        left = cellLoc.col,
                                        move = false,
                                        previous;

                                    if (n(up) || n(left)) {
                                        return false;
                                    }

                                    if(mouseY > offset.top){
                                        move = true;
                                        up--
                                    }
                                    if(mouseX > offset.left){
                                        move = true;
                                        left--
                                    }
                                    if(move){
                                        if (up < 1 || left < 1) {
                                            return false;
                                        }
                                        previous = jS.spreadsheets[jS.i][up][left];
                                        jS.followMe($(previous.td), true);
                                    }

                                    locTrack.last = locEnd;
                                    return true;
                                };

                                doc.onmouseup = function() {
                                    pane.onmousemove = null;
                                    pane.onmousemove = null;
                                    pane.onmouseup = null;
                                    doc.onmouseup = null;

                                    if (fnDone) {
                                        fnDone();
                                    }
                                };
                            }
                        }
                    },

                    /**
                     * the most recent used column
                     * @memberOf jS
                     */
                    colLast:0,

                    /**
                     * the most recent used row
                     * @memberOf jS
                     */
                    rowLast:0,

                    /**
                     * the most recent used cell, {td, row, col, isEdit}
                     * @memberOf jS
                     * @type {Object}
                     */
                    cellLast:{
                        td:$([]), //this is a dud td, so that we don't get errors
                        row:0,
                        col:0,
                        isEdit:false
                    },

                    /**
                     * the most recent highlighted cells {td, rowStart, colStart, rowEnd, colEnd}
                     * @memberOf jS
                     * @type {Object}
                     */
                    highlightedLast:{
                        obj:$([]),
                        start: {row: 0, col: 0},
                        end: {row: 0, col: 0},
                        barLeft: $([]),
                        barTop: $([])
                    },

                    /**
                     * the most recent highlighted cells {td, rowStart, colStart, rowEnd, colEnd}, in order
                     * @memberOf jS
                     * @type {Object}
                     */
                    highlightedLastOrdered: function() {
                        var grid = this.highlightedLast,
                            _grid = {start:{}, end:{}};

                        _grid.start.row = Math.min(grid.start.row, grid.end.row);
                        _grid.start.col = Math.min(grid.start.col, grid.end.col);
                        _grid.end.row = Math.max(grid.start.row, grid.end.row);
                        _grid.end.col = Math.max(grid.start.col, grid.end.col);

                        return _grid;
                    },

                    /**
                     * sets cell(s) class for styling
                     * @param {String} setClass class(es) to set cells to
                     * @param {String} [removeClass] class(es) to remove from cell if the setClass would conflict with
                     * @param {Object} [tds]
                     * @returns {Boolean}
                     * @memberOf jS
                     */
                    cellStyleToggle:function (setClass, removeClass, tds) {
                        tds = tds || jS.highlighted();
                        if (tds.length < 1) {
                            return false;
                        }
                        jS.setDirty(true);
                        //Lets check to remove any style classes
                        var td,
                            $td,
                            i = tds.length - 1,
                            cells = jS.obj.cellsEdited(),
                            cellsEdited = jS.controls.cellsEdited[jS.i],
                            hasClass;

                        //TODO: use calcDependencies and sheetPreCalculation to set undo redo data

                        if (i >= 0) {
                            hasClass = tds[0].className.match(setClass); //go by first element in set
                            do {
                                td = tds[i];
                                $td = $(td);

                                if (removeClass) {//If there is a class that conflicts with this one, we remove it first
                                    $td.removeClass(removeClass);
                                }

                                //Now lets add some style
                                if (hasClass) {
                                    $td.removeClass(setClass);
                                } else {
                                    $td.addClass(setClass);
                                }

                                if (!td.jSCell.edited) {
                                    td.jSCell.edited = true;
                                    cellsEdited = cells.add(td.jSCell);
                                }

                            } while (i--);

                            return true;
                        }

                        return false;
                    },

                    /**
                     * sets cell(s) type
                     * @param {String} [type] cell type
                     * @param {Object} [cells]
                     * @returns {Boolean}
                     * @memberOf jS
                     */
                    cellTypeToggle:function(type, cells) {
                        cells = cells || jS.highlighted(true);

                        if (cells.length < 1) {
                            return;
                        }

                        var i = cells.length - 1,
                            remove = cells[i].cellType == type;

                        if (i >= 0) {
                            do {
                                if (remove) {
                                    cells[i].cellType = null;
                                } else {
                                    cells[i].cellType = type;
                                }
                                cells[i].calcLast = 0;
                                jS.updateCellValue.call(cells[i]);
                            } while(i--);
                        }
                    },

                    /**
                     * Resize fonts in a cell by 1 pixel
                     * @param {String} direction "up" or "down"
                     * @param {Object} [tds]
                     * @memberOf jS
                     * @returns {Boolean}
                     */
                    fontReSize:function (direction, tds) {
                        tds = tds || jS.highlighted();
                        if (tds.length < 1) {
                            return false;
                        }

                        var resize = 0;
                        switch (direction) {
                            case 'up':
                                resize = 1;
                                break;
                            case 'down':
                                resize = -1;
                                break;
                        }

                        //Lets check to remove any style classes
                        var td,
                            $td,
                            i = tds.length - 1,
                            size,
                            cells = jS.obj.cellsEdited(),
                            cellsEdited = jS.controls.cellsEdited[jS.i];

                        //TODO: use calcDependencies and sheetPreCalculation to set undo redo data

                        if (i >= 0) {
                            do {
                                td = tds[i];
                                $td = $(td);
                                size = ($td.css("font-size") + '').replace("px", "") * 1;
                                $td.css("font-size", ((size || 10) + resize) + "px");

                                if (!td.jSCell.edited) {
                                    td.jSCell.edited = true;
                                    cellsEdited = cells.add(td.jSCell);
                                }
                            } while(i--);
                            return true;
                        }
                        return false;
                    },

                    /**
                     * Current number of cells being parsed
                     * @type {Number}
                     * @memberOf jS
                     */
                    callStack:0,

                    /**
                     * Ignites calculation with cell, is recursively called if cell uses value from another cell, can be sent indexes, or be called via .apply(cell)
                     * @param {Number} [sheetIndex] sheet index within instance
                     * @param {Number} [rowIndex] row index
                     * @param {Number} [colIndex] col index
                     * @returns {*} cell value after calculated
                     * @memberOf jS
                     */
                    updateCellValue:function (sheetIndex, rowIndex, colIndex) {
                        var sheet, row, cell, fn;
                        if (!this.type || !this.type == 'cell') {
                            //first detect if the cell exists if not return nothing
                            if (!(sheet = jS.spreadsheets[sheetIndex])) return s.error({error:jS.msg.notFoundSheet});
                            if (!(row = sheet[rowIndex])) return s.error({error:jS.msg.notFoundRow});
                            if (!(cell = row[colIndex])) return s.error({error:jS.msg.notFoundColumn});
                        } else {
                            cell = this;
                        }

                        cell.oldValue = cell.value; //we detect the last value, so that we don't have to update all cell, thus saving resources

                        if (cell.result) { //unset the last result if it is set
                            delete cell.result;
                        }

                        switch (cell.state[cell.state.length - 1]) {
                            case 'updating':
                                return s.error({error:jS.msg.loopDetected});
                            case 'updatingDependencies':
                                return (cell.valueOverride != u ? cell.valueOverride : cell.value);
                        }

                        if (cell.defer) {//merging creates a defer property, which points the cell to another location to get the other value
                            return jS.updateCellValue.call(cell.defer);
                        }

                        cell.state.push('updating');
                        cell.fnCount = 0;
                        cell.result = null;

                        if (cell.calcLast != jS.calcLast || cell.calcDependenciesLast != jS.calcDependenciesLast) {
                            cell.valueOverride = null;
                            cell.calcLast = jS.calcLast;
                            cell.calcDependenciesLast = jS.calcDependenciesLast;
                            cell.needsUpdated = true;

                            cell.calcCount++;
                            if (cell.formula) {
                                try {
                                    if (cell.formula.charAt(0) == '=') {
                                        cell.formula = cell.formula.substring(1);
                                    }

                                    var formulaParser;
                                    if (jS.callStack) { //we prevent parsers from overwriting each other
                                        if (!cell.formulaParser) { //cut down on un-needed parser creation
                                            cell.formulaParser = win.Formula(jS.cellHandler);
                                        }
                                        formulaParser = cell.formulaParser
                                    } else {//use the sheet's parser if there aren't many calls in the callStack
                                        formulaParser = jS.formulaParser;
                                    }

                                    jS.callStack++;
                                    formulaParser.setObj(cell);
                                    cell.result = formulaParser.parse(cell.formula);
                                } catch (e) {
                                    cell.result = e.toString();
                                }
                                jS.callStack--;

                                if (cell.result && cell.cellType && s.cellTypeHandlers[cell.cellType]) {
                                    cell.result = s.cellTypeHandlers[cell.cellType].call(cell, cell.result);
                                }
                                jS.filterValue.call(cell);
                            } else if (cell.value && cell.cellType && s.cellTypeHandlers[cell.cellType]) {
                                cell.result = s.cellTypeHandlers[cell.cellType].call(cell, cell.value);
                                jS.filterValue.call(cell);
                            } else {
                                if (cell.value != u && cell.value.charAt) {
                                    fn = jS.s.cellStartingHandlers[cell.value.charAt(0)];
                                    if (fn) {
                                        cell.valueOverride = fn.call(cell, cell.value);
                                    } else {
                                        fn = jS.s.cellEndHandlers[cell.value.charAt(cell.value.length - 1)];
                                        if (fn) {
                                            cell.valueOverride = fn.call(cell, cell.value);
                                        }
                                    }
                                }
                                jS.filterValue.call(cell);
                            }
                        }
                        cell.needsUpdated = false;
                        cell.state.pop();
                        return (cell.valueOverride != u ? cell.valueOverride : cell.value);
                    },

                    /**
                     * Ignites calculation with dependent cells is recursively called if cell uses value from another cell, also adds dependent cells to the dependencies attribute of cell
                     * @memberOf jS
                     */
                    updateCellDependencies:function () {
                        if ((this.state || (this.state = [])).length) return;
                        this.state.push('updatingDependencies');
                        var dependencies = this.dependencies || []; //just in case it was never set
                        this.dependencies = [];
                        var i = dependencies.length - 1;

                        if (i > -1) {
                            do {
                                var dependantCell = dependencies[i],
                                    dependantCellLoc = jS.getTdLocation(dependantCell.td);

                                dependantCell.calcDependenciesLast = 0;

                                jS.updateCellValue.call(dependantCell);
                                if (dependantCellLoc.row > 0 && dependantCellLoc.col > 0) {
                                    jS.updateCellDependencies.call(dependantCell);
                                }
                            } while (i--);
                        }

                        this.state.pop();
                    },

                    /**
                     * Filters cell's value so correct entity is displayed, use apply on cell object
                     * @memberOf jS
                     */
                    filterValue:function () {
                        var encodedValue, html;
                        if (this.result != u) {
                            this.value = this.result.valueOf();
                            html = this.result.html;
                        } else if (typeof this.value == 'string' && this.value.length > 0) {
                            encodedValue = s.encode(this.value);
                        }

                        this.td.html(html || encodedValue || this.value);
                    },

                    /**
                     * Object handler for formulaParser
                     * @memberOf jS
                     * @namespace
                     */
                    cellHandler:{

                        /**
                         * Variable handler for formulaParser, arguments are the variable split by '.'.  Expose variables by using jQuery.sheet setting formulaVariables
                         * @returns {*}
                         * @memberOf jS.cellHandler
                         */
                        variable:function () {
                            if (arguments.length) {
                                var name = arguments[0],
                                    attr = arguments[1],
                                    formulaVariables = jS.s.formulaVariables,
                                    formulaVariable,
                                    result;

                                switch (name.toLowerCase()) {
                                    case 'true':
                                        result = new Boolean(true);
                                        result.html = 'TRUE';
                                        return result;
                                    case 'false':
                                        result = new Boolean(false);
                                        result.html = 'FALSE';
                                        return result;
                                }

                                if (formulaVariable = formulaVariables[name] && !attr) {
                                    return formulaVariable;
                                } else if (formulaVariable && attr) {
                                    return formulaVariable[attr];
                                } else {
                                    return '';
                                }
                            }
                        },

                        /**
                         * time to fraction of day 1 / 0-24
                         * @param {String} time
                         * @param {Boolean} isAmPm
                         * @returns {*}
                         * @memberOf jS.cellHandler
                         */
                        time:function (time, isAmPm) {
                            return times.fromString(time, isAmPm);
                        },

                        /**
                         * get a number from variable
                         * @param {*} num
                         * @returns {Number}
                         * @memberOf jS.cellHandler
                         */
                        number:function (num) {
                            switch (typeof num) {
                                case 'number':
                                    return num;
                                case 'string':
                                    if (!n(num)) {
                                        return num * 1;
                                    }
                                case 'object':
                                    if (num.getMonth) {
                                        return dates.toCentury(num);
                                    }
                            }
                            return num;
                        },

                        /**
                         * get a number from variable
                         * @param {*} _num
                         * @returns {Number}
                         * @memberOf jS.cellHandler
                         */
                        numberInverted: function(_num) {
                            var num = jS.cellHandler.number(_num),
                                inverted = new Number(num.valueOf() * -1);
                            if (num.html) {
                                inverted.html = num.html;
                            }
                            return inverted;
                        },

                        /**
                         * Perform math internally for parser
                         * @param {String} mathType
                         * @param {*} num1
                         * @param {*} num2
                         * @returns {*}
                         */
                        performMath: function (mathType, num1, num2) {
                            var type1,
                                type2,
                                type1IsNumber = true,
                                type2IsNumber = true,
                                errors = [],
                                value,
                                output = function(val) {return val;};

                            switch (type1 = (typeof num1.valueOf())) {
                                case 'number':break;
                                case 'string':
                                    if (!n(num1)) {
                                        num1 *= 1;
                                    } else {
                                        type1IsNumber = false;
                                    }
                                    break;
                                case 'object':
                                    if (num1.getMonth) {
                                        num1 = dates.toCentury(num1);
                                        output = dates.get;
                                    } else {
                                        type1IsNumber = false;
                                    }
                                    break;
                                default:
                                    type1IsNumber = false;
                            }

                            switch (type2 = (typeof num2.valueOf())) {
                                case 'number':break;
                                case 'string':
                                    if (!n(num2)) {
                                        num2 *= 1;
                                    } else {
                                        type2IsNumber = false;
                                    }
                                    break;
                                case 'object':
                                    if (num2.getMonth) {
                                        num2 = dates.toCentury(num2);
                                    } else {
                                        type2IsNumber = false;
                                    }
                                    break;
                                default:
                                    type2IsNumber = false;
                            }

                            if (!type1IsNumber) {
                                errors.push('not a number: ' + num1);
                                num1 = 0;
                            }

                            if (!type2IsNumber) {
                                errors.push('not a number: ' + num2);
                                num2 = 0;
                            }

                            if (errors.length) {
                                //throw new Error(errors.join(';') + ';');
                            }

                            switch (mathType) {
                                case '+':
                                    value = num1 + num2;
                                    break;
                                case '-':
                                    value = num1 - num2;
                                    break;
                                case '/':
                                    value = num1 / num2;
                                    if (value == Infinity || value == nAN) {
                                        value = 0;
                                    }
                                    break;
                                case '*':
                                    value = num1 * num2;
                                    break;
                                case '^':
                                    value = math.pow(num1, num2);
                                    break;
                            }

                            return output(value);
                        },

                        /**
                         * Get cell value
                         * @param {String} id example "A1"
                         * @returns {*}
                         * @memberOf jS.cellHandler
                         */
                        cellValue:function (id) { //Example: A1
                            var loc = jSE.parseLocation(id), cell;

                            cell = jS.cellHandler.createDependency.call(this, this.sheet, loc);

                            jS.updateCellValue.call(cell);
                            return (cell.valueOverride != u ? cell.valueOverride : cell.value);
                        },

                        /**
                         * Creates a relationship between 2 cells, where the formula originates and the cell that is required to supply a value to
                         * @param {Number} sheetIndex
                         * @param {Object} loc {row, col}
                         * @returns {Object}
                         */
                        createDependency:function (sheetIndex, loc) {
                            var sheet, row, cell;
                            if (!(sheet = jS.spreadsheets[sheetIndex])) return null;
                            if (!(row = sheet[loc.row])) return null;
                            if (!(cell = row[loc.col])) return null;

                            if (!cell.dependencies) cell.dependencies = [];

                            if ($.inArray(this, cell.dependencies) < 0) {
                                cell.dependencies.push(this);
                            }

                            return cell;
                        },

                        /**
                         * Get cell values as an array
                         * @param {String} start example "A1"
                         * @param {String} end example "B1"
                         * @returns {Array}
                         * @memberOf jS.cellHandler
                         */
                        cellRangeValue:function (start, end) {//Example: A1:B1
                            start = jSE.parseLocation(start);
                            end = jSE.parseLocation(end);
                            var result = [],
                                i = math.max(start.row, end.row),
                                iEnd = math.min(start.row, end.row),
                                j = math.max(start.col, end.col),
                                jStart = j,
                                jEnd = math.min(start.col, end.col),
                                cell;

                            if (i >= iEnd || j >= jEnd) {
                                do {
                                    j = jStart;
                                    do {
                                        cell = jS.spreadsheets[this.sheet][i][j];
                                        jS.cellHandler.createDependency.call(this, this.sheet, {row:i, col:j});
                                        result.unshift(jS.updateCellValue.call(cell));
                                    } while(j-- > jEnd);
                                } while (i-- > iEnd);
                                return result;
                            }

                            return result;
                        },

                        /**
                         * Get cell value
                         * @param {String} id example "$A$1"
                         * @returns {*}
                         * @memberOf jS.cellHandler
                         */
                        fixedCellValue:function (id) {
                            id = id.replace(/\$/g, '');
                            return jS.cellHandler.cellValue.call(this, id);
                        },

                        /**
                         * Get cell values as an array
                         * @param {String} start example "$A$1"
                         * @param {String} end example "$B$1"
                         * @returns {Array}
                         * @memberOf jS.cellHandler
                         */
                        fixedCellRangeValue:function (start, end) {
                            start = start.replace(/\$/g, '');
                            end = end.replace(/\$/g, '');
                            return jS.cellHandler.cellRangeValue.call(this, start, end);
                        },

                        /**
                         * Get cell value from a different sheet within an instance
                         * @param {String} sheet example "SHEET1"
                         * @param {String} id example "A1"
                         * @returns {*}
                         * @memberOf jS.cellHandler
                         */
                        remoteCellValue:function (sheet, id) {//Example: SHEET1:A1
                            var loc = jSE.parseLocation(id),
                                sheetIndex = jSE.parseSheetLocation(sheet);

                            jS.cellHandler.createDependency.call(this, sheetIndex, loc);

                            return jS.updateCellValue(sheetIndex, loc.row, loc.col);
                        },

                        /**
                         * Get cell values as an array from a different sheet within an instance
                         * @param {String} sheet example "SHEET1"
                         * @param {String} start example "A1"
                         * @param {String} end example "B1"
                         * @returns {Array}
                         * @memberOf jS.cellHandler
                         */
                        remoteCellRangeValue:function (sheet, start, end) {//Example: SHEET1:A1:B2
                            sheet = jSE.parseSheetLocation(sheet);
                            start = jSE.parseLocation(start);
                            end = jSE.parseLocation(end);

                            var result = [];

                            for (var i = start.row; i <= end.row; i++) {
                                for (var j = start.col; j <= end.col; j++) {
                                    result.push(jS.updateCellValue(sheet, i, j));
                                }
                            }

                            return [result];
                        },

                        /**
                         * Calls a function either from jQuery.sheet.engine or defined in jQuery sheet setting formulaFunctions.  When calling a function the cell being called from is "this".
                         * @param {String} fn function name (Will be converted to upper case)
                         * @param {Array} [args] arguments needing to be sent to function
                         * @returns {*}
                         * @memberOf jS.cellHandler
                         */
                        callFunction:function (fn, args) {
                            fn = fn.toUpperCase();
                            args = args || [];

                            if ($.sheet.fn[fn]) {
                                this.fnCount++;
                                var result = $.sheet.fn[fn].apply(this, args);
                                return result;
                            } else {
                                return s.error({error:"Function " + fn + " Not Found"});
                            }
                        }
                    },

                    /**
                     * Cell lookup handlers
                     * @memberOf jS
                     * @namespace
                     */
                    cellLookupHandlers:{

                        /**
                         * @param {String} id example "$A$1"
                         * @returns {Array} [sheet, startCell, endCell]
                         * @memberOf jS.cellLookupHandlers
                         */
                        fixedCellValue:function (id) {
                            return [jS.sheet, jSE.parseLocation(id), jSE.parseLocation(id)];
                        },

                        /**
                         * @param {String} sheet example "SHEET1"
                         * @param {String} start example "$A$1"
                         * @param {String} end example "$B$1"
                         * @returns {Array} [sheet, startCell, endCell]
                         * @memberOf jS.cellLookupHandlers
                         */
                        fixedCellRangeValue:function (sheet, start, end) {
                            return [jSE.parseSheetLocation(sheet), jSE.parseLocation(start), jSE.parseLocation(end)];
                        },

                        /**
                         * doesn't do anything right now
                         * @param id
                         * @memberOf jS.cellLookupHandlers
                         */
                        cellValue:function (id) {

                        },

                        /**
                         * @param {String} sheet example "SHEET1"
                         * @param {String} start example "A1"
                         * @param {String} end example "B1"
                         * @returns {Array} [sheet, startCell, endCell]
                         * @memberOf jS.cellLookupHandlers
                         */
                        cellRangeValue:function (sheet, start, end) {
                            return [jS.sheet, jSE.parseLocation(start), jSE.parseLocation(end)];
                        },

                        /**
                         * @param {String} sheet example "SHEET1"
                         * @param {String} id example "A1"
                         * @returns {Array} [sheet, startCell, endCell]
                         * @memberOf jS.cellLookupHandlers
                         */
                        remoteCellValue:function (sheet, id) {
                            return [jS.sheet, jSE.parseLocation(id), jSE.parseLocation(id)];
                        },

                        /**
                         *
                         * @param {String} sheet example "SHEET1"
                         * @param {String} start example "A1"
                         * @param {String} end example "B1"
                         * @returns {Array} [sheet, startCell, endCell]
                         * @memberOf jS.cellLookupHandlers
                         */
                        remoteCellRangeValue:function (sheet, start, end) {
                            return [jSE.parseSheetLocation(sheet), jSE.parseLocation(start), jSE.parseLocation(end)];
                        },

                        /**
                         * @returns {*}
                         * @memberOf jS.cellLookupHandlers
                         */
                        callFunction:function () {
                            if (arguments[0] == "VLOOKUP" || arguments[0] == "HLOOKUP" && arguments[1]) {
                                if (arguments[1] && arguments[1][1]) {
                                    return arguments[1][1];
                                }
                                return [];
                            }
                        }
                    },

                    /**
                     * Looks up cell using jS.cellLookupHandlers
                     * @returns {Array}
                     * @memberOf jS
                     */
                    cellLookup:function () {
                        var formulaParser = Formula($.extend({}, jS.cellHandler, jS.cellLookupHandlers));
                        formulaParser.setObj(this);

                        var args = formulaParser.parse(this.formula),
                            lookupTable = [];

                        for (var row = args[1].row; row <= args[2].row; row++) {
                            for (var col = args[1].col; col <= args[2].col; col++) {
                                lookupTable.push(jS.getCell(row, col, args[0]));
                            }
                        }

                        return lookupTable;
                    },

                    /**
                     * Date of last calculation
                     * @memberOf jS
                     */
                    calcLast:0,

                    /**
                     * @memberOf jS
                     */
                    calcDependenciesLast:0,

                    /**
                     * Where jS.spreadsheets are calculated, and returned to their td counterpart
                     * @param {Number} [sheetIndex] table index
                     * @param {Boolean} [refreshCalculations]
                     * @memberOf jS
                     */
                    calc:function (sheetIndex, refreshCalculations) {
                        sheetIndex = sheetIndex || jS.i;
                        if (
                            jS.readOnly[sheetIndex]
                            || jS.isChanged(sheetIndex) === false
                            && !refreshCalculations
                            || !jS.formulaParser
                            ) {
                            return false;
                        } //readonly is no calc at all

                        jS.calcLast = new Date();

                        var sheet = jS.spreadsheetToArray(null, sheetIndex);
                        jSE.calc(sheetIndex, sheet, jS.updateCellValue);
                        jS.trigger('sheetCalculation', [
                            {which:'speadsheet', sheet:sheet, index:sheetIndex}
                        ]);
                        jS.setChanged(false);
                        return true;
                    },

                    /**
                     * Calculates just the dependencies of a single cell, and their dependencies recursivley
                     * @param {Date} last
                     * @param {Boolean} skipUndoable
                     * @memberOf jS
                     */
                    calcDependencies:function (last, skipUndoable) {
                        last = last || new Date();
                        jS.calcDependenciesLast = last;

                        if (!skipUndoable) {
                            var cell = this;
                            jS.undo.createCells([this], function(cells) {
                                jS.trigger('sheetPreCalculation', [
                                    {which:'cell', cell:cell}
                                ]);

                                jS.setDirty(true);
                                jS.setChanged(true);
                                jS.updateCellValue.call(cell);
                                jS.updateCellDependencies.call(cell);
                                jS.trigger('sheetCalculation', [
                                    {which:'cell', cell: cell}
                                ]);

                                return cells;
                            });
                        } else {
                            jS.trigger('sheetPreCalculation', [
                                {which:'cell', cell:this}
                            ]);

                            jS.setDirty(true);
                            jS.setChanged(true);
                            jS.updateCellValue.call(this);
                            jS.updateCellDependencies.call(this);
                            jS.trigger('sheetCalculation', [
                                {which:'cell', cell: this}
                            ]);
                        }
                    },

                    /**
                     * adds a spreadsheet table
                     * @param {Object} [size]
                     * @memberOf jS
                     */
                    addSheet:function (size) {
                        size = size || {rows: 25, cols: 10};
                        if (size) {
                            jS.evt.cellEditAbandon();
                            jS.setDirty(true);
                            jS.controlFactory.sheetUI(jS.obj.ui()[0], $.sheet.makeTable(size), jS.sheetCount);

                            jS.setActiveSheet(jS.sheetCount);

                            jS.sheetCount++;

                            jS.sheetSyncSize();

                            jS.obj.pane().resizeScroll();

                            jS.trigger('sheetAdd', [jS.i]);
                        }
                    },

                    /**
                     * deletes a spreadsheet table
                     * @param {Number} [i] spreadsheet index within instance
                     * @memberOf jS
                     */
                    deleteSheet:function (i) {
                        var oldI = i || jS.i;
                        var enclosureArray =jS.controls.enclosures.toArray();
                        enclosureArray.splice(oldI,1)

                        jS.obj.barHelper().remove();

                        jS.obj.enclosure().remove();
                        //BUG Found:
                        //The enclosure will not be removed correctly while you delete the sheet.You may find all the enclosure will be hidden after you add a sheet and delete it.
                        //The reason is that "jS.controls.enclosures" is a jQuery selector object( "$([])" ) which can't not remove element like an array.All enclosure are reserved after sheet has been deleted.
                        //Here I remove the element by creating the selector object again.
                        jS.controls.enclosures = $(enclosureArray);
                        jS.obj.menus().remove();
                        jS.obj.tabContainer().children().eq(jS.i).remove();
                        jS.spreadsheets.splice(oldI, 1);
                        jS.controls.autoFiller.splice(oldI, 1);
                        jS.controls.bar.helper.splice(oldI, 1);
                        jS.controls.bar.corner.splice(oldI, 1);
                        jS.controls.bar.x.controls.splice(oldI, 1);
                        jS.controls.bar.x.handleFreeze.splice(oldI, 1);
                        jS.controls.bar.x.controls.splice(oldI, 1);
                        jS.controls.bar.x.menu.splice(oldI, 1);
                        if (jS.controls.bar.x.menuParent && jS.controls.bar.x.menuParent[oldI]) {
                            jS.controls.bar.x.menuParent.splice(oldI, 1);
                        }
                        jS.controls.bar.x.parent.splice(oldI, 1);
                        jS.controls.bar.x.scroll.splice(oldI, 1);
                        jS.controls.bar.x.td.splice(oldI, 1);
                        jS.controls.bar.y.controls.splice(oldI, 1);
                        jS.controls.bar.y.handleFreeze.splice(oldI, 1);
                        jS.controls.bar.y.controls.splice(oldI, 1);
                        jS.controls.bar.y.menu.splice(oldI, 1);
                        if (jS.controls.bar.y.menuParent && jS.controls.bar.y.menuParent[oldI]) {
                            jS.controls.bar.y.menuParent.splice(oldI, 1);
                        }
                        jS.controls.bar.y.parent.splice(oldI, 1);
                        jS.controls.bar.y.scroll.splice(oldI, 1);
                        jS.controls.bar.y.td.splice(oldI, 1);
                        jS.controls.barMenuLeft.splice(oldI, 1);
                        jS.controls.barMenuTop.splice(oldI, 1);
                        jS.controls.barLeft.splice(oldI, 1);
                        jS.controls.barTop.splice(oldI, 1);
                        jS.controls.barTopParent.splice(oldI, 1);
                        jS.controls.chart.splice(oldI, 1);
                        jS.controls.tdMenu.splice(oldI, 1);
                        jS.controls.enclosure.splice(oldI, 1);
                        jS.controls.fullScreen = null;
                        jS.controls.inPlaceEdit.splice(oldI, 1);
                        jS.controls.menus.splice(oldI, 1);
                        jS.controls.menuLeft.splice(oldI, 1);
                        jS.controls.menuRight.splice(oldI, 1);
                        jS.controls.pane.splice(oldI, 1);
                        jS.controls.scroll.splice(oldI, 1);
                        jS.controls.tables.splice(oldI, 1);
                        jS.controls.table.splice(oldI, 1);
                        jS.controls.tab.splice(oldI, 1);
                        jS.controls.toggleHide.x.splice(oldI, 1);
                        jS.controls.toggleHide.y.splice(oldI, 1);
                        jS.readOnly.splice(oldI, 1);
                        jS.i = 0;
                        jS.sheetCount--;
                        jS.sheetCount = math.max(jS.sheetCount, 0);

                        if (jS.sheetCount == 0) {
                            jS.addSheet();
                        }

                        jS.setActiveSheet(jS.i);
                        jS.setDirty(true);
                        jS.setChanged(true);

                        jS.trigger('sheetDelete', [oldI]);
                    },

                    /**
                     * removes the currently selected row
                     * @param {Number} row
                     * @param {Boolean} skipCalc
                     * @memberOf jS
                     */
                    deleteRow:function (row, skipCalc) {
                        var i, start, end, qty, size = jS.sheetSize();

                        if (row) {
                            start = end = row;
                        } else {
                            start = math.min(jS.highlightedLast.start.row, jS.highlightedLast.end.row);
                            end = math.max(jS.highlightedLast.start.row, jS.highlightedLast.end.row);
                        }

                        qty = (end - start) + 1;

                        if (start < 1 || size.cols < 2 || qty >= size.rows) {
                            return;
                        }

                        i = end;

                        do {
                            //remove tr's first
                            jS.getTd(jS.i, i, 1).parent().remove();
                        } while (start < i--);

                        //now remove bar
                        jS.controls.bar.y.td[jS.i].splice(start, qty);

                        //now remove cells
                        jS.spreadsheets[jS.i].splice(start, qty);

                        jS.refreshRowLabels(start);

                        jS.setChanged(true);

                        jS.offsetFormulas({
                                row:start,
                                col:0
                            }, {
                                row:-qty,
                                col:0
                            },
                            false,
                            true
                        );

                        jS.setDirty(true);

                        jS.evt.cellEditAbandon();

                        jS.obj.pane().resizeScroll();

                        jS.trigger('sheetDeleteRow', i);
                    },

                    /**
                     * removes the columns associated with highlighted cells
                     * @param {Number} [i]
                     * @memberOf jS
                     */
                    deleteColumn:function (i) {
                        var j, start, end, qty, size = jS.sheetSize();

                        if (i) {
                            start = end = i;
                        } else {
                            start = math.min(jS.highlightedLast.start.col, jS.highlightedLast.end.col);
                            end = math.max(jS.highlightedLast.start.col, jS.highlightedLast.end.col);
                        }

                        qty = (end - start) + 1;

                        if (
                            start < 1
                            || size.cols < 2
                            || qty >= size.cols
                        ) {
                            return;
                        }

                        j = end;

                        jS.obj.barHelper().remove();
                        do {
                            var table = jS.obj.table(),
                                col = jS.col(table[0], j),
                                bar = jS.obj.barTop(j).remove(),
                                tds = col.tds,
                                k = tds.length - 1;

                            //remove tds first
                            do {
                                $(tds[k]).remove();
                            } while (k--);

                            //now remove bar
                            jS.obj.barTop(j).remove();

                            //now remove col
                            $(col).remove();
                        } while (start < j--);

                        //remove column
                        jS.controls.bar.x.td[jS.i].splice(start, qty);

                        //remove cells
                        k = jS.spreadsheets[jS.i].length - qty;
                        do {
                            jS.spreadsheets[jS.i][k].splice(start, qty);
                        } while (k-- > 1);

                        //refresh labels
                        jS.refreshColumnLabels(start);

                        jS.setChanged(true);

                        jS.offsetFormulas({
                                row:0,
                                col:start
                            }, {
                                row:0,
                                col:-qty
                            },
                            false,
                            true
                        );

                        jS.setDirty(true);

                        jS.evt.cellEditAbandon();

                        jS.obj.pane().resizeScroll();

                        jS.trigger('sheetDeleteColumn', j);
                    },

                    /**
                     * manages a tabs inner value
                     * @param {Boolean} [get] makes return the current value of the tab
                     * @param {Function} [callback]
                     * @returns {String}
                     * @memberOf jS
                     */
                    sheetTab:function (get, callback) {
                        var sheetTab = '';
                        if (get) {
                            sheetTab = jS.obj.table().attr('title') || jS.msg.sheetTitleDefault.replace(/[{]index[}]/gi, jS.i + 1);
                            if (callback) {
                                callback(sheetTab);
                            }
                            return sheetTab;
                        } else if (jS.isSheetEditable() && s.editableNames) { //ensure that the sheet is editable, then let them change the sheet's name
                            s.prompt(
                                jS.msg.newSheetTitle,
                                function(newTitle) {
                                    if (!newTitle) { //The user didn't set the new tab name
                                        sheetTab = jS.obj.table().attr('title');
                                        newTitle = (sheetTab ? sheetTab : jS.msg.sheetTitleDefault.replace(/[{]index[}]/gi, jS.i + 1));
                                    } else {
                                        jS.setDirty(true);
                                        jS.obj.table().attr('title', newTitle);
                                        jS.obj.tab().html(newTitle);

                                        sheetTab = newTitle;
                                    }

                                    if (callback) {
                                        callback($(doc.createElement('div')).text(sheetTab).html());
                                    }
                                },
                                jS.sheetTab(true)
                            );
                            return null;
                        }
                    },

                    /**
                     * detects if a td is not visible
                     * @param {jQuery|HTMLElement} $td
                     * @memberOf jS
                     * @returns {Boolean|Object}
                     */
                    tdNotVisible:function($td) {
                        var pane = jS.obj.pane(),
                            td = $td[0],
                            visibleFold = {
                                top:0,
                                bottom:pane.clientHeight,
                                left:0,
                                right:pane.clientWidth
                            },

                            tdWidth = $td.width(),
                            tdHeight = $td.height(),
                            tdLocation = {
                                top:td.offsetTop,
                                bottom:td.offsetTop + tdHeight,
                                left:td.offsetLeft,
                                right:td.offsetLeft + tdWidth
                            },
                            $tdParent = $td.parent();

                        if (!td.col) {
                            return false;
                        }

                        var xHidden = $(td.barTop).is(':hidden'),
                            yHidden = $tdParent.is(':hidden'),
                            hidden = {
                                up:yHidden,
                                down:tdLocation.bottom > visibleFold.bottom && tdHeight <= pane.clientHeight,
                                left:xHidden,
                                right:tdLocation.right > visibleFold.right && tdWidth <= pane.clientWidth
                            };

                        if (hidden.up || hidden.down || hidden.left || hidden.right) {
                            return hidden;
                        }

                        return false;
                    },

                    /**
                     * scrolls the sheet to the selected cell
                     * @param {jQuery|HTMLElement} [$td] default is tdActive
                     * @param {boolean} [dontMoveAutoFiller] keeps autoFillerHandler in default position
                     * @memberOf jS
                     */
                    followMe:function ($td, dontMoveAutoFiller) {
                        $td = $td || jS.obj.tdActive();
                        if (!$td.length) return;

                        var i = 0,
                            x = 0,
                            y = 0,
                            direction,
                            pane = jS.obj.pane();

                        pane.scrollStyleX.i = 0;
                        pane.scrollStyleY.i = 0;

                        jS.setBusy(true);

                        while ((direction = this.tdNotVisible($td)) && i < 25) {
                            var scrolledArea = jS.scrolledTo();

                            if (direction.left) {
                                x--;
                                jS.evt.scroll.scrollTo({axis:'x', value:scrolledArea.end.col - 1});
                            } else if (direction.right) {
                                x++;
                                jS.evt.scroll.scrollTo({axis:'x', value:scrolledArea.end.col + 1});
                            }

                            if (direction.up) {
                                y--;
                                jS.evt.scroll.scrollTo({axis:'y', value:scrolledArea.end.row - 1});
                            } else if (direction.down) {
                                y++;
                                jS.evt.scroll.scrollTo({axis:'y', value:scrolledArea.end.row + 1});
                            }

                            i++;
                        }


                        //setTimeout(function () {
                            jS.setBusy(false);
                       // }, 100);
                        jS.evt.scroll.stop();
                        if(!dontMoveAutoFiller){
                            jS.autoFillerGoToTd($td);
                        }
                    },

                    /**
                     * moves autoFiller to a selected cell if it is enabled in settings
                     * @param {jQuery|HTMLElement} [$td] default is tdActive
                     * @param {Number} [h] height of a td object
                     * @param {Number} [w] width of a td object
                     * @memberOf jS
                     */
                    autoFillerGoToTd:function ($td, h, w) {
                        if (!s.autoFiller) return;

                        $td = $td || jS.obj.tdActive();
                        var td = $td[0];

                        if (td && td.type == 'cell') { //ensure that it is a usable cell
                            h = h || td.clientHeight;
                            w = w || td.clientWidth;
                            if (!td.offsetHeight || !td.offsetWidth || !td.clientHeight || !td.clientWidth) {
                                jS.autoFillerHide();
                                return;
                            }

                            var tdPos = $td.position();

                            jS.obj.autoFiller()
                                .show()
                                .css('top', ((tdPos.top + (h || $td.height()) - 3) + 'px'))
                                .css('left', ((tdPos.left + (w || $td.width()) - 3) + 'px'))
                        }
                    },

                    /**
                     * hides the auto filler if it is enabled in settings
                     * @memberOf jS
                     */
                    autoFillerHide:function () {
                        if (!s.autoFiller) return;

                        jS.obj.autoFiller().hide();
                    },

                    /**
                     * sets active a spreadsheet inside of a sheet instance
                     * @param {Number} [i] a sheet integer desired to show, default 0
                     * @memberOf jS
                     */
                    setActiveSheet:function (i) {
                        i = i || 0;

                        if (jS.cellLast.row > 0 || jS.cellLast.col > 0) {
                            jS.evt.cellEditDone();
                            jS.obj.formula().val('');
                        }

                        //the below use of _scrollLeft and _scrollTop are protected from IE, which makes those attributes go away after something is hidden, thus forgetting where you are scrolled to when you change sheets
                        //IE, stop flossin' me
                        var enclosures = jS.obj.enclosures(),
                            j = enclosures.length - 1,
                            enclosure;

                        jS.autoFillerHide();

                        if (j > 0) {
                            do {
                                if (i != j) {
                                    enclosure = enclosures[j];
                                    enclosure._scrollLeft = enclosure._scrollLeft || enclosure.scrollUI.scrollLeft;
                                    enclosure._scrollTop = enclosure._scrollTop || enclosure.scrollUI.scrollTop;
                                    enclosure.style.display = "none";
                                }
                            } while (j-- > 0);
                        }

                        jS.i = i;

                        enclosure = enclosures[i];

                        enclosure.style.display = "";

                        jS.themeRoller.tab.setActive();

                        jS.readOnly[i] = (enclosure.table.className || '').match(/\breadonly\b/i) != null;

                        enclosure.pane.resizeScroll(true);

                        enclosure.scrollUI.scrollLeft = enclosure._scrollLeft || enclosure.scrollUI.scrollLeft;
                        enclosure.scrollUI.scrollTop = enclosure._scrollTop || enclosure.scrollUI.scrollTop;
                        enclosure._scrollLeft = enclosure._scrollTop = null;
                        enclosure.scrollUI.onscroll();
                    },

                    /**
                     * opens a spreadsheet into the active sheet instance
                     * @param {jQuery|HTMLCollection} tables
                     * @memberOf jS
                     */
                    openSheet:function (tables) {
                        var lastIndex = tables.length - 1,
                            stack = [],
                            open = function() {
                                jS.setBusy(true);
                                var header = jS.controlFactory.header(),
                                    ui = open.ui = jS.controlFactory.ui(),
                                    sheetAdder = jS.controlFactory.sheetAdder(),
                                    tabContainer = jS.controlFactory.tabContainer(),
                                    i;

                                jS.sheetCount = tables.length - 1;

                                header.ui = ui;
                                header.tabContainer = tabContainer;

                                ui.header = header;
                                ui.sheetAdder = sheetAdder;
                                ui.tabContainer = tabContainer;

                                tabContainer.header = header;
                                tabContainer.ui = ui;

                                s.parent
                                    .append(header)
                                    .append(ui)
                                    .append(sheetAdder)
                                    .append(tabContainer);

                                for (i = 0; i < tables.length; i++) {
                                    var me = new Loader(i, tables[i]);
                                }
                            },
                            Loader = function(i, table) {
                                var me = this;
                                this.i = i;
                                this.table = table;
                                this.isLast = (i == lastIndex);

                                if ($.sheet.max) {
                                    var size = jS.tableSize(table);
                                    if (size.rows > $.sheet.max || size.cols > $.sheet.max) {
                                        jS.trigger('sheetMaxSize', [table, i]);
                                        s.confirm(
                                            jS.msg.maxSizeBrowserLimitationOnOpen,
                                            function() {me.load();}
                                        );
                                    } else {
                                        this.load();
                                    }
                                } else {
                                    this.load();
                                }
                            },
                            loaded = function() {
                                // resizable container div
                                jS.resizableSheet(s.parent, {
                                    minWidth:s.parent.width() * 0.1,
                                    minHeight:s.parent.height() * 0.1,
                                    start:function () {
                                        jS.setBusy(true);
                                        jS.obj.enclosure().hide();
                                        open.ui.sheetAdder.hide();
                                        open.ui.tabContainer.hide();
                                    },
                                    stop:function () {
                                        jS.obj.enclosure().show();
                                        open.ui.sheetAdder.show();
                                        open.ui.tabContainer.show();
                                        jS.setBusy(false);
                                        jS.sheetSyncSize();
                                        jS.obj.pane().resizeScroll();
                                    }
                                });

                                jS.sheetSyncSize();

                                jS.setActiveSheet(0);

                                jS.setDirty(false);
                                jS.setBusy(false);

                                while (stack.length) {
                                    jS.calc(jS.i = stack.pop());
                                }

                                jS.trigger('sheetAllOpened');
                            };

                        Loader.prototype.load = function() {
                            jS.controlFactory.sheetUI(open.ui, this.table, this.i);
                            jS.sheetCount++;

                            stack.push(this.i);

                            jS.trigger('sheetOpened', [this.i]);

                            if (this.isLast) {
                                loaded();
                            }
                        };

                        if (jS.isDirty) {
                            s.confirm(
                                jS.msg.openSheet,
                                open
                            );
                        } else {
                            open();
                        }
                    },

                    /**
                     * creates a new sheet from size from prompt
                     * @memberOf jS
                     */
                    newSheet:function () {
                        s.parent
                            .html($.sheet.makeTable())
                            .sheet(s);
                    },


                    /**
                     * synchronizes the called parent's controls so that the controls fit correctly within the parent
                     * @function sheetSyncSize
                     * @memberOf jS
                     */
                    sheetSyncSize:function () {
                        var h = s.parent[0].clientHeight;
                        if (!h) {
                            h = 400; //Height really needs to be set by the parent
                            s.parent.height(h);
                        } else if (h < 200) {
                            h = 200;
                            s.parent.height(h);
                        }

                        var w = s.parent[0].clientWidth;
                        h -= jS.obj.header().outerHeight();
                        h -= jS.obj.tabContainer().outerHeight() + jS.s.boxModelCorrection;

                        jS.obj.panes()
                            .height(h - win.scrollBarSize.height - s.boxModelCorrection)
                            .width(w - win.scrollBarSize.width);


                        jS.obj.enclosures()
                            .height(h)
                            .width(w);

                        jS.obj.scrolls()
                            .height(h)
                            .width(w);


                        jS.obj.ui()
                            .height(h)
                            .width(w);
                    },

                    /**
                     * changes a cell's style and makes it undoable/redoable
                     * @param style
                     * @param value
                     * @param cells
                     */
                    cellChangeStyle:function (style, value, cells) {
                        cells = cells || jS.highlighted(true);
                        if (cells.length < 1) {
                            return false;
                        }

                        jS.setDirty(this);
                        var i = cells.length - 1;

                        if ( i >= 0) {
                            jS.undo.createCells(cells, function(cells) { //save state, make it undoable
                                do {
                                    cells[i].td.css(style, value);
                                } while(i--);

                                return cells;
                            });
                            return true;
                        }

                        return false;
                    },

                    /**
                     * Finds a cell in a sheet from a value
                     * @param {String} [v] value to look for within a cell, if not supplied, a prompt is given
                     * @memberOf jS
                     */
                    cellFind:function (v) {
                        function find (v) {
                            var trs = jS.obj.table()
                                .children('tbody')
                                .children('tr');

                            if (v) {//We just do a simple uppercase/lowercase search.
                                var o = trs.children('td:contains("' + v + '")');

                                if (o.length < 1) {
                                    o = trs.children('td:contains("' + v.toLowerCase() + '")');
                                }

                                if (o.length < 1) {
                                    o = trs.children('td:contains("' + v.toUpperCase() + '")');
                                }

                                o = o.eq(0);
                                if (o.length > 0) {
                                    jS.cellEdit(o);
                                } else {
                                    s.alert(jS.msg.cellNoFind);
                                }                           }
                        }
                        if (!v) {
                            s.prompt(
                                jS.msg.cellFind,
                                find
                            );
                        } else {
                            find(v);
                        }

                    },

                    /**
                     * Sets active bar
                     * @param {String} type "col" || "row" || "all"
                     * @param {Number} begin start highlighting from
                     * @param {Number} end end highlighting to
                     * @memberOf jS
                     */
                    cellSetActiveBar:function (type, begin, end) {
                        var size = jS.sheetSize(),
                            first = math.min(begin, end),
                            last = math.max(begin, end),
                            start = {},
                            stop = {},

                            /**
                             * Sets active bar
                             * @param {Boolean} [before]
                             */
                            setActive = function (before) {
                                switch (s.cellSelectModel) {
                                    case 'oo': //follow cursor behavior
                                        this.row = (before ? start.row : stop.row);
                                        this.col = (before ? start.col : stop.col);
                                        this.td = jS.getTd(jS.i, this.row, this.col);
                                        if (!this.td.is(jS.cellLast.td)) {
                                            jS.cellEdit(this.td, false, true);
                                        }
                                        break;
                                    default: //stay at initial cell
                                        this.row = (before ? stop.row : start.row);
                                        this.col = (before ? stop.col : start.col);
                                        this.td = jS.getTd(jS.i, this.row, this.col);
                                        if (!this.td.is(jS.cellLast.td[0])) {
                                            jS.cellEdit(this.td, false, true);
                                        }
                                        break;
                                }
                            },
                            obj = [],
                            scrolledArea  = jS.scrolledTo(),
                            sheet = jS.obj.table(),
                            col,
                            row;

                        switch (type) {
                            case 'top':
                                start.row = scrolledArea.end.row;
                                start.col = first;
                                stop.row = scrolledArea.end.row;
                                stop.col = last;

                                jS.highlightedLast.start.row = 1;
                                jS.highlightedLast.start.col = first;
                                jS.highlightedLast.end.row = size.rows;
                                jS.highlightedLast.end.col = last;

                                col = last;

                                do {
                                    obj.push(jS.col(sheet[0], col));
                                } while(col-- > first);
                                break;
                            case 'left':
                                start.row = first;
                                start.col = scrolledArea.end.col;
                                stop.row = last;
                                stop.col = scrolledArea.end.col;

                                jS.highlightedLast.start.row = first;
                                jS.highlightedLast.start.col = 1;
                                jS.highlightedLast.end.row = last;
                                jS.highlightedLast.end.col = size.cols;

                                row = last;

                                do {
                                    obj.push(jS.getTd(jS.i, row, 1)[0].parentNode);
                                } while(row-- > first);
                                break;
                            case 'corner': //all
                                start.row = 1;
                                start.col = 1;
                                stop.col = size.cols;
                                stop.row = size.rows;

                                obj.push(sheet[0]);
                                break;
                        }

                        setActive(begin > end);

                        jS.themeRoller.cell.setHighlighted($(obj));
                    },

                    /**
                     * gets a range of selected cells, then returns it
                     * @param {Object} [e] jQuery event, when in use, is during mouse down
                     * @param {String} v Value to preserve and return
                     * @param {String} [newFn]
                     * @param {Boolean} [notSetFormula]
                     * @returns {String}
                     * @memberOf jS
                     */
                    getTdRange:function (e, v, newFn, notSetFormula) {
                        jS.cellLast.isEdit = true;

                        var range = function (loc) {
                                if (loc.first.col > loc.last.col ||
                                    loc.first.row > loc.last.row
                                    ) {
                                    return {
                                        first:jSE.parseCellName(loc.last.col, loc.last.row),
                                        last:jSE.parseCellName(loc.first.col, loc.first.row)
                                    };
                                } else {
                                    return {
                                        first:jSE.parseCellName(loc.first.col, loc.first.row),
                                        last:jSE.parseCellName(loc.last.col, loc.last.row)
                                    };
                                }
                            },
                            label = function (loc) {
                                var rangeLabel = range(loc),
                                    v2 = v + '';
                                v2 = (v2.match(/=/) ? v2 : '=' + v2); //make sure we can use this value as a formula

                                if (newFn || v2.charAt(v2.length - 1) != '(') { //if a function is being sent, make sure it can be called by wrapping it in ()
                                    v2 = v2 + (newFn ? newFn : '') + '(';
                                }

                                var formula,
                                    lastChar = '';
                                if (rangeLabel.first != rangeLabel.last) {
                                    formula = rangeLabel.first + ':' + rangeLabel.last;
                                } else {
                                    formula = rangeLabel.first;
                                }

                                if (v2.charAt(v2.length - 1) == '(') {
                                    lastChar = ')';
                                }

                                return v2 + formula + lastChar;
                            },
                            newVal = '',
                            loc,
                            sheet,
                            cells;

                        if (e) { //if from an event, we use mousemove method
                            loc = {
                                first:jS.getTdLocation([e.target])
                            };

                            sheet = jS.obj.table().mousemove(function (e) {
                                loc.last = jS.getTdLocation([e.target]);

                                newVal = label(loc);

                                if (!notSetFormula) {
                                    jS.obj.formula().val(newVal);
                                    jS.obj.inPlaceEdit().val(newVal);
                                }
                            });

                            $doc.one('mouseup', function () {
                                sheet.unbind('mousemove');
                                return newVal;
                            });
                        } else {
                            cells = jS.highlighted().not(jS.obj.tdActive());

                            if (cells.length) {
                                loc = { //tr/td column and row index
                                    first:jS.getTdLocation(cells.first()),
                                    last:jS.getTdLocation(cells.last())
                                };

                                newVal = label(loc);

                                if (!notSetFormula) {
                                    jS.obj.formula().val(newVal);
                                    jS.obj.inPlaceEdit().val(newVal);
                                }

                                return newVal;
                            } else {
                                return '';
                            }
                        }
                        return '';
                    },

                    /**
                     * Gets the td element within a spreadsheet instance
                     * @param {Number} tableIndex table index
                     * @param {Number} rowIndex row index
                     * @param {Number} colIndex column index
                     * @returns {jQuery|HTMLElement}
                     * @memberOf jS
                     */
                    getTd:function (tableIndex, rowIndex, colIndex) {
                        var table = jS.obj.tables()[tableIndex],
                            tBody,
                            row,
                            td;

                        if (
                            !table
                            || !(tBody = table.tBody)
                            || !(row = tBody.children[rowIndex])
                            || !(td = row.children[colIndex])
                        ) {
                            td = doc.createElement('td');
                        }

                        return $(td);
                    },

                    /**
                     * Gets the td row and column index as an object {row, col}
                     * @param {Object} td
                     * @returns {Object}
                     * @memberOf jS
                     */
                    getTdLocation:function (td) {
                        var result = {col:0, row:0};
                        td = td || '';
                        if (!td && !td[0]) return result;

                        td = td[0] || td;

                        if (td.parentNode == u || td.parentNode.rowIndex < 0) {
                            return result;
                        }

                        return {
                            col:parseInt(td.cellIndex),
                            row:parseInt(td.parentNode.rowIndex)
                        };
                    },

                    /**
                     * Get the bar index from an Element
                     * @memberOf jS
                     * @namespace
                     */
                    getBarIndex:{

                        /**
                         * get index from bar left element
                         * @param [td] if null, will return -1
                         * @returns {Number}
                         * @memberOf jS.getBarIndex
                         */
                        left:function (td) {
                            td = td || {};
                            if (!td.parentNode || n(td.parentNode.rowIndex)) {
                                return -1;
                            } else {
                                return td.parentNode.rowIndex;
                            }
                        },

                        /**
                         * get index from bar top element
                         * @param [td] if null, will return -1
                         * @returns {Number} cellIndex
                         * @memberOf hS.getBarIndex
                         */
                        top:function (td) {
                            td = td || {};
                            if (n(td.cellIndex)) {
                                return -1;
                            } else {
                                return td.cellIndex;
                            }
                        },
                        corner:function () {
                            return 0;
                        }
                    },

                    /**
                     * Time manager for measuring execution speed
                     * @namespace
                     * @memberOf jS
                     */
                    time:{
                        now:new Date(),
                        last:new Date(),
                        diff:function () {
                            return math.abs(math.ceil(this.last.getTime() - this.now.getTime()) / 1000).toFixed(5);
                        },
                        set:function () {
                            this.last = this.now;
                            this.now = new Date();
                        },
                        get:function () {
                            return this.now.getHours() + ':' + this.now.getMinutes() + ':' + this.now.getSeconds();
                        }
                    },

                    /**
                     * Changed tracker per sheet
                     * @memberOf jS
                     */
                    changed:[],

                    /**
                     * Changed = needs to be calculated
                     * @memberOf jS
                     * @param tableIndex
                     */
                    isChanged:function (tableIndex) {
                        return jS.changed[tableIndex || jS.i];
                    },

                    /**
                     * Sets changed
                     * @param {Boolean} changed changed state
                     * @memberOf jS
                     */
                    setChanged:function (changed) {
                        jS.changed[jS.i] = changed;
                    },

                    /**
                     * Dirty = changed needs saved
                     * @memberOf jS
                     */
                    isDirty:false,

                    /**
                     * Dirty manager
                     * @param dirty
                     * @memberOf jS
                     */
                    setDirty:function (dirty) {
                        jS.dirty = dirty;
                    },

                    /**
                     * @param v
                     * @memberOf jS
                     */
                    appendToFormula:function (v) {
                        var formula = jS.obj.formula(),
                            fV = formula.val();

                        if (fV.charAt(0) != '=') {
                            fV = '=' + fV;
                        }

                        formula.val(fV + v);
                    },

                    /**
                     * undo manager integration
                     * @memberOf jS
                     * @namespace
                     */
                    undo:{
                        manager:(
                            win.UndoManager
                                ? new UndoManager()
                                : {
                                    undo: emptyFN,
                                    redo: emptyFN,
                                    register: emptyFN,
                                    notLoaded: true
                                }
                        ),
                        cells:[],
                        id:0,
                        createCells: function(cells, fn, id) {
                            if (jS.undo.manager.notLoaded) {
                                this.createCells = function(cells, fn, id) {
                                    return fn(cells);
                                };
                                return this.createCells(cells, fn, id);
                            }
                            if (id == u) {
                                jS.undo.id++;
                                id = jS.undo.id;
                            }

                            var before = new jSCellRange(cells).clone().cells,
                                after = (fn ? new jSCellRange(fn(cells)).clone().cells : before);

                            before.id = id;
                            after.id = id;

                            jS.undo.manager.register(u, jS.undo.removeCells, [before, id], 'Remove Cells', u, jS.undo.createCells, [after, null, id], 'Create Cells');

                            if (id != jS.undo.id || !fn) {
                                jS.calcLast = new Date();
                                jS.undo.draw(after);
                            }

                            return true;
                        },
                        removeCells: function(cells, id) {
                            var i = 0, index = -1;
                            if (cells.id === id) {
                                index = i;
                            }

                            if (index !== -1) {
                                //jS.undo.cells.splice(index, 1);
                            }
                            jS.undo.draw(cells);
                        },
                        draw: function(clones) {
                            var i;
                            for (i = 0; i < clones.length; i++) {
                                var clone = clones[i],
                                    loc = jS.getTdLocation(clone.td),
                                    cell = jS.spreadsheets[clone.sheet][loc.row][loc.col];

                                cell.value = clone.value;
                                cell.formula = clone.formula;
                                cell.td = clone.td;
                                cell.dependencies = clone.dependencies;
                                cell.needsUpdated = clone.needsUpdated;
                                cell.calcCount = clone.calcCount;
                                cell.sheet = clone.sheet;
                                cell.calcLast = clone.calcLast;
                                cell.html = clone.html;
                                cell.state = clone.state;
                                cell.jS = clone.jS;
                                cell.calcDependenciesLast = clone.calcDependenciesLast;
                                cell.td.attr('style', clone.style);
                                cell.td.attr('class', clone.cl);

                                jS.updateCellValue.call(cell);
                            }
                        }
                    },

                    /**
                     * get cols associated with a sheet/table within an instance
                     * @param {jQuery|HTMLElement} [table]
                     * @returns {HTMLCollection|Array}
                     * @memberOf jS
                     */
                    cols:function (table) {
                        table = table || jS.obj.table()[0];

                        //table / colGroup / col
                        if (!table) return [];
                        if (!table.colGroup) return [];
                        if (!table.colGroup.children) return [];

                        return table.colGroup.children
                    },

                    /**
                     * clone tables associated with sheet, and return them free of decorations and enclosure/pane etc.
                     * @param {jQuery|HTMLElement} [tables]
                     * @param {Boolean} [useActualTables]
                     * @returns {jQuery|Element}
                     * @memberOf jS
                     */
                    tables:function (tables, useActualTables) {
                        tables = tables || jS.obj.tables();
                        var clonedTables = [],
                            i = tables.length - 1,
                            j,
                            table,
                            tBody,
                            colGroup,
                            colLeft,
                            tdLeft,
                            trTop,
                            trs,
                            tr;

                        do {
                            table = (useActualTables ? doc.body.removeChild(tables[i]) : tables[i].cloneNode(true));

                            if (
                                (colGroup = table.children[0])
                                && (colLeft = colGroup.children[0])
                            ) {
                                colGroup.removeChild(colLeft);
                            }

                            if (tBody = table.children[1]) {
                                trs = tBody.children;
                                trTop = trs[0];
                                tBody.removeChild(trTop);
                                j = trs.length - 1;
                                do {
                                    tr = trs[j];
                                    tdLeft = tr.children[0];
                                    tr.removeChild(tdLeft);
                                } while ( j-- > 0 ); //1 because trTop still exists in the array
                            }
                            clonedTables[i] = table;
                        } while (i-- > 0);

                        return jS.sheetDecorateRemove(false, $(clonedTables));
                    },

                    /**
                     * get col associated with a sheet/table within an instance
                     * @param {jQuery|HTMLElement} table
                     * @param {Number} [i] Index of column, default is last
                     * @returns {Element}
                     * @memberOf jS
                     */
                    col:function (table, i) {
                        table = table || jS.obj.table()[0];

                        var cols = jS.cols(table);

                        if (i === u) {
                            i = cols.length - 1;
                        }

                        return cols[i];
                    },

                    /**
                     * get cells of a table row
                     * @param {HTMLElement} [table]
                     * @param {Number} [i] Index of row, default is last
                     * @returns {HTMLCollection|Array}
                     * @memberOf jS
                     */
                    rowTds:function (table, i) {
                        table = table || jS.obj.table();

                        var rows = jS.rows(table);

                        if (!rows.length) {
                            return [];
                        }

                        if (i == u) {
                            i = rows.length - 1;
                        }


                        if (!rows[i]) return []; //tr
                        if (!rows[i].children) return []; //td

                        return rows[i].children;
                    },

                    /**
                     * Get rows of a sheet/table
                     * @param {HTMLElement} table
                     * @returns {HTMLCollection|Array}
                     * @memberOf jS
                     */
                    rows:function (table) {
                        table = table || jS.obj.table()[0];
                        if (!table) return []; //table
                        if (!table.tBody) return []; //tBody
                        if (!table.tBody.children) return []; //tr

                        return table.tBody.children;
                    },

                    /**
                     * Get all the td objects that are currently highlighted
                     * @param {Boolean} [cells] will return cell objects rather than HTMLElement
                     * @returns {jQuery|HTMLElement|Array}
                     */
                    highlighted:function(cells) {
                        var highlighted = jS.highlightedLast.obj || $([]),
                            obj = [],
                            tag,
                            i;

                        if (!(tag = highlighted) || !highlighted.length || !(tag = tag[0]) || !tag.tagName) {
                            return cells ? obj : $(obj);
                        }

                        switch (tag.tagName) {
                            case 'TD':
                                i = highlighted.length - 1;
                                do {
                                    obj.unshift(cells ? highlighted[i].jSCell : highlighted[i]);
                                } while (i-- > 0);
                                break;
                            case 'TR':
                                i = highlighted.length - 1;
                                do {
                                    if (highlighted[i].tds) {
                                        obj = obj.concat(cells ? highlighted[i].jSCells : highlighted[i].tds);
                                    }
                                } while(i-- > 0);
                                break;
                            case 'COL':
                                highlighted = highlighted.filter('col');
                                i = highlighted.length - 1;
                                do {
                                    if (highlighted[i].tds) {
                                        obj = obj.concat(cells ? highlighted[i].jSCells : highlighted[i].tds);
                                    }
                                } while(i-- > 0);
                                break;
                            case 'TABLE':
                                obj = (cells ? tag.jSCells : tag.tds);
                                break;
                        }

                        return cells ? obj : $(obj);
                    },

                    /**
                     *
                     * @param {jQuery|HTMLElement} [table]
                     * @returns {Object} {cols, rows}
                     * @memberOf jS
                     */
                    sheetSize:function (table) {
                        table = table || jS.obj.table()[0];
                        //table / tBody / tr / td

                        var lastRow = jS.rowTds(table),
                            loc = jS.getTdLocation(lastRow[lastRow.length - 1]);
                        return {
                            cols:loc.col,
                            rows:loc.row
                        };
                    },

                    test: function() {
                        var s = jS.highlighted(true);
//                        console.log(s);
                        console.log(jS.obj.enclosure())
                    },

                    sortVerticalSelectAscending:function() {
                        if (confirm('Do you want to extend your selection?')) {
                            jS.sortVertical(); return true;
                        } else {
                            jS.sortVerticalSingle(false); return true
                        }
                    },

                    sortVerticalSelectDescending:function() {
                        if (confirm('Do you want to extend your selection?')) {
                            jS.sortVertical(); return false;
                        } else {
                            jS.sortVerticalSingle(true); return false
                        }
                    },


                    /**
                     * Sorts what is highlighted vertically, and updates accordingly
                     * @param {Boolean} [reversed]
                     * @memberOf jS
                     */
                    sortVertical:function (reversed) {

                        var selected = jS.highlighted(true),
                            trSibling = selected[0].td.parent().prev(),
                            length = selected.length,
                            date = new Date(),
                            isNum = true,
                            vals = [],
                            row = [],
                            offset,
                            i = 0,
                            cell,
                            val,
                            td;

                        while(i<length){
                            cell = selected[i];
                            td = cell.td[0];
                            if(!isNaN(cell.value)){
                                val = (new Number(cell.value.valueOf()));
                            }
                            else{
                                isNum = false;
                                val = (new String(cell.value.valueOf()));
                            }
                            val.loc = jS.getTdLocation(td);
                            val.row = td.parentNode;
                            val.col = td;
                            val.cell = cell;
                            vals.push(val);
                            i++;
                        }


                        if(reversed){
                            if(isNum == false){
                                vals.sort(function(a,b){return b-a});
                            }
                            else{
                                vals.sort();
                                vals.reverse();
                            }
                        }

                        else
                        {
                            if(isNum == true){
                                vals.sort(function(a,b){return a-b});
                            }
                            else{
                                vals.sort();
                            }
                        }

                        jS.undo.createCells(selected);
                        while(offset = vals.length)                            {
                            val = vals.pop();
                            row = jS.spreadsheets[jS.i].splice(val.row.rowIndex, 1);
                            cell = val.cell;
                            cell.value = val.valueOf();
                            cell.calcLast = 0;
                            val.row.parentNode.removeChild(val.row);
                            trSibling.after(val.row);
                            val.row.children[0].innerHTML = trSibling[0].rowIndex + offset;
                            jS.spreadsheets[jS.i].splice(trSibling[0].rowIndex + 1, 0, row[0]);
                            jS.calcDependencies.call(cell, date, true);
                        }

                        jS.undo.createCells(selected);
                    },

                    /**
                     * Sorts a single column
                     * @param reversed
                     */
                    sortVerticalSingle: function (reversed) {
                        var selected = jS.highlighted(true),
                            length = selected.length,
                            i =  0,
                            num = [],
                            cell;

                        while(i<length){
                            num.push(selected[i].value);
                            i++
                        }
                        if(reversed){
                            num.sort(function(a,b){return b-a});
                        }
                        else{
                            num.sort(function(a,b){return a-b});
                        }
                        while(selected.length){
                            cell = selected.pop();
                            cell.value = num[selected.length];
                            cell.calcLast = 0;
                            jS.updateCellValue.call(cell);
                            jS.updateCellDependencies.call(cell);
                        }
                    },

                    sortHorizontalSelectAscending:function() {
                        if (confirm('Do you want to extend your selection?')) {
                            jS.sortHorizontal(); return true;
                        } else {
                            jS.sortHorizontalSingle(false); return true;
                    }
                    },

                    sortHorizontalSelectDescending:function() {
                        if (confirm('Do you want to extend your selection?')) {
                            jS.sortHorizontal(); return false;
                        } else {
                            jS.sortHorizontalSingle(true); return false;
                        }
                    },

                    /**
                     * Sorts what is highlighted horizontally, and updates accordingly
                     * @param {Boolean} [reversed]
                     * @memberOf jS
                     */
                    sortHorizontal:function (reversed) {

                        var selected = jS.highlighted(true),
                            tdSibling = selected[0].td[0],
                            tdSiblingIndex = tdSibling.cellIndex,
                            colGroup = tdSibling.table.colGroup,
                            size = jS.sheetSize().rows,
                            length = selected.length,
                            date = new Date(),
                            isNum = true,
                            vals = [],
                            offset,
                            i = 0,
                            x,
                            cell,
                            val,
                            tr,
                            td;

                        while(i<length){
                            x = 0;
                            cell = selected[i];
                            td = cell.td[0];
                            if(!isNaN(cell.value)){
                                val = new Number(cell.value.valueOf());
                            }
                            else{
                                isNum = false;
                                val = new String(cell.value.valueOf());
                            }
                            val.tds = [];
                            val.loc = jS.getTdLocation(td);
                            val.tr = td.parentNode;
                            val.td = td;
                            val.cell = cell;
                            while(x <= size){
                                val.tds.push(jS.obj.pane().table.children[1].children[x].children[td.cellIndex]);
                                x++;
                            }
                            vals.push(val);
                            i++;

                        }


                        if(reversed){
                            if(isNum == false){
                                vals.sort(function(a,b){return b-a});
                            }
                            else{
                                vals.sort();
                                vals.reverse();
                            }
                        }

                        else
                        {
                            if(isNum == true){
                                vals.sort(function(a,b){return a-b});
                            }
                            else{
                                vals.sort();
                            }
                        }

                        jS.undo.createCells(selected);
                        while(vals.length){
                            val = vals.pop();
                            while(val.tds.length > 1){
                                td = val.tds.pop();
                                tr = td.parentNode;
                                cell = jS.spreadsheets[jS.i][tr.rowIndex].splice(td.cellIndex, 1);
                                tr.insertBefore(td, tr.children[tdSiblingIndex]);
                                td.col = colGroup.children[vals.length + td.cellIndex - 1];
                                td.barTop = td.col.bar;
                                cell.value = td.jSCell.value;
                                cell.calcLast = date;
                                jS.spreadsheets[jS.i][tr.rowIndex].splice(td.cellIndex, 0, cell[0]);
                                jS.calcDependencies.call(cell, date, true);
                            }
                        }
                        jS.undo.createCells(selected);
                    },

                    /**
                     * Sorts a single row
                     * @param reversed
                     */
                    sortHorizontalSingle: function (reversed) {
                        var selected = jS.highlighted(true),
                            length = selected.length,
                            i =  0,
                            num = [],
                            cell;

                        while(i<length){
                            num.push(selected[i].value);
                            i++
                        }
                        if(reversed){
                            num.sort(function(a,b){return b-a});
                        }
                        else{
                            num.sort(function(a,b){return a-b});
                        }
                        while(selected.length){
                            cell = selected.pop();
                            cell.value = num[selected.length];
                            cell.calcLast = 0;
                            jS.updateCellValue.call(cell);
                            jS.updateCellDependencies.call(cell);
                        }
                    },

                    /**
                     *
                     * @param {jQuery|HTMLElement} [table]
                     * @returns {Object} {cols, rows}
                     * @memberOf jS
                     */
                    tableSize:function (table) {
                        table = table || jS.obj.table()[0];
                        //table / tBody / tr / td

                        var trs = (table.children[0].nodeName != "TBODY" ? table.children[1] : table.children[0]).children,
                            tds = trs[trs.length - 1].children,
                            td = tds[tds.length - 1],
                            loc = jS.getTdLocation(td);

                        return {
                            cols:loc.col,
                            rows:loc.row
                        };
                    },

                    /**
                     * Toggles from editable to viewable and back
                     * @param replacementTables
                     * @memberOf jS
                     */
                    toggleState:function (replacementTables) {
                        if (s.allowToggleState) {
                            var tables = replacementTables || jS.tables();
                            if (s.editable) {
                                jS.evt.cellEditAbandon();
                                jS.trigger('sheetSave', [tables]);
                            }
                            jS.setDirty(false);
                            jS.setChanged(true);
                            s.editable = !s.editable;

                            jS.kill();


                            s.parent
                                .html(tables)
                                .sheet(s);
                            s = null;
                        }
                    },

                    /**
                     * Turns a cell into a formula variable so it can be accessed by a name
                     * @param ref
                     * @memberOf jS
                     */
                    setCellRef:function (ref) {
                        function setRef(ref) {
                            if (ref) { //TODO: need to update value when cell is updated
                                jS.s.formulaVariables[ref] = jS.updateCellValue(jS.i, loc.row, loc.col);
                            }
                        }

                        var td = jS.obj.tdActive(),
                            loc = jS.getTdLocation(td);

                        if (ref) {
                            setRef(ref);
                        } else {
                            s.prompt(
                                jS.msg.setCellRef,
                                setRef
                            );
                        }
                    },

                    /**
                     * @memberOf jS
                     */
                    formulaParser: null
                };
            jS.setBusy(true);
            s.parent[0].jS = jS;

            //got tired of ie crashing when console not available
            if (!win.console) win.console = {log:function () {}};

            if (!win.scrollBarSize) {
                win.scrollBarSize = $.sheet.getScrollBarSize();
            }

            //ready the sheet's parser;
            if (win.Formula) {
                jS.formulaParser = win.Formula(jS.cellHandler);
            }

            //We need to take the sheet out of the parent in order to get an accurate reading of it's height and width
            //$(this).html(s.loading);
            s.origHtml = s.parent.children().detach();

            s.parent.addClass(jS.cl.parent);

            s.parent
                .bind('sheetSwitch', function (e, js, i) {
                    jS.switchSheet(i);
                })
                .bind('sheetRename', function (e, js, i) {
                    jS.renameSheet(i);
                });

            //Use the setting height/width if they are there, otherwise use parent's
            s.width = (s.width ? s.width : s.parent.width());
            s.height = (s.height ? s.height : s.parent.height());


            // Drop functions if they are not needed & save time in recursion
            if (!$.nearest) {
                jS.nearest = emptyFN;
            }

            jS.resizableCells = jS.resizableSheet = jS.resizable;
            if (!$.ui) {
                jS.resizable = jS.resizableCells = jS.resizableSheet = jS.draggable = emptyFN;
            } else {
                if (!s.resizableCells) jS.resizableCells = emptyFN;
                if (!s.resizableSheet) jS.resizableSheet = emptyFN;
            }

            if (!$.support.boxModel) {
                s.boxModelCorrection = 0;
            }

            if (!s.barMenus) {
                jS.controlFactory.barMenuTop = jS.controlFactory.barMenuLeft = emptyFN;
            }

            if (!s.freezableCells) {
                jS.controlFactory.barHandleFreeze.top = jS.controlFactory.barHandleFreeze.left = emptyFN;
            }

            if (s.calcOff) {
                jS.calc = emptyFN;
            }

            if (!win.Raphael) {
                jSE.chart = emptyFN;
            }

            $win
                .resize(function () {
                    if (jS && !jS.isBusy()) { //We check because jS might have been killed
                        s.width = s.parent.width();
                        s.height = s.parent.height();
                        jS.sheetSyncSize();
                    }
                });


            if ($.sheet.fn) { //If the new calculations engine is alive, fill it too, we will remove above when no longer needed.
                //Extend the calculation engine plugins
                $.sheet.fn = $.extend($.sheet.fn, s.formulaFunctions);

                //Extend the calculation engine with advanced functions
                if ($.sheet.advancedfn) {
                    $.sheet.fn = $.extend($.sheet.fn, $.sheet.advancedfn);
                }

                //Extend the calculation engine with finance functions
                if ($.sheet.financefn) {
                    $.sheet.fn = $.extend($.sheet.fn, $.sheet.financefn);
                }
            }

            s.title = s.title || s.parent.attr('title') || '';

            jS.s = s;

            s.parent.addClass(jS.cl.uiParent);

            if (s.origHtml.length) {
                jS.openSheet(s.origHtml);
            } else {
                jS.openSheet($(doc.createElement('table')));
            }

            jS.setBusy(false);

            return jS;
        },

        /**
         * Creates an HTMLElement from a size given
         * @memberOf jQuery.sheet
         * @param {Object} [size] expects keys rows,cols,
         * @param {Number} [columnWidth] column width as number
         * @param {Number} [rowHeight] row height as number
         * @returns {HTMLElement}
         */
        makeTable:function (size, columnWidth, rowHeight) {
            var doc = document;
            //set defaults;
            size = size || {rows:25, cols:10};
            columnWidth = columnWidth || 120;
            rowHeight = rowHeight || 15;

            //Create elements before loop to make it faster.
            var table = doc.createElement('table'),
                colGroup = doc.createElement('colgroup'),
                tBody = doc.createElement('tbody'),
                colStyle = 'width:' + columnWidth + 'px;',
                rowStyle = 'height:' + rowHeight + 'px;',
                tr,
                col,
                i,
                j;

            i = size.cols;

            do {
                col = doc.createElement('col');
                col.setAttribute('style', colStyle);
                colGroup.appendChild(col);
            } while (i-- > 1);

            i = size.rows;
            do {
                tr = doc.createElement('tr');
                tr.setAttribute('style', rowStyle);

                j = size.cols;
                do {
                    tr.appendChild(doc.createElement('td'));
                } while (j-- > 1);

                tBody.appendChild(tr);
            } while (i-- > 1);

            table.appendChild(colGroup);
            table.appendChild(tBody);

            return table;

        },

        /**
         * Destroy all spreadsheets loaded
         * @memberOf jQuery.sheet
         */
        killAll:function () {
            if ($.sheet) {
                var instance = $.sheet.instance;
                if (instance) {
                    for (var i = 0; i< instance.length; i++) {
                        if (instance[i] && instance[i].kill) {
                            instance[i].kill();
                        }
                    }
                    $.sheet.instance = [];
                }
            }
        },

        /**
         * Make 2 or more spreadsheets scroll to together, useful for history viewing or spreadsheet comparison
         * @param {Number} I instance index
         * @memberOf jQuery.sheet
         */
        scrollLocker:function (I) {
            var instance = $.sheet.instance;
            instance[I].obj.scrolls().each(function (i) {
                var me = this;
                $(this).scroll(function (e) {
                    var j = instance.length - 1, scrollUI;
                    if (j > -1) {
                        do {
                            scrollUI = instance[j].controls.scroll[i][0];
                            scrollUI.scrollLeft = me.scrollLeft;
                            scrollUI.scrollTop = me.scrollTop;
                        } while (j--);
                    }
                });
            });
        },

        /**
         * Make 2 or more spreadsheets switch together, just like clicking their tabs at the same time
         * @param {Number} I instance index
         * @memberOf jQuery.sheet
         */
        switchSheetLocker:function (I) {
            $.each($.sheet.instance, function () {
                this.s.parent.bind('sheetSwitch', function (e, jS, i) {
                    $.each($.sheet.instance, function () {
                        this.setActiveSheet(i);
                    });
                });
            });
        },

        /**
         * Get current instance count
         * @returns {Number}
         * @memberOf jQuery.sheet
         */
        I:function () {
            var I = 0;
            if (this.instance) {
                I = (this.instance.length === 0 ? 0 : this.instance.length - 1); //we use length here because we havent yet created sheet, it will append 1 to this number thus making this the effective instance number
            } else {
                this.instance = [];
            }
            return I;
        },

        /**
         * Get scrollBar size
         * @returns {Object} {height: int, width: int}
         * @memberOf jQuery.sheet
         */
        getScrollBarSize:function () {
            var doc = document,
                inner = $(doc.createElement('p')).css({
                    width:'100%',
                    height:'100%'
                }),
                outer = $(doc.createElement('div')).css({
                    position:'absolute',
                    width:'100px',
                    height:'100px',
                    top:'0',
                    left:'0',
                    visibility:'hidden',
                    overflow:'hidden'
                }).append(inner);

            $(doc.body).append(outer);

            var w1 = inner.width(),
                h1 = inner.height();

            outer.css('overflow', 'scroll');

            var w2 = inner.width(),
                h2 = inner.height();

            if (w1 == w2 && outer[0].clientWidth) {
                w2 = outer[0].clientWidth;
            }
            if (h1 == h2 && outer[0].clientHeight) {
                h2 = outer[0].clientHeight;
            }

            outer.detach();

            var w = w1 - w2, h = h1 - h2;

            return {
                width: w || 15,
                height: h || 15
            };
        },

        debugPositionBox:function (x, y, box, color, which) {
            color = color || '#' + Math.floor(Math.random() * 16777215).toString(16);
            if (box) {
                var $box = $([]);
                $box = $box.add(this.debugPositionBox(box.left, box.top, null, color, 'top-left'));
                $box = $box.add(this.debugPositionBox(box.right, box.top, null, color, 'top-right'));
                $box = $box.add(this.debugPositionBox(box.left, box.bottom, null, color, 'bottom-left'));
                $box = $box.add(this.debugPositionBox(box.right, box.bottom, null, color, 'bottom-right'));
                return $box;
            }
            return $('<div style="width: 10px; height: 10px; position: absolute;"></div>')
                .css('top', (y - 5) + 'px')
                .css('left', (x + 5) + 'px')
                .css('background-color', color)
                .click(function () {
                    console.log(which || 'none');
                })
                .appendTo('body');
        }
    };

    /**
     * jQuery.sheet's default formula engine
     * @namespace
     * @memberOf jQuery.sheet
     * @alias jQuery.sheet.engine
     */
    var jSE = $.sheet.engine = {
        /**
         * Calculate a spreadsheet
         * @param {Number} sheet
         * @param {Array} spreadsheet [row][cell], [1][1] = SHEET1!A1
         * @param {Function} ignite function to run on every cell
         * @memberOf jSE
         */
        calc:function (sheet, spreadsheet, ignite) {
            spreadsheet = spreadsheet || [];

            var row = spreadsheet.length - 1, col;
            if (row > 0) {
                do {
                    if (row > 0 && spreadsheet[row]) {
                        col = spreadsheet[row].length - 1;
                        if (col > 0) {
                            do {
                                ignite(sheet, row, col);
                            } while (col--);
                        }
                    }
                } while(row--);
            }
        },

        /**
         * Parse a cell name to it's location
         * @param {String} locStr "A1" = {row: 1, col: 1}
         * @returns {Object} {row: 1, col: 1}
         * @memberOf jQuery.sheet.engine
         */
        parseLocation:function (locStr) {
            for (var firstNum = 0; firstNum < locStr.length; firstNum++) {
                if (locStr.charCodeAt(firstNum) <= 57) {// 57 == '9'
                    break;
                }
            }
            return {
                row:parseInt(locStr.substring(firstNum)),
                col:jSE.columnLabelIndex(locStr.substring(0, firstNum))
            };
        },

        /**
         * Parse a sheet name to it's index
         * @param {String} locStr SHEET1 = 0
         * @returns {Number}
         * @memberOf jQuery.sheet.engine
         */
        parseSheetLocation:function (locStr) {
            return ((locStr + '').replace('SHEET', '') * 1) - 1;
        },

        /**
         *
         * @param {Number} col 1 = A
         * @param {Number} row 1 = 1
         * @returns {String}
         * @memberOf jQuery.sheet.engine
         */
        parseCellName:function (col, row) {
            return jSE.columnLabelString(col) + (row || '');
        },

        /**
         * Available labels, used for their index
         * @memberOf jQuery.sheet.engine
         */
        alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
        /**
         * Available labels, used for their index
         * @memberOf jQuery.sheet.engine
         */
        columnLabels: {},
        /**
         * Get index of a column label
         * @param {String} str A to 1, B to 2, Z to 26, AA to 27
         * @returns {Number}
         * @memberOf jQuery.sheet.engine
         */
        columnLabelIndex:function (str) {
            return this.columnLabels[str.toUpperCase()];
        },

        /**
         * Available indexes, used for their labels
         * @memberOf jQuery.sheet.engine
         */
        columnIndexes:[],

        /**
         * Get label of a column index
         * @param {Number} index 1 = A, 2 = B, 26 = Z, 27 = AA
         * @returns {String}
         * @memberOf jQuery.sheet.engine
         */
        columnLabelString:function (index) {
            if (!this.columnIndexes.length) { //cache the indexes to save on processing
                var s = '', i, j, k, l;
                i = j = k = -1;
                for (l = 1; l < 16385; ++l) {
                    s = '';
                    ++k;
                    if (k == 26) {
                        k = 0;
                        ++j;
                        if (j == 26) {
                            j = 0;
                            ++i;
                        }
                    }
                    if (i >= 0) s += this.alphabet[i];
                    if (j >= 0) s += this.alphabet[j];
                    if (k >= 0) s += this.alphabet[k];
                    this.columnIndexes[l] = s;
                    this.columnLabels[s] = l;
                }
            }
            return this.columnIndexes[index] || '';
        },

        /**
         * Regular expressions cache
         * @memberOf jQuery.sheet.engine
         */
        regEx: {
            n: 			    /[\$,\s]/g,
            cell: 			/\$?([a-zA-Z]+|[#]REF[!])\$?([0-9]+|[#]REF[!])/gi, //a1
            range: 			/\$?([a-zA-Z]+)\$?([0-9]+):\$?([a-zA-Z]+)\$?([0-9]+)/gi, //a1:a4
            remoteCell:		/\$?(SHEET+)\$?([0-9]+)[:!]\$?([a-zA-Z]+)\$?([0-9]+)/gi, //sheet1:a1
            remoteCellRange:/\$?(SHEET+)\$?([0-9]+)[:!]\$?([a-zA-Z]+)\$?([0-9]+):\$?([a-zA-Z]+)\$?([0-9]+)/gi, //sheet1:a1:b4
            sheet:			/SHEET/i,
            amp: 			/&/g,
            gt: 			/</g,
            lt: 			/>/g,
            nbsp: 			/&nbsp;/g
        },

        /**
         * Creates a chart, piggybacks g Raphael JS
         * @param {Object} o options
         * x: { legend: "", data: [0]}, //x data
         * y: { legend: "", data: [0]}, //y data
         * title: "",
         * data: [0], //chart data
         * legend: "",
         * td: jS.getTd(this.sheet, this.row, this.col), //td container for cell
         * chart: jQuery('<div class="' + jS.cl.chart + '" />') //chart
         * @returns {jQuery|HTMLElement}
         */
        chart:function (o) {
            var jS = this.jS,
                owner = this;

            function sanitize(v, toNum) {
                if (!v) {
                    if (toNum) {
                        v = 0;
                    } else {
                        v = "";
                    }
                } else {
                    if (toNum) {
                        v = arrHelpers.toNumbers(v);
                    } else {
                        v = arrHelpers.flatten(v);
                    }
                }
                return v;
            }

            o = $.extend({
                x:{ legend:"", data:[0]},
                y:{ legend:"", data:[0]},
                title:"",
                data:[0],
                legend:"",
                td:this.td,
                chart:$(doc.createElement('div'))
                    .addClass(jS.cl.chart)
                    .mousedown(function () {
                        o.td.mousedown();
                    }),
                gR:{}
            }, o);

            jS.controls.chart[jS.i] = jS.obj.chart().add(o.chart);

            o.data = sanitize(o.data, true);
            o.x.data = sanitize(o.x.data, true);
            o.y.data = sanitize(o.y.data, true);
            o.legend = sanitize(o.legend);
            o.x.legend = sanitize(o.x.legend);
            o.y.legend = sanitize(o.y.legend);

            o.legend = (o.legend ? o.legend : o.data);

            jS.s.parent.one('sheetCalculation', function () {
                var width = o.chart.width(),
                    height = o.chart.height(),
                    r = Raphael(o.chart[0]);
                if (o.title) r.text(width / 2, 10, o.title).attr({"font-size":20});
                switch (o.type) {
                    case "bar":
                        o.gR = r.barchart(width / 8, height / 8, width * 0.8, height * 0.8, o.data, o.legend)
                            .hover(function () {
                                this.flag = r.popup(
                                    this.bar.x,
                                    this.bar.y,
                                    this.bar.value || "0"
                                ).insertBefore(this);
                            }, function () {
                                this.flag.animate({
                                        opacity:0
                                    }, 300,

                                    function () {
                                        this.remove();
                                    }
                                );
                            });
                        break;
                    case "hbar":
                        o.gR = r.hbarchart(width / 8, height / 8, width * 0.8, height * 0.8, o.data, o.legend)
                            .hover(function () {
                                this.flag = r.popup(this.bar.x, this.bar.y, this.bar.value || "0").insertBefore(this);
                            }, function () {
                                this.flag.animate({
                                        opacity:0
                                    }, 300,
                                    function () {
                                        this.remove();
                                    }
                                );
                            });
                        break;
                    case "line":
                        o.gR = r.linechart(width / 8, height / 8, width * 0.8, height * 0.8, o.x.data, o.y.data, {
                            nostroke:false,
                            axis:"0 0 1 1",
                            symbol:"circle",
                            smooth:true
                        })
                            .hoverColumn(function () {
                                this.tags = r.set();
                                if (this.symbols.length) {
                                    for (var i = 0, ii = this.y.length; i < ii; i++) {
                                        this.tags.push(
                                            r
                                                .tag(this.x, this.y[i], this.values[i], 160, 10)
                                                .insertBefore(this)
                                                .attr([
                                                { fill:"#fff" },
                                                { fill:this.symbols[i].attr("fill") }
                                            ])
                                        );
                                    }
                                }
                            }, function () {
                                this.tags && this.tags.remove();
                            });

                        break;
                    case "pie":
                        o.gR = r.piechart(width / 2, height / 2, (width < height ? width : height) / 2, o.data, {legend:o.legend})
                            .hover(function () {
                                this.sector.stop();
                                this.sector.scale(1.1, 1.1, this.cx, this.c);

                                if (this.label) {
                                    this.label[0].stop();
                                    this.label[0].attr({ r:7.5 });
                                    this.label[1].attr({ "font-weight":800 });
                                }
                            }, function () {
                                this.sector.animate({ transform:'s1 1 ' + this.cx + ' ' + this.cy }, 500, "bounce");

                                if (this.label) {
                                    this.label[0].animate({ r:5 }, 500, "bounce");
                                    this.label[1].attr({ "font-weight":400 });
                                }
                            });
                        break;
                    case "dot":
                        o.gR = r.dotchart(width / 8, height / 8, width * 0.8, height * 0.8, o.x.data, o.y.data, o.data, {
                            symbol:"o",
                            max:10,
                            heat:true,
                            axis:"0 0 1 1",
                            axisxstep:o.x.data.length - 1,
                            axisystep:o.y.data.length - 1,
                            axisxlabels:(o.x.legend ? o.x.legend : o.x.data),
                            axisylabels:(o.y.legend ? o.y.legend : o.y.data),
                            axisxtype:" ",
                            axisytype:" "
                        })
                            .hover(function () {
                                this.marker = this.marker || r.tag(this.x, this.y, this.value, 0, this.r + 2).insertBefore(this);
                                this.marker.show();
                            }, function () {
                                this.marker && this.marker.hide();
                            });

                        break;
                }

                o.gR
                    .mousedown(function () {
                        o.td.mousedown().mouseup();
                    });

                o.chart.mousemove(function () {
                    o.td.mousemove();
                    return false;
                });

            });

            return o.chart;
        }
    };

    /**
     * The functions container of all functions used in jQuery.sheet
     * @namespace
     * @alias jQuery.sheet.fn
     * @name jFN
     */
    var jFN = $.sheet.fn = {
        /**
         * information function
         * @param v
         * @returns {Boolean}
         * @this jSCell
         * @memberOf jFN
         */
        ISNUMBER:function (v) {
            var result;
            if (!isNaN(v.valueOf())) {
                result = new Boolean(true);
                result.html = 'TRUE';
                return result;
            }
            result = new Boolean(false);
            result.html = 'FALSE'
            return result;
        },
        /**
         * information function
         * @param v
         * @memberOf jFN
         * @returns {*}
         */
        N:function (v) {
            if (v == null) {
                return 0;
            }
            if (v instanceof Date) {
                return v.getTime();
            }
            if (typeof(v) == 'object') {
                v = v.toString();
            }
            if (typeof(v) == 'string') {
                v = parseFloat(v.replace(jSE.regEx.n, ''));
            }
            if (isNaN(v)) {
                return 0;
            }
            if (typeof(v) == 'number') {
                return v;
            }
            if (v == true) {
                return 1;
            }
            return 0;
        },

        /**
         * information function
         * @returns {*|string}
         * @memberOf jFN
         */
        VERSION:function () {
            return this.jS.version;
        },

        /**
         * math function
         * @param v
         * @returns {number}
         * @memberOf jFN
         */
        ABS:function (v) {
            return Math.abs(jFN.N(v));
        },

        /**
         * math function
         * @param value
         * @param significance
         * @returns {number}
         * @memberOf jFN
         */
        CEILING:function (value, significance) {
            significance = significance || 1;
            return (parseInt(value / significance) * significance) + significance;
        },

        /**
         * math function
         * @param v
         * @returns {number}
         * @memberOf jFN
         */
        EVEN:function (v) {
            v = Math.round(v);
            var even = (v % 2 == 0);
            if (!even) {
                if (v > 0) {
                    v++;
                } else {
                    v--;
                }
            }
            return v;
        },

        /**
         * math function
         * @param v
         * @returns {number}
         * @memberOf jFN
         */
        EXP:function (v) {
            return Math.exp(v);
        },

        /**
         * math function
         * @param value
         * @param significance
         * @returns {*}
         * @memberOf jFN
         */
        FLOOR:function (value, significance) {
            significance = significance || 1;
            if (
                (value < 0 && significance > 0 )
                    || (value > 0 && significance < 0 )
                ) {
                var result = new Number(0);
                result.html = '#NUM';
                return result;
            }
            if (value >= 0) {
                return Math.floor(value / significance) * significance;
            } else {
                return Math.ceil(value / significance) * significance;
            }
        },

        /**
         * math function
         * @param v
         * @returns {number}
         * @memberOf jFN
         */
        INT:function (v) {
            return Math.floor(jFN.N(v));
        },

        /**
         * math function
         * @param v
         * @returns {number}
         * @memberOf jFN
         */
        LN:function (v) {
            return Math.log(v);
        },

        /**
         * math function
         * @param v
         * @param n
         * @returns {number}
         * @memberOf jFN
         */
        LOG:function (v, n) {
            n = n || 10;
            return Math.log(v) / Math.log(n);
        },

        /**
         * math function
         * @param v
         * @returns {*}
         * @memberOf jFN
         */
        LOG10:function (v) {
            return jFN.LOG(v);
        },

        /**
         * math function
         * @param x
         * @param y
         * @returns {number}
         * @memberOf jFN
         */
        MOD:function (x, y) {
            var modulus = x % y;
            if (y < 0) {
                modulus *= -1;
            }
            return modulus;
        },

        /**
         * math function
         * @param v
         * @returns {number}
         * @memberOf jFN
         */
        ODD:function (v) {
            var gTZ = false;
            if (v > 0) {
                v = Math.floor(Math.round(v));
                gTZ = true;
            } else {
                v = Math.ceil(v);
            }

            var vTemp = Math.abs(v);
            if ((vTemp % 2) == 0) { //even
                vTemp++;
            }

            if (gTZ) {
                return vTemp;
            } else {
                return -vTemp;
            }
        },

        /**
         * math function
         * @returns {number}
         * @memberOf jFN
         */
        PI:function () {
            return Math.PI;
        },

        /**
         * math function
         * @param x
         * @param y
         * @returns {number}
         * @memberOf jFN
         */
        POWER:function (x, y) {
            return Math.pow(x, y);
        },

        /**
         * math function
         * @param v
         * @returns {number}
         * @memberOf jFN
         */
        SQRT:function (v) {
            return Math.sqrt(v);
        },

        /**
         * math function
         * @returns {number}
         * @memberOf jFN
         */
        RAND:function () {
            return Math.random();
        },

        /**
         * math function
         * @returns {number}
         * @memberOf jFN
         */
        RND:function () {
            return Math.random();
        },

        /**
         * math function
         * @param v
         * @param decimals
         * @returns {number}
         * @memberOf jFN
         */
        ROUND:function (v, decimals) {
            var shift = Math.pow(10, decimals || 0);
            return Math.round(v * shift) / shift;
        },

        /**
         * math function
         * @param v
         * @param decimals
         * @returns {number}
         * @memberOf jFN
         */
        ROUNDDOWN:function (v, decimals) {
            var neg = (v < 0);
            v = Math.abs(v);
            decimals = decimals || 0;
            v = Math.floor(v * Math.pow(10, decimals)) / Math.pow(10, decimals);
            return (neg ? -v : v);
        },

        /**
         * math function
         * @param v
         * @param decimals
         * @returns {number}
         * @memberOf jFN
         */
        ROUNDUP:function (v, decimals) {
            var neg = (v < 0);
            v = Math.abs(v);
            decimals = decimals || 0;
            v = Math.ceil(v * Math.pow(10, decimals)) / Math.pow(10, decimals);
            return (neg ? -v : v);
        },

        /**
         * math function
         * @returns {number}
         * @memberOf jFN
         */
        SUM:function () {
            var sum = 0,
                v = arrHelpers.toNumbers(arguments),
                i = v.length - 1;

            if (i < 0) {
                return 0;
            }

            do {
                sum += v[i] * 1;
            } while (i--);

            return sum;
        },

        /**
         * math function
         * @param number
         * @param digits
         * @returns {*}
         * @memberOf jFN
         */
        TRUNC:function (number, digits) {
            digits = digits || 0;
            number = number + '';

            if (digits == 0) {
                return number.split('.').shift();
            }

            if (number.match('.')) {
                if (digits == 1) {
                    number = number.substr(0, number.length - 1);
                } else if (digits == -1) {
                    number = number.split('.').shift();
                    number = number.substr(0, number.length - 1) + '0';
                }
            }

            return number;
        },


        /**
         * statistical function
         * @param v
         * @returns {number}
         * @memberOf jFN
         */
        AVERAGE:function (v) {
            return jFN.SUM(arguments) / jFN.COUNT(arguments);
        },

        /**
         * statistical function
         * @param v
         * @returns {*}
         * @memberOf jFN
         */
        AVG:function (v) {
            return jFN.AVERAGE(v);
        },

        /**
         * statistical function
         * @returns {number}
         * @memberOf jFN
         */
        COUNT:function () {
            var count = 0,
                v = arrHelpers.toNumbers(arguments),
                i = v.length - 1;

            if (i < 0) {
                return count;
            }

            do {
                if (v[i] !== null) {
                    count++;
                }
            } while (i--);

            return count;
        },

        /**
         * statistical function
         * @returns {number}
         * @memberOf jFN
         */
        COUNTA:function () {
            var count = 0,
                v = arrHelpers.flatten(arguments),
                i = v.length - 1;

            if (i < 0) {
                return count;
            }

            do {
                if (v[i]) {
                    count++;
                }
            } while (i--);

            return count;
        },

        /**
         * statistical function
         * @returns {*}
         * @memberOf jFN
         */
        MAX:function () {
            var v = arrHelpers.toNumbers(arguments),
                max = v[0],
                i = v.length - 1;

            if (i < 0) {
                return 0;
            }

            do {
                max = (v[i] > max ? v[i] : max);
            } while (i--);

            return max;
        },

        /**
         * statistical function
         * @returns {*}
         * @memberOf jFN
         */
        MIN:function () {
            var v = arrHelpers.toNumbers(arguments),
                min = v[0],
                i = v.length - 1;

            if (i < 0) {
                return 0;
            }

            do {
                min = (v[i] < min ? v[i] : min);
            } while (i--);

            return min;
        },

        /**
         * string function
         * @param v
         * @returns {Number}
         * @memberOf jFN
         */
        ASC:function (v) {
            return v.charCodeAt(0);
        },
        /**
         * string function
         * @param v
         * @returns {string}
         * @memberOf jFN
         */
        CHAR:function (v) {
            return String.fromCharCode(v);
        },
        /**
         * string function
         * @param v
         * @returns {String}
         * @memberOf jFN
         */
        CLEAN:function (v) {
            var exp = new RegExp("[\cG\x1B\cL\cJ\cM\cI\cK\x07\x1B\f\n\r\t\v]","g");
            return v.replace(exp, '');
        },
        /**
         * string function
         * @param v
         * @returns {*}
         * @memberOf jFN
         */
        CODE:function (v) {
            return jFN.ASC(v);
        },
        /**
         * string function
         * @returns {String}
         * @memberOf jFN
         */
        CONCATENATE:function () {
            var arr = arrHelpers.flatten(arguments),
                result = '',
                cell = this;
            jQuery.each(arr, function (i) {
                result += arr[i];
            });
            return result;
        },
        /**
         * string function
         * @param v
         * @param decimals
         * @param symbol
         * @returns {Number}
         * @memberOf jFN
         */
        DOLLAR:function (v, decimals, symbol) {
            decimals = decimals || 2;
            symbol = symbol || '$';

            var result = new Number(v),
                r = jFN.FIXED(v, decimals, false);

            if (v >= 0) {
                result.html = symbol + r;
            } else {
                result.html = '(' + symbol + r.slice(1) + ')';
            }
            return result;
        },
        /**
         * string function
         * @param v
         * @param decimals
         * @param noCommas
         * @returns {String}
         * @memberOf jFN
         */
        FIXED:function (v, decimals, noCommas) {
            decimals = (decimals === undefined ? 2 : decimals);
            var multiplier = Math.pow( 10, decimals),
                result,
                v = Math.round( v * multiplier ) / multiplier;



            result = new String(v.toFixed(decimals));
            result.html = Globalize.format(v, 'n' + decimals);

            if (noCommas) {
                result.html = result.html.replace(Globalize.culture().numberFormat[','], '');
            }

            return result;

        },
        /**
         * string function
         * @param v
         * @param numberOfChars
         * @returns {string}
         * @memberOf jFN
         */
        LEFT:function (v, numberOfChars) {
            numberOfChars = numberOfChars || 1;
            return v.substring(0, numberOfChars);
        },
        /**
         * string function
         * @param v
         * @returns {*}
         * @memberOf jFN
         */
        LEN:function (v) {
            if (!v) {
                return 0;
            }
            return v.length;
        },
        /**
         * string function
         * @param v
         * @returns {string}
         * @memberOf jFN
         */
        LOWER:function (v) {
            return v.toLowerCase();
        },

        /**
         * string function
         * @param v
         * @param start
         * @param end
         * @returns {*}
         * @memberOf jFN
         */
        MID:function (v, start, end) {
            if (!v || !start || !end) {
                return this.jS.s.error({error:'ERROR'});
            }
            return v.substring(start - 1, end + start - 1);
        },
        /**
         * string function
         * @param oldText
         * @param start
         * @param numberOfChars
         * @param newText
         * @returns {*}
         * @memberOf jFN
         */
        REPLACE:function (oldText, start, numberOfChars, newText) {
            if (!oldText || !start || !numberOfChars || !newText) {
                return this.jS.s.error({error:'ERROR'});
            }
            var result = oldText.split('');
            result.splice(start - 1, numberOfChars);
            result.splice(start - 1, 0, newText);
            return result.join('');
        },
        /**
         * string function
         * @param v
         * @param times
         * @returns {string}
         * @memberOf jFN
         */
        REPT:function (v, times) {
            var result = '';
            for (var i = 0; i < times; i++) {
                result += v;
            }
            return result;
        },
        /**
         * string function
         * @param v
         * @param numberOfChars
         * @returns {string}
         * @memberOf jFN
         */
        RIGHT:function (v, numberOfChars) {
            numberOfChars = numberOfChars || 1;
            return v.substring(v.length - numberOfChars, v.length);
        },
        /**
         * string function
         * @param find
         * @param body
         * @param start
         * @returns {*}
         * @memberOf jFN
         */
        SEARCH:function (find, body, start) {
            start = start || 0;
            if (start) {
                body = body.split('');
                body.splice(0, start - 1);
                body = body.join('');
            }
            var i = body.search(find);

            if (i < 0) {
                return this.jS.s.error({error:'#VALUE!'});
            }

            return start + (start ? 0 : 1) + i;
        },
        /**
         * string function
         * @param text
         * @param oldText
         * @param newText
         * @param nthAppearance
         * @returns {string}
         * @memberOf jFN
         */
        SUBSTITUTE:function (text, oldText, newText, nthAppearance) {
            nthAppearance = nthAppearance || 0;
            oldText = new RegExp(oldText, 'g');
            var i = 1;
            text = text.replace(oldText, function (match, contents, offset, s) {
                var result = match;
                if (nthAppearance) {
                    if (i >= nthAppearance) {
                        result = newText;
                    }
                } else {
                    result = newText;
                }

                i++;
                return result;
            });
            return text;
        },
        /**
         * string function
         * @returns {*}
         * @memberOf jFN
         */
        TEXT:function () {
            return this.jS.s.error({error:'Not Yet Implemented'});
        },
        /**
         * string function
         * @param v
         * @returns {string}
         * @memberOf jFN
         */
        UPPER:function (v) {
            return v.toUpperCase();
        },
        /**
         * string function
         * @param v
         * @returns {*}
         * @memberOf jFN
         */
        VALUE:function (v) {
            if (jQuery.isNumeric(v)) {
                return v *= 1;
            } else {
                return this.jS.s.error({error:"#VALUE!"})
            }
        },

        /**
         * date/time function
         * @returns {Date}
         * @memberOf jFN
         */
        NOW:function () {
            var today = new Date();
            today.html = dates.toString(today);
            return today;
        },
        /**
         * date/time function
         * @returns {Number}
         * @memberOf jFN
         */
        TODAY:function () {
            var today = new Date(),
                result = new Number(dates.toCentury(today) - 1);
                result.html = dates.toString(today, 'd');
            return result;
        },
        /**
         * date/time function
         * @param weeksBack
         * @returns {Date}
         * @memberOf jFN
         */
        WEEKENDING:function (weeksBack) {
            var date = new Date();
            date = new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate() + 5 - date.getDay() - ((weeksBack || 0) * 7)
            );

            date.html = dates.toString(date, 'd');
            return date;
        },
        /**
         * date/time function
         * @param date
         * @param returnValue
         * @returns {number}
         * @memberOf jFN
         */
        WEEKDAY:function (date, returnValue) {
            date = dates.get(date);
            var day = date.getDay();

            returnValue = (returnValue ? returnValue : 1);
            switch (returnValue) {
                case 3:
                    switch (day) {
                        case 0:return 7;
                        case 1:return 1;
                        case 2:return 2;
                        case 3:return 3;
                        case 4:return 4;
                        case 5:return 5;
                        case 6:return 6;
                    }
                    break;
                case 2:
                    switch (day) {
                        case 0:return 6;
                        case 1:return 0;
                        case 2:return 1;
                        case 3:return 2;
                        case 4:return 3;
                        case 5:return 4;
                        case 6:return 5;
                    }
                    break;
                case 1:
                    day++;
                    break;
            }

            return day;
        },
        /**
         * date/time function
         * @param date
         * @returns {number}
         * @memberOf jFN
         */
        WEEKNUM:function (date) {//TODO: implement week starting
            date = dates.get(date);
            return dates.week(date) + 1;
        },
        /**
         * date/time function
         * @param date
         * @returns {number}
         * @memberOf jFN
         */
        YEAR:function (date) {
            date = dates.get(date);
            return date.getFullYear();
        },
        /**
         * date/time function
         * @param year
         * @param month
         * @param day
         * @returns {number}
         * @memberOf jFN
         */
        DAYSFROM:function (year, month, day) {
            return Math.floor((new Date() - new Date(year, (month - 1), day)) / dates.dayDiv);
        },
        /**
         * date/time function
         * @param v1
         * @param v2
         * @returns {number}
         * @memberOf jFN
         */
        DAYS:function (v1, v2) {
            var date1 = dates.get(v1),
                date2 = dates.get(v2),
                ONE_DAY = 1000 * 60 * 60 * 24;
            return Math.round(Math.abs(date1.getTime() - date2.getTime()) / ONE_DAY);
        },
        /**
         * date/time function
         * @param date
         * @returns {number}
         * @memberOf jFN
         */
        DAY:function (date) {
            date = dates.get(date);
            return date.getDate();
        },
        /**
         * date/time function
         * @param date1
         * @param date2
         * @param method
         * @returns {number}
         * @memberOf jFN
         */
        DAYS360:function (date1, date2, method) {
            date1 = dates.get(date1);
            date2 = dates.get(date2);

            var startDate = date1.getDate(),
                endDate = date2.getDate(),
                startIsLastDay = dates.isLastDayOfMonth(date1),
                endIsLastDay = dates.isLastDayOfMonth(date2),
                monthCount = dates.diffMonths(date1, date2);

            if (method) {//Euro method
                startDate = Math.min(startDate, 30);
                endDate = Math.min(endDate, 30);
            } else { //Standard
                if (startIsLastDay) {
                    startDate = 30;
                }
                if (endIsLastDay) {
                    if (startDate < 30) {
                        monthCount++;
                        endDate = 1;
                    } else {
                        endDate = 30;
                    }
                }
            }

            return (monthCount * 30) + (endDate - startDate);
        },
        /**
         * date/time function
         * @param year
         * @param month
         * @param day
         * @returns {Number}
         * @memberOf jFN
         */
        DATE:function (year, month, day) {
            var date = new Date(year, month - 1, day),
                result = new Number(dates.toCentury(date));
            result.html = dates.toString(date, 'd');

            return result;
        },
        /**
         * date/time function
         * @param date
         * @returns {Number}
         * @memberOf jFN
         */
        DATEVALUE:function (date) {
            date = dates.get(date);
            var result = new Number(dates.toCentury(date));
            result.html = dates.toString(date, 'd');
            return result;
        },
        /**
         * date/time function
         * @param date
         * @param months
         * @returns {Number}
         * @memberOf jFN
         */
        EDATE:function (date, months) {
            date = dates.get(date);
            date.setMonth(date.getMonth() + months);
            var result = new Number(dates.toCentury(date));
            result.html = dates.toString(date, 'd');
            return result;
        },
        /**
         * date/time function
         * @param date
         * @param months
         * @returns {Number}
         * @memberOf jFN
         */
        EOMONTH:function (date, months) {
            date = dates.get(date);
            date.setMonth(date.getMonth() + months + 1);
            date = new Date(date.getFullYear(), date.getMonth(), 0);
            var result = new Number(dates.toCentury(date));
            result.html = dates.toString(date, 'd');
            return result;
        },
        /**
         * date/time function
         * @param time
         * @returns {*}
         * @memberOf jFN
         */
        HOUR:function (time) {
            time = times.fromMath(time);
            return time.hour;
        },
        /**
         * date/time function
         * @param time
         * @returns {*}
         * @memberOf jFN
         */
        MINUTE:function (time) {
            return times.fromMath(time).minute;
        },
        /**
         * date/time function
         * @param date
         * @returns {number}
         * @memberOf jFN
         */
        MONTH:function (date) {
            date = dates.get(date);
            return date.getMonth() + 1;
        },
        /**
         * date/time function
         * @param time
         * @returns {*}
         * @memberOf jFN
         */
        SECOND:function (time) {
            return times.fromMath(time).second;
        },
        /**
         * date/time function
         * @param hour
         * @param minute
         * @param second
         * @returns {number}
         * @memberOf jFN
         */
        TIME:function (hour, minute, second) {
            second = (second ? second : 0);
            minute = (minute ? minute : 0);
            hour = (hour ? hour : 0);

            if (second && second > 60) {
                var minuteFromSecond = (((second / 60) + '').split('.')[0]) * 1;
                second = second - (minuteFromSecond * 60);
                minute += minuteFromSecond;
            }

            if (minute && minute > 60) {
                var hourFromMinute = (((minute / 60) + '').split('.')[0]) * 1;
                minute = minute - (hourFromMinute * 60);
                hour += hourFromMinute;
            }

            var millisecond = (hour * 60 * 60 * 1000) + (minute * 60 * 1000) + (second * 1000);

            return millisecond / dates.dayDiv;
        },
        /**
         * date/time function
         * @param time
         * @returns {*}
         * @memberOf jFN
         */
        TIMEVALUE:function (time) {
            if (!isNaN(time)) {
                return time;
            }
            if (/([0]?[1-9]|1[0-2])[:][0-5][0-9]([:][0-5][0-9])?[ ]?(AM|am|aM|Am|PM|pm|pM|Pm)/.test(time)) {
                return times.fromString(time, true);
            } else if (/([0]?[0-9]|1[0-9]|2[0-3])[:][0-5][0-9]([:][0-5][0-9])?/.test(time)) {
                return times.fromString(time);
            }
            return 0;
        },
        /**
         * date/time function
         * @param startDate
         * @param days
         * @param holidays
         * @returns {Number}
         * @memberOf jFN
         */
        WORKDAY:function (startDate, days, holidays) {
            var workDays = {1:true, 2:true, 3:true, 4:true, 5:true},
                startDate = dates.get(startDate),
                days = (days && !isNaN(days) ? days : 0),
                dayCounter = 0,
                daysSoFar = 0,
                workingDate = startDate,
                result;

            if (holidays) {
                if (!jQuery.isArray(holidays)) {
                    holidays = [holidays];
                }
                holidays = arrHelpers.flatten(holidays);
                var holidaysTemp = {};
                jQuery.each(holidays, function (i) {
                    if (holidays[i]) {
                        holidaysTemp[dates.toString(dates.get(holidays[i]), 'd')] = true;
                    }
                });
                holidays = holidaysTemp;
            } else {
                holidays = {};
            }

            while (daysSoFar < days) {
                workingDate = new Date(workingDate.setDate(workingDate.getDate() + 1));
                if (workDays[workingDate.getDay()]) {
                    if (!holidays[dates.toString(workingDate, 'd')]) {
                        daysSoFar++;
                    }
                }
                dayCounter++;
            }

            result = new Number(dates.toCentury(workingDate));
            result.html = dates.toString(workingDate, 'd');
            return result;
        },
        /**
         * date/time function
         * @param startDate
         * @param endDate
         * @param basis
         * @returns {*}
         * @memberOf jFN
         */
        YEARFRAC:function (startDate, endDate, basis) {
            startDate = dates.get(startDate);
            endDate = dates.get(endDate);

            if (!startDate || !endDate) {
                return this.jS.s.error({error:'#VALUE!'});
            }

            basis = (basis ? basis : 0);
            this.html = [];

            var numerator = dates.diff(startDate, endDate, basis),
                denom = dates.calcAnnualBasis(startDate, endDate, basis);
            return numerator / denom;
        },

        /**
         * logical function
         * @returns {*}
         * @memberOf jFN
         */
        AND:function () {
            var args = arguments,
                res,
                cell = this;
            $.each(args, function (i) {
                if (args[i].valueOf() !== true && res == undefined) {
                    res = jFN.FALSE();
                }
            });
            if (!res) {
                res = jFN.TRUE();
            }
            return res;
        },
        /**
         * logical function
         * @returns {Boolean}
         * @memberOf jFN
         */
        FALSE:function () {
            var result = new Boolean(false);
            result.html = 'FALSE';
            return result;
        },
        /**
         * logical function
         * @param expression
         * @param resultTrue
         * @param resultFalse
         * @returns {*}
         * @memberOf jFN
         */
        IF:function (expression, resultTrue, resultFalse) {
            if (expression.valueOf()) {
                return resultTrue;
            } else {
                return resultFalse;
            }
        },
        /**
         * logical function
         * @param v
         * @returns {Boolean}
         * @memberOf jFN
         */
        NOT:function (v) {
            var result;
            if (!v.valueOf()) {
                result = new Boolean(true);
                result.html = 'TRUE';
            } else {
                result = new Boolean(false);
                result.html = 'FALSE';
            }

            return result;
        },
        /**
         * logical function
         * @returns {Boolean}
         * @memberOf jFN
         */
        OR:function () {
            var args = arguments,
                result,
                i = args.length - 1,
                v;

            if (i > -1) {
                do {
                    v = args[i].valueOf();
                    if (v) {
                        result = new Boolean(true);
                        result.html = 'TRUE';
                        return result;
                    }
                } while (i--);
            }
            result = new Boolean(false);
            result.html = 'FALSE';
            return result;
        },
        /**
         * logical function
         * @returns {Boolean}
         * @memberOf jFN
         */
        TRUE:function () {
            var result = new Boolean(true);
            result.html = 'TRUE';
            return result;
        },
        /**
         * logical function
         * @param left
         * @param right
         * @returns {Boolean}
         * @memberOf jFN
         */
        GREATER:function(left, right) {
            var result;

            if (left > right) {
                result = new Boolean(true);
                result.html = 'TRUE';
            } else {
                result = new Boolean(false);
                result.html = 'FALSE';
            }

            return result;
        },
        /**
         * logical function
         * @param left
         * @param right
         * @returns {Boolean}
         * @memberOf jFN
         */
        LESS:function(left, right) {
            var result;

            if (left < right) {
                result = new Boolean(true);
                result.html = 'TRUE';
            } else {
                result = new Boolean(false);
                result.html = 'FALSE';
            }

            return result;
        },
        /**
         * logical function
         * @param left
         * @param right
         * @returns {Boolean}
         * @memberOf jFN
         */
        EQUAL: function(left, right) {
            var result;

            if (left.valueOf() == right.valueOf()) {
                result = new Boolean(true);
                result.html = 'TRUE';
            } else {
                result = new Boolean(false);
                result.html = 'FALSE';
            }

            return result;
        },
        /**
         * logical function
         * @param left
         * @param right
         * @returns {Boolean}
         * @memberOf jFN
         */
        GREATER_EQUAL:function(left, right) {
            var result;

            if (left >= right) {
                result = new Boolean(true);
                result.html = 'TRUE';
            } else {
                result = new Boolean(false);
                result.html = 'FALSE';
            }

            return result;
        },
        /**
         * logical function
         * @param left
         * @param right
         * @returns {Boolean}
         * @memberOf jFN
         */
        LESS_EQUAL:function(left, right) {
            var result;

            if (left <= right) {
                result = new Boolean(true);
                result.html = 'TRUE';
            } else {
                result = new Boolean(false);
                result.html = 'FALSE';
            }

            return result;
        },

        /**
         * html function
         * @param v
         * @returns {String}
         * @memberOf jFN
         */
        IMG:function (v) {
            var result = new String('');
            result.html = $(doc.createElement('img'))
                .attr('src', v);
            return result;
        },
        /**
         * html function
         * @param v
         * @returns {*}
         * @memberOf jFN
         */
        TRIM:function (v) {
            if (typeof(v) == 'string') {
                v = $.trim(v);
            }
            return v;
        },
        /**
         * html function
         * @param link
         * @param [name]
         * @returns {String}
         * @memberOf jFN
         */
        HYPERLINK:function (link, name) {
            name = name || 'LINK';
            var result = new String(name);
            result.html = $(doc.createElement('a'))
                .attr('href', link)
                .attr('target', '_new')
                .text(name);

            return result;
        },
        /**
         * html function
         * @returns {*}
         * @memberOf jFN
         */
        DROPDOWN:function () {
            var cell = this,
                jS = this.jS,
                v,
                html = this.td.children().detach(),
                loc,
                $td = $(cell.td),
                select,
                id,
                result;

            if (!html.length || cell.needsUpdated) {
                v = arrHelpers.flatten(arguments);
                v = arrHelpers.unique(v);
                loc = jS.getTdLocation(cell.td);
                id = "dropdown" + this.sheet + "_" + loc.row + "_" + loc.col + '_' + jS.I;

                select = doc.createElement('select');
                select.setAttribute('name', id);
                select.setAttribute('id', id);
                select.className = 'jSDropdown';
                select.cell = this;

                select.onmouseup = function() {
                    jS.cellEdit($td);
                };
                select.onchange = function () {
                    cell.value = this.value;
                    jS.calcDependencies.call(cell, cell.calcDependenciesLast);
                };

                jS.controls.inputs[jS.i] = jS.obj.inputs().add(select);

                for (var i = 0; i < (v.length <= 50 ? v.length : 50); i++) {
                    if (v[i]) {
                        var opt = doc.createElement('option');
                        opt.setAttribute('value', v[i]);
                        opt.text = opt.innerText = v[i];
                        select.appendChild(opt);
                    }
                }

                if (!jS.s.editable) {
                    select.setAttribute('disabled', true);
                } else {
                    jS.s.parent.bind('sheetKill', function() {
                        $td.text(cell.value = select.value);
                    });
                }

                select.value = cell.value || v[0];
                select.onchange();
            }
            if (typeof cell.value != 'object') {
                result = new String(cell.value);
            }
            result.html = select;
            return result;
        },
        /**
         * html function
         * @returns {*}
         * @memberOf jFN
         */
        RADIO:function () {
            var cell = this,
                jS = this.jS,
                v,
                html = this.td.children().detach(),
                loc,
                $td,
                inputs,
                $inputs,
                radio,
                id,
                result;

            if (!html.length || cell.needsUpdated) {
                v = arrHelpers.flatten(arguments);
                v = arrHelpers.unique(v);
                loc = jS.getTdLocation(cell.td);
                $td = $(cell.td);
                inputs = [];
                id = "radio" + this.sheet + "_" + loc.row + "_" + loc.col + '_' + jS.I;

                radio = doc.createElement('span');
                radio.className = 'jSRadio';
                radio.onmousedown = function () {
                    jS.cellEdit($td);
                };
                radio.jSCell = cell;
                jS.controls.inputs[jS.i] = jS.obj.inputs().add(radio);

                for (var i = 0; i < (v.length <= 25 ? v.length : 25); i++) {
                    if (v[i]) {
                        var input = doc.createElement('input'),
                            label = doc.createElement('span');

                        input.setAttribute('type', 'radio');
                        input.setAttribute('name', id);
                        input.className = id;
                        input.value = v[i];
                        input.onchange = function() {
                            cell.value = jQuery(this).val();
                            jS.calcDependencies.call(cell, cell.calcDependenciesLast);
                        };

                        inputs.push(input);

                        if (v[i] == cell.value) {
                            input.setAttribute('checked', 'true');
                            input.onchange();
                        }
                        label.textContent = label.innerText = v[i];
                        radio.appendChild(input);
                        radio.input = input;
                        label.onclick = function () {
                            $(this).prev().click();
                        };
                        radio.appendChild(label);
                        radio.appendChild(doc.createElement('br'));
                    }
                }

                $inputs = $(inputs);

                if (!jS.s.editable) {
                    cell.value = $inputs.filter(':checked').val();
                    $inputs.attr('disabled', true);
                } else {
                    jS.s.parent.bind('sheetKill', function() {
                        cell.value = $inputs.filter(':checked').val();
                        $td.text(cell.value);
                    });
                }
            }

            if (typeof cell.value != 'object') {
                result = new String(cell.value);
            }

            result.html = radio;

            return result;
        },
        /**
         * html function
         * @param v
         * @returns {*}
         * @memberOf jFN
         */
        CHECKBOX:function (v) {
            if ($.isArray(v)) v = v[0];

            var cell = this,
                jS = this.jS,
                html = this.td.children().detach(),
                loc,
                checkbox,
                $td,
                label,
                id,
                result;

            if ((!html.length || cell.needsUpdated)) {
                loc = jS.getTdLocation(cell.td);
                checkbox = $([]);
                $td = $(cell.td);
                id = "checkbox" + this.sheet + "_" + loc.row + "_" + loc.col + '_' + jS.I;
                checkbox = doc.createElement('input');
                checkbox.setAttribute('type', 'checkbox');
                checkbox.setAttribute('name', id);
                checkbox.className = id;
                checkbox.value = v;
                checkbox.onchange = function () {
                    if ($(this).is(':checked')) {
                        cell.value = v;
                    } else {
                        cell.value = '';
                    }
                    jS.calcDependencies.call(cell, cell.calcDependenciesLast);
                };

                if (!jS.s.editable) {
                    checkbox.setAttribute('disabled', 'true');
                } else {
                    jS.s.parent.bind('sheetKill', function() {
                        cell.value = (cell.value == 'true' || $(checkbox).is(':checked') ? v : '');
                        $td.text(cell.value);
                    });
                }

                html = doc.createElement('span');
                html.className='SCheckbox';
                html.appendChild(checkbox);
                label = doc.createElement('span');
                label.textContent = label.innerText = v;
                html.appendChild(label);
                html.appendChild(doc.createElement('br'));
                html.onmousedown = function () {
                    jS.cellEdit($td);
                };
                html.cell = cell;

                jS.controls.inputs[jS.i] = jS.obj.inputs().add(html);

                if (v == cell.value) {
                    checkbox.setAttribute('checked', true);
                    checkbox.onchange();
                }
            }

            result = new String(cell.value == 'true' || $(checkbox).is(':checked') ? v : '');
            result.html = html;
            return result;
        },
        /**
         * html function
         * @param values
         * @param legend
         * @param title
         * @returns {String}
         * @memberOf jFN
         */
        BARCHART:function (values, legend, title) {
            var result = new String('');
            result.html = jSE.chart.call(this, {
                type:'bar',
                data:values,
                legend:legend,
                title:title
            });
            return result;
        },
        /**
         * html function
         * @param values
         * @param legend
         * @param title
         * @returns {String}
         * @memberOf jFN
         */
        HBARCHART:function (values, legend, title) {
            var result = new String('');
            result.html = jSE.chart.call(this, {
                type:'hbar',
                data:values,
                legend:legend,
                title:title
            });
            return result;
        },
        /**
         * html function
         * @param valuesX
         * @param valuesY
         * @returns {String}
         * @memberOf jFN
         */
        LINECHART:function (valuesX, valuesY) {
            var result = new String('');
            result.html = jSE.chart.call(this, {
                type:'line',
                x:{
                    data:valuesX
                },
                y:{
                    data:valuesY
                },
                title:""
            });
            return result;
        },
        /**
         * html function
         * @param values
         * @param legend
         * @param title
         * @returns {String}
         * @memberOf jFN
         */
        PIECHART:function (values, legend, title) {
            var result = new String('');
            result.html = jSE.chart.call(this, {
                type:'pie',
                data:values,
                legend:legend,
                title:title
            });
            return result;
        },
        /**
         * html function
         * @param valuesX
         * @param valuesY
         * @param values
         * @param legendX
         * @param legendY
         * @param title
         * @returns {String}
         * @memberOf jFN
         */
        DOTCHART:function (valuesX, valuesY, values, legendX, legendY, title) {
            var result = new String('');
            result.html = jSE.chart.call(this, {
                type:'dot',
                data:(values ? values : valuesX),
                x:{
                    data:valuesX,
                    legend:legendX
                },
                y:{
                    data:(valuesY ? valuesY : valuesX),
                    legend:(legendY ? legendY : legendX)
                },
                title:title
            });
            return result;
        },
        /**
         * html function
         * @param v
         * @returns {*}
         * @memberOf jFN
         */
        CELLREF:function (v) {
            return (this.jS.spreadsheets[v] ? this.jS.spreadsheets[v] : 'Cell Reference Not Found');
        },
        /**
         * html function
         * @param [pre] text before
         * @param [post] test after
         * @returns {string}
         * @memberOf jFN
         */
        CALCTIME:function (pre, post) {
            pre = pre || '';
            post = post || '';

            var cell = this,
                jS = this.jS;

            this.jS.s.parent.one('sheetCalculation', function () {
                jS.time.last = jS.calcLast;
                cell.td.text(pre + jS.time.diff() + post);
            });
            return "";
        },


        /**
         * cell function
         * @param value
         * @param tableArray
         * @param indexNumber
         * @param notExactMatch
         * @returns {*}
         * @memberOf jFN
         */
        HLOOKUP:function (value, tableArray, indexNumber, notExactMatch) {
            var jS = this.jS,
                lookupTable = this.jS.cellLookup.call(this),
                result = {html: '#N/A', value:''};

            indexNumber = indexNumber || 1;
            notExactMatch = notExactMatch !== undefined ? notExactMatch : true;

            if (isNaN(value)) {
                var i = tableArray[0].indexOf(value);
                if (i > -1) {
                    result = jS.updateCellValue(lookupTable[i].sheet, indexNumber, jS.getTdLocation(lookupTable[i].td).col);
                }
            } else {
                arrHelpers.getClosestNum(value, tableArray[0], function(closest, i) {
                    var num = jS.updateCellValue(lookupTable[i].sheet, indexNumber, jS.getTdLocation(lookupTable[i].td).col);

                    if (notExactMatch) {
                        result = num;
                    } else if (num == value) {
                        result = num;
                    }
                });
            }

            return result;
        },
        /**
         * cell function
         * @param value
         * @param tableArray
         * @param indexNumber
         * @param notExactMatch
         * @returns {*}
         * @memberOf jFN
         */
        VLOOKUP:function (value, tableArray, indexNumber, notExactMatch) {
            var jS = this.jS,
                lookupTable = this.jS.cellLookup.call(this),
                result = {html: '#N/A', value:''};

            notExactMatch = notExactMatch !== undefined ? notExactMatch : true;

            if (isNaN(value)) {
                var i = tableArray[0].indexOf(value);
                if (i > -1) {
                    result = jS.updateCellValue(lookupTable[i].sheet, indexNumber, jS.getTdLocation(lookupTable[i].td).col);
                }
            } else {
                arrHelpers.getClosestNum(value, tableArray[0], function(closest, i) {
                    var num = jS.updateCellValue(lookupTable[i].sheet, jS.getTdLocation(lookupTable[i].td).row, indexNumber);

                    if (notExactMatch) {
                        result = num;
                    } else if (num == value) {
                        result = num;
                    }
                });
            }

            return result;
        },
        /**
         * cell function
         * @param col
         * @returns {*}
         * @memberOf jFN
         */
        THISROWCELL:function (col) {
            var jS = this.jS, loc = jS.getTdLocation(this.td);
            if (isNaN(col)) {
                col = jSE.columnLabelIndex(col);
            }
            return jS.updateCellValue(this.sheet, loc.row, col);
        },
        /**
         * cell function
         * @param row
         * @returns {*}
         * @memberOf jFN
         */
        THISCOLCELL:function (row) {
            var jS = this.jS, loc = jS.getTdLocation(this.td);
            return jS.updateCellValue(this.sheet, row, loc.col);
        }
    };

    var key = { /* key objects, makes it easier to develop */
        BACKSPACE: 			8,
        CAPS_LOCK: 			20,
        COMMA: 				188,
        CONTROL: 			17,
        ALT:				18,
        DELETE: 			46,
        DOWN: 				40,
        END: 				35,
        ENTER: 				13,
        ESCAPE: 			27,
        HOME: 				36,
        INSERT: 			45,
        LEFT: 				37,
        NUMPAD_ADD: 		107,
        NUMPAD_DECIMAL: 	110,
        NUMPAD_DIVIDE: 		111,
        NUMPAD_ENTER: 		108,
        NUMPAD_MULTIPLY: 	106,
        NUMPAD_SUBTRACT: 	109,
        PAGE_DOWN: 			34,
        PAGE_UP: 			33,
        PERIOD: 			190,
        RIGHT: 				39,
        SHIFT: 				16,
        SPACE: 				32,
        TAB: 				9,
        UP: 				38,
        C:                  67,
        F:					70,
        V:					86,
        X:                  88,
        Y:					89,
        Z:					90
    };

    var arrHelpers = win.arrHelpers = {
        math: Math,
        toNumbers:function (arr) {
            arr = this.flatten(arr);
            var i = arr.length - 1;

            if (i < 0) {
                return [];
            }

            do {
                if (arr[i]) {
                    arr[i] = $.trim(arr[i]);
                    if (isNaN(arr[i])) {
                        arr[i] = 0;
                    } else {
                        arr[i] = arr[i] * 1;
                    }
                } else {
                    arr[i] = 0;
                }
            } while (i--);

            return arr;
        },
        unique:function (arr) {
            var a = [],
                l = arr.length;
            for (var i = 0; i < l; i++) {
                for (var j = i + 1; j < l; j++) {
                    // If this[i] is found later in the array
                    if (arr[i] === arr[j])
                        j = ++i;
                }
                a.push(arr[i]);
            }
            return a;
        },
        flatten:function (arr) {
            var flat = [];
            for (var i = 0, l = arr.length; i < l; i++) {
                var type = Object.prototype.toString.call(arr[i]).split(' ').pop().split(']').shift().toLowerCase();
                if (type) {
                    flat = flat.concat(/^(array|collection|arguments|object)$/.test(type) ? this.flatten(arr[i]) : arr[i]);
                }
            }
            return flat;
        },
        insertAt:function (arr, val, index) {
            $(val).each(function () {
                if (index > -1 && index <= arr.length) {
                    arr.splice(index, 0, this);
                }
            });
            return arr;
        },
        closest:function (array, num, min, max) {
            array = array || [];
            num = num || 0;
            min = min || 0;
            max = max || array.length - 1;

            var target;

            while (true) {
                target = ((min + max) >> 1);
                if (target === max || target === min) {
                    return array[target];
                }
                if (array[target] > num) {
                    max = target;
                } else if (array[target] < num) {
                    min = target;
                } else {
                    return array[target];
                }
            }
        },
        getClosestNum: function(num, ar, fn) {
            var i = 0, I, closest, closestDiff, currentDiff;
            if(ar.length) {
                closest = ar[0];
                I = i;
                for(i;i<ar.length;i++) {
                    closestDiff = Math.abs(num - closest);
                    currentDiff = Math.abs(num - ar[i]);
                    if(currentDiff < closestDiff)
                    {
                        I = i;
                        closest = ar[i];
                    }
                    closestDiff = null;
                    currentDiff = null;
                }
                //returns first element that is closest to number
                if (fn) {
                    return fn(closest, I);
                }
                return closest;
            }
            //no length
            return false;
        }
    };

    var dates = {
        dayDiv: 86400000,
        math: Math,
        toCentury:function (date, dayDiv) {
            dayDiv = dayDiv || 86400000;

            return this.math.round(this.math.abs((new Date(1900, 0, -1)) - date) / dayDiv);
        },
        get:function (date, dayDiv) {
            dayDiv = dayDiv || 86400000;

            if (date.getMonth) {
                return date;
            } else if (isNaN(date)) {
                return new Date(Globalize.parseDate(date));
            } else {
                date *= dayDiv;
                //date = new Date(date);
                var newDate = (new Date(1900, 0, -1)) * 1;
                date += newDate;
                date = new Date(date);
                return date;
            }
        },
        week:function (date, dayDiv) {
            dayDiv = dayDiv || 86400000;

            var onejan = new Date(date.getFullYear(), 0, 1);
            return this.math.ceil((((date - onejan) / dayDiv) + onejan.getDay() + 1) / 7);
        },
        toString:function (date, pattern) {
            if (!pattern) {
                return Globalize.format(date);
            }
            return Globalize.format(date, Globalize.culture().calendar.patterns[pattern]);
        },
        diff:function (start, end, basis, dayDiv) {
            dayDiv = dayDiv || 86400000;

            switch (basis) {
                case 0:
                    return this.days360Nasd(start, end, 0, true);
                case 1:
                case 2:
                case 3:
                    var result = this.math.abs(end - start) / dayDiv;
                    return result;
                case 4:
                    return this.days360Euro(start, end);
            }

            return 0;
        },
        diffMonths:function (start, end) {
            var months;
            months = (end.getFullYear() - start.getFullYear()) * 12;
            months -= start.getMonth() + 1;
            months += end.getMonth() + 1;
            return months;
        },
        days360:function (startYear, endYear, startMonth, endMonth, startDate, endDate) {
            return ((endYear - startYear) * 360) + ((endMonth - startMonth) * 30) + (endDate - startDate)
        },
        days360Nasd:function (start, end, method, useEom) {
            var startDate = start.getDate(),
                startMonth = start.getMonth(),
                startYear = start.getFullYear(),
                endDate = end.getDate(),
                endMonth = end.getMonth(),
                endYear = end.getFullYear();

            if (
                (endMonth == 2 && this.isEndOfMonth(endDate, endMonth, endYear)) &&
                    (
                        (startMonth == 2 && this.isEndOfMonth(startDate, startMonth, startYear)) ||
                            method == 3
                        )
                ) {
                endDate = 30;
            }

            if (endDate == 31 && (startDate >= 30 || method == 3)) {
                endDate = 30;
            }

            if (startDate == 31) {
                startDate = 30;
            }

            if (useEom && startMonth == 2 && this.isEndOfMonth(startDate, startMonth, startYear)) {
                startDate = 30;
            }

            return this.days360(startYear, endYear, startMonth, endMonth, startDate, endDate);
        },
        days360Euro:function (start, end) {
            var startDate = start.getDate(),
                startMonth = start.getMonth(),
                startYear = start.getFullYear(),
                endDate = end.getDate(),
                endMonth = end.getMonth(),
                endYear = end.getFullYear();

            if (startDate == 31) startDate = 30;
            if (endDate == 31) endDate = 30;

            return this.days360(startYear, endYear, startMonth, endMonth, startDate, endDate);
        },
        isEndOfMonth:function (day, month, year) {
            return day == (new Date(year, month + 1, 0, 23, 59, 59)).getDate();
        },
        isLeapYear:function (year) {
            return new Date(year, 1, 29).getMonth() == 1;
        },
        calcAnnualBasis:function (start, end, basis) {
            switch (basis) {
                case 0:
                case 2:
                case 4: return 360;
                case 3: return 365;
                case 1:
                    var startDate = start.getDate(),
                        startMonth = start.getMonth(),
                        startYear = start.getFullYear(),
                        endDate = end.getDate(),
                        endMonth = end.getMonth(),
                        endYear = end.getFullYear(),
                        result = 0;

                    if (startYear == endYear) {
                        if (this.isLeapYear(startYear)) {
                            result = 366;
                        } else {
                            result = 365;
                        }
                    } else if (((endYear - 1) == startYear) && ((startMonth > endMonth) || ((startMonth == endMonth) && startDate >= endDate))) {
                        if (this.isLeapYear(startYear)) {
                            if (startMonth < 2 || (startMonth == 2 && startDate <= 29)) {
                                result = 366;
                            } else {
                                result = 365;
                            }
                        } else if (this.isLeapYear(endYear)) {
                            if (endMonth > 2 || (endMonth == 2 && endDate == 29)) {
                                result = 366;
                            } else {
                                result = 365;
                            }
                        } else {
                            result = 365;
                        }
                    } else {
                        for (var iYear = startYear; iYear <= endYear; iYear++) {
                            if (this.isLeapYear(iYear)) {
                                result += 366;
                            } else {
                                result += 365;
                            }
                        }
                        result = result / (endYear - startYear + 1);
                    }
                    return result;
            }
            return 0;
        },
        lastDayOfMonth:function (date) {
            date.setDate(0);
            return date.getDate();
        },
        isLastDayOfMonth:function (date) {
            return (date.getDate() == this.lastDayOfMonth(date));
        }
    };

    var times = win.times = {
        math: Math,
        fromMath:function (time) {
            var result = {}, me = this;

            result.hour = ((time * 24) + '').split('.')[0] * 1;

            result.minute = function (time) {
                time = me.math.round(time * 24 * 100) / 100;
                time = (time + '').split('.');
                var minute = 0;
                if (time[1]) {
                    if (time[1].length < 2) {
                        time[1] += '0';
                    }
                    minute = time[1] * 0.6;
                }
                return me.math.round(minute);
            }(time);

            result.second = function (time) {
                time = me.math.round(time * 24 * 10000) / 10000;
                time = (time + '').split('.');
                var second = 0;
                if (time[1]) {
                    for (var i = 0; i < 4; i++) {
                        if (!time[1].charAt(i)) {
                            time[1] += '0';
                        }
                    }
                    var secondDecimal = ((time[1] * 0.006) + '').split('.');
                    if (secondDecimal[1]) {
                        if (secondDecimal[1] && secondDecimal[1].length > 2) {
                            secondDecimal[1] = secondDecimal[1].substr(0, 2);
                        }

                        return me.math.round(secondDecimal[1] * 0.6);
                    }
                }
                return second;
            }(time);

            return result;
        },
        fromString:function (time, isAmPm) {
            var date = new Date(), timeParts = time, timeValue, hour, minute, second, meridiem;
            if (isAmPm) {
                meridiem = timeParts.substr(-2).toLowerCase(); //get ampm;
                timeParts = timeParts.replace(/(am|pm)/i, '');
            }

            timeParts = timeParts.split(':');
            hour = timeParts[0] * 1;
            minute = timeParts[1] * 1;
            second = (timeParts[2] ? timeParts[2] : 0) * 1;

            if (isAmPm && meridiem == 'pm') {
                hour += 12;
            }

            return jFN.TIME(hour, minute, second);
        }
    };


    var math = win.math = $.extend(win.math, {
        log10:function (arg) {
            // http://kevin.vanzonneveld.net
            // +   original by: Philip Peterson
            // +   improved by: Onno Marsman
            // +   improved by: Tod Gentille
            // +   improved by: Brett Zamir (http://brett-zamir.me)
            // *	 example 1: log10(10);
            // *	 returns 1: 1
            // *	 example 2: log10(1);
            // *	 returns 2: 0
            return Math.log(arg) / 2.302585092994046; // Math.LN10
        },
        signum:function (x) {
            return (x / Math.abs(x)) || x;
        },
        log1p: function (x) {
            // http://kevin.vanzonneveld.net
            // +   original by: Brett Zamir (http://brett-zamir.me)
            // %          note 1: Precision 'n' can be adjusted as desired
            // *     example 1: log1p(1e-15);
            // *     returns 1: 9.999999999999995e-16

            var ret = 0,
                n = 50; // degree of precision
            if (x <= -1) {
                return '-INF'; // JavaScript style would be to return Number.NEGATIVE_INFINITY
            }
            if (x < 0 || x > 1) {
                return Math.log(1 + x);
            }
            for (var i = 1; i < n; i++) {
                if ((i % 2) === 0) {
                    ret -= Math.pow(x, i) / i;
                } else {
                    ret += Math.pow(x, i) / i;
                }
            }
            return ret;
        }
    });

    $.print = function (s) {
        var w = win.open();
        w.document.write("<html><body><xmp>" + s + "\n</xmp></body></html>");
        w.document.close();
    };

    //This is a fix for Jison
    if (!Object.getPrototypeOf) {
        Object.getPrototypeOf = function(obj) {
            return obj || {};
        };
    }

    //IE8 fix
    if (!Array.prototype.indexOf) {
        $.sheet.max = 60;
        Array.prototype.indexOf = function(obj, start) {
            for (var i = (start || 0), j = this.length; i < j; i++) {
                if (this[i] === obj) { return i; }
            }
            return -1;
        }
    }
})(jQuery, document, window, Date, String, Number, Boolean, Math, RegExp, Error);
