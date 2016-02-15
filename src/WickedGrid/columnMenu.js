WickedGrid.columnMenu = function(wickedGrid, target, x, y) {
  if (wickedGrid.isBusy()) {
    return false;
  }
  var menu = wickedGrid.barMenuTop().hide();

  if (!menu.length) {
    menu = WickedGrid.menu(wickedGrid.settings.contextmenuTop);
    wickedGrid.controls.bar.x.menu[wickedGrid.i] = menu;
  }

  wickedGrid.menus().hide();

  if (!target) {
    menu
        .css('left', (x - 5) + 'px')
        .css('top', (y - 5) + 'px')
        .show();
    return menu;
  }

  var barMenuParentTop = wickedGrid.barMenuParentTop().hide();

  if (!barMenuParentTop.length) {

    barMenuParentTop = $(document.createElement('div'))
        .addClass(wickedGrid.theme.barMenuTop + ' ' + wickedGrid.cl.barHelper + ' ' + wickedGrid.cl.barTopMenuButton)
        .append(
            $(document.createElement('span'))
                .addClass('ui-icon ui-icon-triangle-1-s')
        )
        .mousedown(function (e) {
          barMenuParentTop.parent()
              .mousedown()
              .mouseup();

          menu
              .css('left', (e.pageX - 5) + 'px')
              .css('top', (e.pageY - 5) + 'px')
              .show();
        })
        .blur(function () {
          if (menu) menu.hide();
        });

    barMenuParentTop.get(0).destroy = function(){
      barMenuParentTop.remove();
      wickedGrid.controls.bar.x.menuParent[wickedGrid.i] = null;
    };

    wickedGrid.controls.bar.x.menuParent[wickedGrid.i] = barMenuParentTop;
  }

  barMenuParentTop
      .prependTo(target)
      .show();
};