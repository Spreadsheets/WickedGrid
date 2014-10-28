Sheet.CellTypeHandlers = {
	percent: function(value) {
		var num = (n(value) ? globalize.parseFloat(value) : value * 1),
			result;

		if (!n(num)) {//success
			result = new Number(num);
			result.html = globalize.format(num, 'p');
			return result;
		}

		return value;
	},
	date: function(value) {
		var date = globalize.parseDate(value);
		if (date === null) {
			return value;
		} else {
			date.html = globalize.format(date, 'd');
			return date;
		}
	},
	time: function(value) {
		var date = globalize.parseDate(value);
		if (date === null) {
			return value;
		} else {
			date.html = globalize.format(date, 't');
			return date;
		}
	},
	currency: function(value) {
		var num = (n(value) ? globalize.parseFloat(value) : value * 1),
			result;

		if (!n(num)) {//success
			result = new Number(num);
			result.html = globalize.format(num, 'c');
			return result;
		}

		return value;
	},
	number: function(value) {
		var radix, result;
		if (!settings.endOfNumber) {
			radix = globalize.culture().numberFormat['.'];
			settings.endOfNumber = new RegExp("([" + (radix == '.' ? "\." : radix) + "])([0-9]*?[1-9]+)?(0)*$");
		}

		if (!n(value)) {//success
			result = new Number(value);
			result.html = globalize.format(value + '', "n10")
				.replace(settings.endOfNumber, function (orig, radix, num) {
					return (num ? radix : '') + (num || '');
				});
			return result;
		}

		return value;
	}
};