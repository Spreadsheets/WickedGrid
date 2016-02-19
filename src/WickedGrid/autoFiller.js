/**
 * Created the autoFiller object
 * @returns {*|jQuery|null}.controlFactory
 * @param {WickedGrid} wickedGrid
 * @param {HTMLElement} pane
 */
WickedGrid.autoFiller = function(wickedGrid, pane) {
  if (!wickedGrid.settings.autoFiller) return false;

  var autoFiller = document.createElement('div'),
      handle = document.createElement('div'),
      cover = document.createElement('div');

  autoFiller.i = wickedGrid.i;

  autoFiller.className = WickedGrid.cl.autoFiller + ' ' + wickedGrid.theme.autoFiller;
  handle.className = WickedGrid.cl.autoFillerHandle;
  cover.className = WickedGrid.cl.autoFillerCover;

  autoFiller.onmousedown = function () {
    var td = this.tdActive();
    if (td) {
      var loc = wickedGrid.getTdLocation(td);
      wickedGrid.cellSetActive(td, loc, true, WickedGrid.autoFillerNotGroup, function () {
        var highlighted = wickedGrid.highlighted(),
            hLoc = wickedGrid.getTdLocation(highlighted.last());
        wickedGrid.fillUpOrDown(hLoc.row < loc.row || hLoc.col < loc.col);
        wickedGrid.autoFillerGoToTd(td);
        wickedGrid.autoFillerNotGroup = false;
      });
    }

    return false;
  };

  pane.autoFiller = wickedGrid.controls.autoFiller[wickedGrid.i] = autoFiller;
  pane.appendChild(autoFiller);
  return true;
};