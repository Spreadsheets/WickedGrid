
;Sheet.ColumnAdder = (function() {
    function Constructor(max) {
        this.max = max;
        this.qty = -1;

        this.addedFinished = null;
        this.createBar = null;
        this.createCell = null;
    }

    Constructor.prototype = {
        setQty: function(qty, sheetSize) {
            var max = this.max;

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
        setAddedFinished: function(fn) {
            this.addedFinished = fn;
        },
        setCreateBarFn: function(fn) {
            this.createBar = fn;
        },
        setCreateCellFn: function(fn) {
            this.createCell = fn;
        },
        createCells:function (i, size, isBefore) {
            var offset = (isBefore ? 0 : 1),
                rowMax = size.rows,
                colMax = i + this.qty,
                row,
                col = i;

            for (; col < colMax; col++) {

                this.createBar(col + offset);

                for (row = 1; row <= rowMax; row++) {
                    this.createCell(row, col + offset);
                }
            }

            if (this.addedFinished !== null) {
                this.addedFinished({
                    row: 0,
                    col: this.qty
                });
            }
        }
    };

    return Constructor;
})();