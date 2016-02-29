WickedGrid.CellContextMenu = (function() {
  function CellContextMenu(wickedGrid, menu) {
    this.wickedGrid = wickedGrid;
    this.menu = menu;
  }

  CellContextMenu.prototype = {
    show: function(x, y) {
      var wickedGrid = this.wickedGrid,
          menu = this.menu,
          style = menu.style;

      style.left = (x - 5) + 'px';
      style.top = (y - 5) + 'px';

      wickedGrid.hideMenus();
      wickedGrid.pane().appendChild(menu);
      return this;
    },
    hide: function() {
      if (this.menu.parentNode === null) return this;

      this.menu.parentNode.removeChild(this.menu);

      return this;
    }
  };

  return CellContextMenu;
})();