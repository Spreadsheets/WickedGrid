WickedGrid.columnResizer = function(wickedGrid, bar) {
  wickedGrid.barTopControls().remove();
  var barController = document.createElement('div'),
      $barController = $(barController)
          .addClass(wickedGrid.cl.barController + ' ' + wickedGrid.theme.barResizer)
          .width(bar.clientWidth)
          .prependTo(bar),
      handle,
      pane = wickedGrid.pane();

  wickedGrid.controls.bar.x.controls[wickedGrid.i] = wickedGrid.barTopControls().add($barController);

  wickedGrid.resizableCells($barController, {
    handles:'e',
    start:function (e, ui) {
      wickedGrid.autoFillerHide();
      wickedGrid.setBusy(true);
      if (pane.freezeHandleTop) {
        pane.freezeHandleTop.remove();
      }
    },
    resize:function (e, ui) {
      bar.col.style.width = ui.size.width + 'px';

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
    minWidth: 32
  });

  handle = barController.children[0];
  handle.style.height = bar.clientHeight + 'px';
};