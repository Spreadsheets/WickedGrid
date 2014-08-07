/**
 * The functions container of all functions used in jQuery.sheet
 * @namespace
 * @alias jQuery.sheet.fn
 * @name jFN
 */
var jFN = $.sheet.fn = {
    /**
     * information function
     * @param v
     * @returns {Boolean}
     * @this jSCell
     * @memberOf jFN
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
     * @memberOf jFN
     * @returns {*}
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
            v = parseFloat(v.replace(jSE.regEx.n, ''));
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
     * @memberOf jFN
     */
    VERSION:function () {
        return this.jS.version;
    },

    /**
     * math function
     * @param v
     * @returns {number}
     * @memberOf jFN
     */
    ABS:function (v) {
        return Math.abs(jFN.N(v));
    },

    /**
     * math function
     * @param value
     * @param significance
     * @returns {number}
     * @memberOf jFN
     */
    CEILING:function (value, significance) {
        significance = significance || 1;
        return (parseInt(value / significance) * significance) + significance;
    },

    /**
     * math function
     * @param v
     * @returns {number}
     * @memberOf jFN
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
     * @memberOf jFN
     */
    EXP:function (v) {
        return Math.exp(v);
    },

    /**
     * math function
     * @param value
     * @param significance
     * @returns {*}
     * @memberOf jFN
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
     * @memberOf jFN
     */
    INT:function (v) {
        return Math.floor(jFN.N(v));
    },

    /**
     * math function
     * @param v
     * @returns {number}
     * @memberOf jFN
     */
    LN:function (v) {
        return Math.log(v);
    },

    /**
     * math function
     * @param v
     * @param n
     * @returns {number}
     * @memberOf jFN
     */
    LOG:function (v, n) {
        n = n || 10;
        return Math.log(v) / Math.log(n);
    },

    /**
     * math function
     * @param v
     * @returns {*}
     * @memberOf jFN
     */
    LOG10:function (v) {
        return jFN.LOG(v);
    },

    /**
     * math function
     * @param x
     * @param y
     * @returns {number}
     * @memberOf jFN
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
     * @memberOf jFN
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
     * @memberOf jFN
     */
    PI:function () {
        return Math.PI;
    },

    /**
     * math function
     * @param x
     * @param y
     * @returns {number}
     * @memberOf jFN
     */
    POWER:function (x, y) {
        return Math.pow(x, y);
    },

    /**
     * math function
     * @param v
     * @returns {number}
     * @memberOf jFN
     */
    SQRT:function (v) {
        return Math.sqrt(v);
    },

    /**
     * math function
     * @returns {number}
     * @memberOf jFN
     */
    RAND:function () {
        return Math.random();
    },

    /**
     * math function
     * @returns {number}
     * @memberOf jFN
     */
    RND:function () {
        return Math.random();
    },

    /**
     * math function
     * @param v
     * @param decimals
     * @returns {number}
     * @memberOf jFN
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
     * @memberOf jFN
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
     * @memberOf jFN
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
     * @memberOf jFN
     */
    SUM:function () {
        var sum = 0,
            v = arrHelpers.toNumbers(arguments),
            i = v.length - 1;

        if (i < 0) {
            return 0;
        }

        do {
            sum += v[i] * 1;
        } while (i--);

        return sum;
    },

    /**
     * math function
     * @param number
     * @param digits
     * @returns {*}
     * @memberOf jFN
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
     * @param v
     * @returns {number}
     * @memberOf jFN
     */
    AVERAGE:function (v) {
        return jFN.SUM(arguments) / jFN.COUNT(arguments);
    },

    /**
     * statistical function
     * @param v
     * @returns {*}
     * @memberOf jFN
     */
    AVG:function (v) {
        return jFN.AVERAGE(v);
    },

    /**
     * statistical function
     * @returns {number}
     * @memberOf jFN
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
     * @memberOf jFN
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
     * @memberOf jFN
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
     * @memberOf jFN
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
     * @memberOf jFN
     */
    ASC:function (v) {
        return v.charCodeAt(0);
    },
    /**
     * string function
     * @param v
     * @returns {string}
     * @memberOf jFN
     */
    CHAR:function (v) {
        return String.fromCharCode(v);
    },
    /**
     * string function
     * @param v
     * @returns {String}
     * @memberOf jFN
     */
    CLEAN:function (v) {
        var exp = new RegExp("[\cG\x1B\cL\cJ\cM\cI\cK\x07\x1B\f\n\r\t\v]","g");
        return v.replace(exp, '');
    },
    /**
     * string function
     * @param v
     * @returns {*}
     * @memberOf jFN
     */
    CODE:function (v) {
        return jFN.ASC(v);
    },
    /**
     * string function
     * @returns {String}
     * @memberOf jFN
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
     * @memberOf jFN
     */
    DOLLAR:function (v, decimals, symbol) {
        decimals = decimals || 2;
        symbol = symbol || '$';

        var result = new Number(v),
            r = jFN.FIXED(v, decimals, false);

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
     * @memberOf jFN
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
     * @memberOf jFN
     */
    LEFT:function (v, numberOfChars) {
        numberOfChars = numberOfChars || 1;
        return v.substring(0, numberOfChars);
    },
    /**
     * string function
     * @param v
     * @returns {*}
     * @memberOf jFN
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
     * @memberOf jFN
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
     * @memberOf jFN
     */
    MID:function (v, start, end) {
        if (!v || !start || !end) {
            return this.jS.s.error({error:'ERROR'});
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
     * @memberOf jFN
     */
    REPLACE:function (oldText, start, numberOfChars, newText) {
        if (!oldText || !start || !numberOfChars || !newText) {
            return this.jS.s.error({error:'ERROR'});
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
     * @memberOf jFN
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
     * @memberOf jFN
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
     * @memberOf jFN
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
            return this.jS.s.error({error:'#VALUE!'});
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
     * @memberOf jFN
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
     * @memberOf jFN
     */
    TEXT:function () {
        return this.jS.s.error({error:'Not Yet Implemented'});
    },
    /**
     * string function
     * @param v
     * @returns {string}
     * @memberOf jFN
     */
    UPPER:function (v) {
        return v.toUpperCase();
    },
    /**
     * string function
     * @param v
     * @returns {*}
     * @memberOf jFN
     */
    VALUE:function (v) {
        if (jQuery.isNumeric(v)) {
            return v *= 1;
        } else {
            return this.jS.s.error({error:"#VALUE!"})
        }
    },

    /**
     * date/time function
     * @returns {Date}
     * @memberOf jFN
     */
    NOW:function () {
        var today = new Date();
        today.html = dates.toString(today);
        return today;
    },
    /**
     * date/time function
     * @returns {Number}
     * @memberOf jFN
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
     * @memberOf jFN
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
     * @memberOf jFN
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
     * @memberOf jFN
     */
    WEEKNUM:function (date) {//TODO: implement week starting
        date = dates.get(date);
        return dates.week(date) + 1;
    },
    /**
     * date/time function
     * @param date
     * @returns {number}
     * @memberOf jFN
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
     * @memberOf jFN
     */
    DAYSFROM:function (year, month, day) {
        return Math.floor((new Date() - new Date(year, (month - 1), day)) / dates.dayDiv);
    },
    /**
     * date/time function
     * @param v1
     * @param v2
     * @returns {number}
     * @memberOf jFN
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
     * @memberOf jFN
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
     * @memberOf jFN
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
     * @memberOf jFN
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
     * @memberOf jFN
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
     * @memberOf jFN
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
     * @memberOf jFN
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
     * @memberOf jFN
     */
    HOUR:function (time) {
        time = times.fromMath(time);
        return time.hour;
    },
    /**
     * date/time function
     * @param time
     * @returns {*}
     * @memberOf jFN
     */
    MINUTE:function (time) {
        return times.fromMath(time).minute;
    },
    /**
     * date/time function
     * @param date
     * @returns {number}
     * @memberOf jFN
     */
    MONTH:function (date) {
        date = dates.get(date);
        return date.getMonth() + 1;
    },
    /**
     * date/time function
     * @param time
     * @returns {*}
     * @memberOf jFN
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
     * @memberOf jFN
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
     * @memberOf jFN
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
     * @memberOf jFN
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
     * @memberOf jFN
     */
    YEARFRAC:function (startDate, endDate, basis) {
        startDate = dates.get(startDate);
        endDate = dates.get(endDate);

        if (!startDate || !endDate) {
            return this.jS.s.error({error:'#VALUE!'});
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
     * @memberOf jFN
     */
    AND:function () {
        var args = arguments,
            res,
            cell = this;
        $.each(args, function (i) {
            if (args[i].valueOf() !== true && res == undefined) {
                res = jFN.FALSE();
            }
        });
        if (!res) {
            res = jFN.TRUE();
        }
        return res;
    },
    /**
     * logical function
     * @returns {Boolean}
     * @memberOf jFN
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
     * @memberOf jFN
     */
    IF:function (expression, resultTrue, resultFalse) {
        if (expression.valueOf()) {
            return resultTrue;
        } else {
            return resultFalse;
        }
    },
    /**
     * logical function
     * @param v
     * @returns {Boolean}
     * @memberOf jFN
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
     * @memberOf jFN
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
     * @memberOf jFN
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
     * @memberOf jFN
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
     * @memberOf jFN
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
     * @memberOf jFN
     */
    EQUAL: function(left, right) {
        var result;

        if (left.valueOf() == right.valueOf()) {
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
     * @memberOf jFN
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
     * @memberOf jFN
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
     * @memberOf jFN
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
     * @memberOf jFN
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
     * @memberOf jFN
     */
    HYPERLINK:function (link, name) {
        name = name || 'LINK';
        var result = new String(name);
        result.html = $(document.createElement('a'))
            .attr('href', link)
            .attr('target', '_new')
            .text(name);

        return result;
    },
    /**
     * html function
     * @returns {*}
     * @memberOf jFN
     */
    DROPDOWN:function () {
        var cell = this,
            jS = this.jS,
            v,
            html = this.td.children().detach(),
            loc,
            $td = $(cell.td),
            select,
            id,
            result;

        if (!html.length || cell.needsUpdated) {
            v = arrHelpers.flatten(arguments);
            v = arrHelpers.unique(v);
            loc = jS.getTdLocation(cell.td);
            id = "dropdown" + this.sheet + "_" + loc.row + "_" + loc.col + '_' + jS.I;

            select = document.createElement('select');
            select.setAttribute('name', id);
            select.setAttribute('id', id);
            select.className = 'jSDropdown';
            select.cell = this;

            select.onmouseup = function() {
                jS.cellEdit($td);
            };
            select.onchange = function () {
                cell.value = this.value;
                jS.calcDependencies.call(cell, cell.calcDependenciesLast);
            };

            jS.controls.inputs[jS.i] = jS.obj.inputs().add(select);

            for (var i = 0; i < (v.length <= 50 ? v.length : 50); i++) {
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
                    $td.text(cell.value = select.value);
                });
            }

            select.value = cell.value || v[0];
            select.onchange();
        }
        if (typeof cell.value != 'object') {
            result = new String(cell.value);
        }
        result.html = select;
        return result;
    },
    /**
     * html function
     * @returns {*}
     * @memberOf jFN
     */
    RADIO:function () {
        var cell = this,
            jS = this.jS,
            v,
            html = this.td.children().detach(),
            loc,
            $td,
            inputs,
            $inputs,
            radio,
            id,
            result;

        if (!html.length || cell.needsUpdated) {
            v = arrHelpers.flatten(arguments);
            v = arrHelpers.unique(v);
            loc = jS.getTdLocation(cell.td);
            $td = $(cell.td);
            inputs = [];
            id = "radio" + this.sheet + "_" + loc.row + "_" + loc.col + '_' + jS.I;

            radio = document.createElement('span');
            radio.className = 'jSRadio';
            radio.onmousedown = function () {
                jS.cellEdit($td);
            };
            radio.jSCell = cell;
            jS.controls.inputs[jS.i] = jS.obj.inputs().add(radio);

            for (var i = 0; i < (v.length <= 25 ? v.length : 25); i++) {
                if (v[i]) {
                    var input = document.createElement('input'),
                        label = document.createElement('span');

                    input.setAttribute('type', 'radio');
                    input.setAttribute('name', id);
                    input.className = id;
                    input.value = v[i];
                    input.onchange = function() {
                        cell.value = jQuery(this).val();
                        jS.calcDependencies.call(cell, cell.calcDependenciesLast);
                    };

                    inputs.push(input);

                    if (v[i] == cell.value) {
                        input.setAttribute('checked', 'true');
                        input.onchange();
                    }
                    label.textContent = label.innerText = v[i];
                    radio.appendChild(input);
                    radio.input = input;
                    label.onclick = function () {
                        $(this).prev().click();
                    };
                    radio.appendChild(label);
                    radio.appendChild(document.createElement('br'));
                }
            }

            $inputs = $(inputs);

            if (!jS.s.editable) {
                cell.value = $inputs.filter(':checked').val();
                $inputs.attr('disabled', true);
            } else {
                jS.s.parent.bind('sheetKill', function() {
                    cell.value = $inputs.filter(':checked').val();
                    $td.text(cell.value);
                });
            }
        }

        if (typeof cell.value != 'object') {
            result = new String(cell.value);
        }

        result.html = radio;

        return result;
    },
    /**
     * html function
     * @param v
     * @returns {*}
     * @memberOf jFN
     */
    CHECKBOX:function (v) {
        if ($.isArray(v)) v = v[0];

        var cell = this,
            jS = this.jS,
            html = this.td.children().detach(),
            loc,
            checkbox,
            $td,
            label,
            id,
            result;

        if ((!html.length || cell.needsUpdated)) {
            loc = jS.getTdLocation(cell.td);
            checkbox = $([]);
            $td = $(cell.td);
            id = "checkbox" + this.sheet + "_" + loc.row + "_" + loc.col + '_' + jS.I;
            checkbox = document.createElement('input');
            checkbox.setAttribute('type', 'checkbox');
            checkbox.setAttribute('name', id);
            checkbox.className = id;
            checkbox.value = v;
            checkbox.onchange = function () {
                if ($(this).is(':checked')) {
                    cell.value = v;
                } else {
                    cell.value = '';
                }
                jS.calcDependencies.call(cell, cell.calcDependenciesLast);
            };

            if (!jS.s.editable) {
                checkbox.setAttribute('disabled', 'true');
            } else {
                jS.s.parent.bind('sheetKill', function() {
                    cell.value = (cell.value == 'true' || $(checkbox).is(':checked') ? v : '');
                    $td.text(cell.value);
                });
            }

            html = document.createElement('span');
            html.className='SCheckbox';
            html.appendChild(checkbox);
            label = document.createElement('span');
            label.textContent = label.innerText = v;
            html.appendChild(label);
            html.appendChild(document.createElement('br'));
            html.onmousedown = function () {
                jS.cellEdit($td);
            };
            html.cell = cell;

            jS.controls.inputs[jS.i] = jS.obj.inputs().add(html);

            if (v == cell.value) {
                checkbox.setAttribute('checked', true);
                checkbox.onchange();
            }
        }

        result = new String(cell.value == 'true' || $(checkbox).is(':checked') ? v : '');
        result.html = html;
        return result;
    },
    /**
     * html function
     * @param values
     * @param legend
     * @param title
     * @returns {String}
     * @memberOf jFN
     */
    BARCHART:function (values, legend, title) {
        var result = new String('');
        result.html = jSE.chart.call(this, {
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
     * @memberOf jFN
     */
    HBARCHART:function (values, legend, title) {
        var result = new String('');
        result.html = jSE.chart.call(this, {
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
     * @memberOf jFN
     */
    LINECHART:function (valuesX, valuesY) {
        var result = new String('');
        result.html = jSE.chart.call(this, {
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
     * @memberOf jFN
     */
    PIECHART:function (values, legend, title) {
        var result = new String('');
        result.html = jSE.chart.call(this, {
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
     * @memberOf jFN
     */
    DOTCHART:function (valuesX, valuesY, values, legendX, legendY, title) {
        var result = new String('');
        result.html = jSE.chart.call(this, {
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
     * @memberOf jFN
     */
    CELLREF:function (v) {
        return (this.jS.spreadsheets[v] ? this.jS.spreadsheets[v] : 'Cell Reference Not Found');
    },
    /**
     * html function
     * @param [pre] text before
     * @param [post] test after
     * @returns {string}
     * @memberOf jFN
     */
    CALCTIME:function (pre, post) {
        pre = pre || '';
        post = post || '';

        var cell = this,
            jS = this.jS;

        this.jS.s.parent.one('sheetCalculation', function () {
            jS.time.last = jS.calcLast;
            cell.td.text(pre + jS.time.diff() + post);
        });
        return "";
    },


    /**
     * cell function
     * @param value
     * @param tableArray
     * @param indexNumber
     * @param notExactMatch
     * @returns {*}
     * @memberOf jFN
     */
    HLOOKUP:function (value, tableArray, indexNumber, notExactMatch) {
        var jS = this.jS,
            lookupTable = this.jS.cellLookup.call(this),
            result = {html: '#N/A', value:''};

        indexNumber = indexNumber || 1;
        notExactMatch = notExactMatch !== undefined ? notExactMatch : true;

        if (isNaN(value)) {
            var i = tableArray[0].indexOf(value);
            if (i > -1) {
                result = jS.updateCellValue(lookupTable[i].sheet, indexNumber, jS.getTdLocation(lookupTable[i].td).col);
            }
        } else {
            arrHelpers.getClosestNum(value, tableArray[0], function(closest, i) {
                var num = jS.updateCellValue(lookupTable[i].sheet, indexNumber, jS.getTdLocation(lookupTable[i].td).col);

                if (notExactMatch) {
                    result = num;
                } else if (num == value) {
                    result = num;
                }
            });
        }

        return result;
    },
    /**
     * cell function
     * @param value
     * @param tableArray
     * @param indexNumber
     * @param notExactMatch
     * @returns {*}
     * @memberOf jFN
     */
    VLOOKUP:function (value, tableArray, indexNumber, notExactMatch) {
        var jS = this.jS,
            lookupTable = this.jS.cellLookup.call(this),
            result = {html: '#N/A', value:''};

        notExactMatch = notExactMatch !== undefined ? notExactMatch : true;

        if (isNaN(value)) {
            var i = tableArray[0].indexOf(value);
            if (i > -1) {
                result = jS.updateCellValue(lookupTable[i].sheet, indexNumber, jS.getTdLocation(lookupTable[i].td).col);
            }
        } else {
            arrHelpers.getClosestNum(value, tableArray[0], function(closest, i) {
                var num = jS.updateCellValue(lookupTable[i].sheet, jS.getTdLocation(lookupTable[i].td).row, indexNumber);

                if (notExactMatch) {
                    result = num;
                } else if (num == value) {
                    result = num;
                }
            });
        }

        return result;
    },
    /**
     * cell function
     * @param col
     * @returns {*}
     * @memberOf jFN
     */
    THISROWCELL:function (col) {
        var jS = this.jS, loc = jS.getTdLocation(this.td);
        if (isNaN(col)) {
            col = jSE.columnLabelIndex(col);
        }
        return jS.updateCellValue(this.sheet, loc.row, col);
    },
    /**
     * cell function
     * @param row
     * @returns {*}
     * @memberOf jFN
     */
    THISCOLCELL:function (row) {
        var jS = this.jS, loc = jS.getTdLocation(this.td);
        return jS.updateCellValue(this.sheet, row, loc.col);
    }
};