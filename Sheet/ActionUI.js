
/**
 * Creates the scrolling system used by each spreadsheet
 */
Sheet.ActionUI = (function(document, window, Math, Number, $) {
	var Constructor = function(enclosure, table, cl, frozenAt, max) {
		this.enclosure = enclosure;
		this.pane = document.createElement('div');
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
			pane = this.pane,
			cssId = '#' + table.getAttribute('id'),
			scrollOuter = this.scrollUI = pane.scrollOuter = document.createElement('div'),
			scrollInner = pane.scrollInner = document.createElement('div'),
			scrollStyleX = pane.scrollStyleX = this.scrollStyleX = new Sheet.StyleUpdater(function(indexes, style) {
				indexes = indexes || [];

				if (indexes.length !== that.xIndex || style) {
					that.xIndex = indexes.length || that.xIndex;


					if (style === undefined) {
						var col = that.frozenAt.col;
						 if (this.max === undefined) {
							 style =
								 //hide all previous td/th/col elements
								 cssId + ' tr > *:nth-child(-n+' + indexes[0] + ') {position: none;}' +
								 cssId + ' col:nth-child(-n+' + indexes[0] + ') {display: none;}' +

								 //but show those that are frozen
								 cssId + ' tr > *:nth-child(-n+' + (that.frozenAt.col + 1) + ') {display: table-cell;}' +
								 cssId + ' col:nth-child(-n+' + (that.frozenAt.col + 1) + ') {display: table-column;}' +

								 //hide those that are ahead of current scroll area, but are not in view to keep table redraw fast
								 cssId + ' tr > *:nth-child(' + (indexes[0] + 20) + ') ~ * {display: none;}' +
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
						if (this.max === undefined){
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


		hide:function (hiddenRows, hiddenColumns) {
			var cssId = '#' + this.table.getAttribute('id'),
				pane = this.pane,
				that = this;

			if (this.toggleHideStyleX === null) {
				this.toggleHideStyleX = new Sheet.StyleUpdater(function () {
					var style = this.nthCss('col', cssId, that.hiddenColumns, 0) +
						this.nthCss('> td', cssId + ' tr', that.hiddenColumns, 0) +
						this.nthCss('> th', cssId + ' tr', that.hiddenColumns, 0);

					this.setStyle(style);
				});

				this.toggleHideStyleY = new Sheet.StyleUpdater(function () {
					var style = this.nthCss('tr', cssId, that.hiddenRows, 0);

					this.setStyle(style);
				});
			}

			pane.appendChild(this.toggleHideStyleX.styleElement);
			pane.appendChild(this.toggleHideStyleY.styleElement);

			this.hiddenRows = (hiddenRows !== null ? hiddenRows : []);
			this.hiddenColumns = (hiddenColumns !== null ? hiddenColumns : []);

			this.toggleHideStyleY.update();
			this.toggleHideStyleX.update();
		},

		/**
		 * Toggles a row to be visible
		 * @param {Number} index
		 */
		toggleHideRow: function(index) {
			var key;
			if ((key = this.hiddenRows.indexOf(index)) > -1) {
				this.hiddenRows.splice(key, 1);
			} else {
				this.hiddenRows.push(index);
			}
			this.toggleHideStyleY.update();
		},

		/**
		 * Toggles a range of rows to be visible starting at index of 1
		 * @param {Number} startIndex
		 * @param {Number} [endIndex]
		 */
		toggleHideRowRange: function(startIndex, endIndex) {
			if (!startIndex) return;
			if (!endIndex) endIndex = startIndex;

			var hiddenRows = this.hiddenRows,
				newHiddenRows = [],
				max = hiddenRows.length,
				hiddenRow,
				i = 0,
				removing = null;

			for(;i < max; i++){
				hiddenRow = hiddenRows[i];
				if (hiddenRow >= startIndex && hiddenRow <= endIndex) {
					if (removing === null) {
						removing = true;
					}
				} else {
					newHiddenRows.push(hiddenRow);
				}
			}

			if (removing === null) {
				for(i = startIndex; i <= endIndex; i++) {
					newHiddenRows.push(i);
				}
			}

			this.hiddenRows = newHiddenRows;
			this.toggleHideStyleY.update();
		},

		/**
		 * Makes all rows visible
		 */
		rowShowAll:function () {
			this.toggleHideStyleY.setStyle('');
			this.hiddenRows = [];
		},


		/**
		 * Toggles a column to be visible
		 * @param {Number} index
		 */
		toggleHideColumn: function(index) {
			var key;
			if ((key = this.hiddenColumns.indexOf(index)) > -1) {
				this.hiddenColumns.splice(key, 1);
			} else {
				this.hiddenColumns.push(index);
			}
			this.toggleHideStyleX.update();
		},
		/**
		 * Toggles a range of columns to be visible starting at index of 1
		 * @param {Number} startIndex
		 * @param {Number} [endIndex]
		 */
		toggleHideColumnRange: function(startIndex, endIndex) {
			if (!startIndex) return;
			if (!endIndex) endIndex = startIndex;

			var hiddenColumns = this.hiddenColumns,
				newHiddenColumns = [],
				max = hiddenColumns.length,
				hiddenColumn,
				i = 0,
				removing = null;

			for(;i < max; i++){
				hiddenColumn = hiddenColumns[i];
				if (hiddenColumn >= startIndex && hiddenColumn <= endIndex) {
					if (removing === null) {
						removing = true;
					}
				} else {
					newHiddenColumns.push(hiddenColumn);
				}
			}

			if (removing === null) {
				for(i = startIndex; i <= endIndex; i++) {
					newHiddenColumns.push(i);
				}
			}

			this.hiddenColumns = newHiddenColumns;
			this.toggleHideStyleX.update();
		},
		columnShowAll:function () {
			this.toggleHideStyleX.setStyle('');
			this.hiddenColumns = [];
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

			if (indexes.length > 0) {
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

		/**
		 * @type Sheet.StyleUpdater
		 */
		toggleHideStyleX: null,

		/**
		 * @type Sheet.StyleUpdater
		 */
		toggleHideStyleY: null
	};

	return Constructor;
})(document, window, Math, Number, $);