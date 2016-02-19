//Creates the draggable objects for freezing cells
WickedGrid.columnFreezer = function(wickedGrid) {
  if (!wickedGrid.settings.freezableCells) return false;
  if (wickedGrid.isBusy()) return false;

  var pane = wickedGrid.pane(),
      actionUI = pane.actionUI,
      tBody = pane.tBody,
      frozenAt = actionUI.frozenAt,
      scrolledArea = actionUI.scrolledArea;

  if (!(scrolledArea.col <= (frozenAt.col + 1))) {
    return false;
  }

  wickedGrid.barHelper().remove();

  var highlighter,
      bar = tBody.children[0].children[frozenAt.col + 1],
      paneRectangle = pane.getBoundingClientRect(),
      paneTop = paneRectangle.top + document.body.scrollTop,
      paneLeft = paneRectangle.left + document.body.scrollLeft,
      handle = document.createElement('div'),
      $handle = pane.freezeHandleTop = $(handle)
          .appendTo(pane)
          .addClass(wickedGrid.theme.barHandleFreezeTop + ' ' + wickedGrid.cl.barHelper + ' ' + wickedGrid.cl.barHandleFreezeTop)
          .height(bar.clientHeight - 1)
          .css('left', (bar.offsetLeft - handle.clientWidth) + 'px')
          .attr('title', wickedGrid.msg.dragToFreezeCol);

  wickedGrid.controls.bar.helper[wickedGrid.i] = wickedGrid.barHelper().add(handle);
  wickedGrid.controls.bar.x.handleFreeze[wickedGrid.i] = $handle;

  wickedGrid.draggable($handle, {
    axis:'x',
    start:function () {
      wickedGrid.setBusy(true);

      highlighter = $(document.createElement('div'))
          .appendTo(pane)
          .css('position', 'absolute')
          .addClass(wickedGrid.theme.barFreezeIndicator + ' ' + wickedGrid.cl.barHelper)
          .height(bar.clientHeight - 1)
          .fadeTo(0,0.33);
    },
    drag:function() {
      var target = wickedGrid.nearest($handle, bar.parentNode.children).prev();
      if (target.length && target.position) {
        highlighter.width(target.position().left + target.width());
      }
    },
    stop:function (e, ui) {
      highlighter.remove();
      wickedGrid.setBusy(false);
      wickedGrid.setDirty(true);
      var target = wickedGrid.nearest($handle, bar.parentNode.children);

      wickedGrid.barHelper().remove();
      scrolledArea.col = actionUI.frozenAt.col = wickedGrid.getTdLocation(target[0]).col - 1;
      wickedGrid.autoFillerHide();
    },
    containment:[paneLeft, paneTop, paneLeft + pane.clientWidth - window.scrollBarSize.width, paneTop]
  });

  return true;
};