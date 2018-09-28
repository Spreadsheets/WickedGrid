var Infiniscroll = (function(document) {
	"use strict";

	function Infiniscroll(el, settings) {
		this.el = el;

		var defaults = Infiniscroll.defaultSettings,
			_out = this._out = document.createElement('div'),
			_in = this._in = document.createElement('div'),
			_outStyle = _out.style,
			_inStyle = _in.style,
			scroll,
			i;

		settings = settings || {};

		for (i in defaults) if (i && defaults.hasOwnProperty(i)) if (!settings.hasOwnProperty(i)) {
			settings[i] = defaults[i];
		}

		this.settings = settings;

		scroll = settings.scroll;

		_outStyle.position = 'absolute';

		//setup style of inner element
		if (settings.vertical) {
			_inStyle.height = '1000%';
			_outStyle.overflowY = 'scroll';
		} else {
			_inStyle.height = '1000%';
			_outStyle.overflowY = 'hidden';
		}
		if (settings.horizontal) {
			_inStyle.width = '1000%';
			_outStyle.overflowX = 'scroll';
		}
		_inStyle['-webkit-transition'] = '.5s';
		_inStyle.transition = '.5s';

		//height and width
		if (settings.horizontal && settings.vertical) {
			_out.onscroll = function () {
				var x = (_out.scrollLeft / settings.horizontalScrollDensity) >> 1,
					y = (_out.scrollTop / settings.verticalScrollDensity) >> 1,
					totalHeight = _out.scrollTop + _out.offsetHeight,
					totalWidth = _out.scrollLeft + _out.offsetWidth;

				if (totalHeight >= (_in.offsetHeight - (_out.offsetHeight / 2))) {
					_inStyle.height = (_in.offsetHeight + (_out.offsetHeight * 2)) + 'px';
				}

				if (totalWidth >= (_in.offsetWidth - (_out.offsetWidth / 2))) {
					_inStyle.width = (_in.offsetWidth + (_out.offsetWidth * 2)) + 'px';
				}

				scroll(x, y);
			};
		}

		//height only
		else if (settings.vertical) {
			_out.onscroll = function () {
				var y = (_out.scrollTop / settings.verticalScrollDensity) >> 1,
					totalHeight = _out.scrollTop + _out.offsetHeight;

				if (totalHeight >= (_in.offsetHeight - (_out.offsetHeight / 2))) {
					_inStyle.height = (_in.offsetHeight + (_out.offsetHeight * 2)) + 'px';
				}

				scroll(y);
			};
		}

		//width only
		else if (settings.horizontal) {
			_out.onscroll = function () {
				var x = (_out.scrollLeft / settings.horizontalScrollDensity) >> 1,
					totalWidth = _out.scrollLeft + _out.offsetWidth;

				if (totalWidth >= (_in.offsetWidth - (_out.offsetWidth / 2))) {
					_inStyle.width = (_in.offsetWidth + (_out.offsetWidth * 2)) + 'px';
				}

				scroll(x);
			};
		}

		_out.appendChild(_in);

		el.parentNode.insertBefore(_out, el);

		this.refresh();

		scroll(0, 0);
	}

	Infiniscroll.prototype = {
		/**
		 * Get scrollBar size
		 * @returns {Object} {height: int, width: int}
		 */
		getScrollBarSize: function () {
			var inner = document.createElement('p'),
				innerStyle = inner.style,
				outer = document.createElement('div'),
				outerStyle = outer.style;

			//setup inner
			innerStyle.width = '100%';
			innerStyle.height = '100%';

			//setup outer
			outerStyle.position = 'absolute';
			outerStyle.width = '100px';
			outerStyle.height = '100px';
			outerStyle.top = '0';
			outerStyle.left = '0';
			outerStyle.visibility = 'hidden';
			outerStyle.overflow = 'hidden';

			outer.appendChild(inner);

			document.body.appendChild(outer);

			var w1 = inner.offsetWidth,
				h1 = inner.offsetHeight;

			outerStyle.overflow = 'scroll';

			var w2 = inner.offsetWidth,
				h2 = inner.offsetHeight;

			if (w1 == w2 && outer.offsetWidth) {
				w2 = outer.offsetWidth;
			}
			if (h1 == h2 && outer.offsetHeight) {
				h2 = outer.offsetHeight;
			}

			document.body.removeChild(outer);

			var w = w1 - w2, h = h1 - h2;

			return {
				width: w || 15,
				height: h || 15
			};
		},
		refresh: function() {
			var el = this.el,
				elStyle = getComputedStyle(el),
				top = el.offsetTop,
				left = el.offsetLeft,
				out = this._out,
				style = out.style,
				scrollSize = this.getScrollBarSize();

			style.left = left + 'px';
			style.top = top + 'px';
			style.width = (el.offsetWidth + (this.settings.vertical ? scrollSize.width : 0) + 'px');
			style.height = (el.offsetHeight + (this.settings.horizontal ? scrollSize.height : 0) + 'px');
			style.margin = elStyle.margin;
			style.padding = elStyle.padding;
			style.borderWidth = elStyle.borderWidth;
			style.borderRadius = elStyle.borderRadius;
		}
	};

	Infiniscroll.defaultSettings = {
		horizontal: true,
		vertical: true,
		scroll: function() {},
		horizontalScrollDensity: 5,
		verticalScrollDensity: 5
	};

	return Infiniscroll;
})(document);