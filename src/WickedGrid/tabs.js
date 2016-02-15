//Creates the tab interface
WickedGrid.tabs = function(wickedGrid) {
  var tabContainer = document.createElement('span'),
      startPosition;
  tabContainer.setAttribute('class', wickedGrid.cl.tabContainer);

  tabContainer.onmousedown = function (e) {
    e = e || window.event;

    var i = (e.target || e.srcElement).i;
    if (i >= 0) {
      wickedGrid.trigger('sheetSwitch', [i]);
    }
    return false;
  };
  tabContainer.ondblclick = function (e) {
    e = e || window.event;
    var i = (e.target || e.srcElement).i;
    if (i >= 0) {
      wickedGrid.trigger('sheetRename', [i]);
    }
    return false;
  };

  if (wickedGrid.isSheetEditable() && $.fn.sortable) {
    return wickedGrid.controls.tabContainer = $(tabContainer).sortable({
      placeholder:'ui-state-highlight',
      axis:'x',
      forceHelperSize:true,
      forcePlaceholderSize:true,
      opacity:0.6,
      start:function (e, ui) {
        startPosition = ui.item.index();
        wickedGrid.trigger('sheetTabSortStart', [e, ui]);
      },
      update:function (e, ui) {
        wickedGrid.trigger('sheetTabSortUpdate', [e, ui, startPosition]);
      }
    });
  }

  return wickedGrid.controls.tabContainer = $(tabContainer);
};