//Creates the control/container for everything above the spreadsheet, removes them if they already exist.controlFactory
WickedGrid.header = function(wickedGrid) {
  wickedGrid.header().remove();
  wickedGrid.sheetAdder().remove();
  wickedGrid.tabContainer().remove();

  var s = wickedGrid.settings,
      header = document.createElement('div'),
      secondRow,
      secondRowTr,
      title = document.createElement('h4'),
      label,
      menu,
      $menu,
      formula,
      formulaParent;

  header.className = wickedGrid.cl.header + ' ' + wickedGrid.theme.control;

  wickedGrid.controls.header = $(header);

  if (s.title) {
    if ($.isFunction(s.title)) {
      s.title = wickedGrid.title(I);
    }

    title.className = wickedGrid.cl.title;
    wickedGrid.controls.title = $(title).html(s.title)
  } else {
    $(title).hide();
  }
  header.appendChild(title);

  if (this.isSheetEditable()) {
    if (s.menu) {
      menu = document.createElement('div');
      $menu = $(menu);
      menu.className = wickedGrid.cl.menu + ' ' + wickedGrid.cl.menuFixed + ' ' + wickedGrid.theme.menuFixed;
      header.appendChild(menu);

      wickedGrid.controls.menu[wickedGrid.i] = $menu
          .append(s.menu)
          .children()
          .addClass(wickedGrid.theme.menuFixed);

      $menu.find('img').load(function () {
        wickedGrid.sheetSyncSize();
      });
    }

    label = document.createElement('td');
    label.className = wickedGrid.cl.label + ' ' + wickedGrid.theme.control;
    wickedGrid.controls.label = $(label);

    //Edit box menu
    formula = document.createElement('textarea');
    formula.className = wickedGrid.cl.formula + ' ' + wickedGrid.theme.controlTextBox;
    formula.onkeydown = wickedGrid.evt.formula.keydown;
    formula.onkeyup = function () {
      wickedGrid.inPlaceEdit().value = this.value;
    };
    formula.onchange = function () {
      wickedGrid.inPlaceEdit().value = this.value;
    };
    formula.onpaste = wickedGrid.pasteOverCells;
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

    secondRow = document.createElement('table');
    secondRowTr = document.createElement('tr');
    secondRow.appendChild(secondRowTr);

    header.appendChild(secondRow);

    formulaParent = document.createElement('td');
    formulaParent.className = this.cl.formulaParent;
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

    var instance = WickedGrid.instance;
    for(var i = 0; i < instance.length; i++) {
      (instance || {}).nav = false;
    }

    wickedGrid.setNav(true);

    $(document).keydown(WickedGrid.document.keydown);
  }

  return header;
};