WickedGrid.customTab = function(wickedGrid) {
  var tab = document.createElement('span'),
      $tab = $(tab).appendTo(wickedGrid.tabContainer());

  tab.setAttribute('class', wickedGrid.cl.tab + ' ' + wickedGrid.theme.tab);
  tab.innerHTML = title;

  return $tab;
};