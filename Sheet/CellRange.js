Sheet.CellRange = (function() {
	function Constructor(cells) {
		this.cells = cells || [];
	}

	Constructor.prototype = {
		clone: function() {
			var clones = [],
				cells = this.cells,
				max = cells.length,
				cell,
				clone;

			for(var i = 0; i < max;i++) {
				cell = cells[i];

				clone = {
					value:cell.value,
					formula:cell.formula,
					td: cell.td,
					dependencies: cell.dependencies,
					needsUpdated: cell.needsUpdated,
					calcCount: cell.calcCount,
					sheet: cell.sheet,
					calcLast: cell.calcLast,
					html: cell.html,
					state: cell.state,
					jS: cell.jS,
					calcDependenciesLast: cell.calcDependenciesLast,
					style: cell.style,
					cl: cell.cl,
					id: cell.id
				};

				clones.push(clone);
			}

			return new Constructor(clones);
		}
	};

	return Constructor;
})();