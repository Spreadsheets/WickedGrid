WickedGrid.sheetUI = function(wickedGrid, ui, i) {
  //TODO: move to SpreadsheetUI
  wickedGrid.i = i;

  //TODO: readOnly from metadata
  //wickedGrid.readOnly[i] = (table.className || '').match(/\breadonly\b/i) != null;

  var enclosure = WickedGrid.enclosure(wickedGrid),
      pane = enclosure.pane,
      $pane = $(pane),
      actionUI = pane.actionUI,
      paneContextmenuEvent = function (e) {
        e = e || window.event;
        var target = e.target,
            parent = target.parentNode;

        if (wickedGrid.isBusy()) {
          return false;
        }

        if (wickedGrid.isCell(e.target)) {
          wickedGrid.cellContextMenu.show(e.pageX, e.pageY);
          return false;
        }

        if (!wickedGrid.isBar(target)) return;

        //corner
        if (target.cellIndex === 0 && parent.rowIndex === 0) return;

        //row
        if (parent.rowIndex === 0) {
          wickedGrid.columnContextMenu.show(e.pageX, e.pageY);
        } else {
          wickedGrid.rowContextMenu.show(e.pageX, e.pageY);
        }

        return false;
      };

  ui.appendChild(enclosure);

  if (wickedGrid.isSheetEditable()) {
    WickedGrid.autoFiller(wickedGrid, pane);
  }

  if (wickedGrid.isSheetEditable()) {
    var formula = wickedGrid.formula(),
        mouseDownEntity = '';

    $pane.mousedown(function (e) {
      wickedGrid.setNav(true);
      if (wickedGrid.isBusy()) {
        return false;
      }

      if (wickedGrid.isCell(e.target)) {
        if (e.button == 2) {
          paneContextmenuEvent.call(this, e);
          wickedGrid.cellEvents.mouseDown(e);
          return true;
        }
        wickedGrid.cellEvents.mouseDown(e);
        return false;
      }

      if (wickedGrid.isBar(e.target)) { //possibly a bar
        if (e.button == 2) {
          paneContextmenuEvent.call(this, e);
        }
        mouseDownEntity = e.target.entity;
        actionUI.selectBar(e.target);
        return false;
      }

      return true;
    });

    pane.onmouseup = function() {
      mouseDownEntity = '';
    };

    pane.onmouseover = function (e) {
      e = e || window.event;
      //This manages bar resize, bar menu, and bar selection
      if (wickedGrid.isBusy()) {
        return false;
      }

      if (!wickedGrid.isBar(e.target)) {
        return false;
      }

      var bar = e.target || e.srcElement,
          index = bar.index,
          entity = bar.entity;

      if (index < 0) {
        return false;
      }


      switch (entity) {
        case WickedGrid.columnEntity:
          if (actionUI.columnCache.selecting && bar === mouseDownEntity) {
            actionUI.columnCache.last = index;
            wickedGrid.cellSetActiveBar(WickedGrid.columnEntity, actionUI.columnCache.first, actionUI.columnCache.last);
          } else {
            WickedGrid.columnResizer(wickedGrid, bar, index, pane);

            if (wickedGrid.isSheetEditable()) {
              WickedGrid.columnFreezer(wickedGrid, index, pane);
              wickedGrid.columnMenu
                  .setColumn(bar)
                  .show(e.pageX, e.pageY);
            }
          }
          break;
        case WickedGrid.rowEntity:
          if (actionUI.rowCache.selecting && bar === mouseDownEntity) {
            actionUI.rowCache.last = index;
            wickedGrid.cellSetActiveBar(WickedGrid.rowEntity, actionUI.rowCache.first, actionUI.rowCache.last);
          } else {
            WickedGrid.rowResizer(wickedGrid, bar, index, pane);

            if (wickedGrid.isSheetEditable()) {
              WickedGrid.rowFreezer(wickedGrid, index, pane);
            }
          }
          break;
      }

      return true;
    };

    pane.ondblclick = function(e) {
      return wickedGrid.cellEvents.dblClick(e);
    };

    pane.oncontextmenu = paneContextmenuEvent;

    $pane
        .disableSelectionSpecial()
        .bind('cellEdit', function(e) {
          if (!e.target._cell) return;
          return wickedGrid.cellEvents.edit(e.target._cell);
        });
  }

  WickedGrid.tab(wickedGrid);

  wickedGrid.setChanged(true);
};