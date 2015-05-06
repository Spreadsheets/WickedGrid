var key = { /* key objects, makes it easier to develop */
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
};