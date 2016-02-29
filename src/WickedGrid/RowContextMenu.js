WickedGrid.RowContextMenu = (function() {
  function RowContextMenu(wickedGrid, menu) {
    this.wickedGrid = wickedGrid;
    this.menu = menu;
  }

  RowContextMenu.prototype = {
    show: function(x, y) {
      this.wickedGrid.hideMenus();

      var wickedGrid = this.wickedGrid,
          menu = this.menu,
          style = menu.style;

      style.left = (x - 5) + 'px';
      style.top = (y - 5) + 'px';

      wickedGrid.pane().appendChild(menu);

      return this;
    },
    hide: function() {
      var menu = this.menu;
      if (menu.parentNode === null) return this;

      menu.parentNode.removeChild(menu);

      return this;
    }
  };

  return RowContextMenu;
})();