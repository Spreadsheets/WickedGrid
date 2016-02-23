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

        if (wickedGrid.isBusy()) {
          return false;
        }

        if (wickedGrid.isCell(e.target)) {
          WickedGrid.cellMenu(wickedGrid, e.pageX, e.pageY);
          return false;
        }

        if (wickedGrid.isBar(e.target)) {
          var bar = e.target,
              index = bar.index;

          if (index < 0) return false;

          if (actionUI.columnCache.first === actionUI.columnCache.last) {
            WickedGrid.columnMenu(wickedGrid, bar, index, e.pageX, e.pageY);
          } else if (actionUI.columnCache.first === actionUI.columnCache.last) {
            WickedGrid.rowMenu(wickedGrid, bar, index, e.pageX, e.pageY);
          }
          return false;
        }
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
              WickedGrid.columnMenu(wickedGrid, bar, index, e.pageX, e.pageY);
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

    $pane
        .bind('contextmenu', paneContextmenuEvent)
        .disableSelectionSpecial()
        .bind('cellEdit', function(e) {
          return wickedGrid.cellEvents.edit(e);
        });
  }

  WickedGrid.tab(wickedGrid);

  wickedGrid.setChanged(true);
};