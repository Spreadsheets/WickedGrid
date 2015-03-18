
/**
 * Creates the scrolling system used by each spreadsheet
 */
Sheet.Highlighter = (function(document, window, $) {
	var Constructor = function(cssClass, cssClassBars, cssClassTabs, callBack) {
		this.cssClass = cssClass;
		this.cssClassBars = cssClassBars;
		this.cssClassTabs = cssClassTabs;
		this.callBack = callBack || function() {};

		this.last = $([]);
		this.lastTop = $([]);
		this.lastLeft = $([]);
		this.lastTab = $([]);
		this.startRowIndex = 0;
		this.startColumnIndex = 0;
		this.endRowIndex = 0;
		this.endColumnIndex = 0;
	};

	Constructor.prototype = {
		set: function (obj) {
			if (obj.parentNode !== undefined) {
				obj = [obj];
			}

			var i,
				oldObjects = this.last;

			//_obj is the old selected items
			if (oldObjects && oldObjects.length > 0) {
				i = oldObjects.length - 1;
				do {
					oldObjects[i].isHighlighted = false;
				} while (i-- > 0);
			}

			if (obj.length > 0) {
				i = obj.length - 1;
				do {
					if (!obj[i].isHighlighted) {
						obj[i].isHighlighted = true;
						if (!obj[i].className.match(this.cssClass)) {
							obj[i].className += ' ' + this.cssClass;
						}
					}
				} while (i-- > 0);
			}

			this.clear(oldObjects);
			this.last = obj;

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
							obj[i].className = obj[i].className.replace(this.cssClass, '');
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
			switch (direction) {
				case 'top':
					this.lastTop
						.removeClass(this.cssClassBars);
					this.lastTop = $(td).addClass(this.cssClassBars);
					break;
				case 'left':
					this.lastLeft
						.removeClass(this.cssClassBars);
					this.lastLeft = $(td).addClass(this.cssClassBars);
					break;
			}

			return this;
		},

		/**
		 * Clears bars from being active
		 */
		clearBar:function () {
			this.lastTop
				.removeClass(this.cssClassBars);
			this.lastTop = $([]);

			this.lastLeft
				.removeClass(this.cssClassBars);
			this.lastLeft = $([]);

			return this;
		},



		/**
		 * Sets a tab to be active
		 */
		setTab:function (tab) {
			this.clearTab();
			this.lastTab = tab.addClass(this.cssClassTabs);

			return this;
		},

		/**
		 * Clears a tab from being active
		 */
		clearTab:function () {
			this.lastTab
				.removeClass(this.cssClassTabs);

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

	return Constructor;

})(document, window, jQuery);