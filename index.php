<?php include 'functions.php'; ?>
<!DOCTYPE html>
<html>
<head>
	<title>FullStream</title>
	<meta charset="utf-8">
	<meta http-equiv="cache-control" content="max-age=0" />
	<meta http-equiv="cache-control" content="no-cache" />
	<meta http-equiv="cache-control" content="no-store" />
	<meta http-equiv="expires" content="-1" />
	<meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT" />
	<meta http-equiv="pragma" content="no-cache" />
	<link rel="icon" type="image/png" href="images/favico.png" />
	<link rel="stylesheet" type="text/css" href="style.css?version=<?php echo $intel['version']; ?>" />
	<link href="//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css" rel="stylesheet">
	<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
	<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.3/jquery-ui.min.js"></script>
	<script type="text/javascript" src="intel.json?version=<?php echo $intel['version']; ?>"></script>
	<script type="text/javascript" src="fullstream.js?version=<?php echo $intel['version']; ?>"></script>
</head>
<body class="theme-default">
	<div id="fullstream-wrapper">
		<div id="media" class="topbar-normal">
			<div id="topbar">
				<img class="channel-logo" src="images/offline.png" />
				<ul class="info-box">
					<li class="title">Welcome to FullStream</li>
					<li class="stats">A better way to watch Twitch</li>
				</ul>
				<div id="topbar-controls">
					<i id="toggle-home" class="toggle fa fa-home" title="Home"></i>
					<i id="toggle-pip" class="toggle" title="Toggle Picture-in-Picture"><b>PiP</b></i>
					<i id="toggle-pipswitch" class="toggle fa fa-retweet fa-rotate-90" title="Swap stream and PiP"></i>
					<i id="toggle-switcher" class="toggle toggle fa fa-list-ol" title="Toggle Switcher"></i>
					<i id="toggle-topbar" class="toggle fa fa-angle-up" title="Toggle Topbar"></i>
					<i id="toggle-sidebar" class="toggle fa fa-angle-right" title="Toggle Sidebar"></i>
				</div>
			</div>
			<div id="video-container">
			<?php if( !isset($_GET['c']) ): ?>
				<img id="logo" src="images/fullstream-logo.png" />
				<div id="social-links">
					<a href="https://twitter.com/kniffen" target="_blank"><i class="fa fa-twitter"></i></a>
					<a href="https://github.com/knifftech" target="_blank"><i class="fa fa-github"></i></a>
					<a href="https://chrome.google.com/webstore/detail/fullstream/jkchcbdilffpbpkknniliidiflhbagkl" target="_blank"><i class="fa fa-google"></i></a>
					<a href="http://knifftech.net/" target="_blank"><i class="fa fa-question"></i></a>
				</div>
			<?php else: ?>
				<object id="stream" 
						bgcolor="#000000" 
						data="//www-cdn.jtvnw.net/swflibs/TwitchPlayer.swf" 
						height="100%" 
						type="application/x-shockwave-flash" 
						width="100%"> 
				  <param name="allowFullScreen" 
				        value="true" />
				  <param name="allowNetworking" 
				        value="all" />
				  <param name="allowScriptAccess" 
				        value="always" />
				  <param name="movie" 
				        value="//www-cdn.jtvnw.net/swflibs/TwitchPlayer.swf" />
				  <param name="flashvars" 
				  	<?php if( isset($_GET['v']) ): ?>
				    	value="videoId=<?php echo $_GET['v']; ?>&auto_play=true" />
				    <?php else: ?>
				        value="channel=<?php echo $_GET['c']; ?>&auto_play=true" />
				    <?php endif; ?>
				</object>
			<?php endif; ?>
			<?php if( isset($_GET['p']) ): ?>
				<object id="pip-stream" 
						class="pip-top-right"
						bgcolor="#000000" 
						data="//www-cdn.jtvnw.net/swflibs/TwitchPlayer.swf" 
						height="100%" 
						type="application/x-shockwave-flash" 
						width="100%"> 
				  <param name="allowFullScreen" 
				          value="true" />
				  <param name="allowNetworking" 
				          value="all" />
				  <param name="allowScriptAccess" 
				          value="always" />
				  <param name="movie" 
				          value="//www-cdn.jtvnw.net/swflibs/TwitchPlayer.swf" />
				  <param name="flashvars" 
				          value="channel=<?php echo $_GET['p']; ?>&auto_play=true&start_volume=0" />
				</object>
			<?php endif; ?>
			</div>
		</div>
		<div id="sidebar" class="sidebar-right">
			<ul class="tabs">
			<?php foreach($sidebar as $key => $item): ?>
				<li id="opt-<?php echo $key; ?>">
					<input type="radio" name="tabs" id="tab-<?php echo $key; ?>" <?php if($key == 'settings'):?>checked<?php endif; ?>>
					<label for="tab-<?php echo $key; ?>"><i class="fa <?php echo $item['icon']; ?>"></i></label>
					<div class="tab-content tab-content-<?php echo $key; ?>">
						<?php get_tab_content($key); ?>
					</div>
				</li>
			<?php  endforeach; ?>
			</ul>
			<div class="advert"></div>
			<div id="loading">
				<i class="fa fa-circle-o-notch fa-spin"></i>
			</div>
		</div>
	</div>
	<div id="welcome">
		<div id="welcome-box">
			<h1>Welcome to FullStream</h1>
			<p>FullStream is an alternative way to watch twitch.tv.</p>
			<br>
			<p>In addition to let you watch streams and chat, FullStream also has some aditional features like being able to view hightlights and past broadcasts, see who is streaming your favorite games, automatic channel switching, Picture-in-Picture and more.</p>
			<br>
			<p>Before you get started, would you like some additional information about the various features and how to use them?</p>
			<br>
			<a href="http://knifftech.net" target="_blank" onClick="start()" class="welcome-button">Show me how</a>
			<button class="welcome-button" onClick="start()">I know how it works</button>
		</div>
	</div>
</body>
</html>