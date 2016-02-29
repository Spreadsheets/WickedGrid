WickedGrid.ColumnMenu = (function() {
  function ColumnMenu(wickedGrid, menu) {
    this.wickedGrid = wickedGrid;
    this.menu = menu;
    this.index = -1;
    this.column = null;

    var self = this,
        barHelper = this.barHelper = widget(
          '<div class="' + wickedGrid.cl.barHelper + ' ' + wickedGrid.cl.columnHelper + '">\
            <span class="' + wickedGrid.cl.columnButton + ' ' + wickedGrid.theme.columnMenu + ' ' + wickedGrid.theme.columnMenuIcon + '"></span>\
          </div>'
        ),
        button = barHelper.children[0];

    button.onmousedown = function () {
      self.showMenu();
    };
  }

  ColumnMenu.prototype = {
    setColumn: function(column, index) {
      if (this.column !== null) {
        this.column.classList.remove(this.wickedGrid.cl.columnFocus);
      }
      this.hideMenu();
      this.column = column;
      this.index = index;

      return this;
    },
    kill: function() {
      this.hide();
      this.column = null;
      this.index = -1;
      return this;
    },
    show: function() {
      this.wickedGrid.hideMenus();

      this.column.appendChild(this.barHelper);
      this.column.classList.add(this.wickedGrid.cl.columnFocus);

      return this;
    },
    hide: function() {
      if (this.barHelper.parentNode === null) return this;
      this.barHelper.parentNode.removeChild(this.barHelper);
      return this;
    },
    showMenu: function() {
      this.barHelper.appendChild(this.menu);
      return this;
    },
    hideMenu: function() {
      if (this.menu.parentNode === null) return this;
      this.menu.parentNode.removeChild(this.menu);
      return this;
    }
  };
  return ColumnMenu;
})();