// Set version in info tab
$('#version').html('Version: '+version);

// loading animation trigger
setInterval(function(){
	if(loading == true){
		$('.loading').css('visibility', 'visible');
	}else{
		$('.loading').css('visibility', 'hidden');
	}
},500);

// Load in data from LocalStorage
fullstream.load();

// Global variables for elements
var videoTarget = $('#video');
var pipTarget = $('#pip-video');
var chatTarget = $('#chat-embed');
var channelList = $('#channel-list');
var gameList = $('#game-list');
var onLoadChan = location.search.split('c=')[1];

/* Load defaults and settings*/
// Populating settings
for(setting in settings.general){
	$('#'+setting).prop('checked', settings.general[setting]);
	switch(setting){
		case 'sidebar-on-load':
			if(settings.general[setting]){
				$('#sidebar-toggle').addClass('fa-angle-left').removeClass('fa-angle-right');
				$('#media').animate({
					right: '0px'
				});
			}
			break;
		case 'switcher-setting':
			$('#local-switcher-setting').prop('checked', settings.general[setting]);
			if(settings.switcherChannels.length || settings.general[setting]){
				toggleMenuItem('#opt-4',false);
			}
			break;
		case 'chat-enabled':
			$('#chat-enabled').click(function(){
				if($('#chat-enabled')[0].checked){
					if(currentChannel.name){
						toggleMenuItem('#opt-0',false);
					}
					$(chatTarget).attr('src', channelData.twitch[currentChannel.id].chatEmbed);
				}else{
					if($('#chat-setting')[0].checked){
						$('#chat-setting').click();
					}
					toggleMenuItem('#opt-0',true);
					$(chatTarget).attr('src', '');
				}
			});
			break;
		case 'chat-setting':
			$('#chat-setting').click(function(){
				if($('#chat-setting')[0].checked && !$('#chat-enabled')[0].checked){
					$('#chat-enabled').click();
				}
			});
			break;
		case 'default-tab':
			$('#tab-'+settings.general[setting])[0].checked = true;
			toggleMenuItem('#opt-'+settings.general[setting],false);
			if(settings.general[setting] > 1){
				document.getElementById('default-tab-options').options[2].defaultSelected = true
			}else{
				document.getElementById('default-tab-options').options[settings.general[setting]].defaultSelected = true
			}
			break;
		case 'default-channel':
			if(settings.general[setting] || onLoadChan){
				if(settings.general['chat-enabled']){
					toggleMenuItem('#opt-0',false);
				}
				$(videoTarget).attr('src', '');
			}else{
				$(videoTarget).attr('src', 'welcome.html');
			}
			break;
		case 'twitch-user':
			if(settings.general[setting]){
				$('#twitch-user').val(settings.general[setting]);
				toggleMenuItem('#opt-1',false);
			}
			break;
		case 'color-theme':
			document.getElementById('color-theme-options').options[settings.general[setting]].defaultSelected = true;
			$("#color-style").attr('href', 'themes/'+$('#color-theme-options')[0][settings.general[setting]].text+'.css');
			break;
		case 'pip-position':
			$("#pip-box").attr('class', 'pip-'+$('#pip-options')[0][settings.general[setting]].text);
			document.getElementById('pip-options').options[settings.general[setting]].defaultSelected = true;
			break;
		case 'volume-setting':
			$('.volume-slider').css('left', settings.general[setting]+'px');
			$('.volume-progress').css('width', settings.general[setting]+'px');
			$('.volume-label').html('Default Volume '+settings.general[setting]+'%')
			break;
	}
}

/* Click and change events */
// Prevent form defaults
$('#get-twitch-user').on('submit', function(e){
	e.preventDefault();
});
// Clears value of text box when clicked
$('input[type=text]').click(function(){
	$(this).val('');
});
// Handle menu clicks
$('.tabs > li > input').click(function(){
	var num = $(this)[0].id.substr($(this)[0].id.length - 1);
	if(num == 3){
		fullstream.getVods(currentChannel.id, 0, false);
	}else if(num != 2){// hides games tab if another tab is clicked
		toggleMenuItem('#opt-2',true);
	}
});
// Show or hide sidebar
$('#sidebar-toggle').click(function(){
	if($(this).hasClass('fa-angle-right')){
		$(this).addClass('fa-angle-left').removeClass('fa-angle-right');
		$('#media').animate({
			right: '0px'
		});
	}else{
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
$('#topbar-toggle').click(function(){
	if($(this).hasClass('fa-angle-up')){
		$(this).addClass('fa-angle-down').removeClass('fa-angle-up');
		$('#statusbar img, #stream-stats').css({
			'visibility': 'hidden'
		});
		$('#statusbar .toggle').removeClass('toggle').addClass('small-toggle');
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
	}else{
		$(this).addClass('fa-angle-up').removeClass('fa-angle-down');
		$('#statusbar').animate({
			height: '46px'
		});
		$('#statusbar > span').animate({
			left: '52px'
		},function(){
			$('#statusbar img, #stream-stats').css({
				'visibility': 'visible'
			});
			$('#statusbar .small-toggle').removeClass('small-toggle').addClass('toggle');
		});
		$('#video').animate({
			height: ($('#video').height()-26)+'px'
		},function(){
			$('#video').css({height: 'calc(100% - 52px)'});
		});
	}
});
// Pip-box close
$('#pip-close').click(function(){
	$(pipTarget).attr('src', '');
	$('#pip-box').css('display', 'none');
});
// Switcher channel selection
$('#switcher-channels-select-button').click(function(){
	fullstream.addSwitcherChannel($('#switcher-channels-select').val());
	fullstream.populateChannels();
});
// Handle settings changes
$('#general-settings input[type=checkbox]').click(function(){
	settings.general[this.id] = this.checked;
	fullstream.save();
	if(this.id == 'switcher-setting'){
		$('#local-switcher-setting').prop('checked', this.checked);
		if(this.checked){
			toggleMenuItem('#opt-4',false);
			$('#tab-4')[0].checked = true;
			fullstream.switcher();
		}else if(!this.checked && !settings.switcherChannels.length){
			toggleMenuItem('#opt-4',true);
		}
	}
	fullstream.populateChannels();
});
// Handle local switcher toggle
$('#local-switcher-switch input[type=checkbox]').click(function(event) {
	settings.general['switcher-setting'] = this.checked;
	$('#switcher-setting').prop('checked', this.checked);
	if(this.checked){
		toggleMenuItem('#opt-4',false);
		fullstream.switcher();
	}else if(!this.checked && !settings.switcherChannels.length){
		toggleMenuItem('#opt-4',true);
		$('#tab-5')[0].checked = true;
	}
	fullstream.save();
});
// Handle twitch username setting change
$('#save-twitch-user').click(function(){
	loading = true;
	var chan = cleanString($('#twitch-user').val());
	if(chan == settings.general['twitch-user']){
		alert(chan+" is already set as Twitch username.")
		loading = false;
	}
	else{
		toggleMenuItem('#opt-1',false);
		$.getJSON('https://api.twitch.tv/kraken/channels/'+chan+'?callback=?', function(a){
			if(a.status != 422 && a.status != 404){
				settings.general['twitch-user'] = chan;
				channelData.twitch = [];
				settings.favorites = [];
				settings.switcherChannels = [];
				fullstream.save();
				$('#twitch-user').val(settings.general['twitch-user']);
				fullstream.log('Twitch.tv user set to '+chan);
				fullstream.getChannels(0);
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
// Restore all default settings
$('#restore-defaults').click(function(){
	settings = defaults;
	fullstream.save();
	location.reload();
});
// Handle default tab setting change
$('#default-tab-options').change(function(){
	settings.general['default-tab'] = $('#default-tab-options').val();
	fullstream.save();
});
// Handle color theme setting change
$('#color-theme-options').change(function(){
	settings.general['color-theme'] = $('#color-theme-options').val();
	fullstream.save();
	$("#color-style").attr('href', 'themes/'+$('#color-theme-options')[0][settings.general['color-theme']].text+'.css');
});
// Handle pip-box setting change
$('#pip-options').change(function(){
	$("#pip-box").attr('class', 'pip-'+$('#pip-options')[0][$('#pip-options').val()].text);
	settings.general['pip-position'] = $('#pip-options').val();
	fullstream.save();
});
// Handle default channel setting change
$('#default-channel-select').change(function(){
	var defChan = $('#default-channel-select').val();
	if(defChan != settings.general['default-channel']){
		settings.general['default-channel'] = defChan;
		fullstream.save();
		fullstream.channelOptions();
		fullstream.log('Default channel set to '+defChan);
	}
});

// Handle volume setting change
$('.volume-setting').on('mousedown', function(e){
	moveVolumeSlider(e);
	$(this).on('mousemove', function(e){
		moveVolumeSlider(e);	
	});
}).on('mouseup', function(){
	$(this).off('mousemove');
});

/* Handle keydown events */
$(window).keydown(function(e){
	if(settings.general['hotkeys']){
		var next = false;
		var switched = false;
		if($("input[type=text]").is(':focus') == false){
			if( e.keyCode == 66 || 
				e.keyCode == 78 ||
				e.keyCode == 71 ||
				e.keyCode == 72
			){	
				var tempArray = [];
				for(x in sortedChannels){
					for(y in sortedChannels[x]){
						tempArray[tempArray.length] = sortedChannels[x][y];
					}
				}
				if(!currentChannel.id){
					var hit = false;
					for(x in tempArray){
						if(channelData.twitch[tempArray[x]].live && !hit){
							var _this = channelData.twitch[tempArray[x]];
							fullstream.changeChannel(channelData[_this.service][_this.id].videoEmbed, channelData[_this.service][_this.id].chatEmbed, _this.id, _this.service);
							hit = true
						}
					}
					if(!hit){
						var _this = channelData.twitch[tempArray[0]];
						fullstream.changeChannel(channelData[_this.service][_this.id].videoEmbed, channelData[_this.service][_this.id].chatEmbed, _this.id, _this.service);
					}
				}else{
					if(e.keyCode == 66 || e.keyCode == 71){
						tempArray.reverse();
					}
					for(chan in tempArray){
						var _this = channelData.twitch[tempArray[chan]];
						if(!switched){
							if(!next && currentChannel.id == _this.id && currentChannel.service == _this.service){
								next = true;
							}else if(next && _this.live && (e.keyCode == 66 || e.keyCode == 78)){
								fullstream.changeChannel(_this.videoEmbed, _this.chatEmbed, _this.id, _this.service);
								switched = true;
							}else if(next && (e.keyCode == 71 || e.keyCode == 72)){
								fullstream.changeChannel(_this.videoEmbed, _this.chatEmbed, _this.id, _this.service);
								switched = true;
							}
						}
					}
					if(!switched){
						var hit = false;
						for(x in tempArray){
							if(channelData.twitch[tempArray[x]].live && !hit){
								var _this = channelData.twitch[tempArray[x]];
								fullstream.changeChannel(channelData[_this.service][_this.id].videoEmbed, channelData[_this.service][_this.id].chatEmbed, _this.id, _this.service);
								hit = true
							}
						}
						if(!hit){
							var _this = channelData.twitch[tempArray[0]];
							fullstream.changeChannel(channelData[_this.service][_this.id].videoEmbed, channelData[_this.service][_this.id].chatEmbed, _this.id, _this.service);
						}
					}
				}
			}else if(e.keyCode == 67 || e.keyCode == 86){
				var tabArray = [];
				for(num in $('.tabs > li > input')){
					if($('.tabs > li > input')[num].id != undefined){
						tabArray[tabArray.length] = $('.tabs > li > input')[num].id;
					}
				}
				if(e.keyCode == 67){
					tabArray.reverse();
				}

				for(tab in tabArray){
					if(switched == false){
						if($('#'+tabArray[tab])[0].checked){
							next = true;
						}else if(next && $($('#'+tabArray[tab])[0].parentElement).css('display') != 'none'){
							$('#'+tabArray[tab])[0].checked = true;
							switched = true;
						}
					}
				}
			}else if(e.keyCode == 83){//sidebar
				$('#sidebar-toggle').click();
			}else if(e.keyCode == 84){//topbar
				$('#topbar-toggle').click();
			}
		}
	}
});

// Get initial data
fullstream.getChannels(0);
if(!onLoadChan){
	onLoadChan = settings.general['default-channel'];
}
if(channelData.twitch[onLoadChan] && onLoadChan){
	setTimeout(function(){
		var chan = channelData.twitch[onLoadChan];
		fullstream.changeChannel(chan.videoEmbed, chan.chatEmbed, onLoadChan, 'twitch');
	},2000);
}else if(onLoadChan){
	var video = 'http://www.twitch.tv/widgets/live_embed_player.swf?channel='+onLoadChan;
	var chat = 'http://twitch.tv/chat/embed?channel='+onLoadChan+'&amp;popout_chat=true';
	fullstream.changeChannel(video, chat, onLoadChan, 'twitch');
}
// Update data every 60 seconds
setInterval(function(){
	fullstream.updateData();
},60000);
// Update twitch follower list every 5 min
setInterval(function(){
	fullstream.getChannels(0);
},330000);