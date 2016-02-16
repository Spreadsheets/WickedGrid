/**
 * Created the autoFiller object
 * @returns {*|jQuery|null}.controlFactory
 * @param {HTMLElement} pane
 */
WickedGrid.autoFiller = function(pane) {
  if (!this.settings.autoFiller) return false;

  var autoFiller = document.createElement('div'),
      handle = document.createElement('div'),
      cover = document.createElement('div');

  autoFiller.i = jS.i;

  autoFiller.className = this.cl.autoFiller + ' ' + this.theme.autoFiller;
  handle.className = this.cl.autoFillerHandle;
  cover.className = this.cl.autoFillerCover;

  autoFiller.onmousedown = function () {
    var td = this.tdActive();
    if (td) {
      var loc = jS.getTdLocation(td);
      jS.cellSetActive(td, loc, true, jS.autoFillerNotGroup, function () {
        var highlighted = jS.highlighted(),
            hLoc = jS.getTdLocation(highlighted.last());
        jS.fillUpOrDown(hLoc.row < loc.row || hLoc.col < loc.col);
        jS.autoFillerGoToTd(td);
        jS.autoFillerNotGroup = false;
      });
    }

    return false;
  };

  pane.autoFiller = jS.controls.autoFiller[jS.i] = autoFiller;
  pane.appendChild(autoFiller);
  return true;
};