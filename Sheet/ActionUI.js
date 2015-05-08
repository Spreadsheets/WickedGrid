
/**
 * Creates the scrolling system used by each spreadsheet
 */
Sheet.ActionUI = (function(document, window, Math, Number, $) {
	var ActionUI = function(jS, enclosure, cl, frozenAt, hiddenRows, hiddenColumns) {
		this.enclosure = enclosure;
		this.pane = document.createElement('div');
		enclosure.appendChild(this.pane);

		this.xIndex = 0;
		this.yIndex = 0;

		this.hiddenRows = hiddenRows;
		this.hiddenColumns = hiddenColumns;

		if (!(this.frozenAt = frozenAt)) {
			this.frozenAt = {row:0, col:0};
		}

		this.frozenAt.row = Math.max(this.frozenAt.row, 0);
		this.frozenAt.col = Math.max(this.frozenAt.col, 0);

		var that = this,
			loader = jS.s.loader,
			pane = this.pane,
			left,
			up,

			/**
			 * Where the current sheet is scrolled to
			 * @returns {Object}
			 */
			scrolledArea = this.scrolledArea = {
				row: Math.max(this.frozenAt.row, 1),
				col: Math.max(this.frozenAt.col, 1)
			},

			//TODO: connect megatable up to Loader
			megaTable = this.megaTable = new MegaTable({
				columns: Sheet.domColumns,
				rows: Sheet.domRows,
				element: pane,
				updateCell: function(rowIndex, columnIndex, td) {
					if (that.rowPrevHidden > 0 && rowIndex > that.rowPrevHidden) {
						rowIndex = that.rowPrevHidden + rowIndex + 1;
					} else {
						rowIndex = rowIndex + 1;
					}

					if (that.columnPrevHidden > 0 && columnIndex > that.columnPrevHidden) {
						columnIndex = that.columnPrevHidden + columnIndex + 1;
					} else {
						columnIndex = columnIndex + 1;
					}

					if (typeof td.jSCell === 'object' && td.jSCell !== null) {
						td.jSCell.td = null;
					}

					var cell = jS.getCell(jS.i, rowIndex, columnIndex);

					if (cell === null) return;

					var spreadsheet = jS.spreadsheets[jS.i] || (jS.spreadsheets[jS.i] = []),
						row = spreadsheet[rowIndex] || (spreadsheet[rowIndex] = []);

					if (!row[columnIndex]) {
						row[columnIndex] = cell;
					}

					cell.td = td;
					td.jSCell = cell;
					loader.setupTD(cell.loadedFrom, td);
					cell.updateValue();
				},
				updateCorner: function(th, col) {
					th.entity = 'corner';
					th.col = col;
					th.className = jS.cl.barCorner + ' ' + jS.theme.bar;
				},
				updateRowHeader: function(i, header) {
					var prevHidden = 0,
						nextHidden = 0,
						hiddenI,
						isHidden = hiddenRows !== null ? (hiddenI = hiddenRows.indexOf(i)) > -1 : false;

					if (isHidden) {
						prevHidden++;
						nextHidden++;

						//count previous till you find one that isn't hidden
						while (hiddenRows[hiddenI - prevHidden] !== undefined) prevHidden++;

						//count next till you find one that isn't hidden
						while (hiddenRows[hiddenI + nextHidden] !== undefined) nextHidden++;

						that.rowPrevHidden = prevHidden;
						that.rowNextHidden = nextHidden;
						that.yIndex = i + prevHidden + nextHidden + 1;
					} else {
						if (that.rowPrevHidden > 0 && i > that.rowPrevHidden) {
							that.yIndex = that.rowPrevHidden + i + 1;
						} else {
							that.rowPrevHidden = 0;
							that.rowNextHidden = 0;
							that.yIndex = i + 1;
						}
					}

					header.entity = 'left';
					header.className = jS.cl.barLeft + ' ' + jS.theme.bar;
					header.appendChild(document.createTextNode(that.yIndex + ''));
					header.parentNode.style.height = header.style.height = loader.getHeight(jS.i, that.yIndex) + 'px';
				},
				updateColumnHeader: function(i, header, col) {
					var prevHidden = 0,
						nextHidden = 0,
						hiddenI,
						isHidden = hiddenColumns!== null ? (hiddenI = hiddenColumns.indexOf(i)) > -1 : false;

					if (isHidden) {
						prevHidden++;
						nextHidden++;

						//count previous till you find one that isn't hidden
						while (hiddenColumns[hiddenI - prevHidden] !== undefined) prevHidden++;

						//count next till you find one that isn't hidden
						while (hiddenColumns[hiddenI + nextHidden] !== undefined) nextHidden++;

						that.columnPrevHidden = prevHidden;
						that.columnNextHidden = nextHidden;
						that.xIndex = i + prevHidden + nextHidden + 1;
					} else {
						if (that.columnPrevHidden > 0 && i > that.columnPrevHidden) {
							that.xIndex = that.columnPrevHidden + i + 1;
						} else {
							that.columnPrevHidden = 0;
							that.columnNextHidden = 0;
							that.xIndex = i + 1;
						}
					}

					header.th = header;
					header.col = col;
					header.entity = 'top';
					header.className = jS.cl.barTop + ' ' + jS.theme.bar;
					header.appendChild(document.createTextNode(jS.cellHandler.columnLabelString(that.xIndex)));
					col.style.width = loader.getWidth(jS.i, that.xIndex) + 'px';
				}
			}),

			infiniscroll = this.infiniscroll = new Infiniscroll(pane, {
				scroll: function(c, r) {
					setTimeout(function() {
						scrolledArea.col = c;
						scrolledArea.row = r;
						megaTable.update(r, c);
					}, 0);
				},
				verticalScrollDensity: 15,
				horizontalScrollDensity: 25
			});

		new MouseWheel(pane, infiniscroll._out);

		megaTable.table.className += ' ' + jS.cl.table + ' ' + jS.theme.table;
		megaTable.table.setAttribute('cellSpacing', '0');
		megaTable.table.setAttribute('cellPadding', '0');
		pane.scroll = infiniscroll._out;
		pane.actionUI = this;
		pane.table = megaTable.table;
		pane.tBody = megaTable.tBody;
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


		hide:function (jS, hiddenColumns, hiddenRows) {
			throw new Error('Not yet implemented');
		},

		/**
		 * Toggles a row to be visible
		 * @param {jQuery.sheet.instance} jS
		 * @param {Number} rowIndex
		 */
		toggleHideRow: function(jS, rowIndex) {
			throw new Error('Not yet implemented');
		},

		/**
		 * Toggles a range of rows to be visible starting at index of 1
		 * @param {jQuery.sheet.instance} jS
		 * @param {Number} startIndex
		 * @param {Number} [endIndex]
		 * @param {Boolean} [hide]
		 */
		toggleHideRowRange: function(jS, startIndex, endIndex, hide) {
			throw new Error('Not yet implemented');
		},

		/**
		 * @param {jQuery.sheet.instance} jS
		 * Makes all rows visible
		 */
		rowShowAll:function (jS) {
			throw new Error('Not yet implemented');
		},


		/**
		 * Toggles a column to be visible
		 * @param {Number} index
		 */
		toggleHideColumn: function(index) {
			throw new Error('Not yet implemented');
		},
		/**
		 * Toggles a range of columns to be visible starting at index of 1
		 * @param {Number} startIndex
		 * @param {Number} [endIndex]
		 */
		toggleHideColumnRange: function(startIndex, endIndex) {
			throw new Error('Not yet implemented');
		},
		columnShowAll:function () {
			throw new Error('Not yet implemented');
		},

		remove: function() {
			throw new Error('Not yet implemented');
		},

		scrollToCell: function(axis, value) {
			throw new Error('Not yet implemented');
		},

		pixelScrollDensity: 30,
		maximumVisibleRows: 65,
		maximumVisibleColumns: 35
	};

	return ActionUI;
})(document, window, Math, Number, $);