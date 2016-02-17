// The viewing console for spreadsheet
WickedGrid.enclosure = function(wickedGrid) {
  var enclosure = document.createElement('div'),
      $enclosure = $(enclosure),
      actionUI = new WickedGrid.ActionUI(wickedGrid, enclosure, this.cl.scroll, wickedGrid.settings.frozenAt[wickedGrid.i]),
      pane = actionUI.pane;

  pane.className = WickedGrid.cl.pane + ' ' + wickedGrid.theme.pane;
  enclosure.className = WickedGrid.cl.enclosure;

  enclosure.pane = pane;

  pane.enclosure = enclosure;
  pane.$enclosure = $enclosure;

  wickedGrid.controls.pane[wickedGrid.i] = pane;
  wickedGrid.controls.panes = wickedGrid.panes().add(pane);
  wickedGrid.controls.enclosures[wickedGrid.i] = enclosure;

  return enclosure;
};