
<!DOCTYPE HTML>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta charset="utf-8" />
    <title>Rotate Demo</title>
    <meta name="Description" content="This is demo of Rotate jQuery plugin"/>
    <!--[if IE]>
    <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->
    <script src="http://code.jquery.com/jquery-1.7.1.min.js"></script>
    <script src="jquery.rotate.js"></script>
    <script>
$(function() {
	var img = $('img');
	function rotate() {
		img.animate({rotate: '360'}, 2000, 'linear', function() {
			rotate();
		});
	}
	rotate();
});
    </script>
<style>
body {
    overflow: hidden;
}
img {
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
	margin: auto;
	-webkit-transform: rotate(10deg);
	-moz-transform: rotate(10deg);
	transform: rotate(10deg);
}
</style>
</head>
<body>
<h1>jQuery Rotate Demo</h1>
<h2>Clipart taken from <a href="http://openclipart.org/detail/166347/sum-by-jimyeh">openclipart.org</a></h2>
	<img src="sun.png" style="transform:rotate(20)"/>
</body>
</html>
