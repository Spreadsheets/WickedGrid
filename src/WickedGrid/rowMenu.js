WickedGrid.rowMenu = function(wickedGrid, index, x, y) {
  if (!wickedGrid.settings.barMenus) return false;
  if (wickedGrid.isBusy()) return false;

  wickedGrid.barMenuLeft().hide();

  if (index > 0) {
    wickedGrid.barHandleFreezeLeft().remove();
  }
  var menu;

  menu = wickedGrid.barMenuLeft();

  if (!menu.length) {
    menu = WickedGrid.menu(wickedGrid, wickedGrid.settings.contextmenuLeft);
    wickedGrid.controls.bar.y.menu[wickedGrid.i] = menu;
  }

  wickedGrid.menus().hide();

  menu
      .css('left', (x - 5) + 'px')
      .css('top', (y - 5) + 'px')
      .show();

  return true;
};