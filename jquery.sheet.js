/**
 * @project jQuery.sheet() The Ajax Spreadsheet - https://github.com/Spreadsheets/jQuery.sheet
 * @author RobertLeePlummerJr@gmail.com
 * Licensed under MIT
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
 * Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
 * OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

/**
 * @namespace
 * @type {Object|Function}
 */
var jQuery = window.jQuery || {};
var Sheet = (function($, document, window, Date, String, Number, Boolean, Math, RegExp, Error) {
	"use strict";

	var Sheet = {
	Loader: {},
	Plugin: {},

	defaultTheme: 0,
	themeRollerTheme: 0,
	bootstrapTheme: 1,
	customTheme: 2,

	excelSelectModel: 0,
	googleDriveSelectModel: 1,
	openOfficeSelectModel: 2,

	defaultColumnWidth: 120,
	defaultRowHeight: 20,

	domRows: 40,
	domColumns: 35,

	calcStack: 0,

	formulaParserUrl: '../parser/formula/formula.js',
	threadScopeUrl: '../Sheet/threadScope.js',

	defaultFormulaParser: null,

	spareFormulaParsers: [],

	formulaParser: function(callStack) {
		var formulaParser;
		//we prevent parsers from overwriting each other
		if (callStack > -1) {
			//cut down on un-needed parser creation
			formulaParser = this.spareFormulaParsers[callStack];
			if (formulaParser === undefined) {
				formulaParser = this.spareFormulaParsers[callStack] = Formula();
			}
		}

		//use the sheet's parser if there aren't many calls in the callStack
		else {
			formulaParser = Sheet.defaultFormulaParser;
		}

		formulaParser.yy.types = [];

		return formulaParser;
	},

	parseFormulaSlow: function(formula, callback) {
		if (Sheet.defaultFormulaParser === null) {
			Sheet.defaultFormulaParser = Formula();
		}

		var formulaParser = Sheet.formulaParser(Sheet.calcStack);
		callback(formulaParser.parse(formula));
	},

	parseFormula: function(formula, callback) {
		var thread = Sheet.thread();

		if (thread.busy) {
			thread.stash.push(function() {
				thread.busy = true;
				thread.parseFormula(formula, function(parsedFormula) {
					thread.busy = false;
					callback(parsedFormula);
					if (thread.stash.length > 0) {
						thread.stash.shift()();
					}
				});
			});
		} else {
			thread.busy = true;
			thread.parseFormula(formula, function(parsedFormula) {
				thread.busy = false;
				callback(parsedFormula);
				if (thread.stash.length > 0) {
					thread.stash.shift()();
				}
			});
		}
	}
};/**
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
})(window.Raphael);/**
 * @namespace
 * @type {Object}
 * @name jQuery()
 */
$.fn.extend({
	/**
	 * @memberOf jQuery()
	 * @function
	 * @returns {jQuery()}
	 * @description
	 * <pre>
	 * The jQuery.sheet plugin
	 * Supports the following jQuery events
	 *
	 * sheetAddRow - occurs just after a row has been added
	 *  arguments: e (jQuery event), jS, i (row index), isBefore, qty
	 *	  example:
	 *		  $(obj).sheet({
	 *			  sheetAddRow: function(e, jS, i, isBefore, qty) {
	 *
	 *			  }
	 *		  });
	 *	  or:
	 *		  $(obj).bind('sheetAddRow', function(e, jS, i, isBefore, qty) {
	 *
	 *		  })
	 *		  .sheet();
	 *
	 * sheetAddColumn - occurs just after a column has been added
	 *	  arguments: e (jQuery event), jS, i (column index), isBefore, qty
	 *	  example:
	 *		  $(obj).sheet({
	 *			  sheetAddColumn: function(e, jS, i, isBefore, qty) {
	 *
	 *			  }
	 *		  });
	 *	  or:
	 *		  $(obj).bind('sheetAddColumn', function(e, jS, i, isBefore, qty) {
	 *
	 *		  })
	 *		  .sheet();
	 *
	 * sheetSwitch - occurs after a spreadsheet has been switched
	 *	  arguments: e (jQuery event), jS (jQuery.sheet instance), i (spreadsheet index)
	 *	  example:
	 *		  $(obj).sheet({
	 *			  sheetSwitch: function(e, jS, i) {
	 *
	 *			  }
	 *		  });
	 *	  or:
	 *		  $(obj).bind('sheetSwitch', function(e, jS, i) {
	 *
	 *		  })
	 *		  .sheet();
	 *
	 * sheetRename - occurs just after a spreadsheet is renamed, to obtain new title jS.obj.table().attr('title');
	 *	  arguments: e (jQuery event), jS (jQuery.sheet instance), i (spreadsheet index)
	 *	  example:
	 *		  $(obj).sheet({
	 *			  sheetRename: function(e, jS, i) {
	 *
	 *			  }
	 *		  });
	 *	  or:
	 *		  $(obj).bind('sheetRename', function(e, jS, i) {
	 *
	 *		  })
	 *		  .sheet();
	 *
	 * sheetTabSortStart - occurs at the beginning of a sort for moving a spreadsheet around in order
	 *	  arguments: e (jQuery event), jS (jQuery.sheet instance), E (jQuery sortable event), ui, (jQuery ui event)
	 *	  example:
	 *		  $(obj).sheet({
	 *			  sheetTabSortStart: function(e, jS, E, ui) {
	 *
	 *			  }
	 *		  });
	 *	  or:
	 *		  $(obj).bind('sheetTabSortStart',NPER: function(e, jS, E, ui) {
	 *
	 *		  })
	 *		  .sheet();
	 *
	 * sheetTabSortUpdate - occurs after a sort of a spreadsheet has been completed
	 *	  arguments: e (jQuery event), jS (jQuery.sheet instance), E (jQuery sotable event), ui, (jQuery ui event), i (original index)
	 *	  example:
	 *		  $(obj).sheet({
	 *			  sheetTabSortUpdate: function(e, jS, E, ui) {
	 *
	 *			  }
	 *		  });
	 *	  or:
	 *		  $(obj).bind('sheetTabSortUpdate', function(e, jS, E, ui) {
	 *
	 *		  })
	 *		  .sheet();
	 *
	 * sheetFormulaKeydown - occurs just after keydown on either inline or static formula
	 *	  arguments: e (jQuery event)
	 *	  example:
	 *		  $(obj).sheet({
	 *			  sheetFormulaKeydown: function(e) {
	 *
	 *			  }
	 *		  });
	 *	  or:
	 *		  $(obj).bind('sheetFormulaKeydown') {
	 *
	 *		  })
	 *		  .sheet();
	 * sheetCellEdit - occurs just before a cell has been started to edit
	 *	  arguments: e (jQuery event), jS (jQuery.sheet instance), cell (jQuery.sheet.instance.spreadsheet cell)
	 *	  example:
	 *		  $(obj).sheet({
	 *			  sheetCellEdit: function(e, jS, cell) {
	 *
	 *			  }
	 *		  });
	 *	  or:
	 *		  $(obj).bind('sheetCellEdit', function(e, jS, cell) {
	 *
	 *		  })
	 *		  .sheet();
	 *
	 * sheetCellEdited - occurs just after a cell has been updated
	 *	  arguments: e (jQuery event), jS (jQuery.sheet instance), cell (jQuery.sheet.instance.spreadsheet cell)
	 *	  example:
	 *		  $(obj).sheet({
	 *			  sheetCellEdited: function(e, jS, cell) {
	 *
	 *			  }
	 *		  });
	 *	  or:
	 *		  $(obj).bind('sheetCellEdited', function(e, jS, cell) {
	 *
	 *		  })
	 *		  .sheet();
	 *
	 * sheetCalculation - occurs just after a spreadsheet has been fully calculated
	 *	  arguments: e (jQuery event), jS (jQuery.sheet instance)
	 *	  example:
	 *		  $(obj).sheet({
	 *			  sheetCalculation: function(e, jS) {
	 *
	 *			  }
	 *		  });
	 *	  or:
	 *		  $(obj).bind('sheetCalculation', function(e, jS) {
	 *
	 *		  })
	 *		  .sheet();
	 *
	 * sheetAdd - occurs just after a spreadsheet has been added
	 *	  arguments: e (jQuery event), jS (jQuery.sheet instance), i (new sheet index)
	 *	  example:
	 *		  $(obj).sheet({
	 *			  sheetAdd: function(e, jS, i) {
	 *
	 *			  }
	 *		  });
	 *	  or:
	 *		  $(obj).bind('sheetAdd', function(e, jS, i) {
	 *
	 *		  })
	 *		  .sheet();
	 *
	 * sheetDelete - occurs just after a spreadsheet has been deleted
	 *	  arguments: e (jQuery event), jS (jQuery.sheet instance), i (old sheet index)
	 *	  example:
	 *		  $(obj).sheet({
	 *			  sheetDelete: function(e, jS, i) {
	 *
	 *			  }
	 *		  });
	 *	  or:
	 *		  $(obj).bind('sheetDelete', function(e, jS, i) {
	 *
	 *		  })
	 *		  .sheet();
	 *
	 * sheetDeleteRow - occurs just after a row has been deleted
	 *	  arguments: e (jQuery event), jS (jQuery.sheet instance), i (old row index)
	 *	  example:
	 *		  $(obj).sheet({
	 *			  sheetDeleteRow: function(e, jS, i) {
	 *
	 *			  }
	 *		  });
	 *	  or:
	 *		  $(obj).bind('sheetDeleteRow', function(e, jS, i) {
	 *
	 *		  })
	 *		  .sheet();
	 *
	 * sheetDeleteColumn - occurs just after a column as been deleted
	 *	  arguments: e (jQuery event), jS (jQuery.sheet instance), i (old column index)
	 *	  example:
	 *		  $(obj).sheet({
	 *			  sheetDeleteColumn: function(e, jS, i) {
	 *
	 *			  }
	 *		  });
	 *	  or:
	 *		  $(obj).bind('sheetDeleteColumn', function(e, jS, i) {
	 *
	 *		  })
	 *		  .sheet();
	 *
	 * sheetOpen - occurs just after a single sheet within a set of sheets has been opened, this is triggered when calling sheet, so it needs to be bound beforehand
	 *	  arguments: e (jQuery event), jS (jQuery.sheet instance), i (new sheet index)
	 *	  example:
	 *		  $(obj).sheet({
	 *			  sheetOpen: function(e, jS, i) {
	 *
	 *			  }
	 *		  });
	 *	  or:
	 *		  $(obj).bind('sheetOpen', function(e, jS, i) {
	 *
	 *		  })
	 *		  .sheet();
	 *
	 * sheetAllOpened - occurs just after all sheets have been loaded and complete user interface has been created, this is triggered when calling sheet, so it needs to be bound beforehand
	 *	  arguments: e (jQuery event), jS (jQuery.sheet instance)
	 *	  example:
	 *		  $(obj).sheet({
	 *			  sheetAllOpened: function(e, jS) {
	 *
	 *			  }
	 *		  });
	 *	  or:
	 *		  $(obj).bind('sheetAllOpened', function(e, jS) {
	 *
	 *		  })
	 *		  .sheet();
	 *
	 * sheetSave - an assistance event called when calling jS.toggleState(), but not tied to anything internally
	 *	  arguments: e (jQuery event), jS (jQuery.sheet instance), tables (tables from spreadsheet)
	 *	  example:
	 *		  $(obj).sheet({
	 *			  sheetSave: function(e, jS, tables) {
	 *
	 *			  });
	 *		  }
	 *	  or:
	 *		  $(obj).bind('sheetSave', function(e, jS, tables) {
	 *
	 *		  })
	 *		  .sheet();
	 *
	 * sheetFullScreen - triggered when the sheet goes full screen
	 *	  arguments: e (jQuery event), jS (jQuery.sheet instance), isFullScreen (boolean, true if full screen, false if not)
	 *	  example:
	 *		  $(obj).sheet({
	 *			  sheetFullScreen: function(e, jS, isFullScreen) {
	 *
	 *			  });
	 *		  }
	 *	  or:
	 *		  $(obj).bind('sheetFullScreen', function(e, jS, isFullScreen) {
	 *
	 *		  })
	 *		  .sheet();
	 * </pre>
	 *
	 * @param {Object} [settings] supports the following properties/methods:
	 * <pre>
	 * editable {Boolean}, default true, Makes the sheet editable or viewable
	 *
	 * editableNames {Boolean}, default true, Allows sheets to have their names changed, depends on settings.editable being true
	 *
	 * barMenus {Boolean}, default true, Turns bar menus on/off
	 *
	 * freezableCells {Boolean}, default true, Turns ability to freeze cells on/off
	 *
	 * allowToggleState {Boolean}, default true, allows the spreadsheet to be toggled from write/read
	 *
	 * newColumnWidth {Number}, default 120, width of new columns
	 *
	 * title {String|Function}, title of spreadsheet, if function, expects string and is sent jS
	 *
	 * menu {String|Function|Object}, default '', 'this' is jQuery.sheet instance. If ul object, will attempt to create menu
	 *
	 * calcOff {Boolean} default false, turns turns off ability to calculate
	 *
	 * lockFormulas {Boolean} default false, turns on/off the ability to edit formulas
	 *
	 * colMargin {Number} default 18, size of height of new cells, and width of cell bars
	 *
	 * boxModelCorrection {Number} default 2, if box model is detected, it adds these pixels to ensure the size of the spreadsheet controls are correct
	 *
	 * formulaFunctions {Object} default {}, Additional functions for formulas. Will overwrite default functions if named the same.
	 *	  Javascript Example:
	 *		  $(obj).sheet({
	 *			  formulaFunctions: {
	 *				  NEWFUNCTION: function(arg1, arg2) {
	 *					  //this = the parser's cell object object
	 *					  return 'string'; //can return a string
	 *					  return { //can also return an object {value: '', html: ''}
	 *						  value: 'my value seen by other cells or if accessed directly',
	 *						  html: $('What the end user will see on the cell this is called in')
	 *					  }
	 *				  }
	 *			  }
	 *		  });
	 *
	 *	  Formula Example:
	 *		  =NEWFUNCTION(A1:B1, C3);
	 *
	 * formulaVariables {Object} default {}, Additional variables that formulas can access.
	 *	  Javascript Example:
	 *		  $(obj).sheet({
	 *			  formulaVariables: {
	 *				  newVariable: 100
	 *			  }
	 *		  });
	 *
	 *	  Formula Example (will output 200)
	 *		  =newVariable + 100
	 *
	 * cellSelectModel {String} default Sheet.excelSelectModel, accepts Sheet.excelSelectModel, Sheet.openOfficeSelectModel, or Sheet.googleDriveSelectModel, makes the select model act differently
	 *
	 * autoAddCells {Boolean} default true, allows you to add cells by selecting the last row/column and add cells by pressing either tab (column) or enter (row)
	 *
	 * resizableCells {Boolean} default true, turns resizing on and off for cells, depends on jQuery ui
	 *
	 * resizableSheet {Boolean} default true, turns resizing on and off for sheet, depends on jQuery ui
	 *
	 * autoFiller {Boolean} default true, turns on/off the auto filler, the little square that follows the active cell around that you can drag and fill the values of other cells in with.
	 *
	 * error {Function} default function(e) { return e.error; }, is triggered on errors from the formula engine
	 *
	 * encode {Function} default is a special characters handler for strings only, is a 1 way encoding of the html if entered manually by the editor.  If you want to use html with a function, return an object rather than a string
	 *
	 * frozenAt {Object} default [{row: 0,col: 0}], Gives the ability to freeze cells at a certain row/col
	 *
	 * contextmenuTop {Object} default is standard list of commands for context menus when right click or click on menu dropdown
	 *	  Javascript example:
	 *		  {
	 *			  "What I want my command to say": function() {}
	 *		  }
	 *
	 * contextmenuLeft {Object} default is standard list of commands for context menus when right click
	 *	  Javascript example:
	 *		  {
	 *			  "What I want my command to say": function() {}
	 *		  }
	 *
	 * contextmenuCell {Object} default is standard list of commands for context menus when right click or click on menu dropdown
	 *	  Javascript example:
	 *		  {
	 *			  "What I want my command to say": function() {}
	 *		  }
	 *
	 * alert {Function} default function(msg) {alert(msg);}
	 * prompt {Function} default function(msg, callback, initialValue) {callback(prompt(msg, initialValue));}
	 * confirm {Function} default
	 *	  function(msg, callbackIfTrue, callbackIfFalse) {
	 *		  if (confirm(msg)) {
	 *			  callbackIfTrue();
	 *		  } else if (callbackIfFalse) {
	 *			  callbackIfFalse();
	 *		  }
	 *	  }
	 * </pre>
	 *
	 */
	sheet:function (settings) {
		var n = isNaN,
			events = $.sheet.events;

		$(this).each(function () {
			var me = $(this),
				chosenSettings = $.extend(true, {}, $.sheet.defaults, settings || {}),
				jS = this.jS;

			chosenSettings.useStack = (window.thaw === undefined ? false : chosenSettings.useStack);
			chosenSettings.useMultiThreads = (window.operative === undefined ? false : chosenSettings.useMultiThreads);

			//destroy already existing spreadsheet
			if (jS) {
				var tables = me.children().detach();
				jS.kill();
				me.html(tables);

				for (var event in events) {
					if (events.hasOwnProperty(event)) {
						me.unbind(events[event]);
					}
				}
			}

			chosenSettings.parent = me;

			if ((this.className || '').match(/\bnot-editable\b/i) != null) {
				chosenSettings['editable'] = false;
			}

			for (var i in events) {
				if (events.hasOwnProperty(i)) {
					me.bind(events[i], chosenSettings[events[i]]);
				}
			}

			me.children().each(function(i) {
				//override frozenAt settings with table's data-frozenatrow and data-frozenatcol
				var frozenAtRow = this.getAttribute('data-frozenatrow') * 1,
					frozenAtCol = this.getAttribute('data-frozenatcol') * 1;

				if (!chosenSettings.frozenAt[i]) chosenSettings.frozenAt[i] = {row:0, col:0};
				if (frozenAtRow) chosenSettings.frozenAt[jS.i].row = frozenAtRow;
				if (frozenAtCol) chosenSettings.frozenAt[jS.i].col = frozenAtCol;
			});

			if (!$.sheet.instance.length) $.sheet.instance = [];

			this.jS = jS = $.sheet.createInstance(chosenSettings, $.sheet.instance.length);
			$.sheet.instance.push(jS);
		});
		return this;
	},

	/**
	 * @memberOf jQuery()
	 * @method
	 * @returns {HTMLElement}
	 */
	disableSelectionSpecial:function () {
		this.each(function () {
			this.onselectstart = function () {
				return false;
			};
			this.unselectable = "on";
			this.style['-moz-user-select'] = 'none';
		});
		return this;
	},

	/**
	 * @memberOf jQuery()
	 * @returns {jS}
	 */
	getSheet:function () {
		var me = this[0],
			jS = (me.jS || {});
		return jS;
	},

	/**
	 * Get cell value
	 * @memberOf jQuery()
	 * @param {Number} sheetIndex
	 * @param {Number} rowIndex
	 * @param {Number} colIndex
	 * @param {Function} callback
	 * @returns {jQuery}
	 */
	getCellValue:function (sheetIndex, rowIndex, colIndex, callback) {
		var me = this[0],
			jS = (me.jS || {}),
			cell;

		if (jS.getCell) {
			cell = jS.getCell(sheetIndex, rowIndex, colIndex);
			if (cell !== null) {
				cell.updateValue(callback);
			}
		}

		return this;
	},

	/**
	 * Set cell value
	 * @memberOf jQuery()
	 * @param {String|Number} value
	 * @param {Number} rowIndex
	 * @param {Number} colIndex
	 * @param {Number} [sheetIndex] defaults to 0
	 * @param {Function} [callback]
	 * @returns {jQuery}
	 */
	setCellValue:function (value, rowIndex, colIndex, sheetIndex, callback) {
		var me = this[0],
			jS = (me.jS || {}),
			cell;

		sheetIndex = (sheetIndex || 0);

		if (
			jS.getCell
				&& (cell = jS.getCell(sheetIndex, rowIndex, colIndex))
			) {
			try {
				if ((value + '').charAt(0) == '=') {
					cell.valueOverride = cell.value = '';
					cell.formula = value.substring(1);
				} else {
					cell.value = value;
					cell.valueOverride = cell.formula = '';
				}
				cell.updateValue(callback);
			} catch (e) {}
		}
		return this;
	},

	/**
	 * Set cell formula
	 * @memberOf jQuery()
	 * @param {String} formula
	 * @param {Number} rowIndex
	 * @param {Number} colIndex
	 * @param {Number} [sheetIndex] defaults to 0
	 * @param {Function} [callback]
	 * @returns {jQuery}
	 */
	setCellFormula:function (formula, rowIndex, colIndex, sheetIndex, callback) {
		var me = this[0],
			jS = (me.jS || {}),
			cell;

		sheetIndex = (sheetIndex || 0);

		if (jS.getCell) {
			try {
				cell = jS.getCell(sheetIndex, rowIndex, colIndex);
				if (cell !== null) {
					cell.formula = formula;
					cell.valueOverride = cell.value = '';
					cell.updateValue(callback);
				}
			} catch (e) {}
		}
		return this;
	},

	/**
	 * Detect if spreadsheet is full screen
	 * @memberOf jQuery()
	 * @returns {Boolean}
	 */
	isSheetFullScreen:function () {
		var me = this[0],
			jS = (me.jS || {});

		if (jS.obj) {
			return jS.obj.fullScreen().is(':visible');
		}
		return false;
	},

	/**
	 * Get inputs serialized from spreadsheet type_sheet-index_row-index_column-index_instance-index (dropdown_0_1_1_0 = sheet 1, row 1, column A, instance 0
	 * @param {Boolean} [isArray] return serialized as array (true) or string (false, default false
	 * @memberOf jQuery()
	 * @returns {*}
	 */
	serializeCellInputs:function (isArray) {
		var me = this[0],
			jS = (me.jS || {}),
			inputs = jS.obj.tables().find(':input');

		if (isArray) {
			return inputs.serializeArray();
		} else {
			return inputs.serialize();
		}
	},

	/**
	 * prints the source of a sheet for a user to see
	 * @param {Boolean} [pretty] makes html a bit easier for the user to see
	 * @returns {String}
	 * @memberOf jQuery()
	 */
	viewSource:function (pretty) {
		var source = "";
		$(this).each(function () {
			if (pretty) {
				source += $(this).toPrettySource();
			} else {
				source += $(this).toCompactSource();
			}
		});
		$.printSource(source);

		return source;
	},

	/**
	 * prints html to 1 line
	 * @returns {String}
	 * @memberOf jQuery()
	 */
	toCompactSource:function () {
		var node = this[0];
		var result = "";
		if (node.nodeType == 1) {
			// ELEMENT_NODE
			result += "<" + node.tagName.toLowerCase();

			var n = node.attributes.length;
			for (var i = 0; i < n; i++) {
				var key = node.attributes[i].name,
					val = node.getAttribute(key);

				if (val) {
					if (key == "contentEditable" && val == "inherit") {
						continue;
						// IE hack.
					}

					if (typeof(val) == "string") {
						result += " " + key + '="' + val.replace(/"/g, "'") + '"';
					} else if (key == "style" && val.cssText) {
						result += ' style="' + val.cssText + '"';
					}
				}
			}

			if (node.tagName == "COL") {
				// IE hack, which doesn't like <COL..></COL>.
				result += '/>';
			} else {
				result += ">";
				var childResult = "";
				$(node.childNodes).each(function () {
					childResult += $(this).toCompactSource();
				});
				result += childResult;
				result += "</" + node.tagName.toLowerCase() + ">";
			}

		} else if (node.nodeType == 3) {
			// TEXT_NODE
			result += node.data.replace(/^\s*(.*)\s*$/g, "$1");
		}
		return result;
	},

	/**
	 *  prints html to many lines, formatted for easy viewing
	 * @param {String} [prefix]
	 * @returns {String}
	 * @memberOf jQuery()
	 */
	toPrettySource:function (prefix) {
		var node = this[0],
			n,
			i;
		prefix = prefix || "";

		var result = "";
		if (node.nodeType == 1) {
			// ELEMENT_NODE
			result += "\n" + prefix + "<" + node.tagName.toLowerCase();
			n = node.attributes.length;
			for (i = 0; i < n; i++) {
				var key = node.attributes[i].name,
					val = node.getAttribute(key);

				if (val) {
					if (key == "contentEditable" && val == "inherit") {
						continue; // IE hack.
					}
					if (typeof(val) == "string") {
						result += " " + key + '="' + $.trim(val.replace(/"/g, "'")) + '"';
					} else if (key == "style" && val.cssText) {
						result += ' style="' + $.trim(val.cssText) + '"';
					}
				}
			}
			if (node.childNodes.length <= 0) {
				if (node.tagName == "COL") {
					result += "/>";
				} else {
					result += "></" + node.tagName.toLowerCase() + ">";
				}
			} else {
				result += ">";
				var childResult = "";

				n = node.childNodes.length;

				for (i = 0; i < n; i++) {
					childResult += $(node.childNodes[i]).toPrettySource(prefix + "  ");
				}
				result += childResult;
				if (childResult.indexOf('\n') >= 0) {
					result += "\n" + prefix;
				}
				result += "</" + node.tagName.toLowerCase() + ">";
			}
		} else if (node.nodeType == 3) {
			// TEXT_NODE
			result += node.data.replace(/^\s*(.*)\s*$/g, "$1");
		}
		return result;
	}
});

/**
 * @namespace
 * @type {Object}
 * @memberOf jQuery
 * @name jQuery.sheet
 */
$.sheet = {

	/**
	 * Defaults
	 */
	defaults: {
		editable:true,
		editableNames:true,
		barMenus:true,
		freezableCells:true,
		allowToggleState:true,
		menu:null,
		newColumnWidth:120,
		title:null,
		calcOff:false,
		lockFormulas:false,
		parent:null,
		colMargin:20,
		boxModelCorrection:2,
		formulaFunctions:{},
		formulaVariables:{},
		cellSelectModel:Sheet.excelSelectModel,
		autoAddCells:true,
		resizableCells:true,
		resizableSheet:true,
		autoFiller:true,
		error:function (e) {
			return e.error;
		},
		endOfNumber: false,
		frozenAt:[],
		contextmenuTop:{
			"Insert column after":function (jS) {
				jS.controlFactory.addColumn(false, jS.colLast);
				return false;
			},
			"Insert column before":function (jS) {
				jS.controlFactory.addColumn(true, jS.colLast);
				return false;
			},
			"Add column to end":function (jS) {
				jS.controlFactory.addColumn(true);
				return false;
			},
			"Delete this column":function (jS) {
				jS.deleteColumn();
				return false;
			},
			"Hide column":function (jS) {
				jS.toggleHideColumn();
				return false;
			},
			"Show all columns": function (jS) {
				jS.columnShowAll();
			},
			"Toggle freeze columns to here":function (jS) {
				var col = jS.getTdLocation(jS.obj.tdActive()).col,
					actionUI = jS.obj.pane().actionUI;
				actionUI.frozenAt.col = (actionUI.frozenAt.col == col ? 0 : col);
			}
		},
		contextmenuLeft:{
			"Insert row after":function (jS) {
				jS.controlFactory.addRow(true, jS.rowLast);
				return false;
			},
			"Insert row before":function (jS) {
				jS.controlFactory.addRow(false, jS.rowLast);
				return false;
			},
			"Add row to end":function (jS) {
				jS.controlFactory.addRow(true);
				return false;
			},
			"Delete this row":function (jS) {
				jS.deleteRow();
				return false;
			},
			"Hide row":function (jS) {
				jS.toggleHideRow(jS.rowLast);
				return false;
			},
			"Show all rows": function (jS) {
				jS.rowShowAll();
			},
			"Toggle freeze rows to here":function (jS) {
				var row = jS.getTdLocation(jS.obj.tdActive()).row,
					actionUI = jS.obj.pane().actionUI;
				actionUI.frozenAt.row = (actionUI.frozenAt.row == row ? 0 : row);
			}
		},
		contextmenuCell:{
			/*"Copy":false,
			 "Cut":false,
			 "line1":'line',*/
			"Insert row after":function (jS) {
				jS.controlFactory.addRow(true, jS.rowLast);
				return false;
			},
			"Insert row before":function (jS) {
				jS.controlFactory.addRow(false, jS.rowLast);
				return false;
			},
			"Add row to end":function (jS) {
				jS.controlFactory.addRow(true);
				return false;
			},
			"Delete this row":function (jS) {
				jS.deleteRow();
				return false;
			},
			"line2":'line',
			"Insert column after":function (jS) {
				jS.controlFactory.addColumn(true, jS.colLast);
				return false;
			},
			"Insert column before":function (jS) {
				jS.controlFactory.addColumn(false, jS.colLast);
				return false;
			},
			"Add column to end":function (jS) {
				jS.controlFactory.addColumn(true);
				return false;
			},
			"Delete this column":function (jS) {
				jS.deleteColumn();
				return false;
			},
			"line3":"line",
			"Add spreadsheet":function (jS) {
				jS.addSheet();
			},
			"Delete spreadsheet":function (jS) {
				jS.deleteSheet();
			}
		},
		alert: function(msg) {
			alert(msg);
		},
		prompt: function(msg, callback, initialValue) {
			callback(prompt(msg, initialValue));
		},
		confirm: function(msg, callbackIfTrue, callbackIfFalse) {
			if (confirm(msg)) {
				callbackIfTrue();
			} else if (callbackIfFalse) {
				callbackIfFalse();
			}
		},
		loader: null,
		useStack: true,
		useMultiThreads: true
	},

	/**
	 * Array of instances of jQuery.sheet, generally short-handed to jS
	 * @memberOf jQuery.sheet
	 */
	instance:[],

	/**
	 * Contains the dependencies if you use $.sheet.preLoad();
	 * @memberOf jQuery.sheet
	 */
	dependencies:{
		coreCss:{css:'jquery.sheet.css'},

		jQueryUI:{script:'jquery-ui/jquery-ui.min.js', thirdParty:true},
		jQueryUIThemeRoller:{css:'jquery-ui/themes/smoothness/jquery-ui.min.css', thirdParty:true},

		globalize:{script:'globalize/lib/globalize.js', thirdParty:true},

		nearest:{script:'jquery-nearest/src/jquery.nearest.min.js', thirdParty:true},

		mousewheel:{script:'MouseWheel/MouseWheel.js', thirdParty:true},

		operative:{script:'operative/dist/operative.js', thirdParty:true}
	},

	/**
	 * Contains the optional plugins if you use $.sheet.preLoad();
	 * @memberOf jQuery.sheet
	 */
	optional:{
		//native
		advancedFn:{script:'plugins/jquery.sheet.advancedfn.js'},
		financeFn:{script:'plugins/jquery.sheet.financefn.js'},

		//3rd party
		colorPicker:{
			css:'really-simple-color-picker/colorPicker.css',
			script:'really-simple-color-picker/jquery.colorPicker.min.js',
			thirdParty:true
		},

		elastic:{script:'jquery-elastic/jquery.elastic.source.js', thirdParty:true},

		globalizeCultures:{script:'globalize/lib/cultures/globalize.cultures.js', thirdParty:true},

		raphael:{script:'raphael/raphael.js', thirdParty:true},
		gRaphael:{script:'graphael/g.raphael.js', thirdParty:true},
		gRaphaelBar:{script:'graphael/g.bar.js', thirdParty:true},
		gRaphaelDot:{script:'graphael/g.dot.js', thirdParty:true},
		gRaphaelLine:{script:'graphael/g.line.js', thirdParty:true},
		gRaphaelPie:{script:'graphael/g.pie.js', thirdParty:true},

		thaw: {script:"thaw.js/thaw.js", thirdParty:true},

		undoManager:{script: 'Javascript-Undo-Manager/js/undomanager.js', thirdParty:true},

		zeroClipboard:{script:'zeroclipboard/dist/ZeroClipboard.min.js', thirdParty:true}
	},

	/**
	 * events list
	 * @memberOf jQuery.sheet
	 */
	events:[
		'sheetAddRow',
		'sheetAddColumn',
		'sheetSwitch',
		'sheetRename',
		'sheetTabSortStart',
		'sheetTabSortUpdate',
		'sheetCellEdit',
		'sheetCellEdited',
		'sheetCalculation',
		'sheetAdd',
		'sheetDelete',
		'sheetDeleteRow',
		'sheetDeleteColumn',
		'sheetOpen',
		'sheetAllOpened',
		'sheetSave',
		'sheetFullScreen',
		'sheetFormulaKeydown'
	],

	/**
	 * Used to load in all the required plugins and dependencies needed by sheet in it's default directories.
	 * @param {String} [path] path
	 * @param {Object} settings
	 * @memberOf jQuery.sheet
	 *
	 */
	preLoad:function (path, settings) {
		path = path || '';
		settings = $.extend({
			skip: ['globalizeCultures'],
			thirdPartyDirectory: 'bower_components/'
		},settings);

		var injectionParent = $('script:first'),
			write = function () {
				var script;
				if (this.script !== undefined) {
					script = document.createElement('script');
					script.src = path + (this.thirdParty ? settings.thirdPartyDirectory : '') + this.script;
					injectionParent.after(script);
				}
				if (this.css !== undefined) {
					script = document.createElement('link');
					script.rel = 'stylesheet';
					script.type = 'text/css';
					script.href = path + (this.thirdParty ? settings.thirdPartyDirectory : '') + this.css;
					injectionParent.after(script);
				}
			};

		$.each(this.dependencies, write);

		$.each(this.optional, write);
	},

	/**
	 * The instance creator of jQuery.sheet
	 * @memberOf jQuery.sheet
	 * @param {Object} s settings from jQuery.fn.sheet
	 * @param {Number} I the index of the instance
	 * @returns {jS} jS jQuery sheet instance
	 */
	createInstance:function (s, I) {

		var $window = $(window),
			$document = $(document),
			body = document.body,
			$body = $(body),
			emptyFN = function () {},
			u = undefined,
			math = Math,
			n = isNaN,
			nAN = NaN,
			thaw = ($.sheet.defaults.useStack && window.thaw !== u ? window.thaw : function(stack, options) {
				options = options || {};

				var i = 0,
					max = stack.length,
					item,
					each = options.each || function() {},
					done = options.done || function() {};

				if (stack[0].call !== u) {
					for (; i < max; i++) {
						item = stack[i];
						item();
					}
				} else {
					for (; i < max; i++) {
						item = stack[i];
						each.apply(item);
					}
					done();
				}
			}),

			/**
			 * A single instance of a spreadsheet, shorthand, also accessible from jQuery.sheet.instance[index].
			 * Generally called by jQuery().sheet().  Exposed for the ability to override methods if needed
			 * @namespace
			 * @alias jQuery.sheet.instance[]
			 * @name jS
			 */
			jS = {
				/**
				 * Current version of jQuery.sheet
				 * @memberOf jS
				 * @type {String}
				 */
				version:'4.x',

				/**
				 * The active sheet index within the a set of sheets
				 * @memberOf jS
				 * @type {Number}
				 */
				i:0,

				/**
				 * The instance index
				 * @memberOf jS
				 * @type {Number}
				 */
				I:I,

				/**
				 * The current count of sheet's within the instance
				 * @memberOf jS
				 * @type {Number}
				 */
				sheetCount:0,

				/**
				 * The internal storage array of the spreadsheets for an instance, constructed as array 3 levels deep, spreadsheet, rows, cells, can easily be used for custom exporting/saving
				 * @memberOf jS
				 * @type {Array}
				 */
				spreadsheets:[],

				/**
				 * Internal storage array of controls for an instance
				 * @memberOf jS
				 */
				controls:{
					autoFiller:[],
					bar:{
						helper:[],
						corner:[],
						x:{
							controls:[],
							handleFreeze:[],
							menu:[],
							menuParent:[],
							parent:[],
							th:[],
							ths:function () {
								var ths = [],
									i = 0,
									_ths = this.th[jS.i],
									max = _ths.length;

								for (; i < max; i++) {
									ths.push(_ths[i]);
								}

								return ths;
							}
						},
						y:{
							controls:[],
							handleFreeze:[],
							menu:[],
							parent:[],
							th:[],
							ths:function () {
								var ths = [],
									i = 0,
									_ths = this.th[jS.i],
									max = _ths.length;

								for (; i < max; i++) {
									ths.push(_ths[i]);
								}

								return ths;
							}
						}
					},
					barMenuLeft:[],
					barMenuTop:[],
					barLeft:[],
					barTop:[],
					barTopParent:[],
					chart:[],
					tdMenu:[],
					cellsEdited:[],
					enclosures:[],
					formula:null,
					fullScreen:null,
					header:null,
					inPlaceEdit:[],
					inputs:[],
					label:null,
					menu:[],
					menus:[],
					pane:[],
					panes:null,
					scrolls:null,
					sheetAdder:null,
					tab:[],
					tabContainer:null,
					tabs:null,
					title:null,
					toggleHide:{
						x:[],
						y:[]
					},
					ui:null
				},

				/**
				 * Object selectors for interacting with a spreadsheet
				 * @memberOf jS
				 * @type {Object}
				 */
				obj:{
					autoFiller:function () {
						return jS.controls.autoFiller[jS.i] || null;
					},
					barCorner:function () {
						return jS.controls.bar.corner[jS.i] || $([]);
					},
					barHelper:function () {
						return jS.controls.bar.helper[jS.i] || (jS.controls.bar.helper[jS.i] = $([]));
					},
					barLeft:function (i) {
						return (jS.controls.bar.y.th[jS.i] && jS.controls.bar.y.th[jS.i][i] ? jS.controls.bar.y.th[jS.i][i] : []);
					},
					barLeftControls:function () {
						return jS.controls.bar.y.controls[jS.i] || $([]);
					},
					barLefts:function () {
						return jS.controls.bar.y.ths();
					},
					barHandleFreezeLeft:function () {
						return jS.controls.bar.y.handleFreeze[jS.i] || $([]);
					},
					barMenuLeft:function () {
						return jS.controls.bar.y.menu[jS.i] || $([]);
					},
					barTop:function (i) {
						return (jS.controls.bar.x.th[jS.i] && jS.controls.bar.x.th[jS.i][i] ? jS.controls.bar.x.th[jS.i][i] : []);
					},
					barTopControls:function () {
						return jS.controls.bar.x.controls[jS.i] || $([]);
					},
					barTops:function () {
						return jS.controls.bar.x.ths();
					},
					barTopParent:function () {
						return jS.controls.bar.x.parent[jS.i] || $([]);
					},
					barHandleFreezeTop:function () {
						return jS.controls.bar.x.handleFreeze[jS.i] || $([]);
					},
					barMenuParentTop:function () {
						return jS.controls.bar.x.menuParent[jS.i] || $([]);
					},
					barMenuTop:function () {
						return jS.controls.bar.x.menu[jS.i] || $([]);
					},
					tdActive:function () {
						return jS.cellLast !== null ? jS.cellLast.td : null;
					},
					cellActive:function() {
						return jS.cellLast;
					},
					tdMenu:function () {
						return jS.controls.tdMenu[jS.i] || $([]);
					},
					cellsEdited: function () {
						return (jS.controls.cellsEdited !== u ? jS.controls.cellsEdited : jS.controls.cellsEdited = []);
					},
					chart:function () {
						return jS.controls.chart[jS.i] || $([]);
					},
					enclosure:function () {
						return jS.controls.enclosures[jS.i] || [];
					},
					enclosures:function () {
						return jS.controls.enclosures || [];
					},
					formula:function () {
						return jS.controls.formula || $([]);
					},
					fullScreen:function () {
						return jS.controls.fullScreen || $([]);
					},
					header:function () {
						return jS.controls.header || $([]);
					},
					highlighted: function() {
						return jS.highlighter.last || $([]);
					},
					inPlaceEdit:function () {
						return jS.controls.inPlaceEdit[jS.i] || $([]);
					},
					inputs:function() {
						return jS.controls.inputs[jS.i] || $([]);
					},
					label:function () {
						return jS.controls.label || $([]);
					},
					menus:function() {
						return jS.controls.menus[jS.i] || $([]);
					},
					menu:function () {
						return jS.controls.menu[jS.i] || $([]);
					},
					pane:function () {
						return jS.controls.pane[jS.i] || {};
					},
					panes:function () {
						return jS.controls.panes || $([]);
					},
					parent:function () {
						return s.parent;
					},
					scrolls:function () {
						return jS.controls.scrolls || $([]);
					},
					sheetAdder:function () {
						return jS.controls.sheetAdder || $([]);
					},
					tab:function () {
						return jS.controls.tab[jS.i] || $([]);
					},
					tabs:function () {
						return jS.controls.tabs || $([]);
					},
					tabContainer:function () {
						return jS.controls.tabContainer || $([]);
					},
					title:function () {
						return jS.controls.title || $([]);
					}
				},

				/**
				 * Internal id's of table, used for scrolling and a few other things
				 * @memberOf jS
				 * @type {String}
				 */
				id:'jS_' + I + '_',

				/**
				 * Internal css classes of objects
				 * @memberOf jS
				 * @type {Object}
				 */
				cl:{
					autoFiller:'jSAutoFiller',
					autoFillerHandle:'jSAutoFillerHandle',
					autoFillerCover:'jSAutoFillerCover',
					barCorner:'jSBarCorner',
					barController:'jSBarController',
					barControllerChild: 'jSBarControllerChild',
					barHelper:'jSBarHelper',
					barLeft:'jSBarLeft',
					barHandleFreezeLeft:'jSBarHandleFreezeLeft',
					barTop:'jSBarTop',
					barTopMenuButton: 'jSBarTopMenuButton',
					barHandleFreezeTop:'jSBarHandleFreezeTop',
					chart:'jSChart',
					formula:'jSFormula',
					formulaParent:'jSFormulaParent',
					header:'jSHeader',
					fullScreen:'jSFullScreen',
					inPlaceEdit:'jSInPlaceEdit',
					menu:'jSMenu',
					menuFixed:'jSMenuFixed',
					parent:'jSParent',
					scroll:'jSScroll',
					sheetAdder: 'jSSheetAdder',
					table:'jS',
					label:'jSLoc',
					pane:'jSEditPane',
					tab:'jSTab',
					tabContainer:'jSTabContainer',
					tabContainerScrollable:'jSTabContainerScrollable',
					tdMenu:'jSTdMenu',
					title:'jSTitle',
					enclosure:'jSEnclosure',
					ui:'jSUI'
				},

				/**
				 * Messages for user interface
				 * @memberOf jS
				 * @type {Object}
				 */
				msg:{
					addRowMulti:"How many rows would you like to add?",
					addColumnMulti:"How many columns would you like to add?",
					cellFind:"What are you looking for in this spreadsheet?",
					cellNoFind:"No results found.",
					dragToFreezeCol:"Drag to freeze column",
					dragToFreezeRow:"Drag to freeze row",
					addSheet:"Add a spreadsheet",
					openSheet:"Are you sure you want to open a different sheet?  All unsaved changes will be lost.",
					toggleHideRow:"No row selected.",
					toggleHideColumn:"No column selected.",
					loopDetected:"Loop Detected",
					newSheetTitle:"What would you like the sheet's title to be?",
					notFoundColumn:"Column not found",
					notFoundRow:"Row not found",
					notFoundSheet:"Sheet not found",
					setCellRef:"Enter the name you would like to reference the cell by.",
					sheetTitleDefault:"Spreadsheet {index}",
					cellLoading: "Loading..."
				},

				/**
				 * Deletes a jQuery sheet instance
				 * @memberOf jS
				 */
				kill:function () {
					if (!jS) {
						return false;
					}
					$(document).unbind('keydown');
					this.obj.fullScreen().remove();
					(this.obj.inPlaceEdit().destroy || emptyFN)();
					s.parent
						.trigger('sheetKill')
						.removeClass(jS.theme.parent)
						.html('');

					delete s.parent[0].jS;

					this.obj.menus().remove();

					var max = $.sheet.events.length;
					for (var i = 0; i < max; i++) {
						s.parent.unbind($.sheet.events[i]);
					}

					$.sheet.instance.splice(I, 1);
					return true;
				},

				/**
				 * Event trigger for jQuery sheet, wraps jQuery's trigger event to always return jS
				 * @param {String} eventType event type
				 * @param {Array} [extraParameters]
				 * @memberOf jS
				 */
				trigger:function (eventType, extraParameters) {
					//wrapper for $ trigger of parent, in case of further mods in the future
					extraParameters = extraParameters || [];
					return s.parent.triggerHandler(eventType, [jS].concat(extraParameters));
				},

				/**
				 * Get cell value
				 * @memberOf jS
				 * @param {Number} sheetIndex
				 * @param {Number} rowIndex
				 * @param {Number} columnIndex
				 * @returns {Sheet.Cell|Null}
				 */
				getCell: function (sheetIndex, rowIndex, columnIndex) {
					var spreadsheet, row, cell;
					if (
						(spreadsheet = jS.spreadsheets[sheetIndex]) === u
						|| (row = spreadsheet[rowIndex]) === u
						|| (cell = row[columnIndex]) === u
					) {
						cell = s.loader.jitCell(sheetIndex, rowIndex, columnIndex);
					}

					if (cell === u || cell === null) {
						return null;
					}

					if (cell.typeName !== 'Sheet.Cell') {
						throw new Error('Wrong Constructor');
					}

					cell.sheetIndex = sheetIndex;
					cell.rowIndex = rowIndex;
					cell.columnIndex = columnIndex;
					return cell;
				},

				/**
				 *
				 * @param {String} cellId
				 * @param {Number|Function} callbackOrSheet
				 * @param {Function} [callback]
				 * @returns {jS}
				 */
				getCellById: function(cellId, callbackOrSheet, callback) {
					var loader = s.loader,
						sheet;

					if (typeof callbackOrSheet === 'function') {
						sheet = -1;
						callback = callbackOrSheet;
					} else {
						sheet = callbackOrSheet;
						if (typeof sheet === 'string') {
							sheet = loader.getSpreadsheetIndexByTitle(sheet);
						}
					}

					if (jS.isBusy()) {
						jS.whenNotBusy(function(){
							loader.jitCellById(cellId, sheet, callback);
						});
					} else {
						loader.jitCellById(cellId, sheet, callback);
					}

					return this;
				},
				getCells: function(cellReferences, callbackOrSheet, callback) {
					var i = 0,
						max = cellReferences.length,
						remaining = max - 1,
						cellReference,
						cellLocation,
						cell,
						cells = [],
						got = 0,
						sheet;

					if (typeof callbackOrSheet === 'function') {
						sheet = -1;
						callback = callbackOrSheet;
					} else {
						sheet = callbackOrSheet;
						if (typeof sheet === 'string') {
							sheet = loader.getSpreadsheetIndexByTitle(sheet);
						}
					}

					jS.whenNotBusy(function() {
						for(;i < max; i++) {
							cellReference = cellReferences[i];
							if (typeof cellReference === 'string') {
								(function(i) {
									jS.getCellById(cellReference, sheet, function(cell) {
										cells[i] = cell;
										got++;

										if (got === max) callback.apply(jS, cells);
									});
								})(i);
							} else {
								cellLocation = cellReference;
								cell = jS.getCell(cellLocation.sheet, cellLocation.rowIndex, cellLocation.columnIndex);
								if (cell !== null) {
									cells[i] = cell;
									got++;

									if (got === max) callback.apply(jS, cells);
								}
							}
						}
					});

					return this;
				},

				updateCells: function(cellReferences, callbackOrSheet, callback) {
					var sheet;

					if (typeof callbackOrSheet === 'function') {
						sheet = -1;
						callback = callbackOrSheet;
					} else {
						sheet = callbackOrSheet;
						if (typeof sheet === 'string') {
							sheet = loader.getSpreadsheetIndexByTitle(sheet);
						}
					}

					jS.getCells(cellReferences, sheet, function() {
						var cells = arguments,
							max = cells.length,
							remaining = max - 1,
							values = [],
							i = 0;

						for(;i < max;i++) {
							(function(i) {
								cells[i].updateValue(function(value) {
									remaining--;
									values[i] = value;
									if (remaining < 0) {
										callback.apply(jS, values);
									}
								});
							})(i);
						}
					});

					return this;
				},
				/**
				 * Tracks which spreadsheet is active to intercept keystrokes for navigation
				 * @type {Boolean}
				 * @memberOf jS
				 */
				nav:false,

				/**
				 * Turns off all intercept keystroke navigation instances, with exception of supplied instance index
				 * @param {Boolean} nav Instance index
				 * @memberOf jS
				 */
				setNav:function (nav) {
					var instance = $.sheet.instance;
					for(var i = 0; i < instance.length; i++) {
						(instance[i] || {}).nav = false;
					}

					jS.nav = nav;
				},

				/**
				 * Creates the different objects required by sheets
				 * @memberOf jS
				 * @type {Object}
				 * @namespace
				 */
				controlFactory:{
					/**
					 * Creates multi rows
					 * @param {Number} [rowIndex] row index
					 * @param {Number} [qty] the number of cells you'd like to add, if not specified, a dialog will ask
					 * @param {Boolean} [isAfter] places cells after the selected cell if true
					 * @memberOf jS.controlFactory
					 */
					addRowMulti:function (rowIndex, qty, isAfter) {
						function add(qty) {
							var i = 0;
							if (qty > 0) {

								for (;i < qty; i++) {
									jS.addColumn(rowIndex, isAfter, true);
								}

								jS.trigger('sheetAddRow', [rowIndex, isAfter, qty]);
							}
						}

						if (!qty) {
							s.prompt(
								jS.msg.addRowMulti,
								add
							);
						} else {
							add(qty);
						}
					},

					/**
					 * Creates multi columns
					 * @param {Number} [columnIndex] column index
					 * @param {Number} [qty] the number of cells you'd like to add, if not specified, a dialog will ask
					 * @param {Boolean} [isAfter] places cells after the selected cell if true
					 * @memberOf jS.controlFactory
					 */
					addColumnMulti:function (columnIndex, qty, isAfter) {
						function add(qty) {
							var i = 0;
							if (qty > 0) {

								for (;i < qty; i++) {
									jS.addColumn(columnIndex, isAfter, true);
								}

								jS.trigger('sheetAddColumn', [columnIndex, isAfter, qty]);
							}
						}

						if (!qty) {
							s.prompt(
								jS.msg.addColumnMulti,
								add
							);
						} else {
							add(qty);
						}
					},


					/**
					 * creates single row
					 * @param {Boolean} [isAfter] places cells after if set to true
					 * @param {Number} [rowIndex] row index
					 * @param {Boolean} [skipEvent]
					 * @memberOf jS.controlFactory
					 */
					addRow:function (isAfter, rowIndex, skipEvent) {
						var loader = s.loader,
							columnIndex = 0,
							size = loader.size(jS.i),
							columnMax = size.cols,
							spreadsheet = jS.spreadsheets[jS.i],
							row = [],
							sheetIndex = jS.i,
							pane = jS.obj.pane();

						if (rowIndex === undefined) {
							rowIndex = size.rows - 1;
						}

						if (isAfter) {
							rowIndex++;
						}

						for(;columnIndex < columnMax; columnIndex++) {
							row.push(new Sheet.Cell(sheetIndex, null, jS, jS.cellHandler));
						}

						spreadsheet.splice(rowIndex, 0, row);

						loader.addRow(jS.i, rowIndex, row);

						pane.actionUI.redrawRows();

						if (skipEvent !== true) {
							jS.trigger('sheetAddRow', [rowIndex, isAfter, 1]);
						}
					},

					/**
					 * creates single column
					 * @param {Boolean} [isAfter] places cells after if set to true
					 * @param {Number} [columnIndex], column index
					 * @param {Boolean} [skipEvent]
					 * @memberOf jS.controlFactory
					 */
					addColumn:function (isAfter, columnIndex, skipEvent) {
						var loader = s.loader,
							rowIndex = 0,
							size = loader.size(jS.i),
							rowMax = size.rows,
							row,
							column = [],
							cell,
							spreadsheet = jS.spreadsheets[jS.i],
							sheetIndex = jS.i,
							pane = jS.obj.pane();

						if (columnIndex === undefined) {
							columnIndex = size.cols - 1;
						}

						if (isAfter) {
							columnIndex++;
						}

						for(;rowIndex < rowMax; rowIndex++) {
							cell = new Sheet.Cell(sheetIndex, null, jS, jS.cellHandler);
							column.push(cell);
							row = spreadsheet[rowIndex];
							row.splice(columnIndex, 0, cell);
						}

						loader.addColumn(jS.i, columnIndex, column);

						pane.actionUI.redrawColumns();

						if (skipEvent !== true) {
							jS.trigger('sheetAddColumn', [columnIndex, isAfter, 1]);
						}
					},

					/**
					 * Creates the draggable objects for freezing cells
					 * @type {Object}
					 * @memberOf jS.controlFactory
					 * @namespace
					 */
					barHandleFreeze:{

						/**
						 * @param {Number} i
						 * @param {HTMLElement} pane
						 * @returns {Boolean}
						 * @memberOf jS.controlFactory.barHandleFreeze
						 */
						top:function (i, pane) {
							if (jS.isBusy()) {
								return false;
							}
							var actionUI = pane.actionUI,
								tBody = pane.tBody,
								frozenAt = actionUI.frozenAt,
								scrolledArea = actionUI.scrolledArea;

							if (!(scrolledArea.col <= (frozenAt.col + 1))) {
								return false;
							}

							jS.obj.barHelper().remove();

							var highlighter,
								bar = tBody.children[0].children[frozenAt.col + 1],
								paneRectangle = pane.getBoundingClientRect(),
								paneTop = paneRectangle.top + document.body.scrollTop,
								paneLeft = paneRectangle.left + document.body.scrollLeft,
								handle = document.createElement('div'),
								$handle = pane.freezeHandleTop = $(handle)
									.appendTo(pane)
									.addClass(jS.theme.barHandleFreezeTop + ' ' + jS.cl.barHelper + ' ' + jS.cl.barHandleFreezeTop)
									.height(bar.clientHeight - 1)
									.css('left', (bar.offsetLeft - handle.clientWidth) + 'px')
									.attr('title', jS.msg.dragToFreezeCol);


							jS.controls.bar.helper[jS.i] = jS.obj.barHelper().add(handle);
							jS.controls.bar.x.handleFreeze[jS.i] = $handle;

							jS.draggable($handle, {
								axis:'x',
								start:function () {
									jS.setBusy(true);

									highlighter = $(document.createElement('div'))
										.appendTo(pane)
										.css('position', 'absolute')
										.addClass(jS.theme.barFreezeIndicator + ' ' + jS.cl.barHelper)
										.height(bar.clientHeight - 1)
										.fadeTo(0,0.33);
								},
								drag:function() {
									var target = jS.nearest($handle, bar.parentNode.children).prev();
									if (target.length && target.position) {
										highlighter.width(target.position().left + target.width());
									}
								},
								stop:function (e, ui) {
									highlighter.remove();
									jS.setBusy(false);
									jS.setDirty(true);
									var target = jS.nearest($handle, bar.parentNode.children);

									jS.obj.barHelper().remove();
									scrolledArea.col = actionUI.frozenAt.col = jS.getTdLocation(target[0]).col - 1;
									jS.autoFillerHide();
								},
								containment:[paneLeft, paneTop, paneLeft + pane.clientWidth - window.scrollBarSize.width, paneTop]
							});

							return true;
						},

						/**
						 * @param {Number} i
						 * @param {HTMLElement} pane
						 * @returns {Boolean}
						 * @memberOf jS.controlFactory.barHandleFreeze
						 */
						left:function (i, pane) {
							if (jS.isBusy()) {
								return false;
							}
							var actionUI = pane.actionUI,
								table = pane.table,
								tBody = pane.tBody,
								frozenAt = actionUI.frozenAt,
								scrolledArea = actionUI.scrolledArea;

							if (!(scrolledArea.row <= (frozenAt.row + 1))) {
								return false;
							}

							jS.obj.barHelper().remove();

							var bar = tBody.children[frozenAt.row + 1].children[0],
								paneRectangle = pane.getBoundingClientRect(),
								paneTop = paneRectangle.top + document.body.scrollTop,
								paneLeft = paneRectangle.left + document.body.scrollLeft,
								handle = document.createElement('div'),
								$handle = pane.freezeHandleLeft = $(handle)
									.appendTo(pane)
									.addClass(jS.theme.barHandleFreezeLeft + ' ' + jS.cl.barHelper + ' ' + jS.cl.barHandleFreezeLeft)
									.width(bar.clientWidth)
									.css('top', (bar.offsetTop - handle.clientHeight + 1) + 'px')
									.attr('title', jS.msg.dragToFreezeRow),
								highlighter;

							jS.controls.bar.helper[jS.i] = jS.obj.barHelper().add(handle);
							jS.controls.bar.y.handleFreeze[jS.i] = $handle;

							jS.draggable($handle, {
								axis:'y',
								start:function () {
									jS.setBusy(true);

									highlighter = $(document.createElement('div'))
										.appendTo(pane)
										.css('position', 'absolute')
										.addClass(jS.theme.barFreezeIndicator + ' ' + jS.cl.barHelper)
										.width(handle.clientWidth)
										.fadeTo(0,0.33);
								},
								drag:function() {
									var target = jS.nearest($handle, bar.parentNode.parentNode.children).prev();
									if (target.length && target.position) {
										highlighter.height(target.position().top + target.height());
									}
								},
								stop:function (e, ui) {
									highlighter.remove();
									jS.setBusy(false);
									jS.setDirty(true);
									var target = jS.nearest($handle, bar.parentNode.parentNode.children);
									jS.obj.barHelper().remove();
									scrolledArea.row = actionUI.frozenAt.row = math.max(jS.getTdLocation(target.children(0)[0]).row - 1, 0);
									jS.autoFillerHide();
								},
								containment:[paneLeft, paneTop, paneLeft, paneTop + pane.clientHeight - window.scrollBarSize.height]
							});

							return true;
						},

						/**
						 * @memberOf jS.controlFactory.barHandleFreeze
						 */
						corner:function () {
						}
					},

					/**
					 *
					 * Creates menus for contextual menus and top bar button
					 * @param bar
					 * @param menuItems
					 * @returns {jQuery|HTMLElement}
					 * @memberOf jS.controlFactory
					 */
					menu:function (bar, menuItems) {
						var menu, buttons = $([]), hoverClass = jS.theme.menuHover;

						switch (bar) {
							case "top":
								menu = $(document.createElement('div'))
									.addClass(jS.theme.menu + ' ' + jS.cl.tdMenu);
								jS.controls.bar.x.menu[jS.i] = menu;
								break;
							case "left":
								menu = $(document.createElement('div'))
									.addClass(jS.theme.menu + ' ' + jS.cl.tdMenu);
								jS.controls.bar.y.menu[jS.i] = menu;
								break;
							case "cell":
								menu = $(document.createElement('div'))
									.addClass(jS.theme.menu + ' ' + jS.cl.tdMenu);
								jS.controls.tdMenu[jS.i] = menu;
								break;
						}

						jS.controls.menus[jS.i] = jS.obj.menus().add(menu);

						menu
							.mouseleave(function () {
								menu.hide();
							})
							.bind('contextmenu', function() {return false;})
							.appendTo($body)
							.hide()
							.disableSelectionSpecial();

						for (var msg in menuItems) {
							if (menuItems[msg]) {
								if ($.isFunction(menuItems[msg])) {
									buttons.pushStack(
										$(document.createElement('div'))
											.text(msg)
											.data('msg', msg)
											.click(function () {
												menuItems[$(this).data('msg')].call(this, jS);
												menu.hide();
												return false;
											})
											.appendTo(menu)
											.hover(function() {
												buttons.removeClass(hoverClass);
												$(this).addClass(hoverClass);
											}, function() {
												$(this).removeClass(hoverClass);
											})
									);

								} else if (menuItems[msg] == 'line') {
									$(document.createElement('hr')).appendTo(menu);
								}
							}
						}

						return menu;
					},

					/**
					 * Creates items within menus using jQuery.sheet.instance.msg
					 * @memberOf jS.controlFactory
					 * @namespace
					 */
					barMenu:{

						/**
						 * @param {Object} e jQuery event
						 * @param {Number} i column
						 * @param {jQuery|HTMLElement} target
						 * @returns {*}
						 * @memberOf jS.controlFactory.barMenu
						 */
						top:function (e, i, target) {
							if (jS.isBusy()) {
								return false;
							}
							var menu = jS.obj.barMenuTop().hide();

							if (!menu.length) {
								menu = jS.controlFactory.menu('top', s.contextmenuTop);
							}

							jS.obj.menus().hide();

							if (!target) {
								menu
									.css('left', (e.pageX - 5) + 'px')
									.css('top', (e.pageY - 5) + 'px')
									.show();
								return menu;
							}

							var barMenuParentTop = jS.obj.barMenuParentTop().hide();

							if (!barMenuParentTop.length) {

								barMenuParentTop = $(document.createElement('div'))
									.addClass(jS.theme.barMenuTop + ' ' + jS.cl.barHelper + ' ' + jS.cl.barTopMenuButton)
									.append(
										$(document.createElement('span'))
											.addClass('ui-icon ui-icon-triangle-1-s')
									)
									.mousedown(function (e) {
										barMenuParentTop.parent()
											.mousedown()
											.mouseup();

										var offset = barMenuParentTop.offset();

										menu
											.css('left', (e.pageX - 5) + 'px')
											.css('top', (e.pageY - 5) + 'px')
											.show();
									})
									.blur(function () {
										if (menu) menu.hide();
									});

								barMenuParentTop.get(0).destroy = function(){
									barMenuParentTop.remove();
									jS.controls.bar.x.menuParent[jS.i] = null;
								};

								jS.controls.bar.x.menuParent[jS.i] = barMenuParentTop;
							}

							barMenuParentTop
								.prependTo(target)
								.show();
						},

						/**
						 *
						 * @param e
						 * @param i
						 * @returns {Boolean}
						 * @memberOf jS.controlFactory.barMenu
						 */
						left:function (e, i) {
							if (jS.isBusy()) {
								return false;
							}
							jS.obj.barMenuLeft().hide();

							if (i) {
								jS.obj.barHandleFreezeLeft().remove();
							}
							var menu;

							menu = jS.obj.barMenuLeft();

							if (!menu.length) {
								menu = jS.controlFactory.menu('left', s.contextmenuLeft);
							}

							jS.obj.menus().hide();

							menu
								.css('left', (e.pageX - 5) + 'px')
								.css('top', (e.pageY - 5) + 'px')
								.show();

							return true;
						},

						/**
						 * @memberOf jS.controlFactory.barMenu
						 */
						corner:function () {
						}
					},


					/**
					 * Creates contextual menus for cells (a right click menu)
					 * @param {Object} e jQuery event
					 * @returns {Boolean}
					 * @memberOf jS.controlFactory
					 */
					tdMenu:function (e) {
						if (jS.isBusy()) {
							return false;
						}
						jS.obj.tdMenu().hide();

						var menu = jS.obj.tdMenu();

						if (!menu.length) {
							menu = jS.controlFactory.menu('cell', s.contextmenuCell);
						}

						jS.obj.menus().hide();

						menu
							.css('left', (e.pageX - 5) + 'px')
							.css('top', (e.pageY - 5) + 'px')
							.show();

						return true;
					},


					/**
					 * Creates the control/container for everything above the spreadsheet, removes them if they already exist
					 * @memberOf jS.controlFactory
					 */
					header:function () {
						jS.obj.header().remove();
						jS.obj.sheetAdder().remove();
						jS.obj.tabContainer().remove();

						var header = document.createElement('div'),
							secondRow,
							secondRowTr,
							title = document.createElement('h4'),
							label,
							menu,
							$menu,
							formula,
							formulaParent;

						header.className = jS.cl.header + ' ' + jS.theme.control;

						jS.controls.header = $(header);

						if (s.title) {
							if ($.isFunction(s.title)) {
								s.title = jS.title(jS, I);
							}

							title.className = jS.cl.title;
							jS.controls.title = $(title).html(s.title)
						} else {
							$(title).hide();
						}
						header.appendChild(title);


						if (jS.isSheetEditable()) {
							if (s.menu) {
								menu = document.createElement('div');
								$menu = $(menu);
								menu.className = jS.cl.menu + ' ' + jS.cl.menuFixed + ' ' + jS.theme.menuFixed;
								header.appendChild(menu);

								jS.controls.menu[jS.i] = $menu
									.append(s.menu)
									.children()
									.addClass(jS.theme.menuFixed);

								$menu.find('img').load(function () {
									jS.sheetSyncSize();
								});
							}

							label = document.createElement('td');
							label.className = jS.cl.label + ' ' + jS.theme.control;
							jS.controls.label = $(label);

							//Edit box menu
							formula = document.createElement('textarea');
							formula.className = jS.cl.formula + ' ' + jS.theme.controlTextBox;
							formula.onkeydown = jS.evt.formula.keydown;
							formula.onkeyup = function () {
								jS.obj.inPlaceEdit().value = this.value;
							};
							formula.onchange = function () {
								jS.obj.inPlaceEdit().value = this.value;
							};
							formula.onpaste = jS.evt.pasteOverCells;
							formula.onfocus = function () {
								jS.setNav(false);
							};
							formula.onfocusout = function () {
								jS.setNav(true);
							};
							formula.onblur = function () {
								jS.setNav(true);
							};
							jS.controls.formula = $(formula);

							// resizable formula area - a bit hard to grab the handle but is there!
							var formulaResize = document.createElement('span');
							formulaResize.appendChild(formula);

							secondRow = document.createElement('table');
							secondRowTr = document.createElement('tr');
							secondRow.appendChild(secondRowTr);

							header.appendChild(secondRow);


							formulaParent = document.createElement('td');
							formulaParent.className = jS.cl.formulaParent;
							formulaParent.appendChild(formulaResize);
							secondRowTr.appendChild(label);
							secondRowTr.appendChild(formulaParent);

							//spacer
							secondRowTr.appendChild(document.createElement('td'));

							jS.resizableSheet($(formulaResize), {
								minHeight:jS.controls.formula.height(),
								maxHeight:78,
								handles:'s',
								resize:function (e, ui) {
									jS.controls.formula.height(ui.size.height);
								},
								stop: function() {
									jS.sheetSyncSize();
								}
							});

							var instance = $.sheet.instance;
							for(var i = 0; i < instance.length; i++) {
								(instance || {}).nav = false;
							}

							jS.setNav(true);

							$(document).keydown(jS.evt.document.keydown);
						}

						return header;
					},

					/**
					 * Creates the user interface for spreadsheets
					 * @memberOf jS.controlFactory
					 */
					ui:function () {
						var ui = document.createElement('div');
						ui.setAttribute('class', jS.cl.ui);
						jS.obj.ui = ui;
						return ui;
					},

					sheetAdder: function () {
						var addSheet = document.createElement('span');
						if (jS.isSheetEditable()) {
							addSheet.setAttribute('class', jS.cl.sheetAdder + ' ' + jS.cl.tab + ' ' + jS.theme.tab);
							addSheet.setAttribute('title', jS.msg.addSheet);
							addSheet.innerHTML = '+';
							addSheet.onmousedown = function () {
								jS.addSheet();

								return false;
							};
							addSheet.i = -1;
						}
						return jS.controls.sheetAdder = $(addSheet);
					},

					/**
					 * Creates the tab interface for spreadsheets
					 * @memberOf jS.controlFactory
					 */
					tabContainer:function () {
						var tabContainer = document.createElement('span'),
							startPosition;
						tabContainer.setAttribute('class', jS.cl.tabContainer);

						tabContainer.onmousedown = function (e) {
							e = e || window.event;

							var i = (e.target || e.srcElement).i;
							if (i >= 0) {
								jS.trigger('sheetSwitch', [i]);
							}
							return false;
						};
						tabContainer.ondblclick = function (e) {
							e = e || window.event;
							var i = (e.target || e.srcElement).i;
							if (i >= 0) {
								jS.trigger('sheetRename', [i]);
							}
							return false;
						};


						if (jS.isSheetEditable() && $.fn.sortable) {
							return jS.controls.tabContainer = $(tabContainer).sortable({
								placeholder:'ui-state-highlight',
								axis:'x',
								forceHelperSize:true,
								forcePlaceholderSize:true,
								opacity:0.6,
								start:function (e, ui) {
									startPosition = ui.item.index();
									jS.trigger('sheetTabSortStart', [e, ui]);
								},
								update:function (e, ui) {
									jS.trigger('sheetTabSortUpdate', [e, ui, startPosition]);
								}
							});
						}

						return jS.controls.tabContainer = $(tabContainer);
					},

					/**
					 * Creates the spreadsheet user interface
					 * @param {HTMLElement} ui raw user interface
					 * @param {Number} i the new count for spreadsheets in this instance
					 * @memberOf jS.controlFactory
					 */
					sheetUI:function (ui, i) {
						jS.i = i;

						//TODO: readOnly from metadata
						//jS.readOnly[i] = (table.className || '').match(/\breadonly\b/i) != null;

						var enclosure = jS.controlFactory.enclosure(),
							pane = enclosure.pane,
							$pane = $(pane),
							paneContextmenuEvent = function (e) {
								e = e || window.event;
								if (jS.isBusy()) {
									return false;
								}
								if (jS.isBar(e.target)) {
									var bar = e.target,
										index = bar.index,
										entity = bar.entity;

									if (index < 0) return false;

									if (jS.evt.barInteraction.first === jS.evt.barInteraction.last) {
										jS.controlFactory.barMenu[entity](e, index);
									}
								} else {
									jS.controlFactory.tdMenu(e);
								}
								return false;
							};

						ui.appendChild(enclosure);

						if (jS.isSheetEditable()) {
							jS.controlFactory.autoFiller(pane);
						}

						if (jS.isSheetEditable()) {
							var formula = jS.obj.formula(),
								mouseDownEntity = "";

							$pane.mousedown(function (e) {
								jS.setNav(true);
								if (jS.isBusy()) {
									return false;
								}

								if (jS.isCell(e.target)) {
									if (e.button == 2) {
										paneContextmenuEvent.call(this, e);
										jS.evt.cellOnMouseDown(e);
										return true;
									}
									jS.evt.cellOnMouseDown(e);
									return false;
								}

								if (jS.isBar(e.target)) { //possibly a bar
									if (e.button == 2) {
										paneContextmenuEvent.call(this, e);
									}
									mouseDownEntity = e.target.entity;
									jS.evt.barInteraction.select(e.target);
									return false;
								}

								return true;
							});

							pane.onmouseup = function() {
								mouseDownEntity = "";
							};

							pane.onmouseover = function (e) {
								e = e || window.event;

								var target = e.target || e.srcElement;

								//This manages bar resize, bar menu, and bar selection
								if (jS.isBusy()) {
									return false;
								}

								if (!jS.isBar(target)) {
									return false;
								}
								var bar = target,
									entity = bar.entity,
									index = bar.index;

								if (index < 0) {
									return false;
								}

								if (jS.evt.barInteraction.selecting && bar === mouseDownEntity) {
									jS.evt.barInteraction.last = index;

									jS.cellSetActiveBar(entity, jS.evt.barInteraction.first, jS.evt.barInteraction.last);
								} else {
									jS.resizeBar[entity](bar, index, pane);

									if (jS.isSheetEditable()) {
										jS.controlFactory.barHandleFreeze[entity](index, pane);

										if (entity == "top") {
											jS.controlFactory.barMenu[entity](e, index, bar);
										}
									}
								}

								return true;
							};

							pane.ondblclick = jS.evt.cellOnDblClick;

							$pane
								.bind('contextmenu', paneContextmenuEvent)
								.disableSelectionSpecial()
								.bind('cellEdit', jS.evt.cellEdit);
						}

						jS.controlFactory.tab();

						jS.setChanged(true);
					},

					/**
					 * The viewing console for spreadsheet
					 * @returns {*|jQuery|HTMLElement}
					 * @memberOf jS.controlFactory
					 */
					enclosure:function () {
						var enclosure = document.createElement('div'),
							$enclosure = $(enclosure),
							actionUI = new Sheet.ActionUI(jS, enclosure, jS.cl.scroll, jS.s.frozenAt[jS.i]),
							pane = actionUI.pane;

						pane.setAttribute('class', jS.cl.pane + ' ' + jS.theme.pane);
						enclosure.setAttribute('class', jS.cl.enclosure);

						enclosure.pane = pane;

						pane.enclosure = enclosure;
						pane.$enclosure = $enclosure;

						jS.controls.pane[jS.i] = pane;
						jS.controls.panes = jS.obj.panes().add(pane);
						jS.controls.enclosures[jS.i] = enclosure;

						return enclosure;
					},

					/**
					 * Adds a tab for navigation to a spreadsheet
					 * @returns {Node|jQuery}
					 * @memberOf jS.controlFactory
					 */
					tab:function () {
						var tab = document.createElement('span'),
							$tab = jS.controls.tab[jS.i] = $(tab).appendTo(jS.obj.tabContainer());

						tab.setAttribute('class', jS.cl.tab + ' ' + jS.theme.tab);
						jS.sheetTab(true, function(sheetTitle) {
							tab.innerHTML = sheetTitle;
						});

						tab.i = jS.i;
						jS.controls.tabs = jS.obj.tabs().add($tab);

						return tab;
					},

					customTab: function(title) {
						var tab = document.createElement('span'),
							$tab = $(tab).appendTo(jS.obj.tabContainer());

						tab.setAttribute('class', jS.cl.tab + ' ' + jS.theme.tab);
						tab.innerHTML = title;

						return $tab;
					},

					/**
					 * Creates a textarea for a user to put a value in that floats on top of the current selected cell
					 * @param {jQuery|HTMLElement} td the td to be edited
					 * @param {Boolean} selected selects the text in the inline editor
					 * @memberOf jS.controlFactory
					 */
					inPlaceEdit:function (td, selected) {
						td = td || jS.obj.cellActive().td || null;

						if (td === null) {
							td = jS.rowTds(null, 1)[1];
							jS.cellEdit(td);
						}

						if (td === null) return;

						(jS.obj.inPlaceEdit().destroy || emptyFN)();

						var formula = jS.obj.formula(),
							val = formula.val(),
							textarea,
							$textarea,
							pane = jS.obj.pane();

						if (!td.isHighlighted) return; //If the td is a dud, we do not want a textarea

						textarea = document.createElement('textarea');
						$textarea = $(textarea);
						pane.inPlaceEdit = textarea;
						textarea.i = jS.i;
						textarea.className = jS.cl.inPlaceEdit + ' ' + jS.theme.inPlaceEdit;
						textarea.td = td;
						//td / tr / tbody / table
						textarea.table = td.parentNode.parentNode.parentNode;
						textarea.goToTd = function() {
							this.offset = $(td).position();
							if (!this.offset.left && !this.offset.right) {
								$(textarea).hide();
							} else {
								this.setAttribute('style',
									'left:' + (this.offset.left - 1) + 'px;' +
										'top:' + (this.offset.top - 1) + 'px;' +
										'width:' + this.td.clientWidth + 'px;' +
										'height:' + this.td.clientHeight + 'px;' +
										'min-width:' + this.td.clientWidth + 'px;' +
										'min-height:' + this.td.clientHeight + 'px;');
							}
						};
						textarea.goToTd();
						textarea.onkeydown = jS.evt.inPlaceEdit.keydown;
						textarea.onchange =
							textarea.onkeyup =
								function() { formula[0].value = textarea.value; };

						textarea.onfocus = function () { jS.setNav(false); };

						textarea.onblur =
							textarea.onfocusout =
								function () { jS.setNav(true); };

						textarea.onpaste = jS.evt.pasteOverCells;

						textarea.destroy = function () {
							pane.inPlaceEdit = null;
							jS.cellLast.isEdit = (textarea.value != val);
							textarea.parentNode.removeChild(textarea);
							jS.controls.inPlaceEdit[textarea.i] = false;
						};

						pane.appendChild(textarea);

						textarea.onfocus();

						jS.controls.inPlaceEdit[jS.i] = textarea;


						//This is a little trick to get the cursor to the end of the textarea
						$textarea
							.focus()
							.val('')
							.val(formula[0].value);

						if (selected) {
							$textarea.select();
						}

						//Make the textarea resizable automatically
						if ($.fn.elastic) {
							$(textarea).elastic();
						}
					},

					/**
					 * Created the autoFiller object
					 * @returns {*|jQuery|null}
					 * @memberOf jS.controlFactory
					 * @param {HTMLElement} pane
					 */
					autoFiller:function (pane) {
						if (!s.autoFiller) return false;

						var autoFiller = document.createElement('div'),
							handle = document.createElement('div'),
							cover = document.createElement('div');

						autoFiller.i = jS.i;

						autoFiller.className = jS.cl.autoFiller + ' ' + jS.theme.autoFiller;
						handle.className = jS.cl.autoFillerHandle;
						cover.className = jS.cl.autoFillerCover;

						autoFiller.onmousedown = function () {
							var td = jS.obj.tdActive();
							if (td) {
								var loc = jS.getTdLocation(td);
								jS.cellSetActive(td, loc, true, jS.autoFillerNotGroup, function () {
									var highlighted = jS.highlighted(),
										hLoc = jS.getTdLocation(highlighted.last());
									jS.fillUpOrDown(hLoc.row < loc.row || hLoc.col < loc.col);
									jS.autoFillerGoToTd(td);
									jS.autoFillerNotGroup = false;
								});
							}

							return false;
						};

						pane.autoFiller = jS.controls.autoFiller[jS.i] = autoFiller;
						pane.appendChild(autoFiller);
						return true;
					}
				},

				/**
				 * Allows grouping of cells
				 * @memberOf jS
				 */
				autoFillerNotGroup:true,


				tsv: new TSV(),
				/**
				 * Sends tab delimited string into cells, usually a paste from external spreadsheet application
				 * @param [oldVal] what formula should be when this is done working with all the values
				 * @returns {Boolean}
				 * @memberOf jS
				 */
				updateCellsAfterPasteToFormula:function (oldVal) {
					var newValCount = 0,
						formula = jS.obj.formula(),
						startCell = jS.cellLast;

					oldVal = oldVal || formula.val();

					var val = formula.val(), //once ctrl+v is hit formula now has the data we need
						firstValue = val;

					//at this point we need to check if there is even a cell selected, if not, we can't save the information, so clear formula editor
					if ((startCell.rowIndex == 0 && startCell.columnIndex == 0) || val.length === 0) {
						return false;
					}

					var parsedRows = jS.tsv.parse(val);

					//Single cell value
					if (!$.isArray(parsedRows)) {
						formula.val(parsedRows);
						jS.fillUpOrDown(false, parsedRows);
						return true;
					}

					var i = 0,
						j,
						parsedColumns,
						spreadsheet,
						row,
						cell;

					//values that need put into multi cells
					for (; i < parsedRows.length; i++) {
						startCell.isEdit = true;
						parsedColumns = parsedRows[i];
						for (j = 0; j < parsedColumns.length; j++) {
							newValCount++;

							if (
								!(spreadsheet = jS.spreadsheets[jS.i])
								|| !(row = spreadsheet[i + startCell.rowIndex])
								|| !(cell = row[j + startCell.columnIndex])
							) continue;

							if (cell) {
								(function(cell, parsedColumn) {
									s.parent.one('sheetPreCalculation', function () {
										if ((parsedColumn + '').charAt(0) == '=') { //we need to know if it's a formula here
											cell.formula = parsedColumn.substring(1);
											cell.value = '';
										} else {
											cell.formula = '';
											cell.value = parsedColumn;
										}
									});
								})(cell, parsedColumns[j]);
								jS.resolveCell(cell);

								if (i == 0 && j == 0) { //we have to finish the current edit
									firstValue = parsedColumns[j];
								}
							}

						}
					}

					if (val != firstValue) {
						formula.val(firstValue);
					}

					jS.fillUpOrDown(false, firstValue);

					jS.evt.cellEditDone(true);

					return true;
				},

				/**
				 * Event handlers for instance
				 * @memberOf jS
				 * @namespace
				 */
				evt:{

					inPlaceEdit:{
						/**
						 *
						 * @param {Object} e jQuery event
						 * @returns {*}
						 * @memberOf jS.evt.inPlaceEdit
						 */
						enter:function (e) {
							if (e.shiftKey) {
								return true;
							}
							return jS.evt.cellSetActiveFromKeyCode(e, true);
						},

						/**
						 *
						 * @param {Object} e jQuery event
						 * @returns {*}
						 * @memberOf jS.evt.inPlaceEdit
						 */
						tab:function (e) {
							if (e.shiftKey) {
								return true;
							}
							return jS.evt.cellSetActiveFromKeyCode(e, true);
						},
						/**
						 * Edits the textarea that appears over cells for in place edit
						 * @param {Object} e jQuery event
						 * @returns {*}
						 * @memberOf jS.evt.inPlaceEdit
						 */
						keydown:function (e) {
							e = e || window.event;
							jS.trigger('sheetFormulaKeydown', [true]);

							switch (e.keyCode) {
								case key.ENTER:
									return jS.evt.inPlaceEdit.enter(e);
									break;
								case key.TAB:
									return jS.evt.inPlaceEdit.tab(e);
									break;
								case key.ESCAPE:
									jS.evt.cellEditAbandon();
									return false;
									break;
							}
						}
					},

					formula:{
						/**
						 *
						 * @param {Object} e jQuery event
						 * @returns {*}
						 * @memberOf jS.evt.formula
						 */
						keydown:function (e) {
							e = e || window.event;
							if (jS.readOnly[jS.i]) return false;
							if (jS.cellLast === null) return false;
							if (jS.cellLast.rowIndex < 0 || jS.cellLast.columnIndex < 0) return false;

							jS.trigger('sheetFormulaKeydown', [false]);

							switch (e.keyCode) {
								case key.C:
									if (e.ctrlKey) {
										return jS.evt.document.copy(e);
									}
								case key.X:
									if (e.ctrlKey) {
										return jS.evt.document.cut(e);
									}
								case key.Y:
									if (e.ctrlKey) {
										jS.evt.document.redo(e);
										return false;
									}
									break;
								case key.Z:
									if (e.ctrlKey) {
										jS.evt.document.undo(e);
										return false;
									}
									break;
								case key.ESCAPE:
									jS.evt.cellEditAbandon();
									return true;
									break;
								case key.ENTER:
									jS.evt.cellSetActiveFromKeyCode(e, true);
									return false;
									break;
								case key.UNKNOWN:
									return false;
							}

							jS.cellLast.isEdit = true;
						},

						/**
						 * Helper for events
						 * @param {Boolean} ifTrue
						 * @param e {Object} jQuery event
						 * @returns {*}
						 * @memberOf jS.evt.keydownHandler
						 */
						If:function (ifTrue, e) {
							if (ifTrue) {
								$(jS.obj.tdActive()).dblclick();
								return true;
							}
							return false;
						}
					},

					/**
					 * Key down handlers
					 * @memberOf jS.evt
					 */
					document:{
						/**
						 *
						 * @param {Object} e jQuery event
						 * @returns {*}
						 * @memberOf jS.evt.document
						 */
						enter:function (e) {
							if (!jS.cellLast.isEdit && !e.ctrlKey) {
								$(jS.obj.tdActive()).dblclick();
							}
							return false;
						},

						/**
						 *
						 * @param {Object} e jQuery event
						 * @returns {*}
						 * @memberOf jS.evt.document
						 */
						tab:function (e) {
							jS.evt.cellSetActiveFromKeyCode(e);
						},

						/**
						 *
						 * @param {Object} e jQuery event
						 * @returns {*}
						 * @memberOf jS.evt.document
						 */
						findCell:function (e) {
							if (e.ctrlKey) {
								jS.cellFind();
								return false;
							}
							return true;
						},

						/**
						 *
						 * @param {Object} e jQuery event
						 * @returns {*}
						 * @memberOf jS.evt.document
						 */
						redo:function (e) {
							if (e.ctrlKey && !jS.cellLast.isEdit) {
								jS.undo.manager.redo();
								return false;
							}
							return true;
						},

						/**
						 *
						 * @param {Object} e jQuery event
						 * @returns {*}
						 * @memberOf jS.evt.document
						 */
						undo:function (e) {
							if (e.ctrlKey && !jS.cellLast.isEdit) {
								jS.undo.manager.undo();
								return false;
							}
							return true;
						},

						/**
						 * Copy what is in the highlighted tds
						 * @param [e]
						 * @param [clearValue]
						 * @returns {Boolean}
						 */
						copy:function (e, clearValue) {
							var tds = jS.highlighted(true),
								formula = jS.obj.formula(),
								oldValue = formula.val(),
								cellsTsv = jS.toTsv(tds, clearValue);

							formula
								.val(cellsTsv)
								.focus()
								.select();

							$document
								.one('keyup', function () {
									if (clearValue) {
										formula.val('');
									} else {
										formula.val(oldValue);
									}
								});

							return true;
						},

						cut:function (e) {
							return this.copy(e, true);
						},

						/**
						 * Manages the page up and down buttons
						 * @param {Boolean} [reverse] Go up or down
						 * @returns {Boolean}
						 * @memberOf jS.evt.document
						 */
						pageUpDown:function (reverse) {
							var size = jS.sheetSize(),
								pane = jS.obj.pane(),
								paneHeight = pane.clientHeight,
								prevRowsHeights = 0,
								thisRowHeight = 0,
								td,
								i;
							//TODO: refactor to use scroll position
							if (reverse) { //go up
								for (i = jS.cellLast.rowIndex; i > 0 && prevRowsHeights < paneHeight; i--) {
									td = jS.getTd(-1, i, 1);
									if (td !== null && !td.getAttribute('data-hidden') && $(td).is(':hidden')) $(td).show();
									prevRowsHeights += td.parentNode.clientHeight;
								}
							} else { //go down
								for (i = jS.cellLast.rowIndex; i < size.rows && prevRowsHeights < paneHeight; i++) {
									td = jS.getTd(-1, i, 1);
									if (td === null) continue;
									prevRowsHeights += td.parentNode.clientHeight;
								}
							}
							jS.cellEdit(td);

							return false;
						},

						/**
						 *
						 * @param {Object} e jQuery event
						 * @returns {*}
						 * @memberOf jS.evt.document
						 */
						keydown:function (e) {
							e = e || window.event;
							if (jS.readOnly[jS.i]) return false;
							if (jS.cellLast === null) return;
							if (jS.cellLast.rowIndex < 0 || jS.cellLast.columnIndex < 0) return false;
							var td = jS.cellLast.td;

							if (jS.nav) {
								//noinspection FallthroughInSwitchStatementJS
								switch (e.keyCode) {
									case key.DELETE:
										jS.toTsv(null, true);
										jS.obj.formula().val('');
										jS.cellLast.isEdit = true;
										break;
									case key.TAB:
										jS.evt.document.tab(e);
										break;
									case key.ENTER:
										jS.evt.cellSetActiveFromKeyCode(e);
										break;
									case key.LEFT:
									case key.UP:
									case key.RIGHT:
									case key.DOWN:
										(e.shiftKey ? jS.evt.cellSetHighlightFromKeyCode(e) : jS.evt.cellSetActiveFromKeyCode(e));
										break;
									case key.PAGE_UP:
										jS.evt.document.pageUpDown(true);
										break;
									case key.PAGE_DOWN:
										jS.evt.document.pageUpDown();
										break;
									case key.HOME:
									case key.END:
										jS.evt.cellSetActiveFromKeyCode(e);
										break;
									case key.V:
										if (e.ctrlKey) {
											return jS.evt.formula.If(!jS.evt.pasteOverCells(e), e);
										} else {
											$(td).trigger('cellEdit');
											return true;
										}
										break;
									case key.Y:
										if (e.ctrlKey) {
											jS.evt.document.redo(e);
											return false;
										} else {
											$(td).trigger('cellEdit');
											return true;
										}
										break;
									case key.Z:
										if (e.ctrlKey) {
											jS.evt.document.undo(e);
											return false;
										} else {
											$(td).trigger('cellEdit');
											return true;
										}
										break;
									case key.ESCAPE:
										jS.evt.cellEditAbandon();
										break;
									case key.F:
										if (e.ctrlKey) {
											return jS.evt.formula.If(jS.evt.document.findCell(e), e);
										} else {
											$(td).trigger('cellEdit');
											return true;
										}
										break;
									case key.CAPS_LOCK:
									case key.SHIFT:
									case key.ALT:
										break;
									case key.CONTROL: //we need to filter these to keep cell state
										jS.obj.formula().focus().select();
										return true;
										break;
									default:
										if (jS.obj.inPlaceEdit().td !== td) {
											$(td).trigger('cellEdit');
										}
										return true;
										break;
								}
								return false;
							}
						}
					},

					/**
					 * Used for pasting from other spreadsheets
					 * @param {Object} e jQuery event
					 * @returns {Boolean}
					 * @memberOf jS.evt
					 */
					pasteOverCells:function (e) {
						e = e || window.event;
						if (e.ctrlKey || e.type == "paste") {
							var fnAfter = function () {
								jS.updateCellsAfterPasteToFormula();
							};

							var $doc = $document
								.one('keyup', function () {
									fnAfter();
									fnAfter = function () {
									};
									$doc.mouseup();
								})
								.one('mouseup', function () {
									fnAfter();
									fnAfter = function () {
									};
									$doc.keyup();
								});

							jS.setDirty(true);
							jS.setChanged(true);
							return true;
						}

						return false;
					},

					/**
					 * Updates a cell after edit afterward event "sheetCellEdited" is called w/ params (td, row, col, spreadsheetIndex, sheetIndex)
					 * @param {Boolean} [force] if set to true forces a calculation of the selected sheet
					 * @memberOf jS.evt
					 */
					cellEditDone:function (force) {
						var inPlaceEdit = jS.obj.inPlaceEdit(),
							inPlaceEditHasFocus = $(inPlaceEdit).is(':focus'),
							cellLast = jS.cellLast,
							cell;

						(inPlaceEdit.destroy || emptyFN)();
						if (cellLast !== null && (cellLast.isEdit || force)) {
							cell = jS.getCell(cellLast.sheetIndex, cellLast.rowIndex, cellLast.columnIndex);
							var formula = (inPlaceEditHasFocus ? $(inPlaceEdit) : jS.obj.formula()),
								td = cell.td;

							if (jS.isFormulaEditable(td)) {
								//Lets ensure that the cell being edited is actually active
								if (td !== null && cell.rowIndex > 0 && cell.columnIndex > 0) {

									//This should return either a val from textbox or formula, but if fails it tries once more from formula.
									var v = formula.val(),
										i = 0,
										loader = s.loader,
										loadedFrom;

									if (!cell.edited) {
										cell.edited = true;
										jS.obj.cellsEdited().push(cell);
									}

									s.parent.one('sheetPreCalculation', function () {
										//reset formula to null so it can be re-evaluated
										cell.parsedFormula = null;
										if (v.charAt(0) == '=') {
											//change only formula, previous value will be stored and recalculated momentarily
											cell.formula = v = v.substring(1);
										} else {
											cell.value = v;
											cell.formula = '';

											if ((loadedFrom = cell.loadedFrom) !== null) {
												loader.setCellAttributes(loadedFrom, {
													'cache': u,
													'formula': '',
													'value': v,
													'parsedFormula': null
												});
											}
										}

										cell.setNeedsUpdated();
									});
									jS.resolveCell(cell);

									//formula.focus().select();
									cell.isEdit = false;

									//perform final function call
									jS.trigger('sheetCellEdited', [cell]);
								}
							}
						}
					},

					/**
					 * Abandons a cell edit
					 * @param {Boolean} [skipCalc] if set to true will skip sheet calculation;
					 * @memberOf jS.evt
					 */
					cellEditAbandon:function (skipCalc) {
						(jS.obj.inPlaceEdit().destroy || emptyFN)();

						jS.highlighter
							.clearBar()
							.clear();

						var cell = jS.cellLast;
						if (!skipCalc && cell !== null) {
							cell.updateValue();
						}

						jS.cellLast = null;
						jS.rowLast = 0;
						jS.colLast = 0;
						jS.highlighter.startRowIndex = 0;
						jS.highlighter.startColumnIndex = 0;
						jS.highlighter.endRowIndex = 0;
						jS.highlighter.endColumnIndex = 0;

						jS.labelUpdate('');
						jS.obj.formula()
							.val('')
							.blur();

						jS.autoFillerHide();

						return false;
					},


					/**
					 * Highlights a cell from a key code
					 * @param {Object} e jQuery event
					 * @returns {Boolean}
					 * @memberOf jS.evt
					 */
					cellSetHighlightFromKeyCode:function (e) {
						var grid = jS.orderedGrid(jS.highlighter),
							size = jS.sheetSize(),
							cellActive = jS.cellActive,
							highlighter = jS.highlighter;

						if (cellActive === null) return false;

						switch (e.keyCode) {
							case key.UP:
								if (grid.startRowIndex < cellActive.rowIndex) {
									grid.startRowIndex--;
									grid.startRowIndex = grid.startRowIndex > 0 ? grid.startRowIndex : 1;
									break;
								}

								grid.endRowIndex--;
								grid.endRowIndex = grid.endRowIndex > 0 ? grid.endRowIndex : 1;

								break;
							case key.DOWN:
								//just beginning the highlight
								if (grid.startRowIndex === grid.endRowIndex) {
									grid.startRowIndex++;
									grid.startRowIndex = grid.startRowIndex < size.rows ? grid.startRowIndex : size.rows;
									break;
								}

								//if the highlight is above the active cell, then we have selected up and need to move down
								if (grid.startRowIndex < cell.rowIndex) {
									grid.startRowIndex++;
									grid.startRowIndex = grid.startRowIndex > 0 ? grid.startRowIndex : 1;
									break;
								}

								//otherwise we increment the row, and limit it to the size of the total grid
								grid.endRowIndex++;
								grid.endRowIndex = grid.endRowIndex < size.rows ? grid.endRowIndex : size.rows;

								break;
							case key.LEFT:
								if (grid.startColumnIndex < cell.columnIndex) {
									grid.startColumnIndex--;
									grid.startColumnIndex = grid.startColumnIndex > 0 ? grid.startColumnIndex : 1;
									break;
								}

								grid.endColumnIndex--;
								grid.endColumnIndex = grid.endColumnIndex > 0 ? grid.endColumnIndex : 1;

								break;
							case key.RIGHT:
								if (grid.startColumnIndex < cell.columnIndex) {
									grid.startColumnIndex++;
									grid.startColumnIndex = grid.startColumnIndex < size.cols ? grid.startColumnIndex : size.cols;
									break;
								}

								grid.endColumnIndex++;
								grid.endColumnIndex = grid.endColumnIndex < size.cols ? grid.endColumnIndex : size.cols;

								break;
						}

						//highlight the cells
						highlighter.startRowIndex = grid.startRowIndex;
						highlighter.startColumnIndex = grid.startColumnIndex;
						highlighter.endRowIndex = grid.endRowIndex;
						highlighter.endColumnIndex = grid.endColumnIndex;

						jS.cycleCellArea(function (o) {
							highlighter.set(o.td);
						}, grid);

						return false;
					},


					/**
					 * Activates a cell from a key code
					 * @param {Object} e jQuery event
					 * @param {Boolean} [skipMove]
					 * @returns {Boolean}
					 * @memberOf jS.evt
					 */
					cellSetActiveFromKeyCode:function (e, skipMove) {
						if (jS.cellLast === null) return false;

						var cell = jS.cellLast,
							loc = {
								rowIndex: cell.rowIndex,
								columnIndex: cell.columnIndex
							},
							spreadsheet,
							row,
							nextCell,
							overrideIsEdit = false,
							highlighted,
							doNotClearHighlighted = false;

						switch (e.keyCode) {
							case key.UP:
								loc.rowIndex--;
								break;
							case key.DOWN:
								loc.rowIndex++;
								break;
							case key.LEFT:
								loc.columnIndex--;
								break;
							case key.RIGHT:
								loc.columnIndex++;
								break;
							case key.ENTER:
								loc = jS.evt.incrementAndStayInGrid(jS.orderedGrid(jS.highlighter), loc, true, e.shiftKey);
								overrideIsEdit = true;
								highlighted = jS.highlighted();
								if (highlighted.length > 1) {
									doNotClearHighlighted = true;
								} else {
									if (!skipMove) {
										loc.rowIndex += (e.shiftKey ? -1 : 1);
									}
									//TODO: go down one row, and possibly scroll to cell if needed
								}
								break;
							case key.TAB:
								loc = jS.evt.incrementAndStayInGrid(jS.orderedGrid(jS.highlighter), loc, false, e.shiftKey);
								overrideIsEdit = true;
								highlighted = jS.highlighted();
								if (highlighted.length > 1) {
									doNotClearHighlighted = true;
								} else {
									if (!skipMove) {
										loc.columnIndex += (e.shiftKey ? -1 : 1);
									}
									//TODO: go one cell right and scroll if needed
								}
								break;
							case key.HOME:
								loc.columnIndex = 1;
								break;
							case key.END:
								loc.columnIndex = jS.obj.tdActive().parentNode.children.length - 2;
								break;
						}

						//we check here and make sure all values are above 0, so that we get a selected cell
						loc.columnIndex = loc.columnIndex || 1;
						loc.rowIndex = loc.rowIndex || 1;

						//to get the td could possibly make keystrokes slow, we prevent it here so the user doesn't even know we are listening ;)
						if (!cell.isEdit || overrideIsEdit) {
							//get the td that we want to go to
							if ((spreadsheet = jS.spreadsheets[jS.i]) === u) return false;
							if ((row = spreadsheet[loc.rowIndex]) === u) return false;
							if ((nextCell = row[loc.columnIndex]) === u) return false;

							//if the td exists, lets go to it
							if (nextCell !== null) {
								jS.cellEdit(nextCell.td, null, doNotClearHighlighted);
								return false;
							}
						}
						//default, can be overridden above
						return true;
					},

					/**
					 * Calculate position for either horizontal movement or vertical movement within a grid, both forward and reverse
					 * @param {Object} grid
					 * @param {Object} loc
					 * @param {Boolean} isRows
					 * @param {Boolean} reverse
					 * @returns {Object} loc
					 * @memberOf jS.evt
					 */
					incrementAndStayInGrid: function (grid, loc, isRows, reverse) {
						if (isRows) {
							if (reverse) {
								loc.rowIndex--;
								if (loc.rowIndex < grid.startRowIndex) {
									loc.rowIndex = grid.endRowIndex;
									loc.columnIndex--;
								}
								if (loc.columnIndex < grid.startColumnIndex) {
									loc.columnIndex = grid.endColumnIndex;
								}
							} else {
								loc.rowIndex++;
								if (loc.rowIndex > grid.endRowIndex) {
									loc.rowIndex = grid.startRowIndex;
									loc.columnIndex++;
								}
								if (loc.columnIndex > grid.endColumnIndex) {
									loc.columnIndex = grid.startColumnIndex;
								}
							}
						}
						else {
							if (reverse) {
								loc.columnIndex--;
								if (loc.columnIndex < grid.startColumnIndex) {
									loc.columnIndex = grid.endColumnIndex;
									loc.rowIndex--;
								}
								if (loc.rowIndex < grid.startRowIndex) {
									loc.rowIndex = grid.endRowIndex;
								}
							} else {
								loc.columnIndex++;
								if (loc.columnIndex > grid.endColumnIndex) {
									loc.columnIndex = grid.startColumnIndex;
									loc.rowIndex++;
								}
								if (loc.rowIndex > grid.endRowIndex) {
									loc.rowIndex = grid.startRowIndex;
								}
							}
						}
						return loc;
					},

					/**
					 * Cell on mouse down
					 * @param {Object} e jQuery event
					 * @memberOf jS.evt
					 */
					cellOnMouseDown:function (e) {


						jS.obj.formula().blur();
						if (e.shiftKey) {
							jS.getTdRange(e, jS.obj.formula().val());
						} else {
							jS.cellEdit(e.target, true);
						}
					},

					/**
					 * Cell on double click
					 * @param {Object} e jQuery event
					 * @memberOf jS.evt
					 */
					cellOnDblClick:function (e) {
						if (jS.isBusy()) {
							return false;
						}

						jS.controlFactory.inPlaceEdit();

						return true;
					},

					cellEdit: function(e) {
						if (jS.isBusy()) {
							return false;
						}

						jS.controlFactory.inPlaceEdit(null, true);

						return true;
					},

					/**
					 * Handles bar events, used for highlighting and activating
					 * @memberOf jS.evt
					 * @namespace
					 */
					barInteraction:{

						/**
						 * The first bar that received the event (mousedown)
						 * @memberOf jS.evt.barInteraction
						 */
						first:null,

						/**
						 * The last bar that received the event (mousedown)
						 * @memberOf jS.evt.barInteraction
						 */
						last:null,

						/**
						 * Tracks if we are in select mode
						 * @memberOf jS.evt.barInteraction
						 */
						selecting:false,

						/**
						 * Manages the bar selection
						 * @param {Object} target
						 * @returns {*}
						 * @memberOf jS.evt.barInteraction
						 */
						select:function (target) {
							if (!target) return;
							if (!target.type === 'bar') return;
							var bar = target,
								entity = bar.entity, //returns "top" or "left";
								index = bar.index;

							if (index < 0) return false;

							jS.evt.barInteraction.last = jS.evt.barInteraction.first = jS[entity + 'Last'] = index;

							jS.cellSetActiveBar(entity, jS.evt.barInteraction.first, jS.evt.barInteraction.last);

							jS.evt.barInteraction.selecting = true;
							$document
								.one('mouseup', function () {
									jS.evt.barInteraction.selecting = false;
								});

							return false;
						}
					}
				},

				/**
				 *
				 * @param {Number} start index to start from
				 * @memberOf jS
				 */
				refreshColumnLabels:function (start) {
					start = start || 0;

					var $barMenuParentTop = jS.obj.barMenuParentTop();
					if (($barMenuParentTop) && ($barMenuParentTop.length)){
						var barMenuParentTop = $barMenuParentTop.get(0);
						if ($.isFunction(barMenuParentTop.destroy)) { 
							barMenuParentTop.destroy(); 
						}
					}

					var ths = jS.controls.bar.x.th[jS.i],
						th;

					if (!ths) return;

					for (var i = Math.max(start, 0); i < ths.length; i++) {
						//greater than 1 (corner)
						if (i > 0) {
							th = ths[i];
							th.innerHTML = th.label = jS.cellHandler.columnLabelString(th.cellIndex);
						}
					}
				},


				/**
				 *
				 * @param {Number} start index to start from
				 * @param {Number} [end] index to end at
				 * @memberOf jS
				 */
				refreshRowLabels:function (start, end) {
					start = start || 0;

					var ths = jS.controls.bar.y.th[jS.i],
						th;

					if (!ths) return;

					end = end || ths.length;

					for (var i = start; i < end; i++) {
						if (i > 0 && (th = ths[i]) !== u) {
							th.innerHTML = th.label = th.parentNode.rowIndex;
						}
					}
				},

				/**
				 * Detects if an object is a td within a spreadsheet's table
				 * @param {jQuery|HTMLElement} o target
				 * @returns {Boolean}
				 * @memberOf jS
				 */
				isCell:function (o) {
					if (o && o.jSCell !== u) {
						return true;
					}
					return false;
				},

				/**
				 * Detects if an object is a bar td within a spreadsheet's table
				 * @param {HTMLElement} o target
				 * @returns {Boolean}
				 * @memberOf jS
				 */
				isBar:function (o) {
					if (o.tagName == 'TH') {
						return true;
					}
					return false;
				},

				/**
				 * Tracks read state of spreadsheet
				 * @memberOf jS
				 */
				readOnly:[],

				/**
				 * Detects read state of a spreadsheet
				 * @param {Number} [i] index of spreadsheet within instance
				 * @returns {Boolean}
				 * @memberOf jS
				 */
				isSheetEditable:function (i) {
					i = i || jS.i;
					return (
						s.editable == true && !jS.readOnly[i]
						);
				},

				/**
				 * Detects read state of formula of an object
				 * @param {jQuery|HTMLElement} o target
				 * @returns {Boolean}
				 * @memberOf jS
				 */
				isFormulaEditable:function (o) {
					if (s.lockFormulas) {
						if (o.data('formula') !== u) {
							return false;
						}
					}
					return true;
				},

				/**
				 * Toggles full screen mode
				 * @memberOf jS
				 */
				toggleFullScreen:function () {
					if (!jS) return;
					jS.evt.cellEditDone();
					var fullScreen = jS.obj.fullScreen(),
						pane = jS.obj.pane();
					if (fullScreen.is(':visible')) {
						$window.unbind('jSResize');
						$body.removeClass('bodyNoScroll');
						s.parent = fullScreen[0].origParent;

						s.parent.prepend(fullScreen.children());

						fullScreen.remove();

						jS.sheetSyncSize();
						if (pane.inPlaceEdit) {
							pane.inPlaceEdit.goToTd();
						}
						jS.trigger('sheetFullScreen', [false]);
					} else { //here we make a full screen
						$body.addClass('bodyNoScroll');

						var parent = $(s.parent),
							fullScreen = document.createElement('div'),
							events = $._data(s.parent[0], 'events');

						fullScreen.className = jS.cl.fullScreen + ' ' + jS.theme.fullScreen + ' ' + jS.cl.parent;

						fullScreen.origParent = parent;
						s.parent = jS.controls.fullScreen = $(fullScreen)
							.append(parent.children())
							.appendTo($body);

						$window
							.bind('resize', function() {
								$window.trigger('jSResize');
							})
							.bind('jSResize', function () {
								this.w = $window.width();
								this.h = $window.height();
								s.parent
									.width(this.w)
									.height(this.h);

								jS.sheetSyncSize();
								if (pane.inPlaceEdit) {
									pane.inPlaceEdit.goToTd();
								}
							})
							.trigger('jSResize');


						parent.trigger('sheetFullScreen', [true]);

						for (var event in events) {
							for (var i = 0; i < events[event].length; i++) {
								s.parent.bind(event, events[event][i].handler);
							}
						}
					}
				},

				/**
				 * Assists in rename of spreadsheet
				 * @memberOf jS
				 */
				renameSheet:function (i) {
					if (n(i)) {
						return false;
					}

					if (i > -1) {
						jS.sheetTab();
					}

					return true;
				},

				/**
				 * Switches spreadsheet
				 * @param {Number} i index of spreadsheet within instance
				 * @memberOf jS
				 */
				switchSheet:function (i) {
					if (n(i)) {
						return false;
					}

					if (i == -1) {
						jS.addSheet();
					} else if (i != jS.i) {
						jS.setActiveSheet(i);
						if (s.loader === null) {
							jS.calc(i);
						}
					}

					return true;
				},


				toggleHideRow: function(i) {
					if (i === undefined) {
						i = jS.rowLast;
					}

					if (i === undefined) return;

					var actionUI = jS.obj.pane().actionUI;

					if (actionUI.hiddenRows.indexOf(i) > -1) {
						actionUI.showRow(i);
					} else {
						actionUI.hideRow(i);
					}

					jS.autoFillerGoToTd();
				},
				toggleHideRowRange: function(startIndex, endIndex) {
					var actionUI = jS.obj.pane().actionUI;

					if (actionUI.hiddenRows.indexOf(startIndex) > -1) {
						actionUI.showRowRange(startIndex, endIndex);
					} else {
						actionUI.hideRowRange(startIndex, endIndex);
					}

					jS.autoFillerGoToTd();
				},
				toggleHideColumn: function(i) {
					if (i === undefined) {
						i = jS.colLast;
					}

					if (i === undefined) return;

					var actionUI = jS.obj.pane().actionUI;

					if (actionUI.hiddenColumns.indexOf(i) > -1) {
						actionUI.showColumn(i);
					} else {
						actionUI.hideColumn(i);
					}

					jS.autoFillerGoToTd();
				},
				toggleHideColumnRange: function(startIndex, endIndex) {
					var actionUI = jS.obj.pane().actionUI;

					if (actionUI.hiddenColumns.indexOf(startIndex) > -1) {
						actionUI.showColumnRange(startIndex, endIndex);
					} else {
						actionUI.hideColumnRange(startIndex, endIndex);
					}

					jS.autoFillerGoToTd();
				},
				rowShowAll: function() {
					jS.obj.pane().actionUI.rowShowAll();
				},
				columnShowAll: function() {
					jS.obj.pane().actionUI.columnShowAll();
				},
				/**
				 * Merges cells together
				 * @param {Object} [tds]
				 * @memberOf jS
				 */
				merge:function (tds) {
					tds = tds || jS.highlighted();
					if (!tds.length) {
						return;
					}
					var
						cellsValue = [],
						firstTd = tds[0],
						lastTd = tds[tds.length - 1],
						firstLocRaw = jS.getTdLocation(firstTd),
						lastLocRaw = jS.getTdLocation(lastTd),
						firstLoc = {},
						lastLoc = {},
						colSpan = 0,
						rowSpan = 0,
						i = tds.length - 1,
						cell,
						_td,
						td,
						loc;

					if (firstLocRaw.row) {
						jS.setDirty(true);
						jS.setChanged(true);

						if (firstLocRaw.row < lastLocRaw.row) {
							firstLoc.row = firstLocRaw.row;
							lastLoc.row = lastLocRaw.row;
							td = firstTd;
						} else {
							firstLoc.row = lastLocRaw.row;
							lastLoc.row = firstLocRaw.row;
							td = lastTd;
						}

						if (td.hasAttribute('rowSpan') || td.hasAttribute('colSpan')) {
							return false;
						}

						if (firstLocRaw.col < lastLocRaw.col) {
							firstLoc.col = firstLocRaw.col;
							lastLoc.col = lastLocRaw.col;
						} else {
							firstLoc.col = lastLocRaw.col;
							lastLoc.col = firstLocRaw.col;
						}

						rowSpan = (lastLoc.row - firstLoc.row) + 1;
						colSpan = (lastLoc.col - firstLoc.col) + 1;

						loc = jS.getTdLocation(td);

						do {
							_td = tds[i];
							cell = _td.jSCell;
							if (cell.formula || cell.value) {
								cellsValue.unshift(cell.formula ? "(" + cell.formula.substring(1) + ")" : cell.value);
							}
							s.parent.one('sheetPreCalculation', function () {
								if (_td.cellIndex != loc.col || _td.parentNode.rowIndex != loc.row) {
									cell.formula = '';
									cell.value = '';
									cell.defer = td.jSCell;

									_td.innerHTML = '';
									//_td.style.display = 'none';
									_td.style.visibility = 'collapse';
									//_td.colSpan = colSpan - (_td.cellIndex - td.cellIndex);
									//_td.rowSpan = rowSpan - (_td.parentNode.rowIndex - td.parentNode.rowIndex);
								}
							});

							jS.resolveCell(cell);
						} while(i--);

						td.jSCell.value = $.trim(cellsValue.join(' '));
						td.jSCell.formula = $.trim(td.jSCell.formula ? cellsValue.join(' ') : '');

						td.setAttribute('rowSpan', rowSpan);
						td.setAttribute('colSpan', colSpan);
						td.style.display = '';
						td.style.visibility = '';
						td.style.position = '';
						td.style.height = td.clientHeight + 'px';
						td.style.width = td.clientWidth + 'px';
						td.style.position = 'absolute';

						jS.resolveCell(td.jSCell);
						jS.evt.cellEditDone();
						jS.autoFillerGoToTd(td);
						jS.cellSetActive(td, loc);
					}
					return true;
				},

				/**
				 * Unmerges cells together
				 * @param {jQuery} [td]
				 * @memberOf jS
				 */
				unmerge:function (td) {
					td = td || jS.highlighted();
					if (!td) {
						return;
					}
					var loc = jS.getTdLocation(td),
						last = new Date(),
						row = math.max(td.getAttribute('rowSpan') * 1, 1) - 1,
						col = math.max(td.getAttribute('colSpan') * 1, 1) - 1,
						i = row + loc.row,
						j,
						_td,
						tds = [];

					if (row == 0 && col == 0) {
						return false;
					}

					do {
						j = loc.col + col;
						do {
							_td = jS.getTd(-1, i, j);
							if (_td === null) continue;
							_td.style.display = '';
							_td.style.visibility = '';
							_td.removeAttribute('colSpan');
							_td.removeAttribute('rowSpan');
							_td.jSCell.defer = null;

							jS.resolveCell(_td.jSCell, last);

							tds.push(_td);
						} while (j-- > loc.col);
					} while (i-- > loc.row);

					jS.evt.cellEditDone();
					jS.autoFillerGoToTd(td);
					jS.cellSetActive(td, loc);
					jS.highlighter.set(tds);
					return true;
				},

				/**
				 * Fills values down or up to highlighted cells from active cell;
				 * @param {Boolean} [goUp] default is down, when set to true value are filled from bottom, up;
				 * @param {String} [v] the value to set cells to, if not set, formula will be used;
				 * @param {Object} [cells]
				 * @memberOf jS
				 * @returns {Boolean}
				 */
				fillUpOrDown:function (goUp, v, cells) {
					jS.evt.cellEditDone();
					cells = cells || jS.highlighted(true);

					if (cells.length < 1) {
						return false;
					}

					var activeTd = jS.obj.tdActive();

					if (cells.length < 1) {
						return false;
					}

					var startLoc = jS.getTdLocation(cells[0].td),
						endLoc = jS.getTdLocation(cells[cells.length - 1].td),
						relativeLoc = jS.getTdLocation(activeTd),
						offset = {
							row:0,
							col:0
						},
						newV = v || activeTd.jSCell.value,
						isNumber = false,
						i = cells.length - 1,
						fn = function() {};

					v = v || activeTd.jSCell.value;

					if (i >= 0) {
						if (v.charAt && v.charAt(0) == '=') {
							if (i >= 0) {
								do {
									if (!goUp) {
										offset.row = relativeLoc.row - endLoc.row;
										offset.col = relativeLoc.col - endLoc.col;
									} else {
										offset.row = relativeLoc.row - startLoc.row;
										offset.col = relativeLoc.col - startLoc.col;
									}

									newV = jS.reparseFormula(v, offset);

									s.parent.one('sheetPreCalculation', function () {
										cells[i].formula = newV;
										cells[i].value = '';
									});

									jS.resolveCell(cells[i]);
								} while (i--);
								return true;
							}
						} else {
							if ((isNumber = !n(newV)) || newV.length > 0) {
								if (isNumber && newV != '') {
									newV *= 1;

									if (goUp) {
										newV -= cells.length - 1;
									}
									fn = function() {
										newV++;
									};
								}
							}

							do {
								s.parent.one('sheetPreCalculation', function () {
									cells[i].formula = '';
									cells[i].value = newV + '';
								});

								jS.resolveCell(cells[i]);

								fn();
							} while (i--);
							return true;
						}
					}

					return false;
				},

				/**
				 * Turns values into a tab separated value
				 * @param {Object} [cells]
				 * @param {String} [clearValue]
				 * @param {Object} [fnEach]
				 * @memberOf jS
				 * @returns {String}
				 */
				toTsv:function (cells, clearValue, fnEach) {
					cells = cells || jS.highlighted(true);
					if (cells.type) {
						cells = [cells];
					}
					fnEach = fnEach || function (loc, cell) {
						if (clearValue) {
							s.parent.one('sheetPreCalculation', function () {
								cell.formula = '';
								cell.value = '';
							});
							jS.resolveCell(cell);
						}
					};
					var cellValues = [],
						firstLoc,
						lastLoc,
						minLoc = {},
						i = cells.length - 1,
						row,
						col;

					if (i >= 0) {
						firstLoc = jS.getTdLocation(cells[0].td);
						lastLoc = jS.getTdLocation(cells[cells.length - 1].td);
						minLoc.row = math.min(firstLoc.row, lastLoc.row);
						minLoc.col = math.min(firstLoc.col, lastLoc.col);
						do {
							var loc = jS.getTdLocation(cells[i].td),
								value = (cells[i].formula ? '=' + cells[i].formula : cells[i].value);

							row = math.abs(loc.row - minLoc.row);
							col = math.abs(loc.col - minLoc.col);

							if (!cellValues[row]) cellValues[row] = [];

							if ((value += '').match(/\n/)) {
								value = '"' + value + '"';
							}

							cellValues[row][col] = (value || '');

							fnEach.call(cells[i].td, loc, cells[i]);
						} while (i-- > 0);


						i = cellValues.length - 1;
						do {
							cellValues[i] = cellValues[i].join('\t');
						} while (i-- > 0);

						return cellValues.join('\n');
					}
					return '';
				},

				/**
				 * Makes cell formulas increment within a range
				 * @param {Object} loc expects keys row,col
				 * @param {Object} offset expects keys row,col, offsets increment
				 * @param {Boolean} [isBefore] inserted before location
				 * @param {Boolean} [wasDeleted]
				 * @memberOf jS
				 */
				offsetFormulas:function (loc, offset, isBefore, wasDeleted) {
					var size = jS.sheetSize(),
					//effected range is the entire spreadsheet
						affectedRange = {
							first:{
								row:0,
								col:0
							},
							last:{
								row:size.rows,
								col:size.cols
							}
						},
						cellStack = [];



					jS.cycleCells(function () {
						var cell = this;
						if (this.formula && typeof this.formula == 'string' && jS.isFormulaEditable(this.td)) {
							this.formula = jS.reparseFormula(this.formula, offset, loc, isBefore, wasDeleted);
						}

						cellStack.push(function() {
							jS.resolveCell(cell, true);
						});

					}, affectedRange.first, affectedRange.last);

					while (cellStack.length) {
						cellStack.pop()();
					}

					jS.evt.cellEditDone();
				},

				cellRegex: /(\$?[a-zA-Z]+|[#]REF[!])(\$?[0-9]+|[#]REF[!])/gi,
				/**
				 * Re-parses a formula
				 * @param formula
				 * @param {Object} offset expects keys row,col, offsets increment
				 * @param {Object} [loc]
				 * @param {Boolean} [isBefore]
				 * @param {Boolean} [wasDeleted]
				 * @returns {String}
				 * @memberOf jS
				 */
				reparseFormula:function (formula, offset, loc, isBefore, wasDeleted) {
					return formula.replace(this.cellRegex, function (ignored, col, row, pos) {
						if (col == "SHEET") return ignored;
						offset = offset || {loc: -1, row: -1};

						var oldLoc = {
								row: row * 1,
								col: jS.cellHandler.columnLabelIndex(col)
							},
							moveCol,
							moveRow,
							override = {
								row: row,
								col: col,
								use: false
							};

						if (loc) {
							if (wasDeleted) {
								if (isBefore) {
									if (oldLoc.col && oldLoc.col == loc.col - 1) {
										override.col = '#REF!';
										override.use = true;
									}
									if (oldLoc.row && oldLoc.row == loc.row - 1) {
										override.row = '#REF!';
										override.use = true;
									}

									if (oldLoc.col >= loc.col) {
										moveCol = true;
									}
									if (oldLoc.row >= loc.row) {
										moveRow = true;
									}
								} else {
									if (loc.col && oldLoc.col == loc.col) {
										override.col = '#REF!';
										override.use = true;
									}
									if (loc.row && oldLoc.row == loc.row) {
										override.row = '#REF!';
										override.use = true;
									}

									if (loc.col && oldLoc.col > loc.col) {
										moveCol = true;
									}
									if (loc.row && oldLoc.row > loc.row) {
										moveRow = true;
									}
								}

								if (override.use) {
									return override.col + override.row;
								}

								if (moveCol) {
									oldLoc.col += offset.col;
									return jS.makeFormula(oldLoc);
								}

								if (moveRow) {
									oldLoc.row += offset.row;
									return jS.makeFormula(oldLoc);
								}
							} else {
								if (isBefore) {
									if (loc.col && oldLoc.col >= loc.col) {
										moveCol = true;
									}
									if (loc.row && oldLoc.row >= loc.row) {
										moveRow = true;
									}
								} else {
									if (loc.col && oldLoc.col > loc.col) {
										moveCol = true;
									}
									if (loc.row && oldLoc.row > loc.row) {
										moveRow = true;
									}
								}

								if (moveCol) {
									oldLoc.col += offset.col;
									return jS.makeFormula(oldLoc);
								}

								if (moveRow) {
									oldLoc.row += offset.row;
									return jS.makeFormula(oldLoc);
								}
							}
						} else {
							return jS.makeFormula(oldLoc, offset);
						}

						return ignored;
					});
				},


				/**
				 * Reconstructs a formula
				 * @param {Object} loc expects keys row,col
				 * @param {Object} [offset] expects keys row,col
				 * @returns {String}
				 * @memberOf jS
				 */
				makeFormula:function (loc, offset) {
					offset = $.extend({row:0, col:0}, offset);

					//set offsets
					loc.col += offset.col;
					loc.row += offset.row;

					//0 based now
					if (loc.col < 0) loc.col = 0;
					if (loc.row < 0) loc.row = 0;

					return jS.cellHandler.parseCellName(loc.col, loc.row);
				},

				/**
				 * Cycles through a certain group of td objects in a spreadsheet table and applies a function to them
				 * @param {Function} fn the function to apply to a cell
				 * @param {Object} [firstLoc] expects keys row,col, the cell to start at
				 * @param {Object} [lastLoc] expects keys row,col, the cell to end at
				 * @param {Number} [i] spreadsheet index within instance
				 * @memberOf jS
				 */
				cycleCells:function (fn, firstLoc, lastLoc, i) {
					i = i || jS.i;
					firstLoc = firstLoc || {rowIndex:0, col:0};

					if (!lastLoc) {
						var size = jS.sheetSize();
						lastLoc = {row:size.rows, col:size.cols};
					}

					var spreadsheet = jS.spreadsheets[i],
						rowIndex,
						colIndex,
						row,
						cell;

					for(colIndex = firstLoc.col; colIndex < lastLoc.col; colIndex++) {
						for(rowIndex = firstLoc.row; rowIndex < lastLoc.row; rowIndex++) {

							if ((row = spreadsheet[rowIndex]) === u) continue;
							if ((cell  = row[colIndex]) === u) continue;

							//Something may have happened to the spreadsheet dimensions, lets go ahead and update the indexes
							cell.rowIndex = rowIndex;
							cell.columnIndex = colIndex;

							fn.call(cell, i, rowIndex, colIndex);
						}
					}
				},

				/**
				 * Cycles through all td objects in a spreadsheet table and applies a function to them
				 * @param fn
				 * @memberOf jS
				 */
				cycleCellsAll:function (fn) {
					var jSI = jS.i, i,size,endLoc;
					for (i = 0; i <= jS.sheetCount; i++) {
						jS.i = i;
						size = jS.sheetSize();
						endLoc = {row:size.rows, col:size.cols};
						jS.cycleCells(fn, {row:0, col:0}, endLoc, i);
					}
					jS.i = jSI;
				},

				/**
				 * Cycles through a certain group of td objects in a spreadsheet table and applies a function to them, firstLoc can be bigger then lastLoc, this is more dynamic
				 * @param {Function} fn the function to apply to a cell
				 * @param {Object} grid {startRowIndex, startColumnIndex, endRowIndex, endColumnIndex}
				 * @memberOf jS
				 */
				cycleCellArea:function (fn, grid) {
					var rowIndex,
						columnIndex,
						row,
						cell,
						i = jS.i,
						o = {cell: [], td: []},
						spreadsheet = jS.spreadsheets[i];

					for(rowIndex = grid.startRowIndex; rowIndex <= grid.endRowIndex; rowIndex++) {
						if ((row = spreadsheet[rowIndex]) === u) continue;

						for(columnIndex = grid.startColumnIndex; columnIndex <= grid.endColumnIndex; columnIndex++) {
							if ((cell = row[columnIndex]) === u) continue;

							o.cell.push(cell);
							o.td.push(cell.td);
						}
					}

					if (fn) {
						fn(o);
					}
				},

				/**
				 * @type Sheet.Theme
				 */
				theme: null,

				/**
				 * @type Sheet.Highlighter
				 */
				highlighter: null,

				/**
				 * jQuery ui resizeable integration
				 * @param {jQuery|HTMLElement} o To set resizable
				 * @param {Object} settings the settings used with jQuery ui resizable
				 * @memberOf jS
				 */
				resizable:function (o, settings) {
					if (!o.data('resizable')) {
						o.resizable(settings);
					}
				},

				/**
				 * instance busy state
				 * @memberOf jS
				 */
				busy:[],


				/**
				 * Set the spreadsheet busy status
				 * @param {Boolean} busy
				 * @memberOf jS
				 */
				setBusy:function (busy) {
					if (busy) {
						jS.busy.push(busy);
					} else {
						jS.busy.pop();
					}

					if (jS.busy.length < 1 && jS.whenNotBusyStack.length > 0) {
						jS.whenNotBusyStack.shift()();
					}
				},

				/**
				 * get the spreadsheet busy status
				 * @memberOf jS
				 * @returns {Boolean}
				 */
				isBusy:function () {
					return (jS.busy.length > 0);
				},


				whenNotBusyStack: [],

				whenNotBusy: function(callback) {
					if (jS.isBusy()) {
						jS.whenNotBusyStack.push(callback);
					} else {
						callback();
					}
				},

				/**
				 * jQuery ui draggable integration
				 * @param {jQuery|HTMLElement} o To set resizable
				 * @param {Object} settings the settings used with jQuery ui resizable
				 * @memberOf jS
				 */
				draggable:function (o, settings) {
					if (!o.data('jSdraggable')) {
						o
							.data('jSdraggable', true)
							.draggable(settings);
					}
				},

				/**
				 * jQuery nearest integration
				 * @param o
				 * @param elements
				 * @memberOf jS
				 */
				nearest:function (o, elements) {
					return $(o).nearest(elements);
				},

				/**
				 * Bar resizing
				 * @memberOf jS
				 * @namespace
				 */
				resizeBar:{

					/**
					 * Provides the top bar with ability to resize
					 * @param {HTMLElement} bar td bar object
					 * @param {Number} i index of bar
					 * @param {HTMLElement} pane spreadsheet pane
					 * @memberOf jS.resizeBar
					 */
					top:function (bar, i, pane) {
						jS.obj.barTopControls().remove();
						var barController = document.createElement('div'),
							$barController = $(barController)
								.addClass(jS.cl.barController + ' ' + jS.theme.barResizer)
								.width(bar.clientWidth)
								.prependTo(bar),
							handle;

						jS.controls.bar.x.controls[jS.i] = jS.obj.barTopControls().add($barController);

						jS.resizableCells($barController, {
							handles:'e',
							start:function (e, ui) {
								jS.autoFillerHide();
								jS.setBusy(true);
								if (pane.freezeHandleTop) {
									pane.freezeHandleTop.remove();
								}
							},
							resize:function (e, ui) {
								bar.col.style.width = ui.size.width + 'px';

								if (pane.inPlaceEdit) {
									pane.inPlaceEdit.goToTd();
								}
							},
							stop:function (e, ui) {
								jS.setBusy(false);
								if (pane.inPlaceEdit) {
									pane.inPlaceEdit.goToTd();
								}
								jS.followMe();
								jS.setDirty(true);
							},
							minWidth: 32
						});

						handle = barController.children[0];
						handle.style.height = bar.clientHeight + 'px';
						handle.style.position = 'absolute';
					},

					/**
					 * Provides the left bar with ability to resize
					 * @param {HTMLElement} bar td bar object
					 * @param {Number} i index of bar
					 * @param {HTMLElement} pane spreadsheet pane
					 * @memberOf jS.resizeBar
					 */
					left:function (bar, i, pane) {
						jS.obj.barLeftControls().remove();
						var barRectangle = bar.getBoundingClientRect(),
							barOffsetTop = barRectangle.top + document.body.scrollTop,
							barOffsetLeft = barRectangle.left + document.body.scrollLeft,
							barController = document.createElement('div'),
							$barController = $(barController)
								.addClass(jS.cl.barController + ' ' + jS.theme.barResizer)
								.prependTo(bar)
								.offset({
									top: barOffsetTop,
									left: barOffsetLeft
								}),
							parent = bar.parentNode,
							child = document.createElement('div'),
							$child = $(child)
								.addClass(jS.cl.barControllerChild)
								.height(bar.clientHeight)
								.prependTo($barController),
							handle;

						jS.controls.bar.y.controls[jS.i] = jS.obj.barLeftControls().add($barController);

						jS.resizableCells($child, {
							handles:'s',
							start:function () {
								jS.autoFillerHide();
								jS.setBusy(true);
								if (pane.freezeHandleLeft) {
									pane.freezeHandleLeft.remove();
								}
							},
							resize:function (e, ui) {
								barController.style.height
									= bar.style.height
									= parent.style.height
									= ui.size.height + 'px';

								if (pane.inPlaceEdit) {
									pane.inPlaceEdit.goToTd();
								}
							},
							stop:function (e, ui) {
								jS.setBusy(false);
								if (pane.inPlaceEdit) {
									pane.inPlaceEdit.goToTd();
								}
								jS.followMe();
								jS.setDirty(true);
							},
							minHeight: 15
						});

						handle = child.children[0];
						handle.style.width = bar.offsetWidth + 'px';
						handle.style.position = 'absolute';
					},

					/**
					 * Provides the corner bar, just a place holder, needed for auto events
					 * @memberOf jS.resizeBar
					 */
					corner:function () {
					}
				},

				/**
				 * Updates the label so that the user knows where they are currently positioned
				 * @param {Sheet.Cell|*} entity
				 * @memberOf jS
				 */
				labelUpdate:function (entity) {
					if (entity instanceof Sheet.Cell) {
						var name = jS.cellHandler.parseCellName(entity.columnIndex, entity.rowIndex);
						jS.obj.label().text(name);
					} else {
						jS.obj.label().text(entity);
					}
				},

				/**
				 * Starts td to be edited
				 * @param {HTMLElement} td
				 * @param {Boolean} [isDrag] should be determined by if the user is dragging their mouse around setting cells
				 * @param {Boolean} [doNotClearHighlighted]
				 */
				cellEdit:function (td, isDrag, doNotClearHighlighted) {
					jS.autoFillerNotGroup = true; //make autoFiller directional again.
					//This finished up the edit of the last cell
					jS.evt.cellEditDone();

					if (td === null) return;

					var cell = td.jSCell,
						v;

					if (cell === u || cell === null) return;
					if (cell.uneditable) return;

					jS.trigger('sheetCellEdit', [cell]);

					if (jS.cellLast !== null && td !== jS.cellLast.td) {
						jS.followMe(td);
					} else {
						jS.autoFillerGoToTd(td);
					}

					//Show where we are to the user
					jS.labelUpdate(cell);

					if (cell.formula.length > 0) {
						v = '=' + cell.formula;
					} else {
						v = cell.value;
					}

					jS.obj.formula()
						.val(v)
						.blur();

					jS.cellSetActive(cell, isDrag, false, null, doNotClearHighlighted);
				},

				/**
				 * sets cell active to sheet, and highlights it for the user, shouldn't be called directly, should use cellEdit
				 * @param {Sheet.Cell} cell
				 * @param {Boolean} [isDrag] should be determined by if the user is dragging their mouse around setting cells
				 * @param {Boolean} [directional] makes highlighting directional, only left/right or only up/down
				 * @param {Function} [fnDone] called after the cells are set active
				 * @param {Boolean} [doNotClearHighlighted]
				 * @memberOf jS
				 */
				cellSetActive:function (cell, isDrag, directional, fnDone, doNotClearHighlighted) {
					var td = cell.td;

					jS.cellLast = cell;

					jS.rowLast = cell.rowIndex;
					jS.colLast = cell.columnIndex;

					if (!doNotClearHighlighted) {
						jS.highlighter
							.set(cell.td) //themeroll the cell and bars
							.setStart(cell)
							.setEnd(cell);
					}

					jS.highlighter
						.setBar('left', td.parentNode.children[0])
						.setBar('top', td.parentNode.parentNode.children[0].children[td.cellIndex]);

					var selectModel,
						clearHighlightedModel;

					switch (s.cellSelectModel) {
						case Sheet.excelSelectModel:
						case Sheet.googleDriveSelectModel:
							selectModel = function () {};
							clearHighlightedModel = function() {};
							break;
						case Sheet.openOfficeSelectModel:
							selectModel = function (target) {
								if (jS.isCell(target)) {
									jS.cellEdit(target);
								}
							};
							clearHighlightedModel = function () {};
							break;
					}

					if (isDrag) {
						var pane = jS.obj.pane(),
							highlighter = jS.highlighter,
							grid = {
								startRowIndex: cell.rowIndex,
								startColumnIndex: cell.columnIndex,
								endRowIndex: 0,
								endColumnIndex: 0
							},
							lastTouchedRowIndex = cell.rowIndex,
							lastTouchedColumnIndex = cell.columnIndex;

						pane.onmousemove = function (e) {
							e = e || window.event;

							var target = e.target || e.srcElement;

							if (jS.isBusy()) {
								return false;
							}

							if (target.jSCell === u) return false;

							var touchedCell = target.jSCell,
								ok = true;

							grid.endColumnIndex = touchedCell.columnIndex;
							grid.endRowIndex = touchedCell.rowIndex;

							if (directional) {
								ok = (cell.columnIndex === touchedCell.columnIndex || cell.rowIndex === touchedCell.rowIndex);
							}

							if ((
								lastTouchedColumnIndex !== touchedCell.columnIndex
								|| lastTouchedRowIndex !== touchedCell.rowIndex
								) && ok) { //this prevents this method from firing too much
								//select active cell if needed
								selectModel(target);

								//highlight the cells
								jS.cycleCellArea(function (o) {
									highlighter.set(o.td);
								}, jS.orderedGrid(grid));
							}

							jS.followMe(target);

							var mouseY = e.clientY,
								mouseX = e.clientX,
								offset = pane.$enclosure.offset(),
								up = touchedCell.rowIndex,
								left = touchedCell.columnIndex,
								move = false,
								previous;

							if (n(up) || n(left)) {
								return false;
							}

							if(mouseY > offset.top){
								move = true;
								up--
							}
							if(mouseX > offset.left){
								move = true;
								left--
							}
							if(move){
								if (up < 1 || left < 1) {
									return false;
								}
								previous = jS.spreadsheets[jS.i][up][left];
								jS.followMe(previous.td, true);
							}

							lastTouchedColumnIndex = touchedCell.columnIndex;
							lastTouchedRowIndex = touchedCell.rowIndex;
							return true;
						};

						document.onmouseup = function() {
							pane.onmousemove = null;
							pane.onmousemove = null;
							pane.onmouseup = null;
							document.onmouseup = null;

							if (fnDone) {
								fnDone();
							}
						};
					}

				},

				/**
				 * the most recent used column
				 * @memberOf jS
				 */
				colLast:0,

				/**
				 * the most recent used row
				 * @memberOf jS
				 */
				rowLast:0,

				/**
				 * the most recent used cell, {td, row, col, isEdit}
				 * @memberOf jS
				 * @type {Object}
				 */
				cellLast:null,

				/**
				 * the most recent highlighted cells {td, rowStart, colStart, rowEnd, colEnd}, in order
				 * @memberOf jS
				 * @type {Object}
				 */
				orderedGrid: function(grid) {
					var gridOrdered = {
						startRowIndex: (grid.startRowIndex < grid.endRowIndex ? grid.startRowIndex : grid.endRowIndex),
						startColumnIndex: (grid.startColumnIndex < grid.endColumnIndex ? grid.startColumnIndex : grid.endColumnIndex),
						endRowIndex: (grid.endRowIndex > grid.startRowIndex ? grid.endRowIndex : grid.startRowIndex),
						endColumnIndex: (grid.endColumnIndex > grid.startColumnIndex ? grid.endColumnIndex : grid.startColumnIndex)
					};

					return gridOrdered;
				},

				/**
				 * sets cell(s) class for styling
				 * @param {String} setClass class(es) to set cells to
				 * @param {String} [removeClass] class(es) to remove from cell if the setClass would conflict with
				 * @param {Object} [tds]
				 * @returns {Boolean}
				 * @memberOf jS
				 */
				cellStyleToggle:function (setClass, removeClass, tds) {
					tds = tds || jS.highlighted();
					if (tds.length < 1) {
						return false;
					}
					jS.setDirty(true);
					//Lets check to remove any style classes
					var td,
						$td,
						i = tds.length - 1,
						cells = jS.obj.cellsEdited(),
						hasClass;

					//TODO: use resolveCell and sheetPreCalculation to set undo redo data

					if (i >= 0) {
						hasClass = tds[0].className.match(setClass); //go by first element in set
						do {
							td = tds[i];
							$td = $(td);

							if (removeClass) {//If there is a class that conflicts with this one, we remove it first
								$td.removeClass(removeClass);
							}

							//Now lets add some style
							if (hasClass) {
								$td.removeClass(setClass);
							} else {
								$td.addClass(setClass);
							}

							if (!td.jSCell.edited) {
								td.jSCell.edited = true;
								cells.push(td.jSCell);
							}

						} while (i--);

						return true;
					}

					return false;
				},

				/**
				 * sets cell(s) type
				 * @param {String} [type] cell type
				 * @param {Object} [cells]
				 * @returns {Boolean}
				 * @memberOf jS
				 */
				cellTypeToggle:function(type, cells) {
					cells = cells || jS.highlighted(true);

					if (cells.length < 1) {
						return;
					}

					var i = cells.length - 1,
						remove = cells[i].cellType == type,
						cell;

					if (i >= 0) {
						do {
							cell = cells[i];
							if (remove) {
								cell.cellType = null;
							} else {
								cell.cellType = type;
							}
							//TODO set needsUpdate on cell and dependencies
							cell.updateValue();

						} while(i--);
					}
				},

				/**
				 * Resize fonts in a cell by 1 pixel
				 * @param {String} direction "up" or "down"
				 * @param {Object} [tds]
				 * @memberOf jS
				 * @returns {Boolean}
				 */
				fontReSize:function (direction, tds) {
					tds = tds || jS.highlighted();
					if (tds.length < 1) {
						return false;
					}

					var resize = 0;
					switch (direction) {
						case 'up':
							resize = 1;
							break;
						case 'down':
							resize = -1;
							break;
					}

					//Lets check to remove any style classes
					var td,
						$td,
						i = tds.length - 1,
						size,
						cells = jS.obj.cellsEdited();

					//TODO: use resolveCell and sheetPreCalculation to set undo redo data

					if (i >= 0) {
						do {
							td = tds[i];
							$td = $(td);
							size = ($td.css("font-size") + '').replace("px", "") * 1;
							$td.css("font-size", ((size || 10) + resize) + "px");

							if (!td.jSCell.edited) {
								td.jSCell.edited = true;
								cells.push(td.jSCell);
							}
						} while(i--);
						return true;
					}
					return false;
				},



				/**
				 * Object handler for formulaParser
				 * @type {Sheet.CellHandler}
				 * @memberOf jS
				 */
				cellHandler: null,

				/**
				 * Where jS.spreadsheets are calculated, and returned to their td counterpart
				 * @param {Number} [sheetIndex] table index
				 * @param {Boolean} [refreshCalculations]
				 * @memberOf jS
				 */
				calc:function (sheetIndex, refreshCalculations) {
					sheetIndex = (sheetIndex === u ? jS.i : sheetIndex);
					if (
						jS.readOnly[sheetIndex]
						|| jS.isChanged(sheetIndex) === false
						&& !refreshCalculations
					) {
						return false;
					} //readonly is no calc at all

					var loader = s.loader,
						cell;

					loader.cycleCells(sheetIndex, function(sheetIndex, rowIndex, columnIndex) {
						cell = loader.jitCell(sheetIndex, rowIndex, columnIndex);
						cell.updateValue();
					});

					jS.trigger('sheetCalculation', [
						{which:'spreadsheet', index:sheetIndex}
					]);

					jS.setChanged(false);
					return true;
				},

				/**
				 * Where jS.spreadsheets are all calculated, and returned to their td counterpart
				 * @param {Boolean} [refreshCalculations]
				 * @memberOf jS
				 */
				calcAll: function(refreshCalculations) {
					var sheetIndex = 0,
						max;

					max = s.loader.count;

					for(;sheetIndex < max; sheetIndex++) {
						jS.calc(sheetIndex, refreshCalculations);
					}
				},

				/**
				 * Calculates just the dependencies of a single cell, and their dependencies recursively
				 * @param {Sheet.Cell} cell
				 * @param {Boolean} [skipUndoable]
				 * @memberOf jS
				 */
				resolveCell:function (cell, skipUndoable) {
					var updateDependencies = !cell.needsUpdated;
					if (!skipUndoable) {
						jS.undo.createCells([cell], function(cells) {
							jS.trigger('sheetPreCalculation', [
								{which:'cell', cell:cell}
							]);

							jS.setDirty(true);
							jS.setChanged(true);
							cell.updateValue(function() {
								jS.trigger('sheetCalculation', [
									{which:'cell', cell: cell}
								]);

								if (updateDependencies) {
									cell.updateDependencies();
								}
							});
							return cells;
						});
					} else {
						jS.trigger('sheetPreCalculation', [
							{which:'cell', cell:cell}
						]);

						jS.setDirty(true);
						jS.setChanged(true);
						cell.updateValue(function() {
							jS.trigger('sheetCalculation', [
								{which:'cell', cell: cell}
							]);

							if (updateDependencies) {
								cell.updateDependencies();
							}
						});
					}
				},

				/**
				 * adds a spreadsheet table
				 * @memberOf jS
				 */
				addSheet:function () {
					jS.evt.cellEditAbandon();
					jS.setDirty(true);
					s.loader.addSpreadsheet(null, jS.sheetCount);
					jS.controlFactory.sheetUI(jS.obj.ui, jS.sheetCount);

					jS.setActiveSheet(jS.sheetCount);

					jS.sheetCount++;

					jS.sheetSyncSize();

					var pane = jS.obj.pane();
					if (pane.inPlaceEdit) {
						pane.inPlaceEdit.goToTd();
					}

					jS.trigger('sheetAdd', [jS.i]);
				},

				insertSheet: null,

				/**
				 * deletes a spreadsheet table
				 * @param {Number} [i] spreadsheet index within instance
				 * @memberOf jS
				 */
				deleteSheet:function (i) {
					var oldI = i || jS.i,
						enclosureArray = jS.controls.enclosure,
						tabIndex;

					enclosureArray.splice(oldI,1);

					jS.obj.barHelper().remove();

					$(jS.obj.enclosure()).remove();
					jS.obj.menus().remove();
					jS.obj.tabContainer().children().eq(jS.i).remove();
					jS.spreadsheets.splice(oldI, 1);
					jS.controls.autoFiller.splice(oldI, 1);
					jS.controls.bar.helper.splice(oldI, 1);
					jS.controls.bar.corner.splice(oldI, 1);
					jS.controls.bar.x.controls.splice(oldI, 1);
					jS.controls.bar.x.handleFreeze.splice(oldI, 1);
					jS.controls.bar.x.controls.splice(oldI, 1);
					jS.controls.bar.x.menu.splice(oldI, 1);
					if (jS.controls.bar.x.menuParent && jS.controls.bar.x.menuParent[oldI]) {
						jS.controls.bar.x.menuParent.splice(oldI, 1);
					}
					jS.controls.bar.x.parent.splice(oldI, 1);
					jS.controls.bar.x.th.splice(oldI, 1);
					jS.controls.bar.y.controls.splice(oldI, 1);
					jS.controls.bar.y.handleFreeze.splice(oldI, 1);
					jS.controls.bar.y.controls.splice(oldI, 1);
					jS.controls.bar.y.menu.splice(oldI, 1);
					if (jS.controls.bar.y.menuParent && jS.controls.bar.y.menuParent[oldI]) {
						jS.controls.bar.y.menuParent.splice(oldI, 1);
					}
					jS.controls.bar.y.parent.splice(oldI, 1);
					jS.controls.bar.y.th.splice(oldI, 1);
					jS.controls.barMenuLeft.splice(oldI, 1);
					jS.controls.barMenuTop.splice(oldI, 1);
					jS.controls.barLeft.splice(oldI, 1);
					jS.controls.barTop.splice(oldI, 1);
					jS.controls.barTopParent.splice(oldI, 1);
					jS.controls.chart.splice(oldI, 1);
					jS.controls.tdMenu.splice(oldI, 1);
					jS.controls.enclosure.splice(oldI, 1);
					jS.controls.fullScreen = null;
					jS.controls.inPlaceEdit.splice(oldI, 1);
					jS.controls.menus.splice(oldI, 1);
					jS.controls.menu.splice(oldI, 1);
					jS.controls.pane.splice(oldI, 1);
					jS.controls.tables.splice(oldI, 1);
					jS.controls.table.splice(oldI, 1);
					//BUGFIX - After removing of sheet, we need update the tab.i property - start from removed sheet's position.
					for (tabIndex = oldI+1; tabIndex < jS.controls.tab.length; ++tabIndex) {
						var tab = jS.controls.tab[tabIndex].get(0);
						tab.i--;
					}
					jS.controls.tab.splice(oldI, 1);
					jS.controls.toggleHide.x.splice(oldI, 1);
					jS.controls.toggleHide.y.splice(oldI, 1);
					jS.readOnly.splice(oldI, 1);
					jS.i = 0;
					jS.sheetCount--;
					jS.sheetCount = math.max(jS.sheetCount, 0);

					if (jS.sheetCount == 0) {
						jS.addSheet();
					}

					jS.setActiveSheet(jS.i);
					jS.setDirty(true);
					jS.setChanged(true);

					jS.trigger('sheetDelete', [oldI]);
				},

				/**
				 * removes the currently selected row
				 * @param {Number} [rowIndex]
				 * @memberOf jS
				 */
				deleteRow:function (rowIndex) {
					rowIndex = rowIndex || jS.rowLast;

					var pane = jS.obj.pane(),
						row = jS.spreadsheets[jS.i].splice(rowIndex, 1)[0],
						columnIndex = 0,
						cell,
						columnMax = row.length,
						loader = s.loader;

					jS.setChanged(true);

					jS.offsetFormulas({
							row: rowIndex,
							col: 0
						}, {
							row: -1,
							col: 0
						},
						false,
						true
					);

					loader.deleteRow(jS.i, rowIndex);

					for (;columnIndex < columnMax; columnIndex++) {
						cell = row[columnIndex];

						cell.setNeedsUpdated(false);
						cell.updateDependencies();
					}

					jS.setDirty(true);

					jS.evt.cellEditAbandon();

					if (pane.inPlaceEdit) {
						pane.inPlaceEdit.goToTd();
					}

					jS.trigger('sheetDeleteRow', rowIndex);
				},

				/**
				 * removes the columns associated with highlighted cells
				 * @param {Number} [columnIndex]
				 * @memberOf jS
				 */
				deleteColumn:function (columnIndex) {
					columnIndex = columnIndex || jS.colLast;

					var pane = jS.obj.pane(),
						rowIndex = 0,
						cell,
						rows = jS.spreadsheets[jS.i],
						loader = s.loader,
						rowMax = loader.size(jS.i);

					jS.setChanged(true);

					jS.offsetFormulas({
							row: 0,
							col: columnIndex
						}, {
							row: -1,
							col: 0
						},
						false,
						true
					);

					loader.deleteColumn(jS.i, columnIndex);

					for (;rowIndex < rowMax; rowIndex++) {
						cell = rows[rowIndex].splice(columnIndex, 1)[0];

						cell.setNeedsUpdated(false);
						cell.updateDependencies();
					}

					jS.setDirty(true);

					jS.evt.cellEditAbandon();

					if (pane.inPlaceEdit) {
						pane.inPlaceEdit.goToTd();
					}

					jS.trigger('sheetDeleteColumn', columnIndex);
				},

				/**
				 * manages a tabs inner value
				 * @param {Boolean} [get] makes return the current value of the tab
				 * @param {Function} [callback]
				 * @returns {String}
				 * @memberOf jS
				 */
				sheetTab:function (get, callback) {
					var sheetTab = '';
					if (get) {
						sheetTab = s.loader.title(jS.i) || jS.msg.sheetTitleDefault.replace(/[{]index[}]/gi, jS.i + 1);
						if (callback) {
							callback(sheetTab);
						}
						return sheetTab;
					} else if (jS.isSheetEditable() && s.editableNames) { //ensure that the sheet is editable, then let them change the sheet's name
						s.prompt(
							jS.msg.newSheetTitle,
							function(newTitle) {
								if (!newTitle) { //The user didn't set the new tab name
									sheetTab = s.loader.title(jS.i);
									newTitle = (sheetTab ? sheetTab : jS.msg.sheetTitleDefault.replace(/[{]index[}]/gi, jS.i + 1));
								} else {
									jS.setDirty(true);
									jS.obj.table().attr('title', newTitle);
									jS.obj.tab().html(newTitle);

									sheetTab = newTitle;
								}

								if (callback) {
									callback($(document.createElement('div')).text(sheetTab).html());
								}
							},
							jS.sheetTab(true)
						);
						return null;
					}
				},

				/**
				 * scrolls the sheet to the selected cell
				 * @param {HTMLElement} [td] default is tdActive
				 * @param {boolean} [dontMoveAutoFiller] keeps autoFillerHandler in default position
				 * @memberOf jS
				 */
				followMe:function (td, dontMoveAutoFiller) {
					td = td || jS.obj.tdActive();
					if (td === null) return;

					var pane = jS.obj.pane(),
						actionUI = pane.actionUI;

					jS.setBusy(true);

					//actionUI.putTdInView(td);

					jS.setBusy(false);

					if(!dontMoveAutoFiller){
						jS.autoFillerGoToTd(td);
					}
				},

				/**
				 * moves autoFiller to a selected cell if it is enabled in settings
				 * @param {HTMLElement} [td] default is tdActive
				 * @param {Number} [h] height of a td object
				 * @param {Number} [w] width of a td object
				 * @memberOf jS
				 */
				autoFillerGoToTd:function (td, h, w) {
					if (!s.autoFiller) return;

					if (td === u && jS.cellLast !== null) {
						td = jS.cellLast.td;
					}

					if (td && td.type == 'cell') { //ensure that it is a usable cell
						h = h || td.clientHeight;
						w = w || td.clientWidth;
						if (!td.offsetHeight || !td.offsetWidth || !td.clientHeight || !td.clientWidth) {
							jS.autoFillerHide();
							return;
						}

						var tdPos = $(td).position();

						jS.autoFillerShow(((tdPos.top + (h || td.clientHeight) - 3) + 'px'), ((tdPos.left + (w || td.clientWidth) - 3) + 'px'));
					}
				},

				/**
				 * hides the auto filler if it is enabled in settings
				 * @memberOf jS
				 */
				autoFillerHide:function () {
					if (!s.autoFiller) return;

					var autoFiller = jS.obj.autoFiller(),
						parent = autoFiller.parentNode;
					if (parent !== null) {
						parent.removeChild(autoFiller);
					}
				},


				autoFillerShow: function(top, left) {
					if (!s.autoFiller) return;

					var autoFiller = jS.obj.autoFiller(),
						parent = jS.obj.pane(),
						style = autoFiller.style;

					style.top = top;
					style.left = left;

					parent.insertBefore(autoFiller, parent.firstChild);
				},

				/**
				 * sets active a spreadsheet inside of a sheet instance
				 * @param {Number} [i] a sheet integer desired to show, default 0
				 * @param {Object} [spreadsheetUI]
				 * @memberOf jS
				 */
				setActiveSheet:function (i, spreadsheetUI) {
					if (spreadsheetUI !== u) {
						i = spreadsheetUI.i;
					} else {
						i = i || 0;
					}

					if (jS.cellLast !== null && (jS.cellLast.rowIndex > 0 || jS.cellLast.columnIndex > 0)) {
						jS.evt.cellEditDone();
						jS.obj.formula().val('');
					}

					var panes = jS.obj.panes(),
						j = 0,
						max = panes.length,
						pane,
						enclosure;

					jS.autoFillerHide();

					for (;j < max; j++) {
						if (i != j) {
							pane = panes[j];
							pane.actionUI.hide();
						}
					}

					jS.i = i;

					enclosure = jS.obj.enclosure();

					jS.highlighter.setTab(jS.obj.tab());

					//jS.readOnly[i] = (enclosure.table.className || '').match(/\breadonly\b/i) != null;

					pane = enclosure.pane;

					pane.actionUI.show();

					if (pane.inPlaceEdit) {
						pane.inPlaceEdit.goToTd();
					}
				},


				getSpreadsheetIndexByTitle: function(title) {
					var spreadsheetIndex = s.loader.getSpreadsheetIndexByTitle(title);
					return spreadsheetIndex;
				},

				getSpreadsheetTitleByIndex: function(index) {
					return s.loader.json[index].title;
				},


				/**
				 * opens a spreadsheet into the active sheet instance
				 * @param {Sheet.Loader.HTMLTable|Sheet.Loader.JSON|Sheet.Loader.XML} loader
				 * @memberOf jS
				 */
				openSheet:function (loader) {
					var count = loader.count,
						lastIndex = count - 1,
						open = function() {
							jS.setBusy(true);
							jS.s.loader = loader;
							var header = jS.controlFactory.header(),
								ui = jS.controlFactory.ui(),
								sheetAdder = jS.controlFactory.sheetAdder(),
								tabContainer = jS.controlFactory.tabContainer(),
								i,
								options = {
									initChildren: function(ui, i) {
										jS.controlFactory.sheetUI(ui, i);



										jS.trigger('sheetOpened', [i]);
									},
									done: function(stack) {
										jS.sheetSyncSize();

										jS.setActiveSheet(0);

										jS.setDirty(false);
										jS.setBusy(false);

										jS.trigger('sheetAllOpened');
									},
									lastIndex: lastIndex
								},
								firstSpreadsheetUI;

							header.ui = ui;
							header.tabContainer = tabContainer;

							ui.header = header;
							ui.sheetAdder = sheetAdder;
							ui.tabContainer = tabContainer;

							tabContainer.header = header;
							tabContainer.ui = ui;

							s.parent
								.append(header)
								.append(ui)
								.append(sheetAdder)
								.append(tabContainer);

							// resizable container div
							jS.resizableSheet(s.parent, {
								minWidth:s.parent.width() * 0.1,
								minHeight:s.parent.height() * 0.1,
								start:function () {
									jS.setBusy(true);
									jS.obj.ui.removeChild(jS.obj.enclosure());
									ui.sheetAdder.hide();
									ui.tabContainer.hide();
								},
								stop:function () {
									jS.obj.ui.appendChild(jS.obj.enclosure());
									ui.sheetAdder.show();
									ui.tabContainer.show();
									jS.setBusy(false);
									jS.sheetSyncSize();
									var pane = jS.obj.pane();
									if (pane.inPlaceEdit) {
										pane.inPlaceEdit.goToTd();
									}
								}
							});


							jS.insertSheet = function(data, i, makeVisible) {
								jS.sheetCount++;
								data = data || null;
								makeVisible = makeVisible !== u ? makeVisible : true;
								i = i || jS.sheetCount - 1;

								if (data !== null) {
									s.loader.addSpreadsheet(data);
								}

								var showSpreadsheet = function() {
										jS.setBusy(true);
										var spreadsheetUI = new Sheet.SpreadsheetUI(i, ui, options);
										jS.setActiveSheet(-1, spreadsheetUI);
										jS.setBusy(false);
										jS.sheetSyncSize();
									},
									tab;

								if (makeVisible) {
									showSpreadsheet();
									return;
								}


								tab = jS.controlFactory.customTab(loader.title(i))
									.mousedown(function () {
										showSpreadsheet();
										jS.obj.tab().insertBefore(this);
										$(this).remove();
										return false;
									});

								if (s.loader.isHidden(i)) {
									tab.hide();
								}
							};

							//always load at least the first spreadsheet
							firstSpreadsheetUI = new Sheet.SpreadsheetUI(0, ui, options);
							jS.sheetCount++;

							if (count > 0) {
								//set the others up to load on demand
								for (i = 1; i < count; i++) {
									jS.insertSheet(null, i, false);
								}
								jS.i = 0;

								firstSpreadsheetUI.loaded();
							}
						};

					if (jS.isDirty) {
						s.confirm(
							jS.msg.openSheet,
							open
						);
					} else {
						open();
					}
				},

				/**
				 * creates a new sheet from size from prompt
				 * @memberOf jS
				 */
				newSheet:function () {
					s.parent
						.html($.sheet.makeTable())
						.sheet(s);
				},


				/**
				 * synchronizes the called parent's controls so that the controls fit correctly within the parent
				 * @function sheetSyncSize
				 * @memberOf jS
				 */
				sheetSyncSize:function () {
					var $parent = s.parent,
						parent = $parent[0],
						h = parent.clientHeight,
						w = parent.clientWidth,
						$tabContainer = jS.obj.tabContainer(),
						tabContainer = $tabContainer[0],
						tabContainerStyle = tabContainer.style,
						scrollBarWidth = window.scrollBarSize.width,
						tabContainerInnerWidth,
						tabContainerOuterWidth,
						widthTabContainer,
						heightTabContainer,
						uiStyle = jS.obj.ui.style,
						paneHeight,
						paneWidth,
						standardHeight,
						standardWidth,
						tabContainerScrollLeft;

					if (!h) {
						h = 400; //Height really needs to be set by the parent
						$parent.height(h);
					} else if (h < 200) {
						h = 200;
						$parent.height(h);
					}
					tabContainerScrollLeft = tabContainer.scrollLeft;
					tabContainerStyle.width = '';
					tabContainerInnerWidth = tabContainer.clientWidth;
					tabContainerOuterWidth = (w - (s.colMargin + scrollBarWidth));
					widthTabContainer = (w - s.colMargin * 2) + 'px';
					heightTabContainer = ((s.colMargin + scrollBarWidth) + 'px');
					if (tabContainerInnerWidth > tabContainerOuterWidth) {
						tabContainerStyle.height = heightTabContainer;
						$tabContainer.addClass(jS.cl.tabContainerScrollable);
						h -= scrollBarWidth;
					} else {
						tabContainerStyle.height = null;
						$tabContainer.removeClass(jS.cl.tabContainerScrollable);
					}
					tabContainerStyle.width = widthTabContainer;
					tabContainer.scrollLeft = tabContainerScrollLeft;

					h -= jS.obj.header().outerHeight() + s.boxModelCorrection;
					h -= tabContainer.clientHeight + s.boxModelCorrection;

					paneHeight = (h - window.scrollBarSize.height - s.boxModelCorrection) + 'px';
					paneWidth = (w - window.scrollBarSize.width) + 'px';
					standardHeight = (h + 'px');
					standardWidth = (w + 'px');

					jS.obj.panes().each(function() {
						var style = this.style,
							scrollStyle = this.scroll.style,
							enclosureStyle = this.enclosure.style;

						style.height = paneHeight;
						style.width = paneWidth;

						enclosureStyle.height = scrollStyle.height = standardHeight;
						enclosureStyle.width = scrollStyle.width = standardWidth;
					});


					uiStyle.height = standardHeight;
					uiStyle.width = standardWidth;
				},

				/**
				 *
				 */
				showSheets: function() {
					jS.obj.tabContainer().children().each(function(i) {
						$(this).show();
						s.loader.setHidden(i, false);
					});
				},

				showSheet: function(sheetIndex) {
					jS.obj.tabContainer().children().eq(sheetIndex).show();
					s.loader.setHidden(sheetIndex, false);

				},

				hideSheet: function(sheetIndex) {
					jS.obj.tabContainer().children().eq(sheetIndex).hide();
					s.loader.setHidden(sheetIndex, true);
				},

				/**
				 * changes a cell's style and makes it undoable/redoable
				 * @param style
				 * @param value
				 * @param cells
				 */
				cellChangeStyle:function (style, value, cells) {
					cells = cells || jS.highlighted(true);
					if (cells.length < 1) {
						return false;
					}

					jS.setDirty(this);
					var i = cells.length - 1;

					if ( i >= 0) {
						jS.undo.createCells(cells, function(cells) { //save state, make it undoable
							do {
								cells[i].td.css(style, value);
							} while(i--);

							return cells;
						});
						return true;
					}

					return false;
				},

				/**
				 * Finds a cell in a sheet from a value
				 * @param {String} [v] value to look for within a cell, if not supplied, a prompt is given
				 * @memberOf jS
				 */
				cellFind:function (v) {
					function find (v) {
						var trs = jS.obj.table()
							.children('tbody')
							.children('tr');

						if (v) {//We just do a simple uppercase/lowercase search.
							var o = trs.children('td:contains("' + v + '")');

							if (o.length < 1) {
								o = trs.children('td:contains("' + v.toLowerCase() + '")');
							}

							if (o.length < 1) {
								o = trs.children('td:contains("' + v.toUpperCase() + '")');
							}

							o = o.eq(0);
							if (o.length > 0) {
								jS.cellEdit(o);
							} else {
								s.alert(jS.msg.cellNoFind);
							}						   }
					}
					if (!v) {
						s.prompt(
							jS.msg.cellFind,
							find
						);
					} else {
						find(v);
					}

				},

				/**
				 * Sets active bar
				 * @param {String} type "col" || "row" || "all"
				 * @param {Number} begin start highlighting from
				 * @param {Number} end end highlighting to
				 * @memberOf jS
				 */
				cellSetActiveBar:function (type, begin, end) {
					var size = s.loader.size(),
						startIndex,
						endIndex,
						start = {},
						stop = {},
						before,

						/**
						 * Sets active bar
						 */
						SetActive = function (highlighter) {
							switch (s.cellSelectModel) {
								case Sheet.openOfficeSelectModel: //follow cursor behavior
									this.row = highlighter.startRowIndex;
									this.col = highlighter.startColumnIndex;
									this.td = jS.getTd(-1, this.row, this.col);
									if (this.td !== null && (jS.cellLast !== null && this.td !== jS.cellLast.td)) {
										jS.cellEdit(this.td, false, true);
									}
									break;
								default: //stay at initial cell
									this.row = highlighter.endRowIndex;
									this.col = highlighter.endColumnIndex;
									this.td = jS.getTd(-1, this.row, this.col);
									if (this.td !== null && (jS.cellLast !== null && this.td !== jS.cellLast.td)) {
										jS.cellEdit(this.td, false, true);
									}
									break;
							}
						},
						obj = [],
						scrolledArea  = jS.obj.pane().actionUI.scrolledArea,
						index,
						row,
						td,
						highlighter = jS.highlighter;

					switch (type) {
						case 'top':
							start.row = scrolledArea.row;
							stop.row = scrolledArea.row;

							if (begin < end) {
								highlighter.startColumnIndex
									= index
									= startIndex
									= start.col
									= begin;

								highlighter.endColumnIndex
									= endIndex
									= stop.col
									= end;
							} else {
								before = true;
								highlighter.startColumnIndex
									= index
									= startIndex
									= start.col
									= end;

								highlighter.endColumnIndex
									= endIndex
									= stop.col
									= begin;
							}

							highlighter.startRowIndex = 0;
							highlighter.endRowIndex = size.rows;

							obj.push(begin);

							for (;index < endIndex;index++) {
								obj.push(obj[obj.length - 1].nextSibling);
							}
							break;
						case 'left':
							start.row = first;
							start.col = scrolledArea.col;
							stop.row = last;
							stop.col = scrolledArea.col;

							highlighter.startRowIndex = first;
							highlighter.startColumnIndex = 0;
							highlighter.endRowIndex = last;
							highlighter.endColumnIndex = size.cols;

							row = last;

							do {
								td = jS.getTd(-1, row, 0);
								if (td === null) continue;
								obj.push(td.parentNode);
							} while(row-- > first);
							break;
						case 'corner': //all
							start.row = 0;
							start.col = 0;
							stop.col = size.cols;
							stop.row = size.rows;

							obj.push(sheet[0]);
							break;
					}

					new SetActive(highlighter);

					jS.highlighter.set(obj);
				},

				/**
				 * gets a range of selected cells, then returns it
				 * @param {Object} [e] jQuery event, when in use, is during mouse down
				 * @param {String} v Value to preserve and return
				 * @param {String} [newFn]
				 * @param {Boolean} [notSetFormula]
				 * @returns {String}
				 * @memberOf jS
				 */
				getTdRange:function (e, v, newFn, notSetFormula) {
					jS.cellLast.isEdit = true;

					var range = function (loc) {
							if (loc.first.col > loc.last.col ||
								loc.first.row > loc.last.row
								) {
								return {
									first: jS.cellHandler.parseCellName(loc.last.col, loc.last.row),
									last: jS.cellHandler.parseCellName(loc.first.col, loc.first.row)
								};
							} else {
								return {
									first: jS.cellHandler.parseCellName(loc.first.col, loc.first.row),
									last: jS.cellHandler.parseCellName(loc.last.col, loc.last.row)
								};
							}
						},
						label = function (loc) {
							var rangeLabel = range(loc),
								v2 = v + '';
							v2 = (v2.match(/=/) ? v2 : '=' + v2); //make sure we can use this value as a formula

							if (newFn || v2.charAt(v2.length - 1) != '(') { //if a function is being sent, make sure it can be called by wrapping it in ()
								v2 = v2 + (newFn ? newFn : '') + '(';
							}

							var formula,
								lastChar = '';
							if (rangeLabel.first != rangeLabel.last) {
								formula = rangeLabel.first + ':' + rangeLabel.last;
							} else {
								formula = rangeLabel.first;
							}

							if (v2.charAt(v2.length - 1) == '(') {
								lastChar = ')';
							}

							return v2 + formula + lastChar;
						},
						newVal = '',
						loc,
						sheet,
						cells;

					if (e) { //if from an event, we use mousemove method
						loc = {
							first:jS.getTdLocation([e.target])
						};

						sheet = jS.obj.table().mousemove(function (e) {
							loc.last = jS.getTdLocation([e.target]);

							newVal = label(loc);

							if (!notSetFormula) {
								jS.obj.formula().val(newVal);
								jS.obj.inPlaceEdit().val(newVal);
							}
						});

						$document.one('mouseup', function () {
							sheet.unbind('mousemove');
							return newVal;
						});
					} else {
						cells = jS.highlighted().not(jS.obj.tdActive());

						if (cells.length) {
							loc = { //tr/td column and row index
								first:jS.getTdLocation(cells.first()),
								last:jS.getTdLocation(cells.last())
							};

							newVal = label(loc);

							if (!notSetFormula) {
								jS.obj.formula().val(newVal);
								jS.obj.inPlaceEdit().val(newVal);
							}

							return newVal;
						} else {
							return '';
						}
					}
					return '';
				},

				/**
				 * Gets the td element within a spreadsheet instance
				 * @param {Number} _s spreadsheet index
				 * @param {Number} r row index
				 * @param {Number} c column index
				 * @returns {HTMLElement|null}
				 * @memberOf jS
				 */
				getTd:function (_s, r, c) {
					if (_s < 0) {
						_s = jS.i;
					}
					var cell = s.loader.jitCell(_s, r, c);

					if (cell === null) return cell;

					return cell.td || null;
				},

				/**
				 * Gets the td row and column index as an object {row, col}
				 * @param {HTMLTableCellElement} td
				 * @returns {Object}
				 * @memberOf jS
				 */
				getTdLocation:function (td) {
					var result = {col:0, row:0},
						rowOffset = 0,
						pane = jS.obj.pane();

					//rowOffset = pane.actionUI.yDetacher.aboveIndex;

					if (td === u || td === null) return result;

					if (td.parentNode === u || (td.parentNode.rowIndex + rowOffset) < 0) {
						return result;
					}

					return {
						col: td.cellIndex,
						row: td.parentNode.rowIndex + rowOffset
					};
				},

				/**
				 * Time manager for measuring execution speed
				 * @namespace
				 * @memberOf jS
				 */
				time:{
					now:new Date(),
					last:new Date(),
					diff:function () {
						return math.abs(math.ceil(this.last.getTime() - this.now.getTime()) / 1000).toFixed(5);
					},
					set:function () {
						this.last = this.now;
						this.now = new Date();
					},
					get:function () {
						return this.now.getHours() + ':' + this.now.getMinutes() + ':' + this.now.getSeconds();
					}
				},

				/**
				 * Changed tracker per sheet
				 * @memberOf jS
				 */
				changed:[],

				/**
				 * Changed = needs to be calculated
				 * @memberOf jS
				 * @param tableIndex
				 */
				isChanged:function (tableIndex) {
					return jS.changed[tableIndex || jS.i];
				},

				/**
				 * Sets changed
				 * @param {Boolean} changed changed state
				 * @memberOf jS
				 */
				setChanged:function (changed) {
					jS.changed[jS.i] = changed;
				},

				/**
				 * Dirty = changed needs saved
				 * @memberOf jS
				 */
				isDirty:false,

				/**
				 * Dirty manager
				 * @param dirty
				 * @memberOf jS
				 */
				setDirty:function (dirty) {
					jS.dirty = dirty;
				},

				/**
				 * @param v
				 * @memberOf jS
				 */
				appendToFormula:function (v) {
					var formula = jS.obj.formula(),
						fV = formula.val();

					if (fV.charAt(0) != '=') {
						fV = '=' + fV;
					}

					formula.val(fV + v);
				},

				/**
				 * undo manager integration
				 * @memberOf jS
				 * @namespace
				 */
				undo:{
					manager:(
						window.UndoManager
							? new UndoManager()
							: {
								undo: emptyFN,
								redo: emptyFN,
								register: emptyFN
							}),
					cells:[],
					id:-1,
					createCells: function(cells, fn, id) {
						if (id === u) {
							jS.undo.id++;
							id = jS.undo.id;
						}

						var before = (new Sheet.CellRange(cells)).clone().cells,
							after = (fn !== u ? (new Sheet.CellRange(fn(cells)).clone()).cells : before);

						before.id = id;
						after.id = id;

						jS.undo.manager.add({
							undo: function() {
								jS.undo.removeCells(before, id);
							},
							redo: function() {
								jS.undo.createCells(after, null, id);
							}
						});

						if (id !== jS.undo.id) {
							jS.undo.draw(after);
						}

						return true;
					},
					removeCells: function(cells, id) {
						var i = 0, index = -1;
						if (cells.id === id) {
							index = i;
						}

						if (index !== -1) {
							jS.undo.cells.splice(index, 1);
						}
						jS.undo.draw(cells);
					},
					draw: function(clones) {
						var i,
							td,
							clone,
							cell,
							loc;

						for (i = 0; i < clones.length; i++) {
							clone = clones[i];
							loc = jS.getTdLocation(clone.td);
							cell = jS.spreadsheets[clone.sheetIndex][loc.row][loc.col];

							//TODO add clone method to Sheet.Cell
							cell.value = clone.value;
							cell.formula = clone.formula;
							td = cell.td = clone.td;
							cell.dependencies = clone.dependencies;
							cell.needsUpdated = clone.needsUpdated;
							cell.calcCount = clone.calcCount;
							cell.sheetIndex = clone.sheetIndex;
							cell.rowIndex = loc.row;
							cell.columnIndex = loc.col;
							cell.state = clone.state;
							cell.jS = clone.jS;
							td.setAttribute('style', clone.style);
							td.setAttribute('class', clone.cl);

							cell.setNeedsUpdated();
							cell.updateValue();
						}
					}
				},

				/**
				 * get cols associated with a sheet/table within an instance
				 * @param {jQuery|HTMLElement} [table]
				 * @returns {HTMLCollection|Array}
				 * @memberOf jS
				 */
				cols:function (table) {
					table = table || jS.obj.table()[0];

					//table / colGroup / col
					if (!table) return [];
					if (!table.colGroup) return [];
					if (!table.colGroup.children) return [];

					return table.colGroup.children
				},

				/**
				 * clone tables associated with sheet, and return them free of decorations and enclosure/pane etc.
				 * @param {jQuery|HTMLElement} [tables]
				 * @param {Boolean} [useActualTables]
				 * @returns {jQuery|Element}
				 * @memberOf jS
				 */
				tables:function (tables, useActualTables) {
					tables = tables || jS.obj.tables();
					var clonedTables = [],
						i = tables.length - 1,
						j,
						table,
						tBody,
						colGroup,
						colLeft,
						tdLeft,
						trTop,
						trs,
						tr;

					do {
						table = (useActualTables ? document.body.removeChild(tables[i]) : tables[i].cloneNode(true));

						if (
							(colGroup = table.children[0])
								&& (colLeft = colGroup.children[0])
							) {
							colGroup.removeChild(colLeft);
						}

						if (tBody = table.children[1]) {
							trs = tBody.children;
							trTop = trs[0];
							tBody.removeChild(trTop);
							j = trs.length - 1;
							do {
								tr = trs[j];
								tdLeft = tr.children[0];
								tr.removeChild(tdLeft);
							} while ( j-- > 0 ); //1 because trTop still exists in the array
						}
						clonedTables[i] = table;
					} while (i-- > 0);

					//TODO: remove sheetDecorateRemove
					return jS.sheetDecorateRemove(false, $(clonedTables));
				},

				/**
				 * get col associated with a sheet/table within an instance
				 * @param {jQuery|HTMLElement} table
				 * @param {Number} [i] Index of column, default is last
				 * @returns {Element}
				 * @memberOf jS
				 */
				col:function (table, i) {
					table = table || jS.obj.table()[0];

					var cols = jS.cols(table);

					if (i === u) {
						i = cols.length - 1;
					}

					return cols[i];
				},

				/**
				 * get cells of a table row
				 * @param {HTMLElement} [table]
				 * @param {Number} [i] Index of row, default is last
				 * @returns {HTMLCollection|Array}
				 * @memberOf jS
				 */
				rowTds:function (table, i) {
					table = table || jS.obj.table();

					var rows = jS.rows(table);

					if (!rows.length) {
						return [];
					}

					if (i == u) {
						i = rows.length - 1;
					}


					if (!rows[i]) return []; //tr
					if (!rows[i].children) return []; //td

					return rows[i].children;
				},

				/**
				 * Get rows of a sheet/table
				 * @param {HTMLElement} table
				 * @returns {HTMLCollection|Array}
				 * @memberOf jS
				 */
				rows:function (table) {
					table = table || jS.obj.table()[0];
					if (table === u) return []; //table
					if (table.tBody === u) return []; //tBody
					if (table.tBody.children === u) return []; //tr

					return table.tBody.children;
				},

				/**
				 * Get all the td objects that are currently highlighted
				 * @param {Boolean} [cells] will return cell objects rather than HTMLElement
				 * @returns {jQuery|HTMLElement|Array}
				 */
				highlighted:function(cells) {
					var highlighted = jS.highlighter.last || $([]),
						obj = [],
						tag,
						i;

					if (!(tag = highlighted) || !highlighted.length || !(tag = tag[0]) || !tag.tagName) {
						return cells ? obj : $(obj);
					}

					switch (tag.tagName) {
						case 'TD':
							i = highlighted.length - 1;
							do {
								obj.unshift(cells ? highlighted[i].jSCell : highlighted[i]);
							} while (i-- > 0);
							break;
						case 'TR':
							i = highlighted.length - 1;
							do {
								if (highlighted[i].tds) {
									obj = obj.concat(cells ? highlighted[i].jSCells : highlighted[i].tds);
								}
							} while(i-- > 0);
							break;
						case 'COL':
							highlighted = highlighted.filter('col');
							i = highlighted.length - 1;
							do {
								if (highlighted[i].tds) {
									obj = obj.concat(cells ? highlighted[i].jSCells : highlighted[i].tds);
								}
							} while(i-- > 0);
							break;
						case 'TABLE':
							obj = (cells ? tag.jSCells : tag.tds);
							break;
					}

					return cells ? obj : $(obj);
				},

				/**
				 *
				 * @param {Number} [i]
				 * @returns {Object} {cols, rows}
				 * @memberOf jS
				 */
				sheetSize:function (i) {
					if (i === undefined) {
						i = jS.i;
					}

					return s.loader.size(i);
				},

				sortVerticalSelectAscending:function() {
					if (confirm('Do you want to extend your selection?')) {
						jS.sortVertical(); return true;
					} else {
						jS.sortVerticalSingle(false); return true
					}
				},

				sortVerticalSelectDescending:function() {
					if (confirm('Do you want to extend your selection?')) {
						jS.sortVertical(); return false;
					} else {
						jS.sortVerticalSingle(true); return false
					}
				},


				/**
				 * Sorts what is highlighted vertically, and updates accordingly
				 * @param {Boolean} [reversed]
				 * @memberOf jS
				 */
				sortVertical:function (reversed) {

					var selected = jS.highlighted(true),
						trSibling = selected[0].td.parent().prev(),
						length = selected.length,
						date = new Date(),
						isNum = true,
						vals = [],
						row = [],
						offset,
						i = 0,
						cell,
						val,
						td;

					while(i<length){
						cell = selected[i];
						td = cell.td;
						if(!isNaN(cell.value)){
							val = (new Number(cell.value.valueOf()));
						}
						else{
							isNum = false;
							val = (new String(cell.value.valueOf()));
						}
						val.loc = jS.getTdLocation(td);
						val.row = td.parentNode;
						val.col = td;
						val.cell = cell;
						vals.push(val);
						i++;
					}


					if(reversed){
						if(isNum == false){
							vals.sort(function(a,b){return b-a});
						}
						else{
							vals.sort();
							vals.reverse();
						}
					}

					else
					{
						if(isNum == true){
							vals.sort(function(a,b){return a-b});
						}
						else{
							vals.sort();
						}
					}

					jS.undo.createCells(selected);
					while(offset = vals.length)							{
						val = vals.pop();
						row = jS.spreadsheets[jS.i].splice(val.row.rowIndex, 1);
						cell = val.cell;
						cell.value = val.valueOf();
						val.row.parentNode.removeChild(val.row);
						trSibling.after(val.row);
						val.row.children[0].innerHTML = trSibling[0].rowIndex + offset;
						jS.spreadsheets[jS.i].splice(trSibling[0].rowIndex + 1, 0, row[0]);
						jS.track.call(cell, true);
					}

					jS.undo.createCells(selected);
				},

				/**
				 * Sorts a single column
				 * @param reversed
				 */
				sortVerticalSingle: function (reversed) {
					var selected = jS.highlighted(true),
						length = selected.length,
						i =  0,
						num = [],
						cell;

					while(i<length){
						num.push(selected[i].value);
						i++
					}
					if(reversed){
						num.sort(function(a,b){return b-a});
					}
					else{
						num.sort(function(a,b){return a-b});
					}
					while(selected.length){
						cell = selected.pop();
						cell.value = num[selected.length];
						cell.updateValue();
					}
				},

				sortHorizontalSelectAscending:function() {
					if (confirm('Do you want to extend your selection?')) {
						jS.sortHorizontal(); return true;
					} else {
						jS.sortHorizontalSingle(false); return true;
					}
				},

				sortHorizontalSelectDescending:function() {
					if (confirm('Do you want to extend your selection?')) {
						jS.sortHorizontal(); return false;
					} else {
						jS.sortHorizontalSingle(true); return false;
					}
				},

				/**
				 * Sorts what is highlighted horizontally, and updates accordingly
				 * @param {Boolean} [reversed]
				 * @memberOf jS
				 */
				sortHorizontal:function (reversed) {

					var selected = jS.highlighted(true),
						pane = jS.obj.pane(),
						table = pane.table,
						tdSibling = selected[0].td,
						cell = tdSibling.jSCell,
						tdSiblingIndex = cell.cellIndex,
						colGroup = table.colGroup,
						size = jS.sheetSize().rows,
						length = selected.length,
						isNum = true,
						vals = [],
						offset,
						i = 0,
						x,
						cell,
						val,
						tr,
						td;

					while(i<length){
						x = 0;
						cell = selected[i];
						td = cell.td;
						if(!isNaN(cell.value)){
							val = new Number(cell.value.valueOf());
						}
						else{
							isNum = false;
							val = new String(cell.value.valueOf());
						}
						val.tds = [];
						val.loc = jS.getTdLocation(td);
						val.tr = td.parentNode;
						val.td = td;
						val.cell = cell;
						while(x <= size){
							val.tds.push(jS.obj.pane().table.children[1].children[x].children[td.cellIndex]);
							x++;
						}
						vals.push(val);
						i++;

					}


					if(reversed){
						if(isNum == false){
							vals.sort(function(a,b){return b-a});
						}
						else{
							vals.sort();
							vals.reverse();
						}
					}

					else
					{
						if(isNum == true){
							vals.sort(function(a,b){return a-b});
						}
						else{
							vals.sort();
						}
					}

					jS.undo.createCells(selected);
					while(vals.length){
						val = vals.pop();
						while(val.tds.length > 1){
							td = val.tds.pop();
							tr = td.parentNode;
							cell = jS.spreadsheets[jS.i][tr.rowIndex].splice(td.cellIndex, 1);
							tr.insertBefore(td, tr.children[tdSiblingIndex]);
							td.col = colGroup.children[vals.length + td.cellIndex - 1];
							td.barTop = td.col.bar;
							cell.value = td.jSCell.value;
							jS.spreadsheets[jS.i][tr.rowIndex].splice(td.cellIndex, 0, cell[0]);
							jS.resolveCell(cell, true);
						}
					}
					jS.undo.createCells(selected);
				},

				/**
				 * Sorts a single row
				 * @param reversed
				 */
				sortHorizontalSingle: function (reversed) {
					var selected = jS.highlighted(true),
						length = selected.length,
						i =  0,
						num = [],
						cell;

					while(i<length){
						num.push(selected[i].value);
						i++
					}
					if(reversed){
						num.sort(function(a,b){return b-a});
					}
					else{
						num.sort(function(a,b){return a-b});
					}
					while(selected.length){
						cell = selected.pop();
						cell.value = num[selected.length];
						cell.updateValue();
					}
				},

				/**
				 *
				 * @param {HTMLElement} [table]
				 * @returns {Object} {cols, rows}
				 * @memberOf jS
				 */
				tableSize:function (table, getActualSize) {
					var tBody,
						tBodyChildren,
						tr,
						trChildren,
						td,
						pane = table.pane,
						row = 0,
						column = 0,
						rowOffset = 0;

					//rowOffset = pane.actionUI.yDetacher.aboveIndex;

					table = table || jS.obj.table()[0];
					//table / tBody / tr / td

					if ((tBody = table.tBody) !== u
						&& (tBodyChildren = tBody.children) !== u
						&& (tr = tBodyChildren[tBodyChildren.length - 1]) !== u
						&& (trChildren = tr.children) !== u
						&& (td = trChildren[trChildren.length - 1]) !== u
					) {
						if (getActualSize === true) {
							row = tr.rowIndex;
						} else {
							row = tr.rowIndex + rowOffset;
						}

						column = td.cellIndex;
					} else {
						return {};
					}

					return {
						cols: column,
						rows: row
					};
				},

				/**
				 * Toggles from editable to viewable and back
				 * @param replacementTables
				 * @memberOf jS
				 */
				toggleState:function (replacementTables) {
					if (s.allowToggleState) {
						var tables = replacementTables || jS.tables();
						if (s.editable) {
							jS.evt.cellEditAbandon();
							jS.trigger('sheetSave', [tables]);
						}
						jS.setDirty(false);
						jS.setChanged(true);
						s.editable = !s.editable;

						jS.kill();


						s.parent
							.html(tables)
							.sheet(s);
						s = null;
					}
				},

				/**
				 * Turns a cell into a formula variable so it can be accessed by a name
				 * @param ref
				 * @memberOf jS
				 */
				setCellRef:function (ref) {
					function setRef(ref) {
						if (ref) { //TODO: need to update value when cell is updated

							jS.s.formulaVariables[ref] = cell.updateValue();
						}
					}

					var td = jS.obj.tdActive(),
						cell = td.jSCell;

					if (ref) {
						setRef(ref);
					} else {
						s.prompt(
							jS.msg.setCellRef,
							setRef
						);
					}
				},

				/**
				 * @memberOf jS
				 * @type Function
				 */
				parseFormula: null,

				/**
				 *
				 * @param {Number} [i]
				 * @param {Boolean} [skipStyles]
				 */
				print: function(i, skipStyles) {
					i = i || jS.i;

					var pWin = window.open(),
						pDoc;


					//popup blockers
					if (pWin !== u) {
						pDoc = pWin.document;
						pDoc.write('<html>\
	<head id="head"></head>\
	<body>\
		<div id="entry" class="' + jS.cl.parent + '" style="overflow: show;">\
		</div>\
	</body>\
</html>');


						if (skipStyles !== true) {
							$(pDoc.getElementById('head')).append($('style,link').clone());
						}

						$(pDoc.getElementById('entry')).append(jS.obj.pane().cloneNode(true));
						pDoc.close();
						pWin.focus();
						pWin.print();
					}
				}
			},
			loaderTables = [],
			loaderTable;

		jS.setBusy(true);
		s.parent[0].jS = jS;

		//got tired of ie crashing when console not available
		if (!window.console) window.console = {log:function () {}};

		if (window.scrollBarSize === u) {
			window.scrollBarSize = getScrollBarSize();
		}

		jS.cellHandler = new Sheet.CellHandler(jS, Sheet.fn);

		jS.theme = new Sheet.Theme(s.theme);

		jS.highlighter = new Sheet.Highlighter(jS.theme.tdHighlighted, jS.theme.barHighlight, jS.theme.tabActive, function() {
			//Chrome has a hard time rendering table col elements when they change style, this triggers the table to be re-rendered
			//jS.obj.pane().actionUI.redraw();
		});

		//We need to take the sheet out of the parent in order to get an accurate reading of it's height and width
		s.origHtml = s.parent.children().detach();

		s.parent.addClass(jS.cl.parent);

		s.parent
			.bind('sheetSwitch', function (e, js, i) {
				jS.switchSheet(i);
			})
			.bind('sheetRename', function (e, js, i) {
				jS.renameSheet(i);
			});

		//Use the setting height/width if they are there, otherwise use parent's
		s.width = (s.width ? s.width : s.parent.width());
		s.height = (s.height ? s.height : s.parent.height());


		// Drop functions if they are not needed & save time in recursion
		if (!$.nearest) {
			jS.nearest = emptyFN;
		}

		jS.resizableCells = jS.resizableSheet = jS.resizable;
		if (!$.ui) {
			jS.resizable = jS.resizableCells = jS.resizableSheet = jS.draggable = emptyFN;
		} else {
			if (!s.resizableCells) jS.resizableCells = emptyFN;
			if (!s.resizableSheet) jS.resizableSheet = emptyFN;
		}

		if (!$.support.boxModel) {
			s.boxModelCorrection = 0;
		}

		if (!s.barMenus) {
			jS.controlFactory.barMenuTop = jS.controlFactory.barMenuLeft = emptyFN;
		}

		if (!s.freezableCells) {
			jS.controlFactory.barHandleFreeze.top = jS.controlFactory.barHandleFreeze.left = emptyFN;
		}

		if (s.calcOff) {
			jS.calc = emptyFN;
		}

		$window
			.resize(function () {
				if (jS && !jS.isBusy()) { //We check because jS might have been killed
					s.width = s.parent.width();
					s.height = s.parent.height();
					jS.sheetSyncSize();
				}
			})
			.unload(function() {
				Sheet.thread.kill();
			});


		//Extend the calculation engine plugins
		Sheet.fn = $.extend(Sheet.fn, s.formulaFunctions);

		//Extend the calculation engine with finance functions
		if (Sheet.financefn) {
			Sheet.fn = $.extend(Sheet.fn, Sheet.financefn);
		}

		s.title = s.title || s.parent.attr('title') || '';

		jS.s = s;

		jS.parseFormula = (s.useMultiThreads ? Sheet.parseFormula : Sheet.parseFormulaSlow);

		s.parent.addClass(jS.theme.parent);


		if (s.loader === null) {
			s.loader = (new Sheet.Loader.HTML(s.origHtml))
		}

		s.loader
			.bindJS(jS)
			.bindHandler(jS.cellHandler);

		jS.openSheet(s.loader);

		jS.setBusy(false);

		return jS;
	},

	/**
	 * Creates an HTMLElement from a size given
	 * @memberOf jQuery.sheet
	 * @param {Object} [size] expects keys rows,cols,
	 * @param {Number} [columnWidth] column width as number
	 * @param {Number} [rowHeight] row height as number
	 * @returns {HTMLElement}
	 */
	makeTable:function (size, columnWidth, rowHeight) {
		var doc = document;
		//set defaults;
		size = size || {rows:25, cols:10};
		columnWidth = columnWidth || 120;
		rowHeight = rowHeight || 15;

		//Create elements before loop to make it faster.
		var table = document.createElement('table'),
			colGroup = document.createElement('colgroup'),
			tBody = document.createElement('tbody'),
			colStyle = 'width:' + columnWidth + 'px;',
			rowStyle = 'height:' + rowHeight + 'px;',
			tr,
			col,
			i,
			j;

		i = size.cols;

		do {
			col = document.createElement('col');
			col.setAttribute('style', colStyle);
			colGroup.appendChild(col);
		} while (i-- > 1);

		i = size.rows;
		do {
			tr = document.createElement('tr');
			tr.setAttribute('style', rowStyle);

			j = size.cols;
			do {
				tr.appendChild(document.createElement('td'));
			} while (j-- > 1);

			tBody.appendChild(tr);
		} while (i-- > 1);

		table.appendChild(colGroup);
		table.appendChild(tBody);

		return table;

	},

	/**
	 * Destroy all spreadsheets loaded
	 * @memberOf jQuery.sheet
	 */
	killAll:function () {
		if ($.sheet) {
			var instance = $.sheet.instance;
			if (instance) {
				for (var i = 0; i< instance.length; i++) {
					if (instance[i] && instance[i].kill) {
						instance[i].kill();
					}
				}
				$.sheet.instance = [];
			}
		}
	},

	/**
	 * Make 2 or more spreadsheets scroll to together, useful for history viewing or spreadsheet comparison
	 * @param {Number} I instance index
	 * @memberOf jQuery.sheet
	 */
	scrollLocker:function (I) {
		var instance = $.sheet.instance;
		instance[I].obj.panes().each(function (i) {
			var me;
			$(me = this.scrollUI).scroll(function (e) {
				var j = instance.length - 1,
					scrollUI;
				if (j > -1) {
					do {
						scrollUI = instance[j].controls.enclosures[i].scrollUI;

						if (this !== scrollUI) {
							scrollUI.scrollLeft = me.scrollLeft;
							scrollUI.scrollTop = me.scrollTop;
						}
					} while (j--);
				}
			});
		});
	},

	/**
	 * Make 2 or more spreadsheets switch together, just like clicking their tabs at the same time
	 * @param {Number} I instance index
	 * @memberOf jQuery.sheet
	 */
	switchSheetLocker:function (I) {
		$.each($.sheet.instance, function () {
			this.s.parent.bind('sheetSwitch', function (e, jS, i) {
				$.each($.sheet.instance, function () {
					this.setActiveSheet(i);
				});
			});
		});
	},

	/**
	 * Get current instance count
	 * @returns {Number}
	 * @memberOf jQuery.sheet
	 */
	I:function () {
		var I = 0;
		if (this.instance) {
			I = (this.instance.length === 0 ? 0 : this.instance.length - 1); //we use length here because we havent yet created sheet, it will append 1 to this number thus making this the effective instance number
		} else {
			this.instance = [];
		}
		return I;
	}
};Sheet.thread = (function (operative) {
	var i = 0,
		threads = [];

	function thread() {
		var t = threads[i],
			limit = thread.limit;

		if (t === undefined) {
			t = threads[i] = thread.create();
		} else {
			t = threads[i];
		}

		i++;
		if (i > limit) {
			i = 0;
		}

		return t;
	}

	thread.limit = 10;

	thread.create = function() {
		var t = operative({
			parseFormula: function(formula) {
				formulaParser.yy.types = [];
				return formulaParser.parse(formula);
			},
			streamJSONSheet: function(location, url, callback) {
				Promise
					.all([gR(location + url)])
					.then(function(sheetSets) {
						var json = sheetSets[0],
							sheet = JSON.parse(json),
							rows,
							max,
							i = 0;

						if (sheet.pop !== undefined) {
							sheet = sheet[0];
						}

						rows = sheet.rows;
						max = rows.length;

						sheet.rows = [];
						callback('sheet', JSON.stringify(sheet));

						for (; i < max; i++) {
							callback('row', JSON.stringify(rows[i]));
						}

						callback();

					}, function(err) {
						callback('error', err);
					});
			},
			streamJSONRows: function(location, urls, callback) {
				var i = 0,
					max = urls.length,
					getting = [];

				if (typeof urls === 'string') {
					getting.push(gR(location + urls));
				} else {
					for (; i < max; i++) {
						getting.push(gR(location + urls[i]));
					}
				}

				Promise
					.all(getting)
					.then(function(jsons) {
						var i = 0,
							j,
							row,
							rowSet,
							rowSets = jsons,
							iMax = rowSets.length,
							jMax;

						for(;i<iMax;i++) {
							rowSet = JSON.parse(rowSets[i]);
							jMax = rowSet.length;
							for(j = 0;j<jMax;j++) {
								row = rowSet[j];
								callback('row', JSON.stringify(row));
							}
						}

						callback();
					}, function(err) {
						callback('error', err);
					});
			},
			streamJSONSheetRows: function(location, sheetUrl, rowsUrls, callback) {
				var i = 0,
					max = rowsUrls.length,
					getting = [gR(location + sheetUrl)];

				if (typeof rowsUrls === 'string') {
					getting.push(gR(location + rowsUrls));
				} else {
					for (; i < max; i++) {
						getting.push(gR(location + rowsUrls[i]));
					}
				}

				Promise
					.all(getting)
					.then(function(jsons) {
						callback('sheet', jsons[0]);

						var i = 1,
							j,
							row,
							rowSet,
							rowSets = jsons,
							iMax = rowSets.length,
							jMax;

						for(;i<iMax;i++) {
							rowSet = JSON.parse(rowSets[i]);
							jMax = rowSet.length;
							for(j = 0;j<jMax;j++) {
								row = rowSet[j];
								callback('row', JSON.stringify(row));
							}
						}

						callback();
					}, function(err) {
						callback('error', err);
					});
			}
		}, [
			Sheet.formulaParserUrl,
			Sheet.threadScopeUrl
		]);

		t.stash = [];
		t.busy = false;

		return t;
	};

	thread.kill = function() {
		var i = 0,
			max = threads.length;

		for(;i < max; i++) {
			threads[i].terminate();
		}
	};

	return thread;
})(window.operative);var key = { /* key objects, makes it easier to develop */
		BACKSPACE: 			8,
		CAPS_LOCK: 			20,
		COMMA: 				188,
		CONTROL: 			17,
		ALT:				18,
		DELETE: 			46,
		DOWN: 				40,
		END: 				35,
		ENTER: 				13,
		ESCAPE: 			27,
		HOME: 				36,
		INSERT: 			45,
		LEFT: 				37,
		NUMPAD_ADD: 		107,
		NUMPAD_DECIMAL: 	110,
		NUMPAD_DIVIDE: 		111,
		NUMPAD_ENTER: 		108,
		NUMPAD_MULTIPLY: 	106,
		NUMPAD_SUBTRACT: 	109,
		PAGE_DOWN: 			34,
		PAGE_UP: 			33,
		PERIOD: 			190,
		RIGHT: 				39,
		SHIFT: 				16,
		SPACE: 				32,
		TAB: 				9,
		UP: 				38,
		C:				  67,
		F:					70,
		V:					86,
		X:				  88,
		Y:					89,
		Z:					90,
		UNKNOWN:			229
	},
	arrHelpers = window.arrHelpers = {
		math: Math,
		toNumbers:function (arr) {
			arr = this.flatten(arr);
			var i = arr.length - 1;

			if (i < 0) {
				return [];
			}

			do {
				if (arr[i]) {
					arr[i] = $.trim(arr[i]);
					if (isNaN(arr[i])) {
						arr[i] = 0;
					} else {
						arr[i] = arr[i] * 1;
					}
				} else {
					arr[i] = 0;
				}
			} while (i--);

			return arr;
		},
		unique:function (arr) {
			var o = {}, i, l = arr.length, r = [];
			for(i=0; i<l;i+=1) o[arr[i]] = arr[i];
			for(i in o) r.push(o[i]);
			return r;
		},
		flatten:function (arr) {
			var flat = [],
				item,
				i = 0,
				max = arr.length;

			for (; i < max; i++) {
				item = arr[i];
				if (item instanceof Array) {
					flat = flat.concat(this.flatten(item));
				} else {
					flat = flat.concat(item);
				}
			}
			return flat;
		},
		insertAt:function (arr, val, index) {
			$(val).each(function () {
				if (index > -1 && index <= arr.length) {
					arr.splice(index, 0, this);
				}
			});
			return arr;
		},
		indexOfNearestLessThan: function (array, needle) {
			if (array.length === 0) return -1;

			var high = array.length - 1,
				low = 0,
				mid,
				item,
				target = -1;

			if (array[high] < needle) {
				return high;
			}

			while (low <= high) {
				mid = (low + high) >> 1;
				item = array[mid];
				if (item > needle) {
					high = mid - 1;
				} else if (item < needle) {
					target = mid;
					low = mid + 1;
				} else {
					target = low;
					break;
				}
			}

			return target;
		},
		ofSet: function (array, needle) {
			if (array.length === 0) return null;

			var high = array.length - 1,
				lastIndex = high,
				biggest = array[high],
				smallest = array[0],
				low = 0,
				mid,
				item,
				target = -1,
				i,
				highSet = -1,
				lowSet = -1;

			if (array[high] < needle || array[0] > needle) {
				return null;
			} else {

				while (low <= high) {
					mid = (low + high) >> 1;
					item = array[mid];
					if (item > needle) {
						target = mid;
						high = mid - 1;
					} else if (item < needle) {
						low = mid + 1;
					} else {
						target = high;
						break;
					}
				}
			}

			if (target > -1) {
				i = target;
				while (i <= lastIndex) {
					if (array[i] + 1 === array[i + 1]) {
						i++;
					} else {
						highSet = array[i];
						break;
					}
				}

				if (highSet === -1) {
					highSet = biggest;
				}

				i = target;
				while (i >= 0) {
					if (array[i] - 1 === array[i - 1]) {
						i--;
					} else {
						lowSet = array[i];
						break;
					}
				}

				if (lowSet === -1) {
					lowSet = smallest;
				}
			}

			return {
				start: lowSet,
				end: highSet
			};
		},
		closest:function (array, num, min, max) {
			min = min || 0;
			max = max || array.length - 1;

			var target,
				item;

			while (true) {
				target = ((min + max) >> 1);
				item = array[target];
				if ((target === max || target === min) && item !== num) {
					return item;
				}
				if (item > num) {
					max = target;
				} else if (item < num) {
					min = target;
				} else {
					return item;
				}
			}
		},
		getClosestNum: function(num, ar, fn) {
			var i = 0, I, closest, closestDiff, currentDiff;
			if(ar.length) {
				closest = ar[0];
				I = i;
				for(i;i<ar.length;i++) {
					closestDiff = Math.abs(num - closest);
					currentDiff = Math.abs(num - ar[i]);
					if(currentDiff < closestDiff)
					{
						I = i;
						closest = ar[i];
					}
					closestDiff = null;
					currentDiff = null;
				}
				//returns first element that is closest to number
				if (fn) {
					return fn(closest, I);
				}
				return closest;
			}
			//no length
			return false;
		},
		//http://stackoverflow.com/questions/11919065/sort-an-array-by-the-levenshtein-distance-with-best-performance-in-javascript
		levenshtein: (function() {
			var row2 = [];
			return function(s1, s2) {
				if (s1 === s2) {
					return 0;
				} else {
					var s1_len = s1.length, s2_len = s2.length;
					if (s1_len && s2_len) {
						var i1 = 0, i2 = 0, a, b, c, c2, row = row2;
						while (i1 < s1_len)
							row[i1] = ++i1;
						while (i2 < s2_len) {
							c2 = s2.charCodeAt(i2);
							a = i2;
							++i2;
							b = i2;
							for (i1 = 0; i1 < s1_len; ++i1) {
								c = a + (s1.charCodeAt(i1) === c2 ? 0 : 1);
								a = row[i1];
								b = b < a ? (b < c ? b + 1 : c) : (a < c ? a + 1 : c);
								row[i1] = b;
							}
						}
						return b;
					} else {
						return s1_len + s2_len;
					}
				}
			};
		})(),
		lSearch: function(arr, value) {
			var i = 0,
				item,
				max = arr.length,
				found = -1,
				distance;

			for(;i < max; i++) {
				item = arr[i];
				distance = new Number(this.levenshtein(item, value));
				distance.item = item;
				if (distance < found) {
					found = distance;
				}
			}

			return (distance !== undefined ? distance.item : null);
		}
	},

	dates = {
		dayDiv: 86400000,
		math: Math,
		toCentury:function (date, dayDiv) {
			dayDiv = dayDiv || 86400000;

			return this.math.round(this.math.abs((new Date(1900, 0, -1)) - date) / dayDiv);
		},
		get:function (date, dayDiv) {
			dayDiv = dayDiv || 86400000;

			if (date.getMonth) {
				return date;
			} else if (isNaN(date)) {
				return new Date(Globalize.parseDate(date));
			} else {
				date *= dayDiv;
				//date = new Date(date);
				var newDate = (new Date(1900, 0, -1)) * 1;
				date += newDate;
				date = new Date(date);
				return date;
			}
		},
		week:function (date, dayDiv) {
			dayDiv = dayDiv || 86400000;

			var onejan = new Date(date.getFullYear(), 0, 1);
			return this.math.ceil((((date - onejan) / dayDiv) + onejan.getDay() + 1) / 7);
		},
		toString:function (date, pattern) {
			if (!pattern) {
				return Globalize.format(date);
			}
			return Globalize.format(date, Globalize.culture().calendar.patterns[pattern]);
		},
		diff:function (start, end, basis, dayDiv) {
			dayDiv = dayDiv || 86400000;

			switch (basis) {
				case 0:
					return this.days360Nasd(start, end, 0, true);
				case 1:
				case 2:
				case 3:
					var result = this.math.abs(end - start) / dayDiv;
					return result;
				case 4:
					return this.days360Euro(start, end);
			}

			return 0;
		},
		diffMonths:function (start, end) {
			var months;
			months = (end.getFullYear() - start.getFullYear()) * 12;
			months -= start.getMonth() + 1;
			months += end.getMonth() + 1;
			return months;
		},
		days360:function (startYear, endYear, startMonth, endMonth, startDate, endDate) {
			return ((endYear - startYear) * 360) + ((endMonth - startMonth) * 30) + (endDate - startDate)
		},
		days360Nasd:function (start, end, method, useEom) {
			var startDate = start.getDate(),
				startMonth = start.getMonth(),
				startYear = start.getFullYear(),
				endDate = end.getDate(),
				endMonth = end.getMonth(),
				endYear = end.getFullYear();

			if (
				(endMonth == 2 && this.isEndOfMonth(endDate, endMonth, endYear)) &&
					(
						(startMonth == 2 && this.isEndOfMonth(startDate, startMonth, startYear)) ||
							method == 3
						)
				) {
				endDate = 30;
			}

			if (endDate == 31 && (startDate >= 30 || method == 3)) {
				endDate = 30;
			}

			if (startDate == 31) {
				startDate = 30;
			}

			if (useEom && startMonth == 2 && this.isEndOfMonth(startDate, startMonth, startYear)) {
				startDate = 30;
			}

			return this.days360(startYear, endYear, startMonth, endMonth, startDate, endDate);
		},
		days360Euro:function (start, end) {
			var startDate = start.getDate(),
				startMonth = start.getMonth(),
				startYear = start.getFullYear(),
				endDate = end.getDate(),
				endMonth = end.getMonth(),
				endYear = end.getFullYear();

			if (startDate == 31) startDate = 30;
			if (endDate == 31) endDate = 30;

			return this.days360(startYear, endYear, startMonth, endMonth, startDate, endDate);
		},
		isEndOfMonth:function (day, month, year) {
			return day == (new Date(year, month + 1, 0, 23, 59, 59)).getDate();
		},
		isLeapYear:function (year) {
			return new Date(year, 1, 29).getMonth() == 1;
		},
		calcAnnualBasis:function (start, end, basis) {
			switch (basis) {
				case 0:
				case 2:
				case 4: return 360;
				case 3: return 365;
				case 1:
					var startDate = start.getDate(),
						startMonth = start.getMonth(),
						startYear = start.getFullYear(),
						endDate = end.getDate(),
						endMonth = end.getMonth(),
						endYear = end.getFullYear(),
						result = 0;

					if (startYear == endYear) {
						if (this.isLeapYear(startYear)) {
							result = 366;
						} else {
							result = 365;
						}
					} else if (((endYear - 1) == startYear) && ((startMonth > endMonth) || ((startMonth == endMonth) && startDate >= endDate))) {
						if (this.isLeapYear(startYear)) {
							if (startMonth < 2 || (startMonth == 2 && startDate <= 29)) {
								result = 366;
							} else {
								result = 365;
							}
						} else if (this.isLeapYear(endYear)) {
							if (endMonth > 2 || (endMonth == 2 && endDate == 29)) {
								result = 366;
							} else {
								result = 365;
							}
						} else {
							result = 365;
						}
					} else {
						for (var iYear = startYear; iYear <= endYear; iYear++) {
							if (this.isLeapYear(iYear)) {
								result += 366;
							} else {
								result += 365;
							}
						}
						result = result / (endYear - startYear + 1);
					}
					return result;
			}
			return 0;
		},
		lastDayOfMonth:function (date) {
			date.setDate(0);
			return date.getDate();
		},
		isLastDayOfMonth:function (date) {
			return (date.getDate() == this.lastDayOfMonth(date));
		}
	},

	times = window.times = {
		math: Math,
		fromMath:function (time) {
			var result = {}, me = this;

			result.hour = ((time * 24) + '').split('.')[0] * 1;

			result.minute = function (time) {
				time = me.math.round(time * 24 * 100) / 100;
				time = (time + '').split('.');
				var minute = 0;
				if (time[1]) {
					if (time[1].length < 2) {
						time[1] += '0';
					}
					minute = time[1] * 0.6;
				}
				return me.math.round(minute);
			}(time);

			result.second = function (time) {
				time = me.math.round(time * 24 * 10000) / 10000;
				time = (time + '').split('.');
				var second = 0;
				if (time[1]) {
					for (var i = 0; i < 4; i++) {
						if (!time[1].charAt(i)) {
							time[1] += '0';
						}
					}
					var secondDecimal = ((time[1] * 0.006) + '').split('.');
					if (secondDecimal[1]) {
						if (secondDecimal[1] && secondDecimal[1].length > 2) {
							secondDecimal[1] = secondDecimal[1].substr(0, 2);
						}

						return me.math.round(secondDecimal[1] * 0.6);
					}
				}
				return second;
			}(time);

			return result;
		},
		fromString:function (time, isAmPm) {
			var date = new Date(), timeParts = time, timeValue, hour, minute, second, meridiem;
			if (isAmPm) {
				meridiem = timeParts.substr(-2).toLowerCase(); //get ampm;
				timeParts = timeParts.replace(/(am|pm)/i, '');
			}

			timeParts = timeParts.split(':');
			hour = timeParts[0] * 1;
			minute = timeParts[1] * 1;
			second = (timeParts[2] ? timeParts[2] : 0) * 1;

			if (isAmPm && meridiem == 'pm') {
				hour += 12;
			}

			return jFN.TIME(hour, minute, second);
		}
	};


$.extend(Math, {
	log10:function (arg) {
		// http://kevin.vanzonneveld.net
		// +   original by: Philip Peterson
		// +   improved by: Onno Marsman
		// +   improved by: Tod Gentille
		// +   improved by: Brett Zamir (http://brett-zamir.me)
		// *	 example 1: log10(10);
		// *	 returns 1: 1
		// *	 example 2: log10(1);
		// *	 returns 2: 0
		return Math.log(arg) / 2.302585092994046; // Math.LN10
	},
	signum:function (x) {
		return (x / Math.abs(x)) || x;
	},
	log1p: function (x) {
		// http://kevin.vanzonneveld.net
		// +   original by: Brett Zamir (http://brett-zamir.me)
		// %		  note 1: Precision 'n' can be adjusted as desired
		// *	 example 1: log1p(1e-15);
		// *	 returns 1: 9.999999999999995e-16

		var ret = 0,
			n = 50; // degree of precision
		if (x <= -1) {
			return '-INF'; // JavaScript style would be to return Number.NEGATIVE_INFINITY
		}
		if (x < 0 || x > 1) {
			return Math.log(1 + x);
		}
		for (var i = 1; i < n; i++) {
			if ((i % 2) === 0) {
				ret -= Math.pow(x, i) / i;
			} else {
				ret += Math.pow(x, i) / i;
			}
		}
		return ret;
	}
});

/**
 *
 * @param {Object} base
 * @param {Object} extension
 */
function extend(base, extension) {
	var i;
	for(i in extension) if (extension.hasOwnProperty(i)) {
		base[i] = extension[i];
	}
	return base;
}

/**
 * Get scrollBar size
 * @returns {Object} {height: int, width: int}
 */
function getScrollBarSize() {
	var doc = document,
		inner = $(document.createElement('p')).css({
			width:'100%',
			height:'100%'
		}),
		outer = $(document.createElement('div')).css({
			position:'absolute',
			width:'100px',
			height:'100px',
			top:'0',
			left:'0',
			visibility:'hidden',
			overflow:'hidden'
		}).append(inner);

	$(document.body).append(outer);

	var w1 = inner.width(),
		h1 = inner.height();

	outer.css('overflow', 'scroll');

	var w2 = inner.width(),
		h2 = inner.height();

	if (w1 == w2 && outer[0].clientWidth) {
		w2 = outer[0].clientWidth;
	}
	if (h1 == h2 && outer[0].clientHeight) {
		h2 = outer[0].clientHeight;
	}

	outer.detach();

	var w = w1 - w2, h = h1 - h2;

	return {
		width: w || 15,
		height: h || 15
	};
}

function getAverageCharacterSize() {
	var characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
		el = $(document.createElement('span'))
			.html(characters)
			.appendTo('body'),
		size = {
			width: el.width() / characters.length,
			height: el.height()
		};

	el.remove();

	return size;
}

function debugPositionBox (x, y, box, color, which) {
	color = color || '#' + Math.floor(Math.random() * 16777215).toString(16);
	if (box) {
		var $box = $([]);
		$box = $box.add(debugPositionBox(box.left, box.top, null, color, 'top-left'));
		$box = $box.add(debugPositionBox(box.right, box.top, null, color, 'top-right'));
		$box = $box.add(debugPositionBox(box.left, box.bottom, null, color, 'bottom-left'));
		$box = $box.add(debugPositionBox(box.right, box.bottom, null, color, 'bottom-right'));
		return $box;
	}
	return $('<div style="width: 10px; height: 10px; position: absolute;"></div>')
		.css('top', (y - 5) + 'px')
		.css('left', (x + 5) + 'px')
		.css('background-color', color)
		.click(function () {
			console.log(which || 'none');
		})
		.appendTo('body');
}

$.printSource = function (s) {
	var w = win.open();
	w.document.write("<html><body><xmp>" + s + "\n</xmp></body></html>");
	w.document.close();
};;Sheet.Loader.HTML = (function($, document, String) {
	"use strict";
	function HTML(tables) {
		if (tables !== undefined) {
			this.tables = tables;
			this.count = tables.length;
		} else {
			this.tables = [];
			this.count = 0;
		}

		this.cellIds = {};
		this.jS = null;
		this.handler = null;
	}

	HTML.prototype = {
		bindJS: function(jS) {
			this.jS = jS;
			return this;
		},
		bindHandler: function(handler) {
			this.handler = handler;
			return this;
		},
		bindActionUI: function(spreadsheetIndex, actionUI) {
			actionUI.loadedFrom = this.tables[spreadsheetIndex];
		},
		size: function(spreadsheetIndex) {
			var size = {
					cols: 0,
					rows: 0
				},
				tables = this.tables,
				table,
				rows,
				firstRow,
				firstRowColumns;

			if ((table = tables[spreadsheetIndex]) === undefined) return size;
			if ((rows = table.querySelectorAll('tr')) === undefined) return size;
			if ((firstRow = rows[0]) === undefined) return size;
			if ((firstRowColumns = firstRow.children) === undefined) return size;

			return {
				rows: rows.length,
				cols: firstRowColumns.length
			};
		},
		getWidth: function(sheetIndex, columnIndex) {
			var tables = this.tables,
				table = tables[sheetIndex],
				columns,
				width;

			columns = table.querySelectorAll('col');

			if (columns.length > columnIndex) {
				width = columns[columnIndex].style.width.replace('px', '') || Sheet.defaultColumnWidth;
				return width * 1;
			}

			return Sheet.defaultColumnWidth;
		},
		getHeight: function(sheetIndex, rowIndex) {
			var tables = this.tables,
				table = tables[sheetIndex],
				rows,
				row,
				height;

			rows = table.querySelectorAll('tr');

			if (rows.length > rowIndex) {
				row = rows[rowIndex];

				height = row.style.height.replace('px', '') || Sheet.defaultRowHeight;

				return height * 1;
			}

			return Sheet.defaultRowHeight;
		},
		isHidden: function(sheetIndex) {
			var tables = this.tables,
				table = tables[sheetIndex];

			return table.style.display === 'none';
		},
		setHidden: function(sheetIndex, isHidden) {
			var tables = this.tables,
				table = tables[sheetIndex];

			if (isHidden) {
				table.style.display = 'none';
			} else {
				table.style.display = '';
			}

			return this;
		},
		addRow: function(sheetIndex, rowIndex, spreadsheetRow) {
			var table = this.tables[sheetIndex],
				columnIndex = 0,
				size = this.size(sheetIndex),
				columnMax = size.cols,
				rowsMax = size.rows,
				rows,
				row = document.createElement('tr'),
				tBody;

			if (table === undefined) return this;

			tBody = table.querySelector('tBody');
			rows = tBody.children;

			for (;columnIndex < columnMax; columnIndex++) {
				row.appendChild(
					spreadsheetRow[columnIndex].loadedFrom = document.createElement('td')
				);
			}

			if (rowIndex === undefined) {
				tBody.appendChild(row);
			} else if (rowIndex < rowsMax) {
				tBody.insertBefore(row, rows[rowIndex + 1]);
			}

			return this;
		},
		addColumn: function(sheetIndex, columnIndex, spreadsheetCells) {
			var table = this.tables[sheetIndex],
				rowIndex = 0,
				rows,
				row,
				td,
				size = this.size(sheetIndex),
				rowMax = size.rows,
				columnMax = size.cols,
				tBody;

			if (table === undefined) return this;

			tBody = table.querySelector('tBody');
			rows = tBody.children;

			if (columnIndex === undefined) {
				for (; rowIndex < rowMax; rowIndex++) {
					row = rows[rowIndex];
					td = document.createElement('td');
					spreadsheetCells[rowIndex].loadedFrom = td;
					row.append(td);
				}
			} else if (columnIndex < columnMax) {
				for (; rowIndex < rowMax; rowIndex++) {
					row = rows[rowIndex];
					td = document.createElement('td');
					spreadsheetCells[rowIndex].loadedFrom = td;
					row.insertBefore(td, row.children[columnIndex + 1]);
				}
			}

			return this;
		},
		deleteRow: function(sheetIndex, rowIndex) {
			var table = this.tables[sheetIndex],
				rows,
				hiddenRows,
				hiddenI,
				tBody;

			if (table === undefined) return this;

			tBody = table.querySelector('tBody');
			rows = tBody.children;

			if (rows.length > rowIndex) {
				tBody.removeChild(rows[rowIndex]);
			}

			if (
				table.hasAttribute('data-hiddenrows')
				(hiddenRows = table.getAttribute('data-hiddenrows').split(','))
				&& (hiddenI = hiddenRows.indexOf(rowIndex)) > -1
			) {
				hiddenRows.splice(hiddenI, 1);
				table.setAttribute('data-hiddenrows', hiddenRows.join(','));
			}

			return this;
		},
		deleteColumn: function(sheetIndex, columnIndex) {
			var table = this.tables[sheetIndex],
				rows,
				row,
				columns,
				rowIndex = 0,
				rowMax,
				hiddenColumns,
				hiddenI,
				tBody;

			if (table === undefined) return this;

			tBody = table.querySelector('tBody');
			rows = tBody.children;
			rowMax = rows.length;

			for(;rowIndex < rowMax; rowIndex++) {
				row = rows[rowIndex];
				columns = row.children;

				if (columnIndex.length > columnIndex) {
					row.removeChild(columns[columnIndex]);
				}
			}

			if (
				table.hasAttribute('data-hiddencolumns')
				&& (hiddenColumns = table.getAttribute('data-hiddencolumns').split(','))
				&& (hiddenI = hiddenColumns.indexOf(columnIndex)) > -1
			) {
				hiddenColumns.splice(hiddenI, 1);
				table.setAttribute('data-hiddencolumns', hiddenColumns.join(','));
			}

			return this;
		},
		setupTD: function(cell, td) {
			if (cell.covered) {
				td.style.visibility = 'hidden';
				return this;
			}

			var jS = this.jS,
				htmlCell = cell.loadedFrom,
				needsAbsolute = false,
				height = 0,
				width = 0,
				rowspan,
				colspan,
				rowMax,
				columnMax,
				rowIndex = cell.rowIndex,
				columnIndex = cell.columnIndex,
				nextCell;

			if (htmlCell.hasAttribute('class')) td.className = cell.className;
			if (htmlCell.hasAttribute('style')) td.setAttribute('style', htmlCell.getAttribute('style'));

			if (htmlCell.hasAttribute('rowspan')) {
				td.setAttribute('rowspan', rowspan = htmlCell.getAttribute('rowspan'));
				rowMax = rowIndex + (rowspan * 1);
				needsAbsolute = true;
			}
			if (htmlCell.hasAttribute('colspan')) {
				td.setAttribute('colspan', colspan = htmlCell.getAttribute('colspan'));
				columnMax = columnIndex + (colspan * 1);
				needsAbsolute = true;
			}

			if (needsAbsolute) {
				if (rowMax === undefined) {
					rowMax = rowIndex + 1;
				}
				if (columnMax === undefined) {
					columnMax = columnMax + 1;
				}
				td.style.position = 'absolute';
				td.style.borderBottomWidth =
				td.style.borderRightWidth = '1px';
				for (;rowIndex < rowMax; rowIndex++) {
					height += this.getHeight(cell.sheetIndex, rowIndex) + 2;
					if (cell.rowIndex !== rowIndex && (nextCell = jS.getCell(cell.sheetIndex, rowIndex, cell.columnIndex)) !== null) {
						nextCell.covered = true;
						nextCell.defer = cell;
					}
				}
				for (;columnIndex < columnMax; columnIndex++) {
					width += this.getWidth(cell.sheetIndex, columnIndex);
					if (cell.columnIndex !== columnIndex && (nextCell = jS.getCell(cell.sheetIndex, cell.rowIndex, columnIndex)) !== null) {
						nextCell.covered = true;
						nextCell.defer = cell;
					}
				}
				height -= 1;
				width -= 1;

				td.style.width = width + 'px';
				td.style.height = height + 'px';
			}

			return this;
		},
		getCell: function(sheetIndex, rowIndex, columnIndex) {
			var tables = this.tables,
				table,
				rows,
				row,
				cell;

			if ((table = tables[sheetIndex]) === undefined) return null;
			if ((rows = table.querySelectorAll('tr')) === undefined) return null;
			if ((row = rows[rowIndex]) === undefined) return null;
			if ((cell = row.children[columnIndex]) === undefined) return null;

			return cell;
		},
		jitCell: function(sheetIndex, rowIndex, columnIndex) {
			var tdCell = this.getCell(sheetIndex, rowIndex, columnIndex);

			if (tdCell === null) return null;

			if (tdCell.getCell !== undefined) {
				return tdCell.getCell();
			}

			var jitCell,
				id,
				value,
				formula,
				cellType,
				uneditable,
				hasId,
				hasValue,
				hasFormula,
				hasCellType,
				hasUneditable;

			id = tdCell.getAttribute('id');
			value = tdCell.innerHTML;
			formula = tdCell.getAttribute('data-formula');
			cellType = tdCell.getAttribute('data-celltype');
			uneditable = tdCell.getAttribute('data-uneditable');

			hasId = id !== null;
			hasValue = value.length > 0;
			hasFormula = formula !== null;
			hasCellType = cellType !== null;
			hasUneditable = uneditable !== null;

			jitCell = new Sheet.Cell(sheetIndex, null, this.jS, this.handler);
			jitCell.rowIndex = rowIndex;
			jitCell.columnIndex = columnIndex;
			jitCell.loadedFrom = tdCell;
			jitCell.loader = this;

			if (hasId) jitCell.id = id;

			if (hasFormula) jitCell.formula = formula;
			if (hasCellType) jitCell.cellType = cellType;
			if (hasUneditable) jitCell.uneditable = uneditable;


			if (hasValue) {
				jitCell.value = new String(value);
			}
			else {
				jitCell.value = new String();
			}

			jitCell.value.cell = jitCell;


			tdCell.getCell = function() {
				return jitCell;
			};

			return jitCell;
		},
		jitCellById: function(id, sheetIndex, callback) {
			switch(this.cellIds[id]) {
				//we do want this function to run, we have not defined anything yet
				case undefined:break;
				//we do not want this function to run, we've already tried to look for this cell, and assigned it null
				case null: return this;
				//we already have this cell, lets return it
				default:
					callback(this.cellIds[id].requestCell());
					break;
			}

			var loader = this,
				tables = this.tables,
				sheetMax = (sheetIndex < 0 ? tables.length - 1: sheetIndex + 1),
				table,
				rowIndex,
				rowMax,
				rows,
				row,
				columnIndex,
				columnMax,
				columns,
				column,
                cell;

			if (sheetIndex < 0) {
				sheetIndex = 0;
			}

			for(;sheetIndex < sheetMax;sheetIndex++) {
				table = tables[sheetIndex];
				rows = table.querySelectorAll('tr');
				if (rows.length < 1) continue;
				rowIndex = 0;
				rowMax = rows.length;

				for (; rowIndex < rowMax; rowIndex++) {

					row = rows[rowIndex];
					columns = row.children;
					columnIndex = 0;
					columnMax = columns.length;

					for (; columnIndex < columnMax; columnIndex++) {
						column = columns[columnIndex];

						if (column === null) continue;

						if (column.id !== null && column.id.length > 0) {
							this.cellIds[column.id] = {
								cell: column,
								sheetIndex: sheetIndex,
								rowIndex: rowIndex,
								columnIndex: columnIndex,
								requestCell: function() {
									return loader.jitCell(this.sheetIndex, this.rowIndex, this.columnIndex);
								}
							};
						}
					}
				}
			}

			if (this.cellIds[id] !== undefined) {
                cell = this.cellIds[id].requestCell();
				callback(cell);
			} else {
				this.cellIds[id] = null;
			}

			return this;
		},
		title: function(sheetIndex) {
			var tables = this.tables,
				table;

			if ((table = tables[sheetIndex]) === undefined) return '';

			return table.getAttribute('title');
		},
		hideRow: function(actionUI, rowIndex) {
			var table = actionUI.loadedFrom,
				hiddenRows;

			if (table.hasAttribute('data-hiddenrows')) {
				hiddenRows = arrHelpers.toNumbers(table.getAttribute('data-hiddenrows').split(','));
			} else {
				hiddenRows = [];
			}

			if (hiddenRows.indexOf(rowIndex) < 0) {
				hiddenRows.push(rowIndex);
				hiddenRows.sort(function (a, b) { return a - b; });
			}

			table.setAttribute('data-hiddenrows', hiddenRows.join(','));

			return hiddenRows;
		},
		hideColumn: function(actionUI, columnIndex) {
			var table = actionUI.loadedFrom,
				hiddenColumns;

			if (table.hasAttribute('data-hiddencolumns')) {
				hiddenColumns = arrHelpers.toNumbers(table.getAttribute('data-hiddencolumns').split(','));
			} else {
				hiddenColumns = [];
			}

			if (hiddenColumns.indexOf(columnIndex) < 0) {
				hiddenColumns.push(columnIndex);
				hiddenColumns.sort(function (a, b) { return a - b; });
			}

			table.setAttribute('data-hiddencolumns', hiddenColumns.join(','));

			return hiddenColumns;
		},
		showRow: function(actionUI, rowIndex) {
			var table = actionUI.loadedFrom,
				hiddenRows,
				i;

			if (table.hasAttribute('data-hiddenrows')) {
				hiddenRows = arrHelpers.toNumbers(table.getAttribute('data-hiddenrows').split(','));
			} else {
				hiddenRows = [];
			}

			if ((i = hiddenRows.indexOf(rowIndex)) > -1) {
				hiddenRows.splice(i, 1);
			}

			table.setAttribute('data-hiddenrows', hiddenRows.join(','));

			return hiddenRows;
		},
		showColumn: function(actionUI, columnIndex) {
			var table = actionUI.loadedFrom,
				hiddenColumns,
				i;

			if (table.hasAttribute('data-hiddencolumns')) {
				hiddenColumns = arrHelpers.toNumbers(table.getAttribute('data-hiddencolumns').split(','));
			} else {
				hiddenColumns = [];
			}

			if ((i = hiddenColumns.indexOf(columnIndex)) > -1) {
				hiddenColumns.splice(i, 1);
			}

			table.setAttribute('data-hiddencolumns', hiddenColumns.join(','));

			return hiddenColumns;
		},
		hiddenRows: function(actionUI) {
			var hiddenRowsString = actionUI.loadedFrom.getAttribute('data-hiddenrows'),
				hiddenRows = null;

			if (hiddenRowsString !== null) {
				hiddenRows = arrHelpers.toNumbers(hiddenRowsString.split(','));
			} else {
				hiddenRows = [];
			}

			return hiddenRows;
		},
		hiddenColumns: function(actionUI) {
			var hiddenColumnsString = actionUI.loadedFrom.getAttribute('data-hiddencolumns'),
				hiddenColumns = null;

			if (hiddenColumnsString !== null) {
				hiddenColumns = arrHelpers.toNumbers(hiddenColumnsString.split(','));
			} else {
				hiddenColumns = [];
			}

			return hiddenColumns;
		},
		hasSpreadsheetAtIndex: function(index) {
			return (this.tables[index] !== undefined);
		},
		getSpreadsheetIndexByTitle: function(title) {
			var tables = this.tables,
				max = this.count,
				i = 0,
				tableTitle;

			title = title.toLowerCase();

			for(;i < max; i++) {
				if (tables[i] !== undefined) {
					tableTitle = tables[i].getAttribute('title');
					if (tableTitle !== undefined && tableTitle !== null && tableTitle.toLowerCase() == title) {
						return i;
					}
				}
			}

			return -1;
		},
		addSpreadsheet: function(table, atIndex) {
			table = table || document.createElement('table');
			if (atIndex === undefined) {
				this.tables.push(table);
			} else {
				this.tables.splice(atIndex, 0, table);
			}
			this.count = this.tables.length;
		},
		getCellAttribute: function(cell, attribute) {
			return cell.getAttribute(attribute);
		},
		setCellAttribute: function(cell, attribute, value) {
			cell.setAttribute(attribute, value);
		},
		setCellAttributes: function(cell, attributes) {
			var i;
			for (i in attributes) if (i !== undefined && attributes.hasOwnProperty(i)) {
				cell.setAttribute(i, attributes[i]);
			}

			return this;
		},


		/**
		 *
		 * @param {Sheet.Cell} cell
		 */
		setDependencies: function(cell) {
			return this;
		},

		addDependency: function(parentCell, dependencyCell) {
			return this;
		},

		cycleCells: function(sheetIndex, fn) {
			var tables = this.tables,
				table,
				rows,
				columns,
				cell,
				row,
				rowIndex,
				columnIndex;

			if ((table = tables[sheetIndex]) === undefined) return;
			if ((rowIndex = (rows = table.querySelectorAll('tr')).length) < 1) return;
			if (rows[0].children.length < 1) return;

			rowIndex--;
			do
			{
				row = rows[rowIndex];
				columns = row.children;
				columnIndex = columns.length;
				do
				{
					cell = columns[columnIndex];
					fn.call(cell, sheetIndex, rowIndex, columnIndex);
				}
				while (columnIndex-- > 0);
			}
			while (rowIndex-- > 0);

			return this;
		},
		cycleCellsAll: function(fn) {
			var tables = this.tables,
				sheetIndex = tables.length;

			if (sheetIndex < 0) return;

			do
			{
				this.cycleCells(sheetIndex, fn);
			}
			while (sheetIndex-- > 0);

			return this;
		},

		toTables: function() {
			return this.tables;
		},

		fromSheet: function(doNotTrim) {
			doNotTrim = (doNotTrim == undefined ? false : doNotTrim);

			var output = [],
				jS = this.jS,
				i = 1 * jS.i,
				pane,
				spreadsheet,
				sheet = jS.spreadsheets.length - 1,
				tables,
				table,
				tBody,
				colGroup,
				col,
				row,
				column,
				parentAttr,
				tr,
				td,
				cell,
				attr,
				cl,
				parent,
				rowHasValues,
				parentEle,
				parentHeight;

			if (sheet < 0) return output;

			do {
				rowHasValues = false;
				jS.i = sheet;
				jS.evt.cellEditDone();
				pane = jS.obj.pane();
				table = document.createElement('table');
				tBody = document.createElement('tBody');
				colGroup = document.createElement('colGroup');
				table.setAttribute('title', jS.obj.table().attr('title'));
				table.setAttribute('data-frozenatrow', pane.action.frozenAt.row);
				table.setAttribute('data-frozenatcol', pane.action.frozenAt.col);
				table.appendChild(colGroup);
				table.appendChild(tBody);

				output.unshift(table);

				spreadsheet = jS.spreadsheets[sheet];
				row = spreadsheet.length;
				do {
					parentEle = spreadsheet[row][1].td.parentNode;
					parentHeight = parentEle.style['height'];
					tr = document.createElement('tr');
					tr.style.height = (parentHeight ? parentHeight : jS.s.colMargin + 'px');

					column = spreadsheet[row].length;
					do {
						cell = spreadsheet[row][column];
						td = document.createElement('td');
						attr = cell.td.attributes;

						if (doNotTrim || rowHasValues || attr['class'] || cell['formula'] || cell['value'] || attr['style']) {
							rowHasValues = true;

							cl = (attr['class'] ? $.trim(
								(attr['class'].value || '')
									.replace(jS.cl.uiCellActive , '')
									.replace(jS.cl.uiCellHighlighted, '')
							) : '');

							parent = cell.td.parentNode;

							tr.insertBefore(td, tr.firstChild);

							if (!tr.style.height) {
								tr.style.height = (parent.style.height ? parent.style.height : jS.s.colMargin + 'px');
							}

							if (cell['formula']) td.setAttribute('data-formula', cell['formula']);
							if (cell['cellType']) td.setAttribute('cellType', cell['cellType']);
							if (cell['value']) td.setAttribute('value', cell['value']);
							if (cell['uneditable']) td.setAttribute('uneditable', cell['uneditable']);
							if (cell['cache']) td.setAttribute('cache', cell['cache']);
							if (cell['id']) td.setAttribute('id', cell['id']);
							if (attr['style'] && attr['style'].value) td.setAttribute('style', attr['style'].value);


							if (cl.length) {
								td.className = cl;
							}
							if (attr['rowspan']) td['rowspan'] = attr['rowspan'].value;
							if (attr['colspan']) td['colspan'] = attr['colspan'].value;

							if (row * 1 == 1) {
								col = document.createElement('col');
								col.style.width = $(jS.col(null, column)).css('width');
								colGroup.insertBefore(col, colGroup.firstChild);
							}
						}
					} while (column-- > 1);

					if (rowHasValues) {
						tBody.insertBefore(tr, tBody.firstChild);
					}

				} while (row-- > 1);
			} while (sheet--);
			jS.i = i;

			return this.json = output;
		},
		type: HTML,
		typeName: 'Sheet.Loader.HTML',

		clearCaching: function() {
			return this;
		}
	};

	HTML.maxStoredDependencies = 100;

	return HTML;
})(jQuery, document, String);/**
 * @project jQuery.sheet() The Ajax Spreadsheet - http://code.google.com/p/jquerysheet/
 * @author RobertLeePlummerJr@gmail.com
 * $Id: jquery.sheet.dts.js 933 2013-08-28 12:59:30Z robertleeplummerjr $
 * Licensed under MIT
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

;Sheet.Loader.JSON = (function($, document, String) {
	"use strict";
	function JSONLoader(json) {
		if (json !== undefined) {
			this.json = json;
			this.count = json.length;
		} else {
			this.json = [];
			this.count = 0;
		}

		this.cellIds = {};
		this.jS = null;
		this.handler = null;
	}

	JSONLoader.prototype = {
		bindJS: function(jS) {
			this.jS = jS;
			return this;
		},
		bindHandler: function(handler) {
			this.handler = handler;
			return this;
		},
		bindActionUI: function(spreadsheetIndex, actionUI) {
			actionUI.loadedFrom = this.json[spreadsheetIndex];
		},
		size: function(spreadsheetIndex) {
			var size = {
					cols: 0,
					rows: 0
				},
				json = this.json,
				jsonSpreadsheet,
				rows,
				firstRow,
				firstRowColumns;

			if ((jsonSpreadsheet = json[spreadsheetIndex]) === undefined) return size;
			if ((rows = jsonSpreadsheet.rows) === undefined) return size;
			if ((firstRow = rows[0]) === undefined) return size;
			if ((firstRowColumns = firstRow.columns) === undefined) return size;

			return {
				rows: rows.length,
				cols: firstRowColumns.length
			};
		},
		getWidth: function(sheetIndex, columnIndex) {
			var json = this.json,
				jsonSpreadsheet = json[sheetIndex] || {},
				metadata = jsonSpreadsheet.metadata || {},
				widths = metadata.widths || [],
				width = widths[columnIndex] || Sheet.defaultColumnWidth;

			return width * 1;
		},
		getHeight: function(sheetIndex, rowIndex) {
			var json = this.json,
				jsonSpreadsheet = json[sheetIndex] || {},
				rows = jsonSpreadsheet.rows || [],
				row = rows[rowIndex] || {},
				height = row.height || Sheet.defaultRowHeight;

			return height * 1;
		},
		isHidden: function(sheetIndex) {
			var json = this.json,
				jsonSpreadsheet = json[sheetIndex] || {},
				metadata = jsonSpreadsheet.metadata || {};

			return metadata.hidden === true;
		},
		setHidden: function(sheetIndex, isHidden) {
			var json = this.json,
				jsonSpreadsheet = json[sheetIndex] || {},
				metadata = jsonSpreadsheet.metadata || {};

			metadata.hidden = isHidden;

			return this;
		},
		addRow: function(sheetIndex, rowIndex, spreadsheetCells) {
			var json = this.json[sheetIndex],
				columnIndex = 0,
				columnMax = this.size(sheetIndex).cols,
				rows,
				row = {
					columns: []
				},
				jsonCell,
				columns = row.columns;

			if (json === undefined) return this;

			rows = json.rows;

			for (;columnIndex < columnMax; columnIndex++) {
				jsonCell = {};
				spreadsheetCells[columnIndex] = jsonCell;
				columns.push(jsonCell);
			}

			if (rowIndex === undefined) {
				rows.push(row);
			} else if (rowIndex < rows.length) {
				rows.splice(rowIndex, 0, row);
			}

			return this;
		},
		addColumn: function(sheetIndex, columnIndex, spreadsheetCells) {
			var json = this.json[sheetIndex],
				rowIndex = 0,
				rows,
				jsonCell,
				size = this.size(sheetIndex),
				rowMax = size.rows,
				columnMax = size.cols;

			if (json === undefined) return this;

			rows = json.rows;

			if (columnIndex === undefined) {
				for (; rowIndex < rowMax; rowIndex++) {
					jsonCell = {};
					spreadsheetCells[rowIndex].loadedFrom = jsonCell;
					rows[rowIndex].columns.push(jsonCell);
				}
			} else if (columnIndex < columnMax) {
				for (; rowIndex < rowMax; rowIndex++) {
					jsonCell = {};
					spreadsheetCells[rowIndex].loadedFrom = jsonCell;
					rows[rowIndex].columns.splice(columnIndex, 0, jsonCell);
				}
			}

			return this;
		},
		deleteRow: function(sheetIndex, rowIndex) {
			var json = this.json[sheetIndex],
				rows,
				metadata,
				hiddenRows,
				hiddenI;

			if (json === undefined) return this;

			rows = json.rows;

			if (rows.length > rowIndex) {
				rows.splice(rowIndex, 1);
			}

			if (
				(metadata = json.metadata) !== undefined
				&& (hiddenRows = metadata.hiddenRows) !== undefined
				&& (hiddenI = hiddenRows.indexOf(rowIndex)) > -1
			) {
				hiddenRows.splice(hiddenI, 1);
			}

			return this;
		},
		deleteColumn: function(sheetIndex, columnIndex) {
			var json = this.json[sheetIndex],
				rows,
				row,
				columns,
				rowIndex = 0,
				rowMax,
				metadata,
				hiddenColumns,
				hiddenI;

			if (json === undefined) return this;

			rows = json.rows;
			rowMax = rows.length;

			for(;rowIndex < rowMax; rowIndex++) {
				row = rows[rowIndex];
				columns = row.columns;

				if (columnIndex.length > columnIndex) {
					columns.splice(columnIndex, 1);
				}
			}

			if (
				(metadata = json.metadata) !== undefined
				&& (hiddenColumns = metadata.hiddenColumns) !== undefined
				&& (hiddenI = hiddenColumns.indexOf(columnIndex)) > -1
			) {
				hiddenColumns.splice(hiddenI, 1);
			}

			return this;
		},
		setupTD: function(cell, td) {
			if (cell.covered) {
				td.style.visibility = 'hidden';
				return this;
			}

			var jS = this.jS,
				jsonCell = cell.loadedFrom,
				needsAbsolute = false,
				height = 0,
				width = 0,
				rowspan,
				colspan,
				rowMax,
				columnMax,
				rowIndex = cell.rowIndex,
				columnIndex = cell.columnIndex,
				nextCell;

			if (jsonCell['class'] !== undefined) td.className = jsonCell['class'];
			if (jsonCell['id'] !== undefined) td.setAttribute('id', jsonCell['id']);
			if (jsonCell['style'] !== undefined) td.setAttribute('style', jsonCell['style']);

			if (jsonCell['rowspan'] !== undefined) {
				td.setAttribute('rowspan', rowspan = jsonCell['rowspan']);
				rowMax = rowIndex + (rowspan * 1);
				needsAbsolute = true;
			}
			if (jsonCell['colspan'] !== undefined) {
				td.setAttribute('colspan', colspan = jsonCell['colspan']);
				columnMax = columnIndex + (colspan * 1);
				needsAbsolute = true;
			}

			if (needsAbsolute) {
				//make values optional
				if (rowMax === undefined) {
					rowMax = rowIndex + 1;
				}
				if (columnMax === undefined) {
					columnMax = columnMax + 1;
				}

				td.style.position = 'absolute';
				td.style.borderBottomWidth =
				td.style.borderRightWidth = '1px';
				for (;rowIndex < rowMax; rowIndex++) {
					height += this.getHeight(cell.sheetIndex, rowIndex) + 2;
					if (cell.rowIndex !== rowIndex && (nextCell = jS.getCell(cell.sheetIndex, rowIndex, cell.columnIndex)) !== null) {
						nextCell.covered = true;
						nextCell.defer = cell;
					}
				}
				for (;columnIndex < columnMax; columnIndex++) {
					width += this.getWidth(cell.sheetIndex, columnIndex);
					if (cell.columnIndex !== columnIndex && (nextCell = jS.getCell(cell.sheetIndex, cell.rowIndex, columnIndex)) !== null) {
						nextCell.covered = true;
						nextCell.defer = cell;
					}
				}
				height -= 1;
				width -= 1;

				td.style.width = width + 'px';
				td.style.height = height + 'px';
			}

			return this;
		},
		getCell: function(sheetIndex, rowIndex, columnIndex) {
			var json = this.json,
				jsonSpreadsheet,
				rows,
				row,
				cell;

			if ((jsonSpreadsheet = json[sheetIndex]) === undefined) return;
			if ((rows = jsonSpreadsheet.rows) === undefined) return;
			if ((row = rows[rowIndex]) === undefined) return;
			if ((cell = row.columns[columnIndex]) === undefined) return;

			//null is faster in json, so here turn null into an object
			if (cell === null) {
				cell = row.columns[columnIndex] = {};
			}

			return cell;
		},
		jitCell: function(sheetIndex, rowIndex, columnIndex) {
			var jsonCell = this.getCell(sheetIndex, rowIndex, columnIndex);

			if (jsonCell === undefined) return null;

			if (jsonCell.getCell !== undefined) {
				return jsonCell.getCell();
			}

			var jitCell,
				i,
				id,
				max,
				value,
				cache,
				formula,
				parsedFormula,
				cellType,
				uneditable,
				dependency,
				dependencies,
				jsonDependency,
				hasId,
				hasValue,
				hasCache,
				hasFormula,
				hasParsedFormula,
				hasCellType,
				hasUneditable,
				hasDependencies;

			id = jsonCell['id'];
			value = jsonCell['value'];
			cache = jsonCell['cache'];
			formula = jsonCell['formula'];
			parsedFormula = jsonCell['parsedFormula'];
			cellType = jsonCell['cellType'];
			uneditable = jsonCell['uneditable'];
			dependencies = jsonCell['dependencies'];

			hasId = (id !== undefined && id !== null);
			hasValue = (value !== undefined && value !== null);
			hasCache = (cache !== undefined && cache !== null && (cache + '').length > 0);
			hasFormula = (formula !== undefined && formula !== null && formula !== '');
			hasParsedFormula = (parsedFormula !== undefined && parsedFormula !== null);
			hasCellType = (cellType !== undefined && cellType !== null);
			hasUneditable = (uneditable !== undefined && uneditable !== null);
			hasDependencies = (dependencies !== undefined && dependencies !== null);

			jitCell = new Sheet.Cell(sheetIndex, null, this.jS, this.handler);
			jitCell.rowIndex = rowIndex;
			jitCell.columnIndex = columnIndex;
			jitCell.loadedFrom = jsonCell;
			jitCell.loader = this;

			if (hasId) jitCell.id = id;

			if (hasFormula) jitCell.formula = formula;
			if (hasParsedFormula) jitCell.parsedFormula = parsedFormula;
			if (hasCellType) jitCell.cellType = cellType;
			if (hasUneditable) jitCell.uneditable = uneditable;


			if (hasValue) {
				jitCell.value = new String(value);
			}
			else {
				jitCell.value = new String();
			}

			if (hasCache) {
				jitCell.value.html = cache;
				jitCell.needsUpdated = false;
			} else {
				jitCell.needsUpdated = (hasFormula || hasCellType || jitCell.hasOperator.test(value));
			}

			if (hasDependencies) {
				max = dependencies.length;
				for (i = 0; i < max; i++) {
					jsonDependency = dependencies[i];
					dependency = this.jitCell(jsonDependency['s'], jsonDependency['r'], jsonDependency['c']);
					//dependency was found
					if (dependency !== null) {
						jitCell.dependencies.push(dependency);
					}

					//dependency was not found, so cache cannot be accurate, so reset it and remove all dependencies
					else {
						jitCell.dependencies = [];
						jsonCell['dependencies'] = [];
						jitCell.setNeedsUpdated(true);
						jitCell.value = new String();
					}
				}
			}

			jitCell.value.cell = jitCell;


			jsonCell.getCell = function() {
				return jitCell;
			};

			return jitCell;
		},
		jitCellById: function(id, sheetIndex, callback) {
			switch(this.cellIds[id]) {
				//we do want this function to run, we have not defined anything yet
				case undefined:break;
				//we do not want this function to run, we've already tried to look for this cell, and assigned it null
				case null: return this;
				//we already have this cell, lets return it
				default:
					callback(this.cellIds[id].requestCell());
					break;
			}

			var loader = this,
				json = this.json,
				sheetMax = (sheetIndex < 0 ? json.length - 1: sheetIndex + 1),
				sheet,
				rowIndex,
				rowMax,
				rows,
				row,
				columnIndex,
				columnMax,
				columns,
				column,
                cell;

			if (sheetIndex < 0) {
				sheetIndex = 0;
			}

			for(;sheetIndex < sheetMax;sheetIndex++) {
				sheet = json[sheetIndex];
				rows = sheet.rows;
				if (rows.length < 1) continue;
				rowIndex = 0;
				rowMax = rows.length;

				for (; rowIndex < rowMax; rowIndex++) {

					row = rows[rowIndex];
					columns = row.columns;
					columnIndex = 0;
					columnMax = columns.length;

					for (; columnIndex < columnMax; columnIndex++) {
						column = columns[columnIndex];

						if (column === null) continue;

						if (typeof column['id'] === 'string') {
							this.cellIds[column['id']] = {
								cell: column,
								sheetIndex: sheetIndex,
								rowIndex: rowIndex,
								columnIndex: columnIndex,
								requestCell: function() {
									return loader.jitCell(this.sheetIndex, this.rowIndex, this.columnIndex);
								}
							};
						}
					}
				}
			}

			if (this.cellIds[id] !== undefined) {
                cell = this.cellIds[id].requestCell();
				callback(cell);
			} else {
				this.cellIds[id] = null;
			}

			return this;
		},
		title: function(sheetIndex) {
			var json = this.json,
				jsonSpreadsheet;

			if ((jsonSpreadsheet = json[sheetIndex]) === undefined) return '';

			return jsonSpreadsheet.title || '';
		},
		hideRow: function(actionUI, rowIndex) {
			var json = actionUI.loadedFrom,
				metadata = json.metadata || (json.metadata = {}),
				hiddenRows = metadata.hiddenRows || (metadata.hiddenRows = []);

			if (hiddenRows.indexOf(rowIndex) < 0) {
				hiddenRows.push(rowIndex);
				hiddenRows.sort(function (a, b) { return a - b; });
			}

			return hiddenRows;
		},
		hideColumn: function(actionUI, columnIndex) {
			var json = actionUI.loadedFrom,
				metadata = json.metadata || (json.metadata = {}),
				hiddenColumns = metadata.hiddenColumns || (metadata.hiddenColumns = []);

			if (hiddenColumns.indexOf(columnIndex) < 0) {
				hiddenColumns.push(columnIndex);
				hiddenColumns.sort(function (a, b) { return a - b; });
			}

			return hiddenColumns;
		},
		showRow: function(actionUI, rowIndex) {
			var json = actionUI.loadedFrom,
				metadata = json.metadata || (json.metadata = {}),
				hiddenRows = metadata.hiddenRows || (metadata.hiddenRows = []),
				i;

			if ((i = hiddenRows.indexOf(rowIndex)) > -1) {
				hiddenRows.splice(i, 1);
			}

			return hiddenRows;
		},
		showColumn: function(actionUI, columnIndex) {
			var json = actionUI.loadedFrom,
				metadata = json.metadata || (json.metadata = {}),
				hiddenColumns = metadata.hiddenColumns || (metadata.hiddenColumns = []),
				i;

			if ((i = hiddenColumns.indexOf(columnIndex)) > -1) {
				hiddenColumns.splice(i, 1);
			}

			return hiddenColumns;
		},
		hiddenRows: function(actionUI) {
			var json = actionUI.loadedFrom,
				metadata = json.metadata || (json.metadata = {}),
				hiddenRows = metadata.hiddenRows || (metadata.hiddenRows = []),
				max = hiddenRows.length,
				result = [],
				i = 0;

			for (;i < max; i++) result.push(hiddenRows[i]);

			return result;
		},
		hiddenColumns: function(actionUI) {
			var json = actionUI.loadedFrom,
				metadata = json.metadata || (json.metadata = {}),
				hiddenColumns = metadata.hiddenColumns || (metadata.hiddenColumns = []),
				max = hiddenColumns.length,
				result = [],
				i = 0;

			for (;i < max; i++) result.push(hiddenColumns[i]);

			return result;
		},
		hasSpreadsheetAtIndex: function(index) {
			return (this.json[index] !== undefined);
		},
		getSpreadsheetIndexByTitle: function(title) {
			var json = this.json,
				max = this.count,
				i = 0,
				jsonTitle;

			title = title.toLowerCase();

			for(;i < max; i++) {
				if (json[i] !== undefined) {
					jsonTitle = json[i].title;
					if (jsonTitle !== undefined && jsonTitle !== null && jsonTitle.toLowerCase() == title) {
						return i;
					}
				}
			}

			return -1;
		},
		addSpreadsheet: function(jsonSpreadsheet, atIndex) {
			jsonSpreadsheet = jsonSpreadsheet || {};

			if (atIndex === undefined) {
				this.json.push(jsonSpreadsheet);
			} else {
				this.json.splice(atIndex, 0, jsonSpreadsheet);
			}
			this.count = this.json.length;
		},
		getCellAttribute: function(cell, attribute) {
			return cell[attribute];
		},
		setCellAttribute: function(cell, attribute, value) {
			cell[attribute] = value;
		},
		setCellAttributes: function(cell, attributes) {
			var i;
			for (i in attributes) if (i !== undefined && attributes.hasOwnProperty(i)) {
				cell[i] = attributes[i];
			}

			return this;
		},


		/**
		 *
		 * @param {Sheet.Cell} cell
		 */
		setDependencies: function(cell) {
			//TODO: need to handle the cell's cache that are dependent on this one so that it changes when it is in view
			//some cells just have a ridiculous amount of dependencies
			if (cell.dependencies.length > JSONLoader.maxStoredDependencies) {
				delete cell.loadedFrom['dependencies'];
				return this;
			}

			var i = 0,
				loadedFrom = cell.loadedFrom,
				dependencies = cell.dependencies,
				dependency,
				max = dependencies.length,
				jsonDependencies = loadedFrom['dependencies'] = [];

			for(;i<max;i++) {
				dependency = dependencies[i];
				jsonDependencies.push({
					s: dependency.sheetIndex,
					r: dependency.rowIndex,
					c: dependency.columnIndex
				});
			}

			return this;
		},

		addDependency: function(parentCell, dependencyCell) {
			var loadedFrom = parentCell.loadedFrom;

			if (loadedFrom.dependencies === undefined) {
				loadedFrom.dependencies = [];
			}

			loadedFrom.dependencies.push({
				s: dependencyCell.sheetIndex,
				r: dependencyCell.rowIndex,
				c: dependencyCell.columnIndex
			});

		    return this;
		},

		cycleCells: function(sheetIndex, fn) {
			var json = this.json,
				jsonSpreadsheet,
				rows,
				columns,
				jsonCell,
				row,
				rowIndex,
				columnIndex;

			if ((jsonSpreadsheet = json[sheetIndex]) === undefined) return;
			if ((rowIndex = (rows = jsonSpreadsheet.rows).length) < 1) return;
			if (rows[0].columns.length < 1) return;

			do
			{
				row = rows[rowIndex];
				columns = row.columns;
				columnIndex = columns.length - 1;
				do
				{
					jsonCell = columns[columnIndex];
					fn.call(jsonCell, sheetIndex, rowIndex, columnIndex);
				}
				while (columnIndex-- >= 0);
			}
			while (rowIndex-- >= 0);

			return this;
		},
		cycleCellsAll: function(fn) {
			var json = this.json,
				sheetIndex = json.length - 1;

			if (sheetIndex < 0) return;

			do
			{
				this.cycleCells(sheetIndex, fn);
			}
			while (sheetIndex-- > 0);

			return this;
		},
		/**
		 * Create a table from json
		 * @param {Array} json array of spreadsheets - schema:<pre>
		 * [{ // sheet 1, can repeat
		 *  "title": "Title of spreadsheet",
		 *  "metadata": {
		 *	  "widths": [
		 *		  120, //widths for each column, required
		 *		  80
		 *	  ]
		 *  },
		 *  "rows": [
		 *	  { // row 1, repeats for each column of the spreadsheet
		 *		  "height": 18, //optional
		 *		  "columns": [
		 *			  { //column A
		 *				  "cellType": "", //optional
		 *				  "class": "css classes", //optional
		 *				  "formula": "=cell formula", //optional
		 *				  "value": "value", //optional
		 *				  "style": "css cell style", //optional
		 *				  "uneditable": true, //optional
		 *				  "cache": "" //optional
		 *			  },
		 *			  {} //column B
		 *		  ]
		 *	  },
		 *	  { // row 2
		 *		  "height": 18, //optional
		 *		  "columns": [
		 *			  { // column A
		 *				  "cellType": "", //optional
		 *				  "class": "css classes", //optional
		 *				  "formula": "=cell formula", //optional
		 *				  "value": "value", //optional
		 *				  "style": "css cell style" //optional
		 *				  "uneditable": true, //optional
		 *				  "cache": "" //optional
		 *			  },
		 *			  {} // column B
		 *		  ]
		 *	  }
		 *  ]
		 * }]</pre>
		 * @returns {*|jQuery|HTMLElement} a simple html table
		 * @memberOf Sheet.JSONLoader
		 */
		toTables: function() {

			var json = this.json,
				max = this.count,
				tables = $([]),
				spreadsheet,
				rows,
				row,
				columns,
				column,
				metadata,
				widths,
				width,
				frozenAt,
				hiddenRows,
				hiddenColumns,
				height,
				table,
				colgroup,
				col,
				tr,
				td,
				i = 0,
				j,
				k;


			for (; i < max; i++) {
				spreadsheet = json[i];
				table = $(document.createElement('table'));
				if (spreadsheet['title']) table.attr('title', spreadsheet['title'] || '');

				tables = tables.add(table);

				rows = spreadsheet['rows'];
				for (j = 0; j < rows.length; j++) {
					row = rows[j];
					if (height = (row['height'] + '').replace('px','')) {
						tr = $(document.createElement('tr'))
							.attr('height', height)
							.css('height', height + 'px')
							.appendTo(table);
					}
					columns = row['columns'];
					for (k = 0; k < columns.length; k++) {
						column = columns[k];
						td = $(document.createElement('td'))
							.appendTo(tr);

						if (column['class']) td.attr('class', column['class'] || '');
						if (column['style']) td.attr('style', column['style'] || '');
						if (column['formula']) td.attr('data-formula', (column['formula'] ? '=' + column['formula'] : ''));
						if (column['cellType']) td.attr('data-celltype', column['cellType'] || '');
						if (column['value']) td.html(column['value'] || '');
						if (column['uneditable']) td.html(column['uneditable'] || '');
						if (column['rowspan']) td.attr('rowspan', column['rowspan'] || '');
						if (column['colspan']) td.attr('colspan', column['colspan'] || '');
						if (column['id']) td.attr('id', column['id'] || '');
						if (column['cache']) td.html(column['cache']);
					}
				}

				if (metadata = spreadsheet['metadata']) {
					if (widths = metadata['widths']) {
						colgroup = $(document.createElement('colgroup'))
							.prependTo(table);
						for(k = 0; k < widths.length; k++) {
							width = (widths[k] + '').replace('px', '');
							col = $(document.createElement('col'))
								.attr('width', width)
								.css('width', width + 'px')
								.appendTo(colgroup);
						}
					}
					if (frozenAt = metadata['frozenAt']) {
						if (frozenAt['row']) {
							table.attr('data-frozenatrow', frozenAt['row']);
						}
						if (frozenAt['col']) {
							table.attr('data-frozenatcol', frozenAt['col']);
						}
					}

					if (hiddenRows = metadata['hiddenRows']) {
						table.attr('data-hiddenrows', hiddenRows.join(','));
					}

					if (hiddenColumns = metadata['hiddenColumns']) {
						table.attr('data-hiddencolumns', hiddenColumns.join(','));
					}
				}
			}

			return tables;
		},

		/**
		 * Create json from jQuery.sheet Sheet instance
		 * @param {Boolean} [doNotTrim] cut down on added json by trimming to only edited area
		 * @returns {Array}  - schema:<pre>
		 * [{ // sheet 1, can repeat
				 *  "title": "Title of spreadsheet",
				 *  "metadata": {
				 *	  "widths": [
				 *		  "120px", //widths for each column, required
				 *		  "80px"
				 *	  ],
				 *	  "frozenAt": {row: 0, col: 0},
				 *	  "hiddenRows": [1,2,3],
				 *	  "hiddenColumns": [1,2,3]
				 *  },
				 *  "rows": [
				 *	  { // row 1, repeats for each column of the spreadsheet
				 *		  "height": "18px", //optional
				 *		  "columns": [
				 *			  { //column A
				 *				  "cellType": "", //optional
				 *				  "class": "css classes", //optional
				 *				  "formula": "=cell formula", //optional
				 *				  "value": "value", //optional
				 *				  "style": "css cell style", //optional
				 *				  "uneditable": false,  //optional
				 *				  "cache": "",  //optional
				 *				  "id": "" //optional
				 *			  },
				 *			  {} //column B
				 *		  ]
				 *	  },
				 *	  { // row 2
				 *		  "height": "18px", //optional
				 *		  "columns": [
				 *			  { // column A
				 *				  "cellType": "", //optional
				 *				  "class": "css classes", //optional
				 *				  "formula": "=cell formula", //optional
				 *				  "value": "value", //optional
				 *				  "style": "css cell style", //optional
				 *				  "uneditable": true, //optional
				 *				  "cache": "", //optional
				 *				  "id": "" //optional
				 *			  },
				 *			  {} // column B
				 *		  ]
				 *	  }
				 *  ]
				 * }]</pre>
		 * @memberOf Sheet.JSONLoader
		 */
		fromSheet: function(doNotTrim) {
			doNotTrim = (doNotTrim == undefined ? false : doNotTrim);

			var output = [],
				jS = this.jS,
				i = 1 * jS.i,
				pane,
				sheet = jS.spreadsheets.length - 1,
				jsonSpreadsheet,
				spreadsheet,
				row,
				column,
				parentAttr,
				jsonRow,
				jsonColumn,
				cell,
				attr,
				cl,
				parent,
				rowHasValues,
				parentEle,
				parentHeight;

			if (sheet < 0) return output;

			do {
				rowHasValues = false;
				jS.i = sheet;
				jS.evt.cellEditDone();
				pane = jS.obj.pane();
				jsonSpreadsheet = {
					"title": (jS.obj.table().attr('title') || ''),
					"rows": [],
					"metadata": {
						"widths": [],
						"frozenAt": {
							"row": pane.actionUI.frozenAt.row,
							"col": pane.actionUI.frozenAt.col
						}
					}
				};

				output.unshift(jsonSpreadsheet);

				spreadsheet = jS.spreadsheets[sheet];
				row = spreadsheet.length - 1;
				do {
					parentEle = spreadsheet[row][1].td.parentNode;
					parentHeight = parentEle.style['height'];
					jsonRow = {
						"columns": [],
						"height": (parentHeight ? parentHeight.replace('px', '') : jS.s.colMargin)
					};

					column = spreadsheet[row].length - 1;
					do {
						cell = spreadsheet[row][column];
						jsonColumn = {};
						attr = cell.td.attributes;

						if (doNotTrim || rowHasValues || attr['class'] || cell['formula'] || cell['value'] || attr['style']) {
							rowHasValues = true;

							cl = (attr['class'] ? $.trim(
								(attr['class'].value || '')
									.replace(jS.cl.uiCellActive , '')
									.replace(jS.cl.uiCellHighlighted, '')
							) : '');

							parent = cell.td.parentNode;

							jsonRow.columns.unshift(jsonColumn);

							if (!jsonRow["height"]) {
								jsonRow["height"] = (parent.style['height'] ? parent.style['height'].replace('px' , '') : jS.s.colMargin);
							}

							if (cell['formula']) jsonColumn['formula'] = cell['formula'];
							if (cell['cellType']) jsonColumn['cellType'] = cell['cellType'];
							if (cell['value']) jsonColumn['value'] = cell['value'];
							if (cell['uneditable']) jsonColumn['uneditable'] = cell['uneditable'];
							if (cell['cache']) jsonColumn['cache'] = cell['cache'];
							if (cell['id']) jsonColumn['id'] = cell['id'];
							if (attr['style'] && attr['style'].value) jsonColumn['style'] = attr['style'].value;


							if (cl.length) {
								jsonColumn['class'] = cl;
							}
							if (attr['rowspan']) jsonColumn['rowspan'] = attr['rowspan'].value;
							if (attr['colspan']) jsonColumn['colspan'] = attr['colspan'].value;

							if (row * 1 == 1) {
								jsonSpreadsheet.metadata.widths.unshift($(jS.col(null, column)).css('width').replace('px', ''));
							}
						}
					} while (column-- > 1);

					if (rowHasValues) {
						jsonSpreadsheet.rows.unshift(jsonRow);
					}

				} while (row-- > 1);
			} while (sheet--);
			jS.i = i;

			return this.json = output;
		},
		type: JSONLoader,
		typeName: 'Sheet.JSONLoader',

		clearCaching: function() {
			var json = this.json,
				spreadsheet,
				row,
				rows,
				column,
				columns,
				sheetIndex = 0,
				rowIndex,
				columnIndex,
				sheetMax = json.length,
				rowMax,
				columnMax;

			for (;sheetIndex < sheetMax; sheetIndex++) {
				spreadsheet = json[sheetIndex];
				rows = spreadsheet['rows'];
				rowMax = rows.length;

				for (rowIndex = 0; rowIndex < rowMax; rowIndex++) {
					row = rows[rowIndex];
					columns = row['columns'];
					columnMax = columns.length;

					for (columnIndex = 0; columnIndex < columnMax; columnIndex++) {
						column = columns[columnIndex];

						if (column === null) continue;

						delete column['cache'];
						delete column['dependencies'];
						delete column['parsedFormula'];
					}
				}
			}

			return this;
		},

		/**
		 *
		 */
		download: function(rowSplitAt) {
			rowSplitAt = rowSplitAt || 500;

			var w = window.open(),
				d,
				entry,
				json = this.json,
				i = 0,
				max = json.length - 1,
				spreadsheet;


			//popup blockers
			if (w !== undefined) {
				d = w.document;
				d.write('<html>\
	<head id="head"></head>\
	<body>\
		<div id="entry">\
		</div>\
	</body>\
</html>');

				entry = $(d.getElementById('entry'));

				while (i <= max) {
					spreadsheet = json[i];

					//strategy: slice spreadsheet into parts so JSON doesn't get overloaded and bloated
					if (spreadsheet.rows.length > rowSplitAt) {
						var spreadsheetPart = {
								title: spreadsheet.title,
								metadata: spreadsheet.metadata,
								rows: []
							},
							rowParts = [],
							rowIndex = 0,
							row,
							rows = spreadsheet.rows,
							rowCount = rows.length,
							fileIndex = 1,
							setIndex = 0,
							addFile = function(json, index) {
								entry.append(document.createElement('br'));
								entry
									.append(
										$(document.createElement('a'))
											.attr('download', spreadsheet.title + '-part' + index +'.json')
											.attr('href', URL.createObjectURL(new Blob([JSON.stringify(json)], {type: "application/json"})))
											.text(spreadsheet.title + ' - part ' + index)
									);
							};

						addFile(spreadsheetPart, fileIndex);
						/*entry
							.append(
								document.createElement('br')
							)
							.append(
								$(document.createElement('a'))
									.attr('download', spreadsheet.title + '-part' + fileIndex +'.json')
									.attr('href', new Blob([JSON.stringify()], {type: "application/json"}))
									.text(spreadsheet.title + ' part:' + fileIndex)
							);*/

						while (rowIndex < rowCount) {
							if (setIndex === rowSplitAt) {
								setIndex = 0;
								fileIndex++;

								addFile(rowParts, fileIndex);

								rowParts = [];
							}
							rowParts.push(rows[rowIndex]);
							setIndex++;
							rowIndex++
						}

						if (rowParts.length > 0) {
							fileIndex++;
							addFile(rowParts, fileIndex);
						}
					}

					//strategy: stringify sheet and output
					else {
						entry
							.append(
								document.createElement('br')
							)
							.append(
								$(document.createElement('a'))
									.attr('download', spreadsheet.title + '.json')
									.attr('href', URL.createObjectURL(new Blob([JSON.stringify(spreadsheet)], {type: "application/json"})))
									.text(spreadsheet.title)
							);
					}
					i++;
				}


				d.close();
				w.focus();
			}
		}
	};

	JSONLoader.maxStoredDependencies = 100;

	return JSONLoader;
})(jQuery, document, String);/**
 * @project jQuery.sheet() The Ajax Spreadsheet - http://code.google.com/p/jquerysheet/
 * @author RobertLeePlummerJr@gmail.com
 * $Id: jquery.sheet.dts.js 933 2013-08-28 12:59:30Z robertleeplummerjr $
 * Licensed under MIT
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

;Sheet.Loader.XML = (function($, document) {
	"use strict";

	/**
	 *
	 * @param {String|jQuery|HTMLElement} xml - schema:<textarea disabled=disabled>
	 * <spreadsheets>
	 *	 <spreadsheet title="spreadsheet title">
	 *		 <metadata>
	 *			 <widths>
	 *				 <width>120</width>
	 *				 <width>80</width>
	 *			 </widths>
	 *			 <frozenAt>
	 *				 <row>0</row>
	 *				 <col>0</col>
	 *			 </frozenAt>
	 *		 </metadata>
	 *		 <rows>
	 *			 <row height=15>
	 *				  <columns>
	 *					  <column>
	 *						  <cellType></cellType>
	 *						  <formula>=cell formula</formula>
	 *						  <value>cell value</value>
	 *						  <style>cells style</style>
	 *						  <class>cells class</class>
	 *					  </column>
	 *					  <column></column>
	 *				  </columns>
	 *			  </row>
	 *			 <row height=15>
	 *				  <columns>
	 *					  <column>
	 *						  <cellType></cellType>
	 *						  <formula>=cell formula</formula>
	 *						  <value>cell value</value>
	 *						  <style>cells style</style>
	 *						  <class>cells class</class>
	 *					  </column>
	 *					  <column></column>
	 *				  </columns>
	 *			  </row>
	 *		 </rows>
	 *	 </spreadsheet>
	 * </spreadsheets></textarea>
	 */
	function Constructor(xml) {
		if (xml !== undefined) {
			this.xml = $.parseXML(xml);
			this.spreadsheets = this.xml.getElementsByTagName('spreadsheets')[0].getElementsByTagName('spreadsheet');
			this.count = this.xml.length;
		} else {
			this.xml = null;
			this.spreadsheets = null;
			this.count = 0;
		}
	}

	Constructor.prototype = {
		size: function(spreadsheetIndex) {
			var xmlSpreadsheet = this.xml[spreadsheetIndex],
				rows = xmlSpreadsheet.rows,
				firstRow = rows[0],
				firstRowColumns = firstRow.columns;

			return {
				rows: rows.length,
				cols: firstRowColumns.length
			};
		},
		setWidth: function(sheetIndex, columnIndex, colElement) {
			var spreadsheets = this.spreadsheets,
				xmlSpreadsheet = spreadsheets[sheetIndex],
				metadata = xmlSpreadsheet.getElementsByTagName('metadata')[0] || {},
				widths = metadata.getElementsByTagName('width') || [],
				widthElement = widths[columnIndex],
				width = (widthElement.textContent || widthElement.text);

			colElement.style.width = width + 'px';
		},
		setRowHeight: function(sheetIndex, rowIndex, barTd) {
			var spreadsheets = this.spreadsheets,
				xmlSpreadsheet,
				rows,
				row,
				height;

			if ((xmlSpreadsheet = spreadsheets[sheetIndex]) === undefined) return;
			if ((rows = xmlSpreadsheet.getElementsByTagName('rows')[0].getElementsByTagName('row')) === undefined) return;
			if ((row = rows[rowIndex]) === undefined) return;
			if ((height = row.attributes['height'].nodeValue) === undefined) return;

			barTd.style.height = height + 'px';
		},
		setupCell: function(sheetIndex, rowIndex, columnIndex, blankCell, blankTd) {
			var spreadsheets = this.spreadsheets,
				xmlSpreadsheet,
				row,
				cell,
				jitCell;

			if ((xmlSpreadsheet = spreadsheets[sheetIndex]) === undefined) return false;
			if ((row = xmlSpreadsheet.getElementsByTagName('rows')[0].getElementsByTagName('row')[rowIndex - 1]) === undefined) return false;
			if ((cell = row.getElementsByTagName('columns')[0].getElementsByTagName('column')[columnIndex - 1]) === undefined) return false;

			blankCell.cellType = cell.attributes['cellType'].nodeValue || '';

			if ((jitCell = cell.jitCell) !== undefined) {
				blankCell.html = jitCell.html;
				blankCell.state = jitCell.state;
				blankCell.cellType = jitCell.cellType;
				blankCell.value = jitCell.value;
				blankCell.uneditable = jitCell.uneditable;
				blankCell.sheet = jitCell.sheet;
				blankCell.dependencies = jitCell.dependencies;
			}

			if (cell.attributes['formula']) {
				blankCell.formula = cell.attributes['formula'].nodeValue || '';
				blankTd.setAttribute('data-formula', cell.attributes['formula'].nodeValue || '');
			} else {
				blankTd.innerHTML = blankCell.value = cell.attributes['value'].nodeValue || '';
			}

			blankTd.className = cell.attributes['class'].nodeValue || '';
			blankTd.setAttribute('style', cell.attributes['style'].nodeValue || '');

			if (cell.attributes['rowspan']) blankTd.setAttribute('rowspan', cell.attributes['rowspan'].nodeValue || '');
			if (cell.attributes['colspan']) blankTd.setAttribute('colspan', cell.attributes['colspan'].nodeValue || '');

			return true;
		},
		getCell: function(sheetIndex, rowIndex, columnIndex) {
			//TODO
			return null;
		},
		jitCell: function(sheetIndex, rowIndex, columnIndex) {
			var spreadsheets = this.spreadsheets,
				xmlSpreadsheet,
				row,
				cell;

			if ((xmlSpreadsheet = spreadsheets[sheetIndex]) === undefined) return false;
			if ((row = xmlSpreadsheet.getElementsByTagName('rows')[0].getElementsByTagName('row')[rowIndex - 1]) === undefined) return false;
			if ((cell = row.getElementsByTagName('columns')[0].getElementsByTagName('column')[columnIndex - 1]) === undefined) return false;

			return {
				td: {
					cellIndex: columnIndex,
					parentNode:{
						rowIndex: rowIndex
					},
					html: function() {}
				},
				html: [],
				state: [],
				cellType: cell.attributes['cellType'].nodeValue || '',
				formula: cell.attributes['formula'].nodeValue || '',
				value: cell.attributes['value'].nodeValue || '',
				type: 'cell',
				sheet: sheetIndex,
				id: null
			}
		},
		title: function(sheetIndex) {
			var spreadsheets = this.spreadsheets,
				spreadsheet;

			if ((spreadsheet = spreadsheets[sheetIndex]) === undefined) return '';

			return (spreadsheet.attributes['title'] ? spreadsheet.attributes['title'].nodeValue : '');
		},
		getSpreadsheetIndexByTitle: function(title) {
			//TODO
		},
		addSpreadsheet: function(xmlSpreadsheet, atIndex) {
			//TODO
			if (atIndex === undefined) {
				this.spreadsheets.append.push(jsonSpreadsheet);
			} else {
				this.json.splice(atIndex, 0, jsonSpreadsheet);
			}
			this.count = this.json.length;
		},
		setCellAttribute: function(cell, attribute, value) {
			//TODO
		},
		/**
		 * @returns {*|jQuery|HTMLElement} a simple html table
		 * @memberOf Sheet.XMLLoader
		 */
		toTables: function() {
			var xml = this.xml,
				tables = $([]),
				spreadsheets = xml.getElementsByTagName('spreadsheets')[0].getElementsByTagName('spreadsheet'),
				spreadsheet,
				rows,
				row,
				columns,
				column,
				attr,
				metadata,
				frozenat,
				frozenatrow,
				frozenatcol,
				widths,
				width,
				height;

			for (var i = 0; i < spreadsheets.length; i++) {
				spreadsheet = spreadsheets[i];
				var table = $(document.createElement('table')).attr('title', (spreadsheet.attributes['title'] ? spreadsheet.attributes['title'].nodeValue : '')),
					colgroup = $(document.createElement('colgroup')).appendTo(table),
					tbody = $(document.createElement('tbody')).appendTo(table);

				tables = tables.add(table);

				rows = spreadsheet.getElementsByTagName('rows')[0].getElementsByTagName('row');
				metadata = spreadsheet.getElementsByTagName('metadata')[0];

				for (var l = 0; l < rows.length; l++) {//row
					row = rows[l];
					var tr = $(document.createElement('tr')).appendTo(tbody);

					if (height = row.attributes['height']) {
						height = (height.nodeValue || '').replace('px','');
						tr
							.css('height', height)
							.attr('height', height + 'px');
					}

					columns = row.getElementsByTagName('columns')[0].getElementsByTagName('column');
					for (var m = 0; m < columns.length; m++) {
						column = columns[m];
						var td = $(document.createElement('td')).appendTo(tr),
							formula = column.getElementsByTagName('formula')[0],
							cellType = column.getElementsByTagName('cellType')[0],
							value = column.getElementsByTagName('value')[0],
							style = column.getElementsByTagName('style')[0],
							cl = column.getElementsByTagName('class')[0],
							rowspan = column.getElementsByTagName('rowspan')[0],
							colspan = column.getElementsByTagName('colspan')[0],
							id = column.getElementsByTagName('id')[0];

						if (formula) td.attr('data-formula', '=' + (formula.textContent || formula.text));
						if (cellType) td.attr('data-celltype', cellType.textContent || cellType.text);
						if (value) td.html(value.textContent || value.text);
						if (style) td.attr('style', style.textContent || style.text);
						if (cl) td.attr('class', cl.textContent || cl.text);
						if (rowspan) td.attr('rowspan', rowspan.textContent || rowspan.text);
						if (colspan) td.attr('colspan', colspan.textContent || colspan.text);
						if (id) td.attr('id', id.textContent || id.text);
					}
				}

				widths = metadata.getElementsByTagName('width');
				for (var l = 0; l < widths.length; l++) {
					width = (widths[l].textContent || widths[l].text).replace('px', '');
					$(document.createElement('col'))
						.attr('width', width)
						.css('width', width + 'px')
						.appendTo(colgroup);
				}

				frozenat = metadata.getElementsByTagName('frozenAt')[0];
				if (frozenat) {
					frozenatcol = frozenat.getElementsByTagName('col')[0];
					frozenatrow = frozenat.getElementsByTagName('row')[0];

					if (frozenatcol) table.attr('data-frozenatcol', (frozenatcol.textContent || frozenatcol.text) * 1);
					if (frozenatrow) table.attr('data-frozenatrow', (frozenatrow.textContent || frozenatrow.text) * 1);
				}
			}
			return tables;
		},

		/**
		 * Create xml from jQuery.sheet Sheet instance
		 * @param {Object} jS the jQuery.sheet instance
		 * @param {Boolean} [doNotTrim] cut down on added json by trimming to only edited area
		 * @param {Boolean} [doNotParse] skips turning the created xml string back into xml
		 * @returns {String} - schema:<textarea disabled=disabled>
		 * <spreadsheets>
		 *	 <spreadsheet title="spreadsheet title">
		 *		 <metadata>
		 *			 <widths>
		 *				 <width>120px</width>
		 *				 <width>80px</width>
		 *			 </widths>
		 *		 </metadata>
		 *		 <rows>
		 *			 <row height="15px">
		 *				  <columns>
		 *					  <column>
		 *						  <cellType></cellType>
		 *						  <formula>=cell formula</formula>
		 *						  <value>cell value</value>
		 *						  <style>cells style</style>
		 *						  <class>cells class</class>
		 *					  </column>
		 *					  <column></column>
		 *				  </columns>
		 *			  </row>
		 *			 <row height="15px">
		 *				  <columns>
		 *					  <column>
		 *						  <cellType></cellType>
		 *						  <formula>=cell formula</formula>
		 *						  <value>cell value</value>
		 *						  <style>cells style</style>
		 *						  <class>cells class</class>
		 *					  </column>
		 *					  <column></column>
		 *				  </columns>
		 *			  </row>
		 *		 </rows>
		 *	 </spreadsheet>
		 * </spreadsheets></textarea>
		 * @memberOf Sheet.XMLLoader
		 */
		fromSheet: function(jS, doNotTrim, doNotParse) {
			doNotTrim = (doNotTrim == undefined ? false : doNotTrim);
			var output = '',
				i = 1 * jS.i,
				sheet = jS.spreadsheets.length - 1,
				xmlSpreadsheet,
				spreadsheet,
				row,
				column,
				parentAttr,
				xmlRow,
				xmlColumn,
				xmlColumns,
				cell,
				attr,
				cl,
				parent,
				frozenAt,
				rowHasValues,
				widths,
				parentEle,
				parentHeight;

			if (sheet < 0) return output;

			do {
				rowHasValues = false;
				jS.i = sheet;
				jS.evt.cellEditDone();
				frozenAt = $.extend({}, jS.obj.pane().actionUI.frozenAt);
				widths = [];

				spreadsheet = jS.spreadsheets[sheet];
				row = spreadsheet.length - 1;
				xmlRow = '';
				do {
					xmlColumns = '';
					column = spreadsheet[row].length - 1;
					do {
						xmlColumn = '';
						cell = spreadsheet[row][column];
						attr = cell.td[0].attributes;
						cl = (attr['class'] ? $.trim(
							(attr['class'].value || '')
								.replace(jS.cl.uiCellActive, '')
								.replace(jS.cl.uiCellHighlighted, '')
						) : '');

						if (doNotTrim || rowHasValues || cl || cell.formula || cell.value || attr['style']) {
							rowHasValues = true;

							xmlColumn += '<column>';

							if (cell.formula) xmlColumn += '<formula>' + cell.formula + '</formula>';
							if (cell.cellType) xmlColumn += '<cellType>' + cell.cellType + '</cellType>';
							if (cell.value) xmlColumn += '<value>' + cell.value + '</value>';
							if (attr['style']) xmlColumn += '<style>' + attr['style'].value + '</style>';
							if (cl) xmlColumn += '<class>' + cl + '</class>';
							if (attr['rowspan']) xmlColumn += '<rowspan>' + attr['rowspan'].value + '</rowspan>';
							if (attr['colspan']) xmlColumn += '<colspan>' + attr['colspan'].value + '</colspan>';
							if (attr['id']) xmlColumn += '<id>' + attr['id'].value + '</id>';

							xmlColumn += '</column>';

							xmlColumns = xmlColumn + xmlColumns;

							if (row * 1 == 1) {
								widths[column] = '<width>' + $(jS.col(null, column)).css('width').replace('px', '') + '</width>';
							}
						}

					} while (column -- > 1);

					if (xmlColumns) {
						parentEle = spreadsheet[row][1].td[0].parentNode;
						parentHeight = parentEle.style['height'];
						xmlRow = '<row height="' + (parentHeight ? parentHeight.replace('px', '') : jS.s.colMargin) + '">' +
							'<columns>' +
							xmlColumns +
							'</columns>' +
							'</row>' + xmlRow;
					}

				} while (row-- > 1);
				xmlSpreadsheet = '<spreadsheet title="' + (jS.obj.table().attr('title') || '') + '">' +
					'<rows>' +
					xmlRow +
					'</rows>' +
					'<metadata>' +
					(
						frozenAt.row || frozenAt.col ?
							'<frozenAt>' +
								(frozenAt.row ? '<row>' + frozenAt.row + '</row>' : '') +
								(frozenAt.col ? '<col>' + frozenAt.col + '</col>' : '') +
								'</frozenAt>' :
							''
						) +
					'<widths>' + widths.join('') + '</widths>' +
					'</metadata>' +
					'</spreadsheet>';

				output = xmlSpreadsheet + output;
			} while (sheet--);

			jS.i = i;

			output = '<?xml version="1.0" encoding="UTF-8"?><spreadsheets xmlns="http://www.w3.org/1999/xhtml">' + output + '</spreadsheets>';

			if (doNotParse !== true) {
				this.xml = $.parseXML(output);
			}

			return output;
		},
		type: Constructor,
		typeName: 'Sheet.XMLLoader'
	};

	return Constructor;
})(jQuery, document);
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
})(document, window, Math, Number, $);Sheet.Cell = (function() {
	var u = undefined;

	function Cell(sheetIndex, td, jS, cellHandler) {
		if (Cell.cellLoading === null) {
			Cell.cellLoading = jS.msg.cellLoading;
		}
		if (td !== undefined && td !== null) {
			this.td = td;
			td.jSCell = this;
		} else {
			this.td = null;
		}
		this.dependencies = [];
		this.formula = '';
		this.cellType = null;
		this.value = '';
		this.valueOverride = null;
		this.calcCount = 0;
		this.sheetIndex = sheetIndex;
		this.rowIndex = null;
		this.columnIndex = null;
		this.jS = (jS !== undefined ? jS : null);
		this.state = [];
		this.needsUpdated = true;
		this.uneditable = false;
		this.id = null;
		this.loader = null;
		this.loadedFrom = null;
		this.cellHandler = cellHandler;
		this.waitingCallbacks = [];
		this.parsedFormula = null;
		this.defer = null;
		this.isEdit = false;
		this.edited = false;
		this.covered = false;
	}

	Cell.prototype = {
		clone: function() {
			var clone = new Cell(this.sheetIndex, this.td, this.jS, this.cellHandler),
				prop;
			for (prop in this) if (
				prop !== undefined
				&& this.hasOwnProperty(prop)
			) {
				if (this[prop] !== null && this[prop].call === undefined) {
					clone[prop] = this[prop];
				} else if (this[prop] === null) {
					clone[prop] = this[prop];
				}
			}

			return clone;
		},

		addDependency:function(cell) {
			if (cell === undefined || cell === null) return;

			if (cell.type !== Sheet.Cell) {
				throw new Error('Wrong Type');
			}

			if (this.dependencies.indexOf(cell) < 0 && this !== cell) {
				this.dependencies.push(cell);
				if (this.loader !== null) {
					this.loader.addDependency(this, cell);
				}
			}
		},
		/**
		 * Ignites calculation with cell, is recursively called if cell uses value from another cell, can be sent indexes, or be called via .call(cell)
		 * @param {Function} [callback]
		 * @returns {*} cell value after calculated
		 */
		updateValue:function (callback) {
			if (
				!this.needsUpdated
				&& this.value.cell !== u
				&& this.defer === null
			) {
				var result = (this.valueOverride !== null ? this.valueOverride : this.value);
				this.displayValue();
				if (callback !== u) {
					callback.call(this, result);
				}
				if (this.waitingCallbacks.length > 0) while (this.waitingCallbacks.length > 0) this.waitingCallbacks.pop().call(this, result);
				return;
			}

			//If the value is empty or has no formula, and doesn't have a starting and ending handler, then don't process it
			if (this.cellType === null && this.defer === null && this.formula.length < 1) {
				if (
					this.value !== undefined
					&& (
						(this.value + '').length < 1
						|| !this.hasOperator.test(this.value)
					)
				)
				{
					if (this.td !== null) {
						this.td.innerHTML = this.encode(this.value);
					}
					this.value = new String(this.value);
					this.value.cell = this;
					this.needsUpdated = false;
					this.updateDependencies();

					if (callback !== u) {
						callback.call(this, this.value);
					}
					if (this.waitingCallbacks.length > 0) while (this.waitingCallbacks.length > 0) this.waitingCallbacks.pop().call(this, this.value);
					return;
				}
			}

			var operatorFn,
				cell = this,
				cache,
				value = this.value,
				formula = this.formula,
				cellType = this.cellType,
				cellTypeHandler,
				defer = this.defer,
				callbackValue,
				resolveFormula = function (parsedFormula) {
					cell.parsedFormula = parsedFormula;
					cell.resolveFormula(parsedFormula, function (value) {
						if (value !== u && value !== null) {
							if (value.cell !== u && value.cell !== cell) {
								value = value.valueOf();
							}

							Sheet.calcStack--;

							if (
								cellType !== null
								&& (cellTypeHandler = Sheet.CellTypeHandlers[cellType]) !== u
							) {
								value = cellTypeHandler(cell, value);
							}

							doneFn.call(cell, value);
						} else {
							doneFn.call(cell, null);
						}
					});
				},
				doneFn = function(value) {
					//setup cell trace from value
					if (
						value === u
						|| value === null
					) {
						value = new String();
					}

					if (value.cell === u) {
						switch (typeof(value)) {
							case 'object':
								break;
							case 'undefined':
								value = new String();
								break;
							case 'number':
								value = new Number(value);
								break;
							case 'boolean':
								value = new Boolean(value);
								break;
							case 'string':
							default:
								value = new String(value);
								break;
						}
						value.cell = cell;
					}
					cell.value = value;
					cache = cell.displayValue().valueOf();

					cell.state.shift();

					if (cell.loader !== null) {
						cell.loader
							.setCellAttributes(cell.loadedFrom, {
								'cache': (typeof cache !== 'object' ? cache : null),
								'formula': cell.formula,
								'parsedFormula': cell.parsedFormula,
								'value': cell.value + '',
								'cellType': cell.cellType,
								'uneditable': cell.uneditable
							})
							.setDependencies(cell);
					}

					cell.needsUpdated = false;

					callbackValue = cell.valueOverride !== null ? cell.valueOverride : cell.value;
					if (callback !== u) {
						callback.call(cell, callbackValue);
					}
					if (cell.waitingCallbacks.length > 0) while (cell.waitingCallbacks.length > 0) cell.waitingCallbacks.pop().call(cell, callbackValue);

					cell.updateDependencies();
				};

			if (this.state.length > 0) {
				if (callback !== u) {
					this.waitingCallbacks.push(callback);
				}
				return;
			}

			//TODO: Detect reciprocal dependency
			//detect state, if any
			/*switch (this.state[0]) {
				case 'updating':
					value = new String();
					value.cell = this;
					value.html = '#VAL!';
					if (callback !== u) {
						callback.call(this, value);
					}
					return;
				case 'updatingDependencies':
					if (callback !== u) {
						callback.call(this, this.valueOverride != u ? this.valueOverride : this.value);
					}
					return;
			}*/

			//merging creates a defer property, which points the cell to another location to get the other value
			if (defer !== null) {
				defer.updateValue(function(value) {
					value = value.valueOf();
	
					switch (typeof(value)) {
						case 'object':
							break;
						case 'undefined':
							value = new String();
							break;
						case 'number':
							value = new Number(value);
							break;
						case 'boolean':
							value = new Boolean(value);
							break;
						case 'string':
						default:
							value = new String(value);
							break;
					}
					value.cell = cell;
					cell.value = value;
					cell.updateDependencies();
					cell.needsUpdated = false;
					cell.displayValue();
					if (callback !== u) {
						callback.call(cell, value);
					}
					if (cell.waitingCallbacks.length > 0) while (cell.waitingCallbacks.length > 0) cell.waitingCallbacks.pop().call(cell, value);
				});
				return;
			}

			//we detect the last value, so that we don't have to update all cell, thus saving resources
			//reset values
			this.oldValue = value;
			this.state.unshift('updating');
			this.fnCount = 0;
			this.valueOverride = null;

			//increment times this cell has been calculated
			this.calcCount++;
			if (formula.length > 0) {
				if (formula.charAt(0) === '=') {
					cell.formula = formula = formula.substring(1);
				}

				//visual feedback
				if (cell.td !== null) {
					while(cell.td.lastChild !== null) {
						cell.td.removeChild(cell.td.lastChild);
					}
					cell.td.appendChild(document.createTextNode(Cell.cellLoading));
				}

				Sheet.calcStack++;

				if (this.parsedFormula !== null) {
					resolveFormula(this.parsedFormula);
				} else {
					this.jS.parseFormula(formula, resolveFormula);
				}

			} else if (
				value !== u
				&& value !== null
				&& cellType !== null
				&& (cellTypeHandler = Sheet.CellTypeHandlers[cellType]) !== u
			) {
				value = cellTypeHandler(cell, value);
				doneFn(value);
			} else {
				switch (typeof value.valueOf()) {
					case 'string':
						operatorFn = cell.startOperators[value.charAt(0)];
						if (operatorFn !== u) {
							cell.valueOverride = operatorFn.call(cell, value);
						} else {
							operatorFn = cell.endOperators[value.charAt(value.length - 1)];
							if (operatorFn !== u) {
								cell.valueOverride = operatorFn.call(cell, value);
							}
						}
						break;
					case 'undefined':
						value = '';
						break;
				}
				doneFn(value);
			}
		},

		/**
		 * Ignites calculation with dependent cells is recursively called if cell uses value from another cell, also adds dependent cells to the dependencies attribute of cell
		 */
		updateDependencies:function () {
			var dependencies,
				dependantCell,
				i;

			//just in case it was never set
			dependencies = this.dependencies;

			//reset
			this.dependencies = [];

			//length of original
			i = dependencies.length - 1;

			//iterate through them backwards
			if (i > -1) {
				this.state.unshift('updatingDependencies');
				do {
					dependantCell = dependencies[i];
					dependantCell.updateValue();
				} while (i-- > 0);
				this.state.shift();
			}

			//if no calculation was performed, then the dependencies have not changed
			if (this.dependencies.length === 0) {
				this.dependencies = dependencies;
			}
		},

		/**
		 * Filters cell's value so correct entity is displayed, use apply on cell object
		 * @returns {String}
		 */
		displayValue:function () {
			var value = this.value,
				td = this.td,
				valType = typeof value,
				html = value.html,
				text;

			if (html === u) {
				if (
					valType === 'string'
					|| (
					value !== null
					&& valType === 'object'
					&& value.toUpperCase !== u
					)
					&& value.length > 0
				) {
					html = this.encode(value);
				} else {
					html = value;
				}
			}

			//if the td is from a loader, and the td has not yet been created, just return it's values
			if (td === u || td === null) {
				return html;
			}

			switch (typeof html) {
				case 'object':
					if (html === null) {
						while(td.lastChild !== null) {
							td.removeChild(td.lastChild);
						}
					} else if (html.appendChild !== u) {

						//if html already belongs to another element, just return nothing for it's cache, formula function is probably managing it
						if (html.parentNode === null) {
							//otherwise, append it to this td
							while(td.lastChild !== null) {
								td.removeChild(td.lastChild);
							}
							td.appendChild(html);
						}

						return '';
					}
				case 'string':
				default:
					while(td.lastChild !== null) {
						td.removeChild(td.lastChild);
					}
					td.appendChild(document.createTextNode(html));
			}

			return td.innerHTML;
		},

		resolveFormula: function(parsedFormula, callback) {
			//if error, return it
			if (typeof parsedFormula === 'string') {
				callback(parsedFormula);
			}

			var cell = this,
				steps = [],
				i = 0,
				max = parsedFormula.length,
				parsed,
				handler = this.cellHandler,
				resolved = [],
				addCell = function(cell, args) {
					var boundArgs = [],
						arg,
						j = args.length - 1;

					if (j < 0) return;
					do {
						arg = args[j];
						switch (typeof arg) {
							case 'number':
								boundArgs[j] = resolved[arg];
								break;
							case 'string':
								boundArgs[j] = arg;
								break;
							case 'object':
								if (arg instanceof Array) {
									boundArgs[j] = argBinder(arg);
									break;
								}
							default:
								boundArgs[j] = arg;
						}
					} while(j-- > 0);

					boundArgs.unshift(cell);

					return boundArgs;
				},
				argBinder = function(args) {
					var boundArgs = [],
						j = args.length - 1,
						arg;

					if (j < 0) return;
					do {
						arg = args[j];
						switch (typeof arg) {
							case 'number':
								boundArgs[j] = resolved[arg];
								break;
							case 'string':
								boundArgs[j] = arg;
								break;
							case 'object':
								if (arg.hasOwnProperty('args')) {
									boundArgs[j] = arg;
									boundArgs[j].a = argBinder(arg.a);
									break;
								}
								else if (arg instanceof Array) {
									boundArgs[j] = argBinder(arg);
									break;
								}
							default:
								boundArgs[j] = arg;
						}
					} while (j-- > 0);

					return boundArgs;
				},
				doneFn;

			if (cell.jS.s.useStack) {
				doneFn = function(value) {
					var j = Cell.thawIndex,
						thaws = Cell.thaws,
						_thaw,
						isThawAbsent = (typeof thaws[j] === 'undefined');

					if (isThawAbsent) {
						_thaw = Cell.thaws[j] = new Thaw([]);
					} else {
						_thaw = thaws[j];
					}

					Cell.thawIndex++;
					if (Cell.thawIndex > Cell.thawLimit) {
						Cell.thawIndex = 0;
					}

					_thaw.add(function() {
						if (steps.length > 0) {
							steps.shift()();
						} else {
							callback(cell.value = (value !== u ? value : null));
						}
					});
				};
			} else {
				doneFn = function(value) {
					if (steps.length > 0) {
						steps.shift()();
					} else {
						callback(cell.value = (value !== u ? value : null));
					}
				}
			}

			for (; i < max; i++) {
				parsed = parsedFormula[i];
				switch (parsed.t) {
					//method
					case 'm':
						(function(parsed, i) {
							steps.push(function() {
								doneFn(resolved[i] = handler[parsed.m].apply(handler, addCell(cell, parsed.a)));
							});
						})(parsed, i);
						break;

					//lookup
					case 'l':
						(function(parsed, i) {
							steps.push(function() {
								//setup callback
								var lookupArgs = addCell(cell, parsed.a);

								lookupArgs.push(function (value) {
									doneFn(resolved[i] = value);
								});

								handler[parsed.m].apply(handler, lookupArgs);
							});
						})(parsed, i);
						break;
					//value
					case 'v':
						(function(parsed, i) {
							steps.push(function() {
								doneFn(resolved[i] = parsed.v);
							});
						})(parsed, i);
						break;

					case 'cell':
						(function(parsed, i) {
							steps.push(function() {
								resolved[i] = parsed;
								doneFn();
							});
						})(parsed, i);

						break;
					case u:
						resolved[i] = parsed;
						break;
					default:
						resolved[i] = null;
						throw new Error('Not implemented:' + parsed.t);
						break;
				}
			}

			doneFn();
		},

		recurseDependencies: function (fn, depth) {

			if (depth > Cell.maxRecursion) {
				this.recurseDependenciesFlat(fn);
				return this;
			}

			var i = 0,
				dependencies = this.dependencies,
				dependency,
				max = dependencies.length;

			if (depth === undefined) {
				depth = 0;
			}

			for(;i < max; i++) {
				dependency = dependencies[i];
				fn.call(dependency);
				dependency.recurseDependencies(fn, depth);
			}

			return this;
		},

		//http://jsfiddle.net/robertleeplummerjr/yzswj5tq/
		//http://jsperf.com/recursionless-vs-recursion
		recurseDependenciesFlat: function (fn) {
			var dependencies = this.dependencies,
				i = dependencies.length - 1,
				dependency,
				childDependencies,
				remaining = [];

			if (i < 0) return;

			do {
				remaining.push(dependencies[i]);
			} while (i-- > 0);

			do {
				dependency = remaining[remaining.length - 1];
				remaining.length--;
				fn.call(dependency);

				childDependencies = dependency.dependencies;
				i = childDependencies.length - 1;
				if (i > -1) {
					do {
						remaining.push(childDependencies[i]);
					} while(i-- > 0);
				}

			} while (remaining.length > 0);
		},

		/**
		 * A flat list of all dependencies
		 * @returns {Array}
		 */
		getAllDependencies: function() {
			var flatDependencyTree = [];

			this.recurseDependencies(function () {
				flatDependencyTree.push(this);
			});

			return flatDependencyTree;
		},

		/**
		 * @param {Boolean} [parentNeedsUpdated] default true
		 */
		setNeedsUpdated: function(parentNeedsUpdated) {
			if (parentNeedsUpdated !== u) {
				this.needsUpdated = parentNeedsUpdated;
			} else {
				this.needsUpdated = true;
			}

			this.recurseDependencies(function() {
				this.needsUpdated = true;
			});
		},

		encode: function (val) {

			switch (typeof val) {
				case 'object':
					//check if it is a date
					if (val.getMonth !== u) {
						return globalize.format(val, 'd');
					}

					return val;
			}

			if (!val) {
				return val || '';
			}
			if (!val.replace) {
				return val || '';
			}

			return val
				.replace(/&/gi, '&amp;')
				.replace(/>/gi, '&gt;')
				.replace(/</gi, '&lt;')
				//.replace(/\n/g, '\n<br>')  breaks are only supported from formulas
				.replace(/\t/g, '&nbsp;&nbsp;&nbsp ')
				.replace(/  /g, '&nbsp; ');
		},
		setAttribute: function (attribute, value) {
			var td = this.td;

			if (td !== u) {
				td[attribute] = value;
			}

			this.loader.setCellAttribute(this.loadedFrom, attribute, value);

			return this;
		},
		setAttributes: function(attributes) {
			var td = this.td,
				i;

			if (td !== u) {
				for (i in attributes) if (attributes.hasOwnProperty(i)) {
					td[attributes] = attributes[i];
				}
			}

			this.loader.setCellAttributes(this.loadedFrom, attributes);

			return this;
		},
		addClass: function(_class) {
			var td = this.td,
				classes,
				index,
				loadedFrom = this.loadedFrom;

			if (td !== u) {
				if (td.classList) {
					td.classList.add(_class);
				} else {
					td.className += ' ' + _class;
				}
			}

			if (loadedFrom !== u) {
				classes = (this.loader.getCellAttribute(loadedFrom, 'class') || '');
				index = classes.split(' ').indexOf(_class);
				if (index < 0) {
					classes += ' ' + _class;
					this.loader.setCellAttribute(loadedFrom, 'class', classes);
				}
			}

			return this;
		},
		removeClass: function(_class) {
			var td = this.td,
				classes,
				index,
				loadedFrom = this.loadedFrom;

			if (td !== u) {
				if (td.classList) {
					td.classList.remove(_class);
				} else {
					classes = (td.className + '').split(' ');
					index = classes.indexOf(_class);
					if (index > -1) {
						classes.splice(index, 1);
						td.className = classes.join(' ');
					}
				}
			}

			if (loadedFrom !== u) {
				classes = (this.loader.getCellAttribute(loadedFrom, 'class') || '').split(' ');
				index = classes.indexOf(_class);
				if (index > -1) {
					classes.splice(index, 1);
					this.loader.setCellAttribute(loadedFrom, 'class', classes.join(' '));
				}
			}

			return this;
		},
		hasOperator: /(^[$£])|([%]$)/,

		startOperators: {
			'$':function(val, ch) {
				return this.cellHandler.fn.DOLLAR.call(this, val.substring(1).replace(Globalize.culture().numberFormat[','], ''), 2, ch || '$');
			},
			'£':function(val) {
				return this.startOperators['$'].call(this, val, '£');
			}
		},

		endOperators: {
			'%': function(value) {
				return value.substring(0, this.value.length - 1) / 100;
			}
		},

		type: Cell,
		typeName: 'Sheet.Cell'
	};


	Cell.thaws = [];
	Cell.thawLimit = 500;
	Cell.thawIndex = 0;

	Cell.cellLoading = null;
	Cell.maxRecursion = 10;

	return Cell;
})();Sheet.CellHandler = (function(Math) {
	function isNum(num) {
		return !isNaN(num);
	}

	var u = undefined,
		nAN = NaN;

	function CellHandler(jS, fn) {
		this.jS = jS;
		this.fn = fn;
	}

	CellHandler.prototype = {
		/**
		 * Variable handler for formulaParser, arguments are the variable split by '.'.  Expose variables by using jQuery.sheet setting formulaVariables
		 * @param {Sheet.Cell} parentCell
		 * @param {*} variable
		 * @returns {*}
		 */
		variable:function (parentCell, variable) {
			if (arguments.length) {
				var name = variable[0],
					attr = variable[1],
					formulaVariables = this.jS.s.formulaVariables,
					formulaVariable,
					result;

				switch (name.toLowerCase()) {
					case 'true':
						result = new Boolean(true);
						result.html = 'TRUE';
						result.cell = parentCell;
						return result;
					case 'false':
						result = new Boolean(false);
						result.html = 'FALSE';
						result.cell = parentCell;
						return result;
				}

				if (formulaVariable = formulaVariables[name] && !attr) {
					return formulaVariable;
				} else if (formulaVariable && attr) {
					return formulaVariable[attr];
				} else {
					return '';
				}
			}
		},

		/**
		 * time to fraction of day 1 / 0-24
		 * @param {Sheet.Cell} parentCell
		 * @param {String} time
		 * @param {Boolean} isAmPm
		 * @returns {*}
		 */
		time:function (parentCell, time, isAmPm) {
			return times.fromString(time, isAmPm);
		},

		/**
		 * get a number from variable
		 * @param {Sheet.Cell} parentCell
		 * @param {*} num
		 * @returns {Number}
		 */
		number:function (parentCell, num) {
			if (isNaN(num) || num === null) {
				num = 0;
			}

			switch (typeof num) {
				case 'number':
					return num;
				case 'string':
					if (isNum(num)) {
						return num * 1;
					}
				case 'object':
					if (num.getMonth) {
						return dates.toCentury(num);
					}
			}
			return num;
		},

		/**
		 * get a number from variable
		 * @param {Sheet.Cell} parentCell
		 * @param {*} _num
		 * @returns {Number}
		 */
		invertNumber: function(parentCell, _num) {
			if (isNaN(_num)) {
				_num = 0;
			}

			var num = this.number(parentCell, _num),
				inverted = new Number(num.valueOf() * -1);
			if (num.html) {
				inverted.html = num.html;
			}

			return inverted;
		},

		/**
		 * Perform math internally for parser
		 * @param {Sheet.Cell} parentCell
		 * @param {String} mathType
		 * @param {*} num1
		 * @param {*} num2
		 * @returns {*}
		 */
		performMath: function (parentCell, mathType, num1, num2) {
			if (
				num1 === u
				|| num1 === null
			) {
				num1 = 0;
			}

			if (
				num2 === u
				|| num2 === null
			) {
				num2 = 0;
			}

			var type1,
				type2,
				type1IsNumber = true,
				type2IsNumber = true,
				errors = [],
				value,
				output = function(val) {return val;};

			if (num1.hasOwnProperty('cell')) {
				num1.cell.addDependency(parentCell);
			}
			if (num2.hasOwnProperty('cell')) {
				num2.cell.addDependency(parentCell);
			}

			switch (type1 = (typeof num1.valueOf())) {
				case 'number':break;
				case 'string':
					if (isNum(num1)) {
						num1 *= 1;
					} else {
						type1IsNumber = false;
					}
					break;
				case 'object':
					if (num1.getMonth) {
						num1 = dates.toCentury(num1);
						output = dates.get;
					} else {
						type1IsNumber = false;
					}
					break;
				default:
					type1IsNumber = false;
			}

			switch (type2 = (typeof num2.valueOf())) {
				case 'number':break;
				case 'string':
					if (isNum(num2)) {
						num2 *= 1;
					} else {
						type2IsNumber = false;
					}
					break;
				case 'object':
					if (num2.getMonth) {
						num2 = dates.toCentury(num2);
					} else {
						type2IsNumber = false;
					}
					break;
				default:
					type2IsNumber = false;
			}

			if (!type1IsNumber && mathType !== '+') {
				errors.push('not a number: ' + num1);
				num1 = 0;
			}

			if (!type2IsNumber) {
				errors.push('not a number: ' + num2);
				num2 = 0;
			}

			if (errors.length) {
				//throw new Error(errors.join(';') + ';');
			}

			switch (mathType) {
				case '+':
					value = num1 + num2;
					break;
				case '-':
					value = num1 - num2;
					break;
				case '/':
					value = num1 / num2;
					if (value == Infinity || value == nAN) {
						value = 0;
					}
					break;
				case '*':
					value = num1 * num2;
					break;
				case '^':
					value = Math.pow(num1, num2);
					break;
			}

			return output(value);
		},

		not: function(parentCell, value1, value2) {
			var result;

			if (value1.valueOf() != value2.valueOf()) {
				result = new Boolean(true);
				result.html = 'TRUE';
				result.cell = parentCell;
			} else {
				result = new Boolean(false);
				result.html = 'FALSE';
				result.cell = parentCell;
			}

			return result;
		},

		concatenate: function(parentCell, value1, value2) {
			if (value1 === null) value1 = '';
			if (value2 === null) value2 = '';

			return value1.toString() + value2.toString();
		},

		/**
		 * Get cell value
		 * @param {Sheet.Cell} parentCell
		 * @param {Object} cellRef
		 * @param {Function} [callback]
		 * @returns {Sheet.CellHandler}
		 */
		cellValue:function (parentCell, cellRef, callback) {
			var jS = this.jS,
				loc = this.parseLocation(cellRef.c, cellRef.r),
				cell;

			cell = jS.getCell(parentCell.sheetIndex, loc.row, loc.col);
			if (cell !== null) {
				cell.addDependency(parentCell);
				cell.updateValue(callback);
			} else if (callback !== u) {
				callback.call(parentCell, 0);
			}

			return this;
		},


		/**
		 * Get cell values as an array
		 * @param {Sheet.Cell} parentCell
		 * @param {Object} start
		 * @param {Object} end
		 * @param {Function} [callback]
		 * @returns {Sheet.CellHandler}
		 */
		cellRangeValue:function (parentCell, start, end, callback) {
			return this.remoteCellRangeValue(parentCell, parentCell.sheetIndex, start, end, callback);
		},


		/**
		 * Get cell value from a different sheet within an instance
		 * @param {Sheet.Cell} parentCell
		 * @param {String} sheet example "SHEET1"
		 * @param {Object} cellRef
		 * @param {Function} [callback]
		 * @returns {Sheet.CellHandler}
		 */
		remoteCellValue:function (parentCell, sheet, cellRef, callback) {
			var jS = this.jS,
				loc = this.parseLocation(cellRef.c, cellRef.r),
				sheetIndex = this.parseSheetLocation(sheet),
				cell;

			if (sheetIndex < 0) {
				sheetIndex = jS.getSpreadsheetIndexByTitle(sheet);
			}

			cell = jS.getCell(sheetIndex, loc.row, loc.col);
			if (cell !== null) {
				cell.addDependency(parentCell);
				cell.updateValue(callback);
			} else if (callback !== u) {
				callback.call(parentCell, 0);
			}

			return this;
		},

		/**
		 * Get cell values as an array from a different sheet within an instance
		 * @param {Sheet.Cell} parentCell
		 * @param {String} sheetTitle example "SHEET1"
		 * @param {Object} start
		 * @param {Object} end
		 * @param {Function} [callback]
		 * @returns {Array}
		 */
		remoteCellRangeValue:function (parentCell, sheetTitle, start, end, callback) {
			var sheetIndex = (typeof sheetTitle === 'string' ? this.parseSheetLocation(sheetTitle) : sheetTitle),
				_start = this.parseLocation(start.c, start.r),
				_end = this.parseLocation(end.c, end.r),
				rowIndex = (_start.row < _end.row ? _start.row : _end.row),
				rowIndexEnd = (_start.row < _end.row ? _end.row : _start.row),
				colIndexStart = (_start.col < _end.col ? _start.col : _end.col),
				colIndex = colIndexStart,
				colIndexEnd = (_start.col < _end.col ? _end.col : _start.col),
				totalNeedResolved = (colIndexEnd - (colIndexStart - 1)) * (rowIndexEnd - (rowIndex - 1)),
				currentlyResolve = 0,
				jS = this.jS,
				result = [],
				cachedRange,
				useCache,
				cell,
				row,
				key,
				i = 0,
				max,
				sheet;

			if (sheetIndex < 0) {
				sheetIndex = jS.getSpreadsheetIndexByTitle(sheetTitle);
			}

			//can't find spreadsheet here
			if (sheetIndex < 0) {
				result = new String('');
				result.html = '#NAME?';
				callback.call(parentCell, result);

				return this;
			}

			key = sheetIndex + '!' + start.c + start.r + ':' + end.c + end.r;
			cachedRange = CellHandler.cellRangeCache[key];

			if (cachedRange !== u) {
				useCache = true;
				max = cachedRange.length;
				for (i = 0; i < max; i++) {
					if (cachedRange[i].needsUpdated) {
						useCache = false
					}
				}

				if (useCache) {
					callback.call(parentCell, CellHandler.cellRangeCache[key]);
					return this;
				}
			}

			sheet = jS.spreadsheets[sheetIndex];

			if (sheet === u) {
				jS.spreadsheets[sheetIndex] = sheet = [];
			}

			result.rowCount = (rowIndexEnd - rowIndex) + 1;
			result.columnCount = (colIndexEnd - colIndex) + 1;

			for (;rowIndex <= rowIndexEnd;rowIndex++) {
				colIndex = colIndexStart;
				row = (sheet[rowIndex] !== u ? sheet[rowIndex] : null);
				for (; colIndex <= colIndexEnd;colIndex++) {
					if (row === null || (cell = row[colIndex]) === u) {
						cell = jS.getCell(sheetIndex, rowIndex, colIndex);
					} else {
						cell.sheetIndex = sheetIndex;
						cell.rowIndex = rowIndex;
						cell.columnIndex = colIndex;
					}

					if (cell !== null) {
						cell.addDependency(parentCell);
						(function(i) {
							cell.updateValue(function(value) {
								result[i] = value;
								currentlyResolve++;
								if (currentlyResolve === totalNeedResolved) {
									CellHandler.cellRangeCache[key] = result;
									callback.call(parentCell, result);
								}
							});
						})(i++);
					}
				}
			}

			if (i !== totalNeedResolved) {
				//throw new Error('Not all cells were found and added to range');
			}

			return this;
		},

		/**
		 * Calls a function either from jQuery.sheet.engine or defined in jQuery sheet setting formulaFunctions.  When calling a function the cell being called from is "this".
		 * @param {Sheet.Cell} parentCell
		 * @param {String} fn function name (Will be converted to upper case)
		 * @param {Array} [args] arguments needing to be sent to function
		 * @returns {*}
		 */
		callFunction:function (parentCell, fn, args) {
			fn = fn.toUpperCase();
			args = args || [];

			var actualFn = this.fn[fn],
				result;

			if (actualFn !== u) {
				parentCell.fnCount++;
				result = actualFn.apply(parentCell, args);
			}

			else {
				result = new String();
				result.html = "Function " + fn + " Not Found";
			}

			return result;
		},

		formulaParser: function(callStack) {
			var formulaParser;
			//we prevent parsers from overwriting each other
			if (callStack > -1) {
				//cut down on un-needed parser creation
				formulaParser = this.spareFormulaParsers[callStack];
				if (formulaParser === u) {
					formulaParser = this.spareFormulaParsers[callStack] = Formula(this);
				}
			}

			//use the sheet's parser if there aren't many calls in the callStack
			else {
				formulaParser = this.jS.formulaParser;
			}

			return formulaParser;
		},
		/**
		 * Parse a cell name to it's location
		 * @param {String} columnStr "A"
		 * @param {String|Number} rowString "1"
		 * @returns {Object} {row: 1, col: 1}
		 */
		parseLocation: function (columnStr, rowString) {
			return {
				row: rowString - 1,
				col: this.columnLabelIndex(columnStr)
			};
		},

		/**
		 * Parse a sheet name to it's index
		 * @param {String} locStr SHEET1 = 0
		 * @returns {Number}
		 */
		parseSheetLocation: function (locStr) {
			var sheetIndex = ((locStr + '').replace(/SHEET/i, '') * 1) - 1;
			return isNaN(sheetIndex) ? -1 : sheetIndex ;
		},

		/**
		 *
		 * @param {Number} col 0 = A
		 * @param {Number} row 0 = 1
		 * @returns {String}
		 */
		parseCellName: function (col, row) {
			var rowString = '';
			if (row !== undefined) {
				row++;
				rowString = row.toString();
			}
			return this.columnLabelString(col) + rowString;
		},

		/**
		 * Available labels, used for their index
		 */
		alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
		/**
		 * Available labels, used for their index
		 */
		columnLabels: {},
		/**
		 * Get index of a column label
		 * @param {String} str A to 1, B to 2, Z to 26, AA to 27
		 * @returns {Number}
		 */
		columnLabelIndex: function (str) {
			return this.columnLabels[str.toUpperCase()];
		},

		/**
		 * Available indexes, used for their labels
		 */
		columnIndexes:[],

		/**
		 * Get label of a column index
		 * @param {Number} index 1 = A, 2 = B, 26 = Z, 27 = AA
		 * @returns {String}
		 */
		columnLabelString: function (index) {
			if (!this.columnIndexes.length) { //cache the indexes to save on processing
				var s = '', i, j, k, l;
				i = j = k = -1;
				for (l = 0; l < 16385; ++l) {
					s = '';
					++k;
					if (k == 26) {
						k = 0;
						++j;
						if (j == 26) {
							j = 0;
							++i;
						}
					}
					if (i >= 0) s += this.alphabet[i];
					if (j >= 0) s += this.alphabet[j];
					if (k >= 0) s += this.alphabet[k];
					this.columnIndexes[l] = s;
					this.columnLabels[s] = l;
				}
			}
			return this.columnIndexes[index] || '';
		}
	};

	CellHandler.cellRangeCache = {};

	return CellHandler;
})(Math);Sheet.CellTypeHandlers = (function() {
	var n = isNaN,
		CellTypeHandlers = {
		percent: function (cell, value) {
			//https://stackoverflow.com/questions/2652319/how-do-you-check-that-a-number-is-nan-in-javascript/16988441#16988441
			//NaN !== NaN
			if (value !== value) return 0;
			var num = (n(value) ? Globalize.parseFloat(value) : value * 1),
				result;

			if (!n(num)) {//success
				result = new Number(num);
				result.html = Globalize.format(num, 'p');
				return result;
			}

			return value;
		},
		date: function (cell, value) {
			if (value !== value) return 0;
			var date = Globalize.parseDate(value);
			if (date === null) {
				return value;
			} else {
				cell.valueOverride = date;
				cell.html = Globalize.format(date, 'd');
				return value;
			}
		},
		time: function (cell, value) {
			if (value !== value) return 0;
			var date = Globalize.parseDate(value);
			if (date === null) {
				return value;
			} else {
				date.html = Globalize.format(date, 't');
				return date;
			}
		},
		currency: function (cell, value) {
			if (value !== value) return 0;
			var num = (n(value) ? Globalize.parseFloat(value) : value * 1),
				result;

			if (!n(num)) {//success
				result = new Number(num);
				result.html = Globalize.format(num, 'c');
				return result;
			}

			return value;
		},
		number: function (cell, value) {
			if (value !== value) return 0;
			var radix, result;

			if (!CellTypeHandlers.endOfNumber) {
				radix = Globalize.culture().numberFormat['.'];
				CellTypeHandlers.endOfNumber = new RegExp("([" + (radix == '.' ? "\." : radix) + "])([0-9]*?[1-9]+)?(0)*$");
			}

			if (!n(value)) {//success
				result = new Number(value);
				result.html = Globalize.format(value + '', "n10")
					.replace(CellTypeHandlers.endOfNumber, function (orig, radix, num) {
						return (num ? radix : '') + (num || '');
					});
				return result;
			}

			return value;
		}
	};

	return CellTypeHandlers;
})();Sheet.CellRange = (function() {
	function Constructor(cells) {
		this.cells = cells || [];
	}

	Constructor.prototype = {
		clone: function() {
			var clones = [],
				cells = this.cells,
				max = cells.length,
				cell,
				clone;

			for(var i = 0; i < max;i++) {
				cell = cells[i];

				clone = cell.clone();

				clones.push(clone);
			}

			return new Constructor(clones);
		},
		type: Constructor,
		typeName: 'Sheet.CellRange'
	};

	return Constructor;
})();
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

})(document, window, jQuery);Sheet.SpreadsheetUI = (function() {
	var stack = [];

	function Constructor(i, ui, options) {
		options = options || {};

		this.i = i;
		this.ui = ui;
		this.isLast = options.lastIndex === i;
		this.enclosure = null;
		this.pane = null;
		this.spreadsheet = null;

		this.initChildren = options.initChildren || function() {};
		this.done = options.done || function() {};
		this.load();
	}

	Constructor.prototype = {
		load: function(enclosure, pane, spreadsheet) {
			this.initChildren(this.ui, this.i);

			this.enclosure = enclosure;
			this.pane = pane;
			this.spreadsheet = spreadsheet;

			stack.push(this.i);

			if (this.isLast) {
				this.loaded();
			}
		},
		loaded: function() {
			this.done(stack, this);
		}
	};

	return Constructor;
})();Sheet.Theme = (function($) {
	function Constructor(theme) {
		theme = theme || Sheet.defaultTheme;

		switch (theme) {
			case Sheet.customTheme:
				this.cl = Constructor.customClasses;
				break;


			case Sheet.bootstrapTheme:
				this.cl = Constructor.bootstrapClasses;
				break;

			default:
			case Sheet.themeRollerTheme:
				this.cl = Constructor.themeRollerClasses;
				break;
		}

		extend(this, this.cl);
	}

	Constructor.themeRollerClasses = {
		autoFiller:'ui-state-active',
		bar:'ui-widget-header',
		barHighlight:'ui-state-active',
		barHandleFreezeLeft:'ui-state-default',
		barHandleFreezeTop:'ui-state-default',
		barMenuTop:'ui-state-default',
		tdActive:'ui-state-active',
		tdHighlighted:'ui-state-highlight',
		control:'ui-widget-header ui-corner-top',
		controlTextBox:'ui-widget-content',
		fullScreen:'ui-widget-content ui-corner-all',
		inPlaceEdit:'ui-state-highlight',
		menu:'ui-widget-header',
		menuFixed: '',
		menuUl:'ui-widget-header',
		menuLi:'ui-widget-header',
		menuHover: 'ui-state-highlight',
		pane: 'ui-widget-content',
		parent:'ui-widget-content ui-corner-all',
		table:'ui-widget-content',
		tab:'ui-widget-header',
		tabActive:'ui-state-highlight',
		barResizer:'ui-state-highlight',
		barFreezer:'ui-state-highlight',
		barFreezeIndicator:'ui-state-highlight'
	};

	Constructor.bootstrapClasses = {
		autoFiller:'btn-info',
		bar:'input-group-addon',
		barHighlight:'label-info',
		barHandleFreezeLeft:'bg-warning',
		barHandleFreezeTop:'bg-warning',
		barMenuTop:'bg-warning',
		tdActive:'active',
		tdHighlighted:'bg-info disabled',
		control:'panel-heading',
		controlTextBox:'form-control',
		fullScreen:'',
		inPlaceEdit:'form-control',
		menu:'panel panel-default',
		menuFixed: 'nav navbar-nav',
		menuUl:'panel-info',
		menuLi:'active',
		menuHover: 'bg-primary active',
		pane: 'well',
		parent:'panel panel-default',
		table:'table table-bordered table-condensed',
		tab:'btn-default btn-xs',
		tabActive:'active',
		barResizer:'bg-info',
		barFreezer:'bg-warning',
		barFreezeIndicator:'bg-warning'
	};

	Constructor.customClasses = {
		autoFiller:'',
		bar:'',
		barHighlight:'',
		barHandleFreezeLeft:'',
		barHandleFreezeTop:'',
		barMenuTop:'',
		tdActive:'',
		tdHighlighted:'',
		control:'',
		controlTextBox:'',
		fullScreen:'',
		inPlaceEdit:'',
		menu:'',
		menuFixed: '',
		menuUl:'',
		menuLi:'',
		menuHover: '',
		pane: '',
		parent:'',
		table:'',
		tab:'',
		tabActive:'',
		barResizer:'',
		barFreezer:'',
		barFreezeIndicator:''
	};

	return Constructor;
})(jQuery);//This is a fix for Jison
if (!Object.getPrototypeOf) {
	Object.getPrototypeOf = function(obj) {
		return obj || {};
	};
}

//IE8 fix
if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function(obj, start) {
		for (var i = (start || 0), j = this.length; i < j; i++) {
			if (this[i] === obj) { return i; }
		}
		return -1;
	}
}

	return Sheet;
})(jQuery, document, window, Date, String, Number, Boolean, Math, RegExp, Error);
/* parser generated by jison 0.4.15 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var parser = (function(){
var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[1,5],$V1=[1,6],$V2=[1,8],$V3=[1,9],$V4=[1,10],$V5=[1,13],$V6=[1,11],$V7=[1,12],$V8=[1,14],$V9=[1,15],$Va=[1,20],$Vb=[1,18],$Vc=[1,21],$Vd=[1,22],$Ve=[1,17],$Vf=[1,24],$Vg=[1,25],$Vh=[1,26],$Vi=[1,27],$Vj=[1,28],$Vk=[1,29],$Vl=[1,30],$Vm=[1,31],$Vn=[1,32],$Vo=[4,13,14,15,17,18,19,20,21,22,23,35,36],$Vp=[1,35],$Vq=[1,36],$Vr=[1,37],$Vs=[4,13,14,15,17,18,19,20,21,22,23,35,36,38],$Vt=[4,13,14,15,17,18,19,20,21,22,23,35,36,39],$Vu=[4,13,14,15,17,18,19,20,21,22,23,29,35,36],$Vv=[4,14,15,17,18,19,20,35,36],$Vw=[1,71],$Vx=[4,14,17,18,19,35,36],$Vy=[4,14,15,17,18,19,20,21,22,35,36],$Vz=[17,35,36];
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"expressions":3,"EOF":4,"expression":5,"variableSequence":6,"TIME_AMPM":7,"TIME_24":8,"number":9,"STRING":10,"ESCAPED_STRING":11,"LETTERS":12,"&":13,"=":14,"+":15,"(":16,")":17,"<":18,">":19,"-":20,"*":21,"/":22,"^":23,"E":24,"FUNCTION":25,"expseq":26,"cellRange":27,"cell":28,":":29,"SHEET":30,"!":31,"NUMBER":32,"$":33,"REF":34,";":35,",":36,"VARIABLE":37,"DECIMAL":38,"%":39,"$accept":0,"$end":1},
terminals_: {2:"error",4:"EOF",7:"TIME_AMPM",8:"TIME_24",10:"STRING",11:"ESCAPED_STRING",12:"LETTERS",13:"&",14:"=",15:"+",16:"(",17:")",18:"<",19:">",20:"-",21:"*",22:"/",23:"^",24:"E",25:"FUNCTION",29:":",30:"SHEET",31:"!",32:"NUMBER",33:"$",34:"REF",35:";",36:",",37:"VARIABLE",38:"DECIMAL",39:"%"},
productions_: [0,[3,1],[3,2],[5,1],[5,1],[5,1],[5,1],[5,1],[5,1],[5,1],[5,3],[5,3],[5,3],[5,3],[5,4],[5,4],[5,4],[5,3],[5,3],[5,3],[5,3],[5,3],[5,3],[5,2],[5,2],[5,1],[5,3],[5,4],[5,1],[27,1],[27,3],[27,3],[27,5],[28,2],[28,3],[28,3],[28,4],[28,1],[28,2],[28,2],[28,2],[28,3],[28,3],[28,3],[28,3],[28,3],[28,3],[28,4],[28,4],[28,4],[26,1],[26,2],[26,2],[26,3],[26,3],[6,1],[6,3],[9,1],[9,3],[9,2]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:

        return null;
    
break;
case 2:

    	var types = yy.types;
    	yy.types = [];
        return types;
    
break;
case 3:

        //js

			var type = {
		    	t: 'm',
		    	m: 'variable',
		    	a: [$$[$0]]
		    };
		    this.$ = yy.types.length;
		    yy.types.push(type);

        /*php
            this.$ = $this->variable($$[$0]);
        */
    
break;
case 4:

	    //js

            var type = {
            	t: 'm',
                m: 'time',
            	a: [$$[$0], true]
            };
            this.$ = yy.types.length;
            yy.types.push(type);
        //
    
break;
case 5:

        //js
            
            var type = {
            	t: 'm',
                m: 'time',
            	a: [$$[$0]]
            };
            this.$ = yy.types.length;
            yy.types.push(type);
        //

    
break;
case 6:

	    //js
	        
            var type = {
            	t: 'm',
            	m: 'number',
            	a: [$$[$0]]
            };
            this.$ = yy.types.length;
			yy.types.push(type);

        /*php
            this.$ = $$[$0] * 1;
        */
    
break;
case 7:

        //js
            
            var type = {
            	t: 'v',
            	v: yy.escape($$[$0].substring(1, $$[$0].length - 1))
            };
            this.$ = yy.types.length;
            yy.types.push(type);

        /*php
	        this.$ = substr($$[$0], 1, -1);
        */
    
break;
case 8:

        //js

            var type = {
            	t: 'v',
            	v: yy.escape($$[$0].substring(2, $$[$0].length - 2))
            };
            this.$ = yy.types.length;
            yy.types.push(type);

        /*php
            this.$ = substr($$[$0], 2, -2);
        */
    
break;
case 9:

        var type = {
        	t: 'v',
        	v: $$[$0]
        };
        yy.types.push(type);
    
break;
case 10:

        //js
            
            var type = {
            	t: 'm',
            	m: 'concatenate',
            	a: [$$[$0-2], $$[$0]]
            };
            this.$ = yy.types.length;
            yy.types.push(type);

        /*php
            this.$ = $$[$0-2] . '' . $$[$0];
        */
    
break;
case 11:

	    //js
	        
            var type = {
            	t: 'm',
            	m: 'callFunction',
            	a: ['EQUAL', [$$[$0-2], $$[$0]]]
            };
            this.$ = yy.types.length;
            yy.types.push(type);

        /*php
            this.$ = $$[$0-2] == $$[$0];
        */
    
break;
case 12:

	    //js

			var type = {
				t: 'm',
				m: 'performMath',
				a: ['+', $$[$0-2], $$[$0]]
			};
			this.$ = yy.types.length;
			yy.types.push(type);

        /*php
			if (is_numeric($$[$0-2]) && is_numeric($$[$0])) {
			   this.$ = $$[$0-2] + $$[$0];
			} else {
			   this.$ = $$[$0-2] . $$[$0];
			}
        */
    
break;
case 13:

	    //js
	        
	        this.$ = $$[$0-1];
        //
	
break;
case 14:

        //js
            
            var type = {
            	t: 'm',
            	m: 'callFunction',
            	a: ['LESS_EQUAL', [$$[$0-3], $$[$0]]]
            };
            this.$ = yy.types.length;
            yy.types.push(type);

        /*php
            this.$ = ($$[$0-3] * 1) <= ($$[$0] * 1);
        */
    
break;
case 15:

        //js
            
            var type = {
            	t: 'm',
            	m: 'callFunction',
            	a: ['GREATER_EQUAL', [$$[$0-3], $$[$0]]]
            };
            this.$ = yy.types.length;
            yy.types.push(type);

        /*php
            this.$ = ($$[$0-3] * 1) >= ($$[$0] * 1);
        */
    
break;
case 16:

		//js

			var type = {
				t: 'm',
				m: 'not',
				a: [$$[$0-3], $$[$0]]
			};
			this.$ = yy.types.length;
			yy.types.push(type);

		/*php
        	this.$ = ($$[$0-3]) != ($$[$0]);
		*/
    
break;
case 17:

	    //js
	        
			var type = {
				t: 'm',
				m: 'callFunction',
				a: ['GREATER', [$$[$0-2], $$[$0]]]
			};
			this.$ = yy.types.length;
			yy.types.push(type);

		/*php
		    this.$ = ($$[$0-2] * 1) > ($$[$0] * 1);
        */
    
break;
case 18:

        //js
            
            var type = {
            	t: 'm',
            	m: 'callFunction',
            	a: ['LESS', [$$[$0-2], $$[$0]]]
            };
            this.$ = yy.types.length;
            yy.types.push(type);

        /*php
            this.$ = ($$[$0-2] * 1) < ($$[$0] * 1);
        */
    
break;
case 19:

        //js
            
            var type = {
            	t: 'm',
            	m: 'performMath',
            	a: ['-', $$[$0-2], $$[$0]]
			};
			this.$ = yy.types.length;
			yy.types.push(type);

        /*php
            this.$ = ($$[$0-2] * 1) - ($$[$0] * 1);
        */
    
break;
case 20:

	    //js
	        
            var type = {
            	t: 'm',
            	m: 'performMath',
            	a: ['*', $$[$0-2], $$[$0]]
            };
            this.$ = yy.types.length;
            yy.types.push(type);

        /*php
            this.$ = ($$[$0-2] * 1) * ($$[$0] * 1);
        */
    
break;
case 21:

	    //js
	        
            var type = {
            	t: 'm',
            	m: 'performMath',
            	a: ['/', $$[$0-2], $$[$0]]
            };
            this.$ = yy.types.length;
            yy.types.push(type);

        /*php
            this.$ = ($$[$0-2] * 1) / ($$[$0] * 1);
        */
    
break;
case 22:

        //js

            var type = {
            	t: 'm',
            	m: 'performMath',
            	a: ['^', $$[$0-2], $$[$0]]
            };
            this.$ = yy.types.length;
            yy.types.push(type);

        /*php
            this.$ = pow(($$[$0-2] * 1), ($$[$0] * 1));
        */
    
break;
case 23:

		//js

			var type = {
				t: 'm',
				m: 'invertNumber',
				a: [$$[$0]]
			};
			this.$ = yy.types.length;
			yy.types.push(type);

        /*php
            this.$ = $$[$0-1] * 1;
        */
	
break;
case 24:

	    //js

	        var type = {
	        	t: 'm',
				m: 'number',
				a: [$$[$0]]
	        };
	        this.$ = yy.types.length;
	        yy.types.push(type);

        /*php
            this.$ = $$[$0-1] * 1;
        */
	
break;
case 25:
/*this.$ = Math.E;*/;
break;
case 26:

	    //js
	        
			var type = {
				t: 'm',
				m: 'callFunction',
				a: [$$[$0-2]]
			};
			this.$ = yy.types.length;
			yy.types.push(type);

		/*php
		    this.$ = $this->callFunction($$[$0-2]);
        */
    
break;
case 27:

	    //js
	        
			var type = {
				t: 'm',
				m: 'callFunction',
				a: [$$[$0-3], $$[$0-1]]
			};
			this.$ = yy.types.length;
			yy.types.push(type);

        /*php
            this.$ = $this->callFunction($$[$0-3], $$[$0-1]);
        */
    
break;
case 29:

	    //js
	        
			var type = {
				t: 'l',
				m: 'cellValue',
				a: [$$[$0]]
			};
			this.$ = yy.types.length;
			yy.types.push(type);

        /*php
            this.$ = $this->cellValue($$[$0]);
        */
    
break;
case 30:

	    //js

			var type = {
				t: 'l',
				m: 'cellRangeValue',
				a: [$$[$0-2], $$[$0]]
			};
			this.$ = yy.types.length;
			yy.types.push(type);

        /*php
            this.$ = $this->cellRangeValue($$[$0-2], $$[$0]);
        */
    
break;
case 31:

	    //js
			var type = {
				t: 'l',
				m: 'remoteCellValue',
				a: [$$[$0-2], $$[$0]]
			};
			this.$ = yy.types.length;
			yy.types.push(type);

        /*php
            this.$ = $this->remoteCellValue($$[$0-2], $$[$0]);
        */
    
break;
case 32:

	    //js
            var type = {
            	t: 'l',
            	m: 'remoteCellRangeValue',
            	a: [$$[$0-4], $$[$0-2], $$[$0]]
            };
            this.$ = yy.types.length;
            yy.types.push(type);

        /*php
            this.$ = $this->remoteCellRangeValue($$[$0-4], $$[$0-2], $$[$0]);
        */
    
break;
case 33:

		//js
			var type = {
				t: 'cell',
				c: $$[$0-1],
				r: $$[$0]
			};
			this.$ = yy.types.length;
			yy.types.push(type);
	
break;
case 34:

		//js
            var type = {
            	t: 'cell',
                c: $$[$0-1],
                r: $$[$0]
            };
            this.$ = yy.types.length;
            yy.types.push(type);
	
break;
case 35: case 36:

        //js
            var type = {
            	t: 'cell',
                c: $$[$0-2],
                r: $$[$0]
            };
            this.$ = yy.types.length;
            yy.types.push(type);
    
break;
case 37: case 38: case 39: case 40: case 41: case 42: case 43: case 44: case 45: case 46: case 47: case 48: case 49:
return '#REF!';
break;
case 50:

	    //js
            this.$ = [$$[$0]];

        /*php
            this.$ = array($$[$0]);
        */
    
break;
case 53:

	    //js
	        $$[$0-2].push($$[$0]);
	        this.$ = $$[$0-2];

        /*php
            $$[$0-2][] = $$[$0];
            this.$ = $$[$0-2];
        */
    
break;
case 54:

 	    //js
	        $$[$0-2].push($$[$0]);
	        this.$ = $$[$0-2];

        /*php
			$$[$0-2][] = $$[$0];
			this.$ = $$[$0-2];
        */
    
break;
case 55:

        this.$ = [$$[$0]];
    
break;
case 56:

        //js
            this.$ = ($$[$0-2] instanceof Array ? $$[$0-2] : [$$[$0-2]]);
            this.$.push($$[$0]);

        /*php
            this.$ = (is_array($$[$0-2]) ? $$[$0-2] : array());
            this.$[] = $$[$0];
        */
    
break;
case 57:

        this.$ = $$[$0];
    
break;
case 58:

        //js
            this.$ = $$[$0-2] + '.' + $$[$0];

        /*php
            this.$ = $$[$0-2] . '.' . $$[$0];
        */
    
break;
case 59:

		//js
        	this.$ = ($$[$0-1] * 0.01) + '';

        /*php
        	this.$ = ($$[$0-1] * 0.01) . '';
        */
    
break;
}
},
table: [{3:1,4:[1,2],5:3,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},{1:[3]},{1:[2,1]},{4:[1,23],13:$Vf,14:$Vg,15:$Vh,18:$Vi,19:$Vj,20:$Vk,21:$Vl,22:$Vm,23:$Vn},o($Vo,[2,3],{38:[1,33]}),o($Vo,[2,4]),o($Vo,[2,5]),o($Vo,[2,6],{39:[1,34]}),o($Vo,[2,7]),o($Vo,[2,8]),o($Vo,[2,9],{32:$Vp,33:$Vq,34:$Vr}),{5:38,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},{5:39,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},{5:40,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},o($Vo,[2,25]),{16:[1,41]},o($Vo,[2,28]),o($Vs,[2,55]),o($Vt,[2,57],{38:[1,42]}),o($Vo,[2,29],{29:[1,43]}),{31:[1,44]},{12:[1,45],34:[1,46]},o($Vu,[2,37],{32:[1,47],33:[1,49],34:[1,48]}),{1:[2,2]},{5:50,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},{5:51,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},{5:52,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},{5:55,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,14:[1,53],15:$V5,16:$V6,19:[1,54],20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},{5:57,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,14:[1,56],15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},{5:58,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},{5:59,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},{5:60,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},{5:61,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},{37:[1,62]},o($Vt,[2,59]),o($Vu,[2,33]),{32:[1,63],34:[1,64]},o($Vu,[2,39]),{13:$Vf,14:$Vg,15:$Vh,17:[1,65],18:$Vi,19:$Vj,20:$Vk,21:$Vl,22:$Vm,23:$Vn},o($Vv,[2,23],{13:$Vf,21:$Vl,22:$Vm,23:$Vn}),o($Vv,[2,24],{13:$Vf,21:$Vl,22:$Vm,23:$Vn}),{5:68,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,17:[1,66],20:$V7,24:$V8,25:$V9,26:67,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},{32:[1,69]},{12:$Vw,28:70,33:$Vc,34:$Vd},{12:$Vw,28:72,33:$Vc,34:$Vd},{32:[1,73],33:[1,74],34:[1,75]},{32:[1,76],33:[1,78],34:[1,77]},o($Vu,[2,38]),o($Vu,[2,40]),{32:[1,79],34:[1,80]},o([4,17,35,36],[2,10],{13:$Vf,14:$Vg,15:$Vh,18:$Vi,19:$Vj,20:$Vk,21:$Vl,22:$Vm,23:$Vn}),o([4,14,17,35,36],[2,11],{13:$Vf,15:$Vh,18:$Vi,19:$Vj,20:$Vk,21:$Vl,22:$Vm,23:$Vn}),o($Vv,[2,12],{13:$Vf,21:$Vl,22:$Vm,23:$Vn}),{5:81,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},{5:82,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},o($Vx,[2,18],{13:$Vf,15:$Vh,20:$Vk,21:$Vl,22:$Vm,23:$Vn}),{5:83,6:4,7:$V0,8:$V1,9:7,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,27:16,28:19,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve},o($Vx,[2,17],{13:$Vf,15:$Vh,20:$Vk,21:$Vl,22:$Vm,23:$Vn}),o($Vv,[2,19],{13:$Vf,21:$Vl,22:$Vm,23:$Vn}),o($Vy,[2,20],{13:$Vf,23:$Vn}),o($Vy,[2,21],{13:$Vf,23:$Vn}),o([4,14,15,17,18,19,20,21,22,23,35,36],[2,22],{13:$Vf}),o($Vs,[2,56]),o($Vu,[2,35]),o($Vu,[2,45]),o($Vo,[2,13]),o($Vo,[2,26]),{17:[1,84],35:[1,85],36:[1,86]},o($Vz,[2,50],{13:$Vf,14:$Vg,15:$Vh,18:$Vi,19:$Vj,20:$Vk,21:$Vl,22:$Vm,23:$Vn}),o($Vt,[2,58]),o($Vo,[2,30]),{32:$Vp,33:$Vq,34:$Vr},o($Vo,[2,31],{29:[1,87]}),o($Vu,[2,34]),{32:[1,88]},o($Vu,[2,42]),o($Vu,[2,41]),o($Vu,[2,43]),{32:[1,89],34:[1,90]},o($Vu,[2,44]),o($Vu,[2,46]),o($Vx,[2,14],{13:$Vf,15:$Vh,20:$Vk,21:$Vl,22:$Vm,23:$Vn}),o($Vx,[2,16],{13:$Vf,15:$Vh,20:$Vk,21:$Vl,22:$Vm,23:$Vn}),o($Vx,[2,15],{13:$Vf,15:$Vh,20:$Vk,21:$Vl,22:$Vm,23:$Vn}),o($Vo,[2,27]),o($Vz,[2,51],{6:4,9:7,27:16,28:19,5:91,7:$V0,8:$V1,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve}),o($Vz,[2,52],{6:4,9:7,27:16,28:19,5:92,7:$V0,8:$V1,10:$V2,11:$V3,12:$V4,15:$V5,16:$V6,20:$V7,24:$V8,25:$V9,30:$Va,32:$Vb,33:$Vc,34:$Vd,37:$Ve}),{12:$Vw,28:93,33:$Vc,34:$Vd},o($Vu,[2,36]),o($Vu,[2,47]),o($Vu,[2,49]),o($Vz,[2,53],{13:$Vf,14:$Vg,15:$Vh,18:$Vi,19:$Vj,20:$Vk,21:$Vl,22:$Vm,23:$Vn}),o($Vz,[2,54],{13:$Vf,14:$Vg,15:$Vh,18:$Vi,19:$Vj,20:$Vk,21:$Vl,22:$Vm,23:$Vn}),o($Vo,[2,32])],
defaultActions: {2:[2,1],23:[2,2]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        throw new Error(str);
    }
},
parse: function parse(input) {
    var self = this,
        stack = [0],
        tstack = [], // token stack
        vstack = [null], // semantic value stack
        lstack = [], // location stack
        table = this.table,
        yytext = '',
        yylineno = 0,
        yyleng = 0,
        recovering = 0,
        TERROR = 2,
        EOF = 1;

    var args = lstack.slice.call(arguments, 1);

    //this.reductionCount = this.shiftCount = 0;

    var lexer = Object.create(this.lexer);
    var sharedState = { yy: {} };
    // copy state
    for (var k in this.yy) {
      if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
        sharedState.yy[k] = this.yy[k];
      }
    }

    lexer.setInput(input, sharedState.yy);
    sharedState.yy.lexer = lexer;
    sharedState.yy.parser = this;
    if (typeof lexer.yylloc == 'undefined') {
        lexer.yylloc = {};
    }
    var yyloc = lexer.yylloc;
    lstack.push(yyloc);

    var ranges = lexer.options && lexer.options.ranges;

    if (typeof sharedState.yy.parseError === 'function') {
        this.parseError = sharedState.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }

    function popStack (n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }

_token_stack:
    function lex() {
        var token;
        token = lexer.lex() || EOF;
        // if token isn't its numeric value, convert
        if (typeof token !== 'number') {
            token = self.symbols_[token] || token;
        }
        return token;
    }

    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        // retreive state number from top of stack
        state = stack[stack.length - 1];

        // use default actions if available
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            // read action for current state and first input
            action = table[state] && table[state][symbol];
        }

_handle_error:
        // handle parse error
        if (typeof action === 'undefined' || !action.length || !action[0]) {
            var error_rule_depth;
            var errStr = '';

            // Return the rule stack depth where the nearest error rule can be found.
            // Return FALSE when no error recovery rule was found.
            function locateNearestErrorRecoveryRule(state) {
                var stack_probe = stack.length - 1;
                var depth = 0;

                // try to recover from error
                for(;;) {
                    // check for error recovery rule in this state
                    if ((TERROR.toString()) in table[state]) {
                        return depth;
                    }
                    if (state === 0 || stack_probe < 2) {
                        return false; // No suitable error recovery rule available.
                    }
                    stack_probe -= 2; // popStack(1): [symbol, action]
                    state = stack[stack_probe];
                    ++depth;
                }
            }

            if (!recovering) {
                // first see if there's any chance at hitting an error recovery rule:
                error_rule_depth = locateNearestErrorRecoveryRule(state);

                // Report error
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push("'"+this.terminals_[p]+"'");
                    }
                }
                if (lexer.showPosition) {
                    errStr = 'Parse error on line '+(yylineno+1)+":\n"+lexer.showPosition()+"\nExpecting "+expected.join(', ') + ", got '" + (this.terminals_[symbol] || symbol)+ "'";
                } else {
                    errStr = 'Parse error on line '+(yylineno+1)+": Unexpected " +
                                  (symbol == EOF ? "end of input" :
                                              ("'"+(this.terminals_[symbol] || symbol)+"'"));
                }
                return this.parseError(errStr, {
                    text: lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: lexer.yylineno,
                    loc: yyloc,
                    expected: expected,
                    recoverable: (error_rule_depth !== false)
                });
            } else if (preErrorSymbol !== EOF) {
                error_rule_depth = locateNearestErrorRecoveryRule(state);
            }

            // just recovered from another error
            if (recovering == 3) {
                if (symbol === EOF || preErrorSymbol === EOF) {
                    throw new Error(errStr || 'Parsing halted while starting to recover from another error.');
                }

                // discard current lookahead and grab another
                yyleng = lexer.yyleng;
                yytext = lexer.yytext;
                yylineno = lexer.yylineno;
                yyloc = lexer.yylloc;
                symbol = lex();
            }

            // try to recover from error
            if (error_rule_depth === false) {
                throw new Error(errStr || 'Parsing halted. No suitable error recovery rule available.');
            }
            popStack(error_rule_depth);

            preErrorSymbol = (symbol == TERROR ? null : symbol); // save the lookahead token
            symbol = TERROR;         // insert generic error symbol as new lookahead
            state = stack[stack.length-1];
            action = table[state] && table[state][TERROR];
            recovering = 3; // allow 3 real symbols to be shifted before reporting a new error
        }

        // this shouldn't happen, unless resolve defaults are off
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: '+state+', token: '+symbol);
        }

        switch (action[0]) {
            case 1: // shift
                //this.shiftCount++;

                stack.push(symbol);
                vstack.push(lexer.yytext);
                lstack.push(lexer.yylloc);
                stack.push(action[1]); // push state
                symbol = null;
                if (!preErrorSymbol) { // normal execution/no error
                    yyleng = lexer.yyleng;
                    yytext = lexer.yytext;
                    yylineno = lexer.yylineno;
                    yyloc = lexer.yylloc;
                    if (recovering > 0) {
                        recovering--;
                    }
                } else {
                    // error just occurred, resume old lookahead f/ before error
                    symbol = preErrorSymbol;
                    preErrorSymbol = null;
                }
                break;

            case 2:
                // reduce
                //this.reductionCount++;

                len = this.productions_[action[1]][1];

                // perform semantic action
                yyval.$ = vstack[vstack.length-len]; // default to $$ = $1
                // default location, uses first token for firsts, last for lasts
                yyval._$ = {
                    first_line: lstack[lstack.length-(len||1)].first_line,
                    last_line: lstack[lstack.length-1].last_line,
                    first_column: lstack[lstack.length-(len||1)].first_column,
                    last_column: lstack[lstack.length-1].last_column
                };
                if (ranges) {
                  yyval._$.range = [lstack[lstack.length-(len||1)].range[0], lstack[lstack.length-1].range[1]];
                }
                r = this.performAction.apply(yyval, [yytext, yyleng, yylineno, sharedState.yy, action[1], vstack, lstack].concat(args));

                if (typeof r !== 'undefined') {
                    return r;
                }

                // pop off stack
                if (len) {
                    stack = stack.slice(0,-1*len*2);
                    vstack = vstack.slice(0, -1*len);
                    lstack = lstack.slice(0, -1*len);
                }

                stack.push(this.productions_[action[1]][0]);    // push nonterminal (reduce)
                vstack.push(yyval.$);
                lstack.push(yyval._$);
                // goto new state = table[STATE][NONTERMINAL]
                newState = table[stack[stack.length-2]][stack[stack.length-1]];
                stack.push(newState);
                break;

            case 3:
                // accept
                return true;
        }

    }

    return true;
}};

var Formula = function() {
	var formulaLexer = function () {};
	formulaLexer.prototype = parser.lexer;

	var formulaParser = function () {
		this.lexer = new formulaLexer();
		this.yy = {
			types: [],
			escape: function(value) {
				return value
					.replace(/&/gi, '&amp;')
					.replace(/>/gi, '&gt;')
					.replace(/</gi, '&lt;')
					.replace(/\n/g, '\n<br>')
					.replace(/\t/g, '&nbsp;&nbsp;&nbsp ')
					.replace(/  /g, '&nbsp; ');
			},
			parseError: function(msg, hash) {
				this.done = true;
				var result = new String();
				result.html = '<pre>' + msg + '</pre>';
				result.hash = hash;
				return result;
			}
		};
	};

	formulaParser.prototype = parser;
	var newParser = new formulaParser();
	return newParser;
};
if (typeof(window) !== 'undefined') {
	window.Formula = Formula;
} else {
	parser.Formula = Formula;
}/* generated by jison-lex 0.3.4 */
var lexer = (function(){
var lexer = ({

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input, yy) {
        this.yy = yy || this.yy || {};
        this._input = new Parser.InputReader(input);
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input.ch();
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input.unCh(len, ch);
        this.yytext = this.yytext.substr(0, this.yytext.length - len);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var matched = this._input.toString();
        var past = matched.substr(0, matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this._input.input.substr(this._input.position, this._input.input.length - 1);
        return (next.substr(0, 20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function (match, indexed_rule) {
        var token,
            lines,
            backup,
            k;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines !== null ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match.length
        };
        this.yytext += match;
        this.match += match;
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input.addMatch(match);
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && !this._input.done) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (k in backup) if (backup.hasOwnProperty(k)) {
                this[k] = backup[k];
            }
            return null; // rule action called reject() implying the next rule should be tested instead.
        }
        return null;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (this._input.done) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch !== null && (match === undefined || tempMatch[0].length > match.length)) {
                match = tempMatch[0];
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch[0], rules[i]);
                    if (token !== null) {
                        return token;
                    } else if (this._backtrack) {
                        match = undefined;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return null;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match !== undefined) {
            token = this.test_match(match, rules[index]);
            if (token !== null) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return null;
        }
        if (this._input.done) {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex() {
        var r = this.next();
        if (r !== null) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState(condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {
var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:/* skip whitespace */
break;
case 1:return 25;
break;
case 2:return 7;
break;
case 3:return 8;
break;
case 4:
	return 30;

break;
case 5:
    //js
        yy_.yytext = yy_.yytext.substring(1, yy_.yytext.length - 1);
        return 30;

    /*php
        $yy_.yytext = substr($yy_.yytext, 1, -1);
        return 30;
    */

break;
case 6:return 10;
break;
case 7:return 10;
break;
case 8:return 11;
break;
case 9:return 11;
break;
case 10:return 12;
break;
case 11:return 37;
break;
case 12:return 37;
break;
case 13:return 32;
break;
case 14:return 33;
break;
case 15:return 13;
break;
case 16:return ' ';
break;
case 17:return 38;
break;
case 18:return 29;
break;
case 19:return 35;
break;
case 20:return 36;
break;
case 21:return 21;
break;
case 22:return 22;
break;
case 23:return 20;
break;
case 24:return 15;
break;
case 25:return 23;
break;
case 26:return 16;
break;
case 27:return 17;
break;
case 28:return 19;
break;
case 29:return 18;
break;
case 30:return 'PI';
break;
case 31:return 24;
break;
case 32:return '"';
break;
case 33:return "'";
break;
case 34:return '\"';
break;
case 35:return "\'";
break;
case 36:return "!";
break;
case 37:return 14;
break;
case 38:return 39;
break;
case 39:return 34;
break;
case 40:return '#';
break;
case 41:return 4;
break;
}
},
rules: [/^(?:\s+)/,/^(?:([A-Za-z]{1,})([A-Za-z_0-9]+)?(?=[(]))/,/^(?:([0]?[1-9]|1[0-2])[:][0-5][0-9]([:][0-5][0-9])?[ ]?(AM|am|aM|Am|PM|pm|pM|Pm))/,/^(?:([0]?[0-9]|1[0-9]|2[0-3])[:][0-5][0-9]([:][0-5][0-9])?)/,/^(?:(([A-Za-z0-9]+))(?=[!]))/,/^(?:((['](\\[']|[^'])*['])|(["](\\["]|[^"])*["]))(?=[!]))/,/^(?:((['](\\[']|[^'])*['])))/,/^(?:((["](\\["]|[^"])*["])))/,/^(?:(([\\]['].+?[\\]['])))/,/^(?:(([\\]["].+?[\\]["])))/,/^(?:[A-Z]+(?=[0-9$]))/,/^(?:[A-Za-z]{1,}[A-Za-z_0-9]+)/,/^(?:[A-Za-z_]+)/,/^(?:[0-9]+)/,/^(?:\$)/,/^(?:&)/,/^(?: )/,/^(?:[.])/,/^(?::)/,/^(?:;)/,/^(?:,)/,/^(?:\*)/,/^(?:\/)/,/^(?:-)/,/^(?:\+)/,/^(?:\^)/,/^(?:\()/,/^(?:\))/,/^(?:>)/,/^(?:<)/,/^(?:PI\b)/,/^(?:E\b)/,/^(?:")/,/^(?:')/,/^(?:\\")/,/^(?:\\')/,/^(?:!)/,/^(?:=)/,/^(?:%)/,/^(?:#REF!)/,/^(?:[#])/,/^(?:$)/],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41],"inclusive":true}}
});
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}Parser.prototype = parser;

/**
 * in input reader for parser/lexer, uses sticky behavior when available, falls back to standard string modification when it is not
 * @param {String} input
 */
Parser.InputReader = (function(Math, parser, lexer) {
    var stickyCompatible = RegExp.prototype.sticky !== undefined,
        rules,
        rule,
        max,
        i;

    function Parser_InputReader(input) {
        this.done = false;
        this.input = input;
        this.length = input.length;
        this.matches = [];
        this.position = 0;
    }

	//sticky implementation
    if (stickyCompatible) {
        Parser_InputReader.prototype = {
            addMatch: function addMatch(match) {
                this.matches.push(match);
                this.position += match.length;
                this.done = (this.position >= this.length);
            },

            ch: function ch() {
                var ch = this.input[this.position];
                this.addMatch(ch);
                return ch;
            },

            unCh: function unCh(chLength) {
                this.position -= chLength;
                this.position = Math.max(0, this.position);
                this.done = (this.position >= this.length);
            },

            substring: function substring(start, end) {
                start = (start != 0 ? this.position + start : this.position);
                end = (end != 0 ? start + end : this.length);
                return this.input.substring(start, end);
            },

            match: function match(rule) {
                var match;
                rule.lastIndex = this.position;
                if ((match = rule.exec(this.input)) !== null) {
                    return match;
                }
                return null;
            },

            toString: function toString() {
                return this.matches.join('');
            }
        };

        rules = lexer.rules;
        max = rules.length;
        i = 0;
        for(;i < max; i++) {
            rule = rules[i];
            rules[i] = new RegExp(rule.source.substring(1),'y');
        }
    }

    //fallback to non-sticky implementations
    else {

        Parser_InputReader.prototype = {
            addMatch: function addMatch(match) {
                this.input = this.input.slice(match.length);
                this.matches.push(match);
                this.position += match.length;
                this.done = (this.position >= this.length);
            },

            ch: function ch() {
                var ch = this.input[0];
                this.addMatch(ch);
                return ch;
            },

            unCh: function unCh(chLength, ch) {
                this.position -= chLength;
                this.position = Math.max(0, this.position);
	            this.input = ch + this.input;
                this.done = (this.position >= this.length);
            },

            substring: function substring(start, end) {
                start = (start != 0 ? this.position + start : this.position);
                end = (end != 0 ? start + end : this.length);
                return this.input.substring(start, end);
            },

            match: function match(rule) {
                var match,
                    input = this.input;

                if ((match = input.match(rule)) !== null) {
                    return match;
                }

                return null;
            },

            toString: function toString() {
                return this.matches.join('');
            }
        };
    }

    return Parser_InputReader;
})(Math, parser, lexer);
parser.Parser = Parser;
return new Parser;
})();


if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = parser;
exports.Parser = parser.Parser;
exports.parse = function () { return parser.parse.apply(parser, arguments); };
exports.main = function commonjsMain(args) {
    if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
    }
    var source = require('fs').readFileSync(require('path').normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(process.argv.slice(1));
}
}
/* parser generated by jison 0.4.15 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var parser = (function(){
var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[1,10],$V1=[1,11],$V2=[1,12],$V3=[1,13],$V4=[5,7,8,9,10],$V5=[1,19],$V6=[1,20],$V7=[5,7,8,9,10,12,13],$V8=[1,21],$V9=[5,7,8,9,10,12,13,14,16];
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"grid":3,"rows":4,"EOF":5,"row":6,"END_OF_LINE":7,"END_OF_LINE_WITH_EMPTY_NEXT_FIRST_COLUMN":8,"END_OF_LINE_WITH_NO_COLUMNS":9,"END_OF_LINE_WITH_EMPTY_COLUMN":10,"string":11,"COLUMN_EMPTY":12,"COLUMN_STRING":13,"CHAR":14,"QUOTE_ON":15,"QUOTE_OFF":16,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",7:"END_OF_LINE",8:"END_OF_LINE_WITH_EMPTY_NEXT_FIRST_COLUMN",9:"END_OF_LINE_WITH_NO_COLUMNS",10:"END_OF_LINE_WITH_EMPTY_COLUMN",12:"COLUMN_EMPTY",13:"COLUMN_STRING",14:"CHAR",15:"QUOTE_ON",16:"QUOTE_OFF"},
productions_: [0,[3,2],[3,1],[4,1],[4,1],[4,1],[4,1],[4,1],[4,2],[4,2],[4,2],[4,2],[4,3],[4,3],[4,3],[4,3],[6,1],[6,1],[6,2],[6,3],[6,1],[6,2],[6,3],[11,1],[11,2],[11,3]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1:

		return $$[$0-1];
	
break;
case 2:

		return [['']];
	
break;
case 3:

	    //row
		this.$ = [$$[$0]];
	
break;
case 4:

	    //END_OF_LINE
        this.$ = [];
	
break;
case 5:

	    //END_OF_LINE_WITH_EMPTY_NEXT_FIRST_COLUMN
	    this.$ = [''];
	
break;
case 6:

	    //END_OF_LINE_WITH_NO_COLUMNS
	    this.$ = [''];
	
break;
case 7:

        //END_OF_LINE_WITH_EMPTY_COLUMN
        this.$ = [''];
    
break;
case 8:

        //rows END_OF_LINE
        this.$ = $$[$0-1];
    
break;
case 9:

        //rows END_OF_LINE_WITH_EMPTY_NEXT_FIRST_COLUMN
        $$[$0-1].push(['']);
        this.$ = $$[$0-1];
    
break;
case 10:

        //rows END_OF_LINE_WITH_NO_COLUMNS
        $$[$0-1].push(['']);
        this.$ = $$[$0-1];
    
break;
case 11:

        //rows END_OF_LINE_WITH_EMPTY_COLUMN
        $$[$0-1][$$[$0-1].length - 1].push('');
        this.$ = $$[$0-1];
    
break;
case 12:

        //rows END_OF_LINE row
        $$[$0-2].push($$[$0]);
        this.$ = $$[$0-2];
    
break;
case 13:

        //rows END_OF_LINE_WITH_EMPTY_NEXT_FIRST_COLUMN row
        $$[$0].unshift('');
        $$[$0-2].push($$[$0]);
        this.$ = $$[$0-2];
    
break;
case 14:

        //rows END_OF_LINE_WITH_NO_COLUMNS row
        $$[$0-2].push(['']);
        $$[$0-2].push($$[$0]);
        this.$ = $$[$0-2];
    
break;
case 15:

        //rows END_OF_LINE_WITH_EMPTY_COLUMN row
        $$[$0-2][$$[$0-2].length - 1].push('');
        $$[$0-2].push($$[$0]);
        this.$ = $$[$0-2];
    
break;
case 16:

	    //string
		this.$ = [$$[$0].join('')];
	
break;
case 17:

	    //COLUMN_EMPTY
		this.$ = [''];
	
break;
case 18:

        //row COLUMN_EMPTY
        $$[$0-1].push('');
        this.$ = $$[$0-1];
    
break;
case 19:

        //row COLUMN_EMPTY string
        $$[$0-2].push('');
        $$[$0-2].push($$[$0].join(''));
        this.$ = $$[$0-2];
    
break;
case 20:

        //COLUMN_STRING
    
break;
case 21:

        //row COLUMN_STRING
    
break;
case 22:

        //row COLUMN_STRING string
        $$[$0-2].push($$[$0].join(''));
        this.$ = $$[$0-2];
    
break;
case 23:

	    //CHAR
		this.$ = [$$[$0]];
	
break;
case 24:

	    //string CHAR
		$$[$0-1].push($$[$0]);
		this.$ = $$[$0-1];
	
break;
case 25:

	    //QUOTE_ON string QUOTE_OFF
        this.$ = $$[$0-1];
    
break;
}
},
table: [{3:1,4:2,5:[1,3],6:4,7:[1,5],8:[1,6],9:[1,7],10:[1,8],11:9,12:$V0,13:$V1,14:$V2,15:$V3},{1:[3]},{5:[1,14],7:[1,15],8:[1,16],9:[1,17],10:[1,18]},{1:[2,2]},o($V4,[2,3],{12:$V5,13:$V6}),o($V4,[2,4]),o($V4,[2,5]),o($V4,[2,6]),o($V4,[2,7]),o($V7,[2,16],{14:$V8}),o($V7,[2,17]),o($V7,[2,20]),o($V9,[2,23]),{11:22,14:$V2,15:$V3},{1:[2,1]},o($V4,[2,8],{11:9,6:23,12:$V0,13:$V1,14:$V2,15:$V3}),o($V4,[2,9],{11:9,6:24,12:$V0,13:$V1,14:$V2,15:$V3}),o($V4,[2,10],{11:9,6:25,12:$V0,13:$V1,14:$V2,15:$V3}),o($V4,[2,11],{11:9,6:26,12:$V0,13:$V1,14:$V2,15:$V3}),o($V7,[2,18],{11:27,14:$V2,15:$V3}),o($V7,[2,21],{11:28,14:$V2,15:$V3}),o($V9,[2,24]),{14:$V8,16:[1,29]},o($V4,[2,12],{12:$V5,13:$V6}),o($V4,[2,13],{12:$V5,13:$V6}),o($V4,[2,14],{12:$V5,13:$V6}),o($V4,[2,15],{12:$V5,13:$V6}),o($V7,[2,19],{14:$V8}),o($V7,[2,22],{14:$V8}),o($V9,[2,25])],
defaultActions: {3:[2,2],14:[2,1]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        throw new Error(str);
    }
},
parse: function parse(input) {
    var self = this, stack = [0], tstack = [], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    var args = lstack.slice.call(arguments, 1);
    var lexer = Object.create(this.lexer);
    var sharedState = { yy: {} };
    for (var k in this.yy) {
        if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
            sharedState.yy[k] = this.yy[k];
        }
    }
    lexer.setInput(input, sharedState.yy);
    sharedState.yy.lexer = lexer;
    sharedState.yy.parser = this;
    if (typeof lexer.yylloc == 'undefined') {
        lexer.yylloc = {};
    }
    var yyloc = lexer.yylloc;
    lstack.push(yyloc);
    var ranges = lexer.options && lexer.options.ranges;
    if (typeof sharedState.yy.parseError === 'function') {
        this.parseError = sharedState.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    _token_stack:
        function lex() {
            var token;
            token = lexer.lex() || EOF;
            if (typeof token !== 'number') {
                token = self.symbols_[token] || token;
            }
            return token;
        }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(lexer.yytext);
            lstack.push(lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = lexer.yyleng;
                yytext = lexer.yytext;
                yylineno = lexer.yylineno;
                yyloc = lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.apply(yyval, [
                yytext,
                yyleng,
                yylineno,
                sharedState.yy,
                action[1],
                vstack,
                lstack
            ].concat(args));
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};

if (typeof GLOBAL !== 'undefined') {
    GLOBAL.window = GLOBAL;
}
if (typeof window.TSV === 'undefined') {
    var parse = parser.parse;
    parser.parse = function(input) {
        var setInput = this.lexer.setInput;
        this.lexer.setInput = function(input) {
            setInput.call(this, input);
            this.begin('BOF');
            return this;
        };

        this.parse = parse;
        return parse.call(this, input);
    };

	window.TSV = function(handler) {
		var TSVLexer = function () {};
		TSVLexer.prototype = parser.lexer;

		var TSVParser = function () {
			this.lexer = new TSVLexer();
			this.yy = {};
		};

		TSVParser.prototype = parser;
		var newParser = new TSVParser;
		newParser.setObj = function(obj) {
			newParser.yy.obj = obj;
		};
		newParser.yy.handler = handler;
		return newParser;
	};
}/* generated by jison-lex 0.3.4 */
var lexer = (function(){
var lexer = ({

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input, yy) {
        this.yy = yy || this.yy || {};
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        this._input = this._input.slice(1);
        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function (match, indexed_rule) {
        var token,
            lines,
            backup;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (var k in backup) {
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    } else if (this._backtrack) {
                        match = false;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex() {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState(condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {
var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:
    //<QUOTE>(\n|"\n")
    return 14;

break;
case 1:
    //<QUOTE>([\'\"])(?=<<EOF>>)
    this.popState();
    return 16;

break;
case 2:
    //<QUOTE>([\'\"])
    if (yy_.yytext == this.quoteChar) {
        this.popState();
        this.begin('STRING');
        return 16;
	} else {
	    return 14;
	}

break;
case 3:
    //<QUOTE>(?=(\t))
	this.popState();
	this.begin('STRING');
	return 14;

break;
case 4:
    //<BOF>([\'\"])
    this.popState();
    this.quoteChar = yy_.yytext.substring(0);
	this.begin('QUOTE');
	return 15;

break;
case 5:
    //<PRE_QUOTE>([\'\"])
    this.quoteChar = yy_.yytext;
    this.popState();
	this.begin('QUOTE');
	return 15;

break;
case 6:
    //(\t|"\t")(?=[\'\"])
	this.begin('PRE_QUOTE');
	return 13;

break;
case 7:
    //(\n|"\n")(?=[\'\"])
	this.begin('PRE_QUOTE');
	return 7;

break;
case 8:
    //<QUOTE>([a-zA-Z0-9_]+|.)
    return 14;

break;
case 9:
    //<STRING>(\n\n|"\n\n")
	this.popState();
	return 8;

break;
case 10:
    //<STRING>(\n\n|"\n\n")
	this.popState();
	return 9;

break;
case 11:
    //<STRING>(\n|"\n")
	this.popState();
	return 7;

break;
case 12:
    //<STRING>(\t|"\t")
	this.popState();
	return 13;

break;
case 13:
    //<STRING>([a-zA-Z0-9_ ]+|.)
    return 14;

break;
case 14:
    //<BOF>
    this.popState();

break;
case 15:
    return 'BUFFIN';

break;
case 16:
    //(\n\n|"\n\n")
    return 9;

break;
case 17:
    //(\t\n)
    return 10;

break;
case 18:
    //(\t)
    return 12;

break;
case 19:
    //(\n)
    return 7;

break;
case 20:
    //([a-zA-Z0-9_ ]+|.)
	this.begin('STRING');
	return 14;

break;
case 21:
    //<<EOF>>
    //lexer.yy.conditionStack = [];
    return 5;

break;
}
},
rules: [/^(?:(\n|\\n))/,/^(?:([\'\"])(?=$))/,/^(?:([\'\"]))/,/^(?:(?=(\t)))/,/^(?:([\'\"]))/,/^(?:([\'\"]))/,/^(?:(\t|\\t)(?=[\'\"]))/,/^(?:(\n|\\n)(?=[\'\"]))/,/^(?:([a-zA-Z0-9_ ]+|.))/,/^(?:(\n\t|\\n\\t))/,/^(?:(\n\n|\\n\\n))/,/^(?:(\n|\\n))/,/^(?:(\t|\\t))/,/^(?:([a-zA-Z0-9_ ]+|.))/,/^(?:)/,/^(?:(\n\t|\\n\\t)(?=.))/,/^(?:(\n\n|\\n\\n))/,/^(?:(\t\n))/,/^(?:(\t))/,/^(?:(\n))/,/^(?:([a-zA-Z0-9_ ]+|.))/,/^(?:$)/],
conditions: {"BOF":{"rules":[4,6,7,14,15,16,17,18,19,20,21],"inclusive":true},"PRE_QUOTE":{"rules":[5,6,7,15,16,17,18,19,20,21],"inclusive":true},"QUOTE":{"rules":[0,1,2,3,6,7,8,15,16,17,18,19,20,21],"inclusive":true},"STRING":{"rules":[6,7,9,10,11,12,13,15,16,17,18,19,20,21],"inclusive":true},"INITIAL":{"rules":[6,7,15,16,17,18,19,20,21],"inclusive":true}}
});
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();


if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = parser;
exports.Parser = parser.Parser;
exports.parse = function () { return parser.parse.apply(parser, arguments); };
exports.main = function commonjsMain(args) {
    if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
    }
    var source = require('fs').readFileSync(require('path').normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(process.argv.slice(1));
}
}
