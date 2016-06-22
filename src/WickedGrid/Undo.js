WickedGrid.Undo = (function() {
  function Undo() {}

  Undo.prototype = {
    manager:(
        window.UndoManager
            ? new UndoManager()
            : {
          undo: empty,
          redo: empty,
          register: empty
        }),
        cells:[],
      id:-1,
      createCells: function(cells, fn, id) {
    if (id === u) {
      jS.undo.id++;
      id = jS.undo.id;
    }

    var before = (new WickedGrid.CellRange(cells)).clone().cells,
        after = (fn !== u ? (new WickedGrid.CellRange(fn(cells)).clone()).cells : before);

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

        //TODO add clone method to WickedGrid.Cell
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
  };
  return Undo;
})();