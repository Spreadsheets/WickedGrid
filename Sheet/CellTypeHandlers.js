Sheet.CellTypeHandlers = (function() {
	var n = isNaN;
	return {
		percent: function (cell, value) {
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
			var date = Globalize.parseDate(value);
			if (date === null) {
				return value;
			} else {
				date.html = Globalize.format(date, 'd');
				return date;
			}
		},
		time: function (cell, value) {
			var date = Globalize.parseDate(value);
			if (date === null) {
				return value;
			} else {
				date.html = Globalize.format(date, 't');
				return date;
			}
		},
		currency: function (cell, value) {
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
			var radix, result;
			if (!settings.endOfNumber) {
				radix = Globalize.culture().numberFormat['.'];
				settings.endOfNumber = new RegExp("([" + (radix == '.' ? "\." : radix) + "])([0-9]*?[1-9]+)?(0)*$");
			}

			if (!n(value)) {//success
				result = new Number(value);
				result.html = Globalize.format(value + '', "n10")
					.replace(settings.endOfNumber, function (orig, radix, num) {
						return (num ? radix : '') + (num || '');
					});
				return result;
			}

			return value;
		}
	};
})();