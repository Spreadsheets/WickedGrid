WickedGrid.tab = function(wickedGrid) {
  var tab = document.createElement('span'),
      $tab = wickedGrid.controls.tab[wickedGrid.i] = $(tab).appendTo(this.tabContainer());

  tab.setAttribute('class', wickedGrid.cl.tab + ' ' + wickedGrid.theme.tab);
  wickedGrid.sheetTab(true, function(sheetTitle) {
    tab.innerHTML = sheetTitle;
  });

  tab.i = wickedGrid.i;
  jS.controls.tabs = wickedGrid.tabs().add($tab);

  return tab;
};