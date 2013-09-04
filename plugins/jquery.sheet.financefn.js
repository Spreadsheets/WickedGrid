/**
 * @project jQuery.sheet() The Ajax Spreadsheet - http://code.google.com/p/jquerysheet/
 * @author RobertLeePlummerJr@gmail.com
 * $Id: jquery.sheet.financefn.js 941 2013-09-03 22:01:04Z robertleeplummerjr $
 * Licensed under MIT
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */
(function(jFN){
    var nAN = NaN;

    var jSF = jQuery.sheet.financefn = {
        NPV: function(rate) {
            rate = rate * 1;
            var factor = 1,
                sum = 0,
                result;

            for(var i = 1; i < arguments.length; i++) {
                var factor = factor * (1 + rate);
                sum += arguments[i] / factor;
            }

            result = new Number(sum);

            result.html = Globalize.format( sum, "c" );
            return result;
        },
        PV: function(rate, nper, pmt, fv, type) {
            fv = fv || 0;
            type = type || 0;

            var pv,
                result;
            if (rate != 0) {
                pv = (-pmt * (1 + rate * type) * ((Math.pow(1 + rate, nper) - 1) / rate) - fv) / Math.pow(1 + rate, nper);
            } else {
                pv = -fv - pmt * nper;
            }

            result = new Number(pv);
            result.html = Globalize.format( pv, "c" );
            return result;
        },
        RATE: function(nper, pmt, pv, fv, type, estimate) {
            fv = fv || 0;
            type = type || 0;
            estimate = estimate || 0.1;

            var rate = estimate, y = 0, f = 0,
                FINANCIAL_MAX_ITERATIONS = 128,
                FINANCIAL_PRECISION = 1.0e-08,
                result;

            if (Math.abs(rate) < FINANCIAL_PRECISION) {
                y = pv * (1 + nper * rate) + pmt * (1 + rate * type) * nper + fv;
            } else {
                f = Math.exp(nper * Math.log(1 + rate));
                y = pv * f + pmt * (1 / rate + type) * (f - 1) + fv;
            }
            var y0 = pv + pmt * nper + fv,
                y1 = pv * f + pmt * (1 / rate + type) * (f - 1) + fv;

            // find root by secant method
            var i = 0, x0 = 0,
                x1 = rate;
            while ((Math.abs(y0 - y1) > FINANCIAL_PRECISION) && (i < FINANCIAL_MAX_ITERATIONS)) {
                rate = (y1 * x0 - y0 * x1) / (y1 - y0);
                x0 = x1;
                x1 = rate;

                if (Math.abs(rate) < FINANCIAL_PRECISION) {
                    y = pv * (1 + nper * rate) + pmt * (1 + rate * type) * nper + fv;
                } else {
                    f = Math.exp(nper * Math.log(1 + rate));
                    y = pv * f + pmt * (1 / rate + type) * (f - 1) + fv;
                }

                y0 = y1;
                y1 = y;
                ++i;
            }

            result = new Number(rate);
            result.html = Globalize.format( rate, "p" );
            return result;
        },
        IPMT: function(rate, per, nper, pv, fv, type) {
            var pmt = jFN.PMT(rate, nper, pv, fv, type),
                fv = jFN.FV(rate, per - 1, pmt, pv, type),
                result = fv * rate;

            // account for payments at beginning of period versus end.
            if (type) {
                result /= (1 + rate);
            }

            result = new Number(result);
            result.html = Globalize.format( result, "c" );
            return result;
        },
        PMT: function(rate, nper, pv, fv, type){
            rate = parseFloat(rate || 0);
            nper = parseFloat(nper || 0);
            pv = parseFloat(pv || 0);
            fv = fv || 0;
            type = type || 0;

            // pmt = rate / ((1 + rate)^N - 1) * -(pv * (1 + r)^N + fv)
            var pmt = (rate / (Math.pow(1 + rate, nper) - 1)
                * -(pv * Math.pow(1 + rate, nper) + fv)),
                result;
            // account for payments at beginning of period versus end.
            if (type == 1) {
                pmt = pmt / (1 + rate);
            }

            result = new Number(pmt);
            result.html = Globalize.format( pmt, "c" );
            return result;
        },
        NPER: function(rate, pmt, pv, fv, type) { //Taken from LibreOffice - http://opengrok.libreoffice.org/xref/core/sc/source/core/tool/interpr2.cxx#1382 ScInterpreter::ScZZR()
            var log,
                result;
            rate = parseFloat(rate || 0);
            pmt = parseFloat(pmt || 0);
            pv = parseFloat(pv || 0);
            fv = (fv || 0);
            type = (type || 0);

            log = function(prim) {
                if (isNaN(prim)) {
                    return Math.log(0);
                }
                var num = Math.log(prim);
                return num;
            }

            if (rate == 0.0) {
                result = (-(pv + fv)/pmt);
            } else if (type > 0.0) {
                result = (log(-(rate*fv-pmt*(1.0+rate))/(rate*pv+pmt*(1.0+rate)))/(log(1.0+rate)));
            } else {
                result = (log(-(rate*fv-pmt)/(rate*pv+pmt))/(log(1.0+rate)));
            }

            if (isNaN(result)) {
                result = 0;
            }

            return result;
        },
        FV: function(rate, nper, pmt, pv, type) { //not working yet
            pv = (pv ? pv : 0);
            type = (type ? type : 0);
            var resultPrimitive = -(
                pv*Math.pow(1.0+rate, nper)
                    + pmt * (1.0 + rate*type)
                    * (Math.pow(1.0+rate, nper) - 1.0) / rate
                    ),
                result = new Number(resultPrimitive);

            result.html = Globalize.format( resultPrimitive, "c" );
            return result;
        }
    };
})(jQuery.sheet.fn);