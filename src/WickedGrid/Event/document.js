WickedGrid.event.document = {
  /**
   *
   * @param {Object} e jQuery event
   * @returns {*}.evt.document
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
   * @returns {*}.evt.document
   */
  tab:function (e) {
    jS.evt.cellSetActiveFromKeyCode(e);
  },

  /**
   *
   * @param {Object} e jQuery event
   * @returns {*}.evt.document
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
   * @returns {*}.evt.document
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
   * @returns {*}.evt.document
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
   * @returns {Boolean}.evt.document
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
   * @returns {*}.evt.document
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
};