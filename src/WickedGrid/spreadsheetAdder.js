WickedGrid.spreadsheetAdder = function(wickedGrid) {
  var adder = document.createElement('span');
  if (wickedGrid.isSheetEditable()) {
    adder.setAttribute('class', WickedGrid.cl.sheetAdder + ' ' + WickedGrid.cl.tab + ' ' + wickedGrid.theme.tab);
    adder.setAttribute('title', WickedGrid.msg.addSheet);
    adder.innerHTML = '+';
    adder.onmousedown = function () {
      wickedGrid.addSheet();

      return false;
    };
    adder.i = -1;
  }

  wickedGrid.controls.sheetAdder = $(adder);

  return adder;
};