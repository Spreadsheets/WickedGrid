
/**
 * Creates the scrolling system used by each spreadsheet
 */
Sheet.ActionUI = (function(document, window, Math, Number, MouseWheel, $) {
    var Constructor = function(jS, enclosure, pane, sheet, cl, max) {
        this.jS = jS;
        this.enclosure = enclosure;
        this.pane = pane;
        this.sheet = sheet;
        this.max = max;

        var that = this,
            scrollOuter = this.scrollUI = pane.scrollOuter = document.createElement('div'),
            scrollInner = pane.scrollInner = document.createElement('div'),
            scrollStyleX = pane.scrollStyleX = new Sheet.StyleUpdater(),
            scrollStyleY = pane.scrollStyleY = new Sheet.StyleUpdater(),
            nthCss = this.nthCss;

        scrollOuter.setAttribute('class', cl);
        scrollOuter.appendChild(scrollInner);

        scrollOuter.onscroll = function() {
            if (!jS.isBusy()) {
                that.scrollTo({axis:'x', pixel:scrollOuter.scrollLeft});
                that.scrollTo({axis:'y', pixel:scrollOuter.scrollTop});

                jS.autoFillerGoToTd();
                if (pane.inPlaceEdit) {
                    pane.inPlaceEdit.goToTd();
                }
            }
        };

        scrollOuter.onmousedown = function() {
            jS.obj.barHelper().remove();
        };

        $(scrollOuter)
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
                    jS.scrolledArea[jS.i].start.col = Math.max(indexes.pop() || 1, 1);
                    jS.scrolledArea[jS.i].end.col = Math.max(indexes.shift() || 1, 1);
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
                    jS.scrolledArea[jS.i].start.row = Math.max(indexes.pop() || 1, 1);
                    jS.scrolledArea[jS.i].end.row = Math.max(indexes.shift() || 1, 1);
                }

                jS.obj.barHelper().remove();
            }
        };

        pane.appendChild(scrollStyleX.styleElement);
        pane.appendChild(scrollStyleY.styleElement);

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

            that.scrollStart('x', pane);
            that.scrollStart('y', pane);

            scrollStyleX.updateStyle(null, xStyle);
            scrollStyleY.updateStyle(null, yStyle);

            if (pane.inPlaceEdit) {
                pane.inPlaceEdit.goToTd();
            }
        };

        new MouseWheel(pane, scrollOuter);
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

            var scrollTester = document.createElement('div'),
                scrollItem1 = document.createElement('div'),
                scrollItem2 = document.createElement('div'),
                scrollStyle = document.createElement('style');

            document.body.appendChild(scrollTester);
            scrollTester.setAttribute('id', 'scrollTester');
            scrollTester.appendChild(scrollItem1);
            scrollTester.appendChild(scrollItem2);
            scrollTester.appendChild(scrollStyle);

            if (scrollStyle.styleSheet && !scrollStyle.styleSheet.disabled) {
                scrollStyle.styleSheet.cssText = '#scrollTester div:nth-child(2) { display: none; }';
            } else {
                scrollStyle.innerHTML = '#scrollTester div:nth-child(2) { display: none; }';
            }

            if ($.sheet.max) {//this is where we check IE8 compatibility
                Constructor.prototype.nthCss = function (elementName, parentSelectorString, indexes, min, css) {
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
                Constructor.prototype.nthCss = function (elementName, parentSelectorString, indexes, min, css) {
                    var style = [],
                        index = indexes.length;

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

            document.body.removeChild(scrollTester);

            //this looks like a nested call, but will only trigger once, since the function is overwritten from the above
            return Constructor.prototype.nthCss(elementName, parentSelectorString, indexes, min, css);
        },

        touch: function() {
            this.toggleHideStyleX.touch();
        },
        hide:function () {
            var jS = this.jS,
                s = jS.s,
                toggleHideStyleX = this.toggleHideStyleX = new Sheet.StyleUpdater(),
                toggleHideStyleY = this.toggleHideStyleY = new Sheet.StyleUpdater(),
                hiddenRows,
                hiddenColumns,
                i,
                nthCss = this.nthCss,
                pane = this.pane,
                sheet = this.sheet;

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

            pane.appendChild(toggleHideStyleX.styleElement);
            pane.appendChild(toggleHideStyleY.styleElement);

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
        },
        remove: function() {

        },

        scrollAxis: {
            x:{},y:{}
        },

        scrollSize: {},

        scrollTd: null,

        /**
         * prepare everything needed for a scroll, needs activated every time spreadsheet changes in size
         * @param {String} axisName x or y
         * @memberOf jS.evt.scroll
         */
        scrollStart:function (axisName) {
            var jS = this.jS,
                pane = this.pane,
                outer = this.pane.scrollOuter,
                axis = this.scrollAxis[axisName],
                size = this.scrollSize = jS.sheetSize(pane.table);

            jS.autoFillerHide();

            this.scrollTd = jS.obj.tdActive();

            axis.v = [];
            axis.name = axisName;

            switch (axisName || 'x') {
                case 'x':
                    axis.max = size.cols;
                    axis.min = 0;
                    axis.size = size.cols;
                    pane.scrollStyleX.updateStyle();
                    axis.scrollStyle = pane.scrollStyleX;
                    axis.area = outer.scrollWidth - outer.clientWidth;
                    axis.sheetArea = pane.table.clientWidth - pane.table.corner.clientWidth;
                    axis.scrollUpdate = function () {
                        outer.scrollLeft = (axis.value) * (axis.area / axis.size);
                    };
                    axis.gridSize = 100 / axis.size;
                    break;
                case 'y':
                    axis.max = size.rows;
                    axis.min = 0;
                    axis.size = size.rows;
                    pane.scrollStyleY.updateStyle();
                    axis.scrollStyle = pane.scrollStyleY;
                    axis.area = outer.scrollHeight - outer.clientHeight;
                    axis.sheetArea = pane.table.clientHeight - pane.table.corner.clientHeight;
                    axis.scrollUpdate = function () {
                        outer.scrollTop = (axis.value) * (axis.area / axis.size);
                    };
                    axis.gridSize = 100 / axis.size;
                    break;
            }

            var i = axis.max;

            do {
                var position = new Number(axis.gridSize * i);
                position.index = i + 1;
                axis.v.unshift(position);
            } while(i--);
        },

        /**
         * Scrolls to a position within the spreadsheet
         * @param {Object} pos {axis, value, pixel} if value not set, pixel is used
         * @memberOf jS.evt.scroll
         */
        scrollTo:function (pos) {
            pos = pos || {};
            pos.axis = pos.axis || 'x';
            pos.value = pos.value || 0;
            pos.pixel = pos.pixel || 0;

            if (!this.scrollAxis) {
                this.scrollStart(pos.axis);
            }
            var me = this.scrollAxis[pos.axis];

            if (!pos.value) {
                pos.value = arrHelpers.closest(me.v, Math.abs(pos.pixel / me.area) * 100, me.min).index;
            }

            pos.max = pos.max || me.max;

            var i = ((pos.value > pos.max ? pos.max : pos.value) - me.min),
                indexes = [];

            if (i >= 0) {
                do {
                    indexes.push(i + me.min);
                } while(i-- > 0);
            }
            if (indexes.length) {
                if (me.scrollStyle) me.scrollStyle.updateStyle(indexes);
            } else {
                if (me.scrollStyle) me.scrollStyle.updateStyle();
            }

            me.value = pos.value;
        },

        /**
         * Called after scroll is done
         * @memberOf jS.evt.scroll
         */
        scrollStop:function () {
            if (this.scrollAxis.x.scrollUpdate) this.scrollAxis.x.scrollUpdate();
            if (this.scrollAxis.y.scrollUpdate) this.scrollAxis.y.scrollUpdate();

            if (this.scrollTd) {
                this.scrollTd = null;
                this.jS.autoFillerGoToTd();
            }
        }

    };

    return Constructor;
})(document, window, Math, Number, MouseWheel, $);