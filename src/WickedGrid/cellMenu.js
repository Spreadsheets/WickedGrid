WickedGrid.cellMenu = function(wickedGrid) {
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
      .css('left', (e.pageX - 5) + 'px')
      .css('top', (e.pageY - 5) + 'px')
      .show();

  return true;
};