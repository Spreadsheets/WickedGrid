WickedGrid.customTab = function(wickedGrid, title) {
  var tab = document.createElement('span'),
      $tab = $(tab).appendTo(wickedGrid.tabContainer());

  tab.setAttribute('class', wickedGrid.cl.tab + ' ' + wickedGrid.theme.tab);
  tab.innerHTML = title;

  return $tab;
};