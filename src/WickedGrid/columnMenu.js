WickedGrid.columnMenu = function(wickedGrid, bar, index, x, y) {
  if (!wickedGrid.settings.barMenus) return false;
  if (wickedGrid.isBusy()) return false;

  var menu = wickedGrid.barMenuTop().hide();

  if (menu.length < 1) {
    menu = WickedGrid.menu(wickedGrid, wickedGrid.settings.contextmenuTop);
    wickedGrid.controls.bar.x.menu[wickedGrid.i] = menu;
  }

  wickedGrid.menus().hide();

  if (!bar) {
    menu
        .css('left', (x - 5) + 'px')
        .css('top', (y - 5) + 'px')
        .show();
    return menu;
  }

  var barMenuParentTop = wickedGrid.barMenuParentTop().hide();

  if (!barMenuParentTop.length) {

    barMenuParentTop = $(document.createElement('div'))
        .addClass(wickedGrid.theme.barColumnMenu + ' ' + wickedGrid.cl.barHelper + ' ' + wickedGrid.cl.barColumnMenuButton)
        .append(
            $(document.createElement('span'))
                .addClass('ui-icon ui-icon-triangle-1-s')
        )
        .mousedown(function (e) {
          barMenuParentTop.parent()
              .mousedown()
              .mouseup();

          menu
              .css('left', (x - 5) + 'px')
              .css('top', (y - 5) + 'px')
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
      .prependTo(bar)
      .show();
};