
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
			row: Math.max(this.frozenAt.row, 1),
			col: Math.max(this.frozenAt.col, 1)
		};

		var that = this,
			pane = this.pane,
			cssId = '#' + table.getAttribute('id'),
			scrollOuter = this.scrollUI = pane.scrollOuter = document.createElement('div'),
			scrollInner = pane.scrollInner = document.createElement('div'),
			scrollStyleX = this.scrollAxis.x.scrollStyle = pane.scrollStyleX = this.scrollStyleX = new Sheet.StyleUpdater(function(index, style) {
				//the reason we save the index and return false is to prevent redraw, a scrollbar may move 100 pixels, but only need to redraw once
				if (that.xIndex === index) return false;

				if (index === undefined || index === null) index = that.xIndex;
				that.xIndex = index;
				if (style === undefined) {
					var col = that.frozenAt.col;
					 style =
						 //hide all previous td/th/col elements
						 cssId + ' tr > *:nth-child(-n+' + index + ') {display: none;}' +
						 cssId + ' col:nth-child(-n+' + index + ') {display: none;}' +

						 //but show those that are frozen
						 cssId + ' tr > *:nth-child(-n+' + (col + 1) + ') {display: table-cell;}' +
						 cssId + ' col:nth-child(-n+' + (col + 1) + ') {display: table-column;}' +

						 //hide those that are ahead of current scroll area, but are not in view to keep table redraw fast
						 cssId + ' tr > *:nth-child(' + (index + 20) + ') ~ * {display: none;}' +
						 cssId + ' col:nth-child(' + (index + 20) + ') ~ col {display: none;}';

				}

				this.setStyle(style);
				that.scrolledArea.col = Math.max(index || 1, 1);
				return true;
			}, max),
			scrollStyleY = this.scrollAxis.y.scrollStyle = pane.scrollStyleY = this.scrollStyleY = new Sheet.StyleUpdater(function(index, style){
				//the reason we save the index and return false is to prevent redraw, a scrollbar may move 100 pixels, but only need to redraw once
				if (that.yIndex === index) return false;

				if (index === undefined || index === null) index = that.yIndex;
				that.yIndex = index;
				if (style === undefined) {
					var row = that.frozenAt.row;
					style =
						//hide all previous tr elements
						cssId + ' tr:nth-child(-n+' + index + ') {display: none;}' +

						//but show those that are frozen
						cssId + ' tr:nth-child(-n+' + (that.frozenAt.row + 1) + ') {display: table-row;}' +

						//hide those that are ahead of current scroll area, but are not in view to keep table redraw fast
						cssId + ' tr:nth-child(' + (index + 70) + ') ~ tr {display: none;}';
				}

				this.setStyle(style);
				that.scrolledArea.row = Math.max(index || 1, 1);
				return true;
			});

		scrollOuter.setAttribute('class', cl);
		scrollOuter.appendChild(scrollInner);

		$(scrollOuter)
			.disableSelectionSpecial();

		scrollOuter.addEventListener('scroll', function() {
			var total = scrollOuter.scrollTop + scrollOuter.clientHeight;
			if (total >= (scrollInner.clientHeight - (scrollOuter.clientHeight / 2))) {
				scrollInner.style.height = (scrollInner.clientHeight + (scrollOuter.clientHeight * 2)) + 'px';
			}

			total = scrollOuter.scrollLeft + scrollOuter.clientWidth;
			if (total >= (scrollInner.clientWidth - (scrollOuter.clientWidth / 2))) {
				scrollInner.style.width = (scrollInner.clientWidth + (scrollOuter.clientWidth * 2)) + 'px';
			}
		});

		pane.appendChild(scrollStyleX.styleElement);
		pane.appendChild(scrollStyleY.styleElement);

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
				scrolledTo = this.scrolledArea;

				if (direction.left) {
					x--;
					this.scrollTo(
						'x',
						0,
						scrolledTo.col - 1
					);
				} else if (direction.right) {
					x++;
					this.scrollTo(
						'x',
						0,
						scrolledTo.col + 1
					);
				}

				if (direction.up) {
					y--;
					this.scrollTo(
						'y',
						0,
						scrolledTo.row - 1
					);
				} else if (direction.down) {
					y++;
					this.scrollTo(
						'y',
						0,
						scrolledTo.row + 1
					);
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
				scrollTo = this.scrolledArea;

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
		 * Scrolls to a position within the spreadsheet
		 * @param {String} axisType
		 * @param {Number} [pixel] scrollTO
		 */
		scrollToPixel:function (axisType, pixel) {
			var axis = this.scrollAxis[axisType],
				max,
				i,
				value = Math.round(pixel / this.pixelScrollDensity);

			max = axis.max;
			axis.value = value;

			i = value > max ? max : value;
			return axis.scrollStyle.update(i);
		},

		scrollToCell: function(axis, value) {
			throw new Error('Not yet implemented');
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
		toggleHideStyleY: null,

		pixelScrollDensity: 20
	};

	return Constructor;
})(document, window, Math, Number, $);