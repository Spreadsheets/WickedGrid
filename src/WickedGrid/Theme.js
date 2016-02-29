WickedGrid.Theme = (function() {
	function Theme(theme) {
		theme = theme || Sheet.defaultTheme;

		switch (theme) {
			case WickedGrid.customTheme:
				this.cl = Theme.customClasses;
				break;


			case WickedGrid.bootstrapTheme:
				this.cl = Theme.bootstrapClasses;
				break;

			default:
			case WickedGrid.themeRollerTheme:
				this.cl = Theme.themeRollerClasses;
				break;
		}

		extend(this, this.cl);
	}

	Theme.themeRollerClasses = {
		autoFiller: 'ui-state-active',
		bar: 'ui-widget-header',
		barHighlight: 'ui-state-active',
		rowFreezeHandle: 'ui-state-default',
		columnFreezeHandle: 'ui-state-default',
		columnMenu: 'ui-state-default',
		columnMenuIcon: 'ui-icon ui-icon-triangle-1-s',
		tdActive: 'ui-state-active',
		tdHighlighted: 'ui-state-highlight',
		control: 'ui-widget-header ui-corner-top',
		controlTextBox: 'ui-widget-content',
		fullScreen: 'ui-widget-content ui-corner-all',
		inPlaceEdit: 'ui-state-highlight',
		menu: 'ui-widget-header',
		menuFixed: '',
		menuUl: 'ui-widget-header',
		menuLi: 'ui-widget-header',
		menuHover: 'ui-state-highlight',
		pane: 'ui-widget-content',
		parent: 'ui-widget-content ui-corner-all',
		table: 'ui-widget-content',
		tab: 'ui-widget-header',
		tabActive: 'ui-state-highlight',
		barResizer: 'ui-state-highlight',
		barFreezer: 'ui-state-highlight',
		barFreezeIndicator: 'ui-state-highlight'
	};

	Theme.bootstrapClasses = {
		autoFiller: 'btn-info',
		bar: 'input-group-addon',
		barHighlight: 'label-info',
		rowFreezeHandle: 'bg-warning',
		columnFreezeHandle: 'bg-warning',
		columnMenu: '',
		columnMenuIcon: 'fa fa-sort-desc',
		tdActive: 'active',
		tdHighlighted: 'bg-info disabled',
		control: 'panel-heading',
		controlTextBox: 'form-control',
		fullScreen: '',
		inPlaceEdit: 'form-control',
		menu: 'panel panel-default',
		menuFixed: 'nav navbar-nav',
		menuUl: 'panel-info',
		menuLi: 'active',
		menuHover: 'bg-primary active',
		pane: 'well',
		parent: 'panel panel-default',
		table: 'table-bordered table-condensed',
		tab: 'btn-default btn-xs',
		tabActive: 'active',
		barResizer: 'bg-info',
		barFreezer: 'bg-warning',
		barFreezeIndicator: 'bg-warning'
	};

	Theme.customClasses = {
		autoFiller: '',
		bar: '',
		barHighlight: '',
		rowFreezeHandle: '',
		columnFreezeHandle: '',
		columnMenu: '',
		columnMenuIcon: '',
		tdActive: '',
		tdHighlighted: '',
		control: '',
		controlTextBox: '',
		fullScreen: '',
		inPlaceEdit: '',
		menu: '',
		menuFixed: '',
		menuUl: '',
		menuLi: '',
		menuHover: '',
		pane: '',
		parent: '',
		table: '',
		tab: '',
		tabActive: '',
		barResizer: '',
		barFreezer: '',
		barFreezeIndicator: ''
	};

	return Theme;
})();