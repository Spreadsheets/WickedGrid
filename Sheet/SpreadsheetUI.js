Sheet.SpreadsheetUI = (function() {
	var stack = [];

	function Constructor(i, ui, options) {
		options = options || {};

		this.i = i;
		this.ui = ui;
		this.isLast = options.lastIndex === i;
		this.enclosure = null;
		this.pane = null;
		this.spreadsheet = null;

		this.initChildren = options.initChildren || function() {};
		this.done = options.done || function() {};
		this.load();
	}

	Constructor.prototype = {
		load: function(enclosure, pane, spreadsheet) {
			this.initChildren(this.ui, this.i);

			this.enclosure = enclosure;
			this.pane = pane;
			this.spreadsheet = spreadsheet;

			stack.push(this.i);

			if (this.isLast) {
				this.loaded();
			}
		},
		loaded: function() {
			this.done(stack, this);
		}
	};

	return Constructor;
})();