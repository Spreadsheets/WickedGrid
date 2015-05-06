/**
 * @project jQuery.sheet() The Ajax Spreadsheet - http://code.google.com/p/jquerysheet/
 * @author RobertLeePlummerJr@gmail.com
 * $Id: jquery.sheet.advancedfn.js 933 2013-08-28 12:59:30Z robertleeplummerjr $
 * Licensed under MIT
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */
Sheet.Plugin.advanced = (function() {
	function sum (arr){
		arr = sanitize(arr);
		var sum = 0,
			i = 0;

		for (; i < arr.length; i++) {
			sum += arr[i];
		}

		return sum;
	}

	function mean (arr){
		return sum(arr) / arr.length;
	}

	function sanitize () {
		return arrHelpers.toNumbers(arguments);
	}

	var advanced = {
        FACTORIAL: function(n){
            var fact = 1,
	            i = n;

            for (; i > 0; i--)
                fact *= i;

            return fact;
        },
        COMBINATION: function(n, k){
           return advanced.FACTORIAL(n) / advanced.FACTORIAL(k) / advanced.FACTORIAL(n - k);
        },
        PERMUTATION: function(n, r){
            return advanced.FACTORIAL(n) / advanced.FACTORIAL(n - r);
        },
        GAMMA: function(x){
            if (x > 0) {
                if (x != Math.floor(x)) {
                    var v = 1,
	                    w;

                    while (x < 8) {
                        v *= x;
                        x++;
                    }

                    w = 1 / (x * x);

                    return Math.exp(((((((((-3617 / 122400) * w + 7 / 1092) * w -
                    691 / 360360) *
                    w +
                    5 / 5940) *
                    w -
                    1 / 1680) *
                    w +
                    1 / 1260) *
                    w -
                    1 / 360) *
                    w +
                    1 / 12) /
                    x +
                    0.5 * Math.log(2 * Math.PI) -
                    Math.log(v) -
                    x +
                    (x - 0.5) * Math.log(x));
                }
                else {
                    return advanced.FACTORIAL(x - 1);
                }
            }
            return false;
        },
        PRECISION: function(x, eps){
            var dec = Math.pow(10, Math.floor(Math.log(1 / eps) * Math.LOG10E));
            return Math.round(dec * x) / dec;
        },
        MINIMUM: function(){
            var arr = sanitize(arguments),
                min = arr[0],
	            i = 0;

            for (; i < arr.length; i++) {
                if (arr[i] < min) {
                    min = arr[i];
                }
            }

            return min;
        },
        MODE: function(){
            var arr = sanitize(arguments),

	            arrsort = arr.sort(function(a, b){
	                return a - b;
	            }),
                count = 1,
                position = 0,
                frequencies = [],
                values = [],
                i = 0,
	            max;

            for (; i < arrsort.length; i++) {
                if (arrsort[i] == arrsort[i + 1]) {
                    count++;
                } else {
                    frequencies[position] = count;
                    values[position] = arrsort[i];
                    position++;
                    count = 1;
                }
            }

            max = frequencies[0];
            position = 0;

            for (i = 0; i < frequencies.length; i++) {
                if (frequencies[i] > max) {
                    max = frequencies[i];
                    position = i;
                }
            }

            return values[position];
        },
        MEDIAN: function(){
            var arr = sanitize(arguments),

                arrsort = arr.sort(function(a, b){
	                return a - b;
	            });

            return arrsort[Math.round((arr.length) / 2) - 1];
        },
        QUARTILES: function(){
            var arr = sanitize(arguments),

                 arrsort = arr.sort(function sortNumber(a, b){
                    return a - b;
                });

            return [arrsort[Math.round((arrsort.length) / 4) - 1], arrsort[Math.round((arrsort.length) / 2) - 1], arrsort[Math.round((arrsort.length) * 3 / 4) - 1]];
        },
        VARIANCE: function(){
            var arr = sanitize(arguments),
                sq_dev = [],
                u = mean(arr),
	            i = 0;

            for (; i < arr.length; i++) {
                sq_dev[i] = Math.pow(arr[i] - u, 2);
            }

            return sum(sq_dev) / arr.length;
        },
        MEANDEV: function(){
            var arr = sanitize(arguments),
                dev = [],
                u = sum(arr),
	            i = 0;

            for (; i < arr.length; i++) {
                dev[i] = Math.abs(arr[i] - u);
            }

            return sum(dev) / arr.length;
        },
        STDEV: function(){
            var arr = sanitize(arguments),
                mean = sum(arr) / arr.length,
                devs = [],
	            key;

            for(key in arr) {
                devs[key] = Math.pow(arr[key] - mean, 2);
            }

            return Math.sqrt(sum(devs) / (devs.length - 1));
        },
        COVARIANCE: function(arr1, arr2){
            var u = mean(arr1),
                v = mean(arr2),
                sq_dev = [],
	            i = 0;

            for (; i < arr1.length; i++) {
                sq_dev[i] = (arr1[i] - u) * (arr2[i] - v);
            }

            return sum(sq_dev) / arr1.length;
        },
        CORR_COEFF: function(arr1, arr2){
            return advanced.COVARIANCE(arr1, arr2) / advanced.STDEV(arr1) / advanced.STDEV(arr2);
        },
        UNIFORMCDF: function(a, b, x){
            if (x < a) {
                return 0;
            }
            else {
                if (x < b) {
                    return (x - a) / (b - a);
                }
            }
            return 1;
        },
        BINOMIAL: function(n, p, k){
            return advanced.COMBINATION(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
        },
        BINOMIALCDF: function(n, p, x){
            if (x < 0) {
                return 0;
            }
            var binomarr = [],
	            k = 0,
	            sum,
	            i;

            for (; k < n; k++)
                binomarr[k] = advanced.BINOMIAL(n, p, k);

            if (x < n) {
                sum = 0;
                i = 0;

	            for (; i <= x; i++)
                    sum += binomarr[i];

                return sum;
            }
            return 1;
        },
        NEGBIN: function(r, p, x){
            if (x != Math.floor(x)) {
                return false;
            }
            if (x < 0) {
                return 0;
            }
            else {
                return advanced.COMBINATION(x + r - 1, r - 1) * Math.pow(p, r) * Math.pow(1 - p, x);
            }
        },
        NEGBINCDF: function(n, p, x){
            if (x < 0) {
                return 0;
            }
            var sum = 0,
	            k = 0;
            for (; k <= x; k++) {
                sum += advanced.NEGBIN(n, p, k);
            }
            return sum;
        },
        HYPGEOM: function(N, m, n, x){
            if (x != Math.floor(x)) {
                return false;
            }
            if (x < 0) {
                return 0;
            }
            else {
                return advanced.COMBINATION(m, x) * advanced.COMBINATION((N - m), n - x) / advanced.COMBINATION(N, n);
            }
        },
        HYPGEOMCDF: function(N, m, n, x){
            if (x < 0) {
                return 0;
            }
            var sum = 0,
	            k = 0;

	        for (; k <= x; k++)
                sum += advanced.HYPGEOM(N, m, n, k);

            return sum;
        },
        EXPONENTIALCDF: function(l, x){
            return 1 - Math.exp(-l * x);
        },
        POISSON: function(l, x){
            return Math.pow(l, x) * Math.exp(-l) / advanced.FACTORIAL(x);
        },
        POISSONCDF: function(l, x){
            if (x < 0) {
                return 0;
            }
            var sum = 0,
	            k = 0;

	        for (; k <= x; k++)
                sum += advanced.POISSON(l, k);

            return sum;
        },
        NORMCDF: function(u, s, t){
            return advanced.ASR(Function("x", "return Math.exp(-Math.pow(x-" + u + ",2)/Math.pow(" + s + ",2)/2)/" + s + "/Math.sqrt(2*Math.PI)"), 0, t, 1e-14);
        },
        LINEAR_REQ_EQ: function(arrf, arrx){
            var u = mean(arrf),
                v = mean(arrx),
                sq_dev = [],
                devx = [],
	            i = 0;

            for (; i < arrf.length; i++) {
                sq_dev[i] = (arrf[i] - u) * (arrx[i] - v);
                devx[i] = Math.pow(arrx[i] - v, 2);
            }

	        var linear_eq_coeff = sum(sq_dev) / sum(devx),
                linear_eq_const = u - linear_eq_coeff * v;

            return Function("x", "return " + linear_eq_coeff + "*x+" + linear_eq_const);
        },
        EXP_REG_EQ: function(arrf, arrx){
            for (i = 0; i < arrf.length; i++) {
                (arrf[i] = Math.log(arrf[i]));
            }

            var u = mean(arrf),
                v = mean(arrx),
                sq_dev = [],
                devx = [],
	            i = 0;

            for (; i < arrf.length; i++) {
                sq_dev[i] = (arrf[i] - u) * (arrx[i] - v);
                devx[i] = Math.pow(arrx[i] - v, 2);
            }

            var exp_coeff = sum(sq_dev) / sum(devx),
                exp_const = Math.exp(u - exp_coeff * v);

            return Function("x", "return Math.exp(" + exp_coeff + "*x)*" + exp_const);
        },
        SECANTMETHOD: function(func, min, max, error, maxiter){
            var d,
	            n = 1;

            for (; n <= maxiter; n++) {
                var fmx = func(max);
                d = (max - min) / (fmx - func(min)) * fmx;
                if (Math.abs(d) < error) {

                    return max;
                }
                min = max;
                max = max - d;
            }

            return max;
        },
        FIVEPT: function(func, x, h){
            return (-func(x + h * 2) + 8 * func(x + h) - 8 * func(x - h) + func(x - h * 2)) / h / 12;
        },
        FCRIT: function(f, a, b){
            return advanced.PRECISION(advanced.SECANTMETHOD(Function("t", "return jQuery.sheet.advancedfn.FIVEPT(" + f + ",t,1e-3)"), a, b, 1e-13, 99999), 1e-12);
        },
        ASR: function(f, a, b, eps){
            var c = (a + b) / 2,
                h = (b - a) / 6,
                fa = f(a),
                fb = f(b),
                fc = f(c),
	            recursive_asr = function(f, a, b, c, eps, sum, fa, fb, fc){
	                var cl = (a + c) / 2,
	                    cr = (c + b) / 2,
	                    h = (c - a) / 6,
		                fcr = f(cr),
	                    fcl = f(cl),
	                    left = (fa + 4 * fcl + fc) * h,
	                    right = (fc + 4 * fcr + fb) * h;

	                if (Math.abs(left + right - sum) <= 15 * eps) {
	                    return left + right + (left + right - sum) / 15;
	                }

	                return recursive_asr(f, a, c, cl, eps / 2, left, fa, fc, fcl) + recursive_asr(f, c, b, cr, eps / 2, right, fc, fb, fcr);
	            };
            return advanced.PRECISION(recursive_asr(f, a, b, c, eps, h * (fa + fb + 4 * fc), fa, fb, fc), eps);
        }
	},
	i,
	fn = Sheet.fn;

	for(i in advanced) if (advanced.hasOwnProperty(i)) {
		fn[i] = advanced[i];
	}

	return advanced;
})();