$(function() {
	var r = Raphael('canvas', 1500, 1500), // Raphael instance
		s = 0, // Vertical space not available for canvas
		b = { // resource bundle
			en: {
				help: 'Help',
				bug: 'Report bug',
				git: 'GitHub repository'
			},
			sk: {
				help: 'Pomoc',
				bug: 'Nahlásiť chybu',
				git: 'GitHub repozitár'
			}
		},
		a = { // application actions
			bug: {
				icon: 61832
			},
			git: {
				icon: 61715
			}
		};
		
	$('#menubar').menubar(a); // Initialize menu bar
	
	$.i18n().load(b);
	//TODO implement detection of browser language preference
	$.i18n({locale: 'sk'});
	$('menu').each(function() {
		var $t = $(this);
		$t.text($.i18n($t.attr('label')));
	});
	$('.menucard span.c').each(function() {
		var $t = $(this);
		$t.text($.i18n($t.closest('a').attr('href').substring(1)));
	});
	
	s = $('#menubar').outerHeight(true);
	// Hook canvas height to window dimensions
	$(window).resize(function() {
		$('#canvas').height($(this).height() - s);
	}).resize();
});
