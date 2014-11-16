// loading animation trigger
setInterval(function(){
	if(loading == true){
		$('.loading').css('visibility', 'visible');
	}
	else{
		$('.loading').css('visibility', 'hidden');
	}
},500);

// Load in data from LocalStorage
fullstream.load('channels');
fullstream.load('settings');
fullstream.load('switcher');

// Global variables set after elements load
var videoTarget = $('#video');
var pipTarget = $('#pipvideo');
var chatTarget = $('#chat_embed');
var channelList = $('#channelList');
var gameList = $('#gameList');

/* Tabs handler*/
$('.tabs > li > input').click(function(){
	var num = $(this)[0].id.substr($(this)[0].id.length - 1);
	if(num != 5){// hides games tab if another tab is clicked
		hideMenuItem('#opt5');
	}
});
// loading default tab
var defaultTab = '#opt'+fullstream.settings['defaultTab'];
$('#tab'+defaultTab.substr(defaultTab.length-1))[0].checked = true;
showMenuItem(defaultTab);

// Check for menu buttons to be visible on load
if(fullstream.settings['defaultChannel'] != 'none'){
	showMenuItem('#opt0');
}
// Checks if channels list's menu item is worth showing on load
if(fullstream.anyChannels() || fullstream.settings.twitchUser != ''){
	showMenuItem('#opt1');
}
// Checks if Switcher list's menu item is worth showing on load
if(fullstream.switcherChannels.length > 0 || fullstream.settings['switcherSetting']){
	showMenuItem('#opt2');
}

// Sidebar Toggle
if(fullstream.settings['sidebarOnLoad']){
	$('#sidebarToggle').addClass('fa-angle-left').removeClass('fa-angle-right');
	$('#media').animate({
		right: '0px'
	});
}
$('#sidebarToggle').click(function(){
	if($(this).hasClass('fa-angle-right')){
		$(this).addClass('fa-angle-left').removeClass('fa-angle-right');
		$('#media').animate({
			right: '0px'
		});
	}
	else{
		$(this).addClass('fa-angle-right').removeClass('fa-angle-left');
		$('#media').animate({
			right: '320px'
		});

		// refreshes video iframe to prevent weird bug in chrome on OSX
		if (navigator.appVersion.indexOf("Mac")!=-1){
			setTimeout(function(){
				$(videoTarget).attr('src', $(videoTarget).attr('src'));
			},100);
		}
	}
});

// Topbar toggle
$('#topbarToggle').click(function(){
	if($(this).hasClass('fa-angle-up')){
		$(this).addClass('fa-angle-down').removeClass('fa-angle-up');
		$('#statusbar img, #streamStats').css({
			'visibility': 'hidden'
		});
		$('#statusbar .toggle').removeClass('toggle').addClass('smallToggle');
		$('#statusbar').animate({
			height: '20px'
		});
		
		$('#statusbar > span').animate({
			left: '5px'
		});
		$('#video').animate({
			height: ($('#video').height()+26)+'px'
		},function(){
			$('#video').css({height: 'calc(100% - 26px)'});
		});
	}
	else{
		$(this).addClass('fa-angle-up').removeClass('fa-angle-down');
		$('#statusbar').animate({
			height: '46px'
		});
		$('#statusbar > span').animate({
			left: '52px'
		},function(){
			$('#statusbar img, #streamStats').css({
				'visibility': 'visible'
			});
			$('#statusbar .smallToggle').removeClass('smallToggle').addClass('toggle');
		});
		$('#video').animate({
			height: ($('#video').height()-26)+'px'
		},function(){
			$('#video').css({height: 'calc(100% - 52px)'});
		});
	}
});

// Pipbox close
$('#pipclose').click(function(){
	$(pipTarget).attr('src', '');
	$('#pipbox').css('display', 'none');
});

// Switcher drop-down option
$('#switcherChannelsSelectButton').click(function(){
	fullstream.addSwitcherChannel($('#switcherChannelsSelect').val());
	fullstream.populateSwitcher();
});

// Populating settings
for(setting in fullstream.settings){
	$('#'+setting).prop('checked', fullstream.settings[setting]);
	if(setting == 'switcherSetting'){
		$('#localSwitcherSetting').prop('checked', fullstream.settings[setting]);
	}
	if(fullstream.settings.twitchUser != ''){
		$('#twitchUser').val(fullstream.settings.twitchUser);
	}
}
$('#generalSettings input[type=checkbox]').click(function(){
	fullstream.settings[this.id] = this.checked;
	fullstream.save('settings');
	if(this.id == 'offlineChannels'){
		fullstream.populate();
	}
	else if(this.id == 'switcherSetting'){
		$('#localSwitcherSetting').prop('checked', this.checked);
		if(this.checked){
			showMenuItem('#opt2');
			fullstream.switcher();
		}else if( this.checked == false && fullstream.switcherChannels.length == 0){
			hideMenuItem('#opt2');
		}
	}
});
$('#localSwitcherSwitch input[type=checkbox]').click(function(event) {
	fullstream.settings['switcherSetting'] = this.checked;
	$('#switcherSetting').prop('checked', this.checked);
	if(this.checked){
		showMenuItem('#opt2');
		fullstream.switcher();
	}else if( this.checked == false && fullstream.switcherChannels.length == 0){
		hideMenuItem('#opt2');
	}
	fullstream.save('settings');
});

// default tab
$('#defaultTabOptions').change(function(){
	fullstream.settings['defaultTab'] = $('#defaultTabOptions').val();
	fullstream.save('settings');
});
document.getElementById('defaultTabOptions').options[fullstream.settings['defaultTab']].defaultSelected = true;

// color themes
$('#colorThemeOptions').change(function(){
	fullstream.settings['colorTheme'] = $('#colorThemeOptions').val();
	fullstream.save('settings');
	$("#colorStyle").attr('href', 'themes/'+$('#colorThemeOptions')[0][fullstream.settings['colorTheme']].text+'.css');
});
document.getElementById('colorThemeOptions').options[fullstream.settings['colorTheme']].defaultSelected = true;
$("#colorStyle").attr('href', 'themes/'+$('#colorThemeOptions')[0][fullstream.settings['colorTheme']].text+'.css');

$('#pipOptions').change(function(){
	$("#pipbox").attr('class', 'pip'+$('#pipOptions')[0][$('#pipOptions').val()].text);
	fullstream.settings['pipPosition'] = $('#pipOptions').val();
	fullstream.save('settings');
});
$("#pipbox").attr('class', 'pip'+$('#pipOptions')[0][fullstream.settings['pipPosition']].text);
document.getElementById('pipOptions').options[fullstream.settings['pipPosition']].defaultSelected = true;

// Clears value of text box when clicked
$('input[type=text]').click(function(){
	$(this).val('');
});

// Set default channel
$('#defaultChannelSelect').change(function(){
	var defChan = $('#defaultChannelSelect').val();
	if(defChan != fullstream.settings['defaultChannel']){
		fullstream.settings['defaultChannel'] = defChan;
		fullstream.save('settings');
		fullstream.channelOptions();
		fullstream.log('Default channel set to '+defChan);
	}
});

// Save twitch username
$('#saveTwitchUser').click(function(){
	loading = true;
	var chan = cleanString($('#twitchUser').val());
	if(chan == fullstream.settings.twitchUser){
		alert(chan+" is already set as Twitch username.")
		loading = false;
	}
	else{
		showMenuItem('#opt1');
		$.getJSON('https://api.twitch.tv/kraken/channels/'+chan+'?callback=?', function(a){
			if(a.status != 422 && a.status != 404){
				fullstream.settings.twitchUser = chan;
				fullstream.channels = [];
				fullstream.channelsData['twitch'] = [];
				fullstream.favorites = [];
				fullstream.switcherChannels = [];
				fullstream.save('settings');
				fullstream.save('channels');
				$('#twitchUser').val(fullstream.settings.twitchUser);
				fullstream.log('Twitch.tv user set to '+chan);
				fullstream.updateChannels();
				setTimeout(function(){
					fullstream.channelsToData();
					fullstream.updateData();
				},2000);
				setTimeout(function(){
					fullstream.channelOptions();
					loading = false;
					notify('twitch user set to '+chan);
				},3000);
			}
			else{
				alert(chan+' is not a valid Twitch.tv username.')
				loading = false;
			}
		});
	}
});

// Add non twitch channel
$('#addChannel').click(function(){
	loading = true;
	var service = $('#addChanSite').val();
	var chan = cleanString($('#addSingleChannel').val());
	showMenuItem('#opt1');
	if(service == 'Hitbox.tv'){
		$.getJSON('http://api.hitbox.tv/media/live/'+chan+'.json', function(a){
			addOtherChannel(chan, 'hitbox')
			notify('added '+chan+' to the channels list under Hitbox.tv')
			loading = false;
		})
		.error(function(){
			alert(chan+' is not a valid Hitbox.tv channel.')
			loading = false;
		});
	}
	else if(service == 'Streamup.com'){
		addOtherChannel(chan, 'streamup')
		notify('added '+chan+' to the channels list under Streamup.com')
		loading = false;
	}
	else if(service == 'Vaughnlive.tv'){
		addOtherChannel(chan, 'vaughnlive')
		notify('added '+chan+' to the channels list under VaughnLive.tv')
		loading = false;
	}
});

// Removed all channels
$('#restoreDefaults').click(function(){
	fullstream.channels = [];
	fullstream.favorites = [];
	fullstream.otherChannels = {
		"hitbox":[],
		"streamup":[],
		"vaughnlive":[]
	};
	fullstream.switcherChannels = [];
	fullstream.settings = { // JSON array for storing settings
		"offlineChannels": false,
		"sidebarOnLoad": false,
		"switcherSetting": false,
		"notificationSetting": true,
		"chatSetting": false,
		"defaultTab": "4",
		"defaultChannel": "none",
		"colorTheme": "0",
		"twitchUser": "",
		"pipPosition": "0"
	};
	fullstream.save('channels');
	fullstream.save('switcher');
	fullstream.save('settings');
	location.reload();
});

// Clear video frame on load if default channel is set to prepare for channel switch
if(fullstream.settings['defaultChannel'] != 'none'){
	$(videoTarget).attr('src', '');
}else{
	$(videoTarget).attr('src', 'welcome.html');
}

// Get initial data
fullstream.updateChannels();
setTimeout(function(){
	fullstream.channelsToData();
	fullstream.updateData();
	fullstream.channelOptions();
	
	/* Load default channel if any*/
	if(fullstream.settings['defaultChannel'] != 'none'){
		var defChan = fullstream.settings['defaultChannel'];
		for(site in fullstream.channelsData){
			for(chan in fullstream.channelsData[site]){
				if(chan == defChan){
					fullstream.changeChannel(fullstream.channelsData[site][chan].videoEmbed, fullstream.channelsData[site][chan].chatEmbed, chan, 'twitch');
				}
			}
		}
	}
	loading = false;
},4000);

// Update data every 60 seconds
setInterval(function(){
	fullstream.channelsToData();
	fullstream.updateData();
},60000);

// Update twitch follower list every 5 min
setInterval(function(){
	fullstream.updateChannels();
},330000);