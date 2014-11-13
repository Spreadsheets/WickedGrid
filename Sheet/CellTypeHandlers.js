Sheet.CellTypeHandlers = (function() {
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
})();