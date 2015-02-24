
;Sheet.RowAdder = (function() {
	function Constructor() {
		this.qty = -1;

		this.addedFinishedFn = null;
		this.createBar = null;
		this.createCell = null;
		this.hidden = null;
	}

	Constructor.prototype = {
		setQty: function(qty, sheetSize, minSize) {
			var max = $.sheet.max;

			if (max) {
				//if current size is less than max, but the qty needed is more than the max
				if (max > sheetSize.rows && max <= sheetSize.rows + qty) {
					this.qty = max - sheetSize.rows;
				}

				//if current size is more than max
				else if (max && max <= sheetSize.rows + qty) {
					return false;
				}
			} else {
				this.qty = qty;
			}

			return true;
		},
		setAddedFinishedFn: function(fn) {
			this.addedFinishedFn = fn;
		},
		setCreateBarFn: function(fn) {
			this.createBar = fn;
		},
		setCreateCellFn: function(fn) {
			this.createCell = fn;
		},
		setHidden: function(hidden) {
			this.hidden = hidden;
		},
		createCells:function (i, size, isBefore) {
			var offset = (isBefore ? 0 : 1),
				rowMax = i + this.qty,
				colMax = size.cols || 1,
				rowParent,
				isHidden,
				row = i,
				col;

			for (; row < rowMax; row++) {
				isHidden = this.hidden.indexOf(row + offset) > -1;

				//create a new row
				rowParent = this.createBar(row + offset, isHidden);

				for (col = 1; col <= colMax; col++) {
					this.createCell(row + offset, col, rowParent, isHidden);
				}
			}

			if (this.addedFinishedFn !== null) {
				this.addedFinishedFn({
					row: this.qty,
					col: 0
				});
			}
		}
	};

	return Constructor;
})();