
/**
 * Creates the scrolling system used by each spreadsheet
 */
Sheet.ActionUI = (function(document, window, Math, Number, $) {
    var Constructor = function(enclosure, pane, table, cl, frozenAt, max) {
        this.enclosure = enclosure;
        this.pane = pane;
        this.table = table;
        this.max = max;
        this.xIndex = 0;
        this.yIndex = 0;

        this.scrollAxis = {
            x:{},
            y:{}
        };

        this.scrollSize = {};

        this.hiddenColumns = [];
        this.hiddenRows = [];

        if (!(this.frozenAt = frozenAt)) {
            this.frozenAt = {row:0, col:0};
        }

        this.frozenAt.row = Math.max(this.frozenAt.row, 0);
        this.frozenAt.col = Math.max(this.frozenAt.col, 0);

        /**
         * Where the current sheet is scrolled to
         * @returns {Object}
         */
        this.scrolledArea = {
            start: {
                row: Math.max(this.frozenAt.row, 1),
                col: Math.max(this.frozenAt.col, 1)
            },
            end: {
                row: Math.max(this.frozenAt.row, 1),
                col: Math.max(this.frozenAt.col, 1)
            }
        };

        var that = this,
            cssId = '#' + table.getAttribute('id'),
            scrollOuter = this.scrollUI = pane.scrollOuter = document.createElement('div'),
            scrollInner = pane.scrollInner = document.createElement('div'),
            scrollStyleX = pane.scrollStyleX = this.scrollStyleX = new Sheet.StyleUpdater(function(indexes, style) {
                indexes = indexes || [];

                if (indexes.length !== that.xIndex || style) {
                    that.xIndex = indexes.length || that.xIndex;


                    if (style === undefined) {
                        var col = that.frozenAt.col;
						 if (this.nthCss === null) {
							 style =
								 //hide all previous td/th/col elements
								 cssId + ' tr *:nth-child(-n+' + indexes[0] + ') {display: none;}' +
								 cssId + ' col:nth-child(-n+' + indexes[0] + ') {display: none;}' +

								 //but show those that are frozen
								 cssId + ' tr *:nth-child(-n+' + that.frozenAt.col + 1 + ') {display: table-cell;}' +
								 cssId + ' col:nth-child(-n+' + that.frozenAt.col + 1 + ') {display: table-column;}' +

								 //hide those that are ahead of current scroll area, but are not in view to keep table redraw fast
								 cssId + ' tr *:nth-child(' + (indexes[0] + 20) + ') ~ * {display: none;}' +
								 cssId + ' col:nth-child(' + (indexes[0] + 20) + ') ~ col {display: none;}';
						 } else {
							 style =
								 this.nthCss('col', cssId, indexes, that.frozenAt.col + 1) +
								 this.nthCss('*', cssId + ' ' + 'tr', indexes, that.frozenAt.col + 1) +
								 cssId + ' tr *:nth-child(' + (indexes[0] + 20) + ') ~ * {display: none;}';
						 }
                    }

                    this.setStyle(style);

                    if (indexes.length) {
                        that.scrolledArea.start.col = Math.max(indexes.pop() || 1, 1);
                        that.scrolledArea.end.col = Math.max(indexes.shift() || 1, 1);
                    }

                    return true;
                }
                return false;
            }, max),
            scrollStyleY = pane.scrollStyleY = this.scrollStyleY = new Sheet.StyleUpdater(function(indexes, style){
                indexes = indexes || [];

                if (indexes.length !== that.yIndex || style) {
                    that.yIndex = indexes.length || that.yIndex;

                    if (style === undefined) {
                        var row = that.frozenAt.row;
						if (this.nthCss === null){
							style =
								//hide all previous tr elements
								cssId + ' tr:nth-child(-n+' + indexes[0] + ') {display: none;}' +

								//but show those that are frozen
								cssId + ' tr:nth-child(-n+' + (that.frozenAt.row + 1) + ') {display: table-row;}' +

								//hide those that are ahead of current scroll area, but are not in view to keep table redraw fast
								cssId + ' tr:nth-child(' + (indexes[0] + 40) + ') ~ tr {display: none;}';
						}

						else {
							style =
								this.nthCss('tr', cssId, indexes, that.frozenAt.row + 1) +
								cssId + ' tr:nth-child(' + (indexes[0] + 40) + ') ~ * {display: none;}';
						}
                    }

                    this.setStyle(style);

                    if (indexes.length) {
                        that.scrolledArea.start.row = Math.max(indexes.pop() || 1, 1);
                        that.scrolledArea.end.row = Math.max(indexes.shift() || 1, 1);
                    }

                    return true;
                }
                return false;
            });

        scrollOuter.setAttribute('class', cl);
        scrollOuter.appendChild(scrollInner);

        $(scrollOuter)
            .disableSelectionSpecial();

        pane.appendChild(scrollStyleX.styleElement);
        pane.appendChild(scrollStyleY.styleElement);

        var xStyle,
            yStyle,
            tableWidth,
            tableHeight,
            enclosureWidth,
            enclosureHeight,
            firstRow = table.tBody.children[0];

        pane.resizeScroll = function (justTouch) {
            if (justTouch) {
                xStyle = scrollStyleX.getStyle();
                yStyle = scrollStyleY.getStyle();
            } else {
                xStyle = (table.clientWidth <= enclosure.clientWidth ? '' : scrollStyleX.getStyle());
                yStyle = (table.clientHeight <= enclosure.clientHeight ? '' : scrollStyleY.getStyle());
            }

            scrollStyleX.update(null, ' ');
            scrollStyleY.update(null, ' ');

            if (firstRow === undefined) {
                firstRow = table.tBody.children[0];
            }

            tableWidth = (firstRow.clientWidth || table.clientWidth) + 'px';
            tableHeight = table.clientHeight + 'px';
            enclosureWidth = enclosure.clientWidth + 'px';
            enclosureHeight = enclosure.clientHeight + 'px';

            scrollInner.style.width = tableWidth;
            scrollInner.style.height = tableHeight;

            scrollOuter.style.width = enclosureWidth;
            scrollOuter.style.height = enclosureHeight;

            that.scrollStart('x');
            that.scrollStart('y');

            scrollStyleX.update(null, xStyle);
            scrollStyleY.update(null, yStyle);

            if (pane.inPlaceEdit) {
                pane.inPlaceEdit.goToTd();
            }
        };

        new MouseWheel(pane, scrollOuter);
    };

    Constructor.prototype = {
        /**
         * scrolls the sheet to the selected cell
         * @param {HTMLElement} td
         */
        putTdInView:function (td) {
            var i = 0,
                x = 0,
                y = 0,
                direction,
                scrolledTo;

            this.xIndex = 0;
            this.yIndex = 0;

            while ((direction = this.directionToSeeTd(td)) !== null) {
                scrolledTo = this.scrolledArea.end;

                if (direction.left) {
                    x--;
                    this.scrollTo({
                        axis:'x',
                        value:scrolledTo.col - 1
                    });
                } else if (direction.right) {
                    x++;
                    this.scrollTo({
                        axis:'x',
                        value:scrolledTo.col + 1
                    });
                }

                if (direction.up) {
                    y--;
                    this.scrollTo({
                        axis:'y',
                        value:scrolledTo.row - 1
                    });
                } else if (direction.down) {
                    y++;
                    this.scrollTo({
                        axis:'y',
                        value:scrolledTo.row + 1
                    });
                }

                i++;
                if (i < 25) {
                    break;
                }

                this.scrollStop();
            }
        },

        /**
         * detects if a td is not visible
         * @param {HTMLElement} td
         * @returns {Boolean|Object}
         */
        directionToSeeTd:function(td) {
            var pane = this.pane,
                visibleFold = {
                    top:0,
                    bottom:pane.clientHeight,
                    left:0,
                    right:pane.clientWidth
                },

                tdWidth = td.clientWidth,
                tdHeight = td.clientHeight,
                tdLocation = {
                    top:td.offsetTop,
                    bottom:td.offsetTop + tdHeight,
                    left:td.offsetLeft,
                    right:td.offsetLeft + tdWidth
                },
                tdParent = td.parentNode,
                scrollTo = this.scrolledArea.end;

            if (!td.col) {
                return null;
            }

            var xHidden = td.barTop.cellIndex < scrollTo.col,
                yHidden = tdParent.rowIndex < scrollTo.row,
                hidden = {
                    up:yHidden,
                    down:tdLocation.bottom > visibleFold.bottom && tdHeight <= pane.clientHeight,
                    left:xHidden,
                    right:tdLocation.right > visibleFold.right && tdWidth <= pane.clientWidth
                };

            if (
                hidden.up
                || hidden.down
                || hidden.left
                || hidden.right
            ) {
                return hidden;
            }

            return null;
        },



        /**
         * Causes the pane to redraw, really just for fixing issues in Chrome
         */
        redraw: function() {
            var style = this.pane.style;

            style.opacity = 0.9999;

            setTimeout(function() {
                style.opacity = 1;
            },0);
        },


        hide:function (hiddenRows, hiddenColumns, rows, columns) {
            var that = this,
                cssId = '#' + this.table.getAttribute('id'),
                toggleHideStyleX = this.toggleHideStyleX = new Sheet.StyleUpdater(function() {
                    var style = this.nthCss('col', cssId, that.hiddenColumns, 0) +
                        this.nthCss('td', cssId + ' tr', that.hiddenColumns, 0);

                    this.setStyle(style);
                }),
                toggleHideStyleY = this.toggleHideStyleY = new Sheet.StyleUpdater(function() {
                    var style = this.nthCss('tr', cssId, that.hiddenRows, 0);

                    this.setStyle(style);
                }),
                i,
                j,
                pane = this.pane;

            pane.appendChild(toggleHideStyleX.styleElement);
            pane.appendChild(toggleHideStyleY.styleElement);

            this.hiddenRows = [];
            this.hiddenColumns = [];

            if (hiddenRows) {
                i = hiddenRows.length - 1;
                if (i > -1) {
                    do {
                        j = hiddenRows[i];
                        this.toggleHideRow(rows[j], j);
                    } while (i--);
                }
            }

            if (hiddenColumns) {
                i = hiddenColumns.length - 1;
                if (i > -1) {
                    do {
                        j = hiddenColumns[i];
                        this.toggleHideColumn(columns[j], j);
                    } while (i--);
                }
            }
        },
        remove: function() {

        },

        /**
         * prepare everything needed for a scroll, needs activated every time spreadsheet changes in size
         * @param {String} axisName x or y
         */
        scrollStart:function (axisName) {
            var pane = this.pane,
                outer = pane.scrollOuter,
                axis = this.scrollAxis[axisName],
                size = this.scrollSize = pane.size();

            axis.v = [];
            axis.name = axisName;

            switch (axisName || 'x') {
                case 'x':
                    axis.value = 0;
                    axis.max = size.cols;
                    axis.min = 0;
                    axis.size = size.cols;
                    pane.scrollStyleX.update();
                    axis.scrollStyle = pane.scrollStyleX;
                    axis.area = outer.scrollWidth - outer.clientWidth;
                    axis.sheetArea = pane.table.clientWidth - pane.table.corner.clientWidth;
                    axis.scrollUpdate = function () {
                        outer.scrollLeft = (axis.value) * (axis.area / axis.size);
                    };
                    axis.gridSize = 100 / axis.size;
                    break;
                case 'y':
                    axis.value = 0;
                    axis.max = size.rows;
                    axis.min = 0;
                    axis.size = size.rows;
                    pane.scrollStyleY.update();
                    axis.scrollStyle = pane.scrollStyleY;
                    axis.area = outer.scrollHeight - outer.clientHeight;
                    axis.sheetArea = pane.table.clientHeight - pane.table.corner.clientHeight;
                    axis.scrollUpdate = function () {
                        outer.scrollTop = (axis.value) * (axis.area / axis.size);
                    };
                    axis.gridSize = 100 / axis.size;
                    break;
            }

            var i = axis.max;

            do {
                var position = new Number(axis.gridSize * i);
                position.index = i + 1;
                axis.v.unshift(position);
            } while(i--);
        },

        /**
         * Scrolls to a position within the spreadsheet
         * @param {Object} pos {axis, value, pixel} if value not set, pixel is used
         */
        scrollTo:function (pos) {
            pos = pos || {};
            pos.axis = pos.axis || 'x';
            pos.value = pos.value || 0;
            pos.pixel = pos.pixel || 0;

            if (!this.scrollAxis) {
                this.scrollStart(pos.axis);
            }
            var me = this.scrollAxis[pos.axis];

            if (!pos.value) {
                pos.value = arrHelpers.closest(me.v, Math.abs(pos.pixel / me.area) * 100, me.min).index;
            }

            pos.max = pos.max || me.max;

            var i = ((pos.value > pos.max ? pos.max : pos.value) - me.min),
                indexes = [];

            if (i >= 0) {
                do {
                    indexes.push(i + me.min);
                } while(i-- > 0);
            }

            me.value = pos.value;

            if (indexes.length) {
                if (me.scrollStyle) {
                    return me.scrollStyle.update(indexes);
                }
            } else {
                if (me.scrollStyle) {
                    return me.scrollStyle.update();
                }
            }

            return false;
        },

        /**
         * Called after scroll is done
         */
        scrollStop:function () {
            if (this.scrollAxis.x.scrollUpdate) {
                this.scrollAxis.x.scrollUpdate();
            }
            if (this.scrollAxis.y.scrollUpdate) {
                this.scrollAxis.y.scrollUpdate();
            }
        },


        toggleHideRow:function (row, i) {
            var $row = $(row);
            i = Math.max(i + 1, 1);


            if ($row.length && $.inArray(i, this.hiddenRows) < 0) {
                this.hiddenRows.push(i);
            } else {
                this.hiddenRows.splice(this.hiddenRows.indexOf(i), 1);
            }

            this.toggleHideStyleY.update();
        },
        rowShowAll:function () {
            $.each(this.hiddenRows || [], function (j) {
                $(this).removeData('hidden');
            });
            this.toggleHideStyleY.setStyle('');
            this.hiddenRows = [];
        },
        toggleHideColumn:function (col, i) {
            var $col = $(col);
            i = Math.max(i + 1, 1);

            if ($col.length && $.inArray(i, this.hiddenColumns) < 0) {
                this.hiddenColumns.push(i);
            } else {
                this.hiddenColumns.splice(this.hiddenColumns.indexOf(i), 1);
            }

            this.toggleHideStyleX.update();
        },
        columnShowAll:function () {
            this.toggleHideStyleX.setStyle('');
            this.hiddenColumns = [];
        }
    };

    return Constructor;
})(document, window, Math, Number, $);