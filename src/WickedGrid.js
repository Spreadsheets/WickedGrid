/*
 * @project WickedGrid - Easy & Wicked Fast spreadsheets for the web - https://github.com/Spreadsheets/WickedGrid
 * @author RobertLeePlummerJr@gmail.com
 * Licensed under MIT
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
 * Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
 * OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

/**
 * @param {Object} settings
 * @constructor
 */
var WickedGrid = (function() {
  'use strict';

  function empty() {}
  var u = undefined;
  function WickedGrid(settings) {
    this.settings = settings;
    this.element = settings.element;
    this.$element = $(settings.element);
    this.tsv = new TSV();

    this.cellEvents = new WickedGrid.event.Cell(this);
    this.documentEvents = new WickedGrid.event.Document(this);
    this.formulaEvents = new WickedGrid.event.Formula(this);

    this.cl = WickedGrid.cl;
    this.msg = WickedGrid.msg;

    this.undo = new WickedGrid.Undo(this);

    /**
     * Internal storage array of controls for an instance
     * @memeberof WickedGrid
     */
    this.controls = {
      autoFiller:[],
      bar: {
        helper:[],
        corner:[],
        x: {
          controls:[],
          handleFreeze:[],
          menu:[],
          menuParent:[],
          parent:[],
          th:[],
          ths:function () {
            var ths = [],
              i = 0,
              _ths = this.th[wickedGrid.i],
              max = _ths.length;

            for (; i < max; i++) {
              ths.push(_ths[i]);
            }

            return ths;
          }
        },
        y: {
          controls:[],
          handleFreeze:[],
          menu:[],
          parent:[],
          th:[],
          ths:function () {
            var ths = [],
                i = 0,
                _ths = this.th[wickedGrid.i],
                max = _ths.length;

            for (; i < max; i++) {
              ths.push(_ths[i]);
            }

            return ths;
          }
        }
      },
      barMenuLeft:[],
      barMenuTop:[],
      barLeft:[],
      barTop:[],
      barTopParent:[],
      chart:[],
      menu:[],
      cellsEdited:[],
      enclosures:[],
      formula:null,
      header:null,
      inPlaceEdit:[],
      inputs:[],
      label:null,
      headerMenu:[],
      menus:[],
      pane:[],
      panes:null,
      scrolls:null,
      sheetAdder:null,
      tab:[],
      tabContainer:null,
      tabs:null,
      title:null,
      toggleHide:{
        x:[],
        y:[]
      },
      ui:null
    };

    /**
     * The active sheet index within the a set of sheets
     * @type {Number}
     */
    this.i = 0;

    /**
     * The current count of sheet's within the instance
     * @type {Number}
     */
    this.sheetCount = 0;

    /**
     * The internal storage array of the spreadsheets for an instance, constructed as array 3 levels deep, spreadsheet, rows, cells, can easily be used for custom exporting/saving
     * @type {Array}
     */
    this.spreadsheets = [];

    var self = this,
      element = this.element,
      $element = this.$element,
      children = [],
      $window = $(window),
      u = undefined,
      thaw = (WickedGrid.defaults.useStack && window.thaw !== u ? window.thaw : function(stack, options) {
        options = options || {};

        var i = 0,
            max = stack.length,
            item,
            each = options.each || function() {},
            done = options.done || function() {};

        if (stack[0].call !== u) {
          for (; i < max; i++) {
            item = stack[i];
            item();
          }
        } else {
          for (; i < max; i++) {
            item = stack[i];
            each.apply(item);
          }
          done();
        }
      }),
      loaderTables = [],
      loaderTable;

    this.setBusy(true);

    if (window.scrollBarSize === u) {
      window.scrollBarSize = getScrollBarSize();
    }

    this.cellHandler = new WickedGrid.CellHandler(this, WickedGrid.functions);

    this.theme = new WickedGrid.Theme(settings.theme);

    this.highlighter = new WickedGrid.Highlighter(
      this.theme.tdHighlighted,
      this.theme.barHighlight,
      this.theme.tabActive, function() {
      //Chrome has a hard time rendering table col elements when they change style, this triggers the table to be re-rendered
      //self.pane().actionUI.redraw();
    });

    //We need to take the sheet out of the element in order to get an accurate reading of it's height and width
    while (element.firstChild !== null) {
      children.push(element.removeChild(element.firstChild));
    }

    element.className += ' ' + WickedGrid.cl.element;

    $element
      .bind('sheetSwitch', function (e, js, i) {
        self.switchSheet(i);
      })
      .bind('sheetRename', function (e, js, i) {
        self.renameSheet(i);
      });

    //Use the setting height/width if they are there, otherwise use parent's
    this.width = settings.width || element.clientWidth;
    this.height = settings.height || element.clientHeight;

    // Drop functions if they are not needed & save time in recursion
    if (!$.nearest) { //Eventually it'd be nice to have raw js http://jsfiddle.net/julianlam/dQMXY/1/
      $.nearest = empty;
    }

    this.resizableCells = this.resizableSheet = this.resizable;
    if (!$.ui) {
      this.resizable = this.resizableCells = this.resizableSheet = this.draggable = empty;
    } else {
      if (!settings.resizableCells) this.resizableCells = empty;
      if (!settings.resizableSheet) this.resizableSheet = empty;
    }

    if (!$.support.boxModel) {
      settings.boxModelCorrection = 0;
    }

    $window
      .resize(function () {
        if (!self.isBusy()) { //We check because this might have been killed
          self.width = element.clientWidth;
          self.height = parent.clientHeight;
          self.sheetSyncSize();
        }
      })
      .unload(function() {
        WickedGrid.thread.kill();
      });

    //Extend the calculation engine plugins
    WickedGrid.fn = extend({}, WickedGrid.functions, settings.formulaFunctions);

    //Extend the calculation engine with finance functions
    if (WickedGrid.plugin.finance) {
      WickedGrid.fn = extend({}, WickedGrid.functions, WickedGrid.plugin.finance);
    }

    settings.title = settings.title || element.getAttribute('title') || '';

    this.parseFormula = (settings.useMultiThreads ? this.parseFormulaAsync : this.parseFormulaSync);

    element.className += ' ' + this.theme.parent;

    if (settings.loader === null) {
      settings.loader = new WickedGrid.loader.HTML(children);
    }

    this.loader = settings.loader
      .bindWickedGrid(this)
      .bindHandler(this.cellHandler);

    this.cellContextMenu = null;
    this.columnMenu = null;
    this.columnContextMenu = null;
    this.rowContextMenu = null;
    this.setupMenus();

    this
      .openSheet()
      .setBusy(false);
  }

  WickedGrid.prototype = {
    cl: WickedGrid.cl,
    msg: WickedGrid.msg,
    setupMenus: function() {
      var settings = this.settings;

      this.cellContextMenu = new WickedGrid.CellContextMenu(this, WickedGrid.menu(this, settings.cellContextMenuButtons));
      this.columnMenu = new WickedGrid.ColumnMenu(this,  WickedGrid.menu(this, settings.columnMenuButtons));
      this.columnContextMenu = new WickedGrid.ColumnContextMenu(this, WickedGrid.menu(this, settings.columnContextMenuButtons));
      this.rowContextMenu = new WickedGrid.RowContextMenu(this, WickedGrid.menu(this, settings.rowContextMenuButtons));

      return this;
    },

    /**
     * control
     */
    autoFiller:function () {
      return this.controls.autoFiller[this.i] || null;
    },
    /**
     * control
     */
    corner:function () {
      return this.controls.bar.corner[this.i] || $([]);
    },
    /**
     * control
     */
    barHelper:function () {
      return this.controls.bar.helper[this.i] || (this.controls.bar.helper[this.i] = $([]));
    },
    /**
     * control
     */
    barLeft:function (i) {
      return (this.controls.bar.y.th[this.i] && this.controls.bar.y.th[this.i][i] ? this.controls.bar.y.th[this.i][i] : []);
    },
    /**
     * control
     */
    barLeftControls:function () {
      return this.controls.bar.y.controls[this.i] || $([]);
    },
    /**
     * control
     */
    barLefts:function () {
      return this.controls.bar.y.ths();
    },
    /**
     * control
     */
    barHandleFreezeLeft:function () {
      return this.controls.bar.y.handleFreeze[this.i] || $([]);
    },
    /**
     * control
     */
    barMenuLeft:function () {
      return this.controls.bar.y.menu[this.i] || $([]);
    },
    /**
     * control
     */
    barTop:function (i) {
      return (this.controls.bar.x.th[this.i] && this.controls.bar.x.th[this.i][i] ? this.controls.bar.x.th[this.i][i] : []);
    },
    /**
     * control
     */
    barTopControls:function () {
      return this.controls.bar.x.controls[this.i] || $([]);
    },
    /**
     * control
     */
    barTops:function () {
      return this.controls.bar.x.ths();
    },
    /**
     * control
     */
    barTopParent:function () {
      return this.controls.bar.x.parent[this.i] || $([]);
    },
    /**
     * control
     */
    barHandleFreezeTop:function () {
      return this.controls.bar.x.handleFreeze[this.i] || $([]);
    },
    /**
     * control
     */
    barMenuParentTop:function () {
      return this.controls.bar.x.menuParent[this.i] || $([]);
    },
    /**
     * control
     */
    barMenuTop:function () {
      return this.controls.bar.x.menu[this.i] || $([]);
    },
    /**
     * control
     */
    tdActive:function () {
      return this.cellLast !== null ? this.cellLast.td : null;
    },
    /**
     * control
     */
    cellActive:function() {
      return this.cellLast;
    },
    /**
     * control
     */
    menu:function () {
      return this.controls.menu[this.i] || $([]);
    },
    /**
     * control
     */
    cellsEdited: function () {
      return (this.controls.cellsEdited !== u ? this.controls.cellsEdited : this.controls.cellsEdited = []);
    },
    /**
     * control
     */
    chart:function () {
      return this.controls.chart[this.i] || $([]);
    },
    /**
     * control
     */
    enclosure:function () {
      return this.controls.enclosures[this.i] || [];
    },
    /**
     * control
     */
    enclosures:function () {
      return this.controls.enclosures || [];
    },
    /**
     * control
     */
    formula:function () {
      return this.controls.formula || $([]);
    },
    /**
     * control
     */
    header:function () {
      return this.controls.header || $([]);
    },
    /**
     * control
     */
    highlighted: function() {
      return this.highlighter.last || $([]);
    },
    /**
     * control
     */
    inPlaceEdit:function () {
      return this.controls.inPlaceEdit[this.i] || $([]);
    },
    /**
     * control
     */
    inputs:function() {
      return this.controls.inputs[this.i] || $([]);
    },
    /**
     * control
     */
    label:function () {
      return this.controls.label || $([]);
    },
    /**
     * control
     */
    menus:function() {
      return this.controls.menus[this.i] || $([]);
    },
    /**
     * control
     */
    headerMenu:function () {
      return this.controls.headerMenu[this.i] || $([]);
    },
    /**
     * control
     */
    pane:function () {
      return this.controls.pane[this.i] || {};
    },
    /**
     * control
     */
    panes:function () {
      return this.controls.panes || $([]);
    },
    /**
     * control
     */
    element:function () {
      return this.settings.element;
    },
    /**
     * control
     */
    scrolls:function () {
      return this.controls.scrolls || $([]);
    },
    /**
     * control
     */
    sheetAdder:function () {
      return this.controls.sheetAdder || $([]);
    },
    /**
     * control
     */
    tab:function () {
      return this.controls.tab[this.i] || $([]);
    },
    /**
     * control
     */
    tabs:function () {
      return this.controls.tabs || $([]);
    },
    /**
     * control
     */
    tabContainer:function () {
      return this.controls.tabContainer || $([]);
    },
    /**
     * control
     */
    title:function () {
      return this.controls.title || $([]);
    },

    /**
     * Deletes a WickedGrid instance
     */
    kill:function () {
      var i = WickedGrid.instances.indexOf(this),
        element = this.element,
        $element = $(element);

      if (i < 0) return false;

      $(document).unbind('keydown');
      this.fullScreen.kill();
      (this.inPlaceEdit().destroy || empty)();

      $element
        .trigger('sheetKill')
        .removeClass(this.theme.element)
        .html('');

      this.menus().remove();

      WickedGrid.events.forEach($element.unbind);

      WickedGrid.instances.splice(i, 1);

      return true;
    },

    /**
     * Event trigger
     * @param {String} eventType event type
     * @param {Array} [extraParameters]
     */
    trigger:function (eventType, extraParameters) {
      //wrapper for $ trigger of parent, in case of further mods in the future
      extraParameters = extraParameters || [];
      this.$element.triggerHandler(eventType, [this].concat(extraParameters));
      return this;
    },

    /**
     * Get cell value
     * @param {Number} sheetIndex
     * @param {Number} rowIndex
     * @param {Number} columnIndex
     * @returns {WickedGrid.Cell|Null}
     */
    getCell: function (sheetIndex, rowIndex, columnIndex) {
      var spreadsheet, row, cell;
      if (
          (spreadsheet = this.spreadsheets[sheetIndex]) === u
          || (row = spreadsheet[rowIndex]) === u
          || (cell = row[columnIndex]) === u
      ) {
        cell = this.loader.jitCell(sheetIndex, rowIndex, columnIndex);
      }

      if (cell === u || cell === null) {
        return null;
      }

      if (cell.typeName !== 'WickedGrid.Cell') {
        throw new Error('Wrong Constructor');
      }

      cell.sheetIndex = sheetIndex;
      cell.rowIndex = rowIndex;
      cell.columnIndex = columnIndex;
      return cell;
    },

    /**
     *
     * @param {HTMLElement} td
     * @returns {*}
     */
    cellFromTd: function(td) {
      if (td.thisCell !== u && td._cell !== null) return td._cell;

      var loc = this.locationFromTd(td),
          spreadsheet = this.spreadsheets[this.i],
          row,
          rowIndex = spreadsheet.length,
          rowMax = loc.row,
          colIndex,
          colMax = loc.col,
          cell;

      while (rowIndex <= rowMax && (spreadsheet[rowIndex] === u)) {
        spreadsheet[rowIndex++] = [];
      }

      row = spreadsheet[loc.row];
      colIndex = row.length;
      colMax = loc.col;
      while (colIndex < colMax && (row[colIndex] === u)) {
        row[colIndex++] = null;
      }

      cell = row[colIndex] = new WickedGrid.Cell(this.i, td, this);
      cell.columnIndex = loc.col;
      cell.rowIndex = loc.row;

      return cell;
    },

    /**
     *
     * @param {String} cellId
     * @param {Number|Function} callbackOrSheet
     * @param {Function} [callback]
     * @returns {WickedGrid}
     */
    getCellById: function(cellId, callbackOrSheet, callback) {
      var loader = this.loader,
          sheet;

      if (typeof callbackOrSheet === 'function') {
        sheet = -1;
        callback = callbackOrSheet;
      } else {
        sheet = callbackOrSheet;
        if (typeof sheet === 'string') {
          sheet = loader.getSpreadsheetIndexByTitle(sheet);
        }
      }

      if (this.isBusy()) {
        this.whenNotBusy(function(){
          loader.jitCellById(cellId, sheet, callback);
        });
      } else {
        loader.jitCellById(cellId, sheet, callback);
      }

      return this;
    },
    getCells: function(cellReferences, callbackOrSheet, callback) {
      var i = 0,
          max = cellReferences.length,
          remaining = max - 1,
          cellReference,
          cellLocation,
          cell,
          cells = [],
          got = 0,
          sheet;

      if (typeof callbackOrSheet === 'function') {
        sheet = -1;
        callback = callbackOrSheet;
      } else {
        sheet = callbackOrSheet;
        if (typeof sheet === 'string') {
          sheet = loader.getSpreadsheetIndexByTitle(sheet);
        }
      }

      this.whenNotBusy(function() {
        for(;i < max; i++) {
          cellReference = cellReferences[i];
          if (typeof cellReference === 'string') {
            (function(i) {
              this.getCellById(cellReference, sheet, function(cell) {
                cells[i] = cell;
                got++;

                if (got === max) callback.apply(this, cells);
              });
            })(i);
          } else {
            cellLocation = cellReference;
            cell = this.getCell(cellLocation.sheet, cellLocation.rowIndex, cellLocation.columnIndex);
            if (cell !== null) {
              cells[i] = cell;
              got++;

              if (got === max) callback.apply(jS, cells);
            }
          }
        }
      });

      return this;
    },

    updateCells: function(cellReferences, callbackOrSheet, callback) {
      var sheet;

      if (typeof callbackOrSheet === 'function') {
        sheet = -1;
        callback = callbackOrSheet;
      } else {
        sheet = callbackOrSheet;
        if (typeof sheet === 'string') {
          sheet = loader.getSpreadsheetIndexByTitle(sheet);
        }
      }

      this.getCells(cellReferences, sheet, function() {
        var cells = arguments,
            max = cells.length,
            remaining = max - 1,
            values = [],
            i = 0;

        for(;i < max;i++) {
          (function(i) {
            cells[i].updateValue(function(value) {
              remaining--;
              values[i] = value;
              if (remaining < 0) {
                callback.apply(jS, values);
              }
            });
          })(i);
        }
      });

      return this;
    },
    /**
     * Tracks which spreadsheet is active to intercept keystrokes for navigation
     * @type {Boolean}
     */
    nav:false,

    /**
     * Turns off all intercept keystroke navigation instances, with exception of supplied instance index
     * @param {Boolean} nav Instance index
     */
    setNav:function (nav) {
      var instances = WickedGrid.instances;
      for(var i = 0; i < instances.length; i++) {
        (instances[i] || {}).nav = false;
      }

      this.nav = nav;
    },

    /**
     * Creates multi rows
     * @param {Number} [rowIndex] row index
     * @param {Number} [qty] the number of cells you'd like to add, if not specified, a dialog will ask
     * @param {Boolean} [isAfter] places cells after the selected cell if true.controlFactory
     */
    addRowMulti:function (rowIndex, qty, isAfter) {
      var self = this;
      function add(qty) {
        var i = 0;
        if (qty > 0) {

          for (;i < qty; i++) {
            self.addRow(rowIndex, isAfter, true);
          }

          self.trigger('sheetAddRow', [rowIndex, isAfter, qty]);
        }
      }

      if (!qty) {
        this.settings.prompt(
            this.msg.addRowMulti,
            add
        );
      } else {
        add(qty);
      }
    },

    /**
     * Creates multi columns
     * @param {Number} [columnIndex] column index
     * @param {Number} [qty] the number of cells you'd like to add, if not specified, a dialog will ask
     * @param {Boolean} [isAfter] places cells after the selected cell if true.controlFactory
     */
    addColumnMulti:function (columnIndex, qty, isAfter) {
      var self = this;
      function add(qty) {
        var i = 0;
        if (qty > 0) {

          for (;i < qty; i++) {
            self.addColumn(columnIndex, isAfter, true);
          }

          self.trigger('sheetAddColumn', [columnIndex, isAfter, qty]);
        }
      }

      if (!qty) {
        this.settings.prompt(
            this.msg.addColumnMulti,
            add
        );
      } else {
        add(qty);
      }
    },

    /**
     * creates single row
     * @param {Boolean} [isAfter] places cells after if set to true
     * @param {Number} [rowIndex] row index
     * @param {Boolean} [skipEvent].controlFactory
     */
    addRow:function (isAfter, rowIndex, skipEvent) {
      var loader = this.loader,
          columnIndex = 0,
          size = loader.size(this.i),
          columnMax = size.cols,
          spreadsheet = this.spreadsheets[this.i],
          row = [],
          sheetIndex = this.i,
          pane = this.pane();

      if (rowIndex === undefined) {
        rowIndex = size.rows - 1;
      }

      if (isAfter) {
        rowIndex++;
      }

      for(;columnIndex < columnMax; columnIndex++) {
        row.push(new WickedGrid.Cell(sheetIndex, null, this));
      }
      
      if (columnIndex === 0) {
        row.push(new WickedGrid.Cell(sheetIndex, null, this));
      }

      spreadsheet.splice(rowIndex, 0, row);

      loader.addRow(this.i, rowIndex, row);

      // Splice and if needed Increament visible columns
      if (pane.actionUI.visibleColumns.length === 0) {
        pane.actionUI.visibleColumns[0] = 0;
      }
      pane.actionUI.visibleRows.splice(rowIndex, 0, rowIndex);
      for (var i=rowIndex+1; i<pane.actionUI.visibleRows.length; i++) {
        pane.actionUI.visibleRows[i]+=1;
      }
      pane.actionUI.redrawRows();

      if (skipEvent !== true) {
        this.trigger('sheetAddRow', [rowIndex, isAfter, 1]);
      }
    },

    /**
     * creates single column
     * @param {Boolean} [isAfter] places cells after if set to true
     * @param {Number} [columnIndex], column index
     * @param {Boolean} [skipEvent].controlFactory
     */
    addColumn:function (isAfter, columnIndex, skipEvent) {
      var loader = this.loader,
          rowIndex = 0,
          size = loader.size(this.i),
          rowMax = size.rows,
          row,
          column = [],
          cell,
          spreadsheet = this.spreadsheets[this.i],
          sheetIndex = this.i,
          pane = this.pane();

      if (columnIndex === undefined) {
        columnIndex = size.cols - 1;
      }

      if (isAfter) {
        columnIndex++;
      }

      if (rowMax === 0) {
        return this.addRow(true);
      }

      for(;rowIndex < rowMax; rowIndex++) {
        cell = new WickedGrid.Cell(sheetIndex, null, this);
        column.push(cell);
        row = spreadsheet[rowIndex];
        row.splice(columnIndex, 0, cell);
      }

      loader.addColumn(this.i, columnIndex, column);

      // Splice and if needed Increament visible columns
      if (pane.actionUI.visibleRows.length === 0) {
        pane.actionUI.visibleColumns[0] = 0;
      }
      pane.actionUI.visibleColumns.splice(columnIndex, 0, columnIndex);
      for (var i=columnIndex+1; i<pane.actionUI.visibleColumns.length; i++) {
        pane.actionUI.visibleColumns[i]+=1;
      }
      pane.actionUI.redrawColumns();

      if (skipEvent !== true) {
        this.trigger('sheetAddColumn', [columnIndex, isAfter, 1]);
      }
    },

    /**
     * Allows grouping of cells
     */
    autoFillerNotGroup:true,

    /**
     * Sends tab delimited string into cells, usually a paste from external spreadsheet application
     * @param [oldVal] what formula should be when this is done working with all the values
     * @returns {Boolean}
     */
    updateCellsAfterPasteToFormula:function (oldVal) {
      var newValCount = 0,
          formula = this.formula(),
          startCell = this.cellLast;

      oldVal = oldVal || formula.val();

      var val = formula.val(), //once ctrl+v is hit formula now has the data we need
          firstValue = val;

      //at this point we need to check if there is even a cell selected, if not, we can't save the information, so clear formula editor
      if ((startCell.rowIndex == 0 && startCell.columnIndex == 0) || val.length === 0) {
        return false;
      }

      var parsedRows = this.tsv.parse(val);

      //Single cell value
      if (parsedRows.constructor !== Array) {
        formula.val(parsedRows);
        this.fillUpOrDown(false, parsedRows);
        return true;
      }

      var i = 0,
          j,
          parsedColumns,
          spreadsheet,
          row,
          cell;

      //values that need put into multi cells
      for (; i < parsedRows.length; i++) {
        startCell.isEdit = true;
        parsedColumns = parsedRows[i];
        parsedColumns.forEach(function(parsedColumn, j) {
          newValCount++;

          if (
              !(spreadsheet = this.spreadsheets[this.i])
              || !(row = spreadsheet[i + startCell.rowIndex])
              || !(cell = row[j + startCell.columnIndex])
              || !cell
          ) return;

          this.resolveCell(cell, function() {
            if ((parsedColumn + '').charAt(0) == '=') { //we need to know if it's a formula here
              cell.formula = parsedColumn.substring(1);
              cell.value = '';
            } else {
              cell.formula = '';
              cell.value = parsedColumn;
            }
          });

          if (i == 0 && j == 0) { //we have to finish the current edit
            firstValue = parsedColumn;
          }
        });
      }

      if (val != firstValue) {
        formula.val(firstValue);
      }

      this.fillUpOrDown(false, firstValue);

      this.cellEditDone(true);

      return true;
    },

    /**
     * Event handlers for instance
     * @namespace
     */


    /**
     *
     * @param {Number} start index to start from
     */
    refreshColumnLabels:function (start) {
      start = start || 0;

      var $barMenuParentTop = this.barMenuParentTop();
      if (($barMenuParentTop) && ($barMenuParentTop.length)){
        var barMenuParentTop = $barMenuParentTop.get(0);
        if ($.isFunction(barMenuParentTop.destroy)) {
          barMenuParentTop.destroy();
        }
      }

      var ths = this.controls.bar.x.th[this.i],
          th;

      if (!ths) return;

      for (var i = Math.max(start, 0); i < ths.length; i++) {
        //greater than 1 (corner)
        if (i > 0) {
          th = ths[i];
          th.innerHTML = th.label = this.cellHandler.columnLabelString(th.cellIndex);
        }
      }
    },

    /**
     *
     * @param {Number} start index to start from
     * @param {Number} [end] index to end at
     */
    refreshRowLabels:function (start, end) {
      start = start || 0;

      var ths = this.controls.bar.y.th[this.i],
          th;

      if (!ths) return;

      end = end || ths.length;

      for (var i = start; i < end; i++) {
        if (i > 0 && (th = ths[i]) !== u) {
          th.innerHTML = th.label = th.parentNode.rowIndex;
        }
      }
    },

    /**
     * Detects if an object is a td within a spreadsheet's table
     * @param {HTMLElement} element
     * @returns {Boolean}
     */
    isCell:function (element) {
      return element.nodeName === 'TD' && element.parentNode.parentNode.parentNode.parentNode === this.pane() && element.hasOwnProperty('_cell');
    },

    /**
     * Detects if an object is a bar td within a spreadsheet's table
     * @param {HTMLElement} element
     * @returns {Boolean}
     */
    isBar:function (element) {
      return element.tagName === 'TH';
    },

    /**
     * Tracks read state of spreadsheet
     */
    readOnly:[],

    /**
     * Detects read state of a spreadsheet
     * @param {Number} [i] index of spreadsheet within instance
     * @returns {Boolean}
     */
    isSheetEditable:function (i) {
      i = i || this.i;
      return (
          this.settings.editable == true && !this.readOnly[i]
      );
    },

    /**
     * Detects read state of formula of an object
     * @param {jQuery|HTMLElement} o target
     * @returns {Boolean}
     */
    isFormulaEditable:function (o) {
      if (this.settings.lockFormulas) {
        if (o.data('formula') !== u) {
          return false;
        }
      }
      return true;
    },

    /**
     * Toggles full screen mode
     */
    toggleFullScreen:function () {
      if (!this.controls.fullscreen) {
        this.controls.fullscreen = new WickedGrid.FullScreen(this);
      }
      this.controls.fullscreen.toggle();
    },

    /**
     * Assists in rename of spreadsheet
     */
    renameSheet:function (i) {
      if (n(i)) {
        return false;
      }

      if (i > -1) {
        this.sheetTab();
      }

      return true;
    },

    /**
     * Switches spreadsheet
     * @param {Number} i index of spreadsheet within instance
     */
    switchSheet:function (i) {
      //if (n(i)) {
      //  return false;
      //}

      if (i == -1) {
        this.addSheet();
      } else if (i != this.i) {
        this.setActiveSheet(i);
        this.sheetSyncSize()
        if (this.loader === null) {
          this.calc(i);
        }
      }

      return true;
    },

    toggleHideRow: function(i) {
      if (i === undefined) {
        i = this.rowLast;
      }

      if (i === undefined) return;

      var actionUI = this.pane().actionUI;

      if (actionUI.hiddenRows.indexOf(i) > -1) {
        actionUI.showRow(i);
      } else {
        actionUI.hideRow(i);
      }

      this.autoFillerGoToTd();
    },
    toggleHideRowRange: function(startIndex, endIndex) {
      var actionUI = this.pane().actionUI;

      if (actionUI.hiddenRows.indexOf(startIndex) > -1) {
        actionUI.showRowRange(startIndex, endIndex);
      } else {
        actionUI.hideRowRange(startIndex, endIndex);
      }

      this.autoFillerGoToTd();
    },
    toggleHideColumn: function(i) {
      if (i === undefined) {
        i = this.colLast;
      }

      if (i === undefined) return;

      var actionUI = this.pane().actionUI;

      if (actionUI.hiddenColumns.indexOf(i) > -1) {
        actionUI.showColumn(i);
      } else {
        actionUI.hideColumn(i);
      }

      this.autoFillerGoToTd();
    },
    toggleHideColumnRange: function(startIndex, endIndex) {
      var actionUI = this.pane().actionUI;

      if (actionUI.hiddenColumns.indexOf(startIndex) > -1) {
        actionUI.showColumnRange(startIndex, endIndex);
      } else {
        actionUI.hideColumnRange(startIndex, endIndex);
      }

      this.autoFillerGoToTd();
    },
    rowShowAll: function() {
      this.pane().actionUI.rowShowAll();
    },
    columnShowAll: function() {
      this.pane().actionUI.columnShowAll();
    },

    hideMenus: function() {
      this.columnMenu.hide();
      this.columnContextMenu.hide();
      this.rowContextMenu.hide();

      return this;
    },
    /**
     * Merges cells together
     * @param {Object} [tds]
     */
    merge:function (tds) {
      tds = tds || this.highlighted();
      if (!tds.length) {
        return;
      }

      var cellsValue = [],
          firstTd = tds[0],
          lastTd = tds[tds.length - 1],
          firstLocRaw = this.getTdLocation(firstTd),
          lastLocRaw = this.getTdLocation(lastTd),
          firstLoc = {},
          lastLoc = {},
          colSpan = 0,
          rowSpan = 0,
          i = tds.length - 1,
          cell,
          _td,
          td,
          loc,
          element = this.settings.element,
          self = this;

      if (firstLocRaw.row) {
        this.setDirty(true);
        this.setChanged(true);

        if (firstLocRaw.row < lastLocRaw.row) {
          firstLoc.row = firstLocRaw.row;
          lastLoc.row = lastLocRaw.row;
          td = firstTd;
        } else {
          firstLoc.row = lastLocRaw.row;
          lastLoc.row = firstLocRaw.row;
          td = lastTd;
        }

        if (td.hasAttribute('rowSpan') || td.hasAttribute('colSpan')) {
          return false;
        }

        if (firstLocRaw.col < lastLocRaw.col) {
          firstLoc.col = firstLocRaw.col;
          lastLoc.col = lastLocRaw.col;
        } else {
          firstLoc.col = lastLocRaw.col;
          lastLoc.col = firstLocRaw.col;
        }

        rowSpan = (lastLoc.row - firstLoc.row) + 1;
        colSpan = (lastLoc.col - firstLoc.col) + 1;

        loc = this.getTdLocation(td);

        tds.forEach(function() {
          _td = tds[i];
          cell = _td._cell;
          if (cell.formula || cell.value) {
            cellsValue.unshift(cell.formula ? '(' + cell.formula.substring(1) + ')' : cell.value);
          }

          self.resolveCell(cell, function() {
            if (_td.cellIndex != loc.col || _td.parentNode.rowIndex != loc.row) {
              cell.formula = '';
              cell.value = '';
              cell.defer = td._cell;

              _td.innerHTML = '';
              //_td.style.display = 'none';
              _td.style.visibility = 'collapse';
              //_td.colSpan = colSpan - (_td.cellIndex - td.cellIndex);
              //_td.rowSpan = rowSpan - (_td.parentNode.rowIndex - td.parentNode.rowIndex);
            }
          });
        });

        td._cell.value = $.trim(cellsValue.join(' '));
        td._cell.formula = $.trim(td._cell.formula ? cellsValue.join(' ') : '');

        td.setAttribute('rowSpan', rowSpan);
        td.setAttribute('colSpan', colSpan);
        td.style.display = '';
        td.style.visibility = '';
        td.style.position = '';
        td.style.height = td.clientHeight + 'px';
        td.style.width = td.clientWidth + 'px';
        td.style.position = 'absolute';

        this.resolveCell(td._cell);
        this.cellEvents.done();
        this.autoFillerGoToTd(td);
        this.cellSetActive(td, loc);
      }
      return true;
    },

    /**
     * Unmerges cells together
     * @param {jQuery} [td]
     */
    unmerge:function (td) {
      td = td || this.highlighted();
      if (!td) {
        return;
      }
      var loc = this.getTdLocation(td),
          row = Math.max(td.getAttribute('rowSpan') * 1, 1) - 1,
          col = Math.max(td.getAttribute('colSpan') * 1, 1) - 1,
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
          _td = this.getTd(-1, i, j);
          if (_td === null) continue;
          _td.style.display = '';
          _td.style.visibility = '';
          _td.removeAttribute('colSpan');
          _td.removeAttribute('rowSpan');
          _td._cell.defer = null;

          this.resolveCell(_td._cell);

          tds.push(_td);
        } while (j-- > loc.col);
      } while (i-- > loc.row);

      this.cellEvents.done();
      this.autoFillerGoToTd(td);
      this.cellSetActive(td, loc);
      this.highlighter.set(tds);
      return true;
    },

    /**
     * Fills values down or up to highlighted cells from active cell;
     * @param {Boolean} [goUp] default is down, when set to true value are filled from bottom, up;
     * @param {String} [v] the value to set cells to, if not set, formula will be used;
     * @param {Object} [cells]
     * @returns {Boolean}
     */
    fillUpOrDown:function (goUp, v, cells) {
      this.cellEvents.done();
      cells = cells || this.highlighted(true);

      if (cells.length < 1) {
        return false;
      }

      var activeTd = this.tdActive();

      if (cells.length < 1) {
        return false;
      }

      var startLoc = this.getTdLocation(cells[0].td),
          endLoc = this.getTdLocation(cells[cells.length - 1].td),
          relativeLoc = this.getTdLocation(activeTd),
          offset = {
            row:0,
            col:0
          },
          newV = v || activeTd._cell.value,
          isNumber = false,
          i = cells.length - 1,
          fn = function() {},
          $element = this.settings.$element;

      v = v || activeTd._cell.value;

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

              newV = this.reparseFormula(v, offset);

              $element.one('sheetPreCalculation', function () {
                cells[i].formula = newV;
                cells[i].value = '';
              });

              this.resolveCell(cells[i]);
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
            $element.one('sheetPreCalculation', function () {
              cells[i].formula = '';
              cells[i].value = newV + '';
            });

            this.resolveCell(cells[i]);

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
     * @returns {String}
     */
    toTsv:function (cells, clearValue, fnEach) {
      cells = cells || this.highlighted(true);
      if (cells.type) {
        cells = [cells];
      }
      fnEach = fnEach || function (loc, cell) {
            if (clearValue) {
              $element.one('sheetPreCalculation', function () {
                cell.formula = '';
                cell.value = '';
              });
              self.resolveCell(cell);
            }
          };
      var $element = this.settings.$element,
          cellValues = [],
          firstLoc,
          lastLoc,
          minLoc = {},
          i = cells.length - 1,
          row,
          col,
          self = this;

      if (i >= 0) {
        firstLoc = this.getTdLocation(cells[0].td);
        lastLoc = this.getTdLocation(cells[cells.length - 1].td);
        minLoc.row = Math.min(firstLoc.row, lastLoc.row);
        minLoc.col = Math.min(firstLoc.col, lastLoc.col);
        do {
          var loc = this.getTdLocation(cells[i].td),
              value = (cells[i].formula ? '=' + cells[i].formula : cells[i].value);

          row = Math.abs(loc.row - minLoc.row);
          col = Math.abs(loc.col - minLoc.col);

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
     */
    offsetFormulas:function (loc, offset, isBefore, wasDeleted) {
      var self = this,
          size = this.sheetSize(),
      //effected range is the entire spreadsheet
          affectedRange = {
            first:{
              row:0,
              col:0
            },
            last:{
              row:size.rows,
              col:size.cols
            }
          },
          cellStack = [];

      this.cycleCells(function () {
        var cell = this;
        if (this.formula && typeof this.formula == 'string' && self.isFormulaEditable(this.td)) {
          this.formula = self.reparseFormula(this.formula, offset, loc, isBefore, wasDeleted);
        }

        cellStack.push(function() {
          self.resolveCellWithoutUndo(cell, true);
        });

      }, affectedRange.first, affectedRange.last);

      while (cellStack.length) {
        cellStack.pop()();
      }

      self.cellEvents.done();
    },

    cellRegex: /(\$?[a-zA-Z]+|[#]REF[!])(\$?[0-9]+|[#]REF[!])/gi,
    /**
     * Re-parses a formula
     * @param formula
     * @param {Object} offset expects keys row,col, offsets increment
     * @param {Object} [loc]
     * @param {Boolean} [isBefore]
     * @param {Boolean} [wasDeleted]
     * @returns {String}
     */
    reparseFormula:function (formula, offset, loc, isBefore, wasDeleted) {
      var self = this;

      return formula.replace(this.cellRegex, function (ignored, col, row, pos) {
        if (col == 'SHEET') return ignored;
        offset = offset || {loc: -1, row: -1};

        var oldLoc = {
              row: row * 1,
              col: self.cellHandler.columnLabelIndex(col)
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
              return self.makeFormula(oldLoc);
            }

            if (moveRow) {
              oldLoc.row += offset.row;
              return self.makeFormula(oldLoc);
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
              return self.makeFormula(oldLoc);
            }

            if (moveRow) {
              oldLoc.row += offset.row;
              return self.makeFormula(oldLoc);
            }
          }
        } else {
          return self.makeFormula(oldLoc, offset);
        }

        return ignored;
      });
    },

    /**
     * Reconstructs a formula
     * @param {Object} loc expects keys row,col
     * @param {Object} [offset] expects keys row,col
     * @returns {String}
     */
    makeFormula:function (loc, offset) {
      offset = extend({row:0, col:0}, offset);

      //set offsets
      loc.col += offset.col;
      loc.row += offset.row;

      //0 based now
      if (loc.col < 0) loc.col = 0;
      if (loc.row < 0) loc.row = 0;

      return self.cellHandler.parseCellName(loc.col, loc.row);
    },

    /**
     * Cycles through a certain group of td objects in a spreadsheet table and applies a function to them
     * @param {Function} fn the function to apply to a cell
     * @param {Object} [firstLoc] expects keys row,col, the cell to start at
     * @param {Object} [lastLoc] expects keys row,col, the cell to end at
     * @param {Number} [i] spreadsheet index within instance
     */
    cycleCells:function (fn, firstLoc, lastLoc, i) {
      i = i || this.i;
      firstLoc = firstLoc || {rowIndex:0, col:0};

      if (!lastLoc) {
        var size = this.sheetSize();
        lastLoc = {row:size.rows, col:size.cols};
      }

      var spreadsheet = this.spreadsheets[i],
          rowIndex,
          colIndex,
          row,
          cell;

      for(colIndex = firstLoc.col; colIndex < lastLoc.col; colIndex++) {
        for(rowIndex = firstLoc.row; rowIndex < lastLoc.row; rowIndex++) {

          if ((row = spreadsheet[rowIndex]) === u) continue;
          if ((cell  = row[colIndex]) === u) continue;

          //Something may have happened to the spreadsheet dimensions, lets go ahead and update the indexes
          cell.rowIndex = rowIndex;
          cell.columnIndex = colIndex;

          fn.call(cell, i, rowIndex, colIndex);
        }
      }
    },

    /**
     * Cycles through all td objects in a spreadsheet table and applies a function to them
     * @param fn
     */
    cycleCellsAll:function (fn) {
      var savedIndex = this.i, i,size,endLoc;
      for (i = 0; i <= this.sheetCount; i++) {
        this.i = i;
        size = this.sheetSize();
        endLoc = {row:size.rows, col:size.cols};
        this.cycleCells(fn, {row:0, col:0}, endLoc, i);
      }
      this.i = savedIndex;
    },

    /**
     * Cycles through a certain group of td objects in a spreadsheet table and applies a function to them, firstLoc can be bigger then lastLoc, this is more dynamic
     * @param {Function} fn the function to apply to a cell
     * @param {Object} grid {startRowIndex, startColumnIndex, endRowIndex, endColumnIndex}
     */
    cycleCellArea:function (fn, grid) {
      var rowIndex,
          columnIndex,
          row,
          cell,
          i = this.i,
          o = {cell: [], td: []},
          spreadsheet = this.spreadsheets[i];

      for(rowIndex = grid.startRowIndex; rowIndex <= grid.endRowIndex; rowIndex++) {
        if ((row = spreadsheet[rowIndex]) === u) continue;

        for(columnIndex = grid.startColumnIndex; columnIndex <= grid.endColumnIndex; columnIndex++) {
          if ((cell = row[columnIndex]) === u) continue;

          o.cell.push(cell);
          o.td.push(cell.td);
        }
      }

      if (fn) {
        fn(o);
      }
    },

    cycleTableArea: function (fn, td1, td2, groupify) {
      var trs = this.pane().tBody.children,
          tr,
          td,
          tds = [],
          row1 = td1.parentNode.rowIndex,
          col1 = td1.cellIndex,
          row2 = td2.parentNode.rowIndex,
          col2 = td2.cellIndex,
          _row1,
          _col1,
          _row2,
          _col2;

      if (row1 < row2) {
        //added to zero's so as not to increment if this number is important when I ++ later
        _row1 = row1 + 0;
        _row2 = row2 + 0;
      } else {
        _row1 = row2 + 0;
        _row2 = row1 + 0;
      }

      while (_row1 <= _row2 && (tr = trs[_row1]) !== u) {
        if (col1 < col2) {
          _col1 = col1 + 0;
          _col2 = col2 + 0;
        } else {
          _col1 = col2 + 0;
          _col2 = col1 + 0;
        }

        while (_col1 <= _col2 && (td = tr.children[_col1]) !== u) {
          if (groupify) {
            tds.push(td);
          } else {
            fn(td);
          }
          _col1++;
        }
        _row1++;
      }

      if (groupify) {
        fn(tds);
      }
    },

    /**
     * jQuery ui resizeable integration
     * @param {jQuery|HTMLElement} o To set resizable
     * @param {Object} settings the settings used with jQuery ui resizable
     */
    resizable:function (o, settings) {
      if (!o.data('resizable')) {
        o.resizable(settings);
      }
    },

    /**
     * instance busy state
     */
    busy:[],

    /**
     * Set the spreadsheet busy status
     * @param {Boolean} busy
     */
    setBusy:function (busy) {
      if (busy) {
        this.busy.push(busy);
      } else {
        this.busy.pop();
      }

      while (this.busy.length < 1 && this.whenNotBusyStack.length > 0) {
        this.whenNotBusyStack.pop().call(this);
      }
      return this;
    },

    /**
     * get the spreadsheet busy status
     * @returns {Boolean}
     */
    isBusy:function () {
      return (this.busy.length > 0);
    },

    whenNotBusyStack: [],

    whenNotBusy: function(callback) {
      if (this.isBusy()) {
        this.whenNotBusyStack.push(callback);
      } else {
        callback.call(this);
      }
    },

    /**
     * jQuery ui draggable integration
     * @param {jQuery|HTMLElement} o To set resizable
     * @param {Object} settings the settings used with jQuery ui resizable
     */
    draggable:function (o, settings) {
      if (!o.data('jSdraggable')) {
        o
            .data('jSdraggable', true)
            .draggable(settings);
      }
    },
    /**
     * Updates the label so that the user knows where they are currently positioned
     * @param {WickedGrid.Cell|*} entity
     */
    labelUpdate:function (entity) {
      if (entity instanceof WickedGrid.Cell) {
        var name = this.cellHandler.parseCellName(entity.columnIndex, entity.rowIndex);
        this.label().text(name);
      } else {
        this.label().text(entity);
      }
    },

    /**
     * Starts td to be edited
     * @param {WickedGrid.Cell} cell
     * @param {Boolean} [isDrag] should be determined by if the user is dragging their mouse around setting cells
     * @param {Boolean} [doNotClearHighlighted]
     */
    cellEdit:function (cell, isDrag, doNotClearHighlighted) {
      this.autoFillerNotGroup = true; //make autoFiller directional again.
      //This finished up the edit of the last cell
      this.cellEvents.done();

      var td = cell.td, v;

      if (cell.uneditable) return;
      this.cellLast = cell;
      this.trigger('sheetCellEdit', [cell]);

      if (this.cellLast !== null && td !== this.cellLast.td) {
        this.followMe(cell.td);
      } else {
        this.autoFillerGoToTd(td);
      }

      //Show where we are to the user
      this.labelUpdate(cell);

      if (cell.formula.length > 0) {
        v = '=' + cell.formula;
      } else {
        v = cell.value;
      }

      this.formula()
          .val(v)
          .blur();

      this.cellSetActive(cell, isDrag, false, null, doNotClearHighlighted);
    },

    /**
     * sets cell active to sheet, and highlights it for the user, shouldn't be called directly, should use cellEdit
     * @param {WickedGrid.Cell} cell
     * @param {Boolean} [isDrag] should be determined by if the user is dragging their mouse around setting cells
     * @param {Boolean} [directional] makes highlighting directional, only left/right or only up/down
     * @param {Function} [fnDone] called after the cells are set active
     * @param {Boolean} [doNotClearHighlighted]
     */
    cellSetActive:function (cell, isDrag, directional, fnDone, doNotClearHighlighted) {
      var td = cell.td;

      this.cellLast = cell;

      this.rowLast = cell.rowIndex;
      this.colLast = cell.columnIndex;

      if (!doNotClearHighlighted) {
        this.highlighter
            .set(cell.td) //highlight the cell and bars
            .setStart(cell)
            .setEnd(cell);
      }

      this.highlighter
          .setBar('left', td.parentNode.children[0])
          .setBar('top', td.parentNode.parentNode.children[0].children[td.cellIndex]);

      var self = this,
          settings = this.settings,
          selectModel,
          clearHighlightedModel;

      switch (settings.cellSelectModel) {
        case WickedGrid.excelSelectModel:
        case WickedGrid.googleDriveSelectModel:
          selectModel = function () {};
          clearHighlightedModel = function() {};
          break;
        case WickedGrid.openOfficeSelectModel:
          selectModel = function (target) {
            if (this.isCell(target)) {
              this.cellEdit(target._cell);
            }
          };
          clearHighlightedModel = function () {};
          break;
      }

      if (isDrag) {
        var pane = this.pane(),
            highlighter = this.highlighter,
            x1, y1, x2, y2,
            lastTouchedRowIndex = cell.rowIndex,
            lastTouchedColumnIndex = cell.columnIndex;

        pane.onmousemove = function (e) {
          e = e || window.event;

          var target = e.target || e.srcElement;

          if (self.isBusy() || !self.isCell(target)) {
            return false;
          }

          var touchedCell = self.cellFromTd(target),
              ok = true;

          if (directional) {
            ok = (cell.columnIndex === touchedCell.columnIndex || cell.rowIndex === touchedCell.rowIndex);
          }

          if ((
                  lastTouchedColumnIndex !== touchedCell.columnIndex
                  || lastTouchedRowIndex !== touchedCell.rowIndex
              ) && ok) { //this prevents this method from firing too much
            //select active cell if needed
            selectModel(target);

            //highlight the cells
            self.cycleTableArea(function (tds) {
              highlighter.set(tds);
            }, td, target, true);
          }

          self.followMe(target);

          var mouseY = e.clientY,
              mouseX = e.clientX,
              offset = pane.$enclosure.offset(),
              up = target.cellIndex,
              left = target.parentNode.rowIndex,
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
            //table tbody tr td
            previous = target.parentNode.parentNode.children[up].children[left];
            self.followMe(previous, true);
          }

          lastTouchedColumnIndex = touchedCell.columnIndex;
          lastTouchedRowIndex = touchedCell.rowIndex;
          return true;
        };

        document.onmouseup = function() {
          pane.onmousemove = null;
          pane.onmousemove = null;
          pane.onmouseup = null;
          document.onmouseup = null;

          if (fnDone) {
            fnDone();
          }
        };
      }

    },

    /**
     * the most recent used column
     */
    colLast:0,

    /**
     * the most recent used row
     */
    rowLast:0,

    /**
     * the most recent used cell, {td, row, col, isEdit}
     * @type {Object}
     */
    cellLast:null,

    /**
     * the most recent highlighted cells {td, rowStart, colStart, rowEnd, colEnd}, in order
     * @type {Object}
     */
    orderedGrid: function(grid) {
      var gridOrdered = {
        startRowIndex: (grid.startRowIndex < grid.endRowIndex ? grid.startRowIndex : grid.endRowIndex),
        startColumnIndex: (grid.startColumnIndex < grid.endColumnIndex ? grid.startColumnIndex : grid.endColumnIndex),
        endRowIndex: (grid.endRowIndex > grid.startRowIndex ? grid.endRowIndex : grid.startRowIndex),
        endColumnIndex: (grid.endColumnIndex > grid.startColumnIndex ? grid.endColumnIndex : grid.startColumnIndex)
      };

      return gridOrdered;
    },

    /**
     * sets cell(s) class for styling
     * @param {String} setClass class(es) to set cells to
     * @param {String} [removeClass] class(es) to remove from cell if the setClass would conflict with
     * @param {Object} [tds]
     * @returns {Boolean}
     */
    cellStyleToggle:function (setClass, removeClass, tds) {
      tds = tds || this.highlighted();
      if (tds.length < 1) {
        return false;
      }
      this.setDirty(true);
      //Lets check to remove any style classes
      var td,
          $td,
          i = tds.length - 1,
          cells = this.cellsEdited(),
          hasClass;

      //TODO: use resolveCell and sheetPreCalculation to set undo redo data

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

          if (!td._cell.edited) {
            td._cell.edited = true;
            cells.push(td._cell);
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
     */
    cellTypeToggle:function(type, cells) {
      cells = cells || this.highlighted(true);

      if (cells.length < 1) {
        return;
      }

      var i = cells.length - 1,
          remove = cells[i].cellType == type,
          cell;

      if (i >= 0) {
        do {
          cell = cells[i];
          if (remove) {
            cell.cellType = null;
          } else {
            cell.cellType = type;
          }
          //TODO set needsUpdate on cell and dependencies
          cell.updateValue();

        } while(i--);
      }
    },

    /**
     * Resize fonts in a cell by 1 pixel
     * @param {String} direction 'up' or 'down'
     * @param {Object} [tds]
     * @returns {Boolean}
     */
    fontReSize:function (direction, tds) {
      tds = tds || this.highlighted();
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
          cells = this.cellsEdited();

      //TODO: use resolveCell and sheetPreCalculation to set undo redo data

      if (i >= 0) {
        do {
          td = tds[i];
          $td = $(td);
          size = ($td.css('font-size') + '').replace('px', '') * 1;
          $td.css('font-size', ((size || 10) + resize) + 'px');

          if (!td._cell.edited) {
            td._cell.edited = true;
            cells.push(td._cell);
          }
        } while(i--);
        return true;
      }
      return false;
    },


    /**
     * Object handler for formulaParser
     * @type {WickedGrid.CellHandler}
     */
    cellHandler: null,

    /**
     * Where this.spreadsheets are calculated, and returned to their td counterpart
     * @param {Number} [sheetIndex] table index
     * @param {Boolean} [refreshCalculations]
     */
    calc:function (sheetIndex, refreshCalculations) {
      if (this.settings.calcOff) return false;

      sheetIndex = (sheetIndex === u ? this.i : sheetIndex);
      if (
          this.readOnly[sheetIndex]
          || this.isChanged(sheetIndex) === false
          && !refreshCalculations
      ) {
        return false;
      } //readonly is no calc at all

      var loader = this.loader,
          cell;

      loader.cycleCells(sheetIndex, function(sheetIndex, rowIndex, columnIndex) {
        cell = loader.jitCell(sheetIndex, rowIndex, columnIndex);
        cell.updateValue();
      });

      this.trigger('sheetCalculation', [
        {which:'spreadsheet', index:sheetIndex}
      ]);

      this.setChanged(false);
      return true;
    },

    /**
     * Where this.spreadsheets are all calculated, and returned to their td counterpart
     * @param {Boolean} [refreshCalculations]
     */
    calcAll: function(refreshCalculations) {
      var sheetIndex = 0,
          max;

      max = this.settings.loader.count;

      for(;sheetIndex < max; sheetIndex++) {
        this.calc(sheetIndex, refreshCalculations);
      }
    },

    /**
     * Calculates just the dependencies of a single cell, and their dependencies recursively
     * @param {WickedGrid.Cell} cell
     * @param {Function} [cb]
     */
    resolveCell:function (cell, cb) {
      var updateDependencies = !cell.needsUpdated,
        self = this;

      this.undo.createCells([cell], function(cells) {
        self
          .trigger('sheetPreCalculation', [
            {which:'cell', cell:cell}
          ])
          .setDirty(true)
          .setChanged(true);

        cell.updateValue(function() {
          if (typeof cb === 'function') cb(cell);

          self.trigger('sheetCalculation', [
            {which:'cell', cell: cell}
          ]);

          if (updateDependencies) {
            cell.updateDependencies();
          }
        });

        return cells;
      });
    },

    /**
     * Calculates just the dependencies of a single cell, and their dependencies recursively
     * @param {WickedGrid.Cell} cell
     * @param {Function} [cb]
     */
    resolveCellWithoutUndo: function(cell, cb) {
      var self = this;
      var updateDependencies = !cell.needsUpdated;

      this
        .trigger('sheetPreCalculation', [
          {which:'cell', cell:cell}
        ])
        .setDirty(true)
        .setChanged(true);

      cell.updateValue(function() {
        if (typeof cb === 'function') cb(cell);

        self.trigger('sheetCalculation', [
          {which:'cell', cell: cell}
        ]);

        if (updateDependencies) {
          cell.updateDependencies();
        }
      });
    },

    /**
     * adds a spreadsheet table
     */
    addSheet:function () {
      this.cellEvents.editAbandon();
      this.setDirty(true);
      this.loader.addSpreadsheet(null, this.sheetCount);
      WickedGrid.sheetUI(this, this.ui, this.sheetCount);

      this.setActiveSheet(this.sheetCount);

      this.sheetCount++;
      this.spreadsheets.push([]);
      this.sheetSyncSize();

      var pane = this.pane();
      if (pane.inPlaceEdit) {
        pane.inPlaceEdit.goToTd();
      }

      this.trigger('sheetAdd', [this.i]);
    },

    insertSheet: null,

    /**
     * deletes a spreadsheet table
     * @param {Number} [i] spreadsheet index within instance
     */
    deleteSheet:function (i) {
      var oldI = i || this.i,
          enclosureArray = this.controls.enclosure,
          tabIndex;

      enclosureArray.splice(oldI,1);

      this.barHelper().remove();

      $(this.enclosure()).remove();
      this.menus().remove();
      this.tabContainer().children().eq(this.i).remove();
      this.spreadsheets.splice(oldI, 1);
      this.controls.autoFiller.splice(oldI, 1);
      this.controls.bar.helper.splice(oldI, 1);
      this.controls.bar.corner.splice(oldI, 1);
      this.controls.bar.x.controls.splice(oldI, 1);
      this.controls.bar.x.handleFreeze.splice(oldI, 1);
      this.controls.bar.x.controls.splice(oldI, 1);
      this.controls.bar.x.menu.splice(oldI, 1);
      if (this.controls.bar.x.menuParent && this.controls.bar.x.menuParent[oldI]) {
        this.controls.bar.x.menuParent.splice(oldI, 1);
      }
      this.controls.bar.x.parent.splice(oldI, 1);
      this.controls.bar.x.th.splice(oldI, 1);
      this.controls.bar.y.controls.splice(oldI, 1);
      this.controls.bar.y.handleFreeze.splice(oldI, 1);
      this.controls.bar.y.controls.splice(oldI, 1);
      this.controls.bar.y.menu.splice(oldI, 1);
      if (this.controls.bar.y.menuParent && this.controls.bar.y.menuParent[oldI]) {
        this.controls.bar.y.menuParent.splice(oldI, 1);
      }
      this.controls.bar.y.parent.splice(oldI, 1);
      this.controls.bar.y.th.splice(oldI, 1);
      this.controls.barMenuLeft.splice(oldI, 1);
      this.controls.barMenuTop.splice(oldI, 1);
      this.controls.barLeft.splice(oldI, 1);
      this.controls.barTop.splice(oldI, 1);
      this.controls.barTopParent.splice(oldI, 1);
      this.controls.chart.splice(oldI, 1);
      this.controls.tdMenu.splice(oldI, 1);
      this.controls.enclosure.splice(oldI, 1);
      this.controls.inPlaceEdit.splice(oldI, 1);
      this.controls.menus.splice(oldI, 1);
      this.controls.menu.splice(oldI, 1);
      this.controls.pane.splice(oldI, 1);
      this.controls.tables.splice(oldI, 1);
      this.controls.table.splice(oldI, 1);
      //BUGFIX - After removing of sheet, we need update the tab.i property - start from removed sheet's position.
      for (tabIndex = oldI+1; tabIndex < this.controls.tab.length; ++tabIndex) {
        var tab = this.controls.tab[tabIndex].get(0);
        tab.i--;
      }
      this.controls.tab.splice(oldI, 1);
      this.controls.toggleHide.x.splice(oldI, 1);
      this.controls.toggleHide.y.splice(oldI, 1);
      this.readOnly.splice(oldI, 1);
      this.i = 0;
      this.sheetCount--;
      this.sheetCount = Math.max(this.sheetCount, 0);

      if (this.sheetCount == 0) {
        this.addSheet();
      }

      this.setActiveSheet(this.i);
      this.setDirty(true);
      this.setChanged(true);

      this.trigger('sheetDelete', [oldI]);
    },

    /**
     * removes the currently selected row
     * @param {Number} [rowIndex]
     */
    deleteRow:function (rowIndex) {
      rowIndex = rowIndex || this.rowLast;

      var pane = this.pane(),
          row = this.spreadsheets[this.i].splice(rowIndex, 1)[0],
          columnIndex = 0,
          cell,
          columnMax = row.length,
          loader = this.settings.loader;
          rowMax = loader.size(this.i).rows;

      this.setChanged(true);

      this.offsetFormulas({
            row: rowIndex,
            col: 0
          }, {
            row: -1,
            col: 0
          },
          false,
          true
      );

      loader.deleteRow(this.i, rowIndex);

      for (;columnIndex < columnMax; columnIndex++) {
        cell = row[columnIndex];

        cell.setNeedsUpdated(false);
        cell.updateDependencies();
      }

      this.setDirty(true);

      this.cellEvents.editAbandon();

      if (pane.inPlaceEdit) {
        pane.inPlaceEdit.goToTd();
      }

      this.trigger('sheetDeleteRow', rowIndex);
    },

    /**
     * removes the columns associated with highlighted cells
     * @param {Number} [columnIndex]
     */
    deleteColumn:function (columnIndex) {
      columnIndex = columnIndex || this.colLast;

      var pane = this.pane(),
          rowIndex = 0,
          cell,
          rows = this.spreadsheets[this.i],
          loader = this.settings.loader,
          rowMax = loader.size(this.i);

      this.setChanged(true);

      this.offsetFormulas({
            row: 0,
            col: columnIndex
          }, {
            row: -1,
            col: 0
          },
          false,
          true
      );

      loader.deleteColumn(this.i, columnIndex);

      for (;rowIndex < rowMax.rows; rowIndex++) {
        cell = rows[rowIndex].splice(columnIndex, 1)[0];

        cell.setNeedsUpdated(false);
        cell.updateDependencies();
      }

      this.setDirty(true);

      this.cellEvents.editAbandon();

      if (pane.inPlaceEdit) {
        pane.inPlaceEdit.goToTd();
      }
      
      // Splice and if needed Decrement visible columns
      pane.actionUI.visibleColumns.splice(columnIndex, 1);
      for (var i=columnIndex; i<pane.actionUI.visibleColumns.length; i++) {
        pane.actionUI.visibleColumns[i]-=1;
      }

      pane.actionUI.redrawColumns();
      this.trigger('sheetDeleteColumn', columnIndex);
    },

    /**
     * manages a tabs inner value
     * @param {Boolean} [get] makes return the current value of the tab
     * @param {Function} [callback]
     * @returns {String}
     */
    sheetTab:function (_get, callback) {
      var sheetTab = '',
          self = this;
      if (_get) {
        sheetTab = this.loader.title(this.i) || this.msg.sheetTitleDefault.replace(/[{]index[}]/gi, this.i + 1);
        if (callback) {
          callback(sheetTab);
        }
        return sheetTab;
      } else if (this.isSheetEditable() && this.settings.editableNames) { //ensure that the sheet is editable, then let them change the sheet's name
        this.settings.prompt(
            this.msg.newSheetTitle,
            function(newTitle) {
              if (!newTitle) { //The user didn't set the new tab name
                sheetTab = self.loader.title(self.i);
                newTitle = (sheetTab ? sheetTab : self.msg.sheetTitleDefault.replace(/[{]index[}]/gi, self.i + 1));
              } else {
                self.setDirty(true);
                self.table().attr('title', newTitle);
                self.tab().html(newTitle);

                sheetTab = newTitle;
              }

              if (callback) {
                callback($(document.createElement('div')).text(sheetTab).html());
              }
            },
            self.sheetTab(true)
        );
        return null;
      }
    },

    /**
     * scrolls the sheet to the selected cell
     * @param {HTMLElement} [td] default is tdActive
     * @param {boolean} [dontMoveAutoFiller] keeps autoFillerHandler in default position
     */
    followMe:function (td, dontMoveAutoFiller) {
      td = td || this.tdActive();
      if (td === null) return;

      var pane = this.pane(),
          actionUI = pane.actionUI;

      this.setBusy(true);

      //actionUI.putTdInView(td);

      this.setBusy(false);

      if(!dontMoveAutoFiller){
        this.autoFillerGoToTd(td);
      }
    },

    /**
     * moves autoFiller to a selected cell if it is enabled in settings
     * @param {HTMLElement} [td] default is tdActive
     * @param {Number} [h] height of a td object
     * @param {Number} [w] width of a td object
     */
    autoFillerGoToTd:function (td, h, w) {
      if (!this.settings.autoFiller) return this;

      if (td === u && this.cellLast !== null) {
        td = this.cellLast.td;
      }

      if (td && td.type == 'cell') { //ensure that it is a usable cell
        h = h || td.clientHeight;
        w = w || td.clientWidth;
        if (!td.offsetHeight || !td.offsetWidth || !td.clientHeight || !td.clientWidth) {
          this.autoFillerHide();
          return this;
        }

        var tdPos = $(td).position();

        this.autoFillerShow(((tdPos.top + (h || td.clientHeight) - 3) + 'px'), ((tdPos.left + (w || td.clientWidth) - 3) + 'px'));
      }

      return this;
    },

    /**
     * hides the auto filler if it is enabled in settings
     */
    autoFillerHide:function () {
      if (!this.settings.autoFiller) return this;

      var autoFiller = this.autoFiller(),
          parent = autoFiller.parentNode;
      if (parent !== null) {
        parent.removeChild(autoFiller);
      }

      return this;
    },

    autoFillerShow: function(top, left) {
      if (!this.settings.autoFiller) return this;

      var autoFiller = this.autoFiller(),
          parent = this.pane(),
          style = autoFiller.style;

      style.top = top;
      style.left = left;

      parent.insertBefore(autoFiller, parent.firstChild);
      return this;
    },



    /**
     * sets active a spreadsheet inside of a sheet instance
     * @param {Number} [i] a sheet integer desired to show, default 0
     * @param {Object} [spreadsheetUI]
     */
    setActiveSheet:function (i, spreadsheetUI) {
      if (spreadsheetUI !== u) {
        i = spreadsheetUI.i;
      } else {
        i = i || 0;
      }

      if (this.cellLast !== null && (this.cellLast.rowIndex > 0 || this.cellLast.columnIndex > 0)) {
        this.cellEvents.done();
        this.formula().val('');
      }

      var panes = this.panes(),
          j = 0,
          max = panes.length,
          pane,
          enclosure;

      this.autoFillerHide();

      for (;j < max; j++) {
        if (i != j) {
          pane = panes[j];
          pane.actionUI.hide();
        }
      }

      this.i = i;

      enclosure = this.enclosure();

      this.highlighter.setTab(this.tab());

      //this.readOnly[i] = (enclosure.table.className || '').match(/\breadonly\b/i) != null;

      pane = enclosure.pane;

      pane.actionUI.show();

      if (pane.inPlaceEdit) {
        pane.inPlaceEdit.goToTd();
      }
    },

    getSpreadsheetIndexByTitle: function(title) {
      var spreadsheetIndex = this.settings.loader.getSpreadsheetIndexByTitle(title);
      return spreadsheetIndex;
    },

    getSpreadsheetTitleByIndex: function(index) {
      return this.settings.loader.json[index].title;
    },

    /**
     * opens a spreadsheet into the active sheet instance
     */
    openSheet:function () {
      var self = this,
        loader = this.loader,
        element = this.element,
        $element = this.$element,
        count = loader.count,
        lastIndex = count - 1,
        open = function() {
          self.setBusy(true);
          self.loader = loader;
          var header = WickedGrid.header(self),
              ui = WickedGrid.ui(self),
              sheetAdder = WickedGrid.spreadsheetAdder(self),
              tabContainer = WickedGrid.tabs(self),
              i,
              options = {
                initChildren: function(ui, i) {
                  WickedGrid.sheetUI(self, ui, i);
                  self.trigger('sheetOpened', [i]);
                },
                done: function(stack) {
                  self.sheetSyncSize();

                  self.setActiveSheet(0);

                  self.setDirty(false);
                  self.setBusy(false);

                  self.trigger('sheetAllOpened');
                },
                lastIndex: lastIndex
              },
              firstSpreadsheetUI;

          header.ui = ui;
          header.tabContainer = tabContainer;

          ui.header = header;
          ui.sheetAdder = sheetAdder;
          ui.tabContainer = tabContainer;

          tabContainer.header = header;
          tabContainer.ui = ui;

          element.appendChild(header);
          element.appendChild(ui);
          element.appendChild(sheetAdder);
          element.appendChild(tabContainer);

          // resizable container div
          self.resizableSheet($element, {
            minWidth: element.clientWidth * 0.1,
            minHeight: element.clientHeight * 0.1,
            start:function () {
              self.setBusy(true);
              this.ui.removeChild(this.enclosure());
              ui.sheetAdder.hide();
              ui.tabContainer.hide();
            },
            stop:function () {
              this.ui.appendChild(this.enclosure());
              ui.sheetAdder.show();
              ui.tabContainer.show();
              self
                  .setBusy(false)
                  .sheetSyncSize();

              var pane = this.pane();
              if (pane.inPlaceEdit) {
                pane.inPlaceEdit.goToTd();
              }
            }
          });

          self.insertSheet = function(data, i, makeVisible) {
            self.sheetCount++;
            data = data || null;
            makeVisible = makeVisible !== u ? makeVisible : true;
            i = i || self.sheetCount - 1;

            if (data !== null) {
              self.settings.loader.addSpreadsheet(data);
            }

            var showSpreadsheet = function() {
                self.setBusy(true);
                var spreadsheetUI = new WickedGrid.SpreadsheetUI(i, ui, options);
                self.setActiveSheet(-1, spreadsheetUI);
                self.setBusy(false);
                self.sheetSyncSize();
              },
              tab;

            if (makeVisible) {
              showSpreadsheet();
              return;
            }

            var title = loader.title(i) || self.msg.sheetTitleDefault.replace(/[{]index[}]/gi, i + 1);
            tab = WickedGrid.customTab(self, title)
                .mousedown(function () {
                  showSpreadsheet();
                  self.tab().insertBefore(this);
                  $(this).remove();
                  return false;
                });

            if (self.loader.isHidden(i)) {
              tab.hide();
            }
          };

          //always load at least the first spreadsheet
          firstSpreadsheetUI = new WickedGrid.SpreadsheetUI(0, ui, options);
          self.sheetCount++;

          if (count > 0) {
            //set the others up to load on demand
            for (i = 1; i < count; i++) {
              self.insertSheet(null, i, false);
            }
            self.i = 0;

            firstSpreadsheetUI.loaded();
          }
        };

      if (this.isDirty) {
        this.settings.confirm(
          WickedGrid.msg.openSheet,
          open
        );
      } else {
        open();
      }

      return this;
    },

    /**
     * creates a new sheet from size from prompt
     */
    newSheet:function () {
      this.settings.$element
        .html(this.makeTable())
        .sheet(this.settings);
    },

    /**
     * synchronizes the called parent's controls so that the controls fit correctly within the parent
     * @function sheetSyncSize
     */
    sheetSyncSize:function () {
      var element = this.settings.element,
        $element = this.settings.$element,
        h = element.clientHeight,
        w = element.clientWidth,
        $tabContainer = this.tabContainer(),
        tabContainer = $tabContainer[0],
        tabContainerStyle = tabContainer.style,
        scrollBarWidth = window.scrollBarSize.width,
        tabContainerInnerWidth,
        tabContainerOuterWidth,
        widthTabContainer,
        heightTabContainer,
        uiStyle = this.ui.style,
        paneHeight,
        paneWidth,
        standardHeight,
        standardWidth,
        tabContainerScrollLeft;

      if (!h) {
        h = 400; //Height really needs to be set by the parent
        $element.height(h);
      } else if (h < 200) {
        h = 200;
        $element.height(h);
      }
      tabContainerScrollLeft = tabContainer.scrollLeft;
      tabContainerStyle.width = '';
      tabContainerInnerWidth = tabContainer.clientWidth;
      tabContainerOuterWidth = (w - (this.settings.colMargin + scrollBarWidth));
      widthTabContainer = (w - this.settings.colMargin * 2) + 'px';
      heightTabContainer = ((this.settings.colMargin + scrollBarWidth) + 'px');
      if (tabContainerInnerWidth > tabContainerOuterWidth) {
        tabContainerStyle.height = heightTabContainer;
        $tabContainer.addClass(WickedGrid.cl.tabContainerScrollable);
        h -= scrollBarWidth;
      } else {
        tabContainerStyle.height = null;
        $tabContainer.removeClass(WickedGrid.cl.tabContainerScrollable);
      }
      tabContainerStyle.width = widthTabContainer;
      tabContainer.scrollLeft = tabContainerScrollLeft;

      h -= this.header().outerHeight() + this.settings.boxModelCorrection;
      h -= tabContainer.clientHeight + this.settings.boxModelCorrection;

      paneHeight = (h - window.scrollBarSize.height - this.settings.boxModelCorrection) + 'px';
      paneWidth = (w - window.scrollBarSize.width) + 'px';
      standardHeight = (h + 'px');
      standardWidth = (w + 'px');

      this.panes().each(function() {
        var style = this.style,
            scrollStyle = this.scroll.style,
            enclosureStyle = this.enclosure.style;

        style.height = paneHeight;
        style.width = paneWidth;

        enclosureStyle.height = scrollStyle.height = standardHeight;
        enclosureStyle.width = scrollStyle.width = standardWidth;
      });

      uiStyle.height = standardHeight;
      uiStyle.width = standardWidth;

      return this;
    },

    /**
     *
     */
    showSheets: function() {
      var loader = this.settings.loader;
      this.tabContainer().children().each(function(i) {
        $(this).show();
        loader.setHidden(i, false);
      });
    },

    showSheet: function(sheetIndex) {
      var loader = this.settings.loader;
      this.tabContainer().children().eq(sheetIndex).show();
      loader.setHidden(sheetIndex, false);

    },

    hideSheet: function(sheetIndex) {
      var loader = this.settings.loader;
      this.tabContainer().children().eq(sheetIndex).hide();
      loader.setHidden(sheetIndex, true);
    },

    /**
     * changes a cell's style and makes it undoable/redoable
     * @param style
     * @param value
     * @param cells
     */
    cellChangeStyle:function (style, value, cells) {
      cells = cells || this.highlighted(true);
      if (cells.length < 1) {
        return false;
      }

      this.setDirty(this);
      var i = cells.length - 1;

      if ( i >= 0) {
        this.undo.createCells(cells, function(cells) { //save state, make it undoable
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
     */
    cellFind:function (v) {
      var settings = this.settings,
          msg = this.msg,
          self = this;
      function find (v) {
        var trs = $(self.tables()[self.i])
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
            self.cellEdit(o._cell);
          } else {
            settings.alert(msg.cellNoFind);
          }
        }
      }
      if (!v) {
        settings.prompt(
            msg.cellFind,
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
     */
    cellSetActiveBar:function (type, begin, end) {
      var self = this,
          settings = this.settings,
          size = this.loader.size(),
          startIndex,
          endIndex,
          start = {},
          stop = {},
          before,

          /**
           * Sets active bar
           */
          SetActive = function (highlighter) {
            switch (settings.cellSelectModel) {
              case WickedGrid.openOfficeSelectModel: //follow cursor behavior
                this.row = highlighter.startRowIndex;
                this.col = highlighter.startColumnIndex;
                this.td = self.getTd(-1, self.row, self.col);
                if (this.td !== null
                    && self.cellLast !== null
                    && this.td !== self.cellLast.td) {
                  self.cellEdit(self.td._cell, false, true);
                }
                break;
              default: //stay at initial cell
                this.row = highlighter.endRowIndex;
                this.col = highlighter.endColumnIndex;
                this.td = self.getTd(-1, this.row, this.col);
                if (this.td !== null
                    && self.cellLast !== null
                    && this.td !== self.cellLast.td) {
                  self.cellEdit(this.td._cell, false, true);
                }
                break;
            }
          },
          obj = [],
          scrolledArea = this.pane().actionUI.scrolledArea,
          index,
          row,
          td,
          highlighter = this.highlighter;

      switch (type) {
        case 'column':
          start.row = scrolledArea.row;
          stop.row = scrolledArea.row;

          if (begin < end) {
            highlighter.startColumnIndex
                = index
                = startIndex
                = start.col
                = begin;

            highlighter.endColumnIndex
                = endIndex
                = stop.col
                = end;
          } else {
            before = true;
            highlighter.startColumnIndex
                = index
                = startIndex
                = start.col
                = end;

            highlighter.endColumnIndex
                = endIndex
                = stop.col
                = begin;
          }

          highlighter.startRowIndex = 0;
          highlighter.endRowIndex = size.rows;

          obj.push(this.col(begin + 1));

          for (;index < endIndex;index++) {
            obj.push(obj[obj.length - 1].nextSibling);
          }
          break;
        case 'row':
          start.row = begin;
          start.col = scrolledArea.col;
          stop.row = end;
          stop.col = scrolledArea.col;

          highlighter.startRowIndex = begin;
          highlighter.startColumnIndex = 0;
          highlighter.endRowIndex = end;
          highlighter.endColumnIndex = size.cols;

          row = begin;

          do {
            td = this.getTd(-1, row, 0);
            if (td === null) continue;
            obj.push(td.parentNode);
          } while(row-- > begin);
          break;
        case 'corner': //all
          start.row = 0;
          start.col = 0;
          stop.col = size.cols;
          stop.row = size.rows;

          obj.push(sheet[0]);
          break;
      }

      new SetActive(highlighter);

      this.highlighter.set(obj);
    },

    /**
     * gets a range of selected cells, then returns it
     * @param {Object} [e] jQuery event, when in use, is during mouse down
     * @param {String} v Value to preserve and return
     * @param {String} [newFn]
     * @param {Boolean} [notSetFormula]
     * @returns {String}
     */
    getTdRange:function (e, v, newFn, notSetFormula) {
      this.cellLast.isEdit = true;

      var self = this,
          range = function (loc) {
            if (loc.first.col > loc.last.col ||
                loc.first.row > loc.last.row
            ) {
              return {
                first: this.cellHandler.parseCellName(loc.last.col, loc.last.row),
                last: this.cellHandler.parseCellName(loc.first.col, loc.first.row)
              };
            } else {
              return {
                first: this.cellHandler.parseCellName(loc.first.col, loc.first.row),
                last: this.cellHandler.parseCellName(loc.last.col, loc.last.row)
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
          first:this.getTdLocation([e.target])
        };

        sheet = this.table().mousemove(function (e) {
          loc.last = this.getTdLocation([e.target]);

          newVal = label(loc);

          if (!notSetFormula) {
            self.formula().val(newVal);
            self.inPlaceEdit().val(newVal);
          }
        });

        $(document).one('mouseup', function () {
          sheet.unbind('mousemove');
          return newVal;
        });
      } else {
        cells = this.highlighted().not(this.tdActive());

        if (cells.length) {
          loc = { //tr/td column and row index
            first:this.getTdLocation(cells.first()),
            last:this.getTdLocation(cells.last())
          };

          newVal = label(loc);

          if (!notSetFormula) {
            this.formula().val(newVal);
            this.inPlaceEdit().val(newVal);
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
     * @param {Number} _s spreadsheet index
     * @param {Number} r row index
     * @param {Number} c column index
     * @returns {HTMLElement|null}
     */
    getTd:function (_s, r, c) {
      if (_s < 0) {
        _s = this.i;
      }
      var cell = this.settings.loader.jitCell(_s, r, c);

      if (cell === null) return cell;

      return cell.td || null;
    },

    locationFromTd: function(td) {
      var scrolledArea = this.pane().actionUI.scrolledArea;
      return {
        row: scrolledArea.row + td.parentNode.rowIndex,
        col: scrolledArea.col + td.cellIndex
      };
    },
    /**
     * Gets the td row and column index as an object {row, col}
     * @param {HTMLTableCellElement} td
     * @returns {Object}
     */
    getTdLocation:function (td) {
      var result = {col:0, row:0},
          rowOffset = 0,
          pane = this.pane();

      //rowOffset = pane.actionUI.yDetacher.aboveIndex;

      if (td === u || td === null) return result;

      if (td.parentNode === u || (td.parentNode.rowIndex + rowOffset) < 0) {
        return result;
      }

      return {
        col: td.cellIndex === 0 ? 0 : td.cellIndex-1,
        row: td.parentNode.rowIndex === 0 ? 0 + rowOffset : td.parentNode.rowIndex+ rowOffset-1
      };
    },

    /**
     * Changed tracker per sheet
     */
    changed:[],

    /**
     * Changed = needs to be calculated
     * @param tableIndex
     */
    isChanged:function (tableIndex) {
      return this.changed[tableIndex || this.i];
    },

    /**
     * Sets changed
     * @param {Boolean} changed changed state
     */
    setChanged:function (changed) {
      this.changed[this.i] = changed;
    },

    /**
     * Dirty = changed needs saved
     */
    isDirty:false,

    /**
     * Dirty manager
     * @param dirty
     */
    setDirty:function (dirty) {
      this.dirty = dirty;
      return this;
    },

    /**
     * @param v
     */
    appendToFormula:function (v) {
      var formula = this.formula(),
          value = formula.val();

      if (value.charAt(0) !== '=') {
        value = '=' + value;
      }

      formula.val(value + v);
    },

    /**
     * get cols associated with a sheet/table within an instance
     * @param {jQuery|HTMLElement} [table]
     * @returns {HTMLCollection|Array}
     */
    cols:function (table) {
      table = table || this.table()[0];

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
     */
    tables:function (tables, useActualTables) {
      tables = tables || this.loader.tables;
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
        table = (useActualTables ? document.body.removeChild(tables[i]) : tables[i].cloneNode(true));

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

      return clonedTables;
    },

    /**
     * get col associated with a sheet/table within an instance
     * @param {Number} i Index of column
     * @returns {Element}
     */
    col:function (i) {
      return this.pane().actionUI.megaTable.col(i);
    },

    /**
     * get cells of a table row
     * @param {HTMLElement} [table]
     * @param {Number} [i] Index of row, default is last
     * @returns {HTMLCollection|Array}
     */
    rowTds:function (table, i) {
      table = table || this.table();

      var rows = this.rows(table);

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
     */
    rows:function (table) {
      table = table || this.table()[0];
      if (table === u) return []; //table
      if (table.tBody === u) return []; //tBody
      if (table.tBody.children === u) return []; //tr

      return table.tBody.children;
    },

    /**
     * Get all the td objects that are currently highlighted
     * @param {Boolean} [cells] will return cell objects rather than HTMLElement
     * @returns {jQuery|HTMLElement|Array}
     */
    highlighted:function(cells) {
      var highlighted = this.highlighter.last || $([]),
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
            obj.unshift(cells ? highlighted[i]._cell : highlighted[i]);
          } while (i-- > 0);
          break;
        case 'TR':
          i = highlighted.length - 1;
          do {
            if (highlighted[i].tds) {
              obj = obj.concat(cells ? highlighted[i]._cells : highlighted[i].tds);
            }
          } while(i-- > 0);
          break;
        case 'COL':
          highlighted = highlighted.filter('col');
          i = highlighted.length - 1;
          do {
            if (highlighted[i].tds) {
              obj = obj.concat(cells ? highlighted[i]._cells : highlighted[i].tds);
            }
          } while(i-- > 0);
          break;
        case 'TABLE':
          obj = (cells ? tag._cells : tag.tds);
          break;
      }

      return cells ? obj : $(obj);
    },

    /**
     *
     * @param {Number} [i]
     * @returns {Object} {cols, rows}
     */
    sheetSize:function (i) {
      if (i === undefined) {
        i = this.i;
      }

      return this.settings.loader.size(i);
    },

    sortVerticalSelectAscending:function() {
      if (confirm('Do you want to extend your selection?')) {
        this.sortVertical(); return true;
      } else {
        this.sortVerticalSingle(false); return true
      }
    },

    sortVerticalSelectDescending:function() {
      if (confirm('Do you want to extend your selection?')) {
        this.sortVertical(); return false;
      } else {
        this.sortVerticalSingle(true); return false
      }
    },

    /**
     * Sorts what is highlighted vertically, and updates accordingly
     * @param {Boolean} [reversed]
     */
    sortVertical:function (reversed) {

      var selected = this.highlighted(true),
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
        td = cell.td;
        if(!isNaN(cell.value)){
          val = (new Number(cell.value.valueOf()));
        }
        else{
          isNum = false;
          val = (new String(cell.value.valueOf()));
        }
        val.loc = this.getTdLocation(td);
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

      this.undo.createCells(selected);
      while(offset = vals.length)							{
        val = vals.pop();
        row = this.spreadsheets[this.i].splice(val.row.rowIndex, 1);
        cell = val.cell;
        cell.value = val.valueOf();
        val.row.parentNode.removeChild(val.row);
        trSibling.after(val.row);
        val.row.children[0].innerHTML = trSibling[0].rowIndex + offset;
        this.spreadsheets[this.i].splice(trSibling[0].rowIndex + 1, 0, row[0]);
        this.track.call(cell, true);
      }

      this.undo.createCells(selected);
    },

    /**
     * Sorts a single column
     * @param reversed
     */
    sortVerticalSingle: function (reversed) {
      var selected = this.highlighted(true),
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
        cell.updateValue();
      }
    },

    sortHorizontalSelectAscending:function() {
      if (confirm('Do you want to extend your selection?')) {
        this.sortHorizontal(); return true;
      } else {
        this.sortHorizontalSingle(false); return true;
      }
    },

    sortHorizontalSelectDescending:function() {
      if (confirm('Do you want to extend your selection?')) {
        this.sortHorizontal(); return false;
      } else {
        this.sortHorizontalSingle(true); return false;
      }
    },

    /**
     * Sorts what is highlighted horizontally, and updates accordingly
     * @param {Boolean} [reversed]
     */
    sortHorizontal:function (reversed) {

      var selected = this.highlighted(true),
          pane = this.pane(),
          table = pane.table,
          tdSibling = selected[0].td,
          cell = tdSibling._cell,
          tdSiblingIndex = cell.cellIndex,
          colGroup = table.colGroup,
          size = this.sheetSize().rows,
          length = selected.length,
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
        td = cell.td;
        if(!isNaN(cell.value)){
          val = new Number(cell.value.valueOf());
        }
        else{
          isNum = false;
          val = new String(cell.value.valueOf());
        }
        val.tds = [];
        val.loc = this.getTdLocation(td);
        val.tr = td.parentNode;
        val.td = td;
        val.cell = cell;
        while(x <= size){
          val.tds.push(this.pane().table.children[1].children[x].children[td.cellIndex]);
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

      this.undo.createCells(selected);
      while(vals.length){
        val = vals.pop();
        while(val.tds.length > 1){
          td = val.tds.pop();
          tr = td.parentNode;
          cell = this.spreadsheets[this.i][tr.rowIndex].splice(td.cellIndex, 1);
          tr.insertBefore(td, tr.children[tdSiblingIndex]);
          td.col = colGroup.children[vals.length + td.cellIndex - 1];
          td.barTop = td.col.bar;
          cell.value = td._cell.value;
          this.spreadsheets[this.i][tr.rowIndex].splice(td.cellIndex, 0, cell[0]);
          this.resolveCell(cell);
        }
      }
      this.undo.createCells(selected);
    },

    /**
     * Sorts a single row
     * @param reversed
     */
    sortHorizontalSingle: function (reversed) {
      var selected = this.highlighted(true),
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
        cell.updateValue();
      }
    },

    /**
     *
     * @param {HTMLElement} [table]
     * @returns {Object} {cols, rows}
     */
    tableSize:function (table, getActualSize) {
      var tBody,
          tBodyChildren,
          tr,
          trChildren,
          td,
          pane = table.pane,
          row = 0,
          column = 0,
          rowOffset = 0;

      //rowOffset = pane.actionUI.yDetacher.aboveIndex;

      table = table || this.table()[0];
      //table / tBody / tr / td

      if ((tBody = table.tBody) !== u
          && (tBodyChildren = tBody.children) !== u
          && (tr = tBodyChildren[tBodyChildren.length - 1]) !== u
          && (trChildren = tr.children) !== u
          && (td = trChildren[trChildren.length - 1]) !== u
      ) {
        if (getActualSize === true) {
          row = tr.rowIndex;
        } else {
          row = tr.rowIndex + rowOffset;
        }

        column = td.cellIndex;
      } else {
        return {};
      }

      return {
        cols: column,
        rows: row
      };
    },

    /**
     * Toggles from editable to viewable and back
     * @param replacementTables
     */
    toggleState:function (replacementTables) {
      var settings = this.settings;
      if (settings.allowToggleState) {
        var tables = replacementTables || this.tables();
        if (settings.editable) {
          this.evt.cellEditAbandon();
          this.trigger('sheetSave', [tables]);
        }
        this.setDirty(false);
        this.setChanged(true);
        settings.editable = !settings.editable;

        this.kill();

        settings.element
            .html(tables)
            .sheet(settings);
        settings = null;
      }
    },

    /**
     * Turns a cell into a formula variable so it can be accessed by a name
     * @param ref
     */
    setCellRef:function (ref) {
      function setRef(ref) {
        if (ref) { //TODO: need to update value when cell is updated
          self.settings.formulaVariables[ref] = cell.updateValue();
        }
      }

      var self = this,
          td = this.tdActive(),
          cell = td._cell;

      if (ref) {
        setRef(ref);
      } else {
        this.settings.prompt(
            this.msg.setCellRef,
            setRef
        );
      }
    },

    /**
     * @type Function
     */
    parseFormula: null,

    /**
     *
     * @param {Number} [i]
     * @param {Boolean} [skipStyles]
     */
    print: function(i, skipStyles) {
      i = i || this.i;

      var pWin = window.open(),
          pDoc;

      //popup blockers
      if (pWin !== u) {
        pDoc = pWin.document;
        pDoc.write('<html>\
    <head id="head"></head>\
    <body>\
      <div id="entry" class="' + WickedGrid.cl.element + '" style="overflow: show;">\
      </div>\
    </body>\
  </html>');

        if (skipStyles !== true) {
          $(pDoc.getElementById('head')).append($('style,link').clone());
        }

        $(pDoc.getElementById('entry')).append(this.pane().cloneNode(true));
        pDoc.close();
        pWin.focus();
        pWin.print();
      }
    },

    /**
     * Used to load in all the required plugins and dependencies needed by sheet in it's default directories.
     * @param {String} [path] path
     * @param {Object} settings
     *
     */
    preLoad:function (path, settings) {
      path = path || '';
      settings = extend({
        skip: ['globalizeCultures'],
        thirdPartyDirectory: 'bower_components/'
      }, settings);

      var injectionParent = $('script:first'),
          write = function () {
            var script;
            if (this.script !== undefined) {
              script = document.createElement('script');
              script.src = path + (this.thirdParty ? settings.thirdPartyDirectory : '') + this.script;
              injectionParent.after(script);
            }
            if (this.css !== undefined) {
              script = document.createElement('link');
              script.rel = 'stylesheet';
              script.type = 'text/css';
              script.href = path + (this.thirdParty ? settings.thirdPartyDirectory : '') + this.css;
              injectionParent.after(script);
            }
          };

      $.each(this.dependencies, write);

      $.each(this.optional, write);
    },

    /**
     * Creates an HTMLElement from a size given
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
      var table = document.createElement('table'),
          colGroup = document.createElement('colgroup'),
          tBody = document.createElement('tbody'),
          colStyle = 'width:' + columnWidth + 'px;',
          rowStyle = 'height:' + rowHeight + 'px;',
          tr,
          col,
          i,
          j;

      i = size.cols;

      do {
        col = document.createElement('col');
        col.setAttribute('style', colStyle);
        colGroup.appendChild(col);
      } while (i-- > 1);

      i = size.rows;
      do {
        tr = document.createElement('tr');
        tr.setAttribute('style', rowStyle);

        j = size.cols;
        do {
          tr.appendChild(document.createElement('td'));
        } while (j-- > 1);

        tBody.appendChild(tr);
      } while (i-- > 1);

      table.appendChild(colGroup);
      table.appendChild(tBody);

      return table;
    },

    /**
     * Destroy all spreadsheets loaded
     */
    killAll:function () {
      var instances = WickedGrid.instances;
      if (instances) {
        for (var i = 0; i< instances.length; i++) {
          if (instances[i] && instances[i].kill) {
            instances[i].kill();
          }
        }
        WickedGrid.instances = [];
      }
    },

    /**
     * Make 2 or more spreadsheets scroll to together, useful for history viewing or spreadsheet comparison
     * @param {Number} I instance index
     */
    scrollLocker:function (I) {
      var instances = WickedGrid.instances;
      instances[I].panes().each(function (i) {
        var me;
        $(me = this.scrollUI).scroll(function (e) {
          var j = instances.length - 1,
              scrollUI;
          if (j > -1) {
            do {
              scrollUI = instances[j].controls.enclosures[i].scrollUI;

              if (this !== scrollUI) {
                scrollUI.scrollLeft = me.scrollLeft;
                scrollUI.scrollTop = me.scrollTop;
              }
            } while (j--);
          }
        });
      });
    },

    /**
     * Make 2 or more spreadsheets switch together, just like clicking their tabs at the same time
     * @param {Number} I instance index
     */
    switchSheetLocker:function (I) {
      WickedGrid.instance.forEach(function () {
        this.$element.bind('sheetSwitch', function (e, wickedGrid, i) {
          WickedGrid.instance.forEach(function(w) {
            w.setActiveSheet(i);
          });
        });
      });
    },

    /**
     * Get current instance count
     * @returns {Number}
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
    formulaParser: function() {
      var callStack = WickedGrid.calcStack,
          formulaParser;
      //we prevent parsers from overwriting each other
      if (callStack > -1) {
        //cut down on un-needed parser creation
        formulaParser = WickedGrid.spareFormulaParsers[callStack];
        if (formulaParser === undefined) {
          formulaParser = WickedGrid.spareFormulaParsers[callStack] = Formula();
        }
      }

      //use the sheet's parser if there aren't many calls in the callStack
      else {
        formulaParser = WickedGrid.defaultFormulaParser;
      }

      formulaParser.yy.types = [];

      return formulaParser;
    },

    parseFormulaSync: function(formula, callback) {
      if (WickedGrid.defaultFormulaParser === null) {
        WickedGrid.defaultFormulaParser = Formula();
      }

      var formulaParser = this.formulaParser();
      callback(formulaParser.parse(formula));
    },

    parseFormulaAsync: function(formula, callback) {
      var thread = WickedGrid.thread();

      if (thread.busy) {
        thread.stash.push(function() {
          thread.busy = true;
          thread.parseFormula(formula, function(parsedFormula) {
            thread.busy = false;
            callback(parsedFormula);
            if (thread.stash.length > 0) {
              thread.stash.shift()();
            }
          });
        });
      } else {
        thread.busy = true;
        thread.parseFormula(formula, function(parsedFormula) {
          thread.busy = false;
          callback(parsedFormula);
          if (thread.stash.length > 0) {
            thread.stash.shift()();
          }
        });
      }
    }
  };

  'CODE_HERE'

  return WickedGrid;
})();

if (typeof module !== 'undefined') module.exports = WickedGrid;
