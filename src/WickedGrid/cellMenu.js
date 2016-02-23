WickedGrid.cellMenu = function(wickedGrid, x, y) {
  if (wickedGrid.isBusy()) {
    return false;
  }
  wickedGrid.tdMenu().hide();

  var menu = wickedGrid.tdMenu();

  if (!menu.length) {
    menu = WickedGrid.menu(wickedGrid, wickedGrid.settings.contextmenuCell);
    wickedGrid.controls.tdMenu[wickedGrid.i] = menu;
  }

  wickedGrid.menus().hide();

  menu
      .css('left', (x - 5) + 'px')
      .css('top', (y - 5) + 'px')
      .show();

  return true;
};