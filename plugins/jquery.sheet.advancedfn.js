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
(function() {
    var jFNA = jQuery.sheet.advancedfn = {
        FACTORIAL: function(n){
            fact = 1;
            for (i = n; i > 0; i--)
                fact *= i;
            return fact;
        },
        COMBINATION: function(n, k){
           return jFNA.FACTORIAL(n) / jFNA.FACTORIAL(k) / jFNA.FACTORIAL(n - k);
        },
        PERMUTATION: function(n, r){
            return jFNA.FACTORIAL(n) / jFNA.FACTORIAL(n - r);
        },
        GAMMA: function(x){
            if (x > 0) {
                if (x != Math.floor(x)) {
                    var v = 1;
                    while (x < 8) {
                        v *= x;
                        x++;
                    }
                    var w = 1 / (x * x);
                    return exp(((((((((-3617 / 122400) * w + 7 / 1092) * w -
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
                    return jFNA.FACTORIAL(x - 1);
                }
            }
            return false;
        },
        PRECISION: function(x, eps){
            var dec = Math.pow(10, Math.floor(Math.log(1 / eps) * Math.LOG10E));
            return Math.round(dec * x) / dec;
        },
        MINIMUM: function(){
            var arr = jFNA.external.sanitize(arguments);

            var min = arr[0];
            for (i = 0; i < arr.length; i++) {
                if (arr[i] < min) {
                    min = arr[i];
                }
            }
            return min;
        },
        MODE: function(){
            var arr = jFNA.external.sanitize(arguments);

            var arrsort = arr.sort(function(a, b){
                return a - b;
            });
            var count = 1;
            var position = 0;
            var frequencies = [];
            var values = [];
            for (i = 0; i < arrsort.length; i++) {
                if (arrsort[i] == arrsort[i + 1]) {
                    count++;
                } else {
                    frequencies[position] = count;
                    values[position] = arrsort[i];
                    position++;
                    count = 1;
                }
            }

            var max = frequencies[0];
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
            var arr = jFNA.external.sanitize(arguments);

            var arrsort = arr.sort(function(a, b){
                return a - b;
            });
            return arrsort[Math.round((arr.length) / 2) - 1];
        },
        QUARTILES: function(){
            var arr = jFNA.external.sanitize(arguments);

            var arrsort = arr.sort(function sortNumber(a, b){
                return a - b;
            });
            return [arrsort[Math.round((arrsort.length) / 4) - 1], arrsort[Math.round((arrsort.length) / 2) - 1], arrsort[Math.round((arrsort.length) * 3 / 4) - 1]];
        },
        VARIANCE: function(){
            var arr = jFNA.external.sanitize(arguments);

            var sq_dev = [];
            var u = jFNA.external.mean(arr);
            for (i = 0; i < arr.length; i++) {
                sq_dev[i] = Math.pow(arr[i] - u, 2);
            }
            return jFNA.external.sum(sq_dev) / arr.length;
        },
        MEANDEV: function(){
            var arr = jFNA.external.sanitize(arguments);

            var dev = [];
            var u = jFNA.external.sum(arr);
            for (i = 0; i < arr.length; i++) {
                dev[i] = Math.abs(arr[i] - u);
            }

            return jFNA.external.sum(dev) / arr.length;
        },
        STDEV: function(){
            var arr = jFNA.external.sanitize(arguments),
                mean = jFNA.external.sum(arr) / arr.length,
                devs = [];

            for(key in arr) {
                devs[key] = Math.pow(arr[key] - mean, 2);
            }

            return Math.sqrt(jFNA.external.sum(devs) / (devs.length - 1));
        },
        COVARIANCE: function(arr1, arr2){
            var u = jFNA.external.mean(arr1);
            var v = jFNA.external.mean(arr2);
            var sq_dev = [];
            for (i = 0; i < arr1.length; i++) {
                sq_dev[i] = (arr1[i] - u) * (arr2[i] - v);
            }
            return jFNA.external.sum(sq_dev) / arr1.length;
        },
        CORR_COEFF: function(arr1, arr2){
            return jFNA.COVARIANCE(arr1, arr2) / jFNA.STDEV(arr1) / jFNA.STDEV(arr2);
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
            return jFNA.COMBINATION(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
        },
        BINOMIALCDF: function(n, p, x){
            if (x < 0) {
                return 0;
            }
            var binomarr = [];
            for (k = 0; k < n; k++)
                binomarr[k] = jFNA.BINOMIAL(n, p, k);
            if (x < n) {
                var sum = 0;
                for (i = 0; i <= x; i++)
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
                return jFNA.COMBINATION(x + r - 1, r - 1) * Math.pow(p, r) * Math.pow(1 - p, x);
            }
        },
        NEGBINCDF: function(n, p, x){
            if (x < 0) {
                return 0;
            }
            var sum = 0;
            for (k = 0; k <= x; k++) {
                sum += jFNA.NEGBIN(n, p, k);
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
                return jFNA.COMBINATION(m, x) * jFNA.COMBINATION((N - m), n - x) / jFNA.COMBINATION(N, n);
            }
        },
        HYPGEOMCDF: function(N, m, n, x){
            if (x < 0) {
                return 0;
            }
            var sum = 0;
            for (k = 0; k <= x; k++)
                sum += jFNA.HYPGEOM(N, m, n, k);
            return sum;
        },
        EXPONENTIALCDF: function(l, x){
            return 1 - Math.exp(-l * x);
        },
        POISSON: function(l, x){
            return Math.pow(l, x) * Math.exp(-l) / jFNA.FACTORIAL(x);
        },
        POISSONCDF: function(l, x){
            if (x < 0) {
                return 0;
            }
            var sum = 0;
            for (k = 0; k <= x; k++)
                sum += jFNA.POISSON(l, k);
            return sum;
        },
        NORMCDF: function(u, s, t){
            return jFNA.ASR(Function("x", "return Math.exp(-Math.pow(x-" + u + ",2)/Math.pow(" + s + ",2)/2)/" + s + "/Math.sqrt(2*Math.PI)"), 0, t, 1e-14);
        },
        LINEAR_REQ_EQ: function(arrf, arrx){
            var u = jFNA.external.mean(arrf);
            var v = jFNA.external.mean(arrx);
            var sq_dev = [];
            var devx = [];
            for (i = 0; i < arrf.length; i++) {
                sq_dev[i] = (arrf[i] - u) * (arrx[i] - v);
                devx[i] = Math.pow(arrx[i] - v, 2);
            }
            var linear_eq_coeff = jFNA.external.sum(sq_dev) / jFNA.external.sum(devx);
            var linear_eq_const = u - linear_eq_coeff * v;
            return Function("x", "return " + linear_eq_coeff + "*x+" + linear_eq_const);
        },
        EXP_REG_EQ: function(arrf, arrx){
            for (i = 0; i < arrf.length; i++) {
                (arrf[i] = Math.log(arrf[i]));
            }
            var u = jFNA.external.mean(arrf);
            var v = jFNA.external.mean(arrx);
            var sq_dev = [];
            var devx = [];
            for (i = 0; i < arrf.length; i++) {
                sq_dev[i] = (arrf[i] - u) * (arrx[i] - v);
                devx[i] = Math.pow(arrx[i] - v, 2);
            }
            var exp_coeff = jFNA.external.sum(sq_dev) / jFNA.external.sum(devx);
            var exp_const = Math.exp(u - exp_coeff * v);
            return Function("x", "return Math.exp(" + exp_coeff + "*x)*" + exp_const);
        },
        SECANTMETHOD: function(func, min, max, error, maxiter){
            var d;
            for (n = 1; n <= maxiter; n++) {
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
            return jFNA.PRECISION(jFNA.SECANTMETHOD(Function("t", "return jQuery.sheet.advancedfn.FIVEPT(" + f + ",t,1e-3)"), a, b, 1e-13, 99999), 1e-12);
        },
        ASR: function(f, a, b, eps){
            var c = (a + b) / 2;
            var h = (b - a) / 6;
            var fa = f(a);
            var fb = f(b);
            var fc = f(c);
            var recursive_asr = function(f, a, b, c, eps, sum, fa, fb, fc){
                var cl = (a + c) / 2;
                var cr = (c + b) / 2;
                var h = (c - a) / 6;
                var fcr = f(cr);
                var fcl = f(cl);
                var left = (fa + 4 * fcl + fc) * h;
                var right = (fc + 4 * fcr + fb) * h;
                if (Math.abs(left + right - sum) <= 15 * eps) {
                    return left + right + (left + right - sum) / 15;
                }
                return recursive_asr(f, a, c, cl, eps / 2, left, fa, fc, fcl) + recursive_asr(f, c, b, cr, eps / 2, right, fc, fb, fcr);
            };
            return jFNA.PRECISION(recursive_asr(f, a, b, c, eps, h * (fa + fb + 4 * fc), fa, fb, fc), eps);
        }
    };

    /*
        external is used for no conflict with internal functions used by the calculations engine,
    */
    jFNA.external = jQuery.sheet.advancedfn.external = {
        sum: function(arr){
            arr = this.sanitize(arr);
            var sum = 0;
            for (i = 0; i < arr.length; i++) {
                sum += arr[i];
            }
            return sum;
        },
        mean: function(arr){
            arr = this.sanitize(arr);
            return jFNA.external.sum(arr) / arr.length;
        },
        sanitize: function() {
            return arrHelpers.toNumbers(arguments);
        }
    };
})();