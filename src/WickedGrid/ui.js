WickedGrid.ui = function(wickedGrid) {
  var ui = document.createElement('div');
  ui.setAttribute('class', wickedGrid.cl.ui);
  wickedGrid.ui = ui;
  return ui;
};