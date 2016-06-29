WickedGrid.FullScreen = (function() {
  var $body = $('body'),
      $window = $(window);
  
  function Fullscreen(wickedGrid) {
    wickedGrid.cellEvents.done();
    this.wickedGrid = wickedGrid;
    this.active = false;
    this.container = document.createElement('div');
  }

  Fullscreen.prototype = {
    toggle: function() {
      if (this.active) {
        this.deactivate();
      } else {
        this.activate();
      }
    },
    activate: function() {
      var wickedGrid = this.wickedGrid,
          pane = wickedGrid.pane(),
          element = wickedGrid.settings.element,
          events = $._data(element[0], 'events'),
          container = this.container;

      $body.addClass('body-no-scroll');

      container.className = wickedGrid.cl.fullScreen + ' ' + wickedGrid.theme.fullScreen + ' ' + wickedGrid.cl.element;

      $(container)
          .append(element.children())
          .appendTo($body);

      $window
          .bind('resize', function() {
            $window.trigger('wg-resize');
          })
          .bind('wg-resize', function () {
            container
                .width(window.innerWidth)
                .height(window.innerHeight);

            wickedGrid.sheetSyncSize();
            if (pane.inPlaceEdit) {
              pane.inPlaceEdit.goToTd();
            }
          })
          .trigger('wg-resize');

      element.trigger('sheetFullScreen', [true]);

      for (var event in events) {
        if (!events.hasOwnProperty(event)) continue;

        for (var i = 0; i < events[event].length; i++) {
          element.bind(event, events[event][i].handler);
        }
      }
    },
    deactivate: function() {
      var wickedGrid = this.wickedGrid,
          pane = this.pane(),
          element = wickedGrid.settings.element,
          container = this.container;

      $window.unbind('wg-resize');
      $body.removeClass('body-no-scroll');

      element.prepend(container.children);
      container.detach();

      wickedGrid.sheetSyncSize();
      if (pane.inPlaceEdit) {
        pane.inPlaceEdit.goToTd();
      }

      $window.unbind('resize wg-resize');

      wickedGrid.trigger('sheetFullScreen', [false]);
    }
  };

  return Fullscreen;
})();