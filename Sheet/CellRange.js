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

				clone = cell.clone();

				clones.push(clone);
			}

			return new Constructor(clones);
		},
		type: Constructor,
		typeName: 'Sheet.CellRange'
	};

	return Constructor;
})();