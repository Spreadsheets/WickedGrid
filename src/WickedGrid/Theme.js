Sheet.Theme = (function($) {
	function Constructor(theme) {
		theme = theme || Sheet.defaultTheme;

		switch (theme) {
			case Sheet.customTheme:
				this.cl = Constructor.customClasses;
				break;


			case Sheet.bootstrapTheme:
				this.cl = Constructor.bootstrapClasses;
				break;

			default:
			case Sheet.themeRollerTheme:
				this.cl = Constructor.themeRollerClasses;
				break;
		}

		extend(this, this.cl);
	}

	Constructor.themeRollerClasses = {
		autoFiller:'ui-state-active',
		bar:'ui-widget-header',
		barHighlight:'ui-state-active',
		barHandleFreezeLeft:'ui-state-default',
		barHandleFreezeTop:'ui-state-default',
		barMenuTop:'ui-state-default',
		tdActive:'ui-state-active',
		tdHighlighted:'ui-state-highlight',
		control:'ui-widget-header ui-corner-top',
		controlTextBox:'ui-widget-content',
		fullScreen:'ui-widget-content ui-corner-all',
		inPlaceEdit:'ui-state-highlight',
		menu:'ui-widget-header',
		menuFixed: '',
		menuUl:'ui-widget-header',
		menuLi:'ui-widget-header',
		menuHover: 'ui-state-highlight',
		pane: 'ui-widget-content',
		parent:'ui-widget-content ui-corner-all',
		table:'ui-widget-content',
		tab:'ui-widget-header',
		tabActive:'ui-state-highlight',
		barResizer:'ui-state-highlight',
		barFreezer:'ui-state-highlight',
		barFreezeIndicator:'ui-state-highlight'
	};

	Constructor.bootstrapClasses = {
		autoFiller:'btn-info',
		bar:'input-group-addon',
		barHighlight:'label-info',
		barHandleFreezeLeft:'bg-warning',
		barHandleFreezeTop:'bg-warning',
		barMenuTop:'bg-warning',
		tdActive:'active',
		tdHighlighted:'bg-info disabled',
		control:'panel-heading',
		controlTextBox:'form-control',
		fullScreen:'',
		inPlaceEdit:'form-control',
		menu:'panel panel-default',
		menuFixed: 'nav navbar-nav',
		menuUl:'panel-info',
		menuLi:'active',
		menuHover: 'bg-primary active',
		pane: 'well',
		parent:'panel panel-default',
		table:'table table-bordered table-condensed',
		tab:'btn-default btn-xs',
		tabActive:'active',
		barResizer:'bg-info',
		barFreezer:'bg-warning',
		barFreezeIndicator:'bg-warning'
	};

	Constructor.customClasses = {
		autoFiller:'',
		bar:'',
		barHighlight:'',
		barHandleFreezeLeft:'',
		barHandleFreezeTop:'',
		barMenuTop:'',
		tdActive:'',
		tdHighlighted:'',
		control:'',
		controlTextBox:'',
		fullScreen:'',
		inPlaceEdit:'',
		menu:'',
		menuFixed: '',
		menuUl:'',
		menuLi:'',
		menuHover: '',
		pane: '',
		parent:'',
		table:'',
		tab:'',
		tabActive:'',
		barResizer:'',
		barFreezer:'',
		barFreezeIndicator:''
	};

	return Constructor;
})(jQuery);