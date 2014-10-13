Sheet.Cell = (function() {
	function Constructor(sheetIndex, td, jS) {
		this.td = (td !== undefined ? td : null);
		this.dependencies = [];
		this.formula = '';
		this.cellType = null;
		this.value = '';
		this.calcCount = 0;
		this.sheetIndex = sheetIndex;
		this.rowIndex = null;
		this.columnIndex = null;
		this.jS = (jS !== undefined ? jS : null);
		this.state = [];
		this.needsUpdated = true;
		this.uneditable = false;
		this.id = null;
		this.loadedFrom = null;
	}

	Constructor.prototype = {

		type: Constructor,
		typeName: 'Sheet.Cell'
	};

	return Constructor;
})();