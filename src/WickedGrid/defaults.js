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