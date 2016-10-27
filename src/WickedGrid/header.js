//Creates the control/container for everything above the spreadsheet, removes them if they already exist.controlFactory
WickedGrid.header = function(wickedGrid) {
  wickedGrid.header().remove();
  wickedGrid.sheetAdder().remove();
  wickedGrid.tabContainer().remove();

  var s = wickedGrid.settings,
      header = document.createElement('div'),
      title = document.createElement('h4'),
      menu,
      $menu;

  header.className = wickedGrid.cl.header + ' ' + wickedGrid.theme.control;

  wickedGrid.controls.header = $(header);

  if (s.title) {
    if ($.isFunction(s.title)) {
      s.title = wickedGrid.title(I);
    }

    title.className = wickedGrid.cl.title;
    wickedGrid.controls.title = $(title).html(s.title)
  } else {
    title.style.display = 'none';
  }

  header.appendChild(title);

  if (wickedGrid.isSheetEditable()) {
    if (s.headerMenu) {
      menu = document.createElement('div');
      $menu = $(menu);
      menu.className = wickedGrid.cl.headerMenu + ' ' + wickedGrid.cl.menuFixed + ' ' + wickedGrid.theme.menuFixed + ' ' + wickedGrid.cl.menu;
      header.appendChild(menu);

      wickedGrid.controls.headerMenu[wickedGrid.i] = $menu
          .append(s.headerMenu(wickedGrid))
          .children()
          .addClass(wickedGrid.theme.menuFixed);

      $menu.find('img').load(function () {
        wickedGrid.sheetSyncSize();
      });
    }

    WickedGrid.formulaEditor(wickedGrid, header);
  }

  return header;
};