(function() {
	Sheet.Cell.prototype.addDependency = function(cell) {
		if (cell === undefined || cell === null) return;

		if (cell.type !== Sheet.Cell) {
			throw new Error('Wrong Type');
		}

		if (this.dependencies.indexOf(cell) < 0 && this !== cell) {

			cell.trace = cell.trace || [];
			cell.trace.push(this);

			this.dependencies.push(cell);
			if (this.loader !== null) {
				this.loader.addDependency(this, cell);
			}
		}
	};

	Sheet.Cell.prototype.traceRoute = function(callback, rootSheetIndex) {
		if (rootSheetIndex === undefined) {
			rootSheetIndex = this.sheetIndex;
			this.setNeedsUpdated(true);
		}
		this.updateValue(function() {

			this.trace = this.trace || [];

			var route = {
					name: this.id,
					children: []
				},
				trace = this.trace,
				max = trace.length,
				progress = 0,
				i = 0;

			if (!route.name) {
				route.name = (rootSheetIndex !== this.sheetIndex ? '"' + this.jS.getSpreadsheetTitleByIndex(this.sheetIndex) + '"!' : '');
				route.name += jQuery.sheet.engine.columnLabelString(this.columnIndex) + this.rowIndex;

				route.name += ' : ' + this.value;

				if (this.formula) {
					route.name += ' : "=' + this.formula + '"';
				}
			}

			console.log(route.name);

			for(;i < max;i++) {
				(function(i, tracedCell) {
					//to avoid "too much recursion"
					setTimeout(function() {
						tracedCell.traceRoute(function(childRoute) {
							progress++;
							route.children[i] = childRoute;
							console.log('Progress: ' + progress + ', index: ' + i + ', max: ' + max);
						}, rootSheetIndex);
					}, 0);
				})(i, trace[i]);
			}

			callback(route);
		});
	};
})();