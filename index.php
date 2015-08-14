<?php include 'functions.php'; ?>
<!DOCTYPE html>
<html>
<head>
	<title>FullStream - A better way to watch Twitch</title>
	<meta charset="utf-8">
	<meta http-equiv="cache-control" content="max-age=0" />
	<meta http-equiv="cache-control" content="no-cache" />
	<meta http-equiv="cache-control" content="no-store" />
	<meta http-equiv="expires" content="-1" />
	<meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT" />
	<meta http-equiv="pragma" content="no-cache" />
	<link rel="icon" type="image/png" href="assets/icons/favico.png" />
	<link rel="stylesheet" type="text/css" href="style.css?v=<?php echo $intel['version']; ?>" />
	<link href="//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css" rel="stylesheet">
	<link href='http://fonts.googleapis.com/css?family=Open+Sans:400,600,700,600italic,400italic' rel='stylesheet' type='text/css'>
	<link href='http://fonts.googleapis.com/css?family=Roboto:400,500,700' rel='stylesheet' type='text/css'>
	<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
	<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.3/jquery-ui.min.js"></script>
	<script type="text/javascript" src="intel.json?v=<?php echo $intel['version']; ?>"></script>
	<script type="text/javascript" src="fullstream.js?v=<?php echo $intel['version']; ?>"></script>
</head>
<body class="theme-default">
	<div id="fullstream-wrapper">
		<div id="media" class="topbar-normal">
			<div id="topbar">
				<img class="channel-logo" src="assets/images/offline.png" />
				<ul class="info-box">
					<li class="title">Welcome to FullStream</li>
					<li class="stats">A better way to watch Twitch</li>
				</ul>
				<div id="topbar-controls">
					<i id="toggle-home" class="toggle fa fa-home" title="Home (H)"></i>
					<i id="toggle-search" class="toggle fa fa-search" title="Manual switch (F)"></i>
					<i id="toggle-pip" class="toggle" title="Toggle Picture-in-Picture"><b>PiP</b></i>
					<i id="toggle-pipswitch" class="toggle fa fa-retweet fa-rotate-90" title="Swap stream and PiP"></i>
					<i id="toggle-switcher" class="toggle toggle fa fa-list-ol" title="Toggle Automatic Switcher (A)"></i>
					<i id="toggle-topbar" class="toggle fa fa-angle-up" title="Toggle Topbar (T)"></i>
					<i id="toggle-sidebar" class="toggle fa fa-angle-right" title="Toggle Sidebar (S)"></i>
				</div>
			</div>
			<?php if( !isset($_GET['c']) ): ?>
				<img id="logo" src="assets/images/fullstream-logo.png" />
				<div id="social-links">
					<a href="https://twitter.com/kniffen" target="_blank"><i class="fa fa-twitter"></i></a>
					<a href="https://github.com/knifftech" target="_blank"><i class="fa fa-github"></i></a>
					<a href="https://chrome.google.com/webstore/detail/fullstream/jkchcbdilffpbpkknniliidiflhbagkl" target="_blank"><i class="fa fa-google"></i></a>
					<a href="https://github.com/knifftech/FullStream/wiki" target="_blank"><i class="fa fa-question"></i></a>
				</div>
			<?php else:
				$url = 'http://www.twitch.tv/'.$_GET['c'].'/embed';
				if( isset($_GET['v']) && isset($_GET['html5']) ){
					$url = 'http://player.twitch.tv/?videoId='.$_GET['v'].'&showInfo=false';
				}else if( isset($_GET['html5']) ){
					$url = 'http://player.twitch.tv/?channel='.$_GET['c'].'&showInfo=false';
				}else if( isset($_GET['v']) ){
					$url = 'http://www.twitch.tv/widgets/live_embed_player.swf?channel='.$_GET['c'].'&videoId='.$_GET['v'];
				} ?>
				<iframe id="stream" src="<?php echo $url; ?>" frameborder="0"></iframe>
			<?php endif; ?>
			<?php if( isset($_GET['p']) ):
				$pipurl = 'http://www.twitch.tv/'.$_GET['p'].'/embed';
				if( isset($_GET['html5']) ){
					$pipurl = 'http://player.twitch.tv/?channel='.$_GET['p'].'&volume=0&showInfo=false';
				} ?>
				<iframe id="pip-stream" src="<?php echo $pipurl; ?>" frameborder="0"></iframe>
			<?php endif; ?>
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
	<div class="overlap">
		<div class="welcome-box notify-box">
			<h1>Welcome to FullStream</h1>
			<p>FullStream is an alternative way to watch twitch.tv.</p>
			<p>In addition to let you watch streams and chat, FullStream also has some aditional features like being able to view hightlights and past broadcasts, see who is streaming your favorite games, automatic channel switching, Picture-in-Picture and more.</p>
			<p>Before you get started, would you like some additional information about the various features and how to use them?</p>
			<a href="https://github.com/knifftech/FullStream/wiki" target="_blank" class="welcome-button">Show me how</a>
			<button id="welcome-button">I know how it works</button>
		</div>
		<div class="search-box notify-box">
			<h1>Switch to a desired channel</h1>
			<p>Enter inn the handle for the desired channel you want to watch</p>
			<form>
				<input type="text" id="search-id" name="search-id"></input>
				<input type="submit" value="Switch" id="search-for-id"></input>
				<button id="toggle-search-box">Cancel</button>
			</form>
		</div>
		<div class="switcher-box notify-box">
			<h1>Automatic switcher</h1>
			<p>Switching channel in <b>5</b>...</p>
			<button id="cancel-switch">Cancel</button>
		</div>
	</div>
</body>
</html>