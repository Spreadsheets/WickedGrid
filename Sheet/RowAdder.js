
;Sheet.RowAdder = (function() {
    function Constructor() {
        this.qty = -1;

        this.addedFinished = null;
        this.createBar = null;
        this.createCell = null;
    }

    Constructor.prototype = {
        setQty: function(qty, sheetSize) {
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
                rowMax = i + this.qty,
                colMax = size.cols,
                rowParent,
                row = i,
                col;

            for (; row < rowMax; row++) {
                //create a new row
                rowParent = this.createBar(row + offset);

                for (col = 1; col <= colMax; col++) {
                    this.createCell(row + offset, col, rowParent);
                }
            }

            if (this.addedFinished !== null) {
                this.addedFinished({
                    row: this.qty,
                    col: 0
                });
            }
        }
    };

    return Constructor;
})();