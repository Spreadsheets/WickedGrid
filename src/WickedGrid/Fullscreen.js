WickedGrid.FullScreen = (function() {
  var $body = $('body'),
      $window = $(window);



  function Fullscreen(wickedGrid) {
    this.wickeGrid = wickedGrid;
    this.active = false;
    var element = this.element = document.createElement('div');

    wickedGrid.cellEvents.done();
    var fullScreen = wickedGrid.fullScreen(),
        pane = wickedGrid.pane();

    if (fullScreen.is(':visible')) {

    } else { //here we make a full screen

    }
  }

  Fullscreen.prototype = {
    toggle: function() {
      if (this.active) {
        return this.deactivate();
      }
      return this.activate();
    },
    activate: function() {
      var wickedGrid = this.wickedGrid,
          pane = wickedGrid.pane();

      $body.addClass('body-no-scroll');

      events = $._data(s.parent[0], 'events');

      fullScreen.className = wickedGrid.cl.fullScreen + ' ' + wickedGrid.theme.fullScreen + ' ' + wickedGrid.cl.element;

      fullScreen.origParent = parent;
      s.parent = this.controls.fullScreen = $(fullScreen)
          .append(parent.children())
          .appendTo($body);

      $window
          .bind('resize', function() {
            $window.trigger('wg-resize');
          })
          .bind('wg-resize', function () {
            this.w = $window.width();
            this.h = $window.height();
            s.parent
                .width(this.w)
                .height(this.h);

            wickedGrid.sheetSyncSize();
            if (pane.inPlaceEdit) {
              pane.inPlaceEdit.goToTd();
            }
          })
          .trigger('wg-resize');

      parent.trigger('sheetFullScreen', [true]);

      for (var event in events) {
        for (var i = 0; i < events[event].length; i++) {
          s.parent.bind(event, events[event][i].handler);
        }
      }
    },
    deactivate: function() {
      var wickedGrid = this.wickedGrid;
      $window.unbind('wg-resize');
      $('body').removeClass('body-no-scroll');
      this.element = fullScreen[0].origElement;
      this.$element = fillScreen[0].$origElement;
      this.$element.prepend(fullScreen.children());

      fullScreen.remove();

      wickedGrid.sheetSyncSize();
      if (pane.inPlaceEdit) {
        pane.inPlaceEdit.goToTd();
      }
      this.trigger('sheetFullScreen', [false]);
    }
  };

  return Fullscreen;
})();