/**
 * Internal css classes of objects
 * @memberOf WickedGrid
 * @type {Object}
 */
WickedGrid.cl = {
  list: function(list) {
    var result = [],
        self = WickedGrid.cl;
    list.forEach(function(prop) {
      if (!self.hasOwnProperty(prop)) throw new Error('prop ' + prop + ' not found on WickedGrid.cl');
      result.push(self[prop]);
    });

    return result.join(' ');
  },
  autoFiller: 'wg-auto-filler',
  autoFillerHandle: 'wg-auto-filler-handle',
  autoFillerCover: 'wg-auto-filler-cover',
  corner: 'wg-corner',
  barController: 'wg-bar-controller',
  barControllerChild: 'wg-bar-controller-child',
  barHelper: 'wg-bar-helper',
  row: 'wg-row',
  rowFreezeHandle: 'wg-row-freeze-handle',
  column: 'wg-column',
  columnHelper: 'wg-column-helper',
  columnFocus: 'wg-column-focus',
  columnButton: 'wg-column-button',
  columnFreezeHandle: 'wg-column-freeze-handle',
  chart: 'wg-chart',
  formula: 'wg-formula',
  formulaParent: 'wg-formula-parent',
  header: 'wg-header',
  fullScreen: 'wg-full-screen',
  inPlaceEdit: 'wg-in-place-edit',
  headerMenu: 'wg-header-menu',
  menuFixed: 'wg-menu-fixed',
  element: 'wg-element',
  scroll: 'wg-scroll',
  sheetAdder: 'wg-sheet-adder',
  table: 'wg-table',
  label: 'wg-loc',
  pane: 'wg-edit-pane',
  tab: 'wg-tab',
  tabContainer: 'wg-tab-container',
  tabContainerScrollable: 'wg-tab-container-scrollable',
  menu: 'wg-menu',
  menuButton: 'wg-menu-button',
  title: 'wg-title',
  enclosure: 'wg-enclosure',
  ui: 'wg-ui'
};