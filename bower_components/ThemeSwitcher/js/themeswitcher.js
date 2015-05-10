/* jQuery plugin themeswitcher
---------------------------------------------------------------------*/
$.fn.themeswitcher = function (settings) {
    var options = jQuery.extend({
        loadTheme: null,
        initialText: 'Switch Theme',
        width: 150,
        height: 200,
        buttonPreText: 'Theme: ',
        closeOnSelect: true,
        buttonHeight: 14,
        cookieName: 'jquery-ui-theme',
        onOpen: function () { },
        onClose: function () { },
        onSelect: function () { },
        includedThemes: { },
        excludedThemes: { },
        associatedThemes: { },
        defaultThemes: $.parseJSON('{"themes": [{ "name": "UI Lightness", "preview": "http://static.jquery.com/ui/themeroller/images/themeGallery/theme_30_ui_light.png", "css": "http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.2/themes/ui-lightness/jquery-ui.css"},' +
            '{ "name": "UI Darkness", "preview": "http://static.jquery.com/ui/themeroller/images/themeGallery/theme_30_ui_dark.png", "css": "http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.2/themes/ui-darkness/jquery-ui.css"},' +
            '{ "name": "Smoothness", "preview": "http://static.jquery.com/ui/themeroller/images/themeGallery/theme_30_smoothness.png", "css": "http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.2/themes/smoothness/jquery-ui.css"},' +
            '{ "name": "Start", "preview": "http://static.jquery.com/ui/themeroller/images/themeGallery/theme_30_start_menu.png", "css": "http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.2/themes/start/jquery-ui.css"},' +
            '{ "name": "Redmond", "preview": "http://static.jquery.com/ui/themeroller/images/themeGallery/theme_30_windoze.png", "css": "http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.2/themes/redmond/jquery-ui.css"},' +
            '{ "name": "Sunny", "preview": "http://static.jquery.com/ui/themeroller/images/themeGallery/theme_30_sunny.png", "css": "http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.2/themes/sunny/jquery-ui.css"},' +
            '{ "name": "Overcast", "preview": "http://static.jquery.com/ui/themeroller/images/themeGallery/theme_30_overcast.png", "css": "http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.2/themes/overcast/jquery-ui.css"},' +
            '{ "name": "Le Frog", "preview": "http://static.jquery.com/ui/themeroller/images/themeGallery/theme_30_le_frog.png", "css": "http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.2/themes/le-frog/jquery-ui.css"},' +
            '{ "name": "Flick", "preview": "http://static.jquery.com/ui/themeroller/images/themeGallery/theme_30_flick.png", "css": "http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.2/themes/flick/jquery-ui.css"},' +
            '{ "name": "Pepper Grinder", "preview": "http://static.jquery.com/ui/themeroller/images/themeGallery/theme_30_pepper_grinder.png", "css": "http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.2/themes/pepper-grinder/jquery-ui.css"},' +
            '{ "name": "Eggplant", "preview": "http://static.jquery.com/ui/themeroller/images/themeGallery/theme_30_eggplant.png", "css": "http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.2/themes/eggplant/jquery-ui.css"},' +
            '{ "name": "Dark Hive", "preview": "http://static.jquery.com/ui/themeroller/images/themeGallery/theme_30_dark_hive.png", "css": "http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.2/themes/dark-hive/jquery-ui.css"},' +
            '{ "name": "Cupertino", "preview": "http://static.jquery.com/ui/themeroller/images/themeGallery/theme_30_cupertino.png", "css": "http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.2/themes/cupertino/jquery-ui.css"},' +
            '{ "name": "South St", "preview": "http://static.jquery.com/ui/themeroller/images/themeGallery/theme_30_south_street.png", "css": "http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.2/themes/south-street/jquery-ui.css"},' +
            '{ "name": "Blitzer", "preview": "http://static.jquery.com/ui/themeroller/images/themeGallery/theme_30_blitzer.png", "css": "http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.2/themes/blitzer/jquery-ui.css"},' +
            '{ "name": "Humanity", "preview": "http://static.jquery.com/ui/themeroller/images/themeGallery/theme_30_humanity.png", "css": "http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.2/themes/humanity/jquery-ui.css"},' +
            '{ "name": "Hot Sneaks", "preview": "http://static.jquery.com/ui/themeroller/images/themeGallery/theme_30_hot_sneaks.png", "css": "http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.2/themes/hot-sneaks/jquery-ui.css"},' +
            '{ "name": "Excite Bike", "preview": "http://static.jquery.com/ui/themeroller/images/themeGallery/theme_30_excite_bike.png", "css": "http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.2/themes/excite-bike/jquery-ui.css"},' +
            '{ "name": "Vader", "preview": "http://static.jquery.com/ui/themeroller/images/themeGallery/theme_30_black_matte.png", "css": "http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.2/themes/vader/jquery-ui.css"},' +
            '{ "name": "Dot Luv", "preview": "http://static.jquery.com/ui/themeroller/images/themeGallery/theme_30_dot_luv.png", "css": "http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.2/themes/dot-luv/jquery-ui.css"},' +
            '{ "name": "Mint Choc", "preview": "http://static.jquery.com/ui/themeroller/images/themeGallery/theme_30_mint_choco.png", "css": "http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.2/themes/mint-choc/jquery-ui.css"},' +
            '{ "name": "Black Tie", "preview": "http://static.jquery.com/ui/themeroller/images/themeGallery/theme_30_black_tie.png", "css": "http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.2/themes/black-tie/jquery-ui.css"},' +
            '{ "name": "Trontastic", "preview": "http://static.jquery.com/ui/themeroller/images/themeGallery/theme_30_trontastic.png", "css": "http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.2/themes/trontastic/jquery-ui.css"},' +
            '{ "name": "Swanky Purse", "preview": "http://static.jquery.com/ui/themeroller/images/themeGallery/theme_30_swanky_purse.png", "css": "http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.2/themes/swanky-purse/jquery-ui.css"}]}')
    }, settings);

    function associateThemes(originalThemes, associatedThemes) {
        $(associatedThemes).each(function(i){
            var associatedTheme = this;
            $(originalThemes).filter(function(j){
                return this.name == associatedTheme.name;
			}).each(function(k) {
                this.associated = associatedTheme.css;
            });
		});
        return originalThemes;
    }
    
	function filterExcludedThemes(defaultThemes, excludedThemes) {
		$(excludedThemes).each(function(i){
			var excludedTheme = this;
			defaultThemes = $.grep(defaultThemes, function(j){
				return j.name != excludedTheme;
			});
		});
		return defaultThemes;
	}
    
	options.defaultThemes = filterExcludedThemes(options.defaultThemes.themes, options.excludedThemes);
	
    options.defaultThemes = associateThemes(options.defaultThemes, options.associatedThemes);
    options.includedThemes = associateThemes(options.includedThemes, options.associatedThemes);
        
    //theme option template
    $.template('themeTemplate', '<li><a href="${css}" associated="${associated}"><img src="${preview}" alt="${name}" title="${name}" /><span class="themeName">${name}</span></a></li>');

    //markup 
    var button = $('<a href="#" class="jquery-ui-themeswitcher-trigger"><span class="jquery-ui-themeswitcher-icon"></span><span class="jquery-ui-themeswitcher-title">' + options.initialText + '</span></a>');
    var switcherpane = $('<div class="jquery-ui-themeswitcher"><div id="themeGallery">	<ul></ul></div></div>');

    if (options.includedThemes === undefined || options.includedThemes.length > 0)
        $.tmpl('themeTemplate', options.includedThemes).appendTo($(switcherpane).find('#themeGallery ul'));
    
    if (options.defaultThemes  === undefined || options.defaultThemes.length > 0)
        $.tmpl('themeTemplate', options.defaultThemes).appendTo($(switcherpane).find('#themeGallery ul'));    

    switcherpane.find('div').removeAttr('id');

    //button events
    button.click(
		function () {
		    if (switcherpane.is(':visible')) { switcherpane.spHide(); }
		    else { switcherpane.spShow(); }
		    return false;
		}
	);

    //menu events (mouseout didn't work...)
    switcherpane.hover(
		function () { },
		function () { if (switcherpane.is(':visible')) { $(this).spHide(); } }
	);

    //show/hide panel functions
    $.fn.spShow = function () { $(this).css({ top: button.offset().top + options.buttonHeight + 6, left: button.offset().left }).slideDown(50); button.css(button_active); options.onOpen(); };
    $.fn.spHide = function () { $(this).slideUp(50, function () { options.onClose(); }); button.css(button_default); };


    /* Theme Loading
    ---------------------------------------------------------------------*/
    switcherpane.find('a').click(function () {
        updateCSS($(this).attr('href'), 'main');
        updateCSS($(this).attr('associated'), 'associated');
        var themeName = $(this).find('span').text();
        button.find('.jquery-ui-themeswitcher-title').text(options.buttonPreText + themeName);
        $.cookie(options.cookieName, themeName);
        options.onSelect();
        if (options.closeOnSelect && switcherpane.is(':visible')) { switcherpane.spHide(); }
        return false;
    });

    //function to append a new theme stylesheet with the new style changes
    function updateCSS(locStr, type) {
        $("link.ui-theme." + type +":first").remove();
        
        if (locStr === undefined || locStr.length === 0)
            return;
        var cssLink = $('<link href="' + locStr + '" type="text/css" rel="Stylesheet" class="ui-theme ' + type + '" />');
        
        $("head").append(cssLink);        
    }    
	
    /* Inline CSS 
    ---------------------------------------------------------------------*/
    var button_default = {
        fontFamily: 'Trebuchet MS, Verdana, sans-serif',
        fontSize: '11px',
        color: '#666',
        background: '#eee url(http://jqueryui.com/themeroller/themeswitchertool/images/buttonbg.png) 50% 50% repeat-x',
        border: '1px solid #ccc',
        '-moz-border-radius': '6px',
        '-webkit-border-radius': '6px',
        textDecoration: 'none',
        padding: '3px 3px 3px 8px',
        width: options.width - 11, //minus must match left and right padding 
        display: 'block',
        height: options.buttonHeight,
        outline: '0'
    };
    var button_hover = {
        'borderColor': '#bbb',
        'background': '#f0f0f0',
        cursor: 'pointer',
        color: '#444'
    };
    var button_active = {
        color: '#aaa',
        background: '#000',
        border: '1px solid #ccc',
        borderBottom: 0,
        '-moz-border-radius-bottomleft': 0,
        '-webkit-border-bottom-left-radius': 0,
        '-moz-border-radius-bottomright': 0,
        '-webkit-border-bottom-right-radius': 0,
        outline: '0'
    };



    //button css
    button.css(button_default)
	.hover(
		function () {
		    $(this).css(button_hover);
		},
		function () {
		    if (!switcherpane.is(':animated') && switcherpane.is(':hidden')) { $(this).css(button_default); }
		}
	)
	.find('.jquery-ui-themeswitcher-icon').css({
	    float: 'right',
	    width: '16px',
	    height: '16px',
	    background: 'url(http://jqueryui.com/themeroller/themeswitchertool/images/icon_color_arrow.gif) 50% 50% no-repeat'
	});
    //pane css
    switcherpane.css({
        position: 'absolute',
        float: 'left',
        fontFamily: 'Trebuchet MS, Verdana, sans-serif',
        fontSize: '12px',
        background: '#000',
        color: '#fff',
        padding: '8px 3px 3px',
        border: '1px solid #ccc',
        '-moz-border-radius-bottomleft': '6px',
        '-webkit-border-bottom-left-radius': '6px',
        '-moz-border-radius-bottomright': '6px',
        '-webkit-border-bottom-right-radius': '6px',
        borderTop: 0,
        zIndex: 999999,
        width: options.width - 6//minus must match left and right padding
    })
	.find('ul').css({
	    listStyle: 'none',
	    margin: '0',
	    padding: '0',
	    overflow: 'auto',
	    height: options.height
	}).end()
	.find('li').hover(
		function () {
		    $(this).css({
		        'borderColor': '#555',
		        'background': 'url(http://jqueryui.com/themeroller/themeswitchertool/images/menuhoverbg.png) 50% 50% repeat-x',
		        cursor: 'pointer'
		    });
		},
		function () {
		    $(this).css({
		        'borderColor': '#111',
		        'background': '#000',
		        cursor: 'auto'
		    });
		}
	).css({
	    width: options.width - 30,
	    height: '',
	    padding: '2px',
	    margin: '1px',
	    border: '1px solid #111',
	    '-moz-border-radius': '4px',
	    clear: 'left',
	    float: 'left'
	}).end()
	.find('a').css({
	    color: '#aaa',
	    textDecoration: 'none',
	    float: 'left',
	    width: '100%',
	    outline: '0'
	}).end()
	.find('img').css({
	    float: 'left',
	    border: '1px solid #333',
	    margin: '0 2px'
	}).end()
	.find('.themeName').css({
	    float: 'left',
	    margin: '3px 0'
	}).end();



    $(this).append(button);
    $('body').append(switcherpane);
    switcherpane.hide();
    if ($.cookie(options.cookieName) || options.loadTheme) {
        var themeName = $.cookie(options.cookieName) || options.loadTheme;
        switcherpane.find('a:contains(' + themeName + ')').trigger('click');
    }

    return this;
};




/**
* Cookie plugin
*
* Copyright (c) 2006 Klaus Hartl (stilbuero.de)
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
*
*/
jQuery.cookie = function (name, value, options) {
    if (typeof value != 'undefined') { // name and value given, set cookie
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        // CAUTION: Needed to parenthesize options.path and options.domain
        // in the following expressions, otherwise they evaluate to undefined
        // in the packed version for some reason...
        var path = options.path ? '; path=' + (options.path) : '';
        var domain = options.domain ? '; domain=' + (options.domain) : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else { // only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};