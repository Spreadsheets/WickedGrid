//Creates the draggable objects for freezing cells
WickedGrid.rowFreezer = function(wickedGrid, index, pane) {
  if (wickedGrid.isBusy()) {
    return false;
  }
  var pane = wickedGrid.pane(),
      actionUI = pane.actionUI,
      table = pane.table,
      tBody = pane.tBody,
      frozenAt = actionUI.frozenAt,
      scrolledArea = actionUI.scrolledArea;

  if (!(scrolledArea.row <= (frozenAt.row + 1))) {
    return false;
  }

  wickedGrid.barHelper().remove();

  var bar = tBody.children[frozenAt.row + 1].children[0],
      paneRectangle = pane.getBoundingClientRect(),
      paneTop = paneRectangle.top + document.body.scrollTop,
      paneLeft = paneRectangle.left + document.body.scrollLeft,
      handle = document.createElement('div'),
      $handle = pane.freezeHandleLeft = $(handle)
          .appendTo(pane)
          .addClass(wickedGrid.theme.barRowFreezeHandle + ' ' + wickedGrid.cl.barHelper + ' ' + wickedGrid.cl.barRowFreezeHandle)
          .width(bar.clientWidth)
          .css('top', (bar.offsetTop - handle.clientHeight + 1) + 'px')
          .attr('title', wickedGrid.msg.dragToFreezeRow),
      highlighter;

  wickedGrid.controls.bar.helper[wickedGrid.i] = wickedGrid.barHelper().add(handle);
  wickedGrid.controls.bar.y.handleFreeze[wickedGrid.i] = $handle;

  wickedGrid.draggable($handle, {
    axis:'y',
    start:function () {
      wickedGrid.setBusy(true);

      highlighter = $(document.createElement('div'))
          .appendTo(pane)
          .css('position', 'absolute')
          .addClass(wickedGrid.theme.barFreezeIndicator + ' ' + wickedGrid.cl.barHelper)
          .width(handle.clientWidth)
          .fadeTo(0,0.33);
    },
    drag:function() {
      var target = $handle.nearest(bar.parentNode.parentNode.children).prev();
      if (target.length && target.position) {
        highlighter.height(target.position().top + target.height());
      }
    },
    stop:function (e, ui) {
      highlighter.remove();
      wickedGrid
          .setBusy(false)
          .setDirty(true);

      var target = $.nearest($handle, bar.parentNode.parentNode.children);
      wickedGrid.barHelper().remove();
      scrolledArea.row = actionUI.frozenAt.row = Math.max(wickedGrid.getTdLocation(target.children(0)[0]).row - 1, 0);
      wickedGrid.autoFillerHide();
    },
    containment:[paneLeft, paneTop, paneLeft, paneTop + pane.clientHeight - window.scrollBarSize.height]
  });

  return true;
};