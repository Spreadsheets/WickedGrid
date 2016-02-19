WickedGrid.tab = function(wickedGrid) {
  var tab = document.createElement('span'),
      $tab = wickedGrid.controls.tab[wickedGrid.i] = $(tab).appendTo(wickedGrid.tabContainer());

  tab.setAttribute('class', WickedGrid.cl.tab + ' ' + wickedGrid.theme.tab);
  wickedGrid.sheetTab(true, function(sheetTitle) {
    tab.innerHTML = sheetTitle;
  });

  tab.i = wickedGrid.i;
  wickedGrid.controls.tabs = wickedGrid.tabs().add($tab);

  return tab;
};