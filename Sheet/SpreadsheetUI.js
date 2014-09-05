Sheet.SpreadsheetUI = (function() {
	var stack = [];

	function Constructor(i, ui, table, options) {
		options = options || {};

		this.i = i;
		this.ui = ui;
		this.table = table;
		this.isLast = options.lastIndex === i;
		this.enclosure = null;
		this.pane = null;
		this.spreadsheet = null;

		this.sizeCheck = options.sizeCheck || function() {};
		this.initChildren = options.initChildren || function() {};
		this.done = options.done || function() {};

		this.sizeCheck(this);
	}

	Constructor.prototype = {
		load: function() {
			var table = this.table;
			this.initChildren(this.ui, table, this.i);

			table.pane.ui = this.ui;
			this.enclosure = table.enclosure;
			this.pane = table.pane;
			this.spreadsheet = table.spreadsheet;

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