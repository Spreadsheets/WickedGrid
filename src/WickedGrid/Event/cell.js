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
