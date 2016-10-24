
/**
 * Creates the scrolling system used by each spreadsheet
 */
WickedGrid.Highlighter = (function() {
	var Highlighter = function(cellCssClass, barCssClass, tabsCssClass, callBack) {
		this.cellCssClass = cellCssClass.split(/[\s]/);
		this.barCssClass = barCssClass.split(/[\s]/);
		this.tabsCssClass = tabsCssClass.split(/[\s]/);
		this.callBack = callBack;

		this.last = [];
		this.lastTop = $([]);
		this.lastLeft = $([]);
		this.lastTab = $([]);
		this.startRowIndex = 0;
		this.startColumnIndex = 0;
		this.endRowIndex = 0;
		this.endColumnIndex = 0;
	};

  Highlighter.prototype = {
    /**
     *
     * @param {WickedGrid.Cell} cell
     */
    cell: function(cell) {
      this.cellCssClass.forEach(function(_class) {
        cell.addClass(_class);
      });

      this.last.push(cell);
      return this;
    },

    off: function() {
      while (this.last.length > 0) {
        var last = this.last.pop();
        switch (last.type) {
          case WickedGrid.Cell:
            this.cellCssClass.forEach(function(_class) {
              last.removeClass(_class);
            });
            break;
          default:
            this.cellCssClass.forEach(function(_class) {
              last.removeClass(_class);
            });
        }
      }
      return this;
    },
		set: function (objs) {
			if (objs.parentNode !== undefined) {
				objs = [objs];
			}

			var i,
					obj,
					lastHighlighted = this.last;

			//_obj is the old selected items
			if (lastHighlighted && lastHighlighted.length > 0) {
				i = lastHighlighted.length - 1;
				do {
					lastHighlighted[i].isHighlighted = false;
				} while (i-- > 0);
			}

			if (objs.length > 0) {
				i = objs.length - 1;
				do {
					obj = objs[i];
					if (!obj.isHighlighted) {
						obj.isHighlighted = true;
						this.cellCssClass.forEach(function(_class) {
							if (!obj.className.match(_class)) {
								obj.className += ' ' + _class;
							}
      						});
					}
				} while (i-- > 0);
			}

			this.clear(lastHighlighted);
			this.last = objs;

			this.callBack();
			return this;
		},

		/**
		 * Detects if there is a cell highlighted
		 * @returns {Boolean}
		 */
		is:function () {
			return this.last.length > 0;
		},

		/**
		 * Clears highlighted cells
		 * @param {Object} [obj]
		 */
		clear:function (obj) {
			if (this.is()) {
				obj = obj || this.last;

				if (obj && obj.length) {
					var i = obj.length - 1;
					do {
						if (!obj[i].isHighlighted) {
							this.cellCssClass.forEach(function(_class) {
								obj[i].className = obj[i].className.replace(_class, '');
							});
							obj[i].isHighlighted = false;
						}
					} while (i-- > 0);
				}
			}

			this.last = $([]);

			return this;
		},


		/**
		 * Sets a bar to be active
		 * @param {String} direction left or top
		 * @param {HTMLElement} td index of bar
		 */
		setBar:function (direction, td) {
			var self = this;
			switch (direction) {
				case 'top':
					this.barCssClass.forEach(function(_class) {
						self.lastTop
							.removeClass(_class);
						self.lastTop = $(td).addClass(_class);
					});
					break;
				case 'left':
					this.barCssClass.forEach(function(_class) {
						self.lastLeft
							.removeClass(_class);
						self.lastLeft = $(td).addClass(_class);
					});
					break;
			}

			return this;
		},

		/**
		 * Clears bars from being active
		 */
		clearBar:function () {
			var self = this;
			this.barCssClass.forEach(function(_class) {
				self.lastTop
					.removeClass(_class);
				self.lastLeft
					.removeClass(_class);
			});
			this.lastTop = $([]);
			this.lastLeft = $([]);

			return this;
		},



		/**
		 * Sets a tab to be active
		 */
		setTab:function (tab) {
			var self = this;
			this.clearTab();
			this.tabsCssClass.forEach(function(_class) {
				self.lastTab = tab.addClass(_class);
			});

			return this;
		},

		/**
		 * Clears a tab from being active
		 */
		clearTab:function () {
			var self = this;
			this.tabsCssClass.forEach(function(_class) {
				self.lastTab
					.removeClass(_class);
			});

			return this;
		},

		setStart: function(cell) {
			this.startRowIndex = cell.rowIndex + 0;
			this.startColumnIndex = cell.columnIndex + 0;

			return this;
		},

		setEnd: function(cell) {
			this.endRowIndex = cell.rowIndex + 0;
			this.endColumnIndex = cell.columnIndex + 0;

			return this;
		}
	};

	return Highlighter;
})();
