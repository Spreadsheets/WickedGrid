/**
 * @namespace
 * @type {Object}
 * @name jQuery
 */
$.fn.extend({
  /**
   * @memberOf jQuery
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
   * cellSelectModel {String} default Sheet.excelSelectModel, accepts Sheet.excelSelectModel, Sheet.openOfficeSelectModel, or Sheet.googleDriveSelectModel, makes the select model act differently
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
        me = $(this),
        instance = me.getWickedGrid();

      settings.useStack = (window.thaw === undefined ? false : settings.useStack);
      settings.useMultiThreads = (window.operative === undefined ? false : settings.useMultiThreads);

      //destroy already existing spreadsheet
      if (instance) {
        var tables = me.children().detach();
        instance.kill();
        me.html(tables);

        WickedGrid.events.forEach(me.unbind);
      }

      settings.element = element;

      if ((this.className || '').match(/\bnot-editable\b/i) != null) {
        settings.editable = false;
      }

      WickedGrid.events.forEach(function(event) {
          me.bind(event, settings[event]);
      });

      me.children().each(function(i) {
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
   * @memberOf jQuery()
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
   * @memberOf jQuery()
   * @returns {WickedGrid}
   */
  getWickedGrid:function () {
    var wickedGrid = null;

    //detect running instance on parent
    WickedGrid.instance.forEach(function(_wickedGrid) {
      if (!wickedGrid && _wickedGrid.parent === parent) {
        wickedGrid = _wickedGrid;
      }
    });

    return wickedGrid;
  },

  /**
   * Get cell value
   * @memberOf jQuery()
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
   * @memberOf jQuery()
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
   * @memberOf jQuery()
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
   * @memberOf jQuery()
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
   * @memberOf jQuery()
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
   * @memberOf jQuery()
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
   * @memberOf jQuery()
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
   * @memberOf jQuery()
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