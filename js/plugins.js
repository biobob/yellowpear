(function($){
	
	$.fn.menubar = function(actions) {
		var $menubar = this;
		// append line break to clear fix floating elements
		$menubar.append('<br/>').children('menu').each(function(i) {
			var $menuCategory = $(this);
			function menuCategoryMouse() {
				// do nothing if menu category is already expanded
				if ($menuCategory.hasClass('unfold')) {
					return;
				}
				// focus self
				changeFocusTo($menuCategory);
				// if there was opened card then open it also for this menu category
				if (isSomeCardDisplayed()) {
					hideCards();
					$menuCategory.click();
				}
			}
			$menuCategory.click(function() {
				// get corresponding card
				var $card = $('#submenu-' + $menuCategory.index());
				// if menu category was expanded then close it
				if ($card.is(':visible')) {
					hideCards();
				} else {
					// mark menu category
					$menuCategory.addClass('unfold');
					// focus self - important for 
					changeFocusTo($menuCategory);
					$card.css({
						// cards are layoted as table
						display: 'table',
						// reposition card for case when menu category position is changed (e.g. due to caption change)
						top: $menuCategory.outerHeight() + 'px',
						left: $menuCategory.position().left + 'px'
					});
					// bind click elsewhere to close the card trigger
					$('body').bind('mousedown.menubar', function() {
						// do nothing when clicking on card or menu category
						if ($('div[id^=submenu-].hover:visible').length || $menuCategory.is('.hover.unfold:visible')) {
							return;
						}
						hideCards();
					});
				}
				// important for hiding card when clicking to expanded menu category
				return false;
			// to track mouse hover via CSS class - note hover doesn't always mean also focus
			}).hover(hover, hover)
			// steal focus back
			.mousemove(menuCategoryMouse).hover(menuCategoryMouse, function() {
				if (!$menuCategory.hasClass('unfold')) {
					clearFocus();
				}
			// wrap all menu items to special div and move it to the body tag	
			}).children().wrapAll('<div/>').parent()
				.attr('id', 'submenu-' + i)
				.addClass('menucard')
				.appendTo($('body'))
				.hover(hover, hover)
				.hide().children()
			// split horizontal line into 3 cells table layout - since colspan isnt't supported in CSS
			.filter('hr').replaceWith('<div class="separator"><span><hr></span><span><hr></span><span><hr></span></div>').end()
			// display links in table layout with 3 cells (icon, caption, keyboard shortcut)
			.filter('a').each(function() {
				var $item = $(this),
					action = actions[$item.attr('href').substring(1)];
				function itemMouse() {
					if (!$item.hasClass('disabled')) {
						changeFocusTo($item);
					}
				}
				// enhance link with attributes from action
				$item.addClass(action.disabled ? 'disabled' : '').html(
					'<span class="i">' + (action.icon ? String.fromCharCode(action.icon) : '') + '</span>' +
					'<span class="c">' + $item.text() + '</span>' +
					'<span><pre>' + (action.shortcut || '') + '</pre></span>'
				// steal focus back
				).mouseenter(itemMouse).mousemove(itemMouse).click(function() {
					if (!$item.hasClass('disabled') && $.isFunction(action.exec)) {
						hideCards();
						action.exec();
					}
					return false;
				});
			});
		});
		function hover() {
			$(this).toggleClass('hover');
		}
		function hideCards() {
			$('menu').removeClass('unfold');
			$('div[id^=submenu-]').hide();
			$('body').unbind('mousedown.menubar');
			clearFocus();
		}
		function getDisplayedCard() {
			return $('div[id^=submenu-]:visible');
		}
		function isSomeCardDisplayed() {
			return getDisplayedCard().length;
		}
		function getFocusedItem() {
			return $('.focus');
		}
		function clearFocus() {
			getFocusedItem().removeClass('focus');
		}
		function changeFocusTo(item) {
			if (item.length) {
				clearFocus();
				item.addClass('focus');
			}
		}
		$(document).bind('keydown', 'esc', function() {
			if (isSomeCardDisplayed()) {
				hideCards();
			} else if (getFocusedItem().length) {
				clearFocus();
			} else {
				changeFocusTo($('menu:first', $menubar));
			}
		}).bind('keydown', 'down', function() {
			var $item = getFocusedItem(),
				$card = getDisplayedCard();
			if (!$item.length) {
				return true;
			}
			if (!$card.length) {
				$card = $('#submenu-' + $item.click().index());
			}
			var $availableItems = $card.children('a:not(.disabled)');
			changeFocusTo(
				$item.parent()[0] === $menubar[0] || $item[0] === $availableItems.eq($availableItems.length - 1)[0] ?
				$availableItems.eq(0) :
				$availableItems.eq($availableItems.index($item) + 1)
			);
			return false;
		}).bind('keydown', 'up', function() {
			var $item = getFocusedItem(),
				$card = getDisplayedCard();
			if (!$item.length) {
				return true;
			}
			if (!$card.length) {
				$card = $('#submenu-' + $item.click().index());
			}
			var $availableItems = $card.children('a:not(.disabled)');
			changeFocusTo(
				$item.parent()[0] === $menubar[0] || $item[0] === $availableItems.eq(0)[0] ?
				$availableItems.eq($availableItems.length - 1):
				$availableItems.eq($availableItems.index($item) - 1)
			);
			return false;
		}).bind('keydown', 'right', function() {
			var $item = getFocusedItem(),
				$card = getDisplayedCard();
			if (!$item.length) {
				return true;
			}
			if ($card.length) {
				var $menuitem = $menubar.children('menu').eq($card.attr('id').substring(8));
				hideCards();
				if ($menuitem.is('menu:last')) {
					$menubar.children('menu:first').click();
				} else {
					$menuitem.next().click();
				}
			}
			if ($item.parent()[0] === $menubar[0]) {
				if ($item.is('menu:last')) {
					changeFocusTo($menubar.children('menu:first'));
				} else {
					changeFocusTo($item.next('menu'));
				}
			} else {
				changeFocusTo(getDisplayedCard().children('a:not(.disabled)').eq(0));
			}
			return false;
		}).bind('keydown', 'left', function() {
			var $item = getFocusedItem(),
				$card = getDisplayedCard();
			if (!$item.length) {
				return true;
			}
			if ($card.length) {
				var $menuitem = $menubar.children('menu').eq($card.attr('id').substring(8));
				hideCards();
				if ($menuitem.is('menu:first')) {
					$menubar.children('menu:last').click();
				} else {
					$menuitem.prev().click();
				}
			}
			if ($item.parent()[0] === $menubar[0]) {
				if ($item.is('menu:first')) {
					changeFocusTo($menubar.children('menu:last'));
				} else {
					changeFocusTo($item.prev('menu'));
				}
			} else {
				changeFocusTo(getDisplayedCard().children('a:not(.disabled)').eq(0));
			}
			return false;
		}).bind('keydown', 'return', function() {
			var $item = getFocusedItem();
			if (!$item.length) {
				return true;
			}
			$item.click();
			return false;
		});
		return $menubar;
	};
	
	/**
	 * jQuery Internationalization library
	 *
	 * Copyright (C) 2012 Santhosh Thottingal
	 *
	 * jquery.i18n is dual licensed GPLv2 or later and MIT. You don't have to do
	 * anything special to choose one license or the other and you don't have to
	 * notify anyone which license you are using. You are free to use
	 * UniversalLanguageSelector in commercial projects as long as the copyright
	 * header is left intact. See files GPL-LICENSE and MIT-LICENSE for details.
	 *
	 * @licence GNU General Public Licence 2.0 or later
	 * @licence MIT License
	 */
	var nav, I18N,
		slice = Array.prototype.slice;
	/**
	 * @constructor
	 * @param {Object} options
	 */
	I18N = function ( options ) {
		// Load defaults
		this.options = $.extend( {}, I18N.defaults, options );

		this.parser = this.options.parser;
		this.locale = this.options.locale;
		this.messageStore = this.options.messageStore;
		this.languages = {};

		this.init();
	};

	I18N.prototype = {
		/**
		 * Initialize by loading locales and setting up
		 * String.prototype.toLocaleString and String.locale.
		 */
		init: function () {
			var i18n = this;

			// Set locale of String environment
			String.locale = i18n.locale;

			// Override String.localeString method
			String.prototype.toLocaleString = function () {
				var localeParts, localePartIndex, value, locale, fallbackIndex,
					tryingLocale, message;

				value = this.valueOf();
				locale = i18n.locale;
				fallbackIndex = 0;

				while ( locale ) {
					// Iterate through locales starting at most-specific until
					// localization is found. As in fi-Latn-FI, fi-Latn and fi.
					localeParts = locale.toLowerCase().split( '-' );
					localePartIndex = localeParts.length;

					do {
						tryingLocale = localeParts.slice( 0, localePartIndex ).join( '-' );
						message = i18n.messageStore.get( tryingLocale, value );

						if ( message ) {
							return message;
						}

						localePartIndex--;
					} while ( localePartIndex );

					if ( locale === 'en' ) {
						break;
					}

					locale = ( $.i18n.fallbacks[i18n.locale] && $.i18n.fallbacks[i18n.locale][fallbackIndex] ) ||
						i18n.options.fallbackLocale;
					$.i18n.log( 'Trying fallback locale for ' + i18n.locale + ': ' + locale );

					fallbackIndex++;
				}

				// key not found
				return '';
			};
		},

		/*
		 * Destroy the i18n instance.
		 */
		destroy: function () {
			$.removeData( document, 'i18n' );
		},

		/**
		 * General message loading API This can take a URL string for
		 * the json formatted messages.
		 * <code>load('path/to/all_localizations.json');</code>
		 *
		 * This can also load a localization file for a locale <code>
		 * load('path/to/de-messages.json', 'de' );
		 * </code>
		 * A data object containing message key- message translation mappings
		 * can also be passed Eg:
		 * <code>
		 * load( { 'hello' : 'Hello' }, optionalLocale );
		 * </code> If the data argument is
		 * null/undefined/false,
		 * all cached messages for the i18n instance will get reset.
		 *
		 * @param {String|Object} source
		 * @param {String} locale Language tag
		 * @returns {jQuery.Promise}
		 */
		load: function ( source, locale ) {
			return this.messageStore.load( source, locale );
		},

		/**
		 * Does parameter and magic word substitution.
		 *
		 * @param {string} key Message key
		 * @param {Array} parameters Message parameters
		 * @return {string}
		 */
		parse: function ( key, parameters ) {
			var message = key.toLocaleString();
			// FIXME: This changes the state of the I18N object,
			// should probably not change the 'this.parser' but just
			// pass it to the parser.
			this.parser.language = $.i18n.languages[$.i18n().locale] || $.i18n.languages['default'];
			if( message === '' ) {
				message = key;
			}
			return this.parser.parse( message, parameters );
		}
	};

	/**
	 * Process a message from the $.I18N instance
	 * for the current document, stored in jQuery.data(document).
	 *
	 * @param {string} key Key of the message.
	 * @param {string} param1 [param...] Variadic list of parameters for {key}.
	 * @return {string|$.I18N} Parsed message, or if no key was given
	 * the instance of $.I18N is returned.
	 */
	$.i18n = function ( key, param1 ) {
		var parameters,
			i18n = $.data( document, 'i18n' ),
			options = typeof key === 'object' && key;

		// If the locale option for this call is different then the setup so far,
		// update it automatically. This doesn't just change the context for this
		// call but for all future call as well.
		// If there is no i18n setup yet, don't do this. It will be taken care of
		// by the `new I18N` construction below.
		// NOTE: It should only change language for this one call.
		// Then cache instances of I18N somewhere.
		if ( options && options.locale && i18n && i18n.locale !== options.locale ) {
			String.locale = i18n.locale = options.locale;
		}

		if ( !i18n ) {
			i18n = new I18N( options );
			$.data( document, 'i18n', i18n );
		}

		if ( typeof key === 'string' ) {
			if ( param1 !== undefined ) {
				parameters = slice.call( arguments, 1 );
			} else {
				parameters = [];
			}

			return i18n.parse( key, parameters );
		} else {
			// FIXME: remove this feature/bug.
			return i18n;
		}
	};

	$.fn.i18n = function () {
		var i18n = $.data( document, 'i18n' );
		String.locale = i18n.locale;
		if ( !i18n ) {
			i18n = new I18N();
			$.data( document, 'i18n', i18n );
		}

		return this.each( function () {
			var $this = $( this ),
				messageKey = $this.data( 'i18n' );

			if ( messageKey ) {
				$this.text( i18n.parse( messageKey ) );
			} else {
				$this.find( '[data-i18n]' ).i18n();
			}
		} );
	};

	String.locale = String.locale || $( 'html' ).attr( 'lang' );

	if ( !String.locale ) {
		if ( typeof window.navigator !== undefined ) {
			nav = window.navigator;
			String.locale = nav.language || nav.userLanguage || '';
		} else {
			String.locale = '';
		}
	}

	$.i18n.languages = {};
	$.i18n.messageStore = $.i18n.messageStore || {};
	$.i18n.parser = {
		// The default parser only handles variable substitution
		parse: function ( message, parameters ) {
			return message.replace( /\$(\d+)/g, function ( str, match ) {
				var index = parseInt( match, 10 ) - 1;
				return parameters[index] !== undefined ? parameters[index] : '$' + match;
			} );
		},
		emitter: {}
	};
	$.i18n.fallbacks = {};
	$.i18n.debug = false;
	$.i18n.log = function ( /* arguments */ ) {
		if ( window.console && $.i18n.debug ) {
			window.console.log.apply( window.console, arguments );
		}
	};
	/* Static members */
	I18N.defaults = {
		locale: String.locale,
		fallbackLocale: 'en',
		parser: $.i18n.parser,
		messageStore: $.i18n.messageStore
	};

	// Expose constructor
	$.i18n.constructor = I18N;
	
	var MessageStore = function () {
		this.messages = {};
		this.sources = {};
	};

	/**
	 * See https://github.com/wikimedia/jquery.i18n/wiki/Specification#wiki-Message_File_Loading
	 */
	MessageStore.prototype = {

		/**
		 * General message loading API This can take a URL string for
		 * the json formatted messages.
		 * <code>load('path/to/all_localizations.json');</code>
		 *
		 * This can also load a localization file for a locale <code>
		 * load( 'path/to/de-messages.json', 'de' );
		 * </code>
		 * A data object containing message key- message translation mappings
		 * can also be passed Eg:
		 * <code>
		 * load( { 'hello' : 'Hello' }, optionalLocale );
		 * </code> If the data argument is
		 * null/undefined/false,
		 * all cached messages for the i18n instance will get reset.
		 *
		 * @param {String|Object} source
		 * @param {String} locale Language tag
		 * @return {jQuery.Promise}
		 */
		load: function ( source, locale ) {
			var key = null,
				deferred = null,
				deferreds = [],
				messageStore = this;

			if ( typeof source === 'string' ) {
				// This is a URL to the messages file.
				$.i18n.log( 'Loading messages from: ' + source );
				deferred = jsonMessageLoader( source )
					.done( function ( localization ) {
						messageStore.set( locale, localization );
					} );

				return deferred.promise();
			}

			if ( locale ) {
				// source is an key-value pair of messages for given locale
				messageStore.set( locale, source );

				return $.Deferred().resolve();
			} else {
				// source is a key-value pair of locales and their source
				for ( key in source ) {
					if ( Object.prototype.hasOwnProperty.call( source, key ) ) {
						locale = key;
						// No {locale} given, assume data is a group of languages,
						// call this function again for each language.
						deferreds.push( messageStore.load( source[key], locale ) );
					}
				}
				return $.when.apply( $, deferreds );
			}

		},

		/**
		 * Set messages
		 * @param locale
		 * @param messages
		 */
		set: function( locale, messages ) {
			this.messages[locale] = messages;
		},

		/**
		 *
		 * @param locale
		 * @param messageKey
		 * @returns {Boolean}
		 */
		get: function ( locale, messageKey ) {
			return this.messages[locale] && this.messages[locale][messageKey];
		}
	};

	function jsonMessageLoader( url ) {
		return $.getJSON( url ).fail( function ( jqxhr, settings, exception ) {
			$.i18n.log( 'Error in loading messages from ' + url + ' Exception: ' + exception );
		} );
	}

	$.extend( $.i18n.messageStore, new MessageStore() );
	
	/*
	 * jQuery Hotkeys Plugin
	 * Copyright 2010, John Resig
	 * Dual licensed under the MIT or GPL Version 2 licenses.
	 *
	 * Based upon the plugin by Tzury Bar Yochay:
	 * http://github.com/tzuryby/hotkeys
	 *
	 * Original idea by:
	 * Binny V A, http://www.openjs.com/scripts/events/keyboard_shortcuts/
	 */
	jQuery.hotkeys = {
		version: "0.8",

		specialKeys: {
			8: "backspace", 9: "tab", 10: "return", 13: "return", 16: "shift", 17: "ctrl", 18: "alt", 19: "pause",
			20: "capslock", 27: "esc", 32: "space", 33: "pageup", 34: "pagedown", 35: "end", 36: "home",
			37: "left", 38: "up", 39: "right", 40: "down", 45: "insert", 46: "del", 
			96: "0", 97: "1", 98: "2", 99: "3", 100: "4", 101: "5", 102: "6", 103: "7",
			104: "8", 105: "9", 106: "*", 107: "+", 109: "-", 110: ".", 111 : "/", 
			112: "f1", 113: "f2", 114: "f3", 115: "f4", 116: "f5", 117: "f6", 118: "f7", 119: "f8", 
			120: "f9", 121: "f10", 122: "f11", 123: "f12", 144: "numlock", 145: "scroll", 186: ";", 191: "/",
			220: "\\", 222: "'", 224: "meta"
		},
	
		shiftNums: {
			"`": "~", "1": "!", "2": "@", "3": "#", "4": "$", "5": "%", "6": "^", "7": "&", 
			"8": "*", "9": "(", "0": ")", "-": "_", "=": "+", ";": ": ", "'": "\"", ",": "<", 
			".": ">",  "/": "?",  "\\": "|"
		}
	};

	function keyHandler( handleObj ) {
		if ( typeof handleObj.data === "string" ) {
			handleObj.data = { keys: handleObj.data };
		}

		// Only care when a possible input has been specified
		if ( !handleObj.data || !handleObj.data.keys || typeof handleObj.data.keys !== "string" ) {
			return;
		}

		var origHandler = handleObj.handler,
			keys = handleObj.data.keys.toLowerCase().split(" "),
			textAcceptingInputTypes = ["text", "password", "number", "email", "url", "range", "date", "month", "week", "time", "datetime", "datetime-local", "search", "color", "tel"];
	
		handleObj.handler = function( event ) {
			// Don't fire in text-accepting inputs that we didn't directly bind to
			if ( this !== event.target && (/textarea|select/i.test( event.target.nodeName ) ||
				jQuery.inArray(event.target.type, textAcceptingInputTypes) > -1 ) ) {
				return;
			}

			var special = jQuery.hotkeys.specialKeys[ event.keyCode ],
				// character codes are available only in keypress
				character = event.type === "keypress" && String.fromCharCode( event.which ).toLowerCase(),
				modif = "", possible = {};

			// check combinations (alt|ctrl|shift+anything)
			if ( event.altKey && special !== "alt" ) {
				modif += "alt+";
			}

			if ( event.ctrlKey && special !== "ctrl" ) {
				modif += "ctrl+";
			}
			
			// TODO: Need to make sure this works consistently across platforms
			if ( event.metaKey && !event.ctrlKey && special !== "meta" ) {
				modif += "meta+";
			}

			if ( event.shiftKey && special !== "shift" ) {
				modif += "shift+";
			}

			if ( special ) {
				possible[ modif + special ] = true;
			}

			if ( character ) {
				possible[ modif + character ] = true;
				possible[ modif + jQuery.hotkeys.shiftNums[ character ] ] = true;

				// "$" can be triggered as "Shift+4" or "Shift+$" or just "$"
				if ( modif === "shift+" ) {
					possible[ jQuery.hotkeys.shiftNums[ character ] ] = true;
				}
			}

			for ( var i = 0, l = keys.length; i < l; i++ ) {
				if ( possible[ keys[i] ] ) {
					return origHandler.apply( this, arguments );
				}
			}
		};
	}

	jQuery.each([ "keydown", "keyup", "keypress" ], function() {
		jQuery.event.special[ this ] = { add: keyHandler };
	});
	
})(jQuery);
