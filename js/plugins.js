(function($){
	
	function hover() {
		$(this).toggleClass('hover');
	}
	
	$.fn.menubar = function(actions) {
		return this.append('<br/>').children('menu').each(function(i) {
			var $menuCategory = $(this);
			$menuCategory.click(function() {
				var $card = $('#submenu-' + $(this).index());
				if ($card.is(':visible')) {
					$menuCategory.removeClass('unfold');
					$card.hide();
					$('body').unbind('mousedown.menubar');
				} else {
					$menuCategory.addClass('unfold');
					$card.css({
						// menu links are displayed as table
						display: 'table',
						// reposition card for case when menu category change position due to caption change
						top: $menuCategory.outerHeight() + 'px',
						left: $menuCategory.position().left + 'px'
					});
					$('body').bind('mousedown.menubar', function() {
						if ($('div[id^=submenu-].hover:visible').length || $('#menubar > menu.hover.unfold:visible').length) {
							return false;
						}
						$('menu').removeClass('unfold');
						$('div[id^=submenu-]').hide();
						$(this).unbind('mousedown.menubar');
					});
				}
				return false;
			}).hover(hover, hover)
			.mouseenter(function() {
				var $cards = $('div[id^=submenu-]');
				if ($(':visible', $cards).length) {
					$('body').unbind('mousedown.menubar');
					$('menu').removeClass('unfold');
					$cards.hide();
					$(this).click();
				}
			}).children().filter('a').each(function() {
				var $item = $(this),
					action = actions[$item.attr('href').substring(1)];
				$item.addClass(action.disabled ? 'disabled' : '').html(
					'<span class="i">' + (action.icon ? String.fromCharCode(action.icon) : '') + '</span>' +
					'<span class="c">' + $item.text() + '</span>' +
					'<span><pre>' + (action.shortcut || '') + '</pre></span>'
				);
			}).wrapAll('<div/>').parent()
				.attr('id', 'submenu-' + i)
				.addClass('menucard')
				.css({top: $menuCategory.outerHeight() + 'px', left: $menuCategory.position().left + 'px'})
				.appendTo($('body'))
				.hover(hover, hover)
				.hide();
		}).end();
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
	
})(jQuery);
