
;Sheet.ColumnAdder = (function() {
	function Constructor() {
		this.qty = -1;

		this.addedFinishedFn = null;
		this.createBarFn = null;
		this.createCellFn = null;
	}

	Constructor.prototype = {
		setQty: function(qty, sheetSize) {
			var max = $.sheet.max;

			if (max) {
				//if current size is less than max, but the qty needed is more than the max
				if (max > sheetSize.cols && max <= sheetSize.cols + qty) {
					this.qty = max - sheetSize.cols;
				}

				//if current size is more than max
				else if (max && max <= sheetSize.cols + qty) {
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
			this.createBarFn = fn;
		},
		setCreateCellFn: function(fn) {
			this.createCellFn = fn;
		},
		createCells:function (i, size, isBefore) {
			var offset = (isBefore ? 0 : 1),
				rowMax = size.rows || 1,
				colMax = i + this.qty,
				row,
				col = i,
				bar;

			for (; col < colMax; col++) {

				bar = this.createBarFn(col + offset);

				for (row = 1; row <= rowMax; row++) {
					this.createCellFn(row, col + offset, bar);
				}
			}

			if (this.addedFinishedFn !== null) {
				this.addedFinishedFn({
					row: 0,
					col: this.qty
				});
			}
		}
	};

	return Constructor;
})();