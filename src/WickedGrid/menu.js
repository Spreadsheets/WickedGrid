WickedGrid.menu = function(wickedGrid, menuEntities) {
  if (typeof menuEntities === 'undefined') throw new Error('no menuEntities defined');

  var menu = document.createElement('div'),
      hoverClasses = wickedGrid.theme.menuHover.split(' ');

  menu.className = wickedGrid.theme.menu + ' ' + wickedGrid.cl.menu;
  disableSelectionSpecial(menu);

  menu.onmouseleave = function () {
    menu.parentNode.removeChild(menu);
  };
  menu.oncontextmenu = function() {
    return false;
  };
  menu.onscroll = function() {
    return false;
  };

  for (var key in menuEntities) {
    if (menuEntities.hasOwnProperty(key)) {
      (function(key, menuEntity) {
        switch (typeof menuEntity) {
          case 'function':
            var button = document.createElement('div');
            button.className = wickedGrid.cl.menuButton;
            button.textContent = key;
            button.onclick = function (e) {
              menuEntity.call(wickedGrid, e);
              menu.parentNode.removeChild(menu);
              return false;
            };
            if (hoverClasses.length > 0) {
              button.onmouseover = function () {
                for (var i = 0, max = menu.children.length; i < max; i++) {
                  hoverClasses.forEach(function(hoverClass) {
                    menu.children[i].classList.remove(hoverClass);
                  });
                }
                hoverClasses.forEach(function(hoverClass) {
                  button.classList.add(hoverClass);
                });
              };
            }
            menu.appendChild(button);
            break;
          case 'string':
              if (menuEntity === 'line') {
                menu.appendChild(document.createElement('hr'));
                break;
              }
          default:
            throw new Error('Unknown menu type');
        }
      })(key, menuEntities[key]);
    }
  }

  return menu;
};