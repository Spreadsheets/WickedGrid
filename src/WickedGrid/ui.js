WickedGrid.ui = function(wickedGrid) {
  var ui = document.createElement('div');
  ui.setAttribute('class',WickedGrid.cl.ui);
  wickedGrid.ui = ui;
  return ui;
};