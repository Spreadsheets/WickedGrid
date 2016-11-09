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
            $td._cell.removeClass(removeClass);
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

  /**
 */
WickedGrid.event = {};
/**
 */
WickedGrid.loader = {};
/**
 */
WickedGrid.plugin = {};
/**
 */
WickedGrid.calcStack = 0;
/**
 * Array of instances of WickedGrid
 */
WickedGrid.instances = [];
/**
 */
WickedGrid.defaultTheme = 0;
/**
 */
WickedGrid.themeRollerTheme = 0;
/**
 */
WickedGrid.bootstrapTheme = 1;
/**
 */
WickedGrid.customTheme = 2;

/**
 */
WickedGrid.excelSelectModel = 0;
/**
 */
WickedGrid.googleDriveSelectModel = 1;
/**
 */
WickedGrid.openOfficeSelectModel = 2;

/**
 */
WickedGrid.defaultColumnWidth = 120;
/**
 */
WickedGrid.defaultRowHeight = 20;

/**
 */
WickedGrid.domRows = 40;
/**
 */
WickedGrid.domColumns = 35;

/**
 */
WickedGrid.formulaParserUrl = '../parser/formula/formula.js';
/**
 */
WickedGrid.threadScopeUrl = '../Sheet/threadScope.js';
/**
 */
WickedGrid.defaultFormulaParser = null;
/**
 */
WickedGrid.spareFormulaParsers = [];
/**
 */
WickedGrid.cornerEntity = 'corner';
/**
 */
WickedGrid.columnEntity = 'column';
/**
 */
WickedGrid.rowEntity = 'row';
/**
 */
WickedGrid.events = [
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
];

/**
 * Messages for user interface
 * @type {Object}
 */
WickedGrid.msg = {
  addRowMulti:'How many rows would you like to add?',
  addColumnMulti:'How many columns would you like to add?',
  cellFind:'What are you looking for in this spreadsheet?',
  cellNoFind:'No results found.',
  dragToFreezeCol:'Drag to freeze column',
  dragToFreezeRow:'Drag to freeze row',
  addSheet:'Add a spreadsheet',
  openSheet:'Are you sure you want to open a different sheet?  All unsaved changes will be lost.',
  toggleHideRow:'No row selected.',
  toggleHideColumn:'No column selected.',
  loopDetected:'Loop Detected',
  newSheetTitle:'What would you like the sheet\'s title to be?',
  notFoundColumn:'Column not found',
  notFoundRow:'Row not found',
  notFoundSheet:'Sheet not found',
  setCellRef:'Enter the name you would like to reference the cell by.',
  sheetTitleDefault:'Spreadsheet {index}',
  cellLoading: 'Loading...'
};
/**
 * Contains the dependencies if you use $.sheet.preLoad();
 */
WickedGrid.dependencies = {
  coreCss:{css:'wickedgrid.css'},

  jQueryUI:{script:'jquery-ui/jquery-ui.min.js', thirdParty:true},
  jQueryUIThemeRoller:{css:'jquery-ui/themes/smoothness/jquery-ui.min.css', thirdParty:true},

  globalize:{script:'globalize/lib/globalize.js', thirdParty:true},

  nearest:{script:'jquery-nearest/src/jquery.nearest.min.js', thirdParty:true},

  mousewheel:{script:'MouseWheel/MouseWheel.js', thirdParty:true},

  operative:{script:'operative/dist/operative.js', thirdParty:true},

  megatable:{script:'megaTable.js/megatable.js', thirdParty:true},

  infiniscroll:{script:'infiniscroll.js/infinitescroll.js', thirdParty:true}
};

/**
 * Contains the optional plugins if you use $.sheet.preLoad();
 */
WickedGrid.optional = {
  //native
  advancedFn:{script:'src/Plugin/advanced.js'},
  financeFn:{script:'src/Plugin/finance.js'},

  //3rd party
  colorPicker:{
    css:'really-simple-color-picker/css/colorPicker.css',
        script:'really-simple-color-picker/js/jquery.colorPicker.min.js',
        thirdParty:true
  },

  elastic:{script:'jquery-elastic/jquery.elastic.source.js', thirdParty:true},

  globalizeCultures:{script:'globalize/lib/cultures/globalize.cultures.js', thirdParty:true},

  raphael:{script:'raphael/raphael.js', thirdParty:true},
  gRaphael:{script:'graphael/g.raphael.js', thirdParty:true},
  gRaphaelBar:{script:'graphael/g.bar.js', thirdParty:true},
  gRaphaelDot:{script:'graphael/g.dot.js', thirdParty:true},
  gRaphaelLine:{script:'graphael/g.line.js', thirdParty:true},
  gRaphaelPie:{script:'graphael/g.pie.js', thirdParty:true},

  thaw: {script:'thaw.js/thaw.js', thirdParty:true},

  undoManager:{script: 'Javascript-Undo-Manager/lib/undomanager.js', thirdParty:true},

  zeroClipboard:{script:'zeroclipboard/dist/ZeroClipboard.min.js', thirdParty:true}
};

/**
 * Created the autoFiller object
 * @returns {*|jQuery|null}.controlFactory
 * @param {WickedGrid} wickedGrid
 * @param {HTMLElement} pane
 */
WickedGrid.autoFiller = function(wickedGrid, pane) {
  if (!wickedGrid.settings.autoFiller) return false;

  var autoFiller = document.createElement('div'),
      handle = document.createElement('div'),
      cover = document.createElement('div');

  autoFiller.i = wickedGrid.i;

  autoFiller.className = WickedGrid.cl.autoFiller + ' ' + wickedGrid.theme.autoFiller;
  handle.className = WickedGrid.cl.autoFillerHandle;
  cover.className = WickedGrid.cl.autoFillerCover;

  autoFiller.onmousedown = function () {
    var td = this.tdActive();
    if (td) {
      var loc = wickedGrid.getTdLocation(td);
      wickedGrid.cellSetActive(td, loc, true, WickedGrid.autoFillerNotGroup, function () {
        var highlighted = wickedGrid.highlighted(),
            hLoc = wickedGrid.getTdLocation(highlighted.last());
        wickedGrid.fillUpOrDown(hLoc.row < loc.row || hLoc.col < loc.col);
        wickedGrid.autoFillerGoToTd(td);
        wickedGrid.autoFillerNotGroup = false;
      });
    }

    return false;
  };

  pane.autoFiller = wickedGrid.controls.autoFiller[wickedGrid.i] = autoFiller;
  pane.appendChild(autoFiller);
  return true;
};
/**
 * Internal css classes of objects
 * @memberof WickedGrid
 * @type {Object}
 */
WickedGrid.cl = {
  list: function(list) {
    var result = [],
        self = WickedGrid.cl;
    list.forEach(function(prop) {
      if (!self.hasOwnProperty(prop)) throw new Error('prop ' + prop + ' not found on WickedGrid.cl');
      result.push(self[prop]);
    });

    return result.join(' ');
  },
  autoFiller: 'wg-auto-filler',
  autoFillerHandle: 'wg-auto-filler-handle',
  autoFillerCover: 'wg-auto-filler-cover',
  corner: 'wg-corner',
  barController: 'wg-bar-controller',
  barControllerChild: 'wg-bar-controller-child',
  barHelper: 'wg-bar-helper',
  row: 'wg-row',
  rowFreezeHandle: 'wg-row-freeze-handle',
  column: 'wg-column',
  columnHelper: 'wg-column-helper',
  columnFocus: 'wg-column-focus',
  columnButton: 'wg-column-button',
  columnFreezeHandle: 'wg-column-freeze-handle',
  chart: 'wg-chart',
  formula: 'wg-formula',
  formulaParent: 'wg-formula-parent',
  header: 'wg-header',
  fullScreen: 'wg-full-screen',
  inPlaceEdit: 'wg-in-place-edit',
  headerMenu: 'wg-header-menu',
  menuFixed: 'wg-menu-fixed',
  element: 'wg-element',
  scroll: 'wg-scroll',
  sheetAdder: 'wg-sheet-adder',
  table: 'wg-table',
  label: 'wg-loc',
  pane: 'wg-edit-pane',
  tab: 'wg-tab',
  tabContainer: 'wg-tab-container',
  tabContainerScrollable: 'wg-tab-container-scrollable',
  menu: 'wg-menu',
  menuButton: 'wg-menu-button',
  title: 'wg-title',
  enclosure: 'wg-enclosure',
  ui: 'wg-ui'
};
WickedGrid.ColumnMenu = (function() {
  function ColumnMenu(wickedGrid, menu) {
    this.wickedGrid = wickedGrid;
    this.menu = menu;
    this.index = -1;
    this.column = null;

    var self = this,
        barHelper = this.barHelper = widget(
          '<div class="' + wickedGrid.cl.barHelper + ' ' + wickedGrid.cl.columnHelper + '">\
            <span class="' + wickedGrid.cl.columnButton + ' ' + wickedGrid.theme.columnMenu + ' ' + wickedGrid.theme.columnMenuIcon + '"></span>\
          </div>'
        ),
        button = barHelper.children[0];

    button.onmousedown = function () {
      self.showMenu();
    };
  }

  ColumnMenu.prototype = {
    setColumn: function(column, index) {
      if (this.column !== null) {
        this.column.classList.remove(this.wickedGrid.cl.columnFocus);
      }
      this.hideMenu();
      this.column = column;
      this.index = index;

      return this;
    },
    kill: function() {
      this.hide();
      this.column = null;
      this.index = -1;
      return this;
    },
    show: function() {
      this.wickedGrid.hideMenus();

      this.column.appendChild(this.barHelper);
      this.column.classList.add(this.wickedGrid.cl.columnFocus);

      return this;
    },
    hide: function() {
      if (this.barHelper.parentNode === null) return this;
      this.barHelper.parentNode.removeChild(this.barHelper);
      return this;
    },
    showMenu: function() {
      this.barHelper.appendChild(this.menu);
      return this;
    },
    hideMenu: function() {
      if (this.menu.parentNode === null) return this;
      this.menu.parentNode.removeChild(this.menu);
      return this;
    }
  };
  return ColumnMenu;
})();
WickedGrid.columnResizer = function(wickedGrid, bar) {
  wickedGrid.barTopControls().remove();
  var barController = document.createElement('div'),
      $barController = $(barController)
          .addClass(wickedGrid.cl.barController + ' ' + wickedGrid.theme.barResizer)
          .width(bar.clientWidth)
          .prependTo(bar),
      handle,
      pane = wickedGrid.pane();

  wickedGrid.controls.bar.x.controls[wickedGrid.i] = wickedGrid.barTopControls().add($barController);

  wickedGrid.resizableCells($barController, {
    handles:'e',
    start:function (e, ui) {
      wickedGrid.autoFillerHide();
      wickedGrid.setBusy(true);
      if (pane.freezeHandleTop) {
        pane.freezeHandleTop.remove();
      }
    },
    resize:function (e, ui) {
      bar.col.style.width = ui.size.width + 'px';

      if (pane.inPlaceEdit) {
        pane.inPlaceEdit.goToTd();
      }
    },
    stop:function (e, ui) {
      wickedGrid.setBusy(false);
      if (pane.inPlaceEdit) {
        pane.inPlaceEdit.goToTd();
      }
      wickedGrid.followMe();
      wickedGrid.setDirty(true);
    },
    minWidth: 32
  });

  handle = barController.children[0];
  handle.style.height = bar.clientHeight + 'px';
};
WickedGrid.customTab = function(wickedGrid, title) {
  var tab = document.createElement('span'),
      $tab = $(tab).appendTo(wickedGrid.tabContainer());

  tab.setAttribute('class', wickedGrid.cl.tab + ' ' + wickedGrid.theme.tab);
  tab.innerHTML = title;

  return $tab;
};
WickedGrid.defaults = (function() {
  var defaults = {
    editable: true,
    editableNames: true,
    barMenus: true,
    freezableCells: true,
    allowToggleState: true,
    headerMenu: null,
    newColumnWidth: 120,
    title: null,
    calcOff: false,
    lockFormulas: false,
    parent: null,
    colMargin: 20,
    boxModelCorrection: 2,
    formulaFunctions: {},
    formulaVariables: {},
    cellSelectModel: WickedGrid.excelSelectModel,
    autoAddCells: true,
    resizableCells: true,
    resizableSheet: true,
    autoFiller: true,
    error: function (e) {
      return e.error;
    },
    endOfNumber: false,
    frozenAt: [],
    columnMenuButtons: null,
    columnContextMenuButtons: {
      'Insert column after': function () {
        this.addColumn(false, this.colLast);
        return false;
      },
      'Insert column before': function () {
        this.addColumn(true, this.colLast);
        return false;
      },
      'Add column to end': function () {
        this.addColumn(true);
        return false;
      },
      'Delete this column': function () {
        this.deleteColumn();
        return false;
      },
      'Hide column': function () {
        this.toggleHideColumn(this.colLast);
        return false;
      },
      'Show all columns': function () {
        this.columnShowAll();
      },
      'Toggle freeze columns to here': function () {
        var col = this.getTdLocation(this.tdActive()).col,
            actionUI = this.pane().actionUI;
        actionUI.frozenAt.col = (actionUI.frozenAt.col == col ? 0 : col);
      }
    },
    rowContextMenuButtons: {
      'Insert row after': function () {
        this.addRow(true, this.rowLast);
        return false;
      },
      'Insert row before': function () {
        this.addRow(false, this.rowLast);
        return false;
      },
      'Add row to end': function () {
        this.addRow(true);
        return false;
      },
      'Delete this row': function () {
        this.deleteRow();
        return false;
      },
      'Hide row': function () {
        this.toggleHideRow(this.rowLast);
        return false;
      },
      'Show all rows': function () {
        this.rowShowAll();
      },
      'Toggle freeze rows to here': function () {
        var row = this.getTdLocation(this.tdActive()).row,
            actionUI = this.pane().actionUI;
        actionUI.frozenAt.row = (actionUI.frozenAt.row == row ? 0 : row);
      }
    },
    cellContextMenuButtons: {
      /*'Copy': false,
       'Cut': false,
       'line1': 'line',*/
      'Insert row after': function () {
        this.addRow(true, this.rowLast);
        return false;
      },
      'Insert row before': function () {
        this.addRow(false, this.rowLast);
        return false;
      },
      'Add row to end': function () {
        this.addRow(true);
        return false;
      },
      'Delete this row': function () {
        this.deleteRow();
        return false;
      },
      'line2': 'line',
      'Insert column after': function () {
        this.addColumn(true, this.colLast);
        return false;
      },
      'Insert column before': function () {
        this.addColumn(false, this.colLast);
        return false;
      },
      'Add column to end': function () {
        this.addColumn(true);
        return false;
      },
      'Delete this column': function () {
        this.deleteColumn();
        return false;
      },
      'line3': 'line',
      'Add spreadsheet': function () {
        this.addSheet();
      },
      'Delete spreadsheet': function () {
        this.deleteSheet();
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
    },
    loader: null,
    useStack: true,
    useMultiThreads: true
  };

  defaults.columnMenuButtons = defaults.columnContextMenuButtons;

  return defaults;
})();
// The viewing console for spreadsheet
WickedGrid.enclosure = function(wickedGrid) {
  var enclosure = document.createElement('div'),
      $enclosure = $(enclosure),
      actionUI = new WickedGrid.ActionUI(wickedGrid, enclosure, this.cl.scroll, wickedGrid.settings.frozenAt[wickedGrid.i]),
      pane = actionUI.pane;

  pane.className = WickedGrid.cl.pane + ' ' + wickedGrid.theme.pane;
  enclosure.className = WickedGrid.cl.enclosure;

  enclosure.pane = pane;

  pane.enclosure = enclosure;
  pane.$enclosure = $enclosure;

  wickedGrid.controls.pane[wickedGrid.i] = pane;
  wickedGrid.controls.panes = wickedGrid.panes().add(pane);
  wickedGrid.controls.enclosures[wickedGrid.i] = enclosure;

  return enclosure;
};
//Creates the control/container for everything above the spreadsheet, removes them if they already exist.controlFactory
WickedGrid.formulaEditor = function(wickedGrid, header) {
  var label = document.createElement('td');
  label.className = wickedGrid.cl.label + ' ' + wickedGrid.theme.control;
  wickedGrid.controls.label = $(label);
  var formula = document.createElement('textarea');
  formula.className = wickedGrid.cl.formula + ' ' + wickedGrid.theme.controlTextBox;
  formula.onkeydown = function(e) {
    return wickedGrid.formulaEvents.keydown(e);
  };
  formula.onkeyup = function () {
    wickedGrid.inPlaceEdit().value = formula.value;
  };
  formula.onchange = function () {
    wickedGrid.inPlaceEdit().value = formula.value;
  };
  formula.onpaste = function(e) {
    return wickedGrid.pasteOverCells(e);
  };
  formula.onfocus = function () {
    wickedGrid.setNav(false);
  };
  formula.onfocusout = function () {
    wickedGrid.setNav(true);
  };
  formula.onblur = function () {
    wickedGrid.setNav(true);
  };
  wickedGrid.controls.formula = $(formula);

  // resizable formula area - a bit hard to grab the handle but is there!
  var formulaResize = document.createElement('span');
  formulaResize.appendChild(formula);

  var secondRow = document.createElement('table');
  var secondRowTr = document.createElement('tr');
  secondRow.appendChild(secondRowTr);

  header.appendChild(secondRow);

  var formulaParent = document.createElement('td');
  formulaParent.className = wickedGrid.cl.formulaParent;
  formulaParent.appendChild(formulaResize);
  secondRowTr.appendChild(label);
  secondRowTr.appendChild(formulaParent);

  //spacer
  secondRowTr.appendChild(document.createElement('td'));

  wickedGrid.resizableSheet($(formulaResize), {
    minHeight:wickedGrid.controls.formula.height(),
    maxHeight:78,
    handles:'s',
    resize:function (e, ui) {
      wickedGrid.controls.formula.height(ui.size.height);
    },
    stop: function() {
      wickedGrid.sheetSyncSize();
    }
  });

  var instances = WickedGrid.instances;
  for(var i = 0; i < instances.length; i++) {
    (instances || {}).nav = false;
  }

  wickedGrid.setNav(true);

  $(document).keydown(function(e) {
    return wickedGrid.documentEvents.keydown(e);
  });

  return formula;
};
//Creates the control/container for everything above the spreadsheet, removes them if they already exist.controlFactory
WickedGrid.header = function(wickedGrid) {
  wickedGrid.header().remove();
  wickedGrid.sheetAdder().remove();
  wickedGrid.tabContainer().remove();

  var s = wickedGrid.settings,
      header = document.createElement('div'),
      title = document.createElement('h4'),
      menu,
      $menu;

  header.className = wickedGrid.cl.header + ' ' + wickedGrid.theme.control;

  wickedGrid.controls.header = $(header);

  if (s.title) {
    if ($.isFunction(s.title)) {
      s.title = wickedGrid.title(I);
    }

    title.className = wickedGrid.cl.title;
    wickedGrid.controls.title = $(title).html(s.title)
  } else {
    title.style.display = 'none';
  }

  header.appendChild(title);

  if (wickedGrid.isSheetEditable()) {
    if (s.headerMenu) {
      menu = document.createElement('div');
      $menu = $(menu);
      menu.className = wickedGrid.cl.headerMenu + ' ' + wickedGrid.cl.menuFixed + ' ' + wickedGrid.theme.menuFixed + ' ' + wickedGrid.cl.menu;
      header.appendChild(menu);

      wickedGrid.controls.headerMenu[wickedGrid.i] = $menu
          .append(s.headerMenu(wickedGrid))
          .children()
          .addClass(wickedGrid.theme.menuFixed);

      $menu.find('img').load(function () {
        wickedGrid.sheetSyncSize();
      });
    }

    WickedGrid.formulaEditor(wickedGrid, header);
  }

  return header;
};
/**
 * Creates a textarea for a user to put a value in that floats on top of the current selected cell
 * @param {WickedGrid} wickedGrid
 * @param {jQuery|HTMLElement} td the td to be edited
 * @param {Boolean} selected selects the text in the inline editor.controlFactory
 */
WickedGrid.inPlaceEdit = function(wickedGrid, td, selected) {
  if (wickedGrid.cellActive()) {
    td = td || wickedGrid.cellActive().td || null;
  } else {
    td = td || null;
  }

  if (td === null) {
    td = wickedGrid.rowTds(null, 1)[1];
    wickedGrid.cellEdit(td._cell);
  }

  if (td === null) return;

  (wickedGrid.inPlaceEdit().destroy || empty)();

  var formula = wickedGrid.formula(),
      val = formula.val(),
      textarea,
      $textarea,
      pane = wickedGrid.pane();

  textarea = document.createElement('textarea');
  $textarea = $(textarea);
  pane.inPlaceEdit = textarea;
  textarea.i = wickedGrid.i;
  textarea.className = wickedGrid.cl.inPlaceEdit + ' ' + wickedGrid.theme.inPlaceEdit;
  textarea.td = td;
  //td / tr / tbody / table
  textarea.table = td.parentNode.parentNode.parentNode;
  textarea.goToTd = function() {
    textarea.offset = $(td).position();
    if (!textarea.offset.left && !textarea.offset.right) {
      $(textarea).hide();
    } else {
      textarea.setAttribute('style',
          'left:' + (textarea.offset.left - 1) + 'px;' +
          'top:' + (textarea.offset.top - 1) + 'px;' +
          'width:' + textarea.td.clientWidth + 'px;' +
          'height:' + textarea.td.clientHeight + 'px;' +
          'min-width:' + textarea.td.clientWidth + 'px;' +
          'min-height:' + textarea.td.clientHeight + 'px;');
    }
  };
  textarea.goToTd();
  textarea.onkeydown = function (e) {
    e = e || window.event;
    wickedGrid.trigger('sheetFormulaKeydown', [true]);

    switch (e.keyCode) {
      case key.ENTER:
        return wickedGrid.formulaEvents.keydown(e);
        break;
      case key.TAB:
        return wickedGrid.formulaEvents.keydown(e);
        break;
      case key.ESCAPE:
        wickedGrid.cellEvents.editAbandon();
        return false;
        break;
    }
  };
  textarea.onchange =
  textarea.onkeyup =
      function() { formula[0].value = textarea.value; };

  textarea.onfocus = function () { wickedGrid.setNav(false); };

  textarea.onblur =
  textarea.onfocusout =
      function () { wickedGrid.setNav(true); };

  textarea.onpaste = function(e) {
    wickedGrid.cellEvents.paste(e);
  };

  textarea.destroy = function () {
    pane.inPlaceEdit = null;
    if (wickedGrid.cellLast !== null) {
      wickedGrid.cellLast.isEdit = (textarea.value != val);
    }
    textarea.parentNode.removeChild(textarea);
    wickedGrid.controls.inPlaceEdit[textarea.i] = false;
  };

  pane.appendChild(textarea);

  textarea.onfocus();

  wickedGrid.controls.inPlaceEdit[wickedGrid.i] = textarea;

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

  function enter(e) {
    if (e.shiftKey) {
      return true;
    }
    return wickedGrid.cellSetActiveFromKeyCode(e, true);
  }

  function tab(e) {
    if (e.shiftKey) {
      return true;
    }
    return wickedGrid.cellSetActiveFromKeyCode(e, true);
  }
};
WickedGrid.menu = function(wickedGrid, menuEntities) {
  if (typeof menuEntities === 'undefined') throw new Error('no menuEntities defined');

  var menu = document.createElement('div'),
      hoverClasses = wickedGrid.theme.menuHover.split(' ');

  menu.className = wickedGrid.theme.menu + ' ' + wickedGrid.cl.menu;
  disableSelectionSpecial(menu);

  menu.onmouseleave = function () {
    menu.parentNode.removeChild(menu);
  };
  menu.oncontextmenu = function() {
    return false;
  };
  menu.onscroll = function() {
    return false;
  };

  for (var key in menuEntities) {
    if (menuEntities.hasOwnProperty(key)) {
      (function(key, menuEntity) {
        switch (typeof menuEntity) {
          case 'function':
            var button = document.createElement('div');
            button.className = wickedGrid.cl.menuButton;
            button.textContent = key;
            button.onclick = function (e) {
              menuEntity.call(wickedGrid, e);
              menu.parentNode.removeChild(menu);
              return false;
            };
            if (hoverClasses.length > 0) {
              button.onmouseover = function () {
                for (var i = 0, max = menu.children.length; i < max; i++) {
                  hoverClasses.forEach(function(hoverClass) {
                    menu.children[i].classList.remove(hoverClass);
                  });
                }
                hoverClasses.forEach(function(hoverClass) {
                  button.classList.add(hoverClass);
                });
              };
            }
            menu.appendChild(button);
            break;
          case 'string':
              if (menuEntity === 'line') {
                menu.appendChild(document.createElement('hr'));
                break;
              }
          default:
            throw new Error('Unknown menu type');
        }
      })(key, menuEntities[key]);
    }
  }

  return menu;
};
WickedGrid.rowResizer = function(wickedGrid, bar, index, pane) {
  wickedGrid.barLeftControls().remove();
  var barRectangle = bar.getBoundingClientRect(),
      barOffsetTop = barRectangle.top + document.body.scrollTop,
      barOffsetLeft = barRectangle.left + document.body.scrollLeft,
      barController = document.createElement('div'),
      $barController = $(barController)
          .addClass(wickedGrid.cl.barController + ' ' + wickedGrid.theme.barResizer)
          .offset({
            top: barOffsetTop,
            left: barOffsetLeft
          })
          .prependTo(bar),
      parent = bar.parentNode,
      child = document.createElement('div'),
      $child = $(child)
          .addClass(wickedGrid.cl.barControllerChild)
          .height(bar.clientHeight)
          .prependTo($barController),
      handle;

  wickedGrid.controls.bar.y.controls[wickedGrid.i] = wickedGrid.barLeftControls().add($barController);

  wickedGrid.resizableCells($child, {
    handles:'s',
    start:function () {
      wickedGrid.autoFillerHide();
      wickedGrid.setBusy(true);
      if (pane.freezeHandleLeft) {
        pane.freezeHandleLeft.remove();
      }
    },
    resize:function (e, ui) {
      barController.style.height
          = bar.style.height
          = parent.style.height
          = ui.size.height + 'px';

      if (pane.inPlaceEdit) {
        pane.inPlaceEdit.goToTd();
      }
    },
    stop:function (e, ui) {
      wickedGrid.setBusy(false);
      if (pane.inPlaceEdit) {
        pane.inPlaceEdit.goToTd();
      }
      wickedGrid.followMe();
      wickedGrid.setDirty(true);
    },
    minHeight: 15
  });

  handle = child.children[0];
  handle.style.width = bar.offsetWidth + 'px';
};
WickedGrid.sheetUI = function(wickedGrid, ui, i) {
  //TODO: move to SpreadsheetUI
  wickedGrid.i = i;

  //TODO: readOnly from metadata
  //wickedGrid.readOnly[i] = (table.className || '').match(/\breadonly\b/i) != null;

  var enclosure = WickedGrid.enclosure(wickedGrid),
      pane = enclosure.pane,
      $pane = $(pane),
      actionUI = pane.actionUI,
      paneContextmenuEvent = function (e) {
        e = e || window.event;
        var target = e.target,
            parent = target.parentNode;

        if (wickedGrid.isBusy()) {
          return false;
        }

        if (wickedGrid.isCell(e.target)) {
          wickedGrid.cellContextMenu.show(e.pageX, e.pageY);
          return false;
        }

        if (!wickedGrid.isBar(target)) return;

        //corner
        if (target.cellIndex === 0 && parent.rowIndex === 0) return;

        //row
        if (parent.rowIndex === 0) {
          wickedGrid.columnContextMenu.show(e.pageX, e.pageY);
        } else {
          wickedGrid.rowContextMenu.show(e.pageX, e.pageY);
        }

        return false;
      };

  ui.appendChild(enclosure);

  if (wickedGrid.isSheetEditable()) {
    WickedGrid.autoFiller(wickedGrid, pane);
  }

  if (wickedGrid.isSheetEditable()) {
    var formula = wickedGrid.formula(),
        mouseDownEntity = '';

    $pane.mousedown(function (e) {
      wickedGrid.setNav(true);
      if (wickedGrid.isBusy()) {
        return false;
      }

      if (wickedGrid.isCell(e.target)) {
        if (e.button == 2) {
          paneContextmenuEvent.call(this, e);
          wickedGrid.cellEvents.mouseDown(e);
          return true;
        }
        wickedGrid.cellEvents.mouseDown(e);
        return false;
      }

      if (wickedGrid.isBar(e.target)) { //possibly a bar
        if (e.button == 2) {
          paneContextmenuEvent.call(this, e);
        }
        mouseDownEntity = e.target.entity;
        actionUI.selectBar(e.target);
        return false;
      }

      return true;
    });

    pane.onmouseup = function() {
      mouseDownEntity = '';
    };

    pane.onmouseover = function (e) {
      e = e || window.event;
      //This manages bar resize, bar menu, and bar selection
      if (wickedGrid.isBusy()) {
        return false;
      }

      if (!wickedGrid.isBar(e.target)) {
        return false;
      }

      var bar = e.target || e.srcElement,
          index = bar.index,
          entity = bar.entity;

      if (index < 0) {
        return false;
      }


      switch (entity) {
        case WickedGrid.columnEntity:
          if (actionUI.columnCache.selecting && bar === mouseDownEntity) {
            actionUI.columnCache.last = index;
            wickedGrid.cellSetActiveBar(WickedGrid.columnEntity, actionUI.columnCache.first, actionUI.columnCache.last);
          } else {
            WickedGrid.columnResizer(wickedGrid, bar, index, pane);

            if (wickedGrid.isSheetEditable()) {
              WickedGrid.columnFreezer(wickedGrid, index, pane);
              wickedGrid.columnMenu
                  .setColumn(bar)
                  .show(e.pageX, e.pageY);
            }
          }
          break;
        case WickedGrid.rowEntity:
          if (actionUI.rowCache.selecting && bar === mouseDownEntity) {
            actionUI.rowCache.last = index;
            wickedGrid.cellSetActiveBar(WickedGrid.rowEntity, actionUI.rowCache.first, actionUI.rowCache.last);
          } else {
            WickedGrid.rowResizer(wickedGrid, bar, index, pane);

            if (wickedGrid.isSheetEditable()) {
              WickedGrid.rowFreezer(wickedGrid, index, pane);
            }
          }
          break;
      }

      return true;
    };

    pane.ondblclick = function(e) {
      return wickedGrid.cellEvents.dblClick(e);
    };

    pane.oncontextmenu = paneContextmenuEvent;

    $pane
        .disableSelectionSpecial()
        .bind('cellEdit', function(e) {
          if (!e.target._cell) return;
          return wickedGrid.cellEvents.edit(e.target._cell);
        });
  }

  WickedGrid.tab(wickedGrid);

  wickedGrid.setChanged(true);
};
WickedGrid.spreadsheetAdder = function(wickedGrid) {
  var adder = document.createElement('span');
  if (wickedGrid.isSheetEditable()) {
    adder.setAttribute('class', WickedGrid.cl.sheetAdder + ' ' + WickedGrid.cl.tab + ' ' + wickedGrid.theme.tab);
    adder.setAttribute('title', WickedGrid.msg.addSheet);
    adder.innerHTML = '+';
    adder.onmousedown = function () {
      wickedGrid.addSheet();

      return false;
    };
    adder.i = -1;
  }

  wickedGrid.controls.sheetAdder = $(adder);

  return adder;
};
WickedGrid.tab = function(wickedGrid) {
  var tab = document.createElement('span'),
      $tab = wickedGrid.controls.tab[wickedGrid.i] = $(tab).appendTo(wickedGrid.tabContainer());

  tab.setAttribute('class', WickedGrid.cl.tab + ' ' + wickedGrid.theme.tab);
  wickedGrid.sheetTab(true, function(sheetTitle) {
    tab.innerHTML = sheetTitle;
  });

  tab.i = wickedGrid.i;
  wickedGrid.controls.tabs = wickedGrid.tabs().add($tab);

  return tab;
};
//Creates the tab interface
WickedGrid.tabs = function(wickedGrid) {
  var tabContainer = document.createElement('span'),
      $tabContainer = $(tabContainer),
      startPosition;
  wickedGrid.controls.tabContainer = $tabContainer;
  tabContainer.setAttribute('class', WickedGrid.cl.tabContainer);

  tabContainer.onmousedown = function (e) {
    e = e || window.event;

    var i = (e.target || e.srcElement).i;
    if (i >= 0) {
      wickedGrid.trigger('sheetSwitch', [i]);
    }
    return false;
  };
  tabContainer.ondblclick = function (e) {
    e = e || window.event;
    var i = (e.target || e.srcElement).i;
    if (i >= 0) {
      wickedGrid.trigger('sheetRename', [i]);
    }
    return false;
  };

  if (wickedGrid.isSheetEditable() && $.fn.sortable) {
    $tabContainer.sortable({
      placeholder: 'ui-state-highlight',
      axis: 'x',
      forceHelperSize: true,
      forcePlaceholderSize: true,
      opacity: 0.6,
      start: function (e, ui) {
        startPosition = ui.item.index();
        wickedGrid.trigger('sheetTabSortStart', [e, ui]);
      },
      update: function (e, ui) {
        wickedGrid.trigger('sheetTabSortUpdate', [e, ui, startPosition]);
      }
    });
  }

  return tabContainer;
};
WickedGrid.thread = (function () {
	var i = 0,
		threads = [];

	function thread() {
		var t = threads[i],
			limit = thread.limit;

		if (t === undefined) {
			t = threads[i] = thread.create();
		} else {
			t = threads[i];
		}

		i++;
		if (i > limit) {
			i = 0;
		}

		return t;
	}

	thread.limit = 10;

	thread.create = function() {
		var t = operative({
			parseFormula: function(formula) {
				formulaParser.yy.types = [];
				return formulaParser.parse(formula);
			},
			streamJSONSheet: function(location, url, callback) {
				Promise
					.all([gR(location + url)])
					.then(function(sheetSets) {
						var json = sheetSets[0],
							sheet = JSON.parse(json),
							rows,
							max,
							i = 0;

						if (sheet.pop !== undefined) {
							sheet = sheet[0];
						}

						rows = sheet.rows;
						max = rows.length;

						sheet.rows = [];
						callback('sheet', JSON.stringify(sheet));

						for (; i < max; i++) {
							callback('row', JSON.stringify(rows[i]));
						}

						callback();

					}, function(err) {
						callback('error', err);
					});
			},
			streamJSONRows: function(location, urls, callback) {
				var i = 0,
					max = urls.length,
					getting = [];

				if (typeof urls === 'string') {
					getting.push(gR(location + urls));
				} else {
					for (; i < max; i++) {
						getting.push(gR(location + urls[i]));
					}
				}

				Promise
					.all(getting)
					.then(function(jsons) {
						var i = 0,
							j,
							row,
							rowSet,
							rowSets = jsons,
							iMax = rowSets.length,
							jMax;

						for(;i<iMax;i++) {
							rowSet = JSON.parse(rowSets[i]);
							jMax = rowSet.length;
							for(j = 0;j<jMax;j++) {
								row = rowSet[j];
								callback('row', JSON.stringify(row));
							}
						}

						callback();
					}, function(err) {
						callback('error', err);
					});
			},
			streamJSONSheetRows: function(location, sheetUrl, rowsUrls, callback) {
				var i = 0,
					max = rowsUrls.length,
					getting = [gR(location + sheetUrl)];

				if (typeof rowsUrls === 'string') {
					getting.push(gR(location + rowsUrls));
				} else {
					for (; i < max; i++) {
						getting.push(gR(location + rowsUrls[i]));
					}
				}

				Promise
					.all(getting)
					.then(function(jsons) {
						callback('sheet', jsons[0]);

						var i = 1,
							j,
							row,
							rowSet,
							rowSets = jsons,
							iMax = rowSets.length,
							jMax;

						for(;i<iMax;i++) {
							rowSet = JSON.parse(rowSets[i]);
							jMax = rowSet.length;
							for(j = 0;j<jMax;j++) {
								row = rowSet[j];
								callback('row', JSON.stringify(row));
							}
						}

						callback();
					}, function(err) {
						callback('error', err);
					});
			}
		}, [
			WickedGrid.formulaParserUrl,
			WickedGrid.threadScopeUrl
		]);

		t.stash = [];
		t.busy = false;

		return t;
	};

	thread.kill = function() {
		var i = 0,
			max = threads.length;

		for(;i < max; i++) {
			threads[i].terminate();
		}
	};

	return thread;
})();
WickedGrid.ui = function(wickedGrid) {
  var ui = document.createElement('div');
  ui.setAttribute('class',WickedGrid.cl.ui);
  wickedGrid.ui = ui;
  return ui;
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
		C:				  67,
		F:					70,
		V:					86,
		X:				  88,
		Y:					89,
		Z:					90,
		UNKNOWN:			229
	},
	arrHelpers = {
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
			var o = {}, i, l = arr.length, r = [];
			for(i=0; i<l;i+=1) o[arr[i]] = arr[i];
			for(i in o) r.push(o[i]);
			return r;
		},
		flatten:function (arr) {
			var flat = [],
				item,
				i = 0,
				max = arr.length;

			for (; i < max; i++) {
				item = arr[i];
				if (item instanceof Array) {
					flat = flat.concat(this.flatten(item));
				} else {
					flat = flat.concat(item);
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
		indexOfNearestLessThan: function (array, needle) {
			if (array.length === 0) return -1;

			var high = array.length - 1,
				low = 0,
				mid,
				item,
				target = -1;

			if (array[high] < needle) {
				return high;
			}

			while (low <= high) {
				mid = (low + high) >> 1;
				item = array[mid];
				if (item > needle) {
					high = mid - 1;
				} else if (item < needle) {
					target = mid;
					low = mid + 1;
				} else {
					target = low;
					break;
				}
			}

			return target;
		},
		ofSet: function (array, needle) {
			if (array.length === 0) return null;

			var high = array.length - 1,
				lastIndex = high,
				biggest = array[high],
				smallest = array[0],
				low = 0,
				mid,
				item,
				target = -1,
				i,
				highSet = -1,
				lowSet = -1;

			if (array[high] < needle || array[0] > needle) {
				return null;
			} else {

				while (low <= high) {
					mid = (low + high) >> 1;
					item = array[mid];
					if (item > needle) {
						target = mid;
						high = mid - 1;
					} else if (item < needle) {
						low = mid + 1;
					} else {
						target = high;
						break;
					}
				}
			}

			if (target > -1) {
				i = target;
				while (i <= lastIndex) {
					if (array[i] + 1 === array[i + 1]) {
						i++;
					} else {
						highSet = array[i];
						break;
					}
				}

				if (highSet === -1) {
					highSet = biggest;
				}

				i = target;
				while (i >= 0) {
					if (array[i] - 1 === array[i - 1]) {
						i--;
					} else {
						lowSet = array[i];
						break;
					}
				}

				if (lowSet === -1) {
					lowSet = smallest;
				}
			}

			return {
				start: lowSet,
				end: highSet
			};
		},
		closest:function (array, num, min, max) {
			min = min || 0;
			max = max || array.length - 1;

			var target,
				item;

			while (true) {
				target = ((min + max) >> 1);
				item = array[target];
				if ((target === max || target === min) && item !== num) {
					return item;
				}
				if (item > num) {
					max = target;
				} else if (item < num) {
					min = target;
				} else {
					return item;
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
		},
		//http://stackoverflow.com/questions/11919065/sort-an-array-by-the-levenshtein-distance-with-best-performance-in-javascript
		levenshtein: (function() {
			var row2 = [];
			return function(s1, s2) {
				if (s1 === s2) {
					return 0;
				} else {
					var s1_len = s1.length, s2_len = s2.length;
					if (s1_len && s2_len) {
						var i1 = 0, i2 = 0, a, b, c, c2, row = row2;
						while (i1 < s1_len)
							row[i1] = ++i1;
						while (i2 < s2_len) {
							c2 = s2.charCodeAt(i2);
							a = i2;
							++i2;
							b = i2;
							for (i1 = 0; i1 < s1_len; ++i1) {
								c = a + (s1.charCodeAt(i1) === c2 ? 0 : 1);
								a = row[i1];
								b = b < a ? (b < c ? b + 1 : c) : (a < c ? a + 1 : c);
								row[i1] = b;
							}
						}
						return b;
					} else {
						return s1_len + s2_len;
					}
				}
			};
		})(),
		lSearch: function(arr, value) {
			var i = 0,
				item,
				max = arr.length,
				found = -1,
				distance;

			for(;i < max; i++) {
				item = arr[i];
				distance = new Number(this.levenshtein(item, value));
				distance.item = item;
				if (distance < found) {
					found = distance;
				}
			}

			return (distance !== undefined ? distance.item : null);
		}
	},

	dates = {
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
	},

	times = {
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


extend(Math, {
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
		// %		  note 1: Precision 'n' can be adjusted as desired
		// *	 example 1: log1p(1e-15);
		// *	 returns 1: 9.999999999999995e-16

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

/**
 *
 * @param {Object} base
 */
function extend(base) {
	var property,
    argument,
    argumentsIndex = 1;

  for (; argumentsIndex < arguments.length; argumentsIndex++) {
    argument = arguments[argumentsIndex];
    for (property in argument) {
      if (argument.hasOwnProperty(property) && !base.hasOwnProperty(property)) {
        base[property] = argument[property];
      }
    }
  }

	return base;
}

/**
 * Get scrollBar size
 * @returns {Object} {height: int, width: int}
 */
function getScrollBarSize() {
	var doc = document,
		inner = $(document.createElement('p')).css({
			width:'100%',
			height:'100%'
		}),
		outer = $(document.createElement('div')).css({
			position:'absolute',
			width:'100px',
			height:'100px',
			top:'0',
			left:'0',
			visibility:'hidden',
			overflow:'hidden'
		}).append(inner);

	$(document.body).append(outer);

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
}

function getAverageCharacterSize() {
	var characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
		el = $(document.createElement('span'))
			.html(characters)
			.appendTo('body'),
		size = {
			width: el.width() / characters.length,
			height: el.height()
		};

	el.remove();

	return size;
}

function debugPositionBox (x, y, box, color, which) {
	color = color || '#' + Math.floor(Math.random() * 16777215).toString(16);
	if (box) {
		var $box = $([]);
		$box = $box.add(debugPositionBox(box.left, box.top, null, color, 'top-left'));
		$box = $box.add(debugPositionBox(box.right, box.top, null, color, 'top-right'));
		$box = $box.add(debugPositionBox(box.left, box.bottom, null, color, 'bottom-left'));
		$box = $box.add(debugPositionBox(box.right, box.bottom, null, color, 'bottom-right'));
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

$.printSource = function (s) {
	var w = win.open();
	w.document.write("<html><body><xmp>" + s + "\n</xmp></body></html>");
	w.document.close();
};

function widget(html) {
	var child = null,
			parser = widget.parser || (widget.parser = document.createElement('span'));

	parser.innerHTML = html;

	while (parser.lastChild !== null) {
		child = parser.removeChild(parser.lastChild);
	}

	return child;
}

function disableSelectionSpecial(element) {
	element.onselectstart = function () {
		return false;
	};
	element.unselectable = 'on';
	element.style['-moz-user-select'] = 'none';
}
WickedGrid.event.Cell = (function() {
  function Cell(wickedGrid) {
    this.wickedGrid = wickedGrid;
  }

  Cell.prototype = {
    /**
     * Updates a cell after edit afterward event 'sheetCellEdited' is called w/ params (td, row, col, spreadsheetIndex, sheetIndex)
     * @param {Boolean} [force] if set to true forces a calculation of the selected sheet.evt
     */
    done: function (force) {
      var wickedGrid = this.wickedGrid,
          inPlaceEdit = wickedGrid.inPlaceEdit(),
          inPlaceEditHasFocus = $(inPlaceEdit).is(':focus'),
          cellLast = wickedGrid.cellLast,
          $element = wickedGrid.settings.$element,
          cell;

      (inPlaceEdit.destroy || empty)();
      if (cellLast !== null && (cellLast.isEdit || force)) {
        cell = wickedGrid.getCell(cellLast.sheetIndex, cellLast.rowIndex, cellLast.columnIndex);
        var formula = (inPlaceEditHasFocus ? $(inPlaceEdit) : wickedGrid.formula()),
            td = cell.td;

        if (wickedGrid.isFormulaEditable(td)) {
          //Lets ensure that the cell being edited is actually active
          if (td !== null && cell.rowIndex > -1 && cell.columnIndex > -1) {

            //This should return either a val from textbox or formula, but if fails it tries once more from formula.
            var v = formula.val(),
                i = 0,
                loader = wickedGrid.loader,
                loadedFrom;

            if (!cell.edited) {
              cell.edited = true;
              wickedGrid.cellsEdited().push(cell);
            }

            $element.one('sheetPreCalculation', function () {
              //reset formula to null so it can be re-evaluated
              cell.parsedFormula = null;
              if (v.charAt(0) == '=') {
                //change only formula, previous value will be stored and recalculated momentarily
                cell.formula = v = v.substring(1);
              } else {
                cell.value = v;
                cell.formula = '';

                if ((loadedFrom = cell.loadedFrom) !== null) {
                  loader.setCellAttributes(loadedFrom, {
                    'cache': u,
                    'data-formula': '',
                    'value': v,
                    'parsedFormula': null
                  });
                }
              }

              cell.setNeedsUpdated();
            });
            wickedGrid.resolveCell(cell);

            //formula.focus().select();
            cell.isEdit = false;

            //perform final function call
            wickedGrid.trigger('sheetCellEdited', [cell]);
          }
        }
      }
    },

    /**
     * Abandons a cell edit
     * @param {Boolean} [skipCalc] if set to true will skip sheet calculation;.evt
     */
    editAbandon: function (skipCalc) {
      var wickedGrid = this.wickedGrid,
          cell = wickedGrid.cellLast;

      (wickedGrid.inPlaceEdit().destroy || empty)();

      wickedGrid.highlighter
          .clearBar()
          .clear();

      if (!skipCalc && cell !== null) {
        cell.updateValue();
      }

      wickedGrid.cellLast = null;
      wickedGrid.rowLast = 0;
      wickedGrid.colLast = 0;
      wickedGrid.highlighter.startRowIndex = 0;
      wickedGrid.highlighter.startColumnIndex = 0;
      wickedGrid.highlighter.endRowIndex = 0;
      wickedGrid.highlighter.endColumnIndex = 0;

      wickedGrid.labelUpdate('');
      wickedGrid.formula()
          .val('')
          .blur();

      wickedGrid.autoFillerHide();

      return false;
    },

    /**
     * Highlights a cell from a key code
     * @param {Object} e jQuery event
     * @returns {Boolean}.evt
     */
    setHighlightFromKeyCode: function (e) {
      var wickedGrid = this.wickedGrid,
          grid = wickedGrid.orderedGrid(wickedGrid.highlighter),
          size = wickedGrid.sheetSize(),
          cellActive = wickedGrid.cellActive(),
          highlighter = wickedGrid.highlighter;

      if (cellActive === null) return false;

      switch (e.keyCode) {
        case key.UP:
          if (grid.endRowIndex > cellActive.rowIndex) {
            grid.endRowIndex--;
            grid.endRowIndex = grid.endRowIndex > 0 ? grid.endRowIndex : 0;
            break;
          }

          grid.startRowIndex--;
          grid.startRowIndex = grid.startRowIndex > 0 ? grid.startRowIndex : 0;

          break;
        case key.DOWN:
          //just beginning the highlight
          if (grid.startRowIndex === grid.endRowIndex) {
            grid.endRowIndex++;
            grid.endRowIndex = grid.endRowIndex < size.rows ? grid.endRowIndex : size.rows;
            break;
          }

          //if the highlight is above the active cell, then we have selected up and need to move down
          if (grid.startRowIndex < cellActive.rowIndex) {
            grid.startRowIndex++;
            grid.startRowIndex = grid.startRowIndex < size.rows ? grid.startRowIndex : size.rows;
            break;
          }

          //otherwise we increment the row, and limit it to the size of the total grid
          grid.endRowIndex++;
          grid.endRowIndex = grid.endRowIndex < size.rows ? grid.endRowIndex : size.rows;

          break;
        case key.LEFT:
          if (grid.endColumnIndex > cellActive.columnIndex) {
            grid.endColumnIndex--;
            grid.endColumnIndex = grid.endColumnIndex > 0 ? grid.endColumnIndex : 0;
            break;
          }

          grid.startColumnIndex--;
          grid.startColumnIndex = grid.startColumnIndex > 0 ? grid.startColumnIndex : 0;

          break;
        case key.RIGHT:
          if (grid.startColumnIndex < cellActive.columnIndex) {
            grid.startColumnIndex++;
            grid.startColumnIndex = grid.startColumnIndex < size.cols ? grid.startColumnIndex : size.cols;
            break;
          }

          grid.endColumnIndex++;
          grid.endColumnIndex = grid.endColumnIndex < size.cols ? grid.endColumnIndex : size.cols;

          break;
      }

      //highlight the cells
      highlighter.startRowIndex = grid.startRowIndex;
      highlighter.startColumnIndex = grid.startColumnIndex;
      highlighter.endRowIndex = grid.endRowIndex;
      highlighter.endColumnIndex = grid.endColumnIndex;

      wickedGrid.cycleCellArea(function (o) {
        highlighter.set(o.td);
      }, grid);

      return false;
    },

    /**
     * Activates a cell from a key code
     * @param {Object} e jQuery event
     * @param {Boolean} [skipMove]
     * @returns {Boolean}.evt
     */
    setActiveFromKeyCode: function (e, skipMove) {
      if (this.cellLast === null) return false;

      var wickedGrid = this.wickedGrid,
          cell = wickedGrid.cellLast,
          loc = {
            rowIndex: cell.rowIndex,
            columnIndex: cell.columnIndex
          },
          spreadsheet,
          row,
          nextCell,
          overrideIsEdit = false,
          highlighted,
          doNotClearHighlighted = false;

      switch (e.keyCode) {
        case key.UP:
          loc.rowIndex--;
          break;
        case key.DOWN:
          loc.rowIndex++;
          break;
        case key.LEFT:
          loc.columnIndex--;
          break;
        case key.RIGHT:
          loc.columnIndex++;
          break;
        case key.ENTER:
          loc = wickedGrid.cellEvents.incrementAndStayInGrid(wickedGrid.orderedGrid(wickedGrid.highlighter), loc, true, e.shiftKey);
          overrideIsEdit = true;
          highlighted = wickedGrid.highlighted();
          if (highlighted.length > 1) {
            doNotClearHighlighted = true;
          } else {
            if (!skipMove) {
              loc.rowIndex += (e.shiftKey ? -1 : 1);
            }
            //TODO: go down one row, and possibly scroll to cell if needed
          }
          break;
        case key.TAB:
          loc = wickedGrid.cellEvents.incrementAndStayInGrid(wickedGrid.orderedGrid(wickedGrid.highlighter), loc, false, e.shiftKey);
          overrideIsEdit = true;
          highlighted = wickedGrid.highlighted();
          if (highlighted.length > 1) {
            doNotClearHighlighted = true;
          } else {
            if (!skipMove) {
              loc.columnIndex += (e.shiftKey ? -1 : 1);
            }
            //TODO: go one cell right and scroll if needed
          }
          break;
        case key.HOME:
          loc.columnIndex = 1;
          break;
        case key.END:
          loc.columnIndex = this.tdActive().parentNode.children.length - 2;
          break;
      }

      //we check here and make sure all values are above 0, so that we get a selected cell
      //loc.columnIndex = loc.columnIndex || 1;
      //loc.rowIndex = loc.rowIndex || 1;

      //to get the td could possibly make keystrokes slow, we prevent it here so the user doesn't even know we are listening ;)
      if (!cell.isEdit || overrideIsEdit) {
        //get the td that we want to go to
        if ((spreadsheet = wickedGrid.spreadsheets[wickedGrid.i]) === u) return false;
        if ((row = spreadsheet[loc.rowIndex]) === u) return false;
        if ((nextCell = row[loc.columnIndex]) === u) return false;

        //if the td exists, lets go to it
        if (nextCell !== null) {
          wickedGrid.cellEdit(nextCell, null, doNotClearHighlighted);
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
     * @param {Boolean} isRows
     * @param {Boolean} reverse
     * @returns {Object} loc.evt
     */
    incrementAndStayInGrid: function (grid, loc, isRows, reverse) {
      if (isRows) {
        if (reverse) {
          loc.rowIndex--;
          if (loc.rowIndex < grid.startRowIndex) {
            loc.rowIndex = grid.endRowIndex;
            loc.columnIndex--;
          }
          if (loc.columnIndex < grid.startColumnIndex) {
            loc.columnIndex = grid.endColumnIndex;
          }
        } else {
          loc.rowIndex++;
          if (loc.rowIndex > grid.endRowIndex) {
            loc.rowIndex = grid.startRowIndex;
            loc.columnIndex++;
          }
          if (loc.columnIndex > grid.endColumnIndex) {
            loc.columnIndex = grid.startColumnIndex;
          }
        }
      }
      else {
        if (reverse) {
          loc.columnIndex--;
          if (loc.columnIndex < grid.startColumnIndex) {
            loc.columnIndex = grid.endColumnIndex;
            loc.rowIndex--;
          }
          if (loc.rowIndex < grid.startRowIndex) {
            loc.rowIndex = grid.endRowIndex;
          }
        } else {
          loc.columnIndex++;
          if (loc.columnIndex > grid.endColumnIndex) {
            loc.columnIndex = grid.startColumnIndex;
            loc.rowIndex++;
          }
          if (loc.rowIndex > grid.endRowIndex) {
            loc.rowIndex = grid.startRowIndex;
          }
        }
      }
      return loc;
    },

    /**
     * Cell on mouse down
     * @param {Object} e jQuery event.evt
     */
    mouseDown: function (e) {
      var wickedGrid = this.wickedGrid;
      wickedGrid.formula().blur();
      if (e.shiftKey) {
        wickedGrid.getTdRange(e, wickedGrid.formula().val());
      } else if (e.target._cell) {
        this.edit(e.target._cell, true);
      }
    },

    /**
     * Cell on double click
     * @param {Object} e jQuery event.evt
     */
    dblClick: function (e) {
      if (this.wickedGrid.isBusy()) {
        return false;
      }

      WickedGrid.inPlaceEdit(this.wickedGrid);

      return true;
    },

    edit: function (cell) {
      var wickedGrid = this.wickedGrid;
      if (wickedGrid.isBusy()) {
        return false;
      }

      wickedGrid.cellEdit(cell);

      return true;
    },

    paste: function (e) {
      e = e || window.event;
      if (e.ctrlKey || e.type == 'paste') {
        var fnAfter = function () {
          wickedGrid.updateCellsAfterPasteToFormula();
        };

        var $doc = $document
            .one('keyup', function () {
              fnAfter();
              fnAfter = function () {
              };
              $doc.mouseup();
            })
            .one('mouseup', function () {
              fnAfter();
              fnAfter = function () {
              };
              $doc.keyup();
            });

        wickedGrid.setDirty(true);
        wickedGrid.setChanged(true);
        return true;
      }

      return false;
    }
  };

  return Cell;
})();

WickedGrid.event.Document = (function() {
  function Document(wickedGrid) {
    this.wickedGrid = wickedGrid;
  }

  Document.prototype = {
    /**
     *
     * @param {Object} e jQuery event
     * @returns {*}.evt.document
     */
    enter:function (e) {
      if (!this.wickedGrid.cellLast.isEdit && !e.ctrlKey) {
        $(this.wickedGrid.tdActive()).dblclick();
      }
      return false;
    },

    /**
     *
     * @param {Object} e jQuery event
     * @returns {*}.evt.document
     */
    tab:function (e) {
      this.wickedGrid.cellEvents.setActiveFromKeyCode(e);
    },

    /**
     *
     * @param {Object} e jQuery event
     * @returns {*}.evt.document
     */
    findCell:function (e) {
      if (e.ctrlKey) {
        this.wickedGrid.cellFind();
        return false;
      }
      return true;
    },

    /**
     *
     * @param {Object} e jQuery event
     * @returns {*}.evt.document
     */
    redo:function (e) {
      if (e.ctrlKey && !this.wickedGrid.cellLast.isEdit) {
        this.wickedGrid.undo.undoManager.redo();
        return false;
      }
      return true;
    },

    /**
     *
     * @param {Object} e jQuery event
     * @returns {*}.evt.document
     */
    undo:function (e) {
      if (e.ctrlKey && !this.wickedGrid.cellLast.isEdit) {
        this.wickedGrid.undo.undoManager.undo();
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
      var tds = this.wickedGrid.highlighted(true),
          formula = this.wickedGrid.formula(),
          oldValue = formula.val(),
          cellsTsv = this.wickedGrid.toTsv(tds, clearValue);

      formula
          .val(cellsTsv)
          .focus()
          .select();

      $document
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
     * @returns {Boolean}.evt.document
     */
    pageUpDown:function (reverse) {
      var size = this.wickedGrid.sheetSize(),
          pane = this.wickedGrid.pane(),
          paneHeight = pane.clientHeight,
          prevRowsHeights = 0,
          thisRowHeight = 0,
          td,
          i;
      //TODO: refactor to use scroll position
      if (reverse) { //go up
        for (i = this.wickedGrid.cellLast.rowIndex; i > 0 && prevRowsHeights < paneHeight; i--) {
          td = this.wickedGrid.getTd(-1, i, 1);
          if (td !== null && !td.getAttribute('data-hidden') && $(td).is(':hidden')) $(td).show();
          prevRowsHeights += td.parentNode.clientHeight;
        }
      } else { //go down
        for (i = this.wickedGrid.cellLast.rowIndex; i < size.rows && prevRowsHeights < paneHeight; i++) {
          td = this.wickedGrid.getTd(-1, i, 1);
          if (td === null) continue;
          prevRowsHeights += td.parentNode.clientHeight;
        }
      }
      this.wickedGrid.cellEdit(td);

      return false;
    },

    /**
     *
     * @param {Object} e jQuery event
     * @returns {*}.evt.document
     */
    keydown:function (e) {
      e = e || window.event;
      var wickedGrid = this.wickedGrid;
      if (wickedGrid.readOnly[wickedGrid.i]) return false;
      if (wickedGrid.cellLast === null) return;
      if (wickedGrid.cellLast.rowIndex < 0 || wickedGrid.cellLast.columnIndex < 0) return false;
      var td = wickedGrid.cellLast.td;

      if (wickedGrid.nav) {
        //noinspection FallthroughInSwitchStatementJS
        switch (e.keyCode) {
          case key.DELETE:
            wickedGrid.toTsv(null, true);
            wickedGrid.formula().val('');
            wickedGrid.cellLast.isEdit = true;
            break;
          case key.TAB:
            this.tab(e);
            break;
          case key.ENTER:
            wickedGrid.cellEvents.setActiveFromKeyCode(e);
            break;
          case key.LEFT:
          case key.UP:
          case key.RIGHT:
          case key.DOWN:
            (e.shiftKey ? wickedGrid.cellEvents.setHighlightFromKeyCode(e) : wickedGrid.cellEvents.setActiveFromKeyCode(e));
            break;
          case key.PAGE_UP:
            this.pageUpDown(true);
            break;
          case key.PAGE_DOWN:
            this.pageUpDown();
            break;
          case key.HOME:
          case key.END:
            wickedGrid.cellEvents.setActiveFromKeyCode(e);
            break;
          case key.V:
            if (e.ctrlKey) {
              return wickedGrid.formulaEvents.If(!wickedGrid.cellEvents.paste(e), e);
            } else {
              $(td).trigger('cellEdit');
              return true;
            }
            break;
          case key.Y:
            if (e.ctrlKey) {
              this.redo(e);
              return false;
            } else {
              $(td).trigger('cellEdit');
              return true;
            }
            break;
          case key.Z:
            if (e.ctrlKey) {
              this.undo(e);
              return false;
            } else {
              $(td).trigger('cellEdit');
              return true;
            }
            break;
          case key.ESCAPE:
            wickedGrid.cellEvents.editAbandon();
            break;
          case key.F:
            if (e.ctrlKey) {
              return wickedGrid.formulaEvents.If(this.findCell(e), e);
            } else {
              $(td).trigger('cellEdit');
              return true;
            }
            break;
          case key.CAPS_LOCK:
          case key.SHIFT:
          case key.ALT:
            break;
          case key.CONTROL: //we need to filter these to keep cell state
            wickedGrid.formula().focus().select();
            return true;
            break;
          default:
            if (wickedGrid.inPlaceEdit().td !== td) {
              $(td).trigger('cellEdit');
            }
            return true;
            break;
        }
        return false;
      }
    }
  };

  return Document;
})();
WickedGrid.event.Formula = (function() {
  function Formula(wickedGrid) {
    this.wickedGrid = wickedGrid;
  }

  Formula.prototype = {
    /**
     *
     * @param {Object} e jQuery event
     * @returns {*}.evt.formula
     */
    keydown:function (e) {
      e = e || window.event;
      var wickedGrid = this.wickedGrid;
      if (wickedGrid.readOnly[wickedGrid.i]) return false;
      if (wickedGrid.cellLast === null) return false;
      if (wickedGrid.cellLast.rowIndex < 0 || wickedGrid.cellLast.columnIndex < 0) return false;

      wickedGrid.trigger('sheetFormulaKeydown', [false]);

      switch (e.keyCode) {
        case key.C:
          if (e.ctrlKey) {
            return wickedGrid.documentEvents.copy(e);
          }
        case key.X:
          if (e.ctrlKey) {
            return wickedGrid.documentEvents.cut(e);
          }
        case key.Y:
          if (e.ctrlKey) {
            wickedGrid.documentEvents.redo(e);
            return false;
          }
          break;
        case key.Z:
          if (e.ctrlKey) {
            wickedGrid.documentEvents.undo(e);
            return false;
          }
          break;
        case key.ESCAPE:
          wickedGrid.cellEvents.editAbandon();
          return true;
          break;
        case key.ENTER:
          wickedGrid.cellEvents.setActiveFromKeyCode(e, true);
          return false;
          break;
        case key.UNKNOWN:
          return false;
      }

      wickedGrid.cellLast.isEdit = true;
    },

    /**
     * Helper for events
     * @param {Boolean} ifTrue
     * @param e {Object} jQuery event
     * @returns {*}.evt.keydownHandler
     */
    If:function (ifTrue, e) {
      if (ifTrue) {
        $(this.wickedGrid.tdActive()).dblclick();
        return true;
      }
      return false;
    }
  };

  return Formula;
})();
WickedGrid.loader.HTML = (function() {
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
		this.wickedGrid = null;
		this.handler = null;
	}

	HTML.prototype = {
		bindWickedGrid: function(wickedGrid) {
			this.wickedGrid = wickedGrid;
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
				width = columns[columnIndex].style.width.replace('px', '') || WickedGrid.defaultColumnWidth;
				return width * 1;
			}

			return WickedGrid.defaultColumnWidth;
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

				height = row.style.height.replace('px', '') || WickedGrid.defaultRowHeight;

				return height * 1;
			}

			return WickedGrid.defaultRowHeight;
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

			tBody = table.querySelector('tBody') || table;
			rows = tBody.children;

			for (;columnIndex < columnMax; columnIndex++) {
				row.appendChild(
					spreadsheetRow[columnIndex].loadedFrom = document.createElement('td')
				);
			}
			
			if (columnIndex === 0) {
        row.appendChild(
					spreadsheetRow[columnIndex].loadedFrom = document.createElement('td')
				);
      }


			if (rowIndex === rowsMax) {
				tBody.appendChild(row);
			} else if (rowIndex < rowsMax) {
				tBody.insertBefore(row, rows[rowIndex]);
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

			if (columnIndex === columnMax) {
				for (; rowIndex < rowMax; rowIndex++) {
					row = rows[rowIndex];
					td = document.createElement('td');
					spreadsheetCells[rowIndex].loadedFrom = td;
					row.appendChild(td);
				}
			} else if (columnIndex < columnMax) {
				for (; rowIndex < rowMax; rowIndex++) {
					row = rows[rowIndex];
					td = document.createElement('td');
					spreadsheetCells[rowIndex].loadedFrom = td;
					row.insertBefore(td, row.children[columnIndex]);
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

				if (columns.length > columnIndex) {
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

			var wickedGrid = this.wickedGrid,
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

			if (htmlCell.hasAttribute('class')) td.className = htmlCell.className;
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
					if (cell.rowIndex !== rowIndex && (nextCell = wickedGrid.getCell(cell.sheetIndex, rowIndex, cell.columnIndex)) !== null) {
						nextCell.covered = true;
						nextCell.defer = cell;
					}
				}
				for (;columnIndex < columnMax; columnIndex++) {
					width += this.getWidth(cell.sheetIndex, columnIndex);
					if (cell.columnIndex !== columnIndex && (nextCell = wickedGrid.getCell(cell.sheetIndex, cell.rowIndex, columnIndex)) !== null) {
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

			jitCell = new WickedGrid.Cell(sheetIndex, null, this.wickedGrid, this.handler);
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
			
			// Add tbody
			if (!$(table).find('tbody').length) {
				var tbody = document.createElement('tbody');
				$(tbody).html($(table).html());
				$(table).html($(tbody));
			}

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
				if (i === 'value') {
					cell.innerHTML = attributes[i];
				} else {
					cell.setAttribute(i, attributes[i]);
				}
			}

			return this;
		},


		/**
		 *
		 * @param {WickedGrid.Cell} cell
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
				wickedGrid = this.wickedGrid,
				i = 1 * wickedGrid.i,
				pane,
				spreadsheet,
				sheet = wickedGrid.spreadsheets.length - 1,
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
				wickedGrid.i = sheet;
				wickedGrid.evt.cellEditDone();
				pane = wickedGrid.obj.pane();
				table = document.createElement('table');
				tBody = document.createElement('tBody');
				colGroup = document.createElement('colGroup');
				table.setAttribute('title', wickedGrid.obj.table().attr('title'));
				table.setAttribute('data-frozenatrow', pane.action.frozenAt.row);
				table.setAttribute('data-frozenatcol', pane.action.frozenAt.col);
				table.appendChild(colGroup);
				table.appendChild(tBody);

				output.unshift(table);

				spreadsheet = wickedGrid.spreadsheets[sheet];
				row = spreadsheet.length;
				do {
					parentEle = spreadsheet[row][1].td.parentNode;
					parentHeight = parentEle.style['height'];
					tr = document.createElement('tr');
					tr.style.height = (parentHeight ? parentHeight : wickedGrid.s.colMargin + 'px');

					column = spreadsheet[row].length;
					do {
						cell = spreadsheet[row][column];
						td = document.createElement('td');
						attr = cell.td.attributes;

						if (doNotTrim || rowHasValues || attr['class'] || cell['formula'] || cell['value'] || attr['style']) {
							rowHasValues = true;

							cl = (attr['class'] ? $.trim(
								(attr['class'].value || '')
									.replace(wickedGrid.cl.uiCellActive , '')
									.replace(wickedGrid.cl.uiCellHighlighted, '')
							) : '');

							parent = cell.td.parentNode;

							tr.insertBefore(td, tr.firstChild);

							if (!tr.style.height) {
								tr.style.height = (parent.style.height ? parent.style.height : wickedGrid.settings.colMargin + 'px');
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
								col.style.width = $(wickedGrid.col(column)).css('width');
								colGroup.insertBefore(col, colGroup.firstChild);
							}
						}
					} while (column-- > 1);

					if (rowHasValues) {
						tBody.insertBefore(tr, tBody.firstChild);
					}

				} while (row-- > 1);
			} while (sheet--);
			wickedGrid.i = i;

			return this.json = output;
		},
		type: HTML,
		typeName: 'WickedGrid.loader.HTML',

		clearCaching: function() {
			return this;
		}
	};

	HTML.maxStoredDependencies = 100;

	return HTML;
})();

/**
 * @type {Object}
 * @memberof WickedGrid.loader
 */
WickedGrid.loader.JSON = (function() {
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
		this.wickedGrid = null;
		this.handler = null;
	}

	JSONLoader.prototype = {
    /**
     *
     * @param wickedGrid
     * @returns {JSONLoader}
     */
		bindWickedGrid: function(wickedGrid) {
			this.wickedGrid = wickedGrid;
			return this;
		},
    /**
     *
     * @param handler
     * @returns {JSONLoader}
     */
		bindHandler: function(handler) {
			this.handler = handler;
			return this;
		},
    /**
     *
     * @param spreadsheetIndex
     * @param actionUI
     */
		bindActionUI: function(spreadsheetIndex, actionUI) {
			actionUI.loadedFrom = this.json[spreadsheetIndex];
		},
    /**
     *
     * @param spreadsheetIndex
     * @returns {*}
     */
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
    /**
     *
     * @param sheetIndex
     * @param columnIndex
     * @returns {number}
     */
		getWidth: function(sheetIndex, columnIndex) {
			var json = this.json,
				jsonSpreadsheet = json[sheetIndex] || {},
				metadata = jsonSpreadsheet.metadata || {},
				widths = metadata.widths || [],
				width = widths[columnIndex] || WickedGrid.defaultColumnWidth;

			return width * 1;
		},
    /**
     *
     * @param sheetIndex
     * @param rowIndex
     * @returns {number}
     */
		getHeight: function(sheetIndex, rowIndex) {
			var json = this.json,
				jsonSpreadsheet = json[sheetIndex] || {},
				rows = jsonSpreadsheet.rows || [],
				row = rows[rowIndex] || {},
				height = row.height || WickedGrid.defaultRowHeight;

			return height * 1;
		},
    /**
     *
     * @param sheetIndex
     * @returns {boolean}
     */
		isHidden: function(sheetIndex) {
			var json = this.json,
				jsonSpreadsheet = json[sheetIndex] || {},
				metadata = jsonSpreadsheet.metadata || {};

			return metadata.hidden === true;
		},
    /**
     *
     * @param sheetIndex
     * @param isHidden
     * @returns {JSONLoader}
     */
		setHidden: function(sheetIndex, isHidden) {
			var json = this.json,
				jsonSpreadsheet = json[sheetIndex] || {},
				metadata = jsonSpreadsheet.metadata || {};

			metadata.hidden = isHidden;

			return this;
		},
    /**
     *
     * @param sheetIndex
     * @param rowIndex
     * @param spreadsheetCells
     * @returns {JSONLoader}
     */
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
    /**
     *
     * @param sheetIndex
     * @param columnIndex
     * @param spreadsheetCells
     * @returns {JSONLoader}
     */
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
    /**
     *
     * @param sheetIndex
     * @param rowIndex
     * @returns {JSONLoader}
     */
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
    /**
     *
     * @param sheetIndex
     * @param columnIndex
     * @returns {JSONLoader}
     */
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
    /**
     *
     * @param cell
     * @param td
     * @returns {JSONLoader}
     */
		setupTD: function(cell, td) {
			if (cell.covered) {
				td.style.visibility = 'hidden';
				return this;
			}

			var wickedGrid = this.wickedGrid,
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
					if (cell.rowIndex !== rowIndex && (nextCell = wickedGrid.getCell(cell.sheetIndex, rowIndex, cell.columnIndex)) !== null) {
						nextCell.covered = true;
						nextCell.defer = cell;
					}
				}
				for (;columnIndex < columnMax; columnIndex++) {
					width += this.getWidth(cell.sheetIndex, columnIndex);
					if (cell.columnIndex !== columnIndex && (nextCell = wickedGrid.getCell(cell.sheetIndex, cell.rowIndex, columnIndex)) !== null) {
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
    /**
     *
     * @param sheetIndex
     * @param rowIndex
     * @param columnIndex
     * @returns {*}
     */
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
    /**
     *
     * @param sheetIndex
     * @param rowIndex
     * @param columnIndex
     * @returns {*}
     */
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

			jitCell = new WickedGrid.Cell(sheetIndex, null, this.wickedGrid, this.handler);
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
    /**
     *
     * @param id
     * @param sheetIndex
     * @param callback
     * @returns {JSONLoader}
     */
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
    /**
     *
     * @param sheetIndex
     * @returns {*}
     */
		title: function(sheetIndex) {
			var json = this.json,
				jsonSpreadsheet;

			if ((jsonSpreadsheet = json[sheetIndex]) === undefined) return '';

			return jsonSpreadsheet.title || '';
		},
    /**
     *
     * @param actionUI
     * @param rowIndex
     * @returns {Array}
     */
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
    /**
     *
     * @param actionUI
     * @param columnIndex
     * @returns {Array}
     */
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
    /**
     *
     * @param actionUI
     * @param rowIndex
     * @returns {Array}
     */
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
    /**
     *
     * @param actionUI
     * @param columnIndex
     * @returns {Array}
     */
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
    /**
     *
     * @param actionUI
     * @returns {Array}
     */
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
    /**
     *
     * @param actionUI
     * @returns {Array}
     */
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
    /**
     *
     * @param index
     * @returns {boolean}
     */
		hasSpreadsheetAtIndex: function(index) {
			return (this.json[index] !== undefined);
		},
    /**
     *
     * @param title
     * @returns {number}
     */
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
    /**
     *
     * @param jsonSpreadsheet
     * @param atIndex
     */
		addSpreadsheet: function(jsonSpreadsheet, atIndex) {
			jsonSpreadsheet = jsonSpreadsheet || {};

			if (atIndex === undefined) {
				this.json.push(jsonSpreadsheet);
			} else {
				this.json.splice(atIndex, 0, jsonSpreadsheet);
			}
			this.count = this.json.length;
		},
    /**
     *
     * @param cell
     * @param attribute
     * @returns {*}
     */
		getCellAttribute: function(cell, attribute) {
			return cell[attribute];
		},
    /**
     *
     * @param cell
     * @param attribute
     * @param value
     */
		setCellAttribute: function(cell, attribute, value) {
			cell[attribute] = value;
		},
    /**
     *
     * @param cell
     * @param attributes
     * @returns {JSONLoader}
     */
		setCellAttributes: function(cell, attributes) {
			var i;
			for (i in attributes) if (i !== undefined && attributes.hasOwnProperty(i)) {
				cell[i] = attributes[i];
			}

			return this;
		},

		/**
		 *
		 * @param {WickedGrid.Cell} cell
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
    /**
     *
     * @param parentCell
     * @param dependencyCell
     * @returns {JSONLoader}
     */
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
    /**
     *
     * @param sheetIndex
     * @param fn
     * @returns {JSONLoader}
     */
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
    /**
     *
     * @param fn
     * @returns {JSONLoader}
     */
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
		 * @memberof WickedGrid.loader.JSON
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
		 * Create json from WickedGrid instance
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
		 * @memberof WickedGrid.loader.JSON
		 */
		fromSheet: function(doNotTrim) {
			doNotTrim = (doNotTrim == undefined ? false : doNotTrim);

			var output = [],
				wickedGrid = this.wickedGrid,
				i = 1 * wickedGrid.i,
				pane,
				sheet = wickedGrid.spreadsheets.length - 1,
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
				wickedGrid.i = sheet;
				wickedGrid.evt.cellEditDone();
				pane = wickedGrid.obj.pane();
				jsonSpreadsheet = {
					"title": (wickedGrid.obj.table().attr('title') || ''),
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

				spreadsheet = wickedGrid.spreadsheets[sheet];
				row = spreadsheet.length - 1;
				do {
					parentEle = spreadsheet[row][1].td.parentNode;
					parentHeight = parentEle.style['height'];
					jsonRow = {
						"columns": [],
						"height": (parentHeight ? parentHeight.replace('px', '') : wickedGrid.s.colMargin)
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
									.replace(wickedGrid.cl.uiCellActive , '')
									.replace(wickedGrid.cl.uiCellHighlighted, '')
							) : '');

							parent = cell.td.parentNode;

							jsonRow.columns.unshift(jsonColumn);

							if (!jsonRow["height"]) {
								jsonRow["height"] = (parent.style['height'] ? parent.style['height'].replace('px' , '') : wickedGrid.s.colMargin);
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
								jsonSpreadsheet.metadata.widths.unshift($(wickedGrid.col(column)).css('width').replace('px', ''));
							}
						}
					} while (column-- > 1);

					if (rowHasValues) {
						jsonSpreadsheet.rows.unshift(jsonRow);
					}

				} while (row-- > 1);
			} while (sheet--);
			wickedGrid.i = i;

			return this.json = output;
		},
    /**
     *
     */
		type: JSONLoader,
    /**
     *
     */
		typeName: 'WickedGrid.loader.JSON',
    /**
     *
     * @returns {JSONLoader}
     */
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

  /**
   * 
   * @type {number}
   */
	JSONLoader.maxStoredDependencies = 100;

	return JSONLoader;
})();

/**
 * @type {Object}
 * @memberof WickedGrid.loader
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
WickedGrid.loader.XML = (function() {
	function XML(xml) {
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

	XML.prototype = {
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
		 * @memberof WickedGrid.loader.XML
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
		 * @memberof WickedGrid.loader.XML
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
				frozenAt = extend({}, jS.obj.pane().actionUI.frozenAt);
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
								widths[column] = '<width>' + $(jS.col(column)).css('width').replace('px', '') + '</width>';
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
		type: XML,
		typeName: 'WickedGrid.XMLLoader'
	};

	return XML;
})();


/**
 * Creates the scrolling system used by each spreadsheet
 */
WickedGrid.ActionUI = (function() {
	var $document = $(document);

	var ActionUI = function(wickedGrid, enclosure, cl, frozenAt) {
		this.wickedGrid = wickedGrid;
		this.enclosure = enclosure;
		this.pane = document.createElement('div');
		this.active = true;
		this.rowCache = {
			last: null,
			first: null,
			selecting: false
		};
		this.columnCache = {
			last: null,
			first: null,
			selecting: false
		};
		enclosure.appendChild(this.pane);

		if (!(this.frozenAt = frozenAt)) {
			this.frozenAt = {row:0, col:0};
		}

		this.frozenAt.row = Math.max(this.frozenAt.row, 0);
		this.frozenAt.col = Math.max(this.frozenAt.col, 0);

		wickedGrid.loader.bindActionUI(wickedGrid.i, this);

		this.hiddenRows = wickedGrid.loader.hiddenRows(this);
		this.visibleRows = [];
		this.hiddenColumns = wickedGrid.loader.hiddenColumns(this);
		this.visibleColumns = [];

		this.loader = wickedGrid.loader;

		this
			.setupVisibleRows()
			.setupVisibleColumns();

		var that = this,
			loader = this.loader,
			sheetRowIndex,
			sheetColumnIndex,
			pane = this.pane,
			left,
			up,

			/**
			 * Where the current sheet is scrolled to
			 * @returns {Object}
			 */
			scrolledArea = this.scrolledArea = {
				row: Math.max(this.frozenAt.row, 1),
				col: Math.max(this.frozenAt.col, 1)
			},

			megaTable = this.megaTable = new MegaTable({
				columns: WickedGrid.domColumns,
				rows: WickedGrid.domRows,
				element: pane,
				updateCell: this._updateCell = function(rowVisibleIndex, columnVisibleIndex, td) {
					var rowIndex = (that.visibleRows.length === 0 ? rowVisibleIndex : that.visibleRows[rowVisibleIndex]),
						columnIndex = (that.visibleColumns.length === 0 ? columnVisibleIndex : that.visibleColumns[columnVisibleIndex]),
						oldTd;

					if (typeof td._cell === 'object' && td._cell !== null) {
						td._cell.td = null;
					}

					var cell = wickedGrid.getCell(wickedGrid.i, rowIndex, columnIndex);

					if (cell === null) return;

					var spreadsheet = wickedGrid.spreadsheets[wickedGrid.i] || (wickedGrid.spreadsheets[wickedGrid.i] = []),
						row = spreadsheet[rowIndex] || (spreadsheet[rowIndex] = []);

					if (!row[columnIndex]) {
						row[columnIndex] = cell;
					}

					oldTd = cell.td;
					if (oldTd !== null) {
						while (oldTd.lastChild !== null) {
							oldTd.removeChild(oldTd.lastChild);
						}
					}

					cell.td = td;
					td._cell = cell;
					loader.setupTD(cell, td);
					cell.updateValue();
				},
				updateCorner: this._updateCorner = function(th, col) {
					th.index = -1;
					th.entity = 'corner';
					th.col = col;
					th.className = wickedGrid.cl.corner + ' ' + wickedGrid.theme.bar;
				},
				updateRowHeader: this._updateRowHeader = function(rowVisibleIndex, header) {
					var rowIndex,
						label;

					if (that.visibleRows.length === 0) {
						rowIndex = rowVisibleIndex;
						label = document.createTextNode(rowIndex + 1);
					} else {
						if (rowVisibleIndex >= that.visibleRows.length) {
							rowIndex = rowVisibleIndex + that.hiddenRows.length;
						} else {
							rowIndex = that.visibleRows[rowVisibleIndex];
						}
						label = document.createTextNode(rowIndex + 1);
					}

					header.index = rowIndex;
					header.entity = 'row';
					header.className = wickedGrid.cl.row + ' ' + wickedGrid.theme.bar;
					header.appendChild(label);
					header.parentNode.style.height = header.style.height = loader.getHeight(wickedGrid.i, rowIndex) + 'px';
				},
				updateColumnHeader: this._updateColumnHeader = function(columnVisibleIndex, header, col) {
					var columnIndex,
						label;

					if (that.visibleColumns.length === 0) {
						columnIndex = columnVisibleIndex;
						label = document.createTextNode(wickedGrid.cellHandler.columnLabelString(columnIndex));
					} else {
						if (columnVisibleIndex >= that.visibleColumns.length) {
							columnIndex = columnVisibleIndex + that.hiddenColumns.length;
						} else {
							columnIndex = that.visibleColumns[columnVisibleIndex];
						}
						label = document.createTextNode(wickedGrid.cellHandler.columnLabelString(columnIndex));
					}

					header.index = columnIndex;
					header.th = header;
					header.col = col;
					header.entity = 'column';
					header.className = wickedGrid.cl.column + ' ' + wickedGrid.theme.bar;
					header.appendChild(label);
					col.style.width = loader.getWidth(wickedGrid.i, columnIndex) + 'px';
				}
			}),

			infiniscroll = this.infiniscroll = new Infiniscroll(pane, {
				scroll: function(c, r) {
					setTimeout(function() {
						scrolledArea.col = c;
						scrolledArea.row = r;
						megaTable.update(r, c);
					}, 0);
				},
				verticalScrollDensity: 15,
				horizontalScrollDensity: 25
			});

		new MouseWheel(pane, infiniscroll._out);

		megaTable.table.className += ' ' + WickedGrid.cl.table + ' ' + wickedGrid.theme.table;
		megaTable.table.setAttribute('cellSpacing', '0');
		megaTable.table.setAttribute('cellPadding', '0');
		pane.scroll = infiniscroll._out;
		pane.actionUI = this;
		pane.table = megaTable.table;
		pane.tBody = megaTable.tBody;
	};

	ActionUI.prototype = {
		/**
		 * scrolls the sheet to the selected cell
		 * @param {HTMLElement} td
		 */
		putTdInView:function (td) {
			var i = 0,
				x = 0,
				y = 0,
				direction,
				scrolledTo;

			while ((direction = this.directionToSeeTd(td)) !== null) {
				scrolledTo = this.scrolledArea;

				if (direction.left) {
					x--;
					this.scrollTo(
						'x',
						0,
						scrolledTo.col - 1
					);
				} else if (direction.right) {
					x++;
					this.scrollTo(
						'x',
						0,
						scrolledTo.col + 1
					);
				}

				if (direction.up) {
					y--;
					this.scrollTo(
						'y',
						0,
						scrolledTo.row - 1
					);
				} else if (direction.down) {
					y++;
					this.scrollTo(
						'y',
						0,
						scrolledTo.row + 1
					);
				}

				i++;
				if (i < 25) {
					break;
				}
			}
		},

		/**
		 * detects if a td is not visible
		 * @param {HTMLElement} td
		 * @returns {Boolean|Object}
		 */
		directionToSeeTd:function(td) {
			var pane = this.pane,
				visibleFold = {
					top:0,
					bottom:pane.clientHeight,
					left:0,
					right:pane.clientWidth
				},

				tdWidth = td.clientWidth,
				tdHeight = td.clientHeight,
				tdLocation = {
					top:td.offsetTop,
					bottom:td.offsetTop + tdHeight,
					left:td.offsetLeft,
					right:td.offsetLeft + tdWidth
				},
				tdParent = td.parentNode,
				scrollTo = this.scrolledArea;

			if (!td.col) {
				return null;
			}

			var xHidden = td.barTop.cellIndex < scrollTo.col,
				yHidden = tdParent.rowIndex < scrollTo.row,
				hidden = {
					up:yHidden,
					down:tdLocation.bottom > visibleFold.bottom && tdHeight <= pane.clientHeight,
					left:xHidden,
					right:tdLocation.right > visibleFold.right && tdWidth <= pane.clientWidth
				};

			if (
				hidden.up
				|| hidden.down
				|| hidden.left
				|| hidden.right
			) {
				return hidden;
			}

			return null;
		},

		hide: function() {
			var wickedGrid = this.wickedGrid,
				ui = wickedGrid.ui,
				pane = this.pane,
				parent = pane.parentNode,
				infiniscroll = this.infiniscroll;

			if (pane !== undefined && parent.parentNode !== null) {
				this.deactivate();
				infiniscroll.saveLT();
				ui.removeChild(pane.parentNode);
			}

			return this;
		},

		show: function() {
			var wickedGrid = this.wickedGrid,
				ui = wickedGrid.ui,
				pane = this.pane,
				parent = pane.parentNode,
				infiniscroll = this.infiniscroll;

			if (pane !== undefined && parent.parentNode === null) {
				ui.appendChild(pane.parentNode);
				infiniscroll.applyLT();
				this.activate();
			}

			return this;
		},

		deactivate: function() {
			var mt = this.megaTable;
			this.active = false;

			mt.updateCell =
			mt.updateCorner =
			mt.updateRowHeader =
			mt.updateColumnHeader = function() {};

			return this;
		},
		activate: function() {
			var mt = this.megaTable;
			this.active = true;

			mt.updateCell = this._updateCell;
			mt.updateCorner = this._updateCorner;
			mt.updateRowHeader = this._updateRowHeader;
			mt.updateColumnHeader = this._updateColumnHeader;

			return this;
		},

		/**
		 * Toggles a row to be visible
		 * @param {Number} rowIndex
		 */
		hideRow: function(rowIndex) {
			this.hiddenRows = this.loader.hideRow(this, rowIndex);

			var i;
			if ((i = this.visibleRows.indexOf(rowIndex)) > -1) {
				this.visibleRows.splice(i, 1);
			}

			this.megaTable.forceRedrawRows();
			return this;
		},
		/**
		 * Toggles a row to be visible
		 * @param {Number} rowIndex
		 */
		showRow: function(rowIndex) {
			this.hiddenRows = this.loader.showRow(this, rowIndex);

			if (this.visibleRows.indexOf(rowIndex) < 0) {
				this.visibleRows.push(rowIndex);
				this.visibleRows.sort(function(a, b) {return a-b});
			}

			this.megaTable.forceRedrawRows();
			return this;
		},

		/**
		 * Toggles a range of rows to be visible starting at index of 1
		 * @param {Number} startIndex
		 * @param {Number} [endIndex]
		 */
		hideRowRange: function(startIndex, endIndex) {
			var loader = this.loader, i;

			for(;startIndex <= endIndex; startIndex++) {
				this.hiddenRows = loader.hideRow(this, startIndex);
				if ((i = this.visibleRows.indexOf(startIndex)) > -1) {
					this.visibleRows.splice(i, 1);
				}
            }

			this.megaTable.forceRedrawRows();
			return this;
		},

		/**
		 * Toggles a range of rows to be visible starting at index of 1
		 * @param {Number} startIndex
		 * @param {Number} [endIndex]
		 */
		showRowRange: function(startIndex, endIndex) {
			var loader = this.loader;

			for(;startIndex <= endIndex; startIndex++) {
				this.hiddenRows = loader.showRow(this, startIndex);
				if (this.visibleRows.indexOf(startIndex) < 0) {
					this.visibleRows.push(startIndex);
				}
			}

			this.visibleRows.sort(function(a, b) {return a-b});

			this.megaTable.forceRedrawRows();
			return this;
		},

		/**
		 * Makes all rows visible
		 */
		rowShowAll:function () {
            this.hiddenRows = [];
			this.visibleRows = [];
            this.megaTable.forceRedrawRows();
			return this;
		},


		/**
		 * Toggles a column to be visible
		 * @param {Number} columnIndex
		 */
		hideColumn: function(columnIndex) {
			this.hiddenColumns = this.loader.hideColumn(this, columnIndex);

			var i;
			if ((i = this.hiddenColumns.indexOf(columnIndex)) > -1) {
				this.hiddenColumns.splice(i, 1);
			}

			this.megaTable.forceRedrawRows();
			return this;
		},
		/**
		 * Toggles a column to be visible
		 * @param {Number} columnIndex
		 */
		showColumn: function(columnIndex) {
			this.hiddenColumns = this.loader.showColumn(this, columnIndex);

			if (this.visibleColumns.indexOf(columnIndex) < 0) {
				this.visibleColumns.push(columnIndex);
				this.visibleColumns.sort(function(a, b) {return a-b});
			}

			this.megaTable.forceRedrawColumns();
			return this;
		},

		/**
		 * Toggles a range of columns to be visible starting at index of 1
		 * @param {Number} startIndex
		 * @param {Number} endIndex
		 */
		hideColumnRange: function(startIndex, endIndex) {
			var loader = this.loader, i;

			for(;startIndex <= endIndex; startIndex++) {
				this.hiddenColumns = loader.hideColumn(this, startIndex);
				if ((i = this.visibleColumns.indexOf(startIndex)) > -1) {
					this.visibleColumns.splice(i, 1);
				}
			}

			this.megaTable.forceRedrawColumns();
			return this;
		},

		/**
		 * Toggles a range of columns to be visible starting at index of 1
		 * @param {Number} startIndex
		 * @param {Number} endIndex
		 */
		showColumnRange: function(startIndex, endIndex) {
			var loader = this.loader;

			for(;startIndex <= endIndex; startIndex++) {
				this.hiddenColumns = loader.showColumn(this, startIndex);
				if (this.visibleColumns.indexOf(startIndex) < 0) {
					this.visibleColumns.push(startIndex);
				}
			}

			this.visibleColumns.sort(function(a, b) {return a-b});

			this.megaTable.forceRedrawColumns();
			return this;
		},

		/**
		 * Makes all columns visible
		 */
		columnShowAll:function () {
			this.hiddenColumns = [];
			this.visibleColumns = [];
			this.megaTable.forceRedrawColumns();
			return this;
		},

		remove: function() {
			throw new Error('Not yet implemented');
		},

		scrollToCell: function(axis, value) {
			throw new Error('Not yet implemented');
		},

		setupVisibleRows: function() {
			var i = 0,
				visibleRows = this.visibleRows = [],
				hiddenRows = this.hiddenRows,
				max = this.loader.size(this.wickedGrid.i).rows;

			for (;i < max; i++) {
				if (hiddenRows.indexOf(i) < 0) {
					visibleRows.push(i);
				}
			}

			return this;
		},
		setupVisibleColumns: function() {
			var i = 0,
				visibleColumns = this.visibleColumns = [],
				hiddenColumns = this.hiddenColumns,
				max = this.loader.size(this.wickedGrid.i).cols;

			for (;i < max; i++) {
				if (hiddenColumns.indexOf(i) < 0) {
					visibleColumns.push(i);
				}
			}

			return this;
		},

		redrawRows: function() {
			this.megaTable.forceRedrawRows();
		},

		redrawColumns: function() {
			this.megaTable.forceRedrawColumns();
		},

		selectBar: function(th) {
			switch (th.entity) {
				case WickedGrid.columnEntity:
					return this.selectColumn(th);
				case WickedGrid.rowEntity:
					return this.selectRow(th);
			}
			return null;
		},
		/**
		 * Manages the bar selection
		 * @param {Object} target
		 * @returns {WickedGrid.ActionUI}
		 */
		selectColumn: function (target) {
			if (!target) return this;
			if (target.type !== 'bar') return this;
			var columnCache = this.columnCache,
					index = target.index;

			if (index < 0) return this;

			columnCache.last = columnCache.first = index;

			this.wickedGrid.cellSetActiveBar('column', columnCache.first, columnCache.last);

			columnCache.selecting = true;
			$document
					.one('mouseup', function () {
						columnCache.selecting = false;
					});

			return this;
		},
		/**
		 * Manages the bar selection
		 * @param {Object} target
		 */
		selectRow: function (target) {
			if (!target) return;
			if (target.type !== 'bar') return;
			var rowCache = this.rowCache,
					bar = target,
					index = bar.index;

			if (index < 0) return false;

			rowCache.last = rowCache.first = index;

			this.wickedGrid.cellSetActiveBar('row', rowCache.first, rowCache.last);

			rowCache.selecting = true;
			$document
					.one('mouseup', function () {
						rowCache.selecting = false;
					});

			return false;
		},

		pixelScrollDensity: 30,
		maximumVisibleRows: 65,
		maximumVisibleColumns: 35
	};

	return ActionUI;
})();
WickedGrid.Cell = (function() {
	var u = undefined;

	function Cell(sheetIndex, td, wickedGrid) {
		if (Cell.cellLoading === null) {
			Cell.cellLoading = WickedGrid.msg.cellLoading;
		}
		if (td !== undefined && td !== null) {
			this.td = td;
			td.cell = this;
		} else {
			this.td = null;
		}
		this.dependencies = [];
		this.formula = '';
		this.cellType = null;
		this.value = '';
		this.valueOverride = null;
		this.calcCount = 0;
		this.sheetIndex = sheetIndex;
		this.rowIndex = null;
		this.columnIndex = null;
		this.wickedGrid = wickedGrid;
		this.state = [];
		this.needsUpdated = true;
		this.uneditable = false;
		this.id = null;
		this.loader = null;
		this.loadedFrom = null;
		this.cellHandler = wickedGrid.cellHandler;
		this.waitingCallbacks = [];
		this.parsedFormula = null;
		this.defer = null;
		this.isEdit = false;
		this.edited = false;
		this.covered = false;
	}

	Cell.prototype = {
		clone: function() {
			var clone = new Cell(this.sheetIndex, this.td, this.wickedGrid, this.cellHandler),
				prop;
			for (prop in this) if (
				prop !== undefined
				&& this.hasOwnProperty(prop)
			) {
				if (this[prop] !== null && this[prop].call === undefined) {
					clone[prop] = this[prop];
				} else if (this[prop] === null) {
					clone[prop] = this[prop];
				}
			}

			return clone;
		},

		addDependency:function(cell) {
			if (cell === undefined || cell === null) return;

			if (cell.type !== Cell) {
				throw new Error('Wrong Type');
			}

			if (this.dependencies.indexOf(cell) < 0 && this !== cell) {
				this.dependencies.push(cell);
				if (this.loader !== null) {
					this.loader.addDependency(this, cell);
				}
			}
		},
		/**
		 * Ignites calculation with cell, is recursively called if cell uses value from another cell, can be sent indexes, or be called via .call(cell)
		 * @param {Function} [callback]
		 * @returns {*} cell value after calculated
		 */
		updateValue:function (callback) {
			if (
				!this.needsUpdated
				&& this.value.cell !== u
				&& this.defer === null
			) {
				var result = (this.valueOverride !== null ? this.valueOverride : this.value);
				this.displayValue();
				if (callback !== u) {
					callback.call(this, result);
				}
				if (this.waitingCallbacks.length > 0) while (this.waitingCallbacks.length > 0) this.waitingCallbacks.pop().call(this, result);
				return;
			}

			//If the value is empty or has no formula, and doesn't have a starting and ending handler, then don't process it
			if (this.cellType === null && this.defer === null && this.formula.length < 1) {
				if (
					this.value !== undefined
					&& (
						(this.value + '').length < 1
						|| !this.hasOperator.test(this.value)
					)
				)
				{
					if (this.td !== null) {
						this.td.innerHTML = this.encode(this.value);
					}
					this.value = new String(this.value);
					this.value.cell = this;
					this.updateDependencies();
          //this.needsUpdated = false;

					if (callback !== u) {
						callback.call(this, this.value);
					}
					if (this.waitingCallbacks.length > 0) while (this.waitingCallbacks.length > 0) this.waitingCallbacks.pop().call(this, this.value);
					return;
				}
			}

			var operatorFn,
				cell = this,
				cache,
				value = this.value,
				formula = this.formula,
				cellType = this.cellType,
				cellTypeHandler,
				defer = this.defer,
				callbackValue,
				resolveFormula = function (parsedFormula) {
					cell.parsedFormula = parsedFormula;
					cell.resolveFormula(parsedFormula, function (value) {
						if (value !== u && value !== null) {
							if (value.cell !== u && value.cell !== cell) {
								value = value.valueOf();
							}

							WickedGrid.calcStack--;

							if (
								cellType !== null
								&& (cellTypeHandler = WickedGrid.CellTypeHandlers[cellType]) !== u
							) {
								value = cellTypeHandler(cell, value);
							}

							doneFn.call(cell, value);
						} else {
							doneFn.call(cell, null);
						}
					});
				},
				doneFn = function(value) {
					//setup cell trace from value
					if (
						value === u
						|| value === null
					) {
						value = new String();
					}

					if (value.cell === u) {
						switch (typeof(value)) {
							case 'object':
								break;
							case 'undefined':
								value = new String();
								break;
							case 'number':
								value = new Number(value);
								break;
							case 'boolean':
								value = new Boolean(value);
								break;
							case 'string':
							default:
								value = new String(value);
								break;
						}
						value.cell = cell;
					}
					cell.value = value;
					cache = cell.displayValue().valueOf();

					cell.state.shift();

					if (cell.loader !== null) {
						cell.loader
							.setCellAttributes(cell.loadedFrom, {
								'cache': (typeof cache !== 'object' ? cache : null),
								'data-formula': cell.formula,
								'parsedFormula': cell.parsedFormula,
								'value': cell.value + '',
								'cellType': cell.cellType,
								'uneditable': cell.uneditable
							})
							.setDependencies(cell);
					}

					cell.needsUpdated = false;

					callbackValue = cell.valueOverride !== null ? cell.valueOverride : cell.value;
					if (callback !== u) {
						callback.call(cell, callbackValue);
					}
					if (cell.waitingCallbacks.length > 0) while (cell.waitingCallbacks.length > 0) cell.waitingCallbacks.pop().call(cell, callbackValue);

					cell.updateDependencies();
				};

			if (this.state.length > 0) {
				if (callback !== u) {
					this.waitingCallbacks.push(callback);
				}
				return;
			}

			//TODO: Detect reciprocal dependency
			//detect state, if any
			/*switch (this.state[0]) {
				case 'updating':
					value = new String();
					value.cell = this;
					value.html = '#VAL!';
					if (callback !== u) {
						callback.call(this, value);
					}
					return;
				case 'updatingDependencies':
					if (callback !== u) {
						callback.call(this, this.valueOverride != u ? this.valueOverride : this.value);
					}
					return;
			}*/

			//merging creates a defer property, which points the cell to another location to get the other value
			if (defer !== null) {
				defer.updateValue(function(value) {
					value = value.valueOf();
	
					switch (typeof(value)) {
						case 'object':
							break;
						case 'undefined':
							value = new String();
							break;
						case 'number':
							value = new Number(value);
							break;
						case 'boolean':
							value = new Boolean(value);
							break;
						case 'string':
						default:
							value = new String(value);
							break;
					}
					value.cell = cell;
					cell.value = value;
					cell.updateDependencies();
					cell.needsUpdated = false;
					cell.displayValue();
					if (callback !== u) {
						callback.call(cell, value);
					}
					if (cell.waitingCallbacks.length > 0) while (cell.waitingCallbacks.length > 0) cell.waitingCallbacks.pop().call(cell, value);
				});
				return;
			}

			//we detect the last value, so that we don't have to update all cell, thus saving resources
			//reset values
			this.oldValue = value;
			this.state.unshift('updating');
			this.fnCount = 0;
			this.valueOverride = null;

			//increment times this cell has been calculated
			this.calcCount++;
			if (formula.length > 0) {
				if (formula.charAt(0) === '=') {
					cell.formula = formula = formula.substring(1);
				}

				//visual feedback
				if (cell.td !== null) {
					while(cell.td.lastChild !== null) {
						cell.td.removeChild(cell.td.lastChild);
					}
					cell.td.appendChild(document.createTextNode(Cell.cellLoading));
				}

				WickedGrid.calcStack++;

				if (this.parsedFormula !== null) {
					resolveFormula(this.parsedFormula);
				} else {
					this.wickedGrid.parseFormula(formula, resolveFormula);
				}

			} else if (
				value !== u
				&& value !== null
				&& cellType !== null
				&& (cellTypeHandler = WickedGrid.CellTypeHandlers[cellType]) !== u
			) {
				value = cellTypeHandler(cell, value);
				doneFn(value);
			} else {
				switch (typeof value.valueOf()) {
					case 'string':
						operatorFn = cell.startOperators[value.charAt(0)];
						if (operatorFn !== u) {
							cell.valueOverride = operatorFn.call(cell, value);
						} else {
							operatorFn = cell.endOperators[value.charAt(value.length - 1)];
							if (operatorFn !== u) {
								cell.valueOverride = operatorFn.call(cell, value);
							}
						}
						break;
					case 'undefined':
						value = '';
						break;
				}
				doneFn(value);
			}
		},

		/**
		 * Ignites calculation with dependent cells is recursively called if cell uses value from another cell, also adds dependent cells to the dependencies attribute of cell
		 */
		updateDependencies:function () {
			var dependencies,
				dependantCell,
				i;

			//just in case it was never set
			dependencies = this.dependencies;

			//reset
			this.dependencies = [];

			//length of original
			i = dependencies.length - 1;

			//iterate through them backwards
			if (i > -1) {
				this.state.unshift('updatingDependencies');
				do {
					dependantCell = dependencies[i];
					dependantCell.updateValue();
				} while (i-- > 0);
				this.state.shift();
			}

			//if no calculation was performed, then the dependencies have not changed
			if (this.dependencies.length === 0) {
				this.dependencies = dependencies;
			}

		},

		/**
		 * Filters cell's value so correct entity is displayed, use apply on cell object
		 * @returns {String}
		 */
		displayValue:function () {
			var value = this.value,
				td = this.td,
				valType = typeof value,
				html = value.html,
				text;

			if (html === u) {
				if (
					valType === 'string'
					|| (
					value !== null
					&& valType === 'object'
					&& value.toUpperCase !== u
					)
					&& value.length > 0
				) {
					html = this.encode(value);
				} else {
					html = value;
				}
			}

			//if the td is from a loader, and the td has not yet been created, just return it's values
			if (td === u || td === null) {
				return html;
			}

			switch (typeof html) {
				case 'object':
					if (html === null) {
						while(td.lastChild !== null) {
							td.removeChild(td.lastChild);
						}
					} else if (html.appendChild !== u) {

						//if html already belongs to another element, just return nothing for it's cache, formula function is probably managing it
						if (html.parentNode === null) {
							//otherwise, append it to this td
							while(td.lastChild !== null) {
								td.removeChild(td.lastChild);
							}
							td.appendChild(html);
						}

						return '';
					}
				case 'string':
				default:
					while(td.lastChild !== null) {
						td.removeChild(td.lastChild);
					}
					td.appendChild(document.createTextNode(html));
			}

			return td.innerHTML;
		},

		resolveFormula: function(parsedFormula, callback) {
			//if error, return it
			if (typeof parsedFormula === 'string') {
				callback(parsedFormula);
			}

			var cell = this,
				steps = [],
				i = 0,
				max = parsedFormula.length,
				parsed,
				handler = this.cellHandler,
				resolved = [],
				addCell = function(cell, args) {
					var boundArgs = [],
						arg,
						j = args.length - 1;

					if (j < 0) return;
					do {
						arg = args[j];
						switch (typeof arg) {
							case 'number':
								boundArgs[j] = resolved[arg];
								break;
							case 'string':
								boundArgs[j] = arg;
								break;
							case 'object':
								if (arg instanceof Array) {
									boundArgs[j] = argBinder(arg);
									break;
								}
							default:
								boundArgs[j] = arg;
						}
					} while(j-- > 0);

					boundArgs.unshift(cell);

					return boundArgs;
				},
				argBinder = function(args) {
					var boundArgs = [],
						j = args.length - 1,
						arg;

					if (j < 0) return;
					do {
						arg = args[j];
						switch (typeof arg) {
							case 'number':
								boundArgs[j] = resolved[arg];
								break;
							case 'string':
								boundArgs[j] = arg;
								break;
							case 'object':
								if (arg.hasOwnProperty('args')) {
									boundArgs[j] = arg;
									boundArgs[j].a = argBinder(arg.a);
									break;
								}
								else if (arg instanceof Array) {
									boundArgs[j] = argBinder(arg);
									break;
								}
							default:
								boundArgs[j] = arg;
						}
					} while (j-- > 0);

					return boundArgs;
				},
				doneFn;

			if (cell.wickedGrid.settings.useStack) {
				doneFn = function(value) {
					var j = Cell.thawIndex,
						thaws = Cell.thaws,
						_thaw,
						isThawAbsent = (typeof thaws[j] === 'undefined');

					if (isThawAbsent) {
						_thaw = Cell.thaws[j] = new Thaw([]);
					} else {
						_thaw = thaws[j];
					}

					Cell.thawIndex++;
					if (Cell.thawIndex > Cell.thawLimit) {
						Cell.thawIndex = 0;
					}

					_thaw.add(function() {
						if (steps.length > 0) {
							steps.shift()();
						} else {
							callback(cell.value = (value !== u ? value : null));
						}
					});
				};
			} else {
				doneFn = function(value) {
					if (steps.length > 0) {
						steps.shift()();
					} else {
						callback(cell.value = (value !== u ? value : null));
					}
				}
			}

			for (; i < max; i++) {
				parsed = parsedFormula[i];
				switch (parsed.t) {
					//method
					case 'm':
						(function(parsed, i) {
							steps.push(function() {
								doneFn(resolved[i] = handler[parsed.m].apply(handler, addCell(cell, parsed.a)));
							});
						})(parsed, i);
						break;

					//lookup
					case 'l':
						(function(parsed, i) {
							steps.push(function() {
								//setup callback
								var lookupArgs = addCell(cell, parsed.a);

								lookupArgs.push(function (value) {
									doneFn(resolved[i] = value);
								});

								handler[parsed.m].apply(handler, lookupArgs);
							});
						})(parsed, i);
						break;
					//value
					case 'v':
						(function(parsed, i) {
							steps.push(function() {
								doneFn(resolved[i] = parsed.v);
							});
						})(parsed, i);
						break;

					case 'cell':
						(function(parsed, i) {
							steps.push(function() {
								resolved[i] = parsed;
								doneFn();
							});
						})(parsed, i);

						break;
					case u:
						resolved[i] = parsed;
						break;
					default:
						resolved[i] = null;
						throw new Error('Not implemented:' + parsed.t);
						break;
				}
			}

			doneFn();
		},

		recurseDependencies: function (fn, depth) {

			if (depth > Cell.maxRecursion) {
				this.recurseDependenciesFlat(fn);
				return this;
			}

			var i = 0,
				dependencies = this.dependencies,
				dependency,
				max = dependencies.length;

			if (depth === undefined) {
				depth = 0;
			}

			for(;i < max; i++) {
				dependency = dependencies[i];
				fn.call(dependency);
				dependency.recurseDependencies(fn, depth);
			}

			return this;
		},

		//http://jsfiddle.net/robertleeplummerjr/yzswj5tq/
		//http://jsperf.com/recursionless-vs-recursion
		recurseDependenciesFlat: function (fn) {
			var dependencies = this.dependencies,
				i = dependencies.length - 1,
				dependency,
				childDependencies,
				remaining = [];

			if (i < 0) return;

			do {
				remaining.push(dependencies[i]);
			} while (i-- > 0);

			do {
				dependency = remaining[remaining.length - 1];
				remaining.length--;
				fn.call(dependency);

				childDependencies = dependency.dependencies;
				i = childDependencies.length - 1;
				if (i > -1) {
					do {
						remaining.push(childDependencies[i]);
					} while(i-- > 0);
				}

			} while (remaining.length > 0);
		},

		/**
		 * A flat list of all dependencies
		 * @returns {Array}
		 */
		getAllDependencies: function() {
			var flatDependencyTree = [];

			this.recurseDependencies(function () {
				flatDependencyTree.push(this);
			});

			return flatDependencyTree;
		},

		/**
		 * @param {Boolean} [parentNeedsUpdated] default true
		 */
		setNeedsUpdated: function(parentNeedsUpdated) {
			if (parentNeedsUpdated !== u) {
				this.needsUpdated = parentNeedsUpdated;
			} else {
				this.needsUpdated = true;
			}

			this.recurseDependencies(function() {
				this.needsUpdated = true;
			});
		},

		encode: function (val) {

			switch (typeof val) {
				case 'object':
					//check if it is a date
					if (val.getMonth !== u) {
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

			return val
				.replace(/&/gi, '&amp;')
				.replace(/>/gi, '&gt;')
				.replace(/</gi, '&lt;')
				//.replace(/\n/g, '\n<br>')  breaks are only supported from formulas
				.replace(/\t/g, '&nbsp;&nbsp;&nbsp ')
				.replace(/  /g, '&nbsp; ');
		},
		setAttribute: function (attribute, value) {
			var td = this.td;

			if (td !== u) {
				td[attribute] = value;
			}

			this.loader.setCellAttribute(this.loadedFrom, attribute, value);

			return this;
		},
		setAttributes: function(attributes) {
			var td = this.td,
				i;

			if (td !== u) {
				for (i in attributes) if (attributes.hasOwnProperty(i)) {
					td[attributes] = attributes[i];
				}
			}

			this.loader.setCellAttributes(this.loadedFrom, attributes);

			return this;
		},
		addClass: function(_class) {
			var td = this.td,
				classes,
				index,
				loadedFrom = this.loadedFrom;

			if (td !== u) {
				if (td.classList) {
					td.classList.add(_class);
				} else {
					td.className += (td.className.length > 0 ? ' ' : '') + _class;
				}
			}

			if (loadedFrom !== u) {
				classes = this.loader.getCellAttribute(loadedFrom, 'class') || '';
				index = classes.split(' ').indexOf(_class);
				if (index < 0) {
					classes += (classes.length > 0 ? ' ' : '') + _class;
					this.loader.setCellAttribute(loadedFrom, 'class', classes);
				}
			}

			return this;
		},
		removeClass: function(_class) {
			var td = this.td,
				classes,
				index,
				loadedFrom = this.loadedFrom;

			if (td !== u) {
				if (td.classList) {
					td.classList.remove(_class);
				} else {
					classes = (td.className + '').split(' ');
					index = classes.indexOf(_class);
					if (index > -1) {
						classes.splice(index, 1);
						td.className = classes.join(' ');
					}
				}
			}

			if (loadedFrom !== u) {
				classes = (this.loader.getCellAttribute(loadedFrom, 'class') || '').split(' ');
				index = classes.indexOf(_class);
				if (index > -1) {
					classes.splice(index, 1);
					this.loader.setCellAttribute(loadedFrom, 'class', classes.join(' '));
				}
			}

			return this;
		},
		hasOperator: /(^[$£])|([%]$)/,

		startOperators: {
			'$':function(val, ch) {
				return this.cellHandler.fn.DOLLAR.call(this, val.substring(1).replace(Globalize.culture().numberFormat[','], ''), 2, ch || '$');
			},
			'£':function(val) {
				return this.startOperators['$'].call(this, val, '£');
			}
		},

		endOperators: {
			'%': function(value) {
				return value.substring(0, this.value.length - 1) / 100;
			}
		},

		type: Cell,
		typeName: 'WickedGrid.Cell'
	};


	Cell.thaws = [];
	Cell.thawLimit = 500;
	Cell.thawIndex = 0;

	Cell.cellLoading = null;
	Cell.maxRecursion = 10;

	return Cell;
})();
WickedGrid.CellContextMenu = (function() {
  function CellContextMenu(wickedGrid, menu) {
    this.wickedGrid = wickedGrid;
    this.menu = menu;
  }

  CellContextMenu.prototype = {
    show: function(x, y) {
      var wickedGrid = this.wickedGrid,
          menu = this.menu,
          style = menu.style;

      style.left = (x - 5) + 'px';
      style.top = (y - 5) + 'px';

      wickedGrid.hideMenus();
      wickedGrid.pane().appendChild(menu);
      return this;
    },
    hide: function() {
      if (this.menu.parentNode === null) return this;

      this.menu.parentNode.removeChild(this.menu);

      return this;
    }
  };

  return CellContextMenu;
})();
WickedGrid.CellHandler = (function(Math) {
	function isNum(num) {
		return !isNaN(num);
	}

	var u = undefined,
		nAN = NaN;

	function CellHandler(wickedGrid, fn) {
		this.wickedGrid = wickedGrid;
		this.fn = fn;
	}

	CellHandler.prototype = {
		/**
		 * Variable handler for formulaParser, arguments are the variable split by '.'.  Expose variables by using jQuery.sheet setting formulaVariables
		 * @param {WickedGrid.Cell} parentCell
		 * @param {*} variable
		 * @returns {*}
		 */
		variable:function (parentCell, variable) {
			if (arguments.length) {
				var name = variable[0],
					attr = variable[1],
					formulaVariables = this.wickedGrid.s.formulaVariables,
					formulaVariable,
					result;

				switch (name.toLowerCase()) {
					case 'true':
						result = new Boolean(true);
						result.html = 'TRUE';
						result.cell = parentCell;
						return result;
					case 'false':
						result = new Boolean(false);
						result.html = 'FALSE';
						result.cell = parentCell;
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
		 * @param {WickedGrid.Cell} parentCell
		 * @param {String} time
		 * @param {Boolean} isAmPm
		 * @returns {*}
		 */
		time:function (parentCell, time, isAmPm) {
			return times.fromString(time, isAmPm);
		},

		/**
		 * get a number from variable
		 * @param {WickedGrid.Cell} parentCell
		 * @param {*} num
		 * @returns {Number}
		 */
		number:function (parentCell, num) {
			if (isNaN(num) || num === null) {
				num = 0;
			}

			switch (typeof num) {
				case 'number':
					return num;
				case 'string':
					if (isNum(num)) {
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
		 * @param {WickedGrid.Cell} parentCell
		 * @param {*} _num
		 * @returns {Number}
		 */
		invertNumber: function(parentCell, _num) {
			if (isNaN(_num)) {
				_num = 0;
			}

			var num = this.number(parentCell, _num),
				inverted = new Number(num.valueOf() * -1);
			if (num.html) {
				inverted.html = num.html;
			}

			return inverted;
		},

		/**
		 * Perform math internally for parser
		 * @param {WickedGrid.Cell} parentCell
		 * @param {String} mathType
		 * @param {*} num1
		 * @param {*} num2
		 * @returns {*}
		 */
		performMath: function (parentCell, mathType, num1, num2) {
			if (
				num1 === u
				|| num1 === null
			) {
				num1 = 0;
			}

			if (
				num2 === u
				|| num2 === null
			) {
				num2 = 0;
			}

			var type1,
				type2,
				type1IsNumber = true,
				type2IsNumber = true,
				errors = [],
				value,
				output = function(val) {return val;};

			if (num1.hasOwnProperty('cell')) {
				num1.cell.addDependency(parentCell);
			}
			if (num2.hasOwnProperty('cell')) {
				num2.cell.addDependency(parentCell);
			}

			switch (type1 = (typeof num1.valueOf())) {
				case 'number':break;
				case 'string':
					if (isNum(num1)) {
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
					if (isNum(num2)) {
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

			if (!type1IsNumber && mathType !== '+') {
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
					value = Math.pow(num1, num2);
					break;
			}

			return output(value);
		},

		not: function(parentCell, value1, value2) {
			var result;

			if (value1.valueOf() != value2.valueOf()) {
				result = new Boolean(true);
				result.html = 'TRUE';
				result.cell = parentCell;
			} else {
				result = new Boolean(false);
				result.html = 'FALSE';
				result.cell = parentCell;
			}

			return result;
		},

		concatenate: function(parentCell, value1, value2) {
			if (value1 === null) value1 = '';
			if (value2 === null) value2 = '';

			return value1.toString() + value2.toString();
		},

		/**
		 * Get cell value
		 * @param {WickedGrid.Cell} parentCell
		 * @param {Object} cellRef
		 * @param {Function} [callback]
		 * @returns {WickedGrid.CellHandler}
		 */
		cellValue:function (parentCell, cellRef, callback) {
			var wickedGrid = this.wickedGrid,
				loc = this.parseLocation(cellRef.c, cellRef.r),
				cell;

			cell = wickedGrid.getCell(parentCell.sheetIndex, loc.row, loc.col);
			if (cell !== null) {
				cell.addDependency(parentCell);
				cell.updateValue(callback);
			} else if (callback !== u) {
				callback.call(parentCell, 0);
			}

			return this;
		},


		/**
		 * Get cell values as an array
		 * @param {WickedGrid.Cell} parentCell
		 * @param {Object} start
		 * @param {Object} end
		 * @param {Function} [callback]
		 * @returns {WickedGrid.CellHandler}
		 */
		cellRangeValue:function (parentCell, start, end, callback) {
			return this.remoteCellRangeValue(parentCell, parentCell.sheetIndex, start, end, callback);
		},


		/**
		 * Get cell value from a different sheet within an instance
		 * @param {WickedGrid.Cell} parentCell
		 * @param {String} sheet example "SHEET1"
		 * @param {Object} cellRef
		 * @param {Function} [callback]
		 * @returns {WickedGrid.CellHandler}
		 */
		remoteCellValue:function (parentCell, sheet, cellRef, callback) {
			var wickedGrid = this.wickedGrid,
				loc = this.parseLocation(cellRef.c, cellRef.r),
				sheetIndex = this.parseSheetLocation(sheet),
				cell;

			if (sheetIndex < 0) {
				sheetIndex = wickedGrid.getSpreadsheetIndexByTitle(sheet);
			}

			cell = wickedGrid.getCell(sheetIndex, loc.row, loc.col);
			if (cell !== null) {
				cell.addDependency(parentCell);
				cell.updateValue(callback);
			} else if (callback !== u) {
				callback.call(parentCell, 0);
			}

			return this;
		},

		/**
		 * Get cell values as an array from a different sheet within an instance
		 * @param {WickedGrid.Cell} parentCell
		 * @param {String} sheetTitle example "SHEET1"
		 * @param {Object} start
		 * @param {Object} end
		 * @param {Function} [callback]
		 * @returns {Array}
		 */
		remoteCellRangeValue:function (parentCell, sheetTitle, start, end, callback) {
			var sheetIndex = (typeof sheetTitle === 'string' ? this.parseSheetLocation(sheetTitle) : sheetTitle),
				_start = this.parseLocation(start.c, start.r),
				_end = this.parseLocation(end.c, end.r),
				rowIndex = (_start.row < _end.row ? _start.row : _end.row),
				rowIndexEnd = (_start.row < _end.row ? _end.row : _start.row),
				colIndexStart = (_start.col < _end.col ? _start.col : _end.col),
				colIndex = colIndexStart,
				colIndexEnd = (_start.col < _end.col ? _end.col : _start.col),
				totalNeedResolved = (colIndexEnd - (colIndexStart - 1)) * (rowIndexEnd - (rowIndex - 1)),
				currentlyResolve = 0,
				wickedGrid = this.wickedGrid,
				result = [],
				cachedRange,
				useCache,
				cell,
				row,
				key,
				i = 0,
				max,
				sheet;

			if (sheetIndex < 0) {
				sheetIndex = wickedGrid.getSpreadsheetIndexByTitle(sheetTitle);
			}

			//can't find spreadsheet here
			if (sheetIndex < 0) {
				result = new String('');
				result.html = '#NAME?';
				callback.call(parentCell, result);

				return this;
			}

			key = sheetIndex + '!' + start.c + start.r + ':' + end.c + end.r;
			cachedRange = CellHandler.cellRangeCache[key];

			if (cachedRange !== u) {
				useCache = true;
				max = cachedRange.length;
				for (var k = 0; k < max; k++) {
					if (cachedRange[k].cell.needsUpdated) {
						useCache = false;
					}
				}

				if (useCache) {
					callback.call(parentCell, CellHandler.cellRangeCache[key]);
					return this;
				}
			}

			sheet = wickedGrid.spreadsheets[sheetIndex];

			if (sheet === u) {
				wickedGrid.spreadsheets[sheetIndex] = sheet = [];
			}

			result.rowCount = (rowIndexEnd - rowIndex) + 1;
			result.columnCount = (colIndexEnd - colIndex) + 1;

			for (;rowIndex <= rowIndexEnd;rowIndex++) {
				colIndex = colIndexStart;
				row = (sheet[rowIndex] !== u ? sheet[rowIndex] : null);
				for (; colIndex <= colIndexEnd;colIndex++) {
					if (row === null || (cell = row[colIndex]) === u) {
						cell = wickedGrid.getCell(sheetIndex, rowIndex, colIndex);
					} else {
						cell.sheetIndex = sheetIndex;
						cell.rowIndex = rowIndex;
						cell.columnIndex = colIndex;
					}

					if (cell !== null) {
						cell.addDependency(parentCell);
						(function(i) {
							cell.updateValue(function(value) {
								result[i] = value;
								currentlyResolve++;
								if (currentlyResolve === totalNeedResolved) {
									CellHandler.cellRangeCache[key] = result;
									callback.call(parentCell, result);
								}
							});
						})(i++);
					}
				}
			}

			if (i !== totalNeedResolved) {
				//throw new Error('Not all cells were found and added to range');
			}

			return this;
		},

		/**
		 * Calls a function either from jQuery.sheet.engine or defined in jQuery sheet setting formulaFunctions.  When calling a function the cell being called from is "this".
		 * @param {WickedGrid.Cell} parentCell
		 * @param {String} fn function name (Will be converted to upper case)
		 * @param {Array} [args] arguments needing to be sent to function
		 * @returns {*}
		 */
		callFunction:function (parentCell, fn, args) {
			fn = fn.toUpperCase();
			args = args || [];

			var actualFn = this.fn[fn],
				result;

			if (actualFn !== u) {
				parentCell.fnCount++;
				result = actualFn.apply(parentCell, args);
			}

			else {
				result = new String();
				result.html = "Function " + fn + " Not Found";
			}

			return result;
		},

		formulaParser: function(callStack) {
			var formulaParser;
			//we prevent parsers from overwriting each other
			if (callStack > -1) {
				//cut down on un-needed parser creation
				formulaParser = WickedGrid.spareFormulaParsers[callStack];
				if (formulaParser === u) {
					formulaParser = WickedGrid.spareFormulaParsers[callStack] = Formula(this);
				}
			}

			//use the sheet's parser if there aren't many calls in the callStack
			else {
				formulaParser = this.wickedGrid.formulaParser;
			}

			return formulaParser;
		},
		/**
		 * Parse a cell name to it's location
		 * @param {String} columnStr "A"
		 * @param {String|Number} rowString "1"
		 * @returns {Object} {row: 1, col: 1}
		 */
		parseLocation: function (columnStr, rowString) {
			return {
				row: rowString - 1,
				col: this.columnLabelIndex(columnStr)
			};
		},

		/**
		 * Parse a sheet name to it's index
		 * @param {String} locStr SHEET1 = 0
		 * @returns {Number}
		 */
		parseSheetLocation: function (locStr) {
			var sheetIndex = ((locStr + '').replace(/SHEET/i, '') * 1) - 1;
			return isNaN(sheetIndex) ? -1 : sheetIndex ;
		},

		/**
		 *
		 * @param {Number} col 0 = A
		 * @param {Number} row 0 = 1
		 * @returns {String}
		 */
		parseCellName: function (col, row) {
			var rowString = '';
			if (row !== undefined) {
				row++;
				rowString = row.toString();
			}
			return this.columnLabelString(col) + rowString;
		},

		/**
		 * Available labels, used for their index
		 */
		alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
		/**
		 * Available labels, used for their index
		 */
		columnLabels: {},
		/**
		 * Get index of a column label
		 * @param {String} str A to 1, B to 2, Z to 26, AA to 27
		 * @returns {Number}
		 */
		columnLabelIndex: function (str) {
			return this.columnLabels[str.toUpperCase()];
		},

		/**
		 * Available indexes, used for their labels
		 */
		columnIndexes:[],

		/**
		 * Get label of a column index
		 * @param {Number} index 1 = A, 2 = B, 26 = Z, 27 = AA
		 * @returns {String}
		 */
		columnLabelString: function (index) {
			if (!this.columnIndexes.length) { //cache the indexes to save on processing
				var s = '', i, j, k, l;
				i = j = k = -1;
				for (l = 0; l < 16385; ++l) {
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
		}
	};

	CellHandler.cellRangeCache = {};

	return CellHandler;
})(Math);
WickedGrid.CellRange = (function() {
	function Constructor(cells) {
		this.cells = cells || [];
	}

	Constructor.prototype = {
		clone: function() {
			var clones = [],
				cells = this.cells,
				max = cells.length,
				cell,
				clone;

			for(var i = 0; i < max;i++) {
				cell = cells[i];

				clone = cell.clone();

				clones.push(clone);
			}

			return new Constructor(clones);
		},
		type: Constructor,
		typeName: 'WickedGrid.CellRange'
	};

	return Constructor;
})();
WickedGrid.cellTypeHandlers = {
	percent: function (cell, value) {
		//https://stackoverflow.com/questions/2652319/how-do-you-check-that-a-number-is-nan-in-javascript/16988441#16988441
		//NaN !== NaN
		if (value !== value) return 0;
		var num = (isNaN(value) ? Globalize.parseFloat(value) : value * 1),
			result;

		if (!isNaN(num)) {//success
			result = new Number(num);
			result.html = Globalize.format(num, 'p');
			return result;
		}

		return value;
	},
	date: function (cell, value) {
		if (value !== value) return 0;
		var date = Globalize.parseDate(value);
		if (date === null) {
			return value;
		} else {
			cell.valueOverride = date;
			cell.html = Globalize.format(date, 'd');
			return value;
		}
	},
	time: function (cell, value) {
		if (value !== value) return 0;
		var date = Globalize.parseDate(value);
		if (date === null) {
			return value;
		} else {
			date.html = Globalize.format(date, 't');
			return date;
		}
	},
	currency: function (cell, value) {
		if (value !== value) return 0;
		var num = (isNaN(value) ? Globalize.parseFloat(value) : value * 1),
			result;

		if (!isNaN(num)) {//success
			result = new Number(num);
			result.html = Globalize.format(num, 'c');
			return result;
		}

		return value;
	},
	number: function (cell, value) {
		if (value !== value) return 0;
		var radix, result;

		if (!CellTypeHandlers.endOfNumber) {
			radix = Globalize.culture().numberFormat['.'];
			CellTypeHandlers.endOfNumber = new RegExp("([" + (radix == '.' ? "\." : radix) + "])([0-9]*?[1-9]+)?(0)*$");
		}

		if (!isNaN(value)) {//success
			result = new Number(value);
			result.html = Globalize.format(value + '', "n10")
				.replace(CellTypeHandlers.endOfNumber, function (orig, radix, num) {
					return (num ? radix : '') + (num || '');
				});
			return result;
		}

		return value;
	}
};
WickedGrid.ColumnContextMenu = (function() {
  function ColumnContextMenu(wickedGrid, menu) {
    this.wickedGrid = wickedGrid;
    this.menu = menu;
  }

  ColumnContextMenu.prototype = {
    kill: function() {
      if (this.menu.parentNode !== null) {
        this.menu.parentNode.removeChild(this.menu);
      }

      return this;
    },
    show: function(x, y) {
      this.wickedGrid.hideMenus();

      var wickedGrid = this.wickedGrid,
          menu = this.menu,
          style = menu.style;

      style.left = (x - 5) + 'px';
      style.top = (y - 5) + 'px';

      wickedGrid.pane().appendChild(menu);
      return this;
    },
    hide: function() {
      if (this.menu.parentNode === null) return this;
      this.menu.parentNode.removeChild(this.menu);
      return this;
    }
  };
  return ColumnContextMenu;
})();
//Creates the draggable objects for freezing cells
WickedGrid.columnFreezer = function(wickedGrid) {
  if (!wickedGrid.settings.freezableCells) return false;
  if (wickedGrid.isBusy()) return false;

  var pane = wickedGrid.pane(),
      actionUI = pane.actionUI,
      tBody = pane.tBody,
      frozenAt = actionUI.frozenAt,
      scrolledArea = actionUI.scrolledArea;

  if (!(scrolledArea.col <= (frozenAt.col + 1))) {
    return false;
  }

  wickedGrid.barHelper().remove();

  var highlighter,
      bar = tBody.children[0].children[frozenAt.col + 1],
      paneRectangle = pane.getBoundingClientRect(),
      paneTop = paneRectangle.top + document.body.scrollTop,
      paneLeft = paneRectangle.left + document.body.scrollLeft,
      handle = document.createElement('div'),
      $handle = pane.freezeHandleTop = $(handle)
          .appendTo(pane)
          .addClass(wickedGrid.theme.columnFreezeHandle + ' ' + wickedGrid.cl.barHelper + ' ' + wickedGrid.cl.columnFreezeHandle)
          .height(bar.clientHeight - 1)
          .css('left', (bar.offsetLeft - handle.clientWidth) + 'px')
          .attr('title', wickedGrid.msg.dragToFreezeCol);

  wickedGrid.controls.bar.helper[wickedGrid.i] = wickedGrid.barHelper().add(handle);
  wickedGrid.controls.bar.x.handleFreeze[wickedGrid.i] = $handle;

  wickedGrid.draggable($handle, {
    axis:'x',
    start:function () {
      wickedGrid.setBusy(true);

      highlighter = $(document.createElement('div'))
          .css('position', 'absolute')
          .addClass(wickedGrid.theme.barFreezeIndicator + ' ' + wickedGrid.cl.barHelper)
          .height(bar.clientHeight - 1)
          .fadeTo(0,0.33)
          .appendTo(pane);
    },
    drag:function() {
      var target = $handle.nearest(bar.parentNode.children).prev();
      if (target.length > 0 && typeof target.position === 'function') {
        highlighter.width(target.position().left + target.width());
      }
    },
    stop:function (e, ui) {
      highlighter.remove();
      wickedGrid.setBusy(false);
      wickedGrid.setDirty(true);
      var target = $.nearest($handle, bar.parentNode.children);

      wickedGrid.barHelper().remove();
      scrolledArea.col = actionUI.frozenAt.col = Math.max(wickedGrid.getTdLocation(target[0]).col - 1, 0);
      wickedGrid.autoFillerHide();
    },
    containment:[paneLeft, paneTop, paneLeft + pane.clientWidth - window.scrollBarSize.width, paneTop]
  });

  return true;
};
/**
 * The functions container of all functions used in WickedGrid
 * @namespace
 */
WickedGrid.functions = (function(r) {

	r = r || function() {};

	/**
	 * Creates a chart, piggybacks g Raphael JS
	 * @param {Object} o options
	 * x: { legend: "", data: [0]}, //x data
	 * y: { legend: "", data: [0]}, //y data
	 * title: "",
	 * data: [0], //chart data
	 * legend: "",
	 * td: wickedGrid.getTd(this.sheet, this.row, this.col), //td container for cell
	 * chart: jQuery('<div class="' + WickedGrid.cl.chart + '" />') //chart
	 * @returns {jQuery|HTMLElement}
	 */
	function chart (o) {
    //if (typeof Raphael === 'undefined') return null;

		var wickedGrid = this.wickedGrid,
			loader = wickedGrid.settings.loader,
			chart = document.createElement('div'),
			td = this.td,
			gR,
			body = document.body;

		body.appendChild(chart);

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

		o = extend({}, o, {
			x:{ legend:"", data:[0]},
			y:{ legend:"", data:[0]},
			title:"",
			data:[0],
			legend:""
		});

		chart.className = WickedGrid.cl.chart;
		chart.onmousedown = function () {
			$(td).mousedown();
		};
		chart.onmousemove = function () {
			$(td).mousemove();
			return false;
		};

		o.data = sanitize(o.data, true);
		o.x.data = sanitize(o.x.data, true);
		o.y.data = sanitize(o.y.data, true);
		o.legend = sanitize(o.legend);
		o.x.legend = sanitize(o.x.legend);
		o.y.legend = sanitize(o.y.legend);

		o.legend = (o.legend ? o.legend : o.data);

		var width = loader.getWidth(this.sheetIndex, this.columnIndex),
			height = loader.getHeight(this.sheetIndex, this.rowIndex),
			r = Raphael(chart);

		if (o.title) r.text(width / 2, 10, o.title).attr({"font-size":20});

		switch (o.type) {
			case "bar":
				gR = r.barchart(width / 8, height / 8, width * 0.8, height * 0.8, o.data, o.legend)
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
				gR = r.hbarchart(width / 8, height / 8, width * 0.8, height * 0.8, o.data, o.legend)
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
				gR = r.linechart(width / 8, height / 8, width * 0.8, height * 0.8, o.x.data, o.y.data, {
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
				gR = r.piechart(width / 2, height / 2, (width < height ? width : height) / 2, o.data, {legend:o.legend})
					.hover(function () {
						this.sector.stop();
						this.sector.scale(1.1, 1.1, this.cx, this.cy);

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
				gR = r.dotchart(width / 8, height / 8, width * 0.8, height * 0.8, o.x.data, o.y.data, o.data, {
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

		gR.mousedown(function () {
			$(td).mousedown().mouseup();
		});

		body.removeChild(chart);

		return chart;
	}

	var fn = {
		/**
		 * information function
		 * @param v
		 * @returns {Boolean}
		 * @this Cell
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @memberof WickedGrid.functions
		 * @returns {*}
		 * @this WickedGrid.Cell
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
				v = parseFloat(v.replace(/[\$,\s]/g, ''));
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
		 * math function
		 * @param v
		 * @returns {number}
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		ABS:function (v) {
			return Math.abs(fn.N(v));
		},

		/**
		 * math function
		 * @param value
		 * @param significance
		 * @returns {number}
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		CEILING:function (value, significance) {
			significance = significance || 1;
			return (parseInt(value / significance) * significance) + significance;
		},

		/**
		 * math function
		 * @param v
		 * @returns {number}
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		EXP:function (v) {
			return Math.exp(v);
		},

		/**
		 * math function
		 * @param value
		 * @param significance
		 * @returns {*}
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		INT:function (v) {
			return Math.floor(fn.N(v));
		},

		/**
		 * math function
		 * @param v
		 * @returns {number}
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		LN:function (v) {
			return Math.log(v);
		},

		/**
		 * math function
		 * @param v
		 * @param n
		 * @returns {number}
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		LOG:function (v, n) {
			n = n || 10;
			return Math.log(v) / Math.log(n);
		},

		/**
		 * math function
		 * @param v
		 * @returns {*}
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		LOG10:function (v) {
			return fn.LOG(v);
		},

		/**
		 * math function
		 * @param x
		 * @param y
		 * @returns {number}
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		PI:function () {
			return Math.PI;
		},

		/**
		 * math function
		 * @param x
		 * @param y
		 * @returns {number}
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		POWER:function (x, y) {
			return Math.pow(x, y);
		},

		/**
		 * math function
		 * @param v
		 * @returns {number}
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		SQRT:function (v) {
			return Math.sqrt(v);
		},

		/**
		 * math function
		 * @returns {number}
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		RAND:function () {
			return Math.random();
		},

		/**
		 * math function
		 * @returns {number}
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		RND:function () {
			return Math.random();
		},

		/**
		 * math function
		 * @param v
		 * @param decimals
		 * @returns {number}
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		SUM:function () {
			var sum = 0,
				values = arrHelpers.flatten(arguments),
				v,
				i = 0,
				max = values.length,
				_isNaN = isNaN;

			for(; i < max; i++) {
				v = values[i];
				if (v === null || v === undefined) continue;
				v = v.valueOf();
				if (!_isNaN(v)) {
					switch (typeof v) {
						case 'string':
							sum += (v * 1);
							break;
						default:
							sum += v;
					}
				}
			}

			return sum;
		},

		/**
		 * math function
		 * @param number
		 * @param digits
		 * @returns {*}
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @returns {number}
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		AVERAGE:function () {
			return fn.SUM.apply(this, arguments) / fn.COUNT.apply(this, arguments);
		},

		/**
		 * statistical function
		 * @returns {number}
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		AVG:function () {
			return fn.AVERAGE.apply(this, arguments);
		},

		/**
		 * statistical function
		 * @returns {number}
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		ASC:function (v) {
			return v.charCodeAt(0);
		},
		/**
		 * string function
		 * @param v
		 * @returns {string}
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		CHAR:function (v) {
			return String.fromCharCode(v);
		},
		/**
		 * string function
		 * @param v
		 * @returns {String}
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		CLEAN:function (v) {
			var exp = new RegExp("[\cG\x1B\cL\cJ\cM\cI\cK\x07\x1B\f\n\r\t\v]","g");
			return v.replace(exp, '');
		},
		/**
		 * string function
		 * @param v
		 * @returns {*}
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		CODE:function (v) {
			return fn.ASC(v);
		},
		/**
		 * string function
		 * @returns {String}
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		DOLLAR:function (v, decimals, symbol) {
			decimals = decimals || 2;
			symbol = symbol || '$';

			var result = new Number(v),
				r = fn.FIXED(v, decimals, false);

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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		LEFT:function (v, numberOfChars) {
			v = v.valueOf().toString();
			numberOfChars = numberOfChars || 1;
			return v.substring(0, numberOfChars);
		},
		/**
		 * string function
		 * @param v
		 * @returns {*}
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		MID:function (v, start, end) {
			if (!v || !start || !end) {
				var result = new Number(0);
				result.html = 'ERROR';
				return result;
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		REPLACE:function (oldText, start, numberOfChars, newText) {
			if (!oldText || !start || !numberOfChars || !newText) {
				var result = new String('');
				result.html = 'ERROR';
				return result;
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
				var result = new String('');
				result.html = '#VALUE!';
				return result;
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		TEXT:function (value, formatText) {
			//for the time being
			//TODO: fully implement
			return value;
		},
		/**
		 * string function
		 * @param v
		 * @returns {string}
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		UPPER:function (v) {
			return v.toUpperCase();
		},
		/**
		 * string function
		 * @param v
		 * @returns {*}
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		VALUE:function (v) {
			if (jQuery.isNumeric(v)) {
				return v *= 1;
			} else {
				var result = new String('');
				result.html = '#VALUE!';
				return result;
			}
		},

		/**
		 * date/time function
		 * @returns {Date}
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		NOW:function () {
			var today = new Date();
			today.html = dates.toString(today);
			return today;
		},
		/**
		 * date/time function
		 * @returns {Number}
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		WEEKNUM:function (date) {//TODO: implement week starting
			date = dates.get(date);
			return dates.week(date) + 1;
		},
		/**
		 * date/time function
		 * @param date
		 * @returns {number}
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		DAYSFROM:function (year, month, day) {
			return Math.floor((new Date() - new Date(year, (month - 1), day)) / dates.dayDiv);
		},
		/**
		 * date/time function
		 * @param v1
		 * @param v2
		 * @returns {number}
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		HOUR:function (time) {
			time = times.fromMath(time);
			return time.hour;
		},
		/**
		 * date/time function
		 * @param time
		 * @returns {*}
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		MINUTE:function (time) {
			return times.fromMath(time).minute;
		},
		/**
		 * date/time function
		 * @param date
		 * @returns {number}
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		MONTH:function (date) {
			date = dates.get(date);
			return date.getMonth() + 1;
		},
		/**
		 * date/time function
		 * @param time
		 * @returns {*}
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		YEARFRAC:function (startDate, endDate, basis) {
			startDate = dates.get(startDate);
			endDate = dates.get(endDate);

			if (!startDate || !endDate) {
				var result = new String('');
				result.html = '#VALUE!';
				return result;
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		AND:function () {
			var arg,
				i = 0,
				max = arguments.length;

			for (;i < max; i++) {
				arg = arguments[i];
				if (arg === undefined || (arg.valueOf !== undefined && arg.valueOf() != true) || arg != true) {
					return fn.FALSE();
				}
			}

			return fn.TRUE();
		},
		/**
		 * logical function
		 * @returns {Boolean}
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		IF:function (expression, resultTrue, resultFalse) {
			var primitiveExpression = expression.valueOf(),
				str;

			switch (typeof primitiveExpression) {
				case 'boolean':
					if (primitiveExpression === true) {
						return resultTrue;
					} else {
						return resultFalse;
					}
					break;
				case 'number':
					if (primitiveExpression !== 0) {
						return resultTrue;
					} else {
						return resultFalse;
					}
					break;
				case 'string':
					str = primitiveExpression.toUpperCase();
					if (str === 'TRUE') {
						return resultTrue;
					} else if (str === 'FALSE') {
						return resultFalse;
					} else if (str.replace(/ /g, '').length > 0) {
						return resultTrue;
					}
					break;
			}

			if (primitiveExpression) {
				return resultTrue;
			}

			return resultTrue;
		},
		/**
		 * logical function
		 * @param v
		 * @returns {Boolean}
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		EQUAL: function(left, right) {
			var result,
				leftAsString,
				rightAsString;

			if (left === undefined || left === null) left = '';
			if (right === undefined || right === null) right = '';

			//We need to cast, because an internal value may just be a primitive
			leftAsString = left + '';
			rightAsString = right + '';

			if (leftAsString == rightAsString) {
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		IMG:function (v) {
			var result = new String('');
			result.html = $(document.createElement('img'))
				.attr('src', v);
			return result;
		},
		/**
		 * html function
		 * @param v
		 * @returns {*}
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		HYPERLINK:function (href, name) {
			name = name || 'LINK';
			var result = new String(name.valueOf()),
				link = document.createElement('a');
			link.setAttribute('href', href);
			link.setAttribute('target', '_new');
			link.innerText = link.textContent = name;

			result.html = link;

			return result;
		},
		/**
		 * html function
		 * @returns {*}
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		DROPDOWN:function () {
			var cell = this,
				wickedGrid = this.wickedGrid,
				td = this.td,
				value,
				v,
				html,
				select,
				id,
				result,
				i = 0,
				max;

			if (td !== null) {
				$(td).children().detach();
				html = cell.value.html;
			}

			if (html === undefined || cell.needsUpdated || html.length < 1) {
				v = arrHelpers.flatten(arguments);
				v = arrHelpers.unique(v);

				if (this.id !== null) {
					id = this.id + '-dropdown';
				} else if (td !== null) {
					id = "dropdown" + this.sheetIndex + "_" + this.rowIndex + "_" + this.columnIndex + '_' + wickedGrid.I;
				}

				select = document.createElement('select');
				select.setAttribute('name', id);
				select.setAttribute('id', id);
				select.className = 'wg-dropdown';
				select.cell = this;

				select.onmouseup = function() {
					if (this.cell.td !== null) {
						wickedGrid.cellEdit(this.cell);
					}
				};
				select.onchange = function () {
					value = new String(this.value);
					value.html = select;
					value.cell = cell;
					cell.value = value;
					cell.setNeedsUpdated(false);
					wickedGrid.resolveCell(cell);
					wickedGrid.trigger('sheetCellEdited', [cell]);
				};

				max = (v.length <= 50 ? v.length : 50);
				for (; i < max; i++) {
					if (v[i]) {
						var opt = document.createElement('option');
						opt.setAttribute('value', v[i]);
						opt.text = opt.innerText = v[i];
						select.appendChild(opt);
					}
				}

				if (!wickedGrid.settings.editable) {
					select.setAttribute('disabled', true);
				} else {
					wickedGrid.settings.$element.bind('sheetKill', function() {
						td.innerText = td.textContent = cell.value.valueOf();
					});
				}

				select.value = cell.value || v[0];
			}

			if (typeof cell.value !== 'object') {
				result = new String(cell.value);
			} else {
				result = cell.value;
			}

			result.html = select;
			return result;
		},
		/**
		 * html function
		 * @returns {*}
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		RADIO:function () {
			var cell = this,
				wickedGrid = this.wickedGrid,
				td = this.td,
				v,
				value,
				html,
				radio,
				id,
				result;

			if (td !== null) {
				html = cell.value.html;
				$(td).children().detach();
			}

			if (html === undefined || html.length < 1 || cell.needsUpdated) {
				v = arrHelpers.flatten(arguments);
				v = arrHelpers.unique(v);

				if (this.id !== null) {
					id = this.id + '-radio';
				} else if (td !== null) {
					id = "radio" + this.sheetIndex + "_" + this.rowIndex + "_" + this.columnIndex + '_' + wickedGrid.I;
				}

				html = document.createElement('span');
				html.className = 'wg-radio';
				html.onmousedown = function () {
					if (this.cell.td !== null) {
						wickedGrid.cellEdit(cell);
					}
				};
				html.cell = cell;

				for (var i = 0; i < (v.length <= 25 ? v.length : 25); i++) {
					if (v[i]) {
						var input = document.createElement('input'),
							label = document.createElement('span');

						input.setAttribute('type', 'radio');
						input.setAttribute('name', id);
						input.className = id;
						input.value = v[i];
						if (!wickedGrid.settings.editable) {
							input.setAttribute('disabled', 'disabled');
						}
						input.onchange = function() {
							value = new String(this.value);
							value.html = html;
							value.cell = cell;
							cell.value = value;
							cell.setNeedsUpdated(false);
							wickedGrid.resolveCell(cell);
							wickedGrid.trigger('sheetCellEdited', [cell]);
						};

						if (v[i].valueOf() === cell.value.valueOf()) {
							input.checked = true;
						}
						label.textContent = label.innerText = v[i];
						html.appendChild(input);
						label.input = input;
						label.onmousedown = function () {
							$(this.input).click();
						};
						html.appendChild(label);
						html.appendChild(document.createElement('br'));
					}
				}

				wickedGrid.settings.$element.bind('sheetKill', function() {
					td.textContent = td.innerText = cell.value.valueOf();
				});
			}

			if (typeof cell.value !== 'object') {
				result = new String(cell.value);
			} else {
				result = cell.value;
			}

			result.html = html;

			return result;
		},
		/**
		 * html function
		 * @param v
		 * @returns {*}
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		CHECKBOX:function (v) {
			if ($.isArray(v)) v = v[0];

			var cell = this,
				wickedGrid = this.wickedGrid,
				td = this.td,
				html,
				label,
				checkbox,
				id,
				value,
				result;

			if (td !== null) {
				html = cell.value.html;
				$(td).children().detach();
			}

			if (html === undefined || html.length < 1 || cell.needsUpdated) {
				if (this.id !== null) {
					id = this.id + '-checkbox';
				} else if (td !== null) {
					id = "checkbox" + this.sheetIndex + "_" + this.rowIndex + "_" + this.columnIndex + '_' + wickedGrid.I;
				}

				checkbox = document.createElement('input');
				checkbox.setAttribute('type', 'checkbox');
				checkbox.setAttribute('name', id);
				checkbox.setAttribute('id', id);
				checkbox.className = id;
				checkbox.value = v;
				checkbox.onchange = function () {
					if (this.checked) {
						value = new String(v);
					} else {
						value = new String('');
					}
					value.html = html;
					value.cell = cell;
					cell.value = value;
					cell.setNeedsUpdated(false);
					wickedGrid.resolveCell(cell);
					wickedGrid.trigger('sheetCellEdited', [cell]);
				};

				if (!wickedGrid.settings.editable) {
					checkbox.setAttribute('disabled', 'true');
				} else {
					wickedGrid.settings.$element.bind('sheetKill', function() {
						cell.value = (cell.value == 'true' || checkbox.checked ? v : '');
						if (cell.td !== null) {
							cell.td.innerText = cell.td.textContent = cell.value.valueOf();
						}
					});
				}

				html = document.createElement('span');
				html.className='wg-checkbox';
				html.appendChild(checkbox);
				label = document.createElement('span');
				label.textContent = label.innerText = v;
				html.appendChild(label);
				html.appendChild(document.createElement('br'));
				html.onmousedown = function () {
					if (this.cell.td !== null) {
						wickedGrid.cellEdit(this.cell);
					}
				};
				html.cell = cell;

				switch (cell.value.valueOf()) {
					case v.valueOf():
					case 'true':
						checkbox.checked = true;
				}
			}

			//when spreadsheet initiates, this will be the value, otherwise we are dependent on the checkbox being checked
			if (
				cell.value === 'true'
				|| checkbox.checked
			) {
				result = new String(v);
			}

			//if no value, than empty string
			else {
				result = new String('');
			}

			result.html = html;

			return result;
		},
		/**
		 * html function
		 * @param values
		 * @param legend
		 * @param title
		 * @returns {String}
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		BARCHART:function (values, legend, title) {
			var result = new String('');
			result.html = chart.call(this, {
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		HBARCHART:function (values, legend, title) {
			var result = new String('');
			result.html = chart.call(this, {
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		LINECHART:function (valuesX, valuesY) {
			var result = new String('');
			result.html = chart.call(this, {
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		PIECHART:function (values, legend, title) {
			var result = new String('');
			result.html = chart.call(this, {
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		DOTCHART:function (valuesX, valuesY, values, legendX, legendY, title) {
			var result = new String('');
			result.html = chart.call(this, {
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
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		CELLREF:function (v) {
			var wickedGrid = this.wickedGrid;
			return (wickedGrid.spreadsheets[v] ? wickedGrid.spreadsheets[v] : 'Cell Reference Not Found');
		},


		/**
		 * cell function
		 * @param value
		 * @param range
		 * @param indexNumber
		 * @param notExactMatch
		 * @returns {*}
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		HLOOKUP:function (value, range, indexNumber, notExactMatch) {

			if (value === undefined) return null;

			var wickedGrid = this.wickedGrid,
				found,
				foundCell,
				result = '',
				i = 0,
				max = range.length;

			indexNumber = indexNumber || 1;
			notExactMatch = notExactMatch !== undefined ? notExactMatch : true;

			if (value !== undefined || ((isNaN(value) && value != '#REF!') || value.length === 0)) {

				for(; i < max; i++) {
					if (range[i].toString() == value) {
						found = range[i];
						break;
					}
				}

			} else {
				arrHelpers.getClosestNum(value, range, function(closest, i) {
					if (notExactMatch) {
						found = closest;
					} else if (closest == value) {
						found = closest;
					}
				});
			}

			if (found !== undefined) {
				foundCell = found.cell;
				foundCell = wickedGrid.getCell(foundCell.sheetIndex, indexNumber, foundCell.columnIndex);
				if (foundCell !== null) {
					result = foundCell.updateValue();
				} else {
					result = '';
				}
			} else {
				result = new String();
				result.html = '#N/A';
			}

			return result;
		},
		/**
		 * cell function
		 * @param value
		 * @param range
		 * @param indexNumber
		 * @param notExactMatch
		 * @returns {*}
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		VLOOKUP:function (value, range, indexNumber, notExactMatch) {

			if (value === undefined) return null;

			var wickedGrid = this.wickedGrid,
				found,
				foundCell,
				result,
				i = 0,
				max = range.length;

			notExactMatch = notExactMatch !== undefined ? notExactMatch : true;


			if ((isNaN(value) && value != '#REF!') || value.length === 0) {
				for(; i < max; i++) {
					if (range[i].toString() == value) {
						found = range[i];
						break;
					}
				}

			} else {
				arrHelpers.getClosestNum(value, range, function(closest, i) {
					if (notExactMatch) {
						found = closest;
					} else if (closest == value) {
						found = closest;
					}
				});
			}

			if (found !== undefined) {
				foundCell = found.cell;
				foundCell = wickedGrid.getCell(foundCell.sheetIndex, foundCell.rowIndex, indexNumber);
				if (foundCell !== null) {
					result = foundCell.value;
				} else {
					result = '';
				}
			} else {
				result = new String();
				result.html = '#N/A';
			}

			return result;
		},

		/**
		 * Gets the adjacent value for the reference array. Ip- reference array
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		TRANSPOSE: function (range) {
			var i = 0,
				wickedGrid = this.wickedGrid,
				sheetIndex = this.sheetIndex,
				firstValue = range[0],
				firstCell = firstValue.cell,
				lastValue = range[range.length - 1],
				lastCell = lastValue.cell,
				startRow = firstCell.rowIndex,
				startColumn = firstCell.columnIndex,
				rowIndex,
				columnIndex,
				cell,
				cells = [],
				transposedCell,
				transposedCells = [],
				value,
				max = range.length,
				error,
				isOverwrite = false;

			for(;i<max;i++) {
				value = range[i];
				cell = value.cell;
				rowIndex = this.rowIndex + (cell.columnIndex - startColumn);
				columnIndex = this.columnIndex + (cell.rowIndex - startRow);

				transposedCell = wickedGrid.getCell(this.sheetIndex, rowIndex, columnIndex);
				if (transposedCell !== null && transposedCell !== this) {
					if (transposedCell.value != '') {
						isOverwrite = true;
					}
					transposedCells.push(transposedCell);
					cells.push(cell);
				}
			}

			if (isOverwrite) {
				error = new String('');
				error.html = '#REF!';
				return error;
			}

			i = 0;
			max = transposedCells.length;
			for(;i<max;i++) {
				transposedCell = transposedCells[i];
				if (transposedCell !== this) {
					cell = cells[i];
					transposedCell.setNeedsUpdated();
					transposedCell.defer = cell;
					transposedCell.updateValue();
					transposedCell.addDependency(this);
				}
			}

			return firstValue.valueOf();
		},
		/**
		 * cell function
		 * @param col
		 * @returns {*}
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		THISROWCELL:function (col) {
			var wickedGrid = this.wickedGrid;

			if (isNaN(col)) {
				col = wickedGrid.cellHandler.columnLabelIndex(col);
			}
			return wickedGrid.getCell(this.sheetIndex, this.rowIndex, col).updateValue();
		},
		/**
		 * cell function
		 * @param row
		 * @returns {*}
		 * @memberof WickedGrid.functions
		 * @this WickedGrid.Cell
		 */
		THISCOLCELL:function (row) {
			var wickedGrid = this.wickedGrid;
			return wickedGrid.getCell(this.sheetIndex, row, this.columnIndex).updateValue();
		}
	};

	return fn;
})();

/**
 * Creates the scrolling system used by each spreadsheet
 */
WickedGrid.Highlighter = (function() {
	var Highlighter = function(cellCssClass, barCssClass, tabsCssClass, callBack) {
		this.cellCssClass = cellCssClass.split(/[\s]/);
		this.barCssClass = barCssClass.split(/[\s]/);
		this.tabsCssClass = tabsCssClass.split(/[\s]/);
		this.callBack = callBack;

		this.last = [];
		this.lastTop = $([]);
		this.lastLeft = $([]);
		this.lastTab = $([]);
		this.startRowIndex = 0;
		this.startColumnIndex = 0;
		this.endRowIndex = 0;
		this.endColumnIndex = 0;
	};

  Highlighter.prototype = {
    /**
     *
     * @param {WickedGrid.Cell} cell
     */
    cell: function(cell) {
      this.cellCssClass.forEach(function(_class) {
        cell.addClass(_class);
      });

      this.last.push(cell);
      return this;
    },

    off: function() {
      while (this.last.length > 0) {
        var last = this.last.pop();
        switch (last.type) {
          case WickedGrid.Cell:
            this.cellCssClass.forEach(function(_class) {
              last.removeClass(_class);
            });
            break;
          default:
            this.cellCssClass.forEach(function(_class) {
              last.removeClass(_class);
            });
        }
      }
      return this;
    },
		set: function (objs) {
			if (objs.parentNode !== undefined) {
				objs = [objs];
			}

			var i,
					obj,
					lastHighlighted = this.last;

			//_obj is the old selected items
			if (lastHighlighted && lastHighlighted.length > 0) {
				i = lastHighlighted.length - 1;
				do {
					lastHighlighted[i].isHighlighted = false;
				} while (i-- > 0);
			}

			if (objs.length > 0) {
				i = objs.length - 1;
				do {
					obj = objs[i];
					if (!obj.isHighlighted) {
						obj.isHighlighted = true;
						this.cellCssClass.forEach(function(_class) {
							if (!obj.className.match(_class)) {
								obj.className += ' ' + _class;
							}
      						});
					}
				} while (i-- > 0);
			}

			this.clear(lastHighlighted);
			this.last = objs;

			this.callBack();
			return this;
		},

		/**
		 * Detects if there is a cell highlighted
		 * @returns {Boolean}
		 */
		is:function () {
			return this.last.length > 0;
		},

		/**
		 * Clears highlighted cells
		 * @param {Object} [obj]
		 */
		clear:function (obj) {
			if (this.is()) {
				obj = obj || this.last;

				if (obj && obj.length) {
					var i = obj.length - 1;
					do {
						if (!obj[i].isHighlighted) {
							this.cellCssClass.forEach(function(_class) {
								obj[i].className = obj[i].className.replace(_class, '');
							});
							obj[i].isHighlighted = false;
						}
					} while (i-- > 0);
				}
			}

			this.last = $([]);

			return this;
		},


		/**
		 * Sets a bar to be active
		 * @param {String} direction left or top
		 * @param {HTMLElement} td index of bar
		 */
		setBar:function (direction, td) {
			var self = this;
			switch (direction) {
				case 'top':
					this.barCssClass.forEach(function(_class) {
						self.lastTop
							.removeClass(_class);
						self.lastTop = $(td).addClass(_class);
					});
					break;
				case 'left':
					this.barCssClass.forEach(function(_class) {
						self.lastLeft
							.removeClass(_class);
						self.lastLeft = $(td).addClass(_class);
					});
					break;
			}

			return this;
		},

		/**
		 * Clears bars from being active
		 */
		clearBar:function () {
			var self = this;
			this.barCssClass.forEach(function(_class) {
				self.lastTop
					.removeClass(_class);
				self.lastLeft
					.removeClass(_class);
			});
			this.lastTop = $([]);
			this.lastLeft = $([]);

			return this;
		},



		/**
		 * Sets a tab to be active
		 */
		setTab:function (tab) {
			var self = this;
			this.clearTab();
			this.tabsCssClass.forEach(function(_class) {
				self.lastTab = tab.addClass(_class);
			});

			return this;
		},

		/**
		 * Clears a tab from being active
		 */
		clearTab:function () {
			var self = this;
			this.tabsCssClass.forEach(function(_class) {
				self.lastTab
					.removeClass(_class);
			});

			return this;
		},

		setStart: function(cell) {
			this.startRowIndex = cell.rowIndex + 0;
			this.startColumnIndex = cell.columnIndex + 0;

			return this;
		},

		setEnd: function(cell) {
			this.endRowIndex = cell.rowIndex + 0;
			this.endColumnIndex = cell.columnIndex + 0;

			return this;
		}
	};

	return Highlighter;
})();

WickedGrid.SpreadsheetUI = (function() {
	var stack = [];

	function Constructor(i, ui, options) {
		options = options || {};

		this.i = i;
		this.ui = ui;
		this.isLast = options.lastIndex === i;
		this.enclosure = null;
		this.pane = null;
		this.spreadsheet = null;

		this.initChildren = options.initChildren || function() {};
		this.done = options.done || function() {};
		this.load();
	}

	Constructor.prototype = {
		load: function(enclosure, pane, spreadsheet) {
			this.initChildren(this.ui, this.i);

			this.enclosure = enclosure;
			this.pane = pane;
			this.spreadsheet = spreadsheet;

			stack.push(this.i);

			if (this.isLast) {
				this.loaded();
			}
		},
		loaded: function() {
			this.done(stack, this);
		}
	};

	return Constructor;
})();
WickedGrid.RowContextMenu = (function() {
  function RowContextMenu(wickedGrid, menu) {
    this.wickedGrid = wickedGrid;
    this.menu = menu;
  }

  RowContextMenu.prototype = {
    show: function(x, y) {
      this.wickedGrid.hideMenus();

      var wickedGrid = this.wickedGrid,
          menu = this.menu,
          style = menu.style;

      style.left = (x - 5) + 'px';
      style.top = (y - 5) + 'px';

      wickedGrid.pane().appendChild(menu);

      return this;
    },
    hide: function() {
      var menu = this.menu;
      if (menu.parentNode === null) return this;

      menu.parentNode.removeChild(menu);

      return this;
    }
  };

  return RowContextMenu;
})();
//Creates the draggable objects for freezing cells
WickedGrid.rowFreezer = function(wickedGrid, index, pane) {
  if (wickedGrid.isBusy()) {
    return false;
  }
  var pane = wickedGrid.pane(),
      actionUI = pane.actionUI,
      table = pane.table,
      tBody = pane.tBody,
      frozenAt = actionUI.frozenAt,
      scrolledArea = actionUI.scrolledArea;

  if (!(scrolledArea.row <= (frozenAt.row + 1))) {
    return false;
  }

  wickedGrid.barHelper().remove();

  var bar = tBody.children[frozenAt.row + 1].children[0],
      paneRectangle = pane.getBoundingClientRect(),
      paneTop = paneRectangle.top + document.body.scrollTop,
      paneLeft = paneRectangle.left + document.body.scrollLeft,
      handle = document.createElement('div'),
      $handle = pane.freezeHandleLeft = $(handle)
          .appendTo(pane)
          .addClass(wickedGrid.theme.rowFreezeHandle + ' ' + wickedGrid.cl.barHelper + ' ' + wickedGrid.cl.rowFreezeHandle)
          .width(bar.clientWidth)
          .css('top', (bar.offsetTop - handle.clientHeight + 1) + 'px')
          .attr('title', wickedGrid.msg.dragToFreezeRow),
      highlighter;

  wickedGrid.controls.bar.helper[wickedGrid.i] = wickedGrid.barHelper().add(handle);
  wickedGrid.controls.bar.y.handleFreeze[wickedGrid.i] = $handle;

  wickedGrid.draggable($handle, {
    axis:'y',
    start:function () {
      wickedGrid.setBusy(true);

      highlighter = $(document.createElement('div'))
          .appendTo(pane)
          .css('position', 'absolute')
          .addClass(wickedGrid.theme.barFreezeIndicator + ' ' + wickedGrid.cl.barHelper)
          .width(handle.clientWidth)
          .fadeTo(0,0.33);
    },
    drag:function() {
      var target = $handle.nearest(bar.parentNode.parentNode.children).prev();
      if (target.length && target.position) {
        highlighter.height(target.position().top + target.height());
      }
    },
    stop:function (e, ui) {
      highlighter.remove();
      wickedGrid
          .setBusy(false)
          .setDirty(true);

      var target = $.nearest($handle, bar.parentNode.parentNode.children);
      wickedGrid.barHelper().remove();
      scrolledArea.row = actionUI.frozenAt.row = Math.max(wickedGrid.getTdLocation(target.children(0)[0]).row - 1, 0);
      wickedGrid.autoFillerHide();
    },
    containment:[paneLeft, paneTop, paneLeft, paneTop + pane.clientHeight - window.scrollBarSize.height]
  });

  return true;
};
WickedGrid.Theme = (function() {
	function Theme(theme) {
		theme = theme || WickedGrid.defaultTheme;

		switch (theme) {
			case WickedGrid.customTheme:
				this.cl = Theme.customClasses;
				break;


			case WickedGrid.bootstrapTheme:
				this.cl = Theme.bootstrapClasses;
				break;

			default:
			case WickedGrid.themeRollerTheme:
				this.cl = Theme.themeRollerClasses;
				break;
		}

		extend(this, this.cl);
	}

	Theme.themeRollerClasses = {
		autoFiller: 'ui-state-active',
		bar: 'ui-widget-header',
		barHighlight: 'ui-state-active',
		rowFreezeHandle: 'ui-state-default',
		columnFreezeHandle: 'ui-state-default',
		columnMenu: 'ui-state-default',
		columnMenuIcon: 'ui-icon ui-icon-triangle-1-s',
		tdActive: 'ui-state-active',
		tdHighlighted: 'ui-state-highlight',
		control: 'ui-widget-header ui-corner-top',
		controlTextBox: 'ui-widget-content',
		fullScreen: 'ui-widget-content ui-corner-all',
		inPlaceEdit: 'ui-state-highlight',
		menu: 'ui-widget-header',
		menuFixed: '',
		menuUl: 'ui-widget-header',
		menuLi: 'ui-widget-header',
		menuHover: 'ui-state-highlight',
		pane: 'ui-widget-content',
		parent: 'ui-widget-content ui-corner-all',
		table: 'ui-widget-content',
		tab: 'ui-widget-header',
		tabActive: 'ui-state-highlight',
		barResizer: 'ui-state-highlight',
		barFreezer: 'ui-state-highlight',
		barFreezeIndicator: 'ui-state-highlight'
	};

	Theme.bootstrapClasses = {
		autoFiller: 'btn-info',
		bar: 'input-group-addon',
		barHighlight: 'label-info',
		rowFreezeHandle: 'bg-warning',
		columnFreezeHandle: 'bg-warning',
		columnMenu: '',
		columnMenuIcon: 'fa fa-sort-desc',
		tdActive: 'active',
		tdHighlighted: 'bg-info disabled',
		control: 'panel-heading',
		controlTextBox: 'form-control',
		fullScreen: '',
		inPlaceEdit: 'form-control',
		menu: 'panel panel-default',
		menuFixed: 'nav navbar-nav',
		menuUl: 'panel-info',
		menuLi: 'active',
		menuHover: 'bg-primary active',
		pane: 'well',
		parent: 'panel panel-default',
		table: 'table-bordered table-condensed',
		tab: 'btn-default btn-xs',
		tabActive: 'active',
		barResizer: 'bg-info',
		barFreezer: 'bg-warning',
		barFreezeIndicator: 'bg-warning'
	};

	Theme.customClasses = {
		autoFiller: '',
		bar: '',
		barHighlight: '',
		rowFreezeHandle: '',
		columnFreezeHandle: '',
		columnMenu: '',
		columnMenuIcon: '',
		tdActive: '',
		tdHighlighted: '',
		control: '',
		controlTextBox: '',
		fullScreen: '',
		inPlaceEdit: '',
		menu: '',
		menuFixed: '',
		menuUl: '',
		menuLi: '',
		menuHover: '',
		pane: '',
		parent: '',
		table: '',
		tab: '',
		tabActive: '',
		barResizer: '',
		barFreezer: '',
		barFreezeIndicator: ''
	};

	return Theme;
})();
WickedGrid.Undo = (function() {
  function empty() {}
  function Undo(wickedGrid) {
    this.wickedGrid = wickedGrid;
    this.cells =[];
    this.id = -1;

    if (typeof UndoManager !== 'undefined') {
      this.undoManager = new UndoManager();
    } else {
      this.undoManager = {
        add: empty,
        undo: empty,
        redo: empty,
        register: empty
      };
    }
  }

  Undo.prototype = {
    createCells: function(cells, fn, id) {
      if (typeof id === 'undefined') {
        this.id++;
        id = this.id;
      }

      var self = this,
          before = (new WickedGrid.CellRange(cells)).clone().cells,
          after = (typeof fn === 'function' ? (new WickedGrid.CellRange(fn(cells)).clone()).cells : before);

      before.id = id;
      after.id = id;

      this.undoManager.add({
        undo: function() {
          self.removeCells(before, id);
        },
        redo: function() {
          self.createCells(after, null, id);
        }
      });

      if (id !== this.id) {
        this.draw(after);
      }

      return true;
    },
    removeCells: function(cells, id) {
      var i = 0, index = -1;
      if (cells.id === id) {
        index = i;
      }

      if (index !== -1) {
        this.cells.splice(index, 1);
      }

      this.draw(cells);
    },
    draw: function(clones) {
      var i,
          td,
          clone,
          cell,
          loc,
          wickedGrid = this.wickedGrid;

      for (i = 0; i < clones.length; i++) {
        clone = clones[i];
        loc = wickedGrid.getTdLocation(clone.td);
        cell = clone.clone(); 
        wickedGrid.spreadsheets[clone.sheetIndex][loc.row][loc.col] = cell;

        cell.setNeedsUpdated();
        cell.updateValue();
      }
      
      wickedGrid.pane().actionUI.redrawColumns();
      wickedGrid.pane().actionUI.redrawRows();
    }
  };

  return Undo;
})();
/**
 * @namespace
 * @type {Object|Function}
 * @name jQuery.fn
 */
extend($.fn, {
  /**
   * @memberof jQuery.fn
   * @function
   * @returns {jQuery}
   * @description
   * <pre>
   * The jQuery.sheet plugin
   * Supports the following jQuery events
   *
   * sheetAddRow - occurs just after a row has been added
   *  arguments: e (jQuery event), jS, i (row index), isBefore, qty
   *	  example:
   *		  $(obj).sheet({
	 *			  sheetAddRow: function(e, jS, i, isBefore, qty) {
	 *
	 *			  }
	 *		  });
   *	  or:
   *		  $(obj).bind('sheetAddRow', function(e, jS, i, isBefore, qty) {
	 *
	 *		  })
   *		  .sheet();
   *
   * sheetAddColumn - occurs just after a column has been added
   *	  arguments: e (jQuery event), jS, i (column index), isBefore, qty
   *	  example:
   *		  $(obj).sheet({
	 *			  sheetAddColumn: function(e, jS, i, isBefore, qty) {
	 *
	 *			  }
	 *		  });
   *	  or:
   *		  $(obj).bind('sheetAddColumn', function(e, jS, i, isBefore, qty) {
	 *
	 *		  })
   *		  .sheet();
   *
   * sheetSwitch - occurs after a spreadsheet has been switched
   *	  arguments: e (jQuery event), jS (jQuery.sheet instance), i (spreadsheet index)
   *	  example:
   *		  $(obj).sheet({
	 *			  sheetSwitch: function(e, jS, i) {
	 *
	 *			  }
	 *		  });
   *	  or:
   *		  $(obj).bind('sheetSwitch', function(e, jS, i) {
	 *
	 *		  })
   *		  .sheet();
   *
   * sheetRename - occurs just after a spreadsheet is renamed, to obtain new title wickedGrid.obj.table().attr('title');
   *	  arguments: e (jQuery event), jS (jQuery.sheet instance), i (spreadsheet index)
   *	  example:
   *		  $(obj).sheet({
	 *			  sheetRename: function(e, jS, i) {
	 *
	 *			  }
	 *		  });
   *	  or:
   *		  $(obj).bind('sheetRename', function(e, jS, i) {
	 *
	 *		  })
   *		  .sheet();
   *
   * sheetTabSortStart - occurs at the beginning of a sort for moving a spreadsheet around in order
   *	  arguments: e (jQuery event), jS (jQuery.sheet instance), E (jQuery sortable event), ui, (jQuery ui event)
   *	  example:
   *		  $(obj).sheet({
	 *			  sheetTabSortStart: function(e, jS, E, ui) {
	 *
	 *			  }
	 *		  });
   *	  or:
   *		  $(obj).bind('sheetTabSortStart',NPER: function(e, jS, E, ui) {
	 *
	 *		  })
   *		  .sheet();
   *
   * sheetTabSortUpdate - occurs after a sort of a spreadsheet has been completed
   *	  arguments: e (jQuery event), jS (jQuery.sheet instance), E (jQuery sotable event), ui, (jQuery ui event), i (original index)
   *	  example:
   *		  $(obj).sheet({
	 *			  sheetTabSortUpdate: function(e, jS, E, ui) {
	 *
	 *			  }
	 *		  });
   *	  or:
   *		  $(obj).bind('sheetTabSortUpdate', function(e, jS, E, ui) {
	 *
	 *		  })
   *		  .sheet();
   *
   * sheetFormulaKeydown - occurs just after keydown on either inline or static formula
   *	  arguments: e (jQuery event)
   *	  example:
   *		  $(obj).sheet({
	 *			  sheetFormulaKeydown: function(e) {
	 *
	 *			  }
	 *		  });
   *	  or:
   *		  $(obj).bind('sheetFormulaKeydown') {
	 *
	 *		  })
   *		  .sheet();
   * sheetCellEdit - occurs just before a cell has been started to edit
   *	  arguments: e (jQuery event), jS (jQuery.sheet instance), cell (jQuery.sheet.instance.spreadsheet cell)
   *	  example:
   *		  $(obj).sheet({
	 *			  sheetCellEdit: function(e, jS, cell) {
	 *
	 *			  }
	 *		  });
   *	  or:
   *		  $(obj).bind('sheetCellEdit', function(e, jS, cell) {
	 *
	 *		  })
   *		  .sheet();
   *
   * sheetCellEdited - occurs just after a cell has been updated
   *	  arguments: e (jQuery event), jS (jQuery.sheet instance), cell (jQuery.sheet.instance.spreadsheet cell)
   *	  example:
   *		  $(obj).sheet({
	 *			  sheetCellEdited: function(e, jS, cell) {
	 *
	 *			  }
	 *		  });
   *	  or:
   *		  $(obj).bind('sheetCellEdited', function(e, jS, cell) {
	 *
	 *		  })
   *		  .sheet();
   *
   * sheetCalculation - occurs just after a spreadsheet has been fully calculated
   *	  arguments: e (jQuery event), jS (jQuery.sheet instance)
   *	  example:
   *		  $(obj).sheet({
	 *			  sheetCalculation: function(e, jS) {
	 *
	 *			  }
	 *		  });
   *	  or:
   *		  $(obj).bind('sheetCalculation', function(e, jS) {
	 *
	 *		  })
   *		  .sheet();
   *
   * sheetAdd - occurs just after a spreadsheet has been added
   *	  arguments: e (jQuery event), jS (jQuery.sheet instance), i (new sheet index)
   *	  example:
   *		  $(obj).sheet({
	 *			  sheetAdd: function(e, jS, i) {
	 *
	 *			  }
	 *		  });
   *	  or:
   *		  $(obj).bind('sheetAdd', function(e, jS, i) {
	 *
	 *		  })
   *		  .sheet();
   *
   * sheetDelete - occurs just after a spreadsheet has been deleted
   *	  arguments: e (jQuery event), jS (jQuery.sheet instance), i (old sheet index)
   *	  example:
   *		  $(obj).sheet({
	 *			  sheetDelete: function(e, jS, i) {
	 *
	 *			  }
	 *		  });
   *	  or:
   *		  $(obj).bind('sheetDelete', function(e, jS, i) {
	 *
	 *		  })
   *		  .sheet();
   *
   * sheetDeleteRow - occurs just after a row has been deleted
   *	  arguments: e (jQuery event), jS (jQuery.sheet instance), i (old row index)
   *	  example:
   *		  $(obj).sheet({
	 *			  sheetDeleteRow: function(e, jS, i) {
	 *
	 *			  }
	 *		  });
   *	  or:
   *		  $(obj).bind('sheetDeleteRow', function(e, jS, i) {
	 *
	 *		  })
   *		  .sheet();
   *
   * sheetDeleteColumn - occurs just after a column as been deleted
   *	  arguments: e (jQuery event), jS (jQuery.sheet instance), i (old column index)
   *	  example:
   *		  $(obj).sheet({
	 *			  sheetDeleteColumn: function(e, jS, i) {
	 *
	 *			  }
	 *		  });
   *	  or:
   *		  $(obj).bind('sheetDeleteColumn', function(e, jS, i) {
	 *
	 *		  })
   *		  .sheet();
   *
   * sheetOpen - occurs just after a single sheet within a set of sheets has been opened, this is triggered when calling sheet, so it needs to be bound beforehand
   *	  arguments: e (jQuery event), jS (jQuery.sheet instance), i (new sheet index)
   *	  example:
   *		  $(obj).sheet({
	 *			  sheetOpen: function(e, jS, i) {
	 *
	 *			  }
	 *		  });
   *	  or:
   *		  $(obj).bind('sheetOpen', function(e, jS, i) {
	 *
	 *		  })
   *		  .sheet();
   *
   * sheetAllOpened - occurs just after all sheets have been loaded and complete user interface has been created, this is triggered when calling sheet, so it needs to be bound beforehand
   *	  arguments: e (jQuery event), jS (jQuery.sheet instance)
   *	  example:
   *		  $(obj).sheet({
	 *			  sheetAllOpened: function(e, jS) {
	 *
	 *			  }
	 *		  });
   *	  or:
   *		  $(obj).bind('sheetAllOpened', function(e, jS) {
	 *
	 *		  })
   *		  .sheet();
   *
   * sheetSave - an assistance event called when calling wickedGrid.toggleState(), but not tied to anything internally
   *	  arguments: e (jQuery event), jS (jQuery.sheet instance), tables (tables from spreadsheet)
   *	  example:
   *		  $(obj).sheet({
	 *			  sheetSave: function(e, jS, tables) {
	 *
	 *			  });
	 *		  }
   *	  or:
   *		  $(obj).bind('sheetSave', function(e, jS, tables) {
	 *
	 *		  })
   *		  .sheet();
   *
   * sheetFullScreen - triggered when the sheet goes full screen
   *	  arguments: e (jQuery event), jS (jQuery.sheet instance), isFullScreen (boolean, true if full screen, false if not)
   *	  example:
   *		  $(obj).sheet({
	 *			  sheetFullScreen: function(e, jS, isFullScreen) {
	 *
	 *			  });
	 *		  }
   *	  or:
   *		  $(obj).bind('sheetFullScreen', function(e, jS, isFullScreen) {
	 *
	 *		  })
   *		  .sheet();
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
   * menu {String|Function|Object}, default '', 'this' is jQuery.sheet instance. If ul object, will attempt to create menu
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
   *	  Javascript Example:
   *		  $(obj).sheet({
	 *			  formulaFunctions: {
	 *				  NEWFUNCTION: function(arg1, arg2) {
	 *					  //this = the parser's cell object object
	 *					  return 'string'; //can return a string
	 *					  return { //can also return an object {value: '', html: ''}
	 *						  value: 'my value seen by other cells or if accessed directly',
	 *						  html: $('What the end user will see on the cell this is called in')
	 *					  }
	 *				  }
	 *			  }
	 *		  });
   *
   *	  Formula Example:
   *		  =NEWFUNCTION(A1:B1, C3);
   *
   * formulaVariables {Object} default {}, Additional variables that formulas can access.
   *	  Javascript Example:
   *		  $(obj).sheet({
	 *			  formulaVariables: {
	 *				  newVariable: 100
	 *			  }
	 *		  });
   *
   *	  Formula Example (will output 200)
   *		  =newVariable + 100
   *
   * cellSelectModel {String} default WickedGrid.excelSelectModel, accepts WickedGrid.excelSelectModel, WickedGrid.openOfficeSelectModel, or WickedGrid.googleDriveSelectModel, makes the select model act differently
   *
   * autoAddCells {Boolean} default true, allows you to add cells by selecting the last row/column and add cells by pressing either tab (column) or enter (row)
   *
   * resizableCells {Boolean} default true, turns resizing on and off for cells, depends on jQuery ui
   *
   * resizableSheet {Boolean} default true, turns resizing on and off for sheet, depends on jQuery ui
   *
   * autoFiller {Boolean} default true, turns on/off the auto filler, the little square that follows the active cell around that you can drag and fill the values of other cells in with.
   *
   * error {Function} default function(e) { return e.error; }, is triggered on errors from the formula engine
   *
   * encode {Function} default is a special characters handler for strings only, is a 1 way encoding of the html if entered manually by the editor.  If you want to use html with a function, return an object rather than a string
   *
   * frozenAt {Object} default [{row: 0,col: 0}], Gives the ability to freeze cells at a certain row/col
   *
   * contextmenuTop {Object} default is standard list of commands for context menus when right click or click on menu dropdown
   *	  Javascript example:
   *		  {
	 *			  'What I want my command to say': function() {}
	 *		  }
   *
   * contextmenuLeft {Object} default is standard list of commands for context menus when right click
   *	  Javascript example:
   *		  {
	 *			  'What I want my command to say': function() {}
	 *		  }
   *
   * contextmenuCell {Object} default is standard list of commands for context menus when right click or click on menu dropdown
   *	  Javascript example:
   *		  {
	 *			  'What I want my command to say': function() {}
	 *		  }
   *
   * alert {Function} default function(msg) {alert(msg);}
   * prompt {Function} default function(msg, callback, initialValue) {callback(prompt(msg, initialValue));}
   * confirm {Function} default
   *	  function(msg, callbackIfTrue, callbackIfFalse) {
	 *		  if (confirm(msg)) {
	 *			  callbackIfTrue();
	 *		  } else if (callbackIfFalse) {
	 *			  callbackIfFalse();
	 *		  }
	 *	  }
   * </pre>
   *
   */
  wickedGrid:function (settings) {
    settings = settings || {};

    for (var p in WickedGrid.defaults) {
      if (WickedGrid.defaults.hasOwnProperty(p)) {
        settings[p] = settings.hasOwnProperty(p) ? settings[p] : WickedGrid.defaults[p];
      }
    }

    $(this).each(function () {
      var element = this,
        $element = $(this),
        instance = $element.getWickedGrid();

      settings.useStack = (window.thaw === undefined ? false : settings.useStack);
      settings.useMultiThreads = (window.operative === undefined ? false : settings.useMultiThreads);

      //destroy already existing spreadsheet
      if (instance) {
        var tables = $element.children().detach();
        instance.kill();
        $element.html(tables);

        WickedGrid.events.forEach($element.unbind);
      }

      settings.element = element;
      settings.$element = $element;

      if ((this.className || '').match(/\bnot-editable\b/i) != null) {
        settings.editable = false;
      }

      WickedGrid.events.forEach(function(event) {
        $element.bind(event, settings[event]);
      });

      $element.children().each(function(i) {
        //override frozenAt settings with table's data-frozenatrow and data-frozenatcol
        var frozenAtRow = this.getAttribute('data-frozenatrow') * 1,
            frozenAtCol = this.getAttribute('data-frozenatcol') * 1;

        if (!settings.frozenAt[i]) {
          settings.frozenAt[i] = {row:0, col:0};
        }
        if (frozenAtRow) {
          settings.frozenAt[wickedGrid.i].row = frozenAtRow;
        }
        if (frozenAtCol) {
          settings.frozenAt[wickedGrid.i].col = frozenAtCol;
        }
      });

      var wickedGrid = new WickedGrid(settings);
    });

    return this;
  },

  /**
   * @memberof jQuery.fn
   * @method
   * @returns {HTMLElement}
   */
  disableSelectionSpecial:function () {
    this.each(function () {
      this.onselectstart = function () {
        return false;
      };
      this.unselectable = 'on';
      this.style['-moz-user-select'] = 'none';
    });
    return this;
  },

  /**
   * @memberof jQuery.fn
   * @returns {WickedGrid}
   */
  getWickedGrid:function () {
    var wickedGrid = null;

    //detect running instance on parent
    WickedGrid.instances.forEach(function(_wickedGrid) {
      if (!wickedGrid && _wickedGrid.parent === parent) {
        wickedGrid = _wickedGrid;
      }
    });

    return wickedGrid;
  },

  /**
   * Get cell value
   * @memberof jQuery.fn
   * @param {Number} sheetIndex
   * @param {Number} rowIndex
   * @param {Number} colIndex
   * @param {Function} callback
   * @returns {jQuery}
   */
  getCellValue:function (sheetIndex, rowIndex, colIndex, callback) {
    var wickedGrid = $(this).getWickedGrid(),
        cell;

    if (!wickedGrid) return this;

    cell = wickedGrid.getCell(sheetIndex, rowIndex, colIndex);
    if (cell !== null) {
      cell.updateValue(callback);
    }


    return this;
  },

  /**
   * Set cell value
   * @memberof jQuery.fn
   * @param {String|Number} value
   * @param {Number} rowIndex
   * @param {Number} colIndex
   * @param {Number} [sheetIndex] defaults to 0
   * @param {Function} [callback]
   * @returns {jQuery}
   */
  setCellValue:function (value, rowIndex, colIndex, sheetIndex, callback) {
    var wickedGrid = $(this).getWickedGrid(),
        cell;

    if (!wickedGrid) return this;

    sheetIndex = (sheetIndex || 0);
    cell = wickedGrid.getCell(sheetIndex, rowIndex, colIndex);

    if (!cell) return this;

    if (typeof value === 'string' && value.charAt(0) === '=') {
      cell.valueOverride = cell.value = '';
      cell.formula = value.substring(1);
    } else {
      cell.value = value;
      cell.valueOverride = cell.formula = '';
    }

    cell.updateValue(callback);

    return this;
  },

  /**
   * Set cell formula
   * @memberof jQuery.fn
   * @param {String} formula
   * @param {Number} rowIndex
   * @param {Number} colIndex
   * @param {Number} [sheetIndex] defaults to 0
   * @param {Function} [callback]
   * @returns {jQuery}
   */
  setCellFormula:function (formula, rowIndex, colIndex, sheetIndex, callback) {
    var wickedGrid = $(this).getWickedGrid(),
        cell;

    sheetIndex = (sheetIndex || 0);

    if (!wickedGrid) return this;

    cell = wickedGrid.getCell(sheetIndex, rowIndex, colIndex);
    if (cell === null) return this;

    cell.formula = formula;
    cell.valueOverride = cell.value = '';
    cell.updateValue(callback);

    return this;
  },

  /**
   * Detect if spreadsheet is full screen
   * @memberof jQuery.fn
   * @returns {Boolean}
   */
  isSheetFullScreen:function () {
    var wickedGrid = $(this).getWickedGrid();

    if (!wickedGrid) return false;

    return wickedGrid.fullScreen().is(':visible');
  },

  /**
   * Get inputs serialized from spreadsheet type_sheet-index_row-index_column-index_instance-index (dropdown_0_1_1_0 = sheet 1, row 1, column A, instance 0
   * @param {Boolean} [isArray] return serialized as array (true) or string (false, default false
   * @memberof jQuery.fn
   * @returns {*}
   */
  serializeCellInputs:function (isArray) {
    var wickedGrid = $(this).wickedGrid(),
        inputs = wickedGrid.obj.tables().find(':input');

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
   * @memberof jQuery.fn
   */
  viewSource:function (pretty) {
    var source = '';
    $(this).each(function () {
      if (pretty) {
        source += $(this).toPrettySource();
      } else {
        source += $(this).toCompactSource();
      }
    });
    $.printSource(source);

    return source;
  },

  /**
   * prints html to 1 line
   * @returns {String}
   * @memberof jQuery.fn
   */
  toCompactSource:function () {
    var node = this[0];
    var result = '';
    if (node.nodeType == 1) {
      // ELEMENT_NODE
      result += '<' + node.tagName.toLowerCase();

      var n = node.attributes.length;
      for (var i = 0; i < n; i++) {
        var key = node.attributes[i].name,
            val = node.getAttribute(key);

        if (val) {
          if (key == 'contentEditable' && val == 'inherit') {
            continue;
            // IE hack.
          }

          if (typeof(val) == 'string') {
            result += ' ' + key + '="' + val.replace(/"/g, '\'') + '"';
          } else if (key == 'style' && val.cssText) {
            result += ' style="' + val.cssText + '"';
          }
        }
      }

      if (node.tagName == 'COL') {
        // IE hack, which doesn't like <COL..></COL>.
        result += '/>';
      } else {
        result += '>';
        var childResult = '';
        $(node.childNodes).each(function () {
          childResult += $(this).toCompactSource();
        });
        result += childResult;
        result += '</' + node.tagName.toLowerCase() + '>';
      }

    } else if (node.nodeType == 3) {
      // TEXT_NODE
      result += node.data.replace(/^\s*(.*)\s*$/g, '$1');
    }
    return result;
  },

  /**
   *  prints html to many lines, formatted for easy viewing
   * @param {String} [prefix]
   * @returns {String}
   * @memberof jQuery.fn
   */
  toPrettySource:function (prefix) {
    var node = this[0],
        n,
        i,
        result = '';
    prefix = prefix || '';

    if (node.nodeType == 1) {
      // ELEMENT_NODE
      result += '\n' + prefix + '<' + node.tagName.toLowerCase();
      n = node.attributes.length;
      for (i = 0; i < n; i++) {
        var key = node.attributes[i].name,
            val = node.getAttribute(key);

        if (val) {
          if (key == 'contentEditable' && val == 'inherit') {
            continue; // IE hack.
          }
          if (typeof(val) == 'string') {
            result += ' ' + key + '="' + $.trim(val.replace(/"/g, '\'')) + '"';
          } else if (key == 'style' && val.cssText) {
            result += ' style="' + $.trim(val.cssText) + '"';
          }
        }
      }
      if (node.childNodes.length <= 0) {
        if (node.tagName == 'COL') {
          result += '/>';
        } else {
          result += '></' + node.tagName.toLowerCase() + '>';
        }
      } else {
        result += '>';
        var childResult = '';

        n = node.childNodes.length;

        for (i = 0; i < n; i++) {
          childResult += $(node.childNodes[i]).toPrettySource(prefix + '  ');
        }
        result += childResult;
        if (childResult.indexOf('\n') >= 0) {
          result += '\n' + prefix;
        }
        result += '</' + node.tagName.toLowerCase() + '>';
      }
    } else if (node.nodeType == 3) {
      // TEXT_NODE
      result += node.data.replace(/^\s*(.*)\s*$/g, '$1');
    }
    return result;
  }
});

//This is a fix for Jison
if (Object.getPrototypeOf === undefined) {
	Object.getPrototypeOf = function(obj) {
		return obj || {};
	};
}

//IE8 fix
if (Array.prototype.indexOf === undefined) {
	Array.prototype.indexOf = function(obj, start) {
		for (var i = (start || 0), j = this.length; i < j; i++) {
			if (this[i] === obj) { return i; }
		}
		return -1;
	}
}


  return WickedGrid;
})();

if (typeof module !== 'undefined') module.exports = WickedGrid;
/* parser generated by jison 0.4.15 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var parser = (function(){
var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[1,5],$V1=[1,6],$V2=[1,8],$V3=[1,9],$V4=[1,10],$V5=[1,13],$V6=[1,11],$V7=[1,12],$V8=[1,14],$V9=[1,15],$Va=[1,20],$Vb=[1,18],$Vc=[1,21],$Vd=[1,22],$Ve=[1,17],$Vf=[1,24],$Vg=[1,25],$Vh=[1,26],$Vi=[1,27],$Vj=[1,28],$Vk=[1,29],$Vl=[1,30],$Vm=[1,31],$Vn=[1,32],$Vo=[4,13,14,15,17,18,19,20,21,22,23,35,36],$Vp=[1,35],$Vq=[1,36],$Vr=[1,37],$Vs=[4,13,14,15,17,18,19,20,21,22,23,35,36,38],$Vt=[4,13,14,15,17,18,19,20,21,22,23,35,36,39],$Vu=[4,13,14,15,17,18,19,20,21,22,23,29,35,36],$Vv=[4,14,15,17,18,19,20,35,36],$Vw=[1,71],$Vx=[4,14,17,18,19,35,36],$Vy=[4,14,15,17,18,19,20,21,22,35,36],$Vz=[17,35,36];
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"expressions":3,"EOF":4,"expression":5,"variableSequence":6,"TIME_AMPM":7,"TIME_24":8,"number":9,"STRING":10,"ESCAPED_STRING":11,"LETTERS":12,"&":13,"=":14,"+":15,"(":16,")":17,"<":18,">":19,"-":20,"*":21,"/":22,"^":23,"E":24,"FUNCTION":25,"expseq":26,"cellRange":27,"cell":28,":":29,"SHEET":30,"!":31,"NUMBER":32,"$":33,"REF":34,";":35,",":36,"VARIABLE":37,"DECIMAL":38,"%":39,"$accept":0,"$end":1},
terminals_: {2:"error",4:"EOF",7:"TIME_AMPM",8:"TIME_24",10:"STRING",11:"ESCAPED_STRING",12:"LETTERS",13:"&",14:"=",15:"+",16:"(",17:")",18:"<",19:">",20:"-",21:"*",22:"/",23:"^",24:"E",25:"FUNCTION",29:":",30:"SHEET",31:"!",32:"NUMBER",33:"$",34:"REF",35:";",36:",",37:"VARIABLE",38:"DECIMAL",39:"%"},
productions_: [0,[3,1],[3,2],[5,1],[5,1],[5,1],[5,1],[5,1],[5,1],[5,1],[5,3],[5,3],[5,3],[5,3],[5,4],[5,4],[5,4],[5,3],[5,3],[5,3],[5,3],[5,3],[5,3],[5,2],[5,2],[5,1],[5,3],[5,4],[5,1],[27,1],[27,3],[27,3],[27,5],[28,2],[28,3],[28,3],[28,4],[28,1],[28,2],[28,2],[28,2],[28,3],[28,3],[28,3],[28,3],[28,3],[28,3],[28,4],[28,4],[28,4],[26,1],[26,2],[26,2],[26,3],[26,3],[6,1],[6,3],[9,1],[9,3],[9,2]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:

        return null;
    
break;
case 2:

    	var types = yy.types;
    	yy.types = [];
        return types;
    
break;
case 3:

        //js

			var type = {
		    	t: 'm',
		    	m: 'variable',
		    	a: [$$[$0]]
		    };
		    this.$ = yy.types.length;
		    yy.types.push(type);

        /*php
            this.$ = $this->variable($$[$0]);
        */
    
break;
case 4:

	    //js

            var type = {
            	t: 'm',
                m: 'time',
            	a: [$$[$0], true]
            };
            this.$ = yy.types.length;
            yy.types.push(type);
        //
    
break;
case 5:

        //js
            
            var type = {
            	t: 'm',
                m: 'time',
            	a: [$$[$0]]
            };
            this.$ = yy.types.length;
            yy.types.push(type);
        //

    
break;
case 6:

	    //js
	        
            var type = {
            	t: 'm',
            	m: 'number',
            	a: [$$[$0]]
            };
            this.$ = yy.types.length;
			yy.types.push(type);

        /*php
            this.$ = $$[$0] * 1;
        */
    
break;
case 7:

        //js
            
            var type = {
            	t: 'v',
            	v: yy.escape($$[$0].substring(1, $$[$0].length - 1))
            };
            this.$ = yy.types.length;
            yy.types.push(type);

        /*php
	        this.$ = substr($$[$0], 1, -1);
        */
    
break;
case 8:

        //js

            var type = {
            	t: 'v',
            	v: yy.escape($$[$0].substring(2, $$[$0].length - 2))
            };
            this.$ = yy.types.length;
            yy.types.push(type);

        /*php
            this.$ = substr($$[$0], 2, -2);
        */
    
break;
case 9:

        var type = {
        	t: 'v',
        	v: $$[$0]
        };
        yy.types.push(type);
    
break;
case 10:

        //js
            
            var type = {
            	t: 'm',
            	m: 'concatenate',
            	a: [$$[$0-2], $$[$0]]
            };
            this.$ = yy.types.length;
            yy.types.push(type);

        /*php
            this.$ = $$[$0-2] . '' . $$[$0];
        */
    
break;
case 11:

	    //js
	        
            var type = {
            	t: 'm',
            	m: 'callFunction',
            	a: ['EQUAL', [$$[$0-2], $$[$0]]]
            };
            this.$ = yy.types.length;
            yy.types.push(type);

        /*php
            this.$ = $$[$0-2] == $$[$0];
        */
    
break;
case 12:

	    //js

			var type = {
				t: 'm',
				m: 'performMath',
				a: ['+', $$[$0-2], $$[$0]]
			};
			this.$ = yy.types.length;
			yy.types.push(type);

        /*php
			if (is_numeric($$[$0-2]) && is_numeric($$[$0])) {
			   this.$ = $$[$0-2] + $$[$0];
			} else {
			   this.$ = $$[$0-2] . $$[$0];
			}
        */
    
break;
case 13:

	    //js
	        
	        this.$ = $$[$0-1];
        //
	
break;
case 14:

        //js
            
            var type = {
            	t: 'm',
            	m: 'callFunction',
            	a: ['LESS_EQUAL', [$$[$0-3], $$[$0]]]
            };
            this.$ = yy.types.length;
            yy.types.push(type);

        /*php
            this.$ = ($$[$0-3] * 1) <= ($$[$0] * 1);
        */
    
break;
case 15:

        //js
            
            var type = {
            	t: 'm',
            	m: 'callFunction',
            	a: ['GREATER_EQUAL', [$$[$0-3], $$[$0]]]
            };
            this.$ = yy.types.length;
            yy.types.push(type);

        /*php
            this.$ = ($$[$0-3] * 1) >= ($$[$0] * 1);
        */
    
break;
case 16:

		//js

			var type = {
				t: 'm',
				m: 'not',
				a: [$$[$0-3], $$[$0]]
			};
			this.$ = yy.types.length;
			yy.types.push(type);

		/*php
        	this.$ = ($$[$0-3]) != ($$[$0]);
		*/
    
break;
case 17:

	    //js
	        
			var type = {
				t: 'm',
				m: 'callFunction',
				a: ['GREATER', [$$[$0-2], $$[$0]]]
			};
			this.$ = yy.types.length;
			yy.types.push(type);

		/*php
		    this.$ = ($$[$0-2] * 1) > ($$[$0] * 1);
        */
    
break;
case 18:

        //js
            
            var type = {
            	t: 'm',
            	m: 'callFunction',
            	a: ['LESS', [$$[$0-2], $$[$0]]]
            };
            this.$ = yy.types.length;
            yy.types.push(type);

        /*php
            this.$ = ($$[$0-2] * 1) < ($$[$0] * 1);
        */
    
break;
case 19:

        //js
            
            var type = {
            	t: 'm',
            	m: 'performMath',
            	a: ['-', $$[$0-2], $$[$0]]
			};
			this.$ = yy.types.length;
			yy.types.push(type);

        /*php
            this.$ = ($$[$0-2] * 1) - ($$[$0] * 1);
        */
    
break;
case 20:

	    //js
	        
            var type = {
            	t: 'm',
            	m: 'performMath',
            	a: ['*', $$[$0-2], $$[$0]]
            };
            this.$ = yy.types.length;
            yy.types.push(type);

        /*php
            this.$ = ($$[$0-2] * 1) * ($$[$0] * 1);
        */
    
break;
case 21:

	    //js
	        
            var type = {
            	t: 'm',
            	m: 'performMath',
            	a: ['/', $$[$0-2], $$[$0]]
            };
            this.$ = yy.types.length;
            yy.types.push(type);

        /*php
            this.$ = ($$[$0-2] * 1) / ($$[$0] * 1);
        */
    
break;
case 22:

        //js

            var type = {
            	t: 'm',
            	m: 'performMath',
            	a: ['^', $$[$0-2], $$[$0]]
            };
            this.$ = yy.types.length;
            yy.types.push(type);

        /*php
            this.$ = pow(($$[$0-2] * 1), ($$[$0] * 1));
        */
    
break;
case 23:

		//js

			var type = {
				t: 'm',
				m: 'invertNumber',
				a: [$$[$0]]
			};
			this.$ = yy.types.length;
			yy.types.push(type);

        /*php
            this.$ = $$[$0-1] * 1;
        */
	
break;
case 24:

	    //js

	        var type = {
	        	t: 'm',
				m: 'number',
				a: [$$[$0]]
	        };
	        this.$ = yy.types.length;
	        yy.types.push(type);

        /*php
            this.$ = $$[$0-1] * 1;
        */
	
break;
case 25:
/*this.$ = Math.E;*/;
break;
case 26:

	    //js
	        
			var type = {
				t: 'm',
				m: 'callFunction',
				a: [$$[$0-2]]
			};
			this.$ = yy.types.length;
			yy.types.push(type);

		/*php
		    this.$ = $this->callFunction($$[$0-2]);
        */
    
break;
case 27:

	    //js
	        
			var type = {
				t: 'm',
				m: 'callFunction',
				a: [$$[$0-3], $$[$0-1]]
			};
			this.$ = yy.types.length;
			yy.types.push(type);

        /*php
            this.$ = $this->callFunction($$[$0-3], $$[$0-1]);
        */
    
break;
case 29:

	    //js
	        
			var type = {
				t: 'l',
				m: 'cellValue',
				a: [$$[$0]]
			};
			this.$ = yy.types.length;
			yy.types.push(type);

        /*php
            this.$ = $this->cellValue($$[$0]);
        */
    
break;
case 30:

	    //js

			var type = {
				t: 'l',
				m: 'cellRangeValue',
				a: [$$[$0-2], $$[$0]]
			};
			this.$ = yy.types.length;
			yy.types.push(type);

        /*php
            this.$ = $this->cellRangeValue($$[$0-2], $$[$0]);
        */
    
break;
case 31:

	    //js
			var type = {
				t: 'l',
				m: 'remoteCellValue',
				a: [$$[$0-2], $$[$0]]
			};
			this.$ = yy.types.length;
			yy.types.push(type);

        /*php
            this.$ = $this->remoteCellValue($$[$0-2], $$[$0]);
        */
    
break;
case 32:

	    //js
            var type = {
            	t: 'l',
            	m: 'remoteCellRangeValue',
            	a: [$$[$0-4], $$[$0-2], $$[$0]]
            };
            this.$ = yy.types.length;
            yy.types.push(type);

        /*php
            this.$ = $this->remoteCellRangeValue($$[$0-4], $$[$0-2], $$[$0]);
        */
    
break;
case 33:

		//js
			var type = {
				t: 'cell',
				c: $$[$0-1],
				r: $$[$0]
			};
			this.$ = yy.types.length;
			yy.types.push(type);
	
break;
case 34:

		//js
            var type = {
            	t: 'cell',
                c: $$[$0-1],
                r: $$[$0]
            };
            this.$ = yy.types.length;
            yy.types.push(type);
	
break;
case 35: case 36:

        //js
            var type = {
            	t: 'cell',
                c: $$[$0-2],
                r: $$[$0]
            };
            this.$ = yy.types.length;
            yy.types.push(type);
    
break;
case 37: case 38: case 39: case 40: case 41: case 42: case 43: case 44: case 45: case 46: case 47: case 48: case 49:
return '#REF!';
break;
case 50:

	    //js
            this.$ = [$$[$0]];

        /*php
            this.$ = array($$[$0]);
        */
    
break;
case 53:

	    //js
	        $$[$0-2].push($$[$0]);
	        this.$ = $$[$0-2];

        /*php
            $$[$0-2][] = $$[$0];
            this.$ = $$[$0-2];
        */
    
break;
case 54:

 	    //js
	        $$[$0-2].push($$[$0]);
	        this.$ = $$[$0-2];

        /*php
			$$[$0-2][] = $$[$0];
			this.$ = $$[$0-2];
        */
    
break;
case 55:

        this.$ = [$$[$0]];
    
break;
case 56:

        //js
            this.$ = ($$[$0-2] instanceof Array ? $$[$0-2] : [$$[$0-2]]);
            this.$.push($$[$0]);

        /*php
            this.$ = (is_array($$[$0-2]) ? $$[$0-2] : array());
            this.$[] = $$[$0];
        */
    
break;
case 57:

        this.$ = $$[$0];
    
break;
case 58:

        //js
            this.$ = $$[$0-2] + '.' + $$[$0];

        /*php
            this.$ = $$[$0-2] . '.' . $$[$0];
        */
    
break;
case 59:

		//js
        	this.$ = ($$[$0-1] * 0.01) + '';

        /*php
        	this.$ = ($$[$0-1] * 0.01) . '';
        */
    
break;
}
},
table: [{3:1,4:[1,2],5:3,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},{1:[3]},{1:[2,1]},{4:[1,23],13:$Vf,14:$Vg,15:$Vh,18:$Vi,19:$Vj,20:$Vk,21:$Vl,22:$Vm,23:$Vn},o($Vo,[2,3],{38:[1,33]}),o($Vo,[2,4]),o($Vo,[2,5]),o($Vo,[2,6],{39:[1,34]}),o($Vo,[2,7]),o($Vo,[2,8]),o($Vo,[2,9],{32:$Vp,33:$Vq,34:$Vr}),{5:38,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},{5:39,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},{5:40,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},o($Vo,[2,25]),{16:[1,41]},o($Vo,[2,28]),o($Vs,[2,55]),o($Vt,[2,57],{38:[1,42]}),o($Vo,[2,29],{29:[1,43]}),{31:[1,44]},{12:[1,45],34:[1,46]},o($Vu,[2,37],{32:[1,47],33:[1,49],34:[1,48]}),{1:[2,2]},{5:50,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},{5:51,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},{5:52,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},{5:55,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,14:[1,53],15:$V5,16:$V6,19:[1,54],20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},{5:57,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,14:[1,56],15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},{5:58,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},{5:59,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},{5:60,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},{5:61,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},{37:[1,62]},o($Vt,[2,59]),o($Vu,[2,33]),{32:[1,63],34:[1,64]},o($Vu,[2,39]),{13:$Vf,14:$Vg,15:$Vh,17:[1,65],18:$Vi,19:$Vj,20:$Vk,21:$Vl,22:$Vm,23:$Vn},o($Vv,[2,23],{13:$Vf,21:$Vl,22:$Vm,23:$Vn}),o($Vv,[2,24],{13:$Vf,21:$Vl,22:$Vm,23:$Vn}),{5:68,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,17:[1,66],20:$V7,24:$V8,25:$V9,26:67,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},{32:[1,69]},{12:$Vw,28:70,33:$Vc,34:$Vd},{12:$Vw,28:72,33:$Vc,34:$Vd},{32:[1,73],33:[1,74],34:[1,75]},{32:[1,76],33:[1,78],34:[1,77]},o($Vu,[2,38]),o($Vu,[2,40]),{32:[1,79],34:[1,80]},o([4,17,35,36],[2,10],{13:$Vf,14:$Vg,15:$Vh,18:$Vi,19:$Vj,20:$Vk,21:$Vl,22:$Vm,23:$Vn}),o([4,14,17,35,36],[2,11],{13:$Vf,15:$Vh,18:$Vi,19:$Vj,20:$Vk,21:$Vl,22:$Vm,23:$Vn}),o($Vv,[2,12],{13:$Vf,21:$Vl,22:$Vm,23:$Vn}),{5:81,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},{5:82,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},o($Vx,[2,18],{13:$Vf,15:$Vh,20:$Vk,21:$Vl,22:$Vm,23:$Vn}),{5:83,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},o($Vx,[2,17],{13:$Vf,15:$Vh,20:$Vk,21:$Vl,22:$Vm,23:$Vn}),o($Vv,[2,19],{13:$Vf,21:$Vl,22:$Vm,23:$Vn}),o($Vy,[2,20],{13:$Vf,23:$Vn}),o($Vy,[2,21],{13:$Vf,23:$Vn}),o([4,14,15,17,18,19,20,21,22,23,35,36],[2,22],{13:$Vf}),o($Vs,[2,56]),o($Vu,[2,35]),o($Vu,[2,45]),o($Vo,[2,13]),o($Vo,[2,26]),{17:[1,84],35:[1,85],36:[1,86]},o($Vz,[2,50],{13:$Vf,14:$Vg,15:$Vh,18:$Vi,19:$Vj,20:$Vk,21:$Vl,22:$Vm,23:$Vn}),o($Vt,[2,58]),o($Vo,[2,30]),{32:$Vp,33:$Vq,34:$Vr},o($Vo,[2,31],{29:[1,87]}),o($Vu,[2,34]),{32:[1,88]},o($Vu,[2,42]),o($Vu,[2,41]),o($Vu,[2,43]),{32:[1,89],34:[1,90]},o($Vu,[2,44]),o($Vu,[2,46]),o($Vx,[2,14],{13:$Vf,15:$Vh,20:$Vk,21:$Vl,22:$Vm,23:$Vn}),o($Vx,[2,16],{13:$Vf,15:$Vh,20:$Vk,21:$Vl,22:$Vm,23:$Vn}),o($Vx,[2,15],{13:$Vf,15:$Vh,20:$Vk,21:$Vl,22:$Vm,23:$Vn}),o($Vo,[2,27]),o($Vz,[2,51],{6:4,9:7,27:16,28:19,5:91,7:$V0,8:$V1,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve}),o($Vz,[2,52],{6:4,9:7,27:16,28:19,5:92,7:$V0,8:$V1,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve}),{12:$Vw,28:93,33:$Vc,34:$Vd},o($Vu,[2,36]),o($Vu,[2,47]),o($Vu,[2,49]),o($Vz,[2,53],{13:$Vf,14:$Vg,15:$Vh,18:$Vi,19:$Vj,20:$Vk,21:$Vl,22:$Vm,23:$Vn}),o($Vz,[2,54],{13:$Vf,14:$Vg,15:$Vh,18:$Vi,19:$Vj,20:$Vk,21:$Vl,22:$Vm,23:$Vn}),o($Vo,[2,32])],
defaultActions: {2:[2,1],23:[2,2]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        throw new Error(str);
    }
},
parse: function parse(input) {
    var self = this,
        stack = [0],
        tstack = [], // token stack
        vstack = [null], // semantic value stack
        lstack = [], // location stack
        table = this.table,
        yytext = '',
        yylineno = 0,
        yyleng = 0,
        recovering = 0,
        TERROR = 2,
        EOF = 1;

    var args = lstack.slice.call(arguments, 1);

    //this.reductionCount = this.shiftCount = 0;

    var lexer = Object.create(this.lexer);
    var sharedState = { yy: {} };
    // copy state
    for (var k in this.yy) {
      if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
        sharedState.yy[k] = this.yy[k];
      }
    }

    lexer.setInput(input, sharedState.yy);
    sharedState.yy.lexer = lexer;
    sharedState.yy.parser = this;
    if (typeof lexer.yylloc == 'undefined') {
        lexer.yylloc = {};
    }
    var yyloc = lexer.yylloc;
    lstack.push(yyloc);

    var ranges = lexer.options && lexer.options.ranges;

    if (typeof sharedState.yy.parseError === 'function') {
        this.parseError = sharedState.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }

    function popStack (n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }

_token_stack:
    function lex() {
        var token;
        token = lexer.lex() || EOF;
        // if token isn't its numeric value, convert
        if (typeof token !== 'number') {
            token = self.symbols_[token] || token;
        }
        return token;
    }

    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        // retreive state number from top of stack
        state = stack[stack.length - 1];

        // use default actions if available
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            // read action for current state and first input
            action = table[state] && table[state][symbol];
        }

_handle_error:
        // handle parse error
        if (typeof action === 'undefined' || !action.length || !action[0]) {
            var error_rule_depth;
            var errStr = '';

            // Return the rule stack depth where the nearest error rule can be found.
            // Return FALSE when no error recovery rule was found.
            function locateNearestErrorRecoveryRule(state) {
                var stack_probe = stack.length - 1;
                var depth = 0;

                // try to recover from error
                for(;;) {
                    // check for error recovery rule in this state
                    if ((TERROR.toString()) in table[state]) {
                        return depth;
                    }
                    if (state === 0 || stack_probe < 2) {
                        return false; // No suitable error recovery rule available.
                    }
                    stack_probe -= 2; // popStack(1): [symbol, action]
                    state = stack[stack_probe];
                    ++depth;
                }
            }

            if (!recovering) {
                // first see if there's any chance at hitting an error recovery rule:
                error_rule_depth = locateNearestErrorRecoveryRule(state);

                // Report error
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push("'"+this.terminals_[p]+"'");
                    }
                }
                if (lexer.showPosition) {
                    errStr = 'Parse error on line '+(yylineno+1)+":\n"+lexer.showPosition()+"\nExpecting "+expected.join(', ') + ", got '" + (this.terminals_[symbol] || symbol)+ "'";
                } else {
                    errStr = 'Parse error on line '+(yylineno+1)+": Unexpected " +
                                  (symbol == EOF ? "end of input" :
                                              ("'"+(this.terminals_[symbol] || symbol)+"'"));
                }
                return this.parseError(errStr, {
                    text: lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: lexer.yylineno,
                    loc: yyloc,
                    expected: expected,
                    recoverable: (error_rule_depth !== false)
                });
            } else if (preErrorSymbol !== EOF) {
                error_rule_depth = locateNearestErrorRecoveryRule(state);
            }

            // just recovered from another error
            if (recovering == 3) {
                if (symbol === EOF || preErrorSymbol === EOF) {
                    throw new Error(errStr || 'Parsing halted while starting to recover from another error.');
                }

                // discard current lookahead and grab another
                yyleng = lexer.yyleng;
                yytext = lexer.yytext;
                yylineno = lexer.yylineno;
                yyloc = lexer.yylloc;
                symbol = lex();
            }

            // try to recover from error
            if (error_rule_depth === false) {
                throw new Error(errStr || 'Parsing halted. No suitable error recovery rule available.');
            }
            popStack(error_rule_depth);

            preErrorSymbol = (symbol == TERROR ? null : symbol); // save the lookahead token
            symbol = TERROR;         // insert generic error symbol as new lookahead
            state = stack[stack.length-1];
            action = table[state] && table[state][TERROR];
            recovering = 3; // allow 3 real symbols to be shifted before reporting a new error
        }

        // this shouldn't happen, unless resolve defaults are off
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: '+state+', token: '+symbol);
        }

        switch (action[0]) {
            case 1: // shift
                //this.shiftCount++;

                stack.push(symbol);
                vstack.push(lexer.yytext);
                lstack.push(lexer.yylloc);
                stack.push(action[1]); // push state
                symbol = null;
                if (!preErrorSymbol) { // normal execution/no error
                    yyleng = lexer.yyleng;
                    yytext = lexer.yytext;
                    yylineno = lexer.yylineno;
                    yyloc = lexer.yylloc;
                    if (recovering > 0) {
                        recovering--;
                    }
                } else {
                    // error just occurred, resume old lookahead f/ before error
                    symbol = preErrorSymbol;
                    preErrorSymbol = null;
                }
                break;

            case 2:
                // reduce
                //this.reductionCount++;

                len = this.productions_[action[1]][1];

                // perform semantic action
                yyval.$ = vstack[vstack.length-len]; // default to $$ = $1
                // default location, uses first token for firsts, last for lasts
                yyval._$ = {
                    first_line: lstack[lstack.length-(len||1)].first_line,
                    last_line: lstack[lstack.length-1].last_line,
                    first_column: lstack[lstack.length-(len||1)].first_column,
                    last_column: lstack[lstack.length-1].last_column
                };
                if (ranges) {
                  yyval._$.range = [lstack[lstack.length-(len||1)].range[0], lstack[lstack.length-1].range[1]];
                }
                r = this.performAction.apply(yyval, [yytext, yyleng, yylineno, sharedState.yy, action[1], vstack, lstack].concat(args));

                if (typeof r !== 'undefined') {
                    return r;
                }

                // pop off stack
                if (len) {
                    stack = stack.slice(0,-1*len*2);
                    vstack = vstack.slice(0, -1*len);
                    lstack = lstack.slice(0, -1*len);
                }

                stack.push(this.productions_[action[1]][0]);    // push nonterminal (reduce)
                vstack.push(yyval.$);
                lstack.push(yyval._$);
                // goto new state = table[STATE][NONTERMINAL]
                newState = table[stack[stack.length-2]][stack[stack.length-1]];
                stack.push(newState);
                break;

            case 3:
                // accept
                return true;
        }

    }

    return true;
}};

var Formula = function() {
	var formulaLexer = function () {};
	formulaLexer.prototype = parser.lexer;

	var formulaParser = function () {
		this.lexer = new formulaLexer();
		this.yy = {
			types: [],
			escape: function(value) {
				return value
					.replace(/&/gi, '&amp;')
					.replace(/>/gi, '&gt;')
					.replace(/</gi, '&lt;')
					.replace(/\n/g, '\n<br>')
					.replace(/\t/g, '&nbsp;&nbsp;&nbsp ')
					.replace(/  /g, '&nbsp; ');
			},
			parseError: function(msg, hash) {
				this.done = true;
				var result = new String();
				result.html = '<pre>' + msg + '</pre>';
				result.hash = hash;
				return result;
			}
		};
	};

	formulaParser.prototype = parser;
	var newParser = new formulaParser();
	return newParser;
};
if (typeof(window) !== 'undefined') {
	window.Formula = Formula;
} else {
	parser.Formula = Formula;
}/* generated by jison-lex 0.3.4 */
var lexer = (function(){
var lexer = ({

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input, yy) {
        this.yy = yy || this.yy || {};
        this._input = new Parser.InputReader(input);
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input.ch();
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input.unCh(len, ch);
        this.yytext = this.yytext.substr(0, this.yytext.length - len);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var matched = this._input.toString();
        var past = matched.substr(0, matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this._input.input.substr(this._input.position, this._input.input.length - 1);
        return (next.substr(0, 20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function (match, indexed_rule) {
        var token,
            lines,
            backup,
            k;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines !== null ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match.length
        };
        this.yytext += match;
        this.match += match;
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input.addMatch(match);
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && !this._input.done) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (k in backup) if (backup.hasOwnProperty(k)) {
                this[k] = backup[k];
            }
            return null; // rule action called reject() implying the next rule should be tested instead.
        }
        return null;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (this._input.done) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch !== null && (match === undefined || tempMatch[0].length > match.length)) {
                match = tempMatch[0];
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch[0], rules[i]);
                    if (token !== null) {
                        return token;
                    } else if (this._backtrack) {
                        match = undefined;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return null;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match !== undefined) {
            token = this.test_match(match, rules[index]);
            if (token !== null) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return null;
        }
        if (this._input.done) {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex() {
        var r = this.next();
        if (r !== null) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState(condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {
var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:/* skip whitespace */
break;
case 1:return 25;
break;
case 2:return 7;
break;
case 3:return 8;
break;
case 4:
	return 30;

break;
case 5:
    //js
        yy_.yytext = yy_.yytext.substring(1, yy_.yytext.length - 1);
        return 30;

    /*php
        $yy_.yytext = substr($yy_.yytext, 1, -1);
        return 30;
    */

break;
case 6:return 10;
break;
case 7:return 10;
break;
case 8:return 11;
break;
case 9:return 11;
break;
case 10:return 12;
break;
case 11:return 37;
break;
case 12:return 37;
break;
case 13:return 32;
break;
case 14:return 33;
break;
case 15:return 13;
break;
case 16:return ' ';
break;
case 17:return 38;
break;
case 18:return 29;
break;
case 19:return 35;
break;
case 20:return 36;
break;
case 21:return 21;
break;
case 22:return 22;
break;
case 23:return 20;
break;
case 24:return 15;
break;
case 25:return 23;
break;
case 26:return 16;
break;
case 27:return 17;
break;
case 28:return 19;
break;
case 29:return 18;
break;
case 30:return 'PI';
break;
case 31:return 24;
break;
case 32:return '"';
break;
case 33:return "'";
break;
case 34:return '\"';
break;
case 35:return "\'";
break;
case 36:return "!";
break;
case 37:return 14;
break;
case 38:return 39;
break;
case 39:return 34;
break;
case 40:return '#';
break;
case 41:return 4;
break;
}
},
rules: [/^(?:\s+)/,/^(?:([A-Za-z]{1,})([A-Za-z_0-9]+)?(?=[(]))/,/^(?:([0]?[1-9]|1[0-2])[:][0-5][0-9]([:][0-5][0-9])?[ ]?(AM|am|aM|Am|PM|pm|pM|Pm))/,/^(?:([0]?[0-9]|1[0-9]|2[0-3])[:][0-5][0-9]([:][0-5][0-9])?)/,/^(?:(([A-Za-z0-9]+))(?=[!]))/,/^(?:((['](\\[']|[^'])*['])|(["](\\["]|[^"])*["]))(?=[!]))/,/^(?:((['](\\[']|[^'])*['])))/,/^(?:((["](\\["]|[^"])*["])))/,/^(?:(([\\]['].+?[\\]['])))/,/^(?:(([\\]["].+?[\\]["])))/,/^(?:[A-Z]+(?=[0-9$]))/,/^(?:[A-Za-z]{1,}[A-Za-z_0-9]+)/,/^(?:[A-Za-z_]+)/,/^(?:[0-9]+)/,/^(?:\$)/,/^(?:&)/,/^(?: )/,/^(?:[.])/,/^(?::)/,/^(?:;)/,/^(?:,)/,/^(?:\*)/,/^(?:\/)/,/^(?:-)/,/^(?:\+)/,/^(?:\^)/,/^(?:\()/,/^(?:\))/,/^(?:>)/,/^(?:<)/,/^(?:PI\b)/,/^(?:E\b)/,/^(?:")/,/^(?:')/,/^(?:\\")/,/^(?:\\')/,/^(?:!)/,/^(?:=)/,/^(?:%)/,/^(?:#REF!)/,/^(?:[#])/,/^(?:$)/],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41],"inclusive":true}}
});
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}Parser.prototype = parser;

/**
 * in input reader for parser/lexer, uses sticky behavior when available, falls back to standard string modification when it is not
 * @param {String} input
 */
Parser.InputReader = (function(Math, parser, lexer) {
    var stickyCompatible = RegExp.prototype.sticky !== undefined,
        rules,
        rule,
        max,
        i;

    function Parser_InputReader(input) {
        this.done = false;
        this.input = input;
        this.length = input.length;
        this.matches = [];
        this.position = 0;
    }

	//sticky implementation
    if (stickyCompatible) {
        Parser_InputReader.prototype = {
            addMatch: function addMatch(match) {
                this.matches.push(match);
                this.position += match.length;
                this.done = (this.position >= this.length);
            },

            ch: function ch() {
                var ch = this.input[this.position];
                this.addMatch(ch);
                return ch;
            },

            unCh: function unCh(chLength) {
                this.position -= chLength;
                this.position = Math.max(0, this.position);
                this.done = (this.position >= this.length);
            },

            substring: function substring(start, end) {
                start = (start != 0 ? this.position + start : this.position);
                end = (end != 0 ? start + end : this.length);
                return this.input.substring(start, end);
            },

            match: function match(rule) {
                var match;
                rule.lastIndex = this.position;
                if ((match = rule.exec(this.input)) !== null) {
                    return match;
                }
                return null;
            },

            toString: function toString() {
                return this.matches.join('');
            }
        };

        rules = lexer.rules;
        max = rules.length;
        i = 0;
        for(;i < max; i++) {
            rule = rules[i];
            rules[i] = new RegExp(rule.source.substring(1),'y');
        }
    }

    //fallback to non-sticky implementations
    else {

        Parser_InputReader.prototype = {
            addMatch: function addMatch(match) {
                this.input = this.input.slice(match.length);
                this.matches.push(match);
                this.position += match.length;
                this.done = (this.position >= this.length);
            },

            ch: function ch() {
                var ch = this.input[0];
                this.addMatch(ch);
                return ch;
            },

            unCh: function unCh(chLength, ch) {
                this.position -= chLength;
                this.position = Math.max(0, this.position);
	            this.input = ch + this.input;
                this.done = (this.position >= this.length);
            },

            substring: function substring(start, end) {
                start = (start != 0 ? this.position + start : this.position);
                end = (end != 0 ? start + end : this.length);
                return this.input.substring(start, end);
            },

            match: function match(rule) {
                var match,
                    input = this.input;

                if ((match = input.match(rule)) !== null) {
                    return match;
                }

                return null;
            },

            toString: function toString() {
                return this.matches.join('');
            }
        };
    }

    return Parser_InputReader;
})(Math, parser, lexer);
parser.Parser = Parser;
return new Parser;
})();


if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = parser;
exports.Parser = parser.Parser;
exports.parse = function () { return parser.parse.apply(parser, arguments); };
exports.main = function commonjsMain(args) {
    if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
    }
    var source = require('fs').readFileSync(require('path').normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(process.argv.slice(1));
}
}/* parser generated by jison 0.4.15 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var parser = (function(){
var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[1,10],$V1=[1,11],$V2=[1,12],$V3=[1,13],$V4=[5,7,8,9,10],$V5=[1,19],$V6=[1,20],$V7=[5,7,8,9,10,12,13],$V8=[1,21],$V9=[5,7,8,9,10,12,13,14,16];
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"grid":3,"rows":4,"EOF":5,"row":6,"END_OF_LINE":7,"END_OF_LINE_WITH_EMPTY_NEXT_FIRST_COLUMN":8,"END_OF_LINE_WITH_NO_COLUMNS":9,"END_OF_LINE_WITH_EMPTY_COLUMN":10,"string":11,"COLUMN_EMPTY":12,"COLUMN_STRING":13,"CHAR":14,"QUOTE_ON":15,"QUOTE_OFF":16,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",7:"END_OF_LINE",8:"END_OF_LINE_WITH_EMPTY_NEXT_FIRST_COLUMN",9:"END_OF_LINE_WITH_NO_COLUMNS",10:"END_OF_LINE_WITH_EMPTY_COLUMN",12:"COLUMN_EMPTY",13:"COLUMN_STRING",14:"CHAR",15:"QUOTE_ON",16:"QUOTE_OFF"},
productions_: [0,[3,2],[3,1],[4,1],[4,1],[4,1],[4,1],[4,1],[4,2],[4,2],[4,2],[4,2],[4,3],[4,3],[4,3],[4,3],[6,1],[6,1],[6,2],[6,3],[6,1],[6,2],[6,3],[11,1],[11,2],[11,3]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:

		return $$[$0-1];
	
break;
case 2:

		return [['']];
	
break;
case 3:

	    //row
		this.$ = [$$[$0]];
	
break;
case 4:

	    //END_OF_LINE
        this.$ = [];
	
break;
case 5:

	    //END_OF_LINE_WITH_EMPTY_NEXT_FIRST_COLUMN
	    this.$ = [''];
	
break;
case 6:

	    //END_OF_LINE_WITH_NO_COLUMNS
	    this.$ = [''];
	
break;
case 7:

        //END_OF_LINE_WITH_EMPTY_COLUMN
        this.$ = [''];
    
break;
case 8:

        //rows END_OF_LINE
        this.$ = $$[$0-1];
    
break;
case 9:

        //rows END_OF_LINE_WITH_EMPTY_NEXT_FIRST_COLUMN
        $$[$0-1].push(['']);
        this.$ = $$[$0-1];
    
break;
case 10:

        //rows END_OF_LINE_WITH_NO_COLUMNS
        $$[$0-1].push(['']);
        this.$ = $$[$0-1];
    
break;
case 11:

        //rows END_OF_LINE_WITH_EMPTY_COLUMN
        $$[$0-1][$$[$0-1].length - 1].push('');
        this.$ = $$[$0-1];
    
break;
case 12:

        //rows END_OF_LINE row
        $$[$0-2].push($$[$0]);
        this.$ = $$[$0-2];
    
break;
case 13:

        //rows END_OF_LINE_WITH_EMPTY_NEXT_FIRST_COLUMN row
        $$[$0].unshift('');
        $$[$0-2].push($$[$0]);
        this.$ = $$[$0-2];
    
break;
case 14:

        //rows END_OF_LINE_WITH_NO_COLUMNS row
        $$[$0-2].push(['']);
        $$[$0-2].push($$[$0]);
        this.$ = $$[$0-2];
    
break;
case 15:

        //rows END_OF_LINE_WITH_EMPTY_COLUMN row
        $$[$0-2][$$[$0-2].length - 1].push('');
        $$[$0-2].push($$[$0]);
        this.$ = $$[$0-2];
    
break;
case 16:

	    //string
		this.$ = [$$[$0].join('')];
	
break;
case 17:

	    //COLUMN_EMPTY
		this.$ = [''];
	
break;
case 18:

        //row COLUMN_EMPTY
        $$[$0-1].push('');
        this.$ = $$[$0-1];
    
break;
case 19:

        //row COLUMN_EMPTY string
        $$[$0-2].push('');
        $$[$0-2].push($$[$0].join(''));
        this.$ = $$[$0-2];
    
break;
case 20:

        //COLUMN_STRING
    
break;
case 21:

        //row COLUMN_STRING
    
break;
case 22:

        //row COLUMN_STRING string
        $$[$0-2].push($$[$0].join(''));
        this.$ = $$[$0-2];
    
break;
case 23:

	    //CHAR
		this.$ = [$$[$0]];
	
break;
case 24:

	    //string CHAR
		$$[$0-1].push($$[$0]);
		this.$ = $$[$0-1];
	
break;
case 25:

	    //QUOTE_ON string QUOTE_OFF
        this.$ = $$[$0-1];
    
break;
}
},
table: [{3:1,4:2,5:[1,3],6:4,7:[1,5],8:[1,6],9:[1,7],10:[1,8],11:9,12:$V0,13:$V1,14:$V2,15:$V3},{1:[3]},{5:[1,14],7:[1,15],8:[1,16],9:[1,17],10:[1,18]},{1:[2,2]},o($V4,[2,3],{12:$V5,13:$V6}),o($V4,[2,4]),o($V4,[2,5]),o($V4,[2,6]),o($V4,[2,7]),o($V7,[2,16],{14:$V8}),o($V7,[2,17]),o($V7,[2,20]),o($V9,[2,23]),{11:22,14:$V2,15:$V3},{1:[2,1]},o($V4,[2,8],{11:9,6:23,12:$V0,13:$V1,14:$V2,15:$V3}),o($V4,[2,9],{11:9,6:24,12:$V0,13:$V1,14:$V2,15:$V3}),o($V4,[2,10],{11:9,6:25,12:$V0,13:$V1,14:$V2,15:$V3}),o($V4,[2,11],{11:9,6:26,12:$V0,13:$V1,14:$V2,15:$V3}),o($V7,[2,18],{11:27,14:$V2,15:$V3}),o($V7,[2,21],{11:28,14:$V2,15:$V3}),o($V9,[2,24]),{14:$V8,16:[1,29]},o($V4,[2,12],{12:$V5,13:$V6}),o($V4,[2,13],{12:$V5,13:$V6}),o($V4,[2,14],{12:$V5,13:$V6}),o($V4,[2,15],{12:$V5,13:$V6}),o($V7,[2,19],{14:$V8}),o($V7,[2,22],{14:$V8}),o($V9,[2,25])],
defaultActions: {3:[2,2],14:[2,1]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        throw new Error(str);
    }
},
parse: function parse(input) {
    var self = this, stack = [0], tstack = [], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    var args = lstack.slice.call(arguments, 1);
    var lexer = Object.create(this.lexer);
    var sharedState = { yy: {} };
    for (var k in this.yy) {
        if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
            sharedState.yy[k] = this.yy[k];
        }
    }
    lexer.setInput(input, sharedState.yy);
    sharedState.yy.lexer = lexer;
    sharedState.yy.parser = this;
    if (typeof lexer.yylloc == 'undefined') {
        lexer.yylloc = {};
    }
    var yyloc = lexer.yylloc;
    lstack.push(yyloc);
    var ranges = lexer.options && lexer.options.ranges;
    if (typeof sharedState.yy.parseError === 'function') {
        this.parseError = sharedState.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    _token_stack:
        function lex() {
            var token;
            token = lexer.lex() || EOF;
            if (typeof token !== 'number') {
                token = self.symbols_[token] || token;
            }
            return token;
        }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(lexer.yytext);
            lstack.push(lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = lexer.yyleng;
                yytext = lexer.yytext;
                yylineno = lexer.yylineno;
                yyloc = lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.apply(yyval, [
                yytext,
                yyleng,
                yylineno,
                sharedState.yy,
                action[1],
                vstack,
                lstack
            ].concat(args));
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};

if (typeof GLOBAL !== 'undefined') {
    GLOBAL.window = GLOBAL;
}
if (typeof window.TSV === 'undefined') {
    var parse = parser.parse;
    parser.parse = function(input) {
        var setInput = this.lexer.setInput;
        this.lexer.setInput = function(input) {
            setInput.call(this, input);
            this.begin('BOF');
            return this;
        };

        this.parse = parse;
        return parse.call(this, input);
    };

	window.TSV = function(handler) {
		var TSVLexer = function () {};
		TSVLexer.prototype = parser.lexer;

		var TSVParser = function () {
			this.lexer = new TSVLexer();
			this.yy = {};
		};

		TSVParser.prototype = parser;
		var newParser = new TSVParser;
		newParser.setObj = function(obj) {
			newParser.yy.obj = obj;
		};
		newParser.yy.handler = handler;
		return newParser;
	};
}/* generated by jison-lex 0.3.4 */
var lexer = (function(){
var lexer = ({

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input, yy) {
        this.yy = yy || this.yy || {};
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        this._input = this._input.slice(1);
        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function (match, indexed_rule) {
        var token,
            lines,
            backup;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (var k in backup) {
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    } else if (this._backtrack) {
                        match = false;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex() {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState(condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {
var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:
    //<QUOTE>(\n|"\n")
    return 14;

break;
case 1:
    //<QUOTE>([\'\"])(?=<<EOF>>)
    this.popState();
    return 16;

break;
case 2:
    //<QUOTE>([\'\"])
    if (yy_.yytext == this.quoteChar) {
        this.popState();
        this.begin('STRING');
        return 16;
	} else {
	    return 14;
	}

break;
case 3:
    //<QUOTE>(?=(\t))
	this.popState();
	this.begin('STRING');
	return 14;

break;
case 4:
    //<BOF>([\'\"])
    this.popState();
    this.quoteChar = yy_.yytext.substring(0);
	this.begin('QUOTE');
	return 15;

break;
case 5:
    //<PRE_QUOTE>([\'\"])
    this.quoteChar = yy_.yytext;
    this.popState();
	this.begin('QUOTE');
	return 15;

break;
case 6:
    //(\t|"\t")(?=[\'\"])
	this.begin('PRE_QUOTE');
	return 13;

break;
case 7:
    //(\n|"\n")(?=[\'\"])
	this.begin('PRE_QUOTE');
	return 7;

break;
case 8:
    //<QUOTE>([a-zA-Z0-9_]+|.)
    return 14;

break;
case 9:
    //<STRING>(\n\n|"\n\n")
	this.popState();
	return 8;

break;
case 10:
    //<STRING>(\n\n|"\n\n")
	this.popState();
	return 9;

break;
case 11:
    //<STRING>(\n|"\n")
	this.popState();
	return 7;

break;
case 12:
    //<STRING>(\t|"\t")
	this.popState();
	return 13;

break;
case 13:
    //<STRING>([a-zA-Z0-9_ ]+|.)
    return 14;

break;
case 14:
    //<BOF>
    this.popState();

break;
case 15:
    return 'BUFFIN';

break;
case 16:
    //(\n\n|"\n\n")
    return 9;

break;
case 17:
    //(\t\n)
    return 10;

break;
case 18:
    //(\t)
    return 12;

break;
case 19:
    //(\n)
    return 7;

break;
case 20:
    //([a-zA-Z0-9_ ]+|.)
	this.begin('STRING');
	return 14;

break;
case 21:
    //<<EOF>>
    //lexer.yy.conditionStack = [];
    return 5;

break;
}
},
rules: [/^(?:(\n|\\n))/,/^(?:([\'\"])(?=$))/,/^(?:([\'\"]))/,/^(?:(?=(\t)))/,/^(?:([\'\"]))/,/^(?:([\'\"]))/,/^(?:(\t|\\t)(?=[\'\"]))/,/^(?:(\n|\\n)(?=[\'\"]))/,/^(?:([a-zA-Z0-9_ ]+|.))/,/^(?:(\n\t|\\n\\t))/,/^(?:(\n\n|\\n\\n))/,/^(?:(\n|\\n))/,/^(?:(\t|\\t))/,/^(?:([a-zA-Z0-9_ ]+|.))/,/^(?:)/,/^(?:(\n\t|\\n\\t)(?=.))/,/^(?:(\n\n|\\n\\n))/,/^(?:(\t\n))/,/^(?:(\t))/,/^(?:(\n))/,/^(?:([a-zA-Z0-9_ ]+|.))/,/^(?:$)/],
conditions: {"BOF":{"rules":[4,6,7,14,15,16,17,18,19,20,21],"inclusive":true},"PRE_QUOTE":{"rules":[5,6,7,15,16,17,18,19,20,21],"inclusive":true},"QUOTE":{"rules":[0,1,2,3,6,7,8,15,16,17,18,19,20,21],"inclusive":true},"STRING":{"rules":[6,7,9,10,11,12,13,15,16,17,18,19,20,21],"inclusive":true},"INITIAL":{"rules":[6,7,15,16,17,18,19,20,21],"inclusive":true}}
});
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();


if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = parser;
exports.Parser = parser.Parser;
exports.parse = function () { return parser.parse.apply(parser, arguments); };
exports.main = function commonjsMain(args) {
    if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
    }
    var source = require('fs').readFileSync(require('path').normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(process.argv.slice(1));
}
}