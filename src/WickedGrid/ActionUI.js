
/**
 * Creates the scrolling system used by each spreadsheet
 */
Sheet.ActionUI = (function(document, window, Math, Number, $) {
	var ActionUI = function(jS, enclosure, cl, frozenAt) {
		this.jS = jS;
		this.enclosure = enclosure;
		this.pane = document.createElement('div');
		this.active = true;
		enclosure.appendChild(this.pane);

		if (!(this.frozenAt = frozenAt)) {
			this.frozenAt = {row:0, col:0};
		}

		this.frozenAt.row = Math.max(this.frozenAt.row, 0);
		this.frozenAt.col = Math.max(this.frozenAt.col, 0);

		jS.s.loader.bindActionUI(jS.i, this);

		this.hiddenRows = jS.s.loader.hiddenRows(this);
		this.visibleRows = [];
		this.hiddenColumns = jS.s.loader.hiddenColumns(this);
		this.visibleColumns = [];

		this.loader = jS.s.loader;

		this
			.setupVisibleRows()
			.setupVisibleColumns();

		var that = this,
			loader = this.loader,
			sheetRowIndex,
			sheetColumnIndex,
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

			megaTable = this.megaTable = new MegaTable({
				columns: Sheet.domColumns,
				rows: Sheet.domRows,
				element: pane,
				updateCell: this._updateCell = function(rowVisibleIndex, columnVisibleIndex, td) {
					var rowIndex = (that.visibleRows.length === 0 ? rowVisibleIndex : that.visibleRows[rowVisibleIndex]),
						columnIndex = (that.visibleColumns === 0 ? columnVisibleIndex : that.visibleColumns[columnVisibleIndex]),
						oldTd;

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

					oldTd = cell.td;
					if (oldTd !== null) {
						while (oldTd.lastChild !== null) {
							oldTd.removeChild(oldTd.lastChild);
						}
					}

					cell.td = td;
					td.jSCell = cell;
					loader.setupTD(cell, td);
					cell.updateValue();
				},
				updateCorner: this._updateCorner = function(th, col) {
					th.index = -1;
					th.entity = 'corner';
					th.col = col;
					th.className = jS.cl.barCorner + ' ' + jS.theme.bar;
				},
				updateRowHeader: this._updateRowHeader = function(rowVisibleIndex, header) {
					var rowIndex,
						label;

					if (that.visibleRows.length === 0) {
						rowIndex = rowVisibleIndex;
						label = document.createTextNode(rowIndex + 1);
					} else {
						if (rowVisibleIndex >= that.visibleRows.length) {
							rowIndex = rowVisibleIndex + that.hiddenRows.length;
						} else {
							rowIndex = that.visibleRows[rowVisibleIndex];
						}
						label = document.createTextNode(rowIndex + 1);
					}

					header.index = rowIndex;
					header.entity = 'left';
					header.className = jS.cl.barLeft + ' ' + jS.theme.bar;
					header.appendChild(label);
					header.parentNode.style.height = header.style.height = loader.getHeight(jS.i, rowIndex) + 'px';
				},
				updateColumnHeader: this._updateColumnHeader = function(columnVisibleIndex, header, col) {
					var columnIndex,
						label;

					if (that.visibleColumns.length === 0) {
						columnIndex = columnVisibleIndex;
						label = document.createTextNode(jS.cellHandler.columnLabelString(columnIndex));
					} else {
						if (columnVisibleIndex >= that.visibleColumns.length) {
							columnIndex = columnVisibleIndex + that.hiddenColumns.length;
						} else {
							columnIndex = that.visibleColumns[columnVisibleIndex];
						}
						label = document.createTextNode(jS.cellHandler.columnLabelString(columnIndex));
					}

					header.index = columnIndex;
					header.th = header;
					header.col = col;
					header.entity = 'top';
					header.className = jS.cl.barTop + ' ' + jS.theme.bar;
					header.appendChild(label);
					col.style.width = loader.getWidth(jS.i, columnIndex) + 'px';
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

		hide: function() {
			var jS = this.jS,
				ui = jS.obj.ui,
				pane = this.pane,
				parent = pane.parentNode,
				infiniscroll = this.infiniscroll;

			if (pane !== undefined && parent.parentNode !== null) {
				this.deactivate();
				infiniscroll.saveLT();
				ui.removeChild(pane.parentNode);
			}

			return this;
		},

		show: function() {
			var jS = this.jS,
				ui = jS.obj.ui,
				pane = this.pane,
				parent = pane.parentNode,
				infiniscroll = this.infiniscroll;

			if (pane !== undefined && parent.parentNode === null) {
				ui.appendChild(pane.parentNode);
				infiniscroll.applyLT();
				this.activate();
			}

			return this;
		},

		deactivate: function() {
			var mt = this.megaTable;
			this.active = false;

			mt.updateCell =
			mt.updateCorner =
			mt.updateRowHeader =
			mt.updateColumnHeader = function() {};

			return this;
		},
		activate: function() {
			var mt = this.megaTable;
			this.active = true;

			mt.updateCell = this._updateCell;
			mt.updateCorner = this._updateCorner;
			mt.updateRowHeader = this._updateRowHeader;
			mt.updateColumnHeader = this._updateColumnHeader;

			return this;
		},

		/**
		 * Toggles a row to be visible
		 * @param {Number} rowIndex
		 */
		hideRow: function(rowIndex) {
			this.hiddenRows = this.loader.hideRow(this, rowIndex);

			var i;
			if ((i = this.visibleRows.indexOf(rowIndex)) > -1) {
				this.visibleRows.splice(i, 1);
			}

			this.megaTable.forceRedrawRows();
			return this;
		},
		/**
		 * Toggles a row to be visible
		 * @param {Number} rowIndex
		 */
		showRow: function(rowIndex) {
			this.hiddenRows = this.loader.showRow(this, rowIndex);

			if (this.visibleRows.indexOf(rowIndex) < 0) {
				this.visibleRows.push(rowIndex);
				this.visibleRows.sort(function(a, b) {return a-b});
			}

			this.megaTable.forceRedrawRows();
			return this;
		},

		/**
		 * Toggles a range of rows to be visible starting at index of 1
		 * @param {Number} startIndex
		 * @param {Number} [endIndex]
		 */
		hideRowRange: function(startIndex, endIndex) {
			var loader = this.loader, i;

			for(;startIndex <= endIndex; startIndex++) {
				this.hiddenRows = loader.hideRow(this, startIndex);
				if ((i = this.visibleRows.indexOf(startIndex)) > -1) {
					this.visibleRows.splice(i, 1);
				}
            }

			this.megaTable.forceRedrawRows();
			return this;
		},

		/**
		 * Toggles a range of rows to be visible starting at index of 1
		 * @param {Number} startIndex
		 * @param {Number} [endIndex]
		 */
		showRowRange: function(startIndex, endIndex) {
			var loader = this.loader;

			for(;startIndex <= endIndex; startIndex++) {
				this.hiddenRows = loader.showRow(this, startIndex);
				if (this.visibleRows.indexOf(startIndex) < 0) {
					this.visibleRows.push(startIndex);
				}
			}

			this.visibleRows.sort(function(a, b) {return a-b});

			this.megaTable.forceRedrawRows();
			return this;
		},

		/**
		 * Makes all rows visible
		 */
		rowShowAll:function () {
            this.hiddenRows = [];
			this.visibleRows = [];
            this.megaTable.forceRedrawRows();
			return this;
		},


		/**
		 * Toggles a column to be visible
		 * @param {Number} columnIndex
		 */
		hideColumn: function(columnIndex) {
			this.hiddenColumns = this.loader.hideColumn(this, columnIndex);

			var i;
			if ((i = this.hiddenColumns.indexOf(columnIndex)) > -1) {
				this.hiddenColumns.splice(i, 1);
			}

			this.megaTable.forceRedrawRows();
			return this;
		},
		/**
		 * Toggles a column to be visible
		 * @param {Number} columnIndex
		 */
		showColumn: function(columnIndex) {
			this.hiddenColumns = this.loader.showColumn(this, columnIndex);

			if (this.visibleColumns.indexOf(columnIndex) < 0) {
				this.visibleColumns.push(columnIndex);
				this.visibleColumns.sort(function(a, b) {return a-b});
			}

			this.megaTable.forceRedrawColumns();
			return this;
		},

		/**
		 * Toggles a range of columns to be visible starting at index of 1
		 * @param {Number} startIndex
		 * @param {Number} endIndex
		 */
		hideColumnRange: function(startIndex, endIndex) {
			var loader = this.loader, i;

			for(;startIndex <= endIndex; startIndex++) {
				this.hiddenColumns = loader.hideColumn(this, startIndex);
				if ((i = this.visibleColumns.indexOf(startIndex)) > -1) {
					this.visibleColumns.splice(i, 1);
				}
			}

			this.megaTable.forceRedrawColumns();
			return this;
		},

		/**
		 * Toggles a range of columns to be visible starting at index of 1
		 * @param {Number} startIndex
		 * @param {Number} endIndex
		 */
		showColumnRange: function(startIndex, endIndex) {
			var loader = this.loader;

			for(;startIndex <= endIndex; startIndex++) {
				this.hiddenColumns = loader.showColumn(this, startIndex);
				if (this.visibleColumns.indexOf(startIndex) < 0) {
					this.visibleColumns.push(startIndex);
				}
			}

			this.visibleColumns.sort(function(a, b) {return a-b});

			this.megaTable.forceRedrawColumns();
			return this;
		},

		/**
		 * Makes all columns visible
		 */
		columnShowAll:function () {
			this.hiddenColumns = [];
			this.visibleColumns = [];
			this.megaTable.forceRedrawColumns();
			return this;
		},

		remove: function() {
			throw new Error('Not yet implemented');
		},

		scrollToCell: function(axis, value) {
			throw new Error('Not yet implemented');
		},

		setupVisibleRows: function() {
			var i = 0,
				visibleRows = this.visibleRows = [],
				hiddenRows = this.hiddenRows,
				max = this.loader.size(this.jS.i).rows;

			for (;i < max; i++) {
				if (hiddenRows.indexOf(i) < 0) {
					visibleRows.push(i);
				}
			}

			return this;
		},
		setupVisibleColumns: function() {
			var i = 0,
				visibleColumns = this.visibleColumns = [],
				hiddenColumns = this.hiddenColumns,
				max = this.loader.size(this.jS.i).cols;

			for (;i < max; i++) {
				if (hiddenColumns.indexOf(i) < 0) {
					visibleColumns.push(i);
				}
			}

			return this;
		},

		redrawRows: function() {
			this.megaTable.forceRedrawRows();
		},

		redrawColumns: function() {
			this.megaTable.forceRedrawColumns();
		},

		pixelScrollDensity: 30,
		maximumVisibleRows: 65,
		maximumVisibleColumns: 35
	};

	return ActionUI;
})(document, window, Math, Number, $);