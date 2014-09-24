Sheet.Theme = (function($) {
	function Constructor(theme) {
		switch (theme) {
			case Sheet.CustomTheme:
				this.cl = Constructor.customClasses;
				break;

			case Sheet.BootstrapTheme:
				this.cl = Constructor.bootstrapClasses;
				break;

			case Sheet.ThemeRollerTheme:
			default:
				this.cl = Constructor.themeRollerClasses;
				break;
		}

		$.extend(this, this.cl);
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
		menuUl:'ui-widget-header',
		menuLi:'ui-widget-header',
		pane: 'ui-widget-content',
		parent:'ui-widget-content ui-corner-all',
		table:'ui-widget-content',
		tab:'ui-widget-header ui-corner-bottom',
		tabActive:'ui-state-highlight',
		barResizer:'ui-state-highlight',
		barFreezer:'ui-state-highlight',
		barFreezeIndicator:'ui-state-highlight'
	};

	Constructor.bootstrapClasses = {
		autoFiller:'btn-info',
		bar:'bg-default',
		barHighlight:'active',
		barHandleFreezeLeft:'bg-warning',
		barHandleFreezeTop:'bg-warning',
		barMenuTop:'bg-info',
		tdActive:'active',
		tdHighlighted:'bg-info',
		control:'bg-default',
		controlTextBox:'',
		fullScreen:'',
		inPlaceEdit:'form-control',
		menu:'',
		menuUl:'',
		menuLi:'',
		pane: 'bg-default',
		parent:'btn-default',
		table:'table table-bordered table-condensed',
		tab:'btn btn-default btn-xs',
		tabActive:'active',
		barResizer:'',
		barFreezer:'',
		barFreezeIndicator:''
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
		menuUl:'',
		menuLi:'',
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