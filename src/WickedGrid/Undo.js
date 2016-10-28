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