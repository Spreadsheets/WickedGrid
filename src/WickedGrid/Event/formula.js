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