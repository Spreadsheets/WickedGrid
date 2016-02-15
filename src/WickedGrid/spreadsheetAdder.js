WickedGrid.spreadsheetAdder = function(wickedGrid) {
  var addSheet = document.createElement('span');
  if (wickedGrid.isSheetEditable()) {
    addSheet.setAttribute('class', wickedGrid.cl.sheetAdder + ' ' + wickedGrid.cl.tab + ' ' + wickedGrid.theme.tab);
    addSheet.setAttribute('title', wickedGrid.msg.addSheet);
    addSheet.innerHTML = '+';
    addSheet.onmousedown = function () {
      wickedGrid.addSheet();

      return false;
    };
    addSheet.i = -1;
  }
  return jS.controls.sheetAdder = $(addSheet);
};