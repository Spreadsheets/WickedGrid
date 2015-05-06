/**
 * The functions container of all functions used in jQuery.sheet
 * @namespace
 */
Sheet.fn = (function(r) {

	r = r || function() {};

	/**
	 * Creates a chart, piggybacks g Raphael JS
	 * @param {Object} o options
	 * x: { legend: "", data: [0]}, //x data
	 * y: { legend: "", data: [0]}, //y data
	 * title: "",
	 * data: [0], //chart data
	 * legend: "",
	 * td: jS.getTd(this.sheet, this.row, this.col), //td container for cell
	 * chart: jQuery('<div class="' + jS.cl.chart + '" />') //chart
	 * @returns {jQuery|HTMLElement}
	 */
	function chart (o) {
		var jS = this.jS,
			loader = jS.s.loader,
			chart = document.createElement('div'),
			td = this.td,
			gR,
			body = document.body;

		body.appendChild(chart);

		function sanitize(v, toNum) {
			if (!v) {
				if (toNum) {
					v = 0;
				} else {
					v = "";
				}
			} else {
				if (toNum) {
					v = arrHelpers.toNumbers(v);
				} else {
					v = arrHelpers.flatten(v);
				}
			}
			return v;
		}

		o = $.extend({
			x:{ legend:"", data:[0]},
			y:{ legend:"", data:[0]},
			title:"",
			data:[0],
			legend:""
		}, o);

		chart.className = jS.cl.chart;
		chart.onmousedown = function () {
			$(td).mousedown();
		};
		chart.onmousemove = function () {
			$(td).mousemove();
			return false;
		};

		o.data = sanitize(o.data, true);
		o.x.data = sanitize(o.x.data, true);
		o.y.data = sanitize(o.y.data, true);
		o.legend = sanitize(o.legend);
		o.x.legend = sanitize(o.x.legend);
		o.y.legend = sanitize(o.y.legend);

		o.legend = (o.legend ? o.legend : o.data);

		var width = loader.getWidth(this.sheetIndex, this.columnIndex),
			height = loader.getHeight(this.sheetIndex, this.rowIndex),
			r = Raphael(chart);

		if (o.title) r.text(width / 2, 10, o.title).attr({"font-size":20});

		switch (o.type) {
			case "bar":
				gR = r.barchart(width / 8, height / 8, width * 0.8, height * 0.8, o.data, o.legend)
					.hover(function () {
						this.flag = r.popup(
							this.bar.x,
							this.bar.y,
							this.bar.value || "0"
						).insertBefore(this);
					}, function () {
						this.flag.animate({
								opacity:0
							}, 300,

							function () {
								this.remove();
							}
						);
					});
				break;
			case "hbar":
				gR = r.hbarchart(width / 8, height / 8, width * 0.8, height * 0.8, o.data, o.legend)
					.hover(function () {
						this.flag = r.popup(this.bar.x, this.bar.y, this.bar.value || "0").insertBefore(this);
					}, function () {
						this.flag.animate({
								opacity:0
							}, 300,
							function () {
								this.remove();
							}
						);
					});
				break;
			case "line":
				gR = r.linechart(width / 8, height / 8, width * 0.8, height * 0.8, o.x.data, o.y.data, {
					nostroke:false,
					axis:"0 0 1 1",
					symbol:"circle",
					smooth:true
				})
					.hoverColumn(function () {
						this.tags = r.set();
						if (this.symbols.length) {
							for (var i = 0, ii = this.y.length; i < ii; i++) {
								this.tags.push(
									r
										.tag(this.x, this.y[i], this.values[i], 160, 10)
										.insertBefore(this)
										.attr([
											{ fill:"#fff" },
											{ fill:this.symbols[i].attr("fill") }
										])
								);
							}
						}
					}, function () {
						this.tags && this.tags.remove();
					});

				break;
			case "pie":
				gR = r.piechart(width / 2, height / 2, (width < height ? width : height) / 2, o.data, {legend:o.legend})
					.hover(function () {
						this.sector.stop();
						this.sector.scale(1.1, 1.1, this.cx, this.cy);

						if (this.label) {
							this.label[0].stop();
							this.label[0].attr({ r:7.5 });
							this.label[1].attr({ "font-weight":800 });
						}
					}, function () {
						this.sector.animate({ transform:'s1 1 ' + this.cx + ' ' + this.cy }, 500, "bounce");

						if (this.label) {
							this.label[0].animate({ r:5 }, 500, "bounce");
							this.label[1].attr({ "font-weight":400 });
						}
					});
				break;
			case "dot":
				gR = r.dotchart(width / 8, height / 8, width * 0.8, height * 0.8, o.x.data, o.y.data, o.data, {
					symbol:"o",
					max:10,
					heat:true,
					axis:"0 0 1 1",
					axisxstep:o.x.data.length - 1,
					axisystep:o.y.data.length - 1,
					axisxlabels:(o.x.legend ? o.x.legend : o.x.data),
					axisylabels:(o.y.legend ? o.y.legend : o.y.data),
					axisxtype:" ",
					axisytype:" "
				})
					.hover(function () {
						this.marker = this.marker || r.tag(this.x, this.y, this.value, 0, this.r + 2).insertBefore(this);
						this.marker.show();
					}, function () {
						this.marker && this.marker.hide();
					});

				break;
		}

		gR.mousedown(function () {
			$(td).mousedown().mouseup();
		});

		body.removeChild(chart);

		return chart;
	}

	var fn = {
		/**
		 * information function
		 * @param v
		 * @returns {Boolean}
		 * @this jSCell
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		ISNUMBER:function (v) {
			var result;
			if (!isNaN(v.valueOf())) {
				result = new Boolean(true);
				result.html = 'TRUE';
				return result;
			}
			result = new Boolean(false);
			result.html = 'FALSE'
			return result;
		},
		/**
		 * information function
		 * @param v
		 * @memberOf Sheet.fn
		 * @returns {*}
		 * @this Sheet.Cell
		 */
		N:function (v) {
			if (v == null) {
				return 0;
			}
			if (v instanceof Date) {
				return v.getTime();
			}
			if (typeof(v) == 'object') {
				v = v.toString();
			}
			if (typeof(v) == 'string') {
				v = parseFloat(v.replace(/[\$,\s]/g, ''));
			}
			if (isNaN(v)) {
				return 0;
			}
			if (typeof(v) == 'number') {
				return v;
			}
			if (v == true) {
				return 1;
			}
			return 0;
		},

		/**
		 * information function
		 * @returns {*|string}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		VERSION:function () {
			return this.jS.version;
		},

		/**
		 * math function
		 * @param v
		 * @returns {number}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		ABS:function (v) {
			return Math.abs(fn.N(v));
		},

		/**
		 * math function
		 * @param value
		 * @param significance
		 * @returns {number}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		CEILING:function (value, significance) {
			significance = significance || 1;
			return (parseInt(value / significance) * significance) + significance;
		},

		/**
		 * math function
		 * @param v
		 * @returns {number}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		EVEN:function (v) {
			v = Math.round(v);
			var even = (v % 2 == 0);
			if (!even) {
				if (v > 0) {
					v++;
				} else {
					v--;
				}
			}
			return v;
		},

		/**
		 * math function
		 * @param v
		 * @returns {number}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		EXP:function (v) {
			return Math.exp(v);
		},

		/**
		 * math function
		 * @param value
		 * @param significance
		 * @returns {*}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		FLOOR:function (value, significance) {
			significance = significance || 1;
			if (
				(value < 0 && significance > 0 )
					|| (value > 0 && significance < 0 )
				) {
				var result = new Number(0);
				result.html = '#NUM';
				return result;
			}
			if (value >= 0) {
				return Math.floor(value / significance) * significance;
			} else {
				return Math.ceil(value / significance) * significance;
			}
		},

		/**
		 * math function
		 * @param v
		 * @returns {number}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		INT:function (v) {
			return Math.floor(fn.N(v));
		},

		/**
		 * math function
		 * @param v
		 * @returns {number}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		LN:function (v) {
			return Math.log(v);
		},

		/**
		 * math function
		 * @param v
		 * @param n
		 * @returns {number}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		LOG:function (v, n) {
			n = n || 10;
			return Math.log(v) / Math.log(n);
		},

		/**
		 * math function
		 * @param v
		 * @returns {*}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		LOG10:function (v) {
			return fn.LOG(v);
		},

		/**
		 * math function
		 * @param x
		 * @param y
		 * @returns {number}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		MOD:function (x, y) {
			var modulus = x % y;
			if (y < 0) {
				modulus *= -1;
			}
			return modulus;
		},

		/**
		 * math function
		 * @param v
		 * @returns {number}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		ODD:function (v) {
			var gTZ = false;
			if (v > 0) {
				v = Math.floor(Math.round(v));
				gTZ = true;
			} else {
				v = Math.ceil(v);
			}

			var vTemp = Math.abs(v);
			if ((vTemp % 2) == 0) { //even
				vTemp++;
			}

			if (gTZ) {
				return vTemp;
			} else {
				return -vTemp;
			}
		},

		/**
		 * math function
		 * @returns {number}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		PI:function () {
			return Math.PI;
		},

		/**
		 * math function
		 * @param x
		 * @param y
		 * @returns {number}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		POWER:function (x, y) {
			return Math.pow(x, y);
		},

		/**
		 * math function
		 * @param v
		 * @returns {number}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		SQRT:function (v) {
			return Math.sqrt(v);
		},

		/**
		 * math function
		 * @returns {number}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		RAND:function () {
			return Math.random();
		},

		/**
		 * math function
		 * @returns {number}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		RND:function () {
			return Math.random();
		},

		/**
		 * math function
		 * @param v
		 * @param decimals
		 * @returns {number}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		ROUND:function (v, decimals) {
			var shift = Math.pow(10, decimals || 0);
			return Math.round(v * shift) / shift;
		},

		/**
		 * math function
		 * @param v
		 * @param decimals
		 * @returns {number}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		ROUNDDOWN:function (v, decimals) {
			var neg = (v < 0);
			v = Math.abs(v);
			decimals = decimals || 0;
			v = Math.floor(v * Math.pow(10, decimals)) / Math.pow(10, decimals);
			return (neg ? -v : v);
		},

		/**
		 * math function
		 * @param v
		 * @param decimals
		 * @returns {number}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		ROUNDUP:function (v, decimals) {
			var neg = (v < 0);
			v = Math.abs(v);
			decimals = decimals || 0;
			v = Math.ceil(v * Math.pow(10, decimals)) / Math.pow(10, decimals);
			return (neg ? -v : v);
		},

		/**
		 * math function
		 * @returns {number}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		SUM:function () {
			var sum = 0,
				values = arrHelpers.flatten(arguments),
				v,
				i = 0,
				max = values.length,
				_isNaN = isNaN;

			for(; i < max; i++) {
				v = values[i];
				if (v === null || v === undefined) continue;
				v = v.valueOf();
				if (!_isNaN(v)) {
					switch (typeof v) {
						case 'string':
							sum += (v * 1);
							break;
						default:
							sum += v;
					}
				}
			}

			return sum;
		},

		/**
		 * math function
		 * @param number
		 * @param digits
		 * @returns {*}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		TRUNC:function (number, digits) {
			digits = digits || 0;
			number = number + '';

			if (digits == 0) {
				return number.split('.').shift();
			}

			if (number.match('.')) {
				if (digits == 1) {
					number = number.substr(0, number.length - 1);
				} else if (digits == -1) {
					number = number.split('.').shift();
					number = number.substr(0, number.length - 1) + '0';
				}
			}

			return number;
		},


		/**
		 * statistical function
		 * @returns {number}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		AVERAGE:function () {
			return fn.SUM.apply(this, arguments) / fn.COUNT.apply(this, arguments);
		},

		/**
		 * statistical function
		 * @returns {number}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		AVG:function () {
			return fn.AVERAGE.apply(this, arguments);
		},

		/**
		 * statistical function
		 * @returns {number}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		COUNT:function () {
			var count = 0,
				v = arrHelpers.toNumbers(arguments),
				i = v.length - 1;

			if (i < 0) {
				return count;
			}

			do {
				if (v[i] !== null) {
					count++;
				}
			} while (i--);

			return count;
		},

		/**
		 * statistical function
		 * @returns {number}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		COUNTA:function () {
			var count = 0,
				v = arrHelpers.flatten(arguments),
				i = v.length - 1;

			if (i < 0) {
				return count;
			}

			do {
				if (v[i]) {
					count++;
				}
			} while (i--);

			return count;
		},

		/**
		 * statistical function
		 * @returns {*}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		MAX:function () {
			var v = arrHelpers.toNumbers(arguments),
				max = v[0],
				i = v.length - 1;

			if (i < 0) {
				return 0;
			}

			do {
				max = (v[i] > max ? v[i] : max);
			} while (i--);

			return max;
		},

		/**
		 * statistical function
		 * @returns {*}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		MIN:function () {
			var v = arrHelpers.toNumbers(arguments),
				min = v[0],
				i = v.length - 1;

			if (i < 0) {
				return 0;
			}

			do {
				min = (v[i] < min ? v[i] : min);
			} while (i--);

			return min;
		},

		/**
		 * string function
		 * @param v
		 * @returns {Number}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		ASC:function (v) {
			return v.charCodeAt(0);
		},
		/**
		 * string function
		 * @param v
		 * @returns {string}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		CHAR:function (v) {
			return String.fromCharCode(v);
		},
		/**
		 * string function
		 * @param v
		 * @returns {String}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		CLEAN:function (v) {
			var exp = new RegExp("[\cG\x1B\cL\cJ\cM\cI\cK\x07\x1B\f\n\r\t\v]","g");
			return v.replace(exp, '');
		},
		/**
		 * string function
		 * @param v
		 * @returns {*}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		CODE:function (v) {
			return fn.ASC(v);
		},
		/**
		 * string function
		 * @returns {String}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		CONCATENATE:function () {
			var arr = arrHelpers.flatten(arguments),
				result = '',
				cell = this;
			jQuery.each(arr, function (i) {
				result += arr[i];
			});
			return result;
		},
		/**
		 * string function
		 * @param v
		 * @param decimals
		 * @param symbol
		 * @returns {Number}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		DOLLAR:function (v, decimals, symbol) {
			decimals = decimals || 2;
			symbol = symbol || '$';

			var result = new Number(v),
				r = fn.FIXED(v, decimals, false);

			if (v >= 0) {
				result.html = symbol + r;
			} else {
				result.html = '(' + symbol + r.slice(1) + ')';
			}
			return result;
		},
		/**
		 * string function
		 * @param v
		 * @param decimals
		 * @param noCommas
		 * @returns {String}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		FIXED:function (v, decimals, noCommas) {
			decimals = (decimals === undefined ? 2 : decimals);
			var multiplier = Math.pow( 10, decimals),
				result,
				v = Math.round( v * multiplier ) / multiplier;



			result = new String(v.toFixed(decimals));
			result.html = Globalize.format(v, 'n' + decimals);

			if (noCommas) {
				result.html = result.html.replace(Globalize.culture().numberFormat[','], '');
			}

			return result;

		},
		/**
		 * string function
		 * @param v
		 * @param numberOfChars
		 * @returns {string}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		LEFT:function (v, numberOfChars) {
			v = v.valueOf().toString();
			numberOfChars = numberOfChars || 1;
			return v.substring(0, numberOfChars);
		},
		/**
		 * string function
		 * @param v
		 * @returns {*}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		LEN:function (v) {
			if (!v) {
				return 0;
			}
			return v.length;
		},
		/**
		 * string function
		 * @param v
		 * @returns {string}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		LOWER:function (v) {
			return v.toLowerCase();
		},

		/**
		 * string function
		 * @param v
		 * @param start
		 * @param end
		 * @returns {*}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		MID:function (v, start, end) {
			if (!v || !start || !end) {
				var result = new Number(0);
				result.html = 'ERROR';
				return result;
			}
			return v.substring(start - 1, end + start - 1);
		},
		/**
		 * string function
		 * @param oldText
		 * @param start
		 * @param numberOfChars
		 * @param newText
		 * @returns {*}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		REPLACE:function (oldText, start, numberOfChars, newText) {
			if (!oldText || !start || !numberOfChars || !newText) {
				var result = new String('');
				result.html = 'ERROR';
				return result;
			}
			var result = oldText.split('');
			result.splice(start - 1, numberOfChars);
			result.splice(start - 1, 0, newText);
			return result.join('');
		},
		/**
		 * string function
		 * @param v
		 * @param times
		 * @returns {string}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		REPT:function (v, times) {
			var result = '';
			for (var i = 0; i < times; i++) {
				result += v;
			}
			return result;
		},
		/**
		 * string function
		 * @param v
		 * @param numberOfChars
		 * @returns {string}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		RIGHT:function (v, numberOfChars) {
			numberOfChars = numberOfChars || 1;
			return v.substring(v.length - numberOfChars, v.length);
		},
		/**
		 * string function
		 * @param find
		 * @param body
		 * @param start
		 * @returns {*}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		SEARCH:function (find, body, start) {
			start = start || 0;
			if (start) {
				body = body.split('');
				body.splice(0, start - 1);
				body = body.join('');
			}
			var i = body.search(find);

			if (i < 0) {
				var result = new String('');
				result.html = '#VALUE!';
				return result;
			}

			return start + (start ? 0 : 1) + i;
		},
		/**
		 * string function
		 * @param text
		 * @param oldText
		 * @param newText
		 * @param nthAppearance
		 * @returns {string}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		SUBSTITUTE:function (text, oldText, newText, nthAppearance) {
			nthAppearance = nthAppearance || 0;
			oldText = new RegExp(oldText, 'g');
			var i = 1;
			text = text.replace(oldText, function (match, contents, offset, s) {
				var result = match;
				if (nthAppearance) {
					if (i >= nthAppearance) {
						result = newText;
					}
				} else {
					result = newText;
				}

				i++;
				return result;
			});
			return text;
		},
		/**
		 * string function
		 * @returns {*}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		TEXT:function (value, formatText) {
			//for the time being
			//TODO: fully implement
			return value;
		},
		/**
		 * string function
		 * @param v
		 * @returns {string}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		UPPER:function (v) {
			return v.toUpperCase();
		},
		/**
		 * string function
		 * @param v
		 * @returns {*}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		VALUE:function (v) {
			if (jQuery.isNumeric(v)) {
				return v *= 1;
			} else {
				var result = new String('');
				result.html = '#VALUE!';
				return result;
			}
		},

		/**
		 * date/time function
		 * @returns {Date}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		NOW:function () {
			var today = new Date();
			today.html = dates.toString(today);
			return today;
		},
		/**
		 * date/time function
		 * @returns {Number}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		TODAY:function () {
			var today = new Date(),
				result = new Number(dates.toCentury(today) - 1);
			result.html = dates.toString(today, 'd');
			return result;
		},
		/**
		 * date/time function
		 * @param weeksBack
		 * @returns {Date}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		WEEKENDING:function (weeksBack) {
			var date = new Date();
			date = new Date(
				date.getFullYear(),
				date.getMonth(),
				date.getDate() + 5 - date.getDay() - ((weeksBack || 0) * 7)
			);

			date.html = dates.toString(date, 'd');
			return date;
		},
		/**
		 * date/time function
		 * @param date
		 * @param returnValue
		 * @returns {number}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		WEEKDAY:function (date, returnValue) {
			date = dates.get(date);
			var day = date.getDay();

			returnValue = (returnValue ? returnValue : 1);
			switch (returnValue) {
				case 3:
					switch (day) {
						case 0:return 7;
						case 1:return 1;
						case 2:return 2;
						case 3:return 3;
						case 4:return 4;
						case 5:return 5;
						case 6:return 6;
					}
					break;
				case 2:
					switch (day) {
						case 0:return 6;
						case 1:return 0;
						case 2:return 1;
						case 3:return 2;
						case 4:return 3;
						case 5:return 4;
						case 6:return 5;
					}
					break;
				case 1:
					day++;
					break;
			}

			return day;
		},
		/**
		 * date/time function
		 * @param date
		 * @returns {number}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		WEEKNUM:function (date) {//TODO: implement week starting
			date = dates.get(date);
			return dates.week(date) + 1;
		},
		/**
		 * date/time function
		 * @param date
		 * @returns {number}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		YEAR:function (date) {
			date = dates.get(date);
			return date.getFullYear();
		},
		/**
		 * date/time function
		 * @param year
		 * @param month
		 * @param day
		 * @returns {number}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		DAYSFROM:function (year, month, day) {
			return Math.floor((new Date() - new Date(year, (month - 1), day)) / dates.dayDiv);
		},
		/**
		 * date/time function
		 * @param v1
		 * @param v2
		 * @returns {number}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		DAYS:function (v1, v2) {
			var date1 = dates.get(v1),
				date2 = dates.get(v2),
				ONE_DAY = 1000 * 60 * 60 * 24;
			return Math.round(Math.abs(date1.getTime() - date2.getTime()) / ONE_DAY);
		},
		/**
		 * date/time function
		 * @param date
		 * @returns {number}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		DAY:function (date) {
			date = dates.get(date);
			return date.getDate();
		},
		/**
		 * date/time function
		 * @param date1
		 * @param date2
		 * @param method
		 * @returns {number}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		DAYS360:function (date1, date2, method) {
			date1 = dates.get(date1);
			date2 = dates.get(date2);

			var startDate = date1.getDate(),
				endDate = date2.getDate(),
				startIsLastDay = dates.isLastDayOfMonth(date1),
				endIsLastDay = dates.isLastDayOfMonth(date2),
				monthCount = dates.diffMonths(date1, date2);

			if (method) {//Euro method
				startDate = Math.min(startDate, 30);
				endDate = Math.min(endDate, 30);
			} else { //Standard
				if (startIsLastDay) {
					startDate = 30;
				}
				if (endIsLastDay) {
					if (startDate < 30) {
						monthCount++;
						endDate = 1;
					} else {
						endDate = 30;
					}
				}
			}

			return (monthCount * 30) + (endDate - startDate);
		},
		/**
		 * date/time function
		 * @param year
		 * @param month
		 * @param day
		 * @returns {Number}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		DATE:function (year, month, day) {
			var date = new Date(year, month - 1, day),
				result = new Number(dates.toCentury(date));
			result.html = dates.toString(date, 'd');

			return result;
		},
		/**
		 * date/time function
		 * @param date
		 * @returns {Number}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		DATEVALUE:function (date) {
			date = dates.get(date);
			var result = new Number(dates.toCentury(date));
			result.html = dates.toString(date, 'd');
			return result;
		},
		/**
		 * date/time function
		 * @param date
		 * @param months
		 * @returns {Number}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		EDATE:function (date, months) {
			date = dates.get(date);
			date.setMonth(date.getMonth() + months);
			var result = new Number(dates.toCentury(date));
			result.html = dates.toString(date, 'd');
			return result;
		},
		/**
		 * date/time function
		 * @param date
		 * @param months
		 * @returns {Number}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		EOMONTH:function (date, months) {
			date = dates.get(date);
			date.setMonth(date.getMonth() + months + 1);
			date = new Date(date.getFullYear(), date.getMonth(), 0);
			var result = new Number(dates.toCentury(date));
			result.html = dates.toString(date, 'd');
			return result;
		},
		/**
		 * date/time function
		 * @param time
		 * @returns {*}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		HOUR:function (time) {
			time = times.fromMath(time);
			return time.hour;
		},
		/**
		 * date/time function
		 * @param time
		 * @returns {*}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		MINUTE:function (time) {
			return times.fromMath(time).minute;
		},
		/**
		 * date/time function
		 * @param date
		 * @returns {number}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		MONTH:function (date) {
			date = dates.get(date);
			return date.getMonth() + 1;
		},
		/**
		 * date/time function
		 * @param time
		 * @returns {*}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		SECOND:function (time) {
			return times.fromMath(time).second;
		},
		/**
		 * date/time function
		 * @param hour
		 * @param minute
		 * @param second
		 * @returns {number}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		TIME:function (hour, minute, second) {
			second = (second ? second : 0);
			minute = (minute ? minute : 0);
			hour = (hour ? hour : 0);

			if (second && second > 60) {
				var minuteFromSecond = (((second / 60) + '').split('.')[0]) * 1;
				second = second - (minuteFromSecond * 60);
				minute += minuteFromSecond;
			}

			if (minute && minute > 60) {
				var hourFromMinute = (((minute / 60) + '').split('.')[0]) * 1;
				minute = minute - (hourFromMinute * 60);
				hour += hourFromMinute;
			}

			var millisecond = (hour * 60 * 60 * 1000) + (minute * 60 * 1000) + (second * 1000);

			return millisecond / dates.dayDiv;
		},
		/**
		 * date/time function
		 * @param time
		 * @returns {*}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		TIMEVALUE:function (time) {
			if (!isNaN(time)) {
				return time;
			}
			if (/([0]?[1-9]|1[0-2])[:][0-5][0-9]([:][0-5][0-9])?[ ]?(AM|am|aM|Am|PM|pm|pM|Pm)/.test(time)) {
				return times.fromString(time, true);
			} else if (/([0]?[0-9]|1[0-9]|2[0-3])[:][0-5][0-9]([:][0-5][0-9])?/.test(time)) {
				return times.fromString(time);
			}
			return 0;
		},
		/**
		 * date/time function
		 * @param startDate
		 * @param days
		 * @param holidays
		 * @returns {Number}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		WORKDAY:function (startDate, days, holidays) {
			var workDays = {1:true, 2:true, 3:true, 4:true, 5:true},
				startDate = dates.get(startDate),
				days = (days && !isNaN(days) ? days : 0),
				dayCounter = 0,
				daysSoFar = 0,
				workingDate = startDate,
				result;

			if (holidays) {
				if (!jQuery.isArray(holidays)) {
					holidays = [holidays];
				}
				holidays = arrHelpers.flatten(holidays);
				var holidaysTemp = {};
				jQuery.each(holidays, function (i) {
					if (holidays[i]) {
						holidaysTemp[dates.toString(dates.get(holidays[i]), 'd')] = true;
					}
				});
				holidays = holidaysTemp;
			} else {
				holidays = {};
			}

			while (daysSoFar < days) {
				workingDate = new Date(workingDate.setDate(workingDate.getDate() + 1));
				if (workDays[workingDate.getDay()]) {
					if (!holidays[dates.toString(workingDate, 'd')]) {
						daysSoFar++;
					}
				}
				dayCounter++;
			}

			result = new Number(dates.toCentury(workingDate));
			result.html = dates.toString(workingDate, 'd');
			return result;
		},
		/**
		 * date/time function
		 * @param startDate
		 * @param endDate
		 * @param basis
		 * @returns {*}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		YEARFRAC:function (startDate, endDate, basis) {
			startDate = dates.get(startDate);
			endDate = dates.get(endDate);

			if (!startDate || !endDate) {
				var result = new String('');
				result.html = '#VALUE!';
				return result;
			}

			basis = (basis ? basis : 0);
			this.html = [];

			var numerator = dates.diff(startDate, endDate, basis),
				denom = dates.calcAnnualBasis(startDate, endDate, basis);
			return numerator / denom;
		},

		/**
		 * logical function
		 * @returns {*}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		AND:function () {
			var arg,
				i = 0,
				max = arguments.length;

			for (;i < max; i++) {
				arg = arguments[i];
				if (arg === undefined || (arg.valueOf !== undefined && arg.valueOf() != true) || arg != true) {
					return fn.FALSE();
				}
			}

			return fn.TRUE();
		},
		/**
		 * logical function
		 * @returns {Boolean}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		FALSE:function () {
			var result = new Boolean(false);
			result.html = 'FALSE';
			return result;
		},
		/**
		 * logical function
		 * @param expression
		 * @param resultTrue
		 * @param resultFalse
		 * @returns {*}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		IF:function (expression, resultTrue, resultFalse) {
			var primitiveExpression = expression.valueOf(),
				str;

			switch (typeof primitiveExpression) {
				case 'boolean':
					if (primitiveExpression === true) {
						return resultTrue;
					} else {
						return resultFalse;
					}
					break;
				case 'number':
					if (primitiveExpression !== 0) {
						return resultTrue;
					} else {
						return resultFalse;
					}
					break;
				case 'string':
					str = primitiveExpression.toUpperCase();
					if (str === 'TRUE') {
						return resultTrue;
					} else if (str === 'FALSE') {
						return resultFalse;
					} else if (str.replace(/ /g, '').length > 0) {
						return resultTrue;
					}
					break;
			}

			if (primitiveExpression) {
				return resultTrue;
			}

			return resultTrue;
		},
		/**
		 * logical function
		 * @param v
		 * @returns {Boolean}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		NOT:function (v) {
			var result;
			if (!v.valueOf()) {
				result = new Boolean(true);
				result.html = 'TRUE';
			} else {
				result = new Boolean(false);
				result.html = 'FALSE';
			}

			return result;
		},
		/**
		 * logical function
		 * @returns {Boolean}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		OR:function () {
			var args = arguments,
				result,
				i = args.length - 1,
				v;

			if (i > -1) {
				do {
					v = args[i].valueOf();
					if (v) {
						result = new Boolean(true);
						result.html = 'TRUE';
						return result;
					}
				} while (i--);
			}
			result = new Boolean(false);
			result.html = 'FALSE';
			return result;
		},
		/**
		 * logical function
		 * @returns {Boolean}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		TRUE:function () {
			var result = new Boolean(true);
			result.html = 'TRUE';
			return result;
		},
		/**
		 * logical function
		 * @param left
		 * @param right
		 * @returns {Boolean}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		GREATER:function(left, right) {
			var result;

			if (left > right) {
				result = new Boolean(true);
				result.html = 'TRUE';
			} else {
				result = new Boolean(false);
				result.html = 'FALSE';
			}

			return result;
		},
		/**
		 * logical function
		 * @param left
		 * @param right
		 * @returns {Boolean}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		LESS:function(left, right) {
			var result;

			if (left < right) {
				result = new Boolean(true);
				result.html = 'TRUE';
			} else {
				result = new Boolean(false);
				result.html = 'FALSE';
			}

			return result;
		},
		/**
		 * logical function
		 * @param left
		 * @param right
		 * @returns {Boolean}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		EQUAL: function(left, right) {
			var result,
				leftAsString,
				rightAsString;

			if (left === undefined || left === null) left = '';
			if (right === undefined || right === null) right = '';

			//We need to cast, because an internal value may just be a primitive
			leftAsString = left + '';
			rightAsString = right + '';

			if (leftAsString == rightAsString) {
				result = new Boolean(true);
				result.html = 'TRUE';
			} else {
				result = new Boolean(false);
				result.html = 'FALSE';
			}

			return result;
		},
		/**
		 * logical function
		 * @param left
		 * @param right
		 * @returns {Boolean}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		GREATER_EQUAL:function(left, right) {
			var result;

			if (left >= right) {
				result = new Boolean(true);
				result.html = 'TRUE';
			} else {
				result = new Boolean(false);
				result.html = 'FALSE';
			}

			return result;
		},
		/**
		 * logical function
		 * @param left
		 * @param right
		 * @returns {Boolean}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		LESS_EQUAL:function(left, right) {
			var result;

			if (left <= right) {
				result = new Boolean(true);
				result.html = 'TRUE';
			} else {
				result = new Boolean(false);
				result.html = 'FALSE';
			}

			return result;
		},

		/**
		 * html function
		 * @param v
		 * @returns {String}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		IMG:function (v) {
			var result = new String('');
			result.html = $(document.createElement('img'))
				.attr('src', v);
			return result;
		},
		/**
		 * html function
		 * @param v
		 * @returns {*}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		TRIM:function (v) {
			if (typeof(v) == 'string') {
				v = $.trim(v);
			}
			return v;
		},
		/**
		 * html function
		 * @param link
		 * @param [name]
		 * @returns {String}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		HYPERLINK:function (href, name) {
			name = name || 'LINK';
			var result = new String(name.valueOf()),
				link = document.createElement('a');
			link.setAttribute('href', href);
			link.setAttribute('target', '_new');
			link.innerText = link.textContent = name;

			result.html = link;

			return result;
		},
		/**
		 * html function
		 * @returns {*}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		DROPDOWN:function () {
			var cell = this,
				jS = this.jS,
				td = this.td,
				value,
				v,
				html,
				select,
				id,
				result,
				i = 0,
				max;

			if (td !== null) {
				$(td).children().detach();
				html = cell.value.html;
			}

			if (html === undefined || cell.needsUpdated || html.length < 1) {
				v = arrHelpers.flatten(arguments);
				v = arrHelpers.unique(v);

				if (this.id !== null) {
					id = this.id + '-dropdown';
				} else if (td !== null) {
					id = "dropdown" + this.sheetIndex + "_" + this.rowIndex + "_" + this.columnIndex + '_' + jS.I;
				}

				select = document.createElement('select');
				select.setAttribute('name', id);
				select.setAttribute('id', id);
				select.className = 'jSDropdown';
				select.cell = this;

				select.onmouseup = function() {
					if (this.cell.td !== null) {
						jS.cellEdit(this.cell.td);
					}
				};
				select.onchange = function () {
					value = new String(this.value);
					value.html = select;
					value.cell = cell;
					cell.value = value;
					cell.setNeedsUpdated(false);
					jS.resolveCell(cell);
					jS.trigger('sheetCellEdited', [cell]);
				};

				max = (v.length <= 50 ? v.length : 50);
				for (; i < max; i++) {
					if (v[i]) {
						var opt = document.createElement('option');
						opt.setAttribute('value', v[i]);
						opt.text = opt.innerText = v[i];
						select.appendChild(opt);
					}
				}

				if (!jS.s.editable) {
					select.setAttribute('disabled', true);
				} else {
					jS.s.parent.bind('sheetKill', function() {
						td.innerText = td.textContent = cell.value.valueOf();
					});
				}

				select.value = cell.value || v[0];
			}

			if (typeof cell.value !== 'object') {
				result = new String(cell.value);
			} else {
				result = cell.value;
			}

			result.html = select;
			return result;
		},
		/**
		 * html function
		 * @returns {*}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		RADIO:function () {
			var cell = this,
				jS = this.jS,
				td = this.td,
				v,
				value,
				html,
				radio,
				id,
				result;

			if (td !== null) {
				html = cell.value.html;
				$(td).children().detach();
			}

			if (html === undefined || html.length < 1 || cell.needsUpdated) {
				v = arrHelpers.flatten(arguments);
				v = arrHelpers.unique(v);

				if (this.id !== null) {
					id = this.id + '-radio';
				} else if (td !== null) {
					id = "radio" + this.sheetIndex + "_" + this.rowIndex + "_" + this.columnIndex + '_' + jS.I;
				}

				html = document.createElement('span');
				html.className = 'jSRadio';
				html.onmousedown = function () {
					if (this.cell.td !== null) {
						jS.cellEdit(cell.td);
					}
				};
				html.cell = cell;

				for (var i = 0; i < (v.length <= 25 ? v.length : 25); i++) {
					if (v[i]) {
						var input = document.createElement('input'),
							label = document.createElement('span');

						input.setAttribute('type', 'radio');
						input.setAttribute('name', id);
						input.className = id;
						input.value = v[i];
						if (!jS.s.editable) {
							input.setAttribute('disabled', 'disabled');
						}
						input.onchange = function() {
							value = new String(this.value);
							value.html = html;
							value.cell = cell;
							cell.value = value;
							cell.setNeedsUpdated(false);
							jS.resolveCell(cell);
							jS.trigger('sheetCellEdited', [cell]);
						};

						if (v[i].valueOf() === cell.value.valueOf()) {
							input.checked = true;
						}
						label.textContent = label.innerText = v[i];
						html.appendChild(input);
						label.input = input;
						label.onmousedown = function () {
							$(this.input).click();
						};
						html.appendChild(label);
						html.appendChild(document.createElement('br'));
					}
				}

				jS.s.parent.bind('sheetKill', function() {
					td.textContent = td.innerText = cell.value.valueOf();
				});
			}

			if (typeof cell.value !== 'object') {
				result = new String(cell.value);
			} else {
				result = cell.value;
			}

			result.html = html;

			return result;
		},
		/**
		 * html function
		 * @param v
		 * @returns {*}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		CHECKBOX:function (v) {
			if ($.isArray(v)) v = v[0];

			var cell = this,
				jS = this.jS,
				td = this.td,
				html,
				label,
				checkbox,
				id,
				value,
				result;

			if (td !== null) {
				html = cell.value.html;
				$(td).children().detach();
			}

			if (html === undefined || html.length < 1 || cell.needsUpdated) {
				if (this.id !== null) {
					id = this.id + '-checkbox';
				} else if (td !== null) {
					id = "checkbox" + this.sheetIndex + "_" + this.rowIndex + "_" + this.columnIndex + '_' + jS.I;
				}

				checkbox = document.createElement('input');
				checkbox.setAttribute('type', 'checkbox');
				checkbox.setAttribute('name', id);
				checkbox.setAttribute('id', id);
				checkbox.className = id;
				checkbox.value = v;
				checkbox.onchange = function () {
					if (this.checked) {
						value = new String(v);
					} else {
						value = new String('');
					}
					value.html = html;
					value.cell = cell;
					cell.value = value;
					cell.setNeedsUpdated(false);
					jS.resolveCell(cell);
					jS.trigger('sheetCellEdited', [cell]);
				};

				if (!jS.s.editable) {
					checkbox.setAttribute('disabled', 'true');
				} else {
					jS.s.parent.bind('sheetKill', function() {
						cell.value = (cell.value == 'true' || checkbox.checked ? v : '');
						if (cell.td !== null) {
							cell.td.innerText = cell.td.textContent = cell.value.valueOf();
						}
					});
				}

				html = document.createElement('span');
				html.className='jSCheckbox';
				html.appendChild(checkbox);
				label = document.createElement('span');
				label.textContent = label.innerText = v;
				html.appendChild(label);
				html.appendChild(document.createElement('br'));
				html.onmousedown = function () {
					if (this.cell.td !== null) {
						jS.cellEdit(this.cell.td);
					}
				};
				html.cell = cell;

				switch (cell.value.valueOf()) {
					case v.valueOf():
					case 'true':
						checkbox.checked = true;
				}
			}

			//when spreadsheet initiates, this will be the value, otherwise we are dependent on the checkbox being checked
			if (
				cell.value === 'true'
				|| checkbox.checked
			) {
				result = new String(v);
			}

			//if no value, than empty string
			else {
				result = new String('');
			}

			result.html = html;

			return result;
		},
		/**
		 * html function
		 * @param values
		 * @param legend
		 * @param title
		 * @returns {String}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		BARCHART:function (values, legend, title) {
			var result = new String('');
			result.html = chart.call(this, {
				type:'bar',
				data:values,
				legend:legend,
				title:title
			});
			return result;
		},
		/**
		 * html function
		 * @param values
		 * @param legend
		 * @param title
		 * @returns {String}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		HBARCHART:function (values, legend, title) {
			var result = new String('');
			result.html = chart.call(this, {
				type:'hbar',
				data:values,
				legend:legend,
				title:title
			});
			return result;
		},
		/**
		 * html function
		 * @param valuesX
		 * @param valuesY
		 * @returns {String}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		LINECHART:function (valuesX, valuesY) {
			var result = new String('');
			result.html = chart.call(this, {
				type:'line',
				x:{
					data:valuesX
				},
				y:{
					data:valuesY
				},
				title:""
			});
			return result;
		},
		/**
		 * html function
		 * @param values
		 * @param legend
		 * @param title
		 * @returns {String}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		PIECHART:function (values, legend, title) {
			var result = new String('');
			result.html = chart.call(this, {
				type:'pie',
				data:values,
				legend:legend,
				title:title
			});
			return result;
		},
		/**
		 * html function
		 * @param valuesX
		 * @param valuesY
		 * @param values
		 * @param legendX
		 * @param legendY
		 * @param title
		 * @returns {String}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		DOTCHART:function (valuesX, valuesY, values, legendX, legendY, title) {
			var result = new String('');
			result.html = chart.call(this, {
				type:'dot',
				data:(values ? values : valuesX),
				x:{
					data:valuesX,
					legend:legendX
				},
				y:{
					data:(valuesY ? valuesY : valuesX),
					legend:(legendY ? legendY : legendX)
				},
				title:title
			});
			return result;
		},
		/**
		 * html function
		 * @param v
		 * @returns {*}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		CELLREF:function (v) {
			return (this.jS.spreadsheets[v] ? this.jS.spreadsheets[v] : 'Cell Reference Not Found');
		},


		/**
		 * cell function
		 * @param value
		 * @param range
		 * @param indexNumber
		 * @param notExactMatch
		 * @returns {*}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		HLOOKUP:function (value, range, indexNumber, notExactMatch) {

			if (value === undefined) return null;

			var jS = this.jS,
				found,
				foundCell,
				result = '',
				i = 0,
				max = range.length;

			indexNumber = indexNumber || 1;
			notExactMatch = notExactMatch !== undefined ? notExactMatch : true;

			if (value !== undefined || ((isNaN(value) && value != '#REF!') || value.length === 0)) {

				for(; i < max; i++) {
					if (range[i].toString() == value) {
						found = range[i];
						break;
					}
				}

			} else {
				arrHelpers.getClosestNum(value, range, function(closest, i) {
					if (notExactMatch) {
						found = closest;
					} else if (closest == value) {
						found = closest;
					}
				});
			}

			if (found !== undefined) {
				foundCell = found.cell;
				foundCell = jS.getCell(foundCell.sheetIndex, indexNumber, foundCell.columnIndex);
				if (foundCell !== null) {
					result = foundCell.updateValue();
				} else {
					result = '';
				}
			} else {
				result = new String();
				result.html = '#N/A';
			}

			return result;
		},
		/**
		 * cell function
		 * @param value
		 * @param range
		 * @param indexNumber
		 * @param notExactMatch
		 * @returns {*}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		VLOOKUP:function (value, range, indexNumber, notExactMatch) {

			if (value === undefined) return null;

			var jS = this.jS,
				found,
				foundCell,
				result,
				i = 0,
				max = range.length;

			notExactMatch = notExactMatch !== undefined ? notExactMatch : true;


			if ((isNaN(value) && value != '#REF!') || value.length === 0) {
				for(; i < max; i++) {
					if (range[i].toString() == value) {
						found = range[i];
						break;
					}
				}

			} else {
				arrHelpers.getClosestNum(value, range, function(closest, i) {
					if (notExactMatch) {
						found = closest;
					} else if (closest == value) {
						found = closest;
					}
				});
			}

			if (found !== undefined) {
				foundCell = found.cell;
				foundCell = jS.getCell(foundCell.sheetIndex, foundCell.rowIndex, indexNumber);
				if (foundCell !== null) {
					result = foundCell.value;
				} else {
					result = '';
				}
			} else {
				result = new String();
				result.html = '#N/A';
			}

			return result;
		},

		/**
		 * Gets the adjacent value for the reference array. Ip- reference array
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		TRANSPOSE: function (range) {
			var i = 0,
				jS = this.jS,
				sheetIndex = this.sheetIndex,
				firstValue = range[0],
				firstCell = firstValue.cell,
				lastValue = range[range.length - 1],
				lastCell = lastValue.cell,
				startRow = firstCell.rowIndex,
				startColumn = firstCell.columnIndex,
				rowIndex,
				columnIndex,
				cell,
				cells = [],
				transposedCell,
				transposedCells = [],
				value,
				max = range.length,
				error,
				isOverwrite = false;

			for(;i<max;i++) {
				value = range[i];
				cell = value.cell;
				rowIndex = this.rowIndex + (cell.columnIndex - startColumn);
				columnIndex = this.columnIndex + (cell.rowIndex - startRow);

				transposedCell = jS.getCell(this.sheetIndex, rowIndex, columnIndex);
				if (transposedCell !== null && transposedCell !== this) {
					if (transposedCell.value != '') {
						isOverwrite = true;
					}
					transposedCells.push(transposedCell);
					cells.push(cell);
				}
			}

			if (isOverwrite) {
				error = new String('');
				error.html = '#REF!';
				return error;
			}

			i = 0;
			max = transposedCells.length;
			for(;i<max;i++) {
				transposedCell = transposedCells[i];
				if (transposedCell !== this) {
					cell = cells[i];
					transposedCell.setNeedsUpdated();
					transposedCell.defer = cell;
					transposedCell.updateValue();
					transposedCell.addDependency(this);
				}
			}

			return firstValue.valueOf();
		},
		/**
		 * cell function
		 * @param col
		 * @returns {*}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		THISROWCELL:function (col) {
			var jS = this.jS;

			if (isNaN(col)) {
				col = jS.cellHandler.columnLabelIndex(col);
			}
			return jS.getCell(this.sheetIndex, this.rowIndex, col).updateValue();
		},
		/**
		 * cell function
		 * @param row
		 * @returns {*}
		 * @memberOf Sheet.fn
		 * @this Sheet.Cell
		 */
		THISCOLCELL:function (row) {
			var jS = this.jS;
			return jS.getCell(this.sheetIndex, row, this.columnIndex).updateValue();
		}
	};

	return fn;
})(window.Raphael);