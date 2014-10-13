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
					sheetIndex: cell.sheetIndex,
					rowIndex: cell.rowIndex,
					columnIndex: cell.columnIndex,
					html: cell.html,
					state: cell.state,
					jS: cell.jS,
					style: cell.style,
					cl: cell.cl,
					id: cell.id,
					cellType: cell.cellType,
					type: cell.type,
					uneditable: cell.uneditable
				};

				clones.push(clone);
			}

			return new Constructor(clones);
		},
		type: Constructor,
		typeName: 'Sheet.CellRange'
	};

	return Constructor;
})();