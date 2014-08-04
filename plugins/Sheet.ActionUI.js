var Sheet = Sheet || {};

/**
 * Creates the scrolling system used by each spreadsheet
 */
Sheet.ActionUI = (function(doc, win, math, $) {
    var Constructor = function(jS, enclosure, pane, sheet, max) {
        this.jS = jS;
        this.enclosure = enclosure;
        this.pane = pane;
        this.sheet = sheet;
        this.max = max;

        var scrollOuter = this.scrollUI = pane.scrollOuter = doc.createElement('div'),
            scrollInner = pane.scrollInner = doc.createElement('div'),
            scrollStyleX = pane.scrollStyleX = doc.createElement('style'),
            scrollStyleY = pane.scrollStyleY = doc.createElement('style'),
            $pane = $(pane),
            nthCss = this.nthCss;

        scrollOuter.setAttribute('class', jS.cl.scroll);
        scrollOuter.appendChild(scrollInner);

        scrollOuter.onscroll = function() {
            if (!jS.isBusy()) {
                jS.evt.scroll.scrollTo({axis:'x', pixel:scrollOuter.scrollLeft});
                jS.evt.scroll.scrollTo({axis:'y', pixel:scrollOuter.scrollTop});

                jS.autoFillerGoToTd();
                if (pane.inPlaceEdit) {
                    pane.inPlaceEdit.goToTd();
                }
            }
        };

        scrollOuter.onmousedown = function() {
            jS.obj.barHelper().remove();
        };

        jS.controls.scroll[jS.i] = $(scrollOuter)
            .disableSelectionSpecial();

        jS.controls.scrolls = jS.obj.scrolls().add(scrollOuter);

        scrollStyleX.updateStyle = function (indexes, style) {
            indexes = indexes || [];

            if (indexes.length != this.i || style) {
                this.i = indexes.length || this.i;

                style = style || nthCss('col', '#' + jS.id + jS.i, indexes, jS.frozenAt().col + 1) +
                    nthCss('td', '#' + jS.id + jS.i + ' ' + 'tr', indexes, jS.frozenAt().col + 1);

                this.css(style);

                jS.scrolledTo();

                if (indexes.length) {
                    jS.scrolledArea[jS.i].start.col = math.max(indexes.pop() || 1, 1);
                    jS.scrolledArea[jS.i].end.col = math.max(indexes.shift() || 1, 1);
                }

                jS.obj.barHelper().remove();
            }
        };

        scrollStyleY.updateStyle = function (indexes, style) {
            indexes = indexes || [];

            if (indexes.length != this.i || style) {
                this.i = indexes.length || this.i;

                style = style || nthCss('tr', '#' + jS.id + jS.i, indexes, jS.frozenAt().row + 1);

                this.css(style);

                jS.scrolledTo();

                if (indexes.length) {
                    jS.scrolledArea[jS.i].start.row = math.max(indexes.pop() || 1, 1);
                    jS.scrolledArea[jS.i].end.row = math.max(indexes.shift() || 1, 1);
                }

                jS.obj.barHelper().remove();
            }
        };

        pane.appendChild(scrollStyleX);
        pane.appendChild(scrollStyleY);

        this.styleUpdater(scrollStyleX);
        this.styleUpdater(scrollStyleY);

        jS.controls.bar.x.scroll[jS.i] = scrollStyleX;
        jS.controls.bar.y.scroll[jS.i] = scrollStyleY;

        var xStyle,
            yStyle,
            sheetWidth,
            sheetHeight,
            enclosureWidth,
            enclosureHeight,
            firstRow = sheet.tBody.children[0];

        pane.resizeScroll = function (justTouch) {
            if (justTouch) {
                xStyle = scrollStyleX.styleString();
                yStyle = scrollStyleY.styleString();
            } else {
                xStyle = (sheet.clientWidth <= enclosure.clientWidth ? '' : scrollStyleX.styleString());
                yStyle = (sheet.clientHeight <= enclosure.clientHeight ? '' : scrollStyleY.styleString());
            }

            scrollStyleX.updateStyle(null, ' ');
            scrollStyleY.updateStyle(null, ' ');

            sheetWidth = (firstRow.clientWidth || sheet.clientWidth) + 'px';
            sheetHeight = sheet.clientHeight + 'px';
            enclosureWidth = enclosure.clientWidth + 'px';
            enclosureHeight = enclosure.clientHeight + 'px';

            scrollInner.style.width = sheetWidth;
            scrollInner.style.height = sheetHeight;

            scrollOuter.style.width = enclosureWidth;
            scrollOuter.style.height = enclosureHeight;

            jS.evt.scroll.start('x', pane);
            jS.evt.scroll.start('y', pane);

            scrollStyleX.updateStyle(null, xStyle);
            scrollStyleY.updateStyle(null, yStyle);

            if (pane.inPlaceEdit) {
                pane.inPlaceEdit.goToTd();
            }
        };

        /*
         * Mousewheel rewrites itself the first time it is triggered in order to perform faster*/
        var chooseMouseWheel = function (e) {
            e = e || win.event;
            var mousewheel;
            if ("mousewheel" == e.type) {
                var div = function (a, b) {
                        return 0 != a % b ? a : a / b;
                    },
                    scrollNoXY = 1;
                if (e.wheelDeltaX !== u) {
                    mousewheel = function(e) {
                        e = e || win.event;
                        scrollOuter.scrollTop += div(-e.wheelDeltaY, scrollNoXY);
                        scrollOuter.scrollLeft += div(-e.wheelDeltaX, scrollNoXY);
                        return false;
                    };
                } else {
                    mousewheel = function(e) {
                        e = e || win.event;
                        scrollOuter.scrollTop += div(-e.wheelDelta, scrollNoXY);
                        return false;
                    };
                }
            } else {
                mousewheel = function(e) {
                    if (this.detail = (e.detail || e.deltaX || e.deltaY)) {
                        (9 < this.detail ? this.detail = 3 : -9 > this.detail && (this.detail = -3));
                        var top = 0, left = 0;
                        switch (this.detail) {
                            case 1:
                            case -1:
                                left = this.detail * 50;
                                break;
                            case 3:
                            case -3:
                                top = this.detail * 15;
                                break;
                        }

                        scrollOuter.scrollTop += top;
                        scrollOuter.scrollLeft += left;
                    }
                    return false;
                };
            }
            $pane.mousewheel(mousewheel);
            return false;
        };

        $pane.mousewheel(chooseMouseWheel);
    };

    Constructor.prototype = {
        /**
         * Repeats a string a number of times
         * @param {String} str
         * @param {Number} num
         * @memberOf jQuery.sheet
         * @returns {String}
         */
        repeat:function (str, num) {
            var result = '';
            while (num > 0) {
                if (num & 1) {
                    result += str;
                }
                num >>= 1;
                str += str;
            }
            return result;
        },


        /**
         * Creates css for an iterated element
         * @param {String} elementName
         * @param {String} parentSelectorString
         * @param {Array} indexes
         * @param {Number} min
         * @param {String} [css]
         * @returns {String}
         * @memberOf jQuery.sheet
         */
        nthCss:function (elementName, parentSelectorString, indexes, min, css) {
            //the initial call overwrites this function so that it doesn't have to check if it is IE or not

            var scrollTester = doc.createElement('div'),
                scrollItem1 = doc.createElement('div'),
                scrollItem2 = doc.createElement('div'),
                scrollStyle = doc.createElement('style');

            doc.body.appendChild(scrollTester);
            scrollTester.setAttribute('id', 'scrollTester');
            scrollTester.appendChild(scrollItem1);
            scrollTester.appendChild(scrollItem2);
            scrollTester.appendChild(scrollStyle);

            if (scrollStyle.styleSheet && !scrollStyle.styleSheet.disabled) {
                scrollStyle.styleSheet.cssText = '#scrollTester div:nth-child(2) { display: none; }';
            } else {
                scrollStyle.innerHTML = '#scrollTester div:nth-child(2) { display: none; }';
            }

            if (this.max) {//this is where we check IE8 compatibility
                this.nthCss = function (elementName, parentSelectorString, indexes, min, css) {
                    var style = [],
                        index = indexes.length,
                        repeat = this.repeat;

                    css = css || '{display: none;}';

                    do {
                        if (indexes[index] > min) {
                            style.push(parentSelectorString + ' ' + elementName + ':first-child' + repeat('+' + elementName, indexes[index] - 1));
                        }
                    } while (index--);

                    if (style.length) {
                        return style.join(',') + css;
                    }

                    return '';
                };
            } else {
                this.nthCss = function (elementName, parentSelectorString, indexes, min, css) {
                    var style = [],
                        index = indexes.length,
                        repeat = this.repeat;

                    css = css || '{display: none;}';

                    do {
                        if (indexes[index] > min) {
                            style.push(parentSelectorString + ' ' + elementName + ':nth-child(' + indexes[index] + ')');
                        }
                    } while (index--);

                    if (style.length) {
                        return style.join(',') + css;
                    }

                    return '';
                };
            }

            doc.body.removeChild(scrollTester);

            //this looks like a nested call, but will only trigger once, since the function is overwritten from the above
            return this.nthCss(elementName, parentSelectorString, indexes, min, css);
        },


        styleUpdater: function (style){
            if (style.styleSheet) {
                this.styleUpdater = function(style) {
                    style.css = function (css) {
                        this.styleSheet.disabled = false;//IE8 bug, for some reason in some scenarios disabled never becomes enabled.  And even setting here don't actually set it, it just ensures that is is set to disabled = false when the time is right
                        if (!this.styleSheet.disabled) {
                            this.styleSheet.cssText = css;
                        }
                    };
                    style.touch = function () {};
                    style.styleString = function() {
                        this.styleSheet.disabled = false;//IE8 bug, for some reason in some scenarios disabled never becomes enabled.  And even setting here don't actually set it, it just ensures that is is set to disabled = false when the time is right
                        if (!this.styleSheet.disabled) {
                            return this.styleSheet.cssText;
                        }
                        return '';
                    };
                }
            } else {
                this.styleUpdater = function(style) {
                    style.css = function (css) {
                        this.innerHTML = css;
                    };
                    style.touch = function () {
                        this.innerHTML = this.innerHTML + ' ';
                    };
                    style.styleString = function() {
                        return this.innerHTML;
                    };
                }
            }

            //this looks like a nested call, but will only trigger once, since the function is overwritten from the above
            this.styleUpdater(style);
        },

        hide:function (enclosure, pane, sheet) {
            pane || jS.obj.pane();

            var jS = this.jS,
                s = jS.s,
                toggleHideStyleX = doc.createElement('style'),
                toggleHideStyleY = doc.createElement('style'),
                hiddenRows,
                hiddenColumns,
                i,
                nthCss = this.nthCss;

            toggleHideStyleX.updateStyle = function (e) {
                var style = nthCss('col', '#' + jS.id + jS.i, jS.toggleHide.hiddenColumns[jS.i], 0) +
                    nthCss('td', '#' + jS.id + jS.i + ' tr', jS.toggleHide.hiddenColumns[jS.i], 0);

                this.css(style);

                jS.autoFillerGoToTd();
            };

            toggleHideStyleY.updateStyle = function (e) {
                var style = nthCss('tr', '#' + jS.id + jS.i, jS.toggleHide.hiddenRows[jS.i], 0);

                this.css(style);

                jS.autoFillerGoToTd();
            };

            jS.controls.toggleHide.x[jS.i] = $(toggleHideStyleX);
            jS.controls.toggleHide.y[jS.i] = $(toggleHideStyleY);

            pane.appendChild(toggleHideStyleX);
            pane.appendChild(toggleHideStyleY);

            this.styleUpdater(toggleHideStyleX);
            this.styleUpdater(toggleHideStyleY);

            s.hiddenColumns[jS.i] = s.hiddenColumns[jS.i] || [];
            s.hiddenRows[jS.i] = s.hiddenRows[jS.i] || [];

            if (!s.hiddenColumns[jS.i].length || !s.hiddenRows[jS.i].length) {
                hiddenRows = sheet.attributes['data-hiddenrows'] || {value:''};
                hiddenColumns = sheet.attributes['data-hiddencolumns'] || {value:''};
                s.hiddenRows[jS.i] = arrHelpers.toNumbers(hiddenRows.value.split(','));
                s.hiddenColumns[jS.i] = arrHelpers.toNumbers(hiddenColumns.value.split(','));
            }

            if (jS.s.hiddenRows[jS.i]) {
                i = jS.s.hiddenRows[jS.i].length - 1;
                if (i > -1) {
                    do {
                        jS.toggleHide.row(jS.s.hiddenRows[jS.i][i]);
                    } while (i--);
                }
            }

            if (s.hiddenColumns[jS.i]) {
                i = s.hiddenColumns[jS.i].length - 1;
                if (i > -1) {
                    do {
                        jS.toggleHide.column(s.hiddenColumns[jS.i][i]);
                    } while (i--);
                }
            }
        }
    };

    return Constructor;
})(document, window, Math, jQuery);