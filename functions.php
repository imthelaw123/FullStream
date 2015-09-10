<?php
$strIntel = substr(file_get_contents('intel.json'),6);
$intel = json_decode($strIntel, true);
$GLOBALS["intel"]; 
$sidebar = [
	"chat" => [
		"icon" => "fa-comment",
		"title" => "Chat"
	],
	"channels" => [
		"icon" => "fa-list-alt",
		"title" => "Channel list"
	],
	"panels" => [
		"icon" => "fa-info",
		"title" => "Twitch panels"
	],
	"vods" => [
		"icon" => "fa-file-video-o",
		"title" => "Highlights & Past Broadcasts"
	],
	"games" => [
		"icon" => "fa-gamepad",
		"title" => "Followed games"
	],
	"switcher" => [
		"icon" => "fa-list-ol",
		"title" => "The Switcher"
	],
	"settings" => [
		"icon" => "fa-cogs",
		"title" => "Settings"
	]
];

function get_tab_content($tab){
	global $intel;
	if( $tab == 'chat' ): 
		if( isset($_GET['c']) ): ?>
			<iframe frameborder="0" scrolling="no" id="chat-embed" src="http://twitch.tv/chat/embed?channel=<?php echo $_GET['c']; ?>&amp;amp;popout_chat=true"  height="100%" width="100%"></iframe>
		<?php else: ?>
			<iframe frameborder="0" scrolling="no" id="chat-embed" src=""  height="100%" width="100%"></iframe>
		<?php endif; 
	elseif( $tab != 'settings' ): ?>
		<div class="list list-<?php echo $tab; ?>"></div>
	<?php else: ?>
		<div id="settings">
		<?php foreach($intel as $key => $arr){
			if($key == 'booleans'){
				foreach ($arr as $boolean => $setting): ?>
					<div class="setting">
						<span class="setting-check">
						<?php if($setting['value']): ?>
							<input type="checkbox" id="<?php echo $boolean; ?>" checked />
						<?php else: ?>	
							<input type="checkbox" id="<?php echo $boolean; ?>" />
						<?php endif; ?>
							<label id="<?php echo $boolean; ?>-label" for="<?php echo $boolean; ?>"></label>
						</span>
						<span class="setting-name"><?php echo $setting['title']; ?></span>
					</div>
				<?php endforeach;
			}else if($key == 'options'){
				foreach ($arr as $options => $setting): ?>
				<div class="setting">
					<select id="<?php echo $options; ?>">
					<?php foreach($setting['alternatives'] as $option => $title){
						if($setting['value'] == $option): ?>
							<option value="<?php echo $option ?>" selected="selected"><?php echo $title; ?></option>
						<?php else: ?>
							<option value="<?php echo $option ?>"><?php echo $title; ?></option>
						<?php endif;
					} ?>
					</select>
					<span class="setting-name"><?php echo $setting['title']; ?></span>
				</div>
				<?php endforeach;
			}else if($key == 'strings'){
				foreach ($arr as $string => $setting): ?>
				<form class="setting">
					<div class="setting-name"><?php echo $setting['title']; ?></div>
					<input id="<?php print($string); ?>" type="text" name="<?php print($string); ?>"/>
					<input type="submit" value="Save" id="<?php print('save-'.$string); ?>" />
				</form>
				<?php endforeach;
			}
		} ?>
			<div class="setting"><button id="reset">Restore defaults</button></div>
			<p class="feedback">Do you having any issues or suggestions?<br>
			Feel free to contact <a href="http://twitter.com/kniffen" target="_blank">Kniffen on Twitter</a><br>
			or <a href="https://github.com/knifftech/FullStream/issues" target="_blank">report it on github</a>.</p>
			<span class="version">v<?php echo $intel['version']; ?></span>
		</div>
	<?php endif;
}
?>