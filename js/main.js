$(function() {
	var r = Raphael('canvas', 1500, 1500);
	
	$('#menubar').menubar();
	
	$(window).resize(function() {
    	$('#canvas').height($(this).height() - $('#menubar').outerHeight(true));    
	}).resize();
});
