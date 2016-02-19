WickedGrid.menu = function(wickedGrid, menuItems) {
  var menu = document.createElement('div'),
      $menu = $(menu),
      buttons = $([]),
      hoverClass = wickedGrid.theme.menuHover;

  menu.className = wickedGrid.theme.menu + ' ' + wickedGrid.cl.tdMenu;

  wickedGrid.controls.menus[wickedGrid.i] = wickedGrid.menus().add(menu);

  $menu
      .mouseleave(function () {
        $menu.hide();
      })
      .bind('contextmenu', function() {return false;})
      .appendTo('body')
      .hide()
      .disableSelectionSpecial();

  for (var msg in menuItems) {
    if (menuItems.hasOwnProperty(msg)) {
      if (typeof menuItems[msg] === 'function') {
        buttons.pushStack(
          $(document.createElement('div'))
            .text(msg)
            .data('msg', msg)
            .click(function () {
              menuItems[$(this).data('msg')].call(this, this);
              $menu.hide();
              return false;
            })
            .appendTo(menu)
            .hover(function() {
              buttons.removeClass(hoverClass);
              $(this).addClass(hoverClass);
            }, function() {
              $(this).removeClass(hoverClass);
            })
        );

      } else if (menuItems[msg] == 'line') {
        menu.appendChild(document.createElement('hr'));
      }
    }
  }

  return $menu;
};