
Sheet.StyleUpdater = (function(document) {
	function Constructor(updateFn, max) {
		var el = this.styleElement = document.createElement('style');
		el.styleUpdater = this;
		this._update = updateFn;
		this.max = max;

		if (Sheet.StyleUpdater.prototype.nthCss === null) {
			if (max !== undefined) {//this is where we check IE8 compatibility
				Sheet.StyleUpdater.prototype.nthCss = function (elementName, parentSelectorString, indexes, min, css) {
					var style = [],
						index = indexes.length,
						repeat = this.repeat;

					css = css || '{display: none;}';

					do {
						if (indexes[index] > min) {
							style.push(parentSelectorString + ' ' + elementName + ':first-child' + repeat('+' + elementName, indexes[index] - 1));
						}
					} while (index--);

					if (style.length) {
						return style.join(',') + css;
					}

					return '';
				};
			} else {
				Sheet.StyleUpdater.prototype.nthCss = function (elementName, parentSelectorString, indexes, min, css) {
					var style = [],
						index = indexes.length;

					css = css || '{display: none;}';

					do {
						if (indexes[index] > min) {
							style.unshift(parentSelectorString + ' ' + elementName + ':nth-child(' + (indexes[index] + 1) + ')');
						}
					} while (index--);

					if (style.length) {
						return style.join(',') + css;
					}

					return '';
				};
			}
		}
	}
	Constructor.prototype = {
		/**
		 * @methodOf Sheet.StyleUpdater
		 * @type {Function}
		 */
		setStyle: null,
		/**
		 * @methodOf Sheet.StyleUpdater
		 * @type {Function}
		 */
		getStyle: null,

		/**
		 * Creates css for an iterated element
		 * @param {String} elementName
		 * @param {String} parentSelectorString
		 * @param {Array} indexes
		 * @param {Number} min
		 * @param {String} [css]
		 * @methodOf Sheet.StyleUpdater
		 * @type {Function}
		 * @returns {String}
		 */
		nthCss: null,

		/**
		 * Repeats a string a number of times
		 * @param {String} str
		 * @param {Number} num
		 * @returns {String}
		 */
		repeat: function (str, num) {
			var result = '';
			while (num > 0) {
				if (num & 1) {
					result += str;
				}
				num >>= 1;
				str += str;
			}
			return result;
		},
		update: function() {
			return this._update.apply(this, arguments);
		}
	};

	//ie
	if (document.createElement('style').styleSheet) {
		Constructor.prototype.setStyle = function(css) {
			var el = this.styleElement,
				ss = el.styleSheet;

			ss.disabled = false;//IE8 bug, for some reason in some scenarios disabled never becomes enabled.  And even setting here don't actually set it, it just ensures that is is set to disabled = false when the time is right
			if (!ss.disabled) {
				ss.cssText = css;
			}
		};

		Constructor.prototype.getStyle = function() {
			var el = this.styleElement,
				ss = el.styleSheet;

			ss.disabled = false;//IE8 bug, for some reason in some scenarios disabled never becomes enabled.  And even setting here don't actually set it, it just ensures that is is set to disabled = false when the time is right
			if (!ss.disabled) {
				return ss.cssText;
			}
			return '';
		};
	} else {
		//standard
		Constructor.prototype.setStyle = function(css) {
			this.styleElement.innerHTML = css;
		};
		Constructor.prototype.getStyle = function() {
			return this.styleElement.innerHTML;
		};
	}

	return Constructor;
})(document);