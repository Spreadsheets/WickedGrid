WickedGrid.rowResizer = function(wickedGrid) {
  wickedGrid.barLeftControls().remove();
  var barRectangle = bar.getBoundingClientRect(),
      barOffsetTop = barRectangle.top + document.body.scrollTop,
      barOffsetLeft = barRectangle.left + document.body.scrollLeft,
      barController = document.createElement('div'),
      $barController = $(barController)
          .addClass(wickedGrid.cl.barController + ' ' + wickedGrid.theme.barResizer)
          .prependTo(bar)
          .offset({
            top: barOffsetTop,
            left: barOffsetLeft
          }),
      parent = bar.parentNode,
      child = document.createElement('div'),
      $child = $(child)
          .addClass(wickedGrid.cl.barControllerChild)
          .height(bar.clientHeight)
          .prependTo($barController),
      handle;

  wickedGrid.controls.bar.y.controls[jS.i] = wickedGrid.barLeftControls().add($barController);

  wickedGrid.resizableCells($child, {
    handles:'s',
    start:function () {
      wickedGrid.autoFillerHide();
      wickedGrid.setBusy(true);
      if (pane.freezeHandleLeft) {
        pane.freezeHandleLeft.remove();
      }
    },
    resize:function (e, ui) {
      barController.style.height
          = bar.style.height
          = parent.style.height
          = ui.size.height + 'px';

      if (pane.inPlaceEdit) {
        pane.inPlaceEdit.goToTd();
      }
    },
    stop:function (e, ui) {
      wickedGrid.setBusy(false);
      if (pane.inPlaceEdit) {
        pane.inPlaceEdit.goToTd();
      }
      wickedGrid.followMe();
      wickedGrid.setDirty(true);
    },
    minHeight: 15
  });

  handle = child.children[0];
  handle.style.width = bar.offsetWidth + 'px';
  handle.style.position = 'absolute';
};