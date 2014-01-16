<!DOCTYPE html>
<html lang="<?php echo  substr($_SERVER['HTTP_ACCEPT_LANGUAGE'], 0, 2); ?>">
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<title>YellowPear</title>
	<meta name="viewport" content="width=device-width, initial-scale=1">
	
	<link rel="stylesheet" href="css/main.css">
</head>
<body>
	<div id="menubar" style="display: none;">
		<menu label="help">
			<a href="#bug"></a>
			<a href="#git"></a>
			<hr>
			<a href="#about"></a>
		</menu>
	</div>
	<div id="canvas">
	</div>
	
	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
	<script src="http://cdnjs.cloudflare.com/ajax/libs/raphael/2.1.0/raphael-min.js"></script>
	<script>
		window.jQuery || document.write('<script src="js/vendor/jquery-1.10.2.min.js"><\/script>');
		window.Raphael || document.write('<script src="js/vendor/jquery-raphael-2.1.2.min.js"><\/script>');
	</script>
	<script src="js/plugins.js"></script>
	<script src="js/main.js"></script>
</body>
</html>