WickedGrid.rowMenu = function(wickedGrid) {
  if (wickedGrid.isBusy()) {
    return false;
  }
  wickedGrid.barMenuLeft().hide();

  if (i) {
    wickedGrid.barHandleFreezeLeft().remove();
  }
  var menu;

  menu = wickedGrid.barMenuLeft();

  if (!menu.length) {
    menu = WickedGrid.menu(wickedGrid.settings.contextmenuLeft);
    wickedGrid.controls.bar.y.menu[wickedGrid.i] = menu;
  }

  wickedGrid.menus().hide();

  menu
      .css('left', (e.pageX - 5) + 'px')
      .css('top', (e.pageY - 5) + 'px')
      .show();

  return true;
};