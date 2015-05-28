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
	 * sheetRename - occurs just after a spreadsheet is renamed, to obtain new title jS.obj.table().attr('title');
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
	 * sheetSave - an assistance event called when calling jS.toggleState(), but not tied to anything internally
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
	 *			  "What I want my command to say": function() {}
	 *		  }
	 *
	 * contextmenuLeft {Object} default is standard list of commands for context menus when right click
	 *	  Javascript example:
	 *		  {
	 *			  "What I want my command to say": function() {}
	 *		  }
	 *
	 * contextmenuCell {Object} default is standard list of commands for context menus when right click or click on menu dropdown
	 *	  Javascript example:
	 *		  {
	 *			  "What I want my command to say": function() {}
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
	sheet:function (settings) {
		var n = isNaN,
			events = $.sheet.events;

		$(this).each(function () {
			var me = $(this),
				chosenSettings = $.extend(true, {}, $.sheet.defaults, settings || {}),
				jS = this.jS;

			chosenSettings.useStack = (window.thaw === undefined ? false : chosenSettings.useStack);
			chosenSettings.useMultiThreads = (window.operative === undefined ? false : chosenSettings.useMultiThreads);

			//destroy already existing spreadsheet
			if (jS) {
				var tables = me.children().detach();
				jS.kill();
				me.html(tables);

				for (var event in events) {
					if (events.hasOwnProperty(event)) {
						me.unbind(events[event]);
					}
				}
			}

			chosenSettings.parent = me;

			if ((this.className || '').match(/\bnot-editable\b/i) != null) {
				chosenSettings['editable'] = false;
			}

			for (var i in events) {
				if (events.hasOwnProperty(i)) {
					me.bind(events[i], chosenSettings[events[i]]);
				}
			}

			me.children().each(function(i) {
				//override frozenAt settings with table's data-frozenatrow and data-frozenatcol
				var frozenAtRow = this.getAttribute('data-frozenatrow') * 1,
					frozenAtCol = this.getAttribute('data-frozenatcol') * 1;

				if (!chosenSettings.frozenAt[i]) chosenSettings.frozenAt[i] = {row:0, col:0};
				if (frozenAtRow) chosenSettings.frozenAt[jS.i].row = frozenAtRow;
				if (frozenAtCol) chosenSettings.frozenAt[jS.i].col = frozenAtCol;
			});

			if (!$.sheet.instance.length) $.sheet.instance = [];

			this.jS = jS = $.sheet.createInstance(chosenSettings, $.sheet.instance.length);
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
	 * @param {Number} sheetIndex
	 * @param {Number} rowIndex
	 * @param {Number} colIndex
	 * @param {Function} callback
	 * @returns {jQuery}
	 */
	getCellValue:function (sheetIndex, rowIndex, colIndex, callback) {
		var me = this[0],
			jS = (me.jS || {}),
			cell;

		if (jS.getCell) {
			cell = jS.getCell(sheetIndex, rowIndex, colIndex);
			if (cell !== null) {
				cell.updateValue(callback);
			}
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
		var me = this[0],
			jS = (me.jS || {}),
			cell;

		sheetIndex = (sheetIndex || 0);

		if (
			jS.getCell
				&& (cell = jS.getCell(sheetIndex, rowIndex, colIndex))
			) {
			try {
				if ((value + '').charAt(0) == '=') {
					cell.valueOverride = cell.value = '';
					cell.formula = value.substring(1);
				} else {
					cell.value = value;
					cell.valueOverride = cell.formula = '';
				}
				cell.updateValue(callback);
			} catch (e) {}
		}
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
		var me = this[0],
			jS = (me.jS || {}),
			cell;

		sheetIndex = (sheetIndex || 0);

		if (jS.getCell) {
			try {
				cell = jS.getCell(sheetIndex, rowIndex, colIndex);
				if (cell !== null) {
					cell.formula = formula;
					cell.valueOverride = cell.value = '';
					cell.updateValue(callback);
				}
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
	 * Defaults
	 */
	defaults: {
		editable:true,
		editableNames:true,
		barMenus:true,
		freezableCells:true,
		allowToggleState:true,
		menu:null,
		newColumnWidth:120,
		title:null,
		calcOff:false,
		lockFormulas:false,
		parent:null,
		colMargin:20,
		boxModelCorrection:2,
		formulaFunctions:{},
		formulaVariables:{},
		cellSelectModel:Sheet.excelSelectModel,
		autoAddCells:true,
		resizableCells:true,
		resizableSheet:true,
		autoFiller:true,
		error:function (e) {
			return e.error;
		},
		endOfNumber: false,
		frozenAt:[],
		contextmenuTop:{
			"Insert column after":function (jS) {
				jS.controlFactory.addColumn(false, jS.colLast);
				return false;
			},
			"Insert column before":function (jS) {
				jS.controlFactory.addColumn(true, jS.colLast);
				return false;
			},
			"Add column to end":function (jS) {
				jS.controlFactory.addColumn(true);
				return false;
			},
			"Delete this column":function (jS) {
				jS.deleteColumn();
				return false;
			},
			"Hide column":function (jS) {
				jS.toggleHideColumn();
				return false;
			},
			"Show all columns": function (jS) {
				jS.columnShowAll();
			},
			"Toggle freeze columns to here":function (jS) {
				var col = jS.getTdLocation(jS.obj.tdActive()).col,
					actionUI = jS.obj.pane().actionUI;
				actionUI.frozenAt.col = (actionUI.frozenAt.col == col ? 0 : col);
			}
		},
		contextmenuLeft:{
			"Insert row after":function (jS) {
				jS.controlFactory.addRow(true, jS.rowLast);
				return false;
			},
			"Insert row before":function (jS) {
				jS.controlFactory.addRow(false, jS.rowLast);
				return false;
			},
			"Add row to end":function (jS) {
				jS.controlFactory.addRow(true);
				return false;
			},
			"Delete this row":function (jS) {
				jS.deleteRow();
				return false;
			},
			"Hide row":function (jS) {
				jS.toggleHideRow(jS.rowLast);
				return false;
			},
			"Show all rows": function (jS) {
				jS.rowShowAll();
			},
			"Toggle freeze rows to here":function (jS) {
				var row = jS.getTdLocation(jS.obj.tdActive()).row,
					actionUI = jS.obj.pane().actionUI;
				actionUI.frozenAt.row = (actionUI.frozenAt.row == row ? 0 : row);
			}
		},
		contextmenuCell:{
			/*"Copy":false,
			 "Cut":false,
			 "line1":'line',*/
			"Insert row after":function (jS) {
				jS.controlFactory.addRow(true, jS.rowLast);
				return false;
			},
			"Insert row before":function (jS) {
				jS.controlFactory.addRow(false, jS.rowLast);
				return false;
			},
			"Add row to end":function (jS) {
				jS.controlFactory.addRow(true);
				return false;
			},
			"Delete this row":function (jS) {
				jS.deleteRow();
				return false;
			},
			"line2":'line',
			"Insert column after":function (jS) {
				jS.controlFactory.addColumn(true, jS.colLast);
				return false;
			},
			"Insert column before":function (jS) {
				jS.controlFactory.addColumn(false, jS.colLast);
				return false;
			},
			"Add column to end":function (jS) {
				jS.controlFactory.addColumn(true);
				return false;
			},
			"Delete this column":function (jS) {
				jS.deleteColumn();
				return false;
			},
			"line3":"line",
			"Add spreadsheet":function (jS) {
				jS.addSheet();
			},
			"Delete spreadsheet":function (jS) {
				jS.deleteSheet();
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
	},

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

		jQueryUI:{script:'jquery-ui/jquery-ui.min.js', thirdParty:true},
		jQueryUIThemeRoller:{css:'jquery-ui/themes/smoothness/jquery-ui.min.css', thirdParty:true},

		globalize:{script:'globalize/lib/globalize.js', thirdParty:true},

		nearest:{script:'jquery-nearest/src/jquery.nearest.min.js', thirdParty:true},

		mousewheel:{script:'MouseWheel/MouseWheel.js', thirdParty:true},

		operative:{script:'operative/dist/operative.js', thirdParty:true}
	},

	/**
	 * Contains the optional plugins if you use $.sheet.preLoad();
	 * @memberOf jQuery.sheet
	 */
	optional:{
		//native
		advancedFn:{script:'plugins/jquery.sheet.advancedfn.js'},
		financeFn:{script:'plugins/jquery.sheet.financefn.js'},

		//3rd party
		colorPicker:{
			css:'really-simple-color-picker/colorPicker.css',
			script:'really-simple-color-picker/jquery.colorPicker.min.js',
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

		thaw: {script:"thaw.js/thaw.js", thirdParty:true},

		undoManager:{script: 'Javascript-Undo-Manager/js/undomanager.js', thirdParty:true},

		zeroClipboard:{script:'zeroclipboard/dist/ZeroClipboard.min.js', thirdParty:true}
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
			skip: ['globalizeCultures'],
			thirdPartyDirectory: 'bower_components/'
		},settings);

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
	 * The instance creator of jQuery.sheet
	 * @memberOf jQuery.sheet
	 * @param {Object} s settings from jQuery.fn.sheet
	 * @param {Number} I the index of the instance
	 * @returns {jS} jS jQuery sheet instance
	 */
	createInstance:function (s, I) {

		var $window = $(window),
			$document = $(document),
			body = document.body,
			$body = $(body),
			emptyFN = function () {},
			u = undefined,
			math = Math,
			n = isNaN,
			nAN = NaN,
			thaw = ($.sheet.defaults.useStack && window.thaw !== u ? window.thaw : function(stack, options) {
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
				version:'4.x',

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
							th:[],
							ths:function () {
								var ths = [],
									i = 0,
									_ths = this.th[jS.i],
									max = _ths.length;

								for (; i < max; i++) {
									ths.push(_ths[i]);
								}

								return ths;
							}
						},
						y:{
							controls:[],
							handleFreeze:[],
							menu:[],
							parent:[],
							th:[],
							ths:function () {
								var ths = [],
									i = 0,
									_ths = this.th[jS.i],
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
					tdMenu:[],
					cellsEdited:[],
					enclosures:[],
					formula:null,
					fullScreen:null,
					header:null,
					inPlaceEdit:[],
					inputs:[],
					label:null,
					menu:[],
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
				},

				/**
				 * Object selectors for interacting with a spreadsheet
				 * @memberOf jS
				 * @type {Object}
				 */
				obj:{
					autoFiller:function () {
						return jS.controls.autoFiller[jS.i] || null;
					},
					barCorner:function () {
						return jS.controls.bar.corner[jS.i] || $([]);
					},
					barHelper:function () {
						return jS.controls.bar.helper[jS.i] || (jS.controls.bar.helper[jS.i] = $([]));
					},
					barLeft:function (i) {
						return (jS.controls.bar.y.th[jS.i] && jS.controls.bar.y.th[jS.i][i] ? jS.controls.bar.y.th[jS.i][i] : []);
					},
					barLeftControls:function () {
						return jS.controls.bar.y.controls[jS.i] || $([]);
					},
					barLefts:function () {
						return jS.controls.bar.y.ths();
					},
					barHandleFreezeLeft:function () {
						return jS.controls.bar.y.handleFreeze[jS.i] || $([]);
					},
					barMenuLeft:function () {
						return jS.controls.bar.y.menu[jS.i] || $([]);
					},
					barTop:function (i) {
						return (jS.controls.bar.x.th[jS.i] && jS.controls.bar.x.th[jS.i][i] ? jS.controls.bar.x.th[jS.i][i] : []);
					},
					barTopControls:function () {
						return jS.controls.bar.x.controls[jS.i] || $([]);
					},
					barTops:function () {
						return jS.controls.bar.x.ths();
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
						return jS.cellLast !== null ? jS.cellLast.td : null;
					},
					cellActive:function() {
						return jS.cellLast;
					},
					tdMenu:function () {
						return jS.controls.tdMenu[jS.i] || $([]);
					},
					cellsEdited: function () {
						return (jS.controls.cellsEdited !== u ? jS.controls.cellsEdited : jS.controls.cellsEdited = []);
					},
					chart:function () {
						return jS.controls.chart[jS.i] || $([]);
					},
					enclosure:function () {
						return jS.controls.enclosures[jS.i] || [];
					},
					enclosures:function () {
						return jS.controls.enclosures || [];
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
						return jS.highlighter.last || $([]);
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
					menu:function () {
						return jS.controls.menu[jS.i] || $([]);
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
					scrolls:function () {
						return jS.controls.scrolls || $([]);
					},
					sheetAdder:function () {
						return jS.controls.sheetAdder || $([]);
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
					title:function () {
						return jS.controls.title || $([]);
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
					barControllerChild: 'jSBarControllerChild',
					barHelper:'jSBarHelper',
					barLeft:'jSBarLeft',
					barHandleFreezeLeft:'jSBarHandleFreezeLeft',
					barTop:'jSBarTop',
					barTopMenuButton: 'jSBarTopMenuButton',
					barHandleFreezeTop:'jSBarHandleFreezeTop',
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
					tabContainerScrollable:'jSTabContainerScrollable',
					tdMenu:'jSTdMenu',
					title:'jSTitle',
					enclosure:'jSEnclosure',
					ui:'jSUI'
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
					cellLoading: "Loading..."
				},

				/**
				 * Deletes a jQuery sheet instance
				 * @memberOf jS
				 */
				kill:function () {
					if (!jS) {
						return false;
					}
					$(document).unbind('keydown');
					this.obj.fullScreen().remove();
					(this.obj.inPlaceEdit().destroy || emptyFN)();
					s.parent
						.trigger('sheetKill')
						.removeClass(jS.theme.parent)
						.html('');

					delete s.parent[0].jS;

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
				 * Get cell value
				 * @memberOf jS
				 * @param {Number} sheetIndex
				 * @param {Number} rowIndex
				 * @param {Number} columnIndex
				 * @returns {Sheet.Cell|Null}
				 */
				getCell: function (sheetIndex, rowIndex, columnIndex) {
					var spreadsheet, row, cell;
					if (
						(spreadsheet = jS.spreadsheets[sheetIndex]) === u
						|| (row = spreadsheet[rowIndex]) === u
						|| (cell = row[columnIndex]) === u
					) {
						cell = s.loader.jitCell(sheetIndex, rowIndex, columnIndex);
					}

					if (cell === u || cell === null) {
						return null;
					}

					if (cell.typeName !== 'Sheet.Cell') {
						throw new Error('Wrong Constructor');
					}

					cell.sheetIndex = sheetIndex;
					cell.rowIndex = rowIndex;
					cell.columnIndex = columnIndex;
					return cell;
				},

				/**
				 *
				 * @param {String} cellId
				 * @param {Number|Function} callbackOrSheet
				 * @param {Function} [callback]
				 * @returns {jS}
				 */
				getCellById: function(cellId, callbackOrSheet, callback) {
					var loader = s.loader,
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

					if (jS.isBusy()) {
						jS.whenNotBusy(function(){
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

					jS.whenNotBusy(function() {
						for(;i < max; i++) {
							cellReference = cellReferences[i];
							if (typeof cellReference === 'string') {
								(function(i) {
									jS.getCellById(cellReference, sheet, function(cell) {
										cells[i] = cell;
										got++;

										if (got === max) callback.apply(jS, cells);
									});
								})(i);
							} else {
								cellLocation = cellReference;
								cell = jS.getCell(cellLocation.sheet, cellLocation.rowIndex, cellLocation.columnIndex);
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

					jS.getCells(cellReferences, sheet, function() {
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
					 * @param {Number} [rowIndex] row index
					 * @param {Number} [qty] the number of cells you'd like to add, if not specified, a dialog will ask
					 * @param {Boolean} [isAfter] places cells after the selected cell if true
					 * @memberOf jS.controlFactory
					 */
					addRowMulti:function (rowIndex, qty, isAfter) {
						function add(qty) {
							var i = 0;
							if (qty > 0) {

								for (;i < qty; i++) {
									jS.addColumn(rowIndex, isAfter, true);
								}

								jS.trigger('sheetAddRow', [rowIndex, isAfter, qty]);
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
					 * @param {Number} [columnIndex] column index
					 * @param {Number} [qty] the number of cells you'd like to add, if not specified, a dialog will ask
					 * @param {Boolean} [isAfter] places cells after the selected cell if true
					 * @memberOf jS.controlFactory
					 */
					addColumnMulti:function (columnIndex, qty, isAfter) {
						function add(qty) {
							var i = 0;
							if (qty > 0) {

								for (;i < qty; i++) {
									jS.addColumn(columnIndex, isAfter, true);
								}

								jS.trigger('sheetAddColumn', [columnIndex, isAfter, qty]);
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
					 * creates single row
					 * @param {Boolean} [isAfter] places cells after if set to true
					 * @param {Number} [rowIndex] row index
					 * @param {Boolean} [skipEvent]
					 * @memberOf jS.controlFactory
					 */
					addRow:function (isAfter, rowIndex, skipEvent) {
						var loader = s.loader,
							columnIndex = 0,
							size = loader.size(jS.i),
							columnMax = size.cols,
							spreadsheet = jS.spreadsheets[jS.i],
							row = [],
							sheetIndex = jS.i,
							pane = jS.obj.pane();

						if (rowIndex === undefined) {
							rowIndex = size.rows - 1;
						}

						if (isAfter) {
							rowIndex++;
						}

						for(;columnIndex < columnMax; columnIndex++) {
							row.push(new Sheet.Cell(sheetIndex, null, jS, jS.cellHandler));
						}

						spreadsheet.splice(rowIndex, 0, row);

						loader.addRow(jS.i, rowIndex, row);

						pane.actionUI.redrawRows();

						if (skipEvent !== true) {
							jS.trigger('sheetAddRow', [rowIndex, isAfter, 1]);
						}
					},

					/**
					 * creates single column
					 * @param {Boolean} [isAfter] places cells after if set to true
					 * @param {Number} [columnIndex], column index
					 * @param {Boolean} [skipEvent]
					 * @memberOf jS.controlFactory
					 */
					addColumn:function (isAfter, columnIndex, skipEvent) {
						var loader = s.loader,
							rowIndex = 0,
							size = loader.size(jS.i),
							rowMax = size.rows,
							row,
							column = [],
							cell,
							spreadsheet = jS.spreadsheets[jS.i],
							sheetIndex = jS.i,
							pane = jS.obj.pane();

						if (columnIndex === undefined) {
							columnIndex = size.cols - 1;
						}

						if (isAfter) {
							columnIndex++;
						}

						for(;rowIndex < rowMax; rowIndex++) {
							cell = new Sheet.Cell(sheetIndex, null, jS, jS.cellHandler);
							column.push(cell);
							row = spreadsheet[rowIndex];
							row.splice(columnIndex, 0, cell);
						}

						loader.addColumn(jS.i, columnIndex, column);

						pane.actionUI.redrawColumns();

						if (skipEvent !== true) {
							jS.trigger('sheetAddColumn', [columnIndex, isAfter, 1]);
						}
					},

					/**
					 * Creates the draggable objects for freezing cells
					 * @type {Object}
					 * @memberOf jS.controlFactory
					 * @namespace
					 */
					barHandleFreeze:{

						/**
						 * @param {Number} i
						 * @param {HTMLElement} pane
						 * @returns {Boolean}
						 * @memberOf jS.controlFactory.barHandleFreeze
						 */
						top:function (i, pane) {
							if (jS.isBusy()) {
								return false;
							}
							var actionUI = pane.actionUI,
								tBody = pane.tBody,
								frozenAt = actionUI.frozenAt,
								scrolledArea = actionUI.scrolledArea;

							if (!(scrolledArea.col <= (frozenAt.col + 1))) {
								return false;
							}

							jS.obj.barHelper().remove();

							var highlighter,
								bar = tBody.children[0].children[frozenAt.col + 1],
								paneRectangle = pane.getBoundingClientRect(),
								paneTop = paneRectangle.top + document.body.scrollTop,
								paneLeft = paneRectangle.left + document.body.scrollLeft,
								handle = document.createElement('div'),
								$handle = pane.freezeHandleTop = $(handle)
									.appendTo(pane)
									.addClass(jS.theme.barHandleFreezeTop + ' ' + jS.cl.barHelper + ' ' + jS.cl.barHandleFreezeTop)
									.height(bar.clientHeight - 1)
									.css('left', (bar.offsetLeft - handle.clientWidth) + 'px')
									.attr('title', jS.msg.dragToFreezeCol);


							jS.controls.bar.helper[jS.i] = jS.obj.barHelper().add(handle);
							jS.controls.bar.x.handleFreeze[jS.i] = $handle;

							jS.draggable($handle, {
								axis:'x',
								start:function () {
									jS.setBusy(true);

									highlighter = $(document.createElement('div'))
										.appendTo(pane)
										.css('position', 'absolute')
										.addClass(jS.theme.barFreezeIndicator + ' ' + jS.cl.barHelper)
										.height(bar.clientHeight - 1)
										.fadeTo(0,0.33);
								},
								drag:function() {
									var target = jS.nearest($handle, bar.parentNode.children).prev();
									if (target.length && target.position) {
										highlighter.width(target.position().left + target.width());
									}
								},
								stop:function (e, ui) {
									highlighter.remove();
									jS.setBusy(false);
									jS.setDirty(true);
									var target = jS.nearest($handle, bar.parentNode.children);

									jS.obj.barHelper().remove();
									scrolledArea.col = actionUI.frozenAt.col = jS.getTdLocation(target[0]).col - 1;
									jS.autoFillerHide();
								},
								containment:[paneLeft, paneTop, paneLeft + pane.clientWidth - window.scrollBarSize.width, paneTop]
							});

							return true;
						},

						/**
						 * @param {Number} i
						 * @param {HTMLElement} pane
						 * @returns {Boolean}
						 * @memberOf jS.controlFactory.barHandleFreeze
						 */
						left:function (i, pane) {
							if (jS.isBusy()) {
								return false;
							}
							var actionUI = pane.actionUI,
								table = pane.table,
								tBody = pane.tBody,
								frozenAt = actionUI.frozenAt,
								scrolledArea = actionUI.scrolledArea;

							if (!(scrolledArea.row <= (frozenAt.row + 1))) {
								return false;
							}

							jS.obj.barHelper().remove();

							var bar = tBody.children[frozenAt.row + 1].children[0],
								paneRectangle = pane.getBoundingClientRect(),
								paneTop = paneRectangle.top + document.body.scrollTop,
								paneLeft = paneRectangle.left + document.body.scrollLeft,
								handle = document.createElement('div'),
								$handle = pane.freezeHandleLeft = $(handle)
									.appendTo(pane)
									.addClass(jS.theme.barHandleFreezeLeft + ' ' + jS.cl.barHelper + ' ' + jS.cl.barHandleFreezeLeft)
									.width(bar.clientWidth)
									.css('top', (bar.offsetTop - handle.clientHeight + 1) + 'px')
									.attr('title', jS.msg.dragToFreezeRow),
								highlighter;

							jS.controls.bar.helper[jS.i] = jS.obj.barHelper().add(handle);
							jS.controls.bar.y.handleFreeze[jS.i] = $handle;

							jS.draggable($handle, {
								axis:'y',
								start:function () {
									jS.setBusy(true);

									highlighter = $(document.createElement('div'))
										.appendTo(pane)
										.css('position', 'absolute')
										.addClass(jS.theme.barFreezeIndicator + ' ' + jS.cl.barHelper)
										.width(handle.clientWidth)
										.fadeTo(0,0.33);
								},
								drag:function() {
									var target = jS.nearest($handle, bar.parentNode.parentNode.children).prev();
									if (target.length && target.position) {
										highlighter.height(target.position().top + target.height());
									}
								},
								stop:function (e, ui) {
									highlighter.remove();
									jS.setBusy(false);
									jS.setDirty(true);
									var target = jS.nearest($handle, bar.parentNode.parentNode.children);
									jS.obj.barHelper().remove();
									scrolledArea.row = actionUI.frozenAt.row = math.max(jS.getTdLocation(target.children(0)[0]).row - 1, 0);
									jS.autoFillerHide();
								},
								containment:[paneLeft, paneTop, paneLeft, paneTop + pane.clientHeight - window.scrollBarSize.height]
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
						var menu, buttons = $([]), hoverClass = jS.theme.menuHover;

						switch (bar) {
							case "top":
								menu = $(document.createElement('div'))
									.addClass(jS.theme.menu + ' ' + jS.cl.tdMenu);
								jS.controls.bar.x.menu[jS.i] = menu;
								break;
							case "left":
								menu = $(document.createElement('div'))
									.addClass(jS.theme.menu + ' ' + jS.cl.tdMenu);
								jS.controls.bar.y.menu[jS.i] = menu;
								break;
							case "cell":
								menu = $(document.createElement('div'))
									.addClass(jS.theme.menu + ' ' + jS.cl.tdMenu);
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
										$(document.createElement('div'))
											.text(msg)
											.data('msg', msg)
											.click(function () {
												menuItems[$(this).data('msg')].call(this, jS);
												menu.hide();
												return false;
											})
											.appendTo(menu)
											.hover(function() {
												buttons.removeClass(hoverClass);
												$(this).addClass(hoverClass);
											}, function() {
												$(this).removeClass(hoverClass);
											})
									);

								} else if (menuItems[msg] == 'line') {
									$(document.createElement('hr')).appendTo(menu);
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

								barMenuParentTop = $(document.createElement('div'))
									.addClass(jS.theme.barMenuTop + ' ' + jS.cl.barHelper + ' ' + jS.cl.barTopMenuButton)
									.append(
										$(document.createElement('span'))
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
									});

								barMenuParentTop.get(0).destroy = function(){
									barMenuParentTop.remove();
									jS.controls.bar.x.menuParent[jS.i] = null;
								};

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

						var header = document.createElement('div'),
							secondRow,
							secondRowTr,
							title = document.createElement('h4'),
							label,
							menu,
							$menu,
							formula,
							formulaParent;

						header.className = jS.cl.header + ' ' + jS.theme.control;

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
						header.appendChild(title);


						if (jS.isSheetEditable()) {
							if (s.menu) {
								menu = document.createElement('div');
								$menu = $(menu);
								menu.className = jS.cl.menu + ' ' + jS.cl.menuFixed + ' ' + jS.theme.menuFixed;
								header.appendChild(menu);

								jS.controls.menu[jS.i] = $menu
									.append(s.menu)
									.children()
									.addClass(jS.theme.menuFixed);

								$menu.find('img').load(function () {
									jS.sheetSyncSize();
								});
							}

							label = document.createElement('td');
							label.className = jS.cl.label + ' ' + jS.theme.control;
							jS.controls.label = $(label);

							//Edit box menu
							formula = document.createElement('textarea');
							formula.className = jS.cl.formula + ' ' + jS.theme.controlTextBox;
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
							var formulaResize = document.createElement('span');
							formulaResize.appendChild(formula);

							secondRow = document.createElement('table');
							secondRowTr = document.createElement('tr');
							secondRow.appendChild(secondRowTr);

							header.appendChild(secondRow);


							formulaParent = document.createElement('td');
							formulaParent.className = jS.cl.formulaParent;
							formulaParent.appendChild(formulaResize);
							secondRowTr.appendChild(label);
							secondRowTr.appendChild(formulaParent);

							//spacer
							secondRowTr.appendChild(document.createElement('td'));

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

							$(document).keydown(jS.evt.document.keydown);
						}

						return header;
					},

					/**
					 * Creates the user interface for spreadsheets
					 * @memberOf jS.controlFactory
					 */
					ui:function () {
						var ui = document.createElement('div');
						ui.setAttribute('class', jS.cl.ui);
						jS.obj.ui = ui;
						return ui;
					},

					sheetAdder: function () {
						var addSheet = document.createElement('span');
						if (jS.isSheetEditable()) {
							addSheet.setAttribute('class', jS.cl.sheetAdder + ' ' + jS.cl.tab + ' ' + jS.theme.tab);
							addSheet.setAttribute('title', jS.msg.addSheet);
							addSheet.innerHTML = '+';
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
						var tabContainer = document.createElement('span'),
							startPosition;
						tabContainer.setAttribute('class', jS.cl.tabContainer);

						tabContainer.onmousedown = function (e) {
							e = e || window.event;

							var i = (e.target || e.srcElement).i;
							if (i >= 0) {
								jS.trigger('sheetSwitch', [i]);
							}
							return false;
						};
						tabContainer.ondblclick = function (e) {
							e = e || window.event;
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
					 * Creates the spreadsheet user interface
					 * @param {HTMLElement} ui raw user interface
					 * @param {Number} i the new count for spreadsheets in this instance
					 * @memberOf jS.controlFactory
					 */
					sheetUI:function (ui, i) {
						jS.i = i;

						//TODO: readOnly from metadata
						//jS.readOnly[i] = (table.className || '').match(/\breadonly\b/i) != null;

						var enclosure = jS.controlFactory.enclosure(),
							pane = enclosure.pane,
							$pane = $(pane),
							paneContextmenuEvent = function (e) {
								e = e || window.event;
								if (jS.isBusy()) {
									return false;
								}
								if (jS.isBar(e.target)) {
									var bar = e.target,
										index = bar.index,
										entity = bar.entity;

									if (index < 0) return false;

									if (jS.evt.barInteraction.first === jS.evt.barInteraction.last) {
										jS.controlFactory.barMenu[entity](e, index);
									}
								} else {
									jS.controlFactory.tdMenu(e);
								}
								return false;
							};

						ui.appendChild(enclosure);

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
								e = e || window.event;

								var target = e.target || e.srcElement;

								//This manages bar resize, bar menu, and bar selection
								if (jS.isBusy()) {
									return false;
								}

								if (!jS.isBar(target)) {
									return false;
								}
								var bar = target,
									entity = bar.entity,
									index = bar.index;

								if (index < 0) {
									return false;
								}

								if (jS.evt.barInteraction.selecting && bar === mouseDownEntity) {
									jS.evt.barInteraction.last = index;

									jS.cellSetActiveBar(entity, jS.evt.barInteraction.first, jS.evt.barInteraction.last);
								} else {
									jS.resizeBar[entity](bar, index, pane);

									if (jS.isSheetEditable()) {
										jS.controlFactory.barHandleFreeze[entity](index, pane);

										if (entity == "top") {
											jS.controlFactory.barMenu[entity](e, index, bar);
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

						jS.controlFactory.tab();

						jS.setChanged(true);
					},

					/**
					 * The viewing console for spreadsheet
					 * @returns {*|jQuery|HTMLElement}
					 * @memberOf jS.controlFactory
					 */
					enclosure:function () {
						var enclosure = document.createElement('div'),
							$enclosure = $(enclosure),
							actionUI = new Sheet.ActionUI(jS, enclosure, jS.cl.scroll, jS.s.frozenAt[jS.i]),
							pane = actionUI.pane;

						pane.setAttribute('class', jS.cl.pane + ' ' + jS.theme.pane);
						enclosure.setAttribute('class', jS.cl.enclosure);

						enclosure.pane = pane;

						pane.enclosure = enclosure;
						pane.$enclosure = $enclosure;

						jS.controls.pane[jS.i] = pane;
						jS.controls.panes = jS.obj.panes().add(pane);
						jS.controls.enclosures[jS.i] = enclosure;

						return enclosure;
					},

					/**
					 * Adds a tab for navigation to a spreadsheet
					 * @returns {Node|jQuery}
					 * @memberOf jS.controlFactory
					 */
					tab:function () {
						var tab = document.createElement('span'),
							$tab = jS.controls.tab[jS.i] = $(tab).appendTo(jS.obj.tabContainer());

						tab.setAttribute('class', jS.cl.tab + ' ' + jS.theme.tab);
						jS.sheetTab(true, function(sheetTitle) {
							tab.innerHTML = sheetTitle;
						});

						tab.i = jS.i;
						jS.controls.tabs = jS.obj.tabs().add($tab);

						return tab;
					},

					customTab: function(title) {
						var tab = document.createElement('span'),
							$tab = $(tab).appendTo(jS.obj.tabContainer());

						tab.setAttribute('class', jS.cl.tab + ' ' + jS.theme.tab);
						tab.innerHTML = title;

						return $tab;
					},

					/**
					 * Creates a textarea for a user to put a value in that floats on top of the current selected cell
					 * @param {jQuery|HTMLElement} td the td to be edited
					 * @param {Boolean} selected selects the text in the inline editor
					 * @memberOf jS.controlFactory
					 */
					inPlaceEdit:function (td, selected) {
						td = td || jS.obj.cellActive().td || null;

						if (td === null) {
							td = jS.rowTds(null, 1)[1];
							jS.cellEdit(td);
						}

						if (td === null) return;

						(jS.obj.inPlaceEdit().destroy || emptyFN)();

						var formula = jS.obj.formula(),
							val = formula.val(),
							textarea,
							$textarea,
							pane = jS.obj.pane();

						if (!td.isHighlighted) return; //If the td is a dud, we do not want a textarea

						textarea = document.createElement('textarea');
						$textarea = $(textarea);
						pane.inPlaceEdit = textarea;
						textarea.i = jS.i;
						textarea.className = jS.cl.inPlaceEdit + ' ' + jS.theme.inPlaceEdit;
						textarea.td = td;
						//td / tr / tbody / table
						textarea.table = td.parentNode.parentNode.parentNode;
						textarea.goToTd = function() {
							this.offset = $(td).position();
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

						var autoFiller = document.createElement('div'),
							handle = document.createElement('div'),
							cover = document.createElement('div');

						autoFiller.i = jS.i;

						autoFiller.className = jS.cl.autoFiller + ' ' + jS.theme.autoFiller;
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

						pane.autoFiller = jS.controls.autoFiller[jS.i] = autoFiller;
						pane.appendChild(autoFiller);
						return true;
					}
				},

				/**
				 * Allows grouping of cells
				 * @memberOf jS
				 */
				autoFillerNotGroup:true,


				tsv: new TSV(),
				/**
				 * Sends tab delimited string into cells, usually a paste from external spreadsheet application
				 * @param [oldVal] what formula should be when this is done working with all the values
				 * @returns {Boolean}
				 * @memberOf jS
				 */
				updateCellsAfterPasteToFormula:function (oldVal) {
					var newValCount = 0,
						formula = jS.obj.formula(),
						startCell = jS.cellLast;

					oldVal = oldVal || formula.val();

					var val = formula.val(), //once ctrl+v is hit formula now has the data we need
						firstValue = val;

					//at this point we need to check if there is even a cell selected, if not, we can't save the information, so clear formula editor
					if ((startCell.rowIndex == 0 && startCell.columnIndex == 0) || val.length === 0) {
						return false;
					}

					var parsedRows = jS.tsv.parse(val);

					//Single cell value
					if (!$.isArray(parsedRows)) {
						formula.val(parsedRows);
						jS.fillUpOrDown(false, parsedRows);
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
						for (j = 0; j < parsedColumns.length; j++) {
							newValCount++;

							if (
								!(spreadsheet = jS.spreadsheets[jS.i])
								|| !(row = spreadsheet[i + startCell.rowIndex])
								|| !(cell = row[j + startCell.columnIndex])
							) continue;

							if (cell) {
								(function(cell, parsedColumn) {
									s.parent.one('sheetPreCalculation', function () {
										if ((parsedColumn + '').charAt(0) == '=') { //we need to know if it's a formula here
											cell.formula = parsedColumn.substring(1);
											cell.value = '';
										} else {
											cell.formula = '';
											cell.value = parsedColumn;
										}
									});
								})(cell, parsedColumns[j]);
								jS.resolveCell(cell);

								if (i == 0 && j == 0) { //we have to finish the current edit
									firstValue = parsedColumns[j];
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
							e = e || window.event;
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
							e = e || window.event;
							if (jS.readOnly[jS.i]) return false;
							if (jS.cellLast === null) return false;
							if (jS.cellLast.rowIndex < 0 || jS.cellLast.columnIndex < 0) return false;

							jS.trigger('sheetFormulaKeydown', [false]);

							switch (e.keyCode) {
								case key.C:
									if (e.ctrlKey) {
										return jS.evt.document.copy(e);
									}
								case key.X:
									if (e.ctrlKey) {
										return jS.evt.document.cut(e);
									}
								case key.Y:
									if (e.ctrlKey) {
										jS.evt.document.redo(e);
										return false;
									}
									break;
								case key.Z:
									if (e.ctrlKey) {
										jS.evt.document.undo(e);
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
								case key.UNKNOWN:
									return false;
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
								$(jS.obj.tdActive()).dblclick();
								return true;
							}
							return false;
						}
					},

					/**
					 * Key down handlers
					 * @memberOf jS.evt
					 */
					document:{
						/**
						 *
						 * @param {Object} e jQuery event
						 * @returns {*}
						 * @memberOf jS.evt.document
						 */
						enter:function (e) {
							if (!jS.cellLast.isEdit && !e.ctrlKey) {
								$(jS.obj.tdActive()).dblclick();
							}
							return false;
						},

						/**
						 *
						 * @param {Object} e jQuery event
						 * @returns {*}
						 * @memberOf jS.evt.document
						 */
						tab:function (e) {
							jS.evt.cellSetActiveFromKeyCode(e);
						},

						/**
						 *
						 * @param {Object} e jQuery event
						 * @returns {*}
						 * @memberOf jS.evt.document
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
						 * @memberOf jS.evt.document
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
						 * @memberOf jS.evt.document
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
						 * @returns {Boolean}
						 * @memberOf jS.evt.document
						 */
						pageUpDown:function (reverse) {
							var size = jS.sheetSize(),
								pane = jS.obj.pane(),
								paneHeight = pane.clientHeight,
								prevRowsHeights = 0,
								thisRowHeight = 0,
								td,
								i;
							//TODO: refactor to use scroll position
							if (reverse) { //go up
								for (i = jS.cellLast.rowIndex; i > 0 && prevRowsHeights < paneHeight; i--) {
									td = jS.getTd(-1, i, 1);
									if (td !== null && !td.getAttribute('data-hidden') && $(td).is(':hidden')) $(td).show();
									prevRowsHeights += td.parentNode.clientHeight;
								}
							} else { //go down
								for (i = jS.cellLast.rowIndex; i < size.rows && prevRowsHeights < paneHeight; i++) {
									td = jS.getTd(-1, i, 1);
									if (td === null) continue;
									prevRowsHeights += td.parentNode.clientHeight;
								}
							}
							jS.cellEdit(td);

							return false;
						},

						/**
						 *
						 * @param {Object} e jQuery event
						 * @returns {*}
						 * @memberOf jS.evt.document
						 */
						keydown:function (e) {
							e = e || window.event;
							if (jS.readOnly[jS.i]) return false;
							if (jS.cellLast === null) return;
							if (jS.cellLast.rowIndex < 0 || jS.cellLast.columnIndex < 0) return false;
							var td = jS.cellLast.td;

							if (jS.nav) {
								//noinspection FallthroughInSwitchStatementJS
								switch (e.keyCode) {
									case key.DELETE:
										jS.toTsv(null, true);
										jS.obj.formula().val('');
										jS.cellLast.isEdit = true;
										break;
									case key.TAB:
										jS.evt.document.tab(e);
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
										jS.evt.document.pageUpDown(true);
										break;
									case key.PAGE_DOWN:
										jS.evt.document.pageUpDown();
										break;
									case key.HOME:
									case key.END:
										jS.evt.cellSetActiveFromKeyCode(e);
										break;
									case key.V:
										if (e.ctrlKey) {
											return jS.evt.formula.If(!jS.evt.pasteOverCells(e), e);
										} else {
											$(td).trigger('cellEdit');
											return true;
										}
										break;
									case key.Y:
										if (e.ctrlKey) {
											jS.evt.document.redo(e);
											return false;
										} else {
											$(td).trigger('cellEdit');
											return true;
										}
										break;
									case key.Z:
										if (e.ctrlKey) {
											jS.evt.document.undo(e);
											return false;
										} else {
											$(td).trigger('cellEdit');
											return true;
										}
										break;
									case key.ESCAPE:
										jS.evt.cellEditAbandon();
										break;
									case key.F:
										if (e.ctrlKey) {
											return jS.evt.formula.If(jS.evt.document.findCell(e), e);
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
										jS.obj.formula().focus().select();
										return true;
										break;
									default:
										if (jS.obj.inPlaceEdit().td !== td) {
											$(td).trigger('cellEdit');
										}
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
						e = e || window.event;
						if (e.ctrlKey || e.type == "paste") {
							var fnAfter = function () {
								jS.updateCellsAfterPasteToFormula();
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
						var inPlaceEdit = jS.obj.inPlaceEdit(),
							inPlaceEditHasFocus = $(inPlaceEdit).is(':focus'),
							cellLast = jS.cellLast,
							cell;

						(inPlaceEdit.destroy || emptyFN)();
						if (cellLast !== null && (cellLast.isEdit || force)) {
							cell = jS.getCell(cellLast.sheetIndex, cellLast.rowIndex, cellLast.columnIndex);
							var formula = (inPlaceEditHasFocus ? $(inPlaceEdit) : jS.obj.formula()),
								td = cell.td;

							if (jS.isFormulaEditable(td)) {
								//Lets ensure that the cell being edited is actually active
								if (td !== null && cell.rowIndex > 0 && cell.columnIndex > 0) {

									//This should return either a val from textbox or formula, but if fails it tries once more from formula.
									var v = formula.val(),
										i = 0,
										loader = s.loader,
										loadedFrom;

									if (!cell.edited) {
										cell.edited = true;
										jS.obj.cellsEdited().push(cell);
									}

									s.parent.one('sheetPreCalculation', function () {
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
													'formula': '',
													'value': v,
													'parsedFormula': null
												});
											}
										}

										cell.setNeedsUpdated();
									});
									jS.resolveCell(cell);

									//formula.focus().select();
									cell.isEdit = false;

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

						jS.highlighter
							.clearBar()
							.clear();

						var cell = jS.cellLast;
						if (!skipCalc && cell !== null) {
							cell.updateValue();
						}

						jS.cellLast = null;
						jS.rowLast = 0;
						jS.colLast = 0;
						jS.highlighter.startRowIndex = 0;
						jS.highlighter.startColumnIndex = 0;
						jS.highlighter.endRowIndex = 0;
						jS.highlighter.endColumnIndex = 0;

						jS.labelUpdate('');
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
						var grid = jS.orderedGrid(jS.highlighter),
							size = jS.sheetSize(),
							cellActive = jS.cellActive,
							highlighter = jS.highlighter;

						if (cellActive === null) return false;

						switch (e.keyCode) {
							case key.UP:
								if (grid.startRowIndex < cellActive.rowIndex) {
									grid.startRowIndex--;
									grid.startRowIndex = grid.startRowIndex > 0 ? grid.startRowIndex : 1;
									break;
								}

								grid.endRowIndex--;
								grid.endRowIndex = grid.endRowIndex > 0 ? grid.endRowIndex : 1;

								break;
							case key.DOWN:
								//just beginning the highlight
								if (grid.startRowIndex === grid.endRowIndex) {
									grid.startRowIndex++;
									grid.startRowIndex = grid.startRowIndex < size.rows ? grid.startRowIndex : size.rows;
									break;
								}

								//if the highlight is above the active cell, then we have selected up and need to move down
								if (grid.startRowIndex < cell.rowIndex) {
									grid.startRowIndex++;
									grid.startRowIndex = grid.startRowIndex > 0 ? grid.startRowIndex : 1;
									break;
								}

								//otherwise we increment the row, and limit it to the size of the total grid
								grid.endRowIndex++;
								grid.endRowIndex = grid.endRowIndex < size.rows ? grid.endRowIndex : size.rows;

								break;
							case key.LEFT:
								if (grid.startColumnIndex < cell.columnIndex) {
									grid.startColumnIndex--;
									grid.startColumnIndex = grid.startColumnIndex > 0 ? grid.startColumnIndex : 1;
									break;
								}

								grid.endColumnIndex--;
								grid.endColumnIndex = grid.endColumnIndex > 0 ? grid.endColumnIndex : 1;

								break;
							case key.RIGHT:
								if (grid.startColumnIndex < cell.columnIndex) {
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

						jS.cycleCellArea(function (o) {
							highlighter.set(o.td);
						}, grid);

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
						if (jS.cellLast === null) return false;

						var cell = jS.cellLast,
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
								loc = jS.evt.incrementAndStayInGrid(jS.orderedGrid(jS.highlighter), loc, true, e.shiftKey);
								overrideIsEdit = true;
								highlighted = jS.highlighted();
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
								loc = jS.evt.incrementAndStayInGrid(jS.orderedGrid(jS.highlighter), loc, false, e.shiftKey);
								overrideIsEdit = true;
								highlighted = jS.highlighted();
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
								loc.columnIndex = jS.obj.tdActive().parentNode.children.length - 2;
								break;
						}

						//we check here and make sure all values are above 0, so that we get a selected cell
						loc.columnIndex = loc.columnIndex || 1;
						loc.rowIndex = loc.rowIndex || 1;

						//to get the td could possibly make keystrokes slow, we prevent it here so the user doesn't even know we are listening ;)
						if (!cell.isEdit || overrideIsEdit) {
							//get the td that we want to go to
							if ((spreadsheet = jS.spreadsheets[jS.i]) === u) return false;
							if ((row = spreadsheet[loc.rowIndex]) === u) return false;
							if ((nextCell = row[loc.columnIndex]) === u) return false;

							//if the td exists, lets go to it
							if (nextCell !== null) {
								jS.cellEdit(nextCell.td, null, doNotClearHighlighted);
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
					 * @returns {Object} loc
					 * @memberOf jS.evt
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
					 * @param {Object} e jQuery event
					 * @memberOf jS.evt
					 */
					cellOnMouseDown:function (e) {


						jS.obj.formula().blur();
						if (e.shiftKey) {
							jS.getTdRange(e, jS.obj.formula().val());
						} else {
							jS.cellEdit(e.target, true);
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
						first:null,

						/**
						 * The last bar that received the event (mousedown)
						 * @memberOf jS.evt.barInteraction
						 */
						last:null,

						/**
						 * Tracks if we are in select mode
						 * @memberOf jS.evt.barInteraction
						 */
						selecting:false,

						/**
						 * Manages the bar selection
						 * @param {Object} target
						 * @returns {*}
						 * @memberOf jS.evt.barInteraction
						 */
						select:function (target) {
							if (!target) return;
							if (!target.type === 'bar') return;
							var bar = target,
								entity = bar.entity, //returns "top" or "left";
								index = bar.index;

							if (index < 0) return false;

							jS.evt.barInteraction.last = jS.evt.barInteraction.first = jS[entity + 'Last'] = index;

							jS.cellSetActiveBar(entity, jS.evt.barInteraction.first, jS.evt.barInteraction.last);

							jS.evt.barInteraction.selecting = true;
							$document
								.one('mouseup', function () {
									jS.evt.barInteraction.selecting = false;
								});

							return false;
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

					var $barMenuParentTop = jS.obj.barMenuParentTop();
					if (($barMenuParentTop) && ($barMenuParentTop.length)){
						var barMenuParentTop = $barMenuParentTop.get(0);
						if ($.isFunction(barMenuParentTop.destroy)) { 
							barMenuParentTop.destroy(); 
						}
					}

					var ths = jS.controls.bar.x.th[jS.i],
						th;

					if (!ths) return;

					for (var i = Math.max(start, 0); i < ths.length; i++) {
						//greater than 1 (corner)
						if (i > 0) {
							th = ths[i];
							th.innerHTML = th.label = jS.cellHandler.columnLabelString(th.cellIndex);
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

					var ths = jS.controls.bar.y.th[jS.i],
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
				 * @param {jQuery|HTMLElement} o target
				 * @returns {Boolean}
				 * @memberOf jS
				 */
				isCell:function (o) {
					if (o && o.jSCell !== u) {
						return true;
					}
					return false;
				},

				/**
				 * Detects if an object is a bar td within a spreadsheet's table
				 * @param {HTMLElement} o target
				 * @returns {Boolean}
				 * @memberOf jS
				 */
				isBar:function (o) {
					if (o.tagName == 'TH') {
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
						$window.unbind('jSResize');
						$body.removeClass('bodyNoScroll');
						s.parent = fullScreen[0].origParent;

						s.parent.prepend(fullScreen.children());

						fullScreen.remove();

						jS.sheetSyncSize();
						if (pane.inPlaceEdit) {
							pane.inPlaceEdit.goToTd();
						}
						jS.trigger('sheetFullScreen', [false]);
					} else { //here we make a full screen
						$body.addClass('bodyNoScroll');

						var parent = $(s.parent),
							fullScreen = document.createElement('div'),
							events = $._data(s.parent[0], 'events');

						fullScreen.className = jS.cl.fullScreen + ' ' + jS.theme.fullScreen + ' ' + jS.cl.parent;

						fullScreen.origParent = parent;
						s.parent = jS.controls.fullScreen = $(fullScreen)
							.append(parent.children())
							.appendTo($body);

						$window
							.bind('resize', function() {
								$window.trigger('jSResize');
							})
							.bind('jSResize', function () {
								this.w = $window.width();
								this.h = $window.height();
								s.parent
									.width(this.w)
									.height(this.h);

								jS.sheetSyncSize();
								if (pane.inPlaceEdit) {
									pane.inPlaceEdit.goToTd();
								}
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
						if (s.loader === null) {
							jS.calc(i);
						}
					}

					return true;
				},


				toggleHideRow: function(i) {
					if (i === undefined) {
						i = jS.rowLast;
					}

					if (i === undefined) return;

					var actionUI = jS.obj.pane().actionUI;

					if (actionUI.hiddenRows.indexOf(i) > -1) {
						actionUI.showRow(i);
					} else {
						actionUI.hideRow(i);
					}

					jS.autoFillerGoToTd();
				},
				toggleHideRowRange: function(startIndex, endIndex) {
					var actionUI = jS.obj.pane().actionUI;

					if (actionUI.hiddenRows.indexOf(startIndex) > -1) {
						actionUI.showRowRange(startIndex, endIndex);
					} else {
						actionUI.hideRowRange(startIndex, endIndex);
					}

					jS.autoFillerGoToTd();
				},
				toggleHideColumn: function(i) {
					if (i === undefined) {
						i = jS.colLast;
					}

					if (i === undefined) return;

					var actionUI = jS.obj.pane().actionUI;

					if (actionUI.hiddenColumns.indexOf(i) > -1) {
						actionUI.showColumn(i);
					} else {
						actionUI.hideColumn(i);
					}

					jS.autoFillerGoToTd();
				},
				toggleHideColumnRange: function(startIndex, endIndex) {
					var actionUI = jS.obj.pane().actionUI;

					if (actionUI.hiddenColumns.indexOf(startIndex) > -1) {
						actionUI.showColumnRange(startIndex, endIndex);
					} else {
						actionUI.hideColumnRange(startIndex, endIndex);
					}

					jS.autoFillerGoToTd();
				},
				rowShowAll: function() {
					jS.obj.pane().actionUI.rowShowAll();
				},
				columnShowAll: function() {
					jS.obj.pane().actionUI.columnShowAll();
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
						i = tds.length - 1,
						cell,
						_td,
						td,
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

						loc = jS.getTdLocation(td);

						do {
							_td = tds[i];
							cell = _td.jSCell;
							if (cell.formula || cell.value) {
								cellsValue.unshift(cell.formula ? "(" + cell.formula.substring(1) + ")" : cell.value);
							}
							s.parent.one('sheetPreCalculation', function () {
								if (_td.cellIndex != loc.col || _td.parentNode.rowIndex != loc.row) {
									cell.formula = '';
									cell.value = '';
									cell.defer = td.jSCell;

									_td.innerHTML = '';
									//_td.style.display = 'none';
									_td.style.visibility = 'collapse';
									//_td.colSpan = colSpan - (_td.cellIndex - td.cellIndex);
									//_td.rowSpan = rowSpan - (_td.parentNode.rowIndex - td.parentNode.rowIndex);
								}
							});

							jS.resolveCell(cell);
						} while(i--);

						td.jSCell.value = $.trim(cellsValue.join(' '));
						td.jSCell.formula = $.trim(td.jSCell.formula ? cellsValue.join(' ') : '');

						td.setAttribute('rowSpan', rowSpan);
						td.setAttribute('colSpan', colSpan);
						td.style.display = '';
						td.style.visibility = '';
						td.style.position = '';
						td.style.height = td.clientHeight + 'px';
						td.style.width = td.clientWidth + 'px';
						td.style.position = 'absolute';

						jS.resolveCell(td.jSCell);
						jS.evt.cellEditDone();
						jS.autoFillerGoToTd(td);
						jS.cellSetActive(td, loc);
					}
					return true;
				},

				/**
				 * Unmerges cells together
				 * @param {jQuery} [td]
				 * @memberOf jS
				 */
				unmerge:function (td) {
					td = td || jS.highlighted();
					if (!td) {
						return;
					}
					var loc = jS.getTdLocation(td),
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
							_td = jS.getTd(-1, i, j);
							if (_td === null) continue;
							_td.style.display = '';
							_td.style.visibility = '';
							_td.removeAttribute('colSpan');
							_td.removeAttribute('rowSpan');
							_td.jSCell.defer = null;

							jS.resolveCell(_td.jSCell, last);

							tds.push(_td);
						} while (j-- > loc.col);
					} while (i-- > loc.row);

					jS.evt.cellEditDone();
					jS.autoFillerGoToTd(td);
					jS.cellSetActive(td, loc);
					jS.highlighter.set(tds);
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

					var activeTd = jS.obj.tdActive();

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
						newV = v || activeTd.jSCell.value,
						isNumber = false,
						i = cells.length - 1,
						fn = function() {};

					v = v || activeTd.jSCell.value;

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
									});

									jS.resolveCell(cells[i]);
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
								});

								jS.resolveCell(cells[i]);

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
							jS.resolveCell(cell);
						}
					};
					var cellValues = [],
						firstLoc,
						lastLoc,
						minLoc = {},
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
								row:0,
								col:0
							},
							last:{
								row:size.rows,
								col:size.cols
							}
						},
						cellStack = [];



					jS.cycleCells(function () {
						var cell = this;
						if (this.formula && typeof this.formula == 'string' && jS.isFormulaEditable(this.td)) {
							this.formula = jS.reparseFormula(this.formula, offset, loc, isBefore, wasDeleted);
						}

						cellStack.push(function() {
							jS.resolveCell(cell, true);
						});

					}, affectedRange.first, affectedRange.last);

					while (cellStack.length) {
						cellStack.pop()();
					}

					jS.evt.cellEditDone();
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
				 * @memberOf jS
				 */
				reparseFormula:function (formula, offset, loc, isBefore, wasDeleted) {
					return formula.replace(this.cellRegex, function (ignored, col, row, pos) {
						if (col == "SHEET") return ignored;
						offset = offset || {loc: -1, row: -1};

						var oldLoc = {
								row: row * 1,
								col: jS.cellHandler.columnLabelIndex(col)
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

					return jS.cellHandler.parseCellName(loc.col, loc.row);
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
					firstLoc = firstLoc || {rowIndex:0, col:0};

					if (!lastLoc) {
						var size = jS.sheetSize();
						lastLoc = {row:size.rows, col:size.cols};
					}

					var spreadsheet = jS.spreadsheets[i],
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
				 * @param {Object} grid {startRowIndex, startColumnIndex, endRowIndex, endColumnIndex}
				 * @memberOf jS
				 */
				cycleCellArea:function (fn, grid) {
					var rowIndex,
						columnIndex,
						row,
						cell,
						i = jS.i,
						o = {cell: [], td: []},
						spreadsheet = jS.spreadsheets[i];

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

				/**
				 * @type Sheet.Theme
				 */
				theme: null,

				/**
				 * @type Sheet.Highlighter
				 */
				highlighter: null,

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

					if (jS.busy.length < 1 && jS.whenNotBusyStack.length > 0) {
						jS.whenNotBusyStack.shift()();
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


				whenNotBusyStack: [],

				whenNotBusy: function(callback) {
					if (jS.isBusy()) {
						jS.whenNotBusyStack.push(callback);
					} else {
						callback();
					}
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
				 * @param elements
				 * @memberOf jS
				 */
				nearest:function (o, elements) {
					return $(o).nearest(elements);
				},

				/**
				 * Bar resizing
				 * @memberOf jS
				 * @namespace
				 */
				resizeBar:{

					/**
					 * Provides the top bar with ability to resize
					 * @param {HTMLElement} bar td bar object
					 * @param {Number} i index of bar
					 * @param {HTMLElement} pane spreadsheet pane
					 * @memberOf jS.resizeBar
					 */
					top:function (bar, i, pane) {
						jS.obj.barTopControls().remove();
						var barController = document.createElement('div'),
							$barController = $(barController)
								.addClass(jS.cl.barController + ' ' + jS.theme.barResizer)
								.width(bar.clientWidth)
								.prependTo(bar),
							handle;

						jS.controls.bar.x.controls[jS.i] = jS.obj.barTopControls().add($barController);

						jS.resizableCells($barController, {
							handles:'e',
							start:function (e, ui) {
								jS.autoFillerHide();
								jS.setBusy(true);
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
								jS.setBusy(false);
								if (pane.inPlaceEdit) {
									pane.inPlaceEdit.goToTd();
								}
								jS.followMe();
								jS.setDirty(true);
							},
							minWidth: 32
						});

						handle = barController.children[0];
						handle.style.height = bar.clientHeight + 'px';
						handle.style.position = 'absolute';
					},

					/**
					 * Provides the left bar with ability to resize
					 * @param {HTMLElement} bar td bar object
					 * @param {Number} i index of bar
					 * @param {HTMLElement} pane spreadsheet pane
					 * @memberOf jS.resizeBar
					 */
					left:function (bar, i, pane) {
						jS.obj.barLeftControls().remove();
						var barRectangle = bar.getBoundingClientRect(),
							barOffsetTop = barRectangle.top + document.body.scrollTop,
							barOffsetLeft = barRectangle.left + document.body.scrollLeft,
							barController = document.createElement('div'),
							$barController = $(barController)
								.addClass(jS.cl.barController + ' ' + jS.theme.barResizer)
								.prependTo(bar)
								.offset({
									top: barOffsetTop,
									left: barOffsetLeft
								}),
							parent = bar.parentNode,
							child = document.createElement('div'),
							$child = $(child)
								.addClass(jS.cl.barControllerChild)
								.height(bar.clientHeight)
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
								jS.setBusy(false);
								if (pane.inPlaceEdit) {
									pane.inPlaceEdit.goToTd();
								}
								jS.followMe();
								jS.setDirty(true);
							},
							minHeight: 15
						});

						handle = child.children[0];
						handle.style.width = bar.offsetWidth + 'px';
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
				 * Updates the label so that the user knows where they are currently positioned
				 * @param {Sheet.Cell|*} entity
				 * @memberOf jS
				 */
				labelUpdate:function (entity) {
					if (entity instanceof Sheet.Cell) {
						var name = jS.cellHandler.parseCellName(entity.columnIndex, entity.rowIndex);
						jS.obj.label().text(name);
					} else {
						jS.obj.label().text(entity);
					}
				},

				/**
				 * Starts td to be edited
				 * @param {HTMLElement} td
				 * @param {Boolean} [isDrag] should be determined by if the user is dragging their mouse around setting cells
				 * @param {Boolean} [doNotClearHighlighted]
				 */
				cellEdit:function (td, isDrag, doNotClearHighlighted) {
					jS.autoFillerNotGroup = true; //make autoFiller directional again.
					//This finished up the edit of the last cell
					jS.evt.cellEditDone();

					if (td === null) return;

					var cell = td.jSCell,
						v;

					if (cell === u || cell === null) return;
					if (cell.uneditable) return;

					jS.trigger('sheetCellEdit', [cell]);

					if (jS.cellLast !== null && td !== jS.cellLast.td) {
						jS.followMe(td);
					} else {
						jS.autoFillerGoToTd(td);
					}

					//Show where we are to the user
					jS.labelUpdate(cell);

					if (cell.formula.length > 0) {
						v = '=' + cell.formula;
					} else {
						v = cell.value;
					}

					jS.obj.formula()
						.val(v)
						.blur();

					jS.cellSetActive(cell, isDrag, false, null, doNotClearHighlighted);
				},

				/**
				 * sets cell active to sheet, and highlights it for the user, shouldn't be called directly, should use cellEdit
				 * @param {Sheet.Cell} cell
				 * @param {Boolean} [isDrag] should be determined by if the user is dragging their mouse around setting cells
				 * @param {Boolean} [directional] makes highlighting directional, only left/right or only up/down
				 * @param {Function} [fnDone] called after the cells are set active
				 * @param {Boolean} [doNotClearHighlighted]
				 * @memberOf jS
				 */
				cellSetActive:function (cell, isDrag, directional, fnDone, doNotClearHighlighted) {
					var td = cell.td;

					jS.cellLast = cell;

					jS.rowLast = cell.rowIndex;
					jS.colLast = cell.columnIndex;

					if (!doNotClearHighlighted) {
						jS.highlighter
							.set(cell.td) //themeroll the cell and bars
							.setStart(cell)
							.setEnd(cell);
					}

					jS.highlighter
						.setBar('left', td.parentNode.children[0])
						.setBar('top', td.parentNode.parentNode.children[0].children[td.cellIndex]);

					var selectModel,
						clearHighlightedModel;

					switch (s.cellSelectModel) {
						case Sheet.excelSelectModel:
						case Sheet.googleDriveSelectModel:
							selectModel = function () {};
							clearHighlightedModel = function() {};
							break;
						case Sheet.openOfficeSelectModel:
							selectModel = function (target) {
								if (jS.isCell(target)) {
									jS.cellEdit(target);
								}
							};
							clearHighlightedModel = function () {};
							break;
					}

					if (isDrag) {
						var pane = jS.obj.pane(),
							highlighter = jS.highlighter,
							grid = {
								startRowIndex: cell.rowIndex,
								startColumnIndex: cell.columnIndex,
								endRowIndex: 0,
								endColumnIndex: 0
							},
							lastTouchedRowIndex = cell.rowIndex,
							lastTouchedColumnIndex = cell.columnIndex;

						pane.onmousemove = function (e) {
							e = e || window.event;

							var target = e.target || e.srcElement;

							if (jS.isBusy()) {
								return false;
							}

							if (target.jSCell === u) return false;

							var touchedCell = target.jSCell,
								ok = true;

							grid.endColumnIndex = touchedCell.columnIndex;
							grid.endRowIndex = touchedCell.rowIndex;

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
								jS.cycleCellArea(function (o) {
									highlighter.set(o.td);
								}, jS.orderedGrid(grid));
							}

							jS.followMe(target);

							var mouseY = e.clientY,
								mouseX = e.clientX,
								offset = pane.$enclosure.offset(),
								up = touchedCell.rowIndex,
								left = touchedCell.columnIndex,
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
								jS.followMe(previous.td, true);
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
				cellLast:null,

				/**
				 * the most recent highlighted cells {td, rowStart, colStart, rowEnd, colEnd}, in order
				 * @memberOf jS
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

							if (!td.jSCell.edited) {
								td.jSCell.edited = true;
								cells.push(td.jSCell);
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
						cells = jS.obj.cellsEdited();

					//TODO: use resolveCell and sheetPreCalculation to set undo redo data

					if (i >= 0) {
						do {
							td = tds[i];
							$td = $(td);
							size = ($td.css("font-size") + '').replace("px", "") * 1;
							$td.css("font-size", ((size || 10) + resize) + "px");

							if (!td.jSCell.edited) {
								td.jSCell.edited = true;
								cells.push(td.jSCell);
							}
						} while(i--);
						return true;
					}
					return false;
				},



				/**
				 * Object handler for formulaParser
				 * @type {Sheet.CellHandler}
				 * @memberOf jS
				 */
				cellHandler: null,

				/**
				 * Where jS.spreadsheets are calculated, and returned to their td counterpart
				 * @param {Number} [sheetIndex] table index
				 * @param {Boolean} [refreshCalculations]
				 * @memberOf jS
				 */
				calc:function (sheetIndex, refreshCalculations) {
					sheetIndex = (sheetIndex === u ? jS.i : sheetIndex);
					if (
						jS.readOnly[sheetIndex]
						|| jS.isChanged(sheetIndex) === false
						&& !refreshCalculations
					) {
						return false;
					} //readonly is no calc at all

					var loader = s.loader,
						cell;

					loader.cycleCells(sheetIndex, function(sheetIndex, rowIndex, columnIndex) {
						cell = loader.jitCell(sheetIndex, rowIndex, columnIndex);
						cell.updateValue();
					});

					jS.trigger('sheetCalculation', [
						{which:'spreadsheet', index:sheetIndex}
					]);

					jS.setChanged(false);
					return true;
				},

				/**
				 * Where jS.spreadsheets are all calculated, and returned to their td counterpart
				 * @param {Boolean} [refreshCalculations]
				 * @memberOf jS
				 */
				calcAll: function(refreshCalculations) {
					var sheetIndex = 0,
						max;

					max = s.loader.count;

					for(;sheetIndex < max; sheetIndex++) {
						jS.calc(sheetIndex, refreshCalculations);
					}
				},

				/**
				 * Calculates just the dependencies of a single cell, and their dependencies recursively
				 * @param {Sheet.Cell} cell
				 * @param {Boolean} [skipUndoable]
				 * @memberOf jS
				 */
				resolveCell:function (cell, skipUndoable) {
					var updateDependencies = !cell.needsUpdated;
					if (!skipUndoable) {
						jS.undo.createCells([cell], function(cells) {
							jS.trigger('sheetPreCalculation', [
								{which:'cell', cell:cell}
							]);

							jS.setDirty(true);
							jS.setChanged(true);
							cell.updateValue(function() {
								jS.trigger('sheetCalculation', [
									{which:'cell', cell: cell}
								]);

								if (updateDependencies) {
									cell.updateDependencies();
								}
							});
							return cells;
						});
					} else {
						jS.trigger('sheetPreCalculation', [
							{which:'cell', cell:cell}
						]);

						jS.setDirty(true);
						jS.setChanged(true);
						cell.updateValue(function() {
							jS.trigger('sheetCalculation', [
								{which:'cell', cell: cell}
							]);

							if (updateDependencies) {
								cell.updateDependencies();
							}
						});
					}
				},

				/**
				 * adds a spreadsheet table
				 * @memberOf jS
				 */
				addSheet:function () {
					jS.evt.cellEditAbandon();
					jS.setDirty(true);
					s.loader.addSpreadsheet(null, jS.sheetCount);
					jS.controlFactory.sheetUI(jS.obj.ui, jS.sheetCount);

					jS.setActiveSheet(jS.sheetCount);

					jS.sheetCount++;

					jS.sheetSyncSize();

					var pane = jS.obj.pane();
					if (pane.inPlaceEdit) {
						pane.inPlaceEdit.goToTd();
					}

					jS.trigger('sheetAdd', [jS.i]);
				},

				insertSheet: null,

				/**
				 * deletes a spreadsheet table
				 * @param {Number} [i] spreadsheet index within instance
				 * @memberOf jS
				 */
				deleteSheet:function (i) {
					var oldI = i || jS.i,
						enclosureArray = jS.controls.enclosure,
						tabIndex;

					enclosureArray.splice(oldI,1);

					jS.obj.barHelper().remove();

					$(jS.obj.enclosure()).remove();
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
					jS.controls.bar.x.th.splice(oldI, 1);
					jS.controls.bar.y.controls.splice(oldI, 1);
					jS.controls.bar.y.handleFreeze.splice(oldI, 1);
					jS.controls.bar.y.controls.splice(oldI, 1);
					jS.controls.bar.y.menu.splice(oldI, 1);
					if (jS.controls.bar.y.menuParent && jS.controls.bar.y.menuParent[oldI]) {
						jS.controls.bar.y.menuParent.splice(oldI, 1);
					}
					jS.controls.bar.y.parent.splice(oldI, 1);
					jS.controls.bar.y.th.splice(oldI, 1);
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
					jS.controls.menu.splice(oldI, 1);
					jS.controls.pane.splice(oldI, 1);
					jS.controls.tables.splice(oldI, 1);
					jS.controls.table.splice(oldI, 1);
					//BUGFIX - After removing of sheet, we need update the tab.i property - start from removed sheet's position.
					for (tabIndex = oldI+1; tabIndex < jS.controls.tab.length; ++tabIndex) {
						var tab = jS.controls.tab[tabIndex].get(0);
						tab.i--;
					}
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
				 * @param {Number} [rowIndex]
				 * @memberOf jS
				 */
				deleteRow:function (rowIndex) {
					rowIndex = rowIndex || jS.rowLast;

					var pane = jS.obj.pane(),
						row = jS.spreadsheets[jS.i].splice(rowIndex, 1)[0],
						columnIndex = 0,
						cell,
						columnMax = row.length,
						loader = s.loader;

					jS.setChanged(true);

					jS.offsetFormulas({
							row: rowIndex,
							col: 0
						}, {
							row: -1,
							col: 0
						},
						false,
						true
					);

					loader.deleteRow(jS.i, rowIndex);

					for (;columnIndex < columnMax; columnIndex++) {
						cell = row[columnIndex];

						cell.setNeedsUpdated(false);
						cell.updateDependencies();
					}

					jS.setDirty(true);

					jS.evt.cellEditAbandon();

					if (pane.inPlaceEdit) {
						pane.inPlaceEdit.goToTd();
					}

					jS.trigger('sheetDeleteRow', rowIndex);
				},

				/**
				 * removes the columns associated with highlighted cells
				 * @param {Number} [columnIndex]
				 * @memberOf jS
				 */
				deleteColumn:function (columnIndex) {
					columnIndex = columnIndex || jS.colLast;

					var pane = jS.obj.pane(),
						rowIndex = 0,
						cell,
						rows = jS.spreadsheets[jS.i],
						loader = s.loader,
						rowMax = loader.size(jS.i);

					jS.setChanged(true);

					jS.offsetFormulas({
							row: 0,
							col: columnIndex
						}, {
							row: -1,
							col: 0
						},
						false,
						true
					);

					loader.deleteColumn(jS.i, columnIndex);

					for (;rowIndex < rowMax; rowIndex++) {
						cell = rows[rowIndex].splice(columnIndex, 1)[0];

						cell.setNeedsUpdated(false);
						cell.updateDependencies();
					}

					jS.setDirty(true);

					jS.evt.cellEditAbandon();

					if (pane.inPlaceEdit) {
						pane.inPlaceEdit.goToTd();
					}

					jS.trigger('sheetDeleteColumn', columnIndex);
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
						sheetTab = s.loader.title(jS.i) || jS.msg.sheetTitleDefault.replace(/[{]index[}]/gi, jS.i + 1);
						if (callback) {
							callback(sheetTab);
						}
						return sheetTab;
					} else if (jS.isSheetEditable() && s.editableNames) { //ensure that the sheet is editable, then let them change the sheet's name
						s.prompt(
							jS.msg.newSheetTitle,
							function(newTitle) {
								if (!newTitle) { //The user didn't set the new tab name
									sheetTab = s.loader.title(jS.i);
									newTitle = (sheetTab ? sheetTab : jS.msg.sheetTitleDefault.replace(/[{]index[}]/gi, jS.i + 1));
								} else {
									jS.setDirty(true);
									jS.obj.table().attr('title', newTitle);
									jS.obj.tab().html(newTitle);

									sheetTab = newTitle;
								}

								if (callback) {
									callback($(document.createElement('div')).text(sheetTab).html());
								}
							},
							jS.sheetTab(true)
						);
						return null;
					}
				},

				/**
				 * scrolls the sheet to the selected cell
				 * @param {HTMLElement} [td] default is tdActive
				 * @param {boolean} [dontMoveAutoFiller] keeps autoFillerHandler in default position
				 * @memberOf jS
				 */
				followMe:function (td, dontMoveAutoFiller) {
					td = td || jS.obj.tdActive();
					if (td === null) return;

					var pane = jS.obj.pane(),
						actionUI = pane.actionUI;

					jS.setBusy(true);

					//actionUI.putTdInView(td);

					jS.setBusy(false);

					if(!dontMoveAutoFiller){
						jS.autoFillerGoToTd(td);
					}
				},

				/**
				 * moves autoFiller to a selected cell if it is enabled in settings
				 * @param {HTMLElement} [td] default is tdActive
				 * @param {Number} [h] height of a td object
				 * @param {Number} [w] width of a td object
				 * @memberOf jS
				 */
				autoFillerGoToTd:function (td, h, w) {
					if (!s.autoFiller) return;

					if (td === u && jS.cellLast !== null) {
						td = jS.cellLast.td;
					}

					if (td && td.type == 'cell') { //ensure that it is a usable cell
						h = h || td.clientHeight;
						w = w || td.clientWidth;
						if (!td.offsetHeight || !td.offsetWidth || !td.clientHeight || !td.clientWidth) {
							jS.autoFillerHide();
							return;
						}

						var tdPos = $(td).position();

						jS.autoFillerShow(((tdPos.top + (h || td.clientHeight) - 3) + 'px'), ((tdPos.left + (w || td.clientWidth) - 3) + 'px'));
					}
				},

				/**
				 * hides the auto filler if it is enabled in settings
				 * @memberOf jS
				 */
				autoFillerHide:function () {
					if (!s.autoFiller) return;

					var autoFiller = jS.obj.autoFiller(),
						parent = autoFiller.parentNode;
					if (parent !== null) {
						parent.removeChild(autoFiller);
					}
				},


				autoFillerShow: function(top, left) {
					if (!s.autoFiller) return;

					var autoFiller = jS.obj.autoFiller(),
						parent = jS.obj.pane(),
						style = autoFiller.style;

					style.top = top;
					style.left = left;

					parent.insertBefore(autoFiller, parent.firstChild);
				},

				/**
				 * sets active a spreadsheet inside of a sheet instance
				 * @param {Number} [i] a sheet integer desired to show, default 0
				 * @param {Object} [spreadsheetUI]
				 * @memberOf jS
				 */
				setActiveSheet:function (i, spreadsheetUI) {
					if (spreadsheetUI !== u) {
						i = spreadsheetUI.i;
					} else {
						i = i || 0;
					}

					if (jS.cellLast !== null && (jS.cellLast.rowIndex > 0 || jS.cellLast.columnIndex > 0)) {
						jS.evt.cellEditDone();
						jS.obj.formula().val('');
					}

					var panes = jS.obj.panes(),
						j = 0,
						max = panes.length,
						pane,
						enclosure;

					jS.autoFillerHide();

					for (;j < max; j++) {
						if (i != j) {
							pane = panes[j];
							pane.actionUI.hide();
						}
					}

					jS.i = i;

					enclosure = jS.obj.enclosure();

					jS.highlighter.setTab(jS.obj.tab());

					//jS.readOnly[i] = (enclosure.table.className || '').match(/\breadonly\b/i) != null;

					pane = enclosure.pane;

					pane.actionUI.show();

					if (pane.inPlaceEdit) {
						pane.inPlaceEdit.goToTd();
					}
				},


				getSpreadsheetIndexByTitle: function(title) {
					var spreadsheetIndex = s.loader.getSpreadsheetIndexByTitle(title);
					return spreadsheetIndex;
				},

				getSpreadsheetTitleByIndex: function(index) {
					return s.loader.json[index].title;
				},


				/**
				 * opens a spreadsheet into the active sheet instance
				 * @param {Sheet.Loader.HTMLTable|Sheet.Loader.JSON|Sheet.Loader.XML} loader
				 * @memberOf jS
				 */
				openSheet:function (loader) {
					var count = loader.count,
						lastIndex = count - 1,
						open = function() {
							jS.setBusy(true);
							jS.s.loader = loader;
							var header = jS.controlFactory.header(),
								ui = jS.controlFactory.ui(),
								sheetAdder = jS.controlFactory.sheetAdder(),
								tabContainer = jS.controlFactory.tabContainer(),
								i,
								options = {
									initChildren: function(ui, i) {
										jS.controlFactory.sheetUI(ui, i);



										jS.trigger('sheetOpened', [i]);
									},
									done: function(stack) {
										jS.sheetSyncSize();

										jS.setActiveSheet(0);

										jS.setDirty(false);
										jS.setBusy(false);

										jS.trigger('sheetAllOpened');
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

							s.parent
								.append(header)
								.append(ui)
								.append(sheetAdder)
								.append(tabContainer);

							// resizable container div
							jS.resizableSheet(s.parent, {
								minWidth:s.parent.width() * 0.1,
								minHeight:s.parent.height() * 0.1,
								start:function () {
									jS.setBusy(true);
									jS.obj.ui.removeChild(jS.obj.enclosure());
									ui.sheetAdder.hide();
									ui.tabContainer.hide();
								},
								stop:function () {
									jS.obj.ui.appendChild(jS.obj.enclosure());
									ui.sheetAdder.show();
									ui.tabContainer.show();
									jS.setBusy(false);
									jS.sheetSyncSize();
									var pane = jS.obj.pane();
									if (pane.inPlaceEdit) {
										pane.inPlaceEdit.goToTd();
									}
								}
							});


							jS.insertSheet = function(data, i, makeVisible) {
								jS.sheetCount++;
								data = data || null;
								makeVisible = makeVisible !== u ? makeVisible : true;
								i = i || jS.sheetCount - 1;

								if (data !== null) {
									s.loader.addSpreadsheet(data);
								}

								var showSpreadsheet = function() {
										jS.setBusy(true);
										var spreadsheetUI = new Sheet.SpreadsheetUI(i, ui, options);
										jS.setActiveSheet(-1, spreadsheetUI);
										jS.setBusy(false);
										jS.sheetSyncSize();
									},
									tab;

								if (makeVisible) {
									showSpreadsheet();
									return;
								}


								tab = jS.controlFactory.customTab(loader.title(i))
									.mousedown(function () {
										showSpreadsheet();
										jS.obj.tab().insertBefore(this);
										$(this).remove();
										return false;
									});

								if (s.loader.isHidden(i)) {
									tab.hide();
								}
							};

							//always load at least the first spreadsheet
							firstSpreadsheetUI = new Sheet.SpreadsheetUI(0, ui, options);
							jS.sheetCount++;

							if (count > 0) {
								//set the others up to load on demand
								for (i = 1; i < count; i++) {
									jS.insertSheet(null, i, false);
								}
								jS.i = 0;

								firstSpreadsheetUI.loaded();
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
					var $parent = s.parent,
						parent = $parent[0],
						h = parent.clientHeight,
						w = parent.clientWidth,
						$tabContainer = jS.obj.tabContainer(),
						tabContainer = $tabContainer[0],
						tabContainerStyle = tabContainer.style,
						scrollBarWidth = window.scrollBarSize.width,
						tabContainerInnerWidth,
						tabContainerOuterWidth,
						widthTabContainer,
						heightTabContainer,
						uiStyle = jS.obj.ui.style,
						paneHeight,
						paneWidth,
						standardHeight,
						standardWidth,
						tabContainerScrollLeft;

					if (!h) {
						h = 400; //Height really needs to be set by the parent
						$parent.height(h);
					} else if (h < 200) {
						h = 200;
						$parent.height(h);
					}
					tabContainerScrollLeft = tabContainer.scrollLeft;
					tabContainerStyle.width = '';
					tabContainerInnerWidth = tabContainer.clientWidth;
					tabContainerOuterWidth = (w - (s.colMargin + scrollBarWidth));
					widthTabContainer = (w - s.colMargin * 2) + 'px';
					heightTabContainer = ((s.colMargin + scrollBarWidth) + 'px');
					if (tabContainerInnerWidth > tabContainerOuterWidth) {
						tabContainerStyle.height = heightTabContainer;
						$tabContainer.addClass(jS.cl.tabContainerScrollable);
						h -= scrollBarWidth;
					} else {
						tabContainerStyle.height = null;
						$tabContainer.removeClass(jS.cl.tabContainerScrollable);
					}
					tabContainerStyle.width = widthTabContainer;
					tabContainer.scrollLeft = tabContainerScrollLeft;

					h -= jS.obj.header().outerHeight() + s.boxModelCorrection;
					h -= tabContainer.clientHeight + s.boxModelCorrection;

					paneHeight = (h - window.scrollBarSize.height - s.boxModelCorrection) + 'px';
					paneWidth = (w - window.scrollBarSize.width) + 'px';
					standardHeight = (h + 'px');
					standardWidth = (w + 'px');

					jS.obj.panes().each(function() {
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
				},

				/**
				 *
				 */
				showSheets: function() {
					jS.obj.tabContainer().children().each(function(i) {
						$(this).show();
						s.loader.setHidden(i, false);
					});
				},

				showSheet: function(sheetIndex) {
					jS.obj.tabContainer().children().eq(sheetIndex).show();
					s.loader.setHidden(sheetIndex, false);

				},

				hideSheet: function(sheetIndex) {
					jS.obj.tabContainer().children().eq(sheetIndex).hide();
					s.loader.setHidden(sheetIndex, true);
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
							}						   }
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
					var size = s.loader.size(),
						startIndex,
						endIndex,
						start = {},
						stop = {},
						before,

						/**
						 * Sets active bar
						 */
						SetActive = function (highlighter) {
							switch (s.cellSelectModel) {
								case Sheet.openOfficeSelectModel: //follow cursor behavior
									this.row = highlighter.startRowIndex;
									this.col = highlighter.startColumnIndex;
									this.td = jS.getTd(-1, this.row, this.col);
									if (this.td !== null && (jS.cellLast !== null && this.td !== jS.cellLast.td)) {
										jS.cellEdit(this.td, false, true);
									}
									break;
								default: //stay at initial cell
									this.row = highlighter.endRowIndex;
									this.col = highlighter.endColumnIndex;
									this.td = jS.getTd(-1, this.row, this.col);
									if (this.td !== null && (jS.cellLast !== null && this.td !== jS.cellLast.td)) {
										jS.cellEdit(this.td, false, true);
									}
									break;
							}
						},
						obj = [],
						scrolledArea  = jS.obj.pane().actionUI.scrolledArea,
						index,
						row,
						td,
						highlighter = jS.highlighter;

					switch (type) {
						case 'top':
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

							obj.push(begin);

							for (;index < endIndex;index++) {
								obj.push(obj[obj.length - 1].nextSibling);
							}
							break;
						case 'left':
							start.row = first;
							start.col = scrolledArea.col;
							stop.row = last;
							stop.col = scrolledArea.col;

							highlighter.startRowIndex = first;
							highlighter.startColumnIndex = 0;
							highlighter.endRowIndex = last;
							highlighter.endColumnIndex = size.cols;

							row = last;

							do {
								td = jS.getTd(-1, row, 0);
								if (td === null) continue;
								obj.push(td.parentNode);
							} while(row-- > first);
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

					jS.highlighter.set(obj);
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
									first: jS.cellHandler.parseCellName(loc.last.col, loc.last.row),
									last: jS.cellHandler.parseCellName(loc.first.col, loc.first.row)
								};
							} else {
								return {
									first: jS.cellHandler.parseCellName(loc.first.col, loc.first.row),
									last: jS.cellHandler.parseCellName(loc.last.col, loc.last.row)
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

						$document.one('mouseup', function () {
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
				 * @param {Number} _s spreadsheet index
				 * @param {Number} r row index
				 * @param {Number} c column index
				 * @returns {HTMLElement|null}
				 * @memberOf jS
				 */
				getTd:function (_s, r, c) {
					if (_s < 0) {
						_s = jS.i;
					}
					var cell = s.loader.jitCell(_s, r, c);

					if (cell === null) return cell;

					return cell.td || null;
				},

				/**
				 * Gets the td row and column index as an object {row, col}
				 * @param {HTMLTableCellElement} td
				 * @returns {Object}
				 * @memberOf jS
				 */
				getTdLocation:function (td) {
					var result = {col:0, row:0},
						rowOffset = 0,
						pane = jS.obj.pane();

					//rowOffset = pane.actionUI.yDetacher.aboveIndex;

					if (td === u || td === null) return result;

					if (td.parentNode === u || (td.parentNode.rowIndex + rowOffset) < 0) {
						return result;
					}

					return {
						col: td.cellIndex,
						row: td.parentNode.rowIndex + rowOffset
					};
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
						window.UndoManager
							? new UndoManager()
							: {
								undo: emptyFN,
								redo: emptyFN,
								register: emptyFN
							}),
					cells:[],
					id:-1,
					createCells: function(cells, fn, id) {
						if (id === u) {
							jS.undo.id++;
							id = jS.undo.id;
						}

						var before = (new Sheet.CellRange(cells)).clone().cells,
							after = (fn !== u ? (new Sheet.CellRange(fn(cells)).clone()).cells : before);

						before.id = id;
						after.id = id;

						jS.undo.manager.add({
							undo: function() {
								jS.undo.removeCells(before, id);
							},
							redo: function() {
								jS.undo.createCells(after, null, id);
							}
						});

						if (id !== jS.undo.id) {
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
							jS.undo.cells.splice(index, 1);
						}
						jS.undo.draw(cells);
					},
					draw: function(clones) {
						var i,
							td,
							clone,
							cell,
							loc;

						for (i = 0; i < clones.length; i++) {
							clone = clones[i];
							loc = jS.getTdLocation(clone.td);
							cell = jS.spreadsheets[clone.sheetIndex][loc.row][loc.col];

							//TODO add clone method to Sheet.Cell
							cell.value = clone.value;
							cell.formula = clone.formula;
							td = cell.td = clone.td;
							cell.dependencies = clone.dependencies;
							cell.needsUpdated = clone.needsUpdated;
							cell.calcCount = clone.calcCount;
							cell.sheetIndex = clone.sheetIndex;
							cell.rowIndex = loc.row;
							cell.columnIndex = loc.col;
							cell.state = clone.state;
							cell.jS = clone.jS;
							td.setAttribute('style', clone.style);
							td.setAttribute('class', clone.cl);

							cell.setNeedsUpdated();
							cell.updateValue();
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

					//TODO: remove sheetDecorateRemove
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
					var highlighted = jS.highlighter.last || $([]),
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
				 * @param {Number} [i]
				 * @returns {Object} {cols, rows}
				 * @memberOf jS
				 */
				sheetSize:function (i) {
					if (i === undefined) {
						i = jS.i;
					}

					return s.loader.size(i);
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
						td = cell.td;
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
					while(offset = vals.length)							{
						val = vals.pop();
						row = jS.spreadsheets[jS.i].splice(val.row.rowIndex, 1);
						cell = val.cell;
						cell.value = val.valueOf();
						val.row.parentNode.removeChild(val.row);
						trSibling.after(val.row);
						val.row.children[0].innerHTML = trSibling[0].rowIndex + offset;
						jS.spreadsheets[jS.i].splice(trSibling[0].rowIndex + 1, 0, row[0]);
						jS.track.call(cell, true);
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
						cell.updateValue();
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
						pane = jS.obj.pane(),
						table = pane.table,
						tdSibling = selected[0].td,
						cell = tdSibling.jSCell,
						tdSiblingIndex = cell.cellIndex,
						colGroup = table.colGroup,
						size = jS.sheetSize().rows,
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
							jS.spreadsheets[jS.i][tr.rowIndex].splice(td.cellIndex, 0, cell[0]);
							jS.resolveCell(cell, true);
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
						cell.updateValue();
					}
				},

				/**
				 *
				 * @param {HTMLElement} [table]
				 * @returns {Object} {cols, rows}
				 * @memberOf jS
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

					table = table || jS.obj.table()[0];
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

							jS.s.formulaVariables[ref] = cell.updateValue();
						}
					}

					var td = jS.obj.tdActive(),
						cell = td.jSCell;

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
				 * @type Function
				 */
				parseFormula: null,

				/**
				 *
				 * @param {Number} [i]
				 * @param {Boolean} [skipStyles]
				 */
				print: function(i, skipStyles) {
					i = i || jS.i;

					var pWin = window.open(),
						pDoc;


					//popup blockers
					if (pWin !== u) {
						pDoc = pWin.document;
						pDoc.write('<html>\
	<head id="head"></head>\
	<body>\
		<div id="entry" class="' + jS.cl.parent + '" style="overflow: show;">\
		</div>\
	</body>\
</html>');


						if (skipStyles !== true) {
							$(pDoc.getElementById('head')).append($('style,link').clone());
						}

						$(pDoc.getElementById('entry')).append(jS.obj.pane().cloneNode(true));
						pDoc.close();
						pWin.focus();
						pWin.print();
					}
				}
			},
			loaderTables = [],
			loaderTable;

		jS.setBusy(true);
		s.parent[0].jS = jS;

		//got tired of ie crashing when console not available
		if (!window.console) window.console = {log:function () {}};

		if (window.scrollBarSize === u) {
			window.scrollBarSize = getScrollBarSize();
		}

		jS.cellHandler = new Sheet.CellHandler(jS, Sheet.fn);

		jS.theme = new Sheet.Theme(s.theme);

		jS.highlighter = new Sheet.Highlighter(jS.theme.tdHighlighted, jS.theme.barHighlight, jS.theme.tabActive, function() {
			//Chrome has a hard time rendering table col elements when they change style, this triggers the table to be re-rendered
			//jS.obj.pane().actionUI.redraw();
		});

		//We need to take the sheet out of the parent in order to get an accurate reading of it's height and width
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

		$window
			.resize(function () {
				if (jS && !jS.isBusy()) { //We check because jS might have been killed
					s.width = s.parent.width();
					s.height = s.parent.height();
					jS.sheetSyncSize();
				}
			})
			.unload(function() {
				Sheet.thread.kill();
			});


		//Extend the calculation engine plugins
		Sheet.fn = $.extend(Sheet.fn, s.formulaFunctions);

		//Extend the calculation engine with finance functions
		if (Sheet.financefn) {
			Sheet.fn = $.extend(Sheet.fn, Sheet.financefn);
		}

		s.title = s.title || s.parent.attr('title') || '';

		jS.s = s;

		jS.parseFormula = (s.useMultiThreads ? Sheet.parseFormula : Sheet.parseFormulaSlow);

		s.parent.addClass(jS.theme.parent);


		if (s.loader === null) {
			s.loader = (new Sheet.Loader.HTML(s.origHtml))
		}

		s.loader
			.bindJS(jS)
			.bindHandler(jS.cellHandler);

		jS.openSheet(s.loader);

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
		instance[I].obj.panes().each(function (i) {
			var me;
			$(me = this.scrollUI).scroll(function (e) {
				var j = instance.length - 1,
					scrollUI;
				if (j > -1) {
					do {
						scrollUI = instance[j].controls.enclosures[i].scrollUI;

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
	}
};