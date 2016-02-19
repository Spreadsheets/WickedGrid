WickedGrid.sheetUI = function(wickedGrid, ui, i) {
  //TODO: move to SpreadsheetUI
  wickedGrid.i = i;

  //TODO: readOnly from metadata
  //jS.readOnly[i] = (table.className || '').match(/\breadonly\b/i) != null;

  var enclosure = WickedGrid.enclosure(wickedGrid),
      pane = enclosure.pane,
      $pane = $(pane),
      paneContextmenuEvent = function (e) {
        e = e || window.event;
        if (wickedGrid.isBusy()) {
          return false;
        }
        if (wickedGrid.isBar(e.target)) {
          var bar = e.target,
              index = bar.index,
              entity = bar.entity;

          if (index < 0) return false;

          if (wickedGrid.evt.barInteraction.first === jS.evt.barInteraction.last) {
            //TODO: change this
            jS.controlFactory.barMenu[entity](e, index);
          }
        } else {
          WickedGrid.cellMenu(e);
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
          wickedGrid.evt.cellOnMouseDown(e);
          return true;
        }
        wickedGrid.evt.cellOnMouseDown(e);
        return false;
      }

      if (wickedGrid.isBar(e.target)) { //possibly a bar
        if (e.button == 2) {
          paneContextmenuEvent.call(this, e);
        }
        mouseDownEntity = e.target.entity;
        wickedGrid.evt.barInteraction.select(e.target);
        return false;
      }

      return true;
    });

    pane.onmouseup = function() {
      mouseDownEntity = '';
    };

    pane.onmouseover = function (e) {
      e = e || window.event;

      var target = e.target || e.srcElement;

      //This manages bar resize, bar menu, and bar selection
      if (jS.isBusy()) {
        return false;
      }

      if (!jS.isBar(target)) {
        return false;
      }
      var bar = target,
          entity = bar.entity,
          index = bar.index;

      if (index < 0) {
        return false;
      }

      if (wickedGrid.evt.barInteraction.selecting && bar === mouseDownEntity) {
        wickedGrid.evt.barInteraction.last = index;

        wickedGrid.cellSetActiveBar(entity, jS.evt.barInteraction.first, jS.evt.barInteraction.last);
      } else {
        jS.resizeBar[entity](bar, index, pane);

        if (wickedGrid.isSheetEditable()) {
          jS.controlFactory.barHandleFreeze[entity](index, pane);

          if (entity == 'top') {
            jS.controlFactory.barMenu[entity](e, index, bar);
          }
        }
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