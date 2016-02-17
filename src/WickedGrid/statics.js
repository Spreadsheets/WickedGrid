/**
 * Array of instances of jQuery.sheet, generally short-handed to jS
 */
WickedGrid.instance = [];
WickedGrid.defaultTheme = 0;
WickedGrid.themeRollerTheme = 0;
WickedGrid.bootstrapTheme = 1;
WickedGrid.customTheme = 2;

WickedGrid.excelSelectModel = 0;
WickedGrid.googleDriveSelectModel = 1;
WickedGrid.openOfficeSelectModel = 2;

WickedGrid.defaultColumnWidth = 120;
WickedGrid.defaultRowHeight = 20;

WickedGrid.domRows = 40;
WickedGrid.domColumns = 35;

WickedGrid.formulaParserUrl = '../parser/formula/formula.js';
WickedGrid.threadScopeUrl = '../Sheet/threadScope.js';

WickedGrid.defaultFormulaParser = null;

WickedGrid.spareFormulaParsers = [];

WickedGrid.events = [
  'sheetAddRow',
  'sheetAddColumn',
  'sheetSwitch',
  'sheetRename',
  'sheetTabSortStart',
  'sheetTabSortUpdate',
  'sheetCellEdit',
  'sheetCellEdited',
  'sheetCalculation',
  'sheetAdd',
  'sheetDelete',
  'sheetDeleteRow',
  'sheetDeleteColumn',
  'sheetOpen',
  'sheetAllOpened',
  'sheetSave',
  'sheetFullScreen',
  'sheetFormulaKeydown'
];

/**
 * Contains the dependencies if you use $.sheet.preLoad();
 */
WickedGrid.dependencies = {
  coreCss:{css:'wickedgrid.css'},

  jQueryUI:{script:'jquery-ui/jquery-ui.min.js', thirdParty:true},
  jQueryUIThemeRoller:{css:'jquery-ui/themes/smoothness/jquery-ui.min.css', thirdParty:true},

  globalize:{script:'globalize/lib/globalize.js', thirdParty:true},

  nearest:{script:'jquery-nearest/src/jquery.nearest.min.js', thirdParty:true},

  mousewheel:{script:'MouseWheel/MouseWheel.js', thirdParty:true},

  operative:{script:'operative/dist/operative.js', thirdParty:true},

  megatable:{script:'megaTable.js/megatable.js', thirdParty:true},

  infiniscroll:{script:'infiniscroll.js/infinitescroll.js', thirdParty:true}
};

/**
 * Contains the optional plugins if you use $.sheet.preLoad();
 */
WickedGrid.optional = {
  //native
  advancedFn:{script:'src/Plugin/advanced.js'},
  financeFn:{script:'src/Plugin/finance.js'},

  //3rd party
  colorPicker:{
    css:'really-simple-color-picker/css/colorPicker.css',
        script:'really-simple-color-picker/js/jquery.colorPicker.min.js',
        thirdParty:true
  },

  elastic:{script:'jquery-elastic/jquery.elastic.source.js', thirdParty:true},

  globalizeCultures:{script:'globalize/lib/cultures/globalize.cultures.js', thirdParty:true},

  raphael:{script:'raphael/raphael.js', thirdParty:true},
  gRaphael:{script:'graphael/g.raphael.js', thirdParty:true},
  gRaphaelBar:{script:'graphael/g.bar.js', thirdParty:true},
  gRaphaelDot:{script:'graphael/g.dot.js', thirdParty:true},
  gRaphaelLine:{script:'graphael/g.line.js', thirdParty:true},
  gRaphaelPie:{script:'graphael/g.pie.js', thirdParty:true},

  thaw: {script:'thaw.js/thaw.js', thirdParty:true},

  undoManager:{script: 'Javascript-Undo-Manager/lib/undomanager.js', thirdParty:true},

  zeroClipboard:{script:'zeroclipboard/dist/ZeroClipboard.min.js', thirdParty:true}
};