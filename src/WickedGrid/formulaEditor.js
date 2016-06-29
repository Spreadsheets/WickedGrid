//Creates the control/container for everything above the spreadsheet, removes them if they already exist.controlFactory
WickedGrid.formulaEditor = function(wickedGrid, header) {
  var label = document.createElement('td');
  label.className = wickedGrid.cl.label + ' ' + wickedGrid.theme.control;
  wickedGrid.controls.label = $(label);
  var formula = document.createElement('textarea');
  formula.className = wickedGrid.cl.formula + ' ' + wickedGrid.theme.controlTextBox;
  formula.onkeydown = function(e) {
    return wickedGrid.formulaEvents.keydown(e);
  };
  formula.onkeyup = function () {
    wickedGrid.inPlaceEdit().value = formula.value;
  };
  formula.onchange = function () {
    wickedGrid.inPlaceEdit().value = formula.value;
  };
  formula.onpaste = function(e) {
    return wickedGrid.pasteOverCells(e);
  };
  formula.onfocus = function () {
    wickedGrid.setNav(false);
  };
  formula.onfocusout = function () {
    wickedGrid.setNav(true);
  };
  formula.onblur = function () {
    wickedGrid.setNav(true);
  };
  wickedGrid.controls.formula = $(formula);

  // resizable formula area - a bit hard to grab the handle but is there!
  var formulaResize = document.createElement('span');
  formulaResize.appendChild(formula);

  var secondRow = document.createElement('table');
  var secondRowTr = document.createElement('tr');
  secondRow.appendChild(secondRowTr);

  header.appendChild(secondRow);

  var formulaParent = document.createElement('td');
  formulaParent.className = wickedGrid.cl.formulaParent;
  formulaParent.appendChild(formulaResize);
  secondRowTr.appendChild(label);
  secondRowTr.appendChild(formulaParent);

  //spacer
  secondRowTr.appendChild(document.createElement('td'));

  wickedGrid.resizableSheet($(formulaResize), {
    minHeight:wickedGrid.controls.formula.height(),
    maxHeight:78,
    handles:'s',
    resize:function (e, ui) {
      wickedGrid.controls.formula.height(ui.size.height);
    },
    stop: function() {
      wickedGrid.sheetSyncSize();
    }
  });

  var instances = WickedGrid.instances;
  for(var i = 0; i < instances.length; i++) {
    (instances || {}).nav = false;
  }

  wickedGrid.setNav(true);

  $(document).keydown(function(e) {
    return wickedGrid.documentEvents.keydown(e);
  });

  return formula;
};