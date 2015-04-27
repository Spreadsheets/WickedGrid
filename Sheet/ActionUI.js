
/**
 * Creates the scrolling system used by each spreadsheet
 */
Sheet.ActionUI = (function(document, window, Math, Number, $) {
	var ActionUI = function(jS, enclosure, cl, frozenAt, max) {
		this.enclosure = enclosure;
		this.pane = document.createElement('div');
		this.max = max;

		this.xIndex = 0;
		this.yIndex = 0;

		this.scrollAxisX = {};
		this.scrollAxisY = {};

		this.scrollSize = {};

		this.hiddenColumns = [];

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

		this.foldArea = {
			row: 0,
			col: 0
		};

		var that = this,
			pane = this.pane,

			//TODO: connect megatable up to Loader
			megaTable = this.megaTable = new MegaTable({
				element: pane,
				updateCell: function(row, column, td) {
					jS.getCell(jS.i);
				},
				updateRowHeader: function(i, header) {
					header.innerHTML = i;
				},
				updateColumnHeader: function(i, header) {
					header.innerHTML = i;
				}
			}),

			infiniscroll = this.infiniscroll = new Infiniscroll(pane, {
				scroll: function(c, r) {
					megaTable.update(r, c);
				},
				verticalScrollDensity: 5,
				horizontalScrollDensity: 25
			});

		new MouseWheel(pane, this.mt._out);
	};

	ActionUI.prototype = {
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

		hide:function (jS, hiddenColumns, hiddenRows) {
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
			}

			pane.appendChild(this.toggleHideStyleX.styleElement);

			this.hiddenColumns = (hiddenColumns !== null ? hiddenColumns : []);

			if (hiddenRows !== null && hiddenRows.length > 0) {
				hiddenRows.sort();
				this.toggleHideRowRange(jS, hiddenRows[0], hiddenRows[hiddenRows.length - 1], true);
			}

			if (this.hiddenColumns.length > 0) {
				this.hiddenColumns.sort();
				this.toggleHideStyleX.update();
			}
		},

		/**
		 * Toggles a row to be visible
		 * @param {jQuery.sheet.instance} jS
		 * @param {Number} rowIndex
		 */
		toggleHideRow: function(jS, rowIndex) {
			this.toggleHideRowRange(jS, rowIndex);
		},

		/**
		 * Toggles a range of rows to be visible starting at index of 1
		 * @param {jQuery.sheet.instance} jS
		 * @param {Number} startIndex
		 * @param {Number} [endIndex]
		 * @param {Boolean} [hide]
		 */
		toggleHideRowRange: function(jS, startIndex, endIndex, hide) {
			if (!startIndex) return;
			if (!endIndex) endIndex = startIndex;

			var spreadsheets = jS.spreadsheets,
				spreadsheet = spreadsheets[jS.i],
				tBody = this.tBody,
				rowIndex = startIndex,
				row,
				tr,
				removing = (hide !== undefined ? hide : (spreadsheet[startIndex][1].td.parentNode.parentNode !== null)),
				lastAnchorIndex = endIndex + 1,
				lastAnchor = null;

			if (removing) {
				for(;rowIndex <= endIndex && (row = spreadsheet[rowIndex]) !== undefined; rowIndex++){
					tr = row[1].td.parentNode;
					if (tr.parentNode !== null) {
						tBody.removeChild(tr);
					}
				}
			} else {

				while (lastAnchor === null && lastAnchorIndex < spreadsheet.length) {
					row = spreadsheet[lastAnchorIndex++];
					lastAnchor = row[1].td.parentNode;
					if (lastAnchor.parentNode === null) {
						lastAnchor = null;
					}
				}

				for(;rowIndex <= endIndex && (row = spreadsheet[rowIndex]) !== undefined; rowIndex++){
					tr = row[1].td.parentNode;
					if (tr.parentNode !== null) {
						tBody.insertBefore(tr, lastAnchor);
					}
				}
			}

		},

		/**
		 * @param {jQuery.sheet.instance} jS
		 * Makes all rows visible
		 */
		rowShowAll:function (jS) {
			var spreadsheet = jS.spreadsheets[jS.i],
				lastIndex = spreadsheet.length - 1;

			this.toggleHideRowRange(jS, 1, lastIndex, false);
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
			this.hiddenColumns.sort();
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

			newHiddenColumns.sort();
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
		 * @param {Number} pixel scrollTO
		 */
		scrollToPixelX:function (pixel) {
			var axis = this.scrollAxisX,
				max,
				i,
				value = (pixel / this.pixelScrollDensity) >> 1,
				offset = arrHelpers.indexOfNearestLessThan(this.hiddenColumns, value) + 1;

			if (offset > 0) {
				value += offset;
			}

			max = axis.max;
			axis.value = value;

			i = value > max ? max : value;
			return axis.scrollStyle.update(i);
		},

		/**
		 * Scrolls to a position within the spreadsheet
		 * @param {Number} pixel
		 * @param {Boolean} [isUp]
		 */
		scrollToPixelY: function(pixel, isUp) {
			var i = (pixel / this.pixelScrollDensity) >> 1,
				detacher = this.yDetacher;

			this.yIndex = i;
			this.scrolledArea.row = Math.max(i || 1, 1);

			if (isUp === true) {
				detacher
					.attachAboveAfter(i)
					.detachBelowAfter(i + this.maximumVisibleRows + 1);
			} else {
				detacher
					.detachAboveBefore(i)
					.attachBelowBefore(i + this.maximumVisibleRows + 1);
			}

			return detacher.aboveChanged || detacher.belowChanged;
		},

		scrollToCell: function(axis, value) {
			throw new Error('Not yet implemented');
		},

		/**
		 * @type Sheet.StyleUpdater
		 */
		toggleHideStyleX: null,

		/**
		 * @type Sheet.StyleUpdater
		 */
		toggleHideStyleY: null,

		pixelScrollDensity: 30,
		maximumVisibleRows: 65,
		maximumVisibleColumns: 35
	};

	return ActionUI;
})(document, window, Math, Number, $);