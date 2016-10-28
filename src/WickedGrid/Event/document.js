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