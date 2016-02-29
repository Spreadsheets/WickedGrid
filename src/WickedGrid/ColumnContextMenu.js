WickedGrid.ColumnContextMenu = (function() {
  function ColumnContextMenu(wickedGrid, menu) {
    this.wickedGrid = wickedGrid;
    this.menu = menu;
  }

  ColumnContextMenu.prototype = {
    kill: function() {
      if (this.menu.parentNode !== null) {
        this.menu.parentNode.removeChild(this.menu);
      }

      return this;
    },
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
      if (this.menu.parentNode === null) return this;
      this.menu.parentNode.removeChild(this.menu);
      return this;
    }
  };
  return ColumnContextMenu;
})();