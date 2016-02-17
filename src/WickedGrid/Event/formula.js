WickedGrid.event.formula = {
  /**
   *
   * @param {Object} e jQuery event
   * @returns {*}.evt.formula
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
   * @returns {*}.evt.keydownHandler
   */
  If:function (ifTrue, e) {
    if (ifTrue) {
      $(jS.obj.tdActive()).dblclick();
      return true;
    }
    return false;
  }
};