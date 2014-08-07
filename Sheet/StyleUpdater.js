
Sheet.StyleUpdater = (function(document) {
    function Constructor() {
        var el = document.createElement('style');
        this.styleElement = el;
        el.styleUpdater = this;
    }

    //ie
    if (document.createElement('style').styleSheet) {
        Constructor.prototype = {
            css: function (css) {
                var el = this.styleElement,
                    ss = el.styleSheet;

                ss.disabled = false;//IE8 bug, for some reason in some scenarios disabled never becomes enabled.  And even setting here don't actually set it, it just ensures that is is set to disabled = false when the time is right
                if (!ss.disabled) {
                    ss.cssText = css;
                }
            },
            touch: function () {},
            styleString: function() {
                var el = this.styleElement,
                    ss = el.styleSheet;

                ss.disabled = false;//IE8 bug, for some reason in some scenarios disabled never becomes enabled.  And even setting here don't actually set it, it just ensures that is is set to disabled = false when the time is right
                if (!ss.disabled) {
                    return ss.cssText;
                }
                return '';
            }
        };
    } else {
        //standard
        Constructor.prototype = {
            css: function (css) {
                this.styleElement.innerHTML = css;
            },
            touch: function () {
                var el = this.styleElement;

                el.innerHTML = el.innerHTML + ' ';
            },
            styleString: function() {
                return this.styleElement.innerHTML;
            }
        };
    }

    return Constructor;
})(document);