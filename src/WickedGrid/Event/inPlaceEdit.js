WickedGrid.Event.inPlaceEdit = {
  /**
   *
   * @param {Object} e jQuery event
   * @returns {*}.evt.inPlaceEdit
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
   * @returns {*}.evt.inPlaceEdit
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
   * @returns {*}.evt.inPlaceEdit
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
};