WickedGrid.cellMenu = function(wickedGrid, x, y) {
  if (this.isBusy()) {
    return false;
  }
  this.tdMenu().hide();

  var menu = this.tdMenu();

  if (!menu.length) {
    menu = WickedGrid.menu(wickedGrid.settings.contextmenuCell);
    wickedGrid.controls.tdMenu[wickedGrid.i] = menu;
  }

  this.menus().hide();

  menu
      .css('left', (x - 5) + 'px')
      .css('top', (y - 5) + 'px')
      .show();

  return true;
};