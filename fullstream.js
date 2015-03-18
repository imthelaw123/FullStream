/* Objects, Variables and Arrays */
var fullstream = new Object();
fullstream.intel = {
	"channelData":{
		"twitch":[]
	},
	"sortedChannels":{
		"favorites":[],
		"online":[],
		"hosted":[],
		"offline":[]
	},
	"currentChannel":{
		"name":"",
		"service":"",
		"url":"",
		"logo":"",
		"status":"",
		"genre":"",
		"genreUrl":"",
		"viewers":0,
		"views":0,
		"followers":0,
		"parter":false
	},
	"settings":{ 
		"general":{
			"offline-channels": false,
			"sidebar-on-load": false,
			"switcher-setting": false,
			"notification-setting": true,
			"chat-enabled": true,
			"chat-setting": false,
			"default-tab": "6",
			"default-channel": "",
			"color-theme": "0",
			"twitch-user": "",
			"pip-position": "0",
			"hotkeys": true,
			"volume-setting": 100
		},
		"collapsed":{
			"favorites":false,
			"online":false,
			"hosted":false,
			"offline":false
		},
		"favorites":[],
		"switcherChannels":[],
	}
};
var channelData = fullstream.intel.channelData;
var sortedChannels = fullstream.intel.sortedChannels;
var currentChannel = fullstream.intel.currentChannel;
var settings = fullstream.intel.settings;
var defaults = JSON.parse(JSON.stringify(settings));
var loading = false;
var APIErrorCheck = 0;
var version = '0.2.28';

// Keeps strings clean from spaces and capitalization
function cleanString(string){
	var newstring = '';
	for(var i=0; i>string.length; i++){
		if(string[i] != ' '){
			newstring += string[i];
		}
	}
	return string.toLowerCase();
}
// Clears strings of special characters
function clearChars(string){
	if(string){
		var allowed = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅabcdefghijklmnopqrstuvwxyzæøå0123456789 ,.;:-+_|!"#<>%&/()=?@€£$`¬¦^{}[]~*\\\'';
		var newString = '';
		for(var i=0; i<string.length; i++){
			if(allowed.indexOf(string[i]) >= 0){
				newString += string[i];
			}
		}
		return newString;
	}
}
// Formating large numbers into readable strings
function formatnum(num){
	if(num != null){
		num = num.toString();
		var string = '';
		var count = 0;
		for(var i=num.length-1; i>=0; i--){
			string += num[i];
			count++;
			if(count == 3 && i != 0){
				count=0;
				string += ',';
			}
		}
		return string.split("").reverse().join("");
	}
}
// Showing notifications
function notify(string, length){
	if(settings.general['notification-setting']){
		if(!length){
			length = 6000;
		}
		$('#notification-box p').html(string);
		$('#notification-box').animate({
			bottom: '0px'
		});
		setTimeout(function(){
			$('#notification-box').animate({
				bottom: '-65px'
			});
		},length);
	}
}
// Handles menu item visibility
function toggleMenuItem(id,hide){
	if(hide){
		$(id).animate({'opacity': '0'});
		$(id).css('display', 'none');
	}else{
		$(id).css('display', 'initial');
		$(id).animate({'opacity': '1'});
	}
}
// Turns seconds into a readable time string
function formatTime(x){
	var hour = 0;
	var min = 0;
	var sec = 0;
	var string = '0:00:00';

	if(x >= 60){
		min = Math.floor(x/60);
		sec = Math.floor(x%60);
		if(min >= 60){
			hour = Math.floor(min/60);
			min = min%60;
		}
	}else{
		sec = x;
	}

	if(min < 10){
		min = '0'+min;
	}
	if(sec < 10){
		sec = '0'+sec;
	}

	if(hour == 0){
		string = min+':'+sec;
	}else{
		string = hour+':'+min+':'+sec;
	}

	return string;
}
// Converts dates from twitch API into readable strings
function formateDate(date){
	var newDate = date.substring(8,10)+'.'+date.substring(5,7)+'.'+date.substring(0,4);
	return newDate;
}
function moveVolumeSlider(e){
	e.preventDefault();

	var pos 	= $(e.currentTarget).offset()
	var	posX	= e.pageX - pos.left
	var	value	= posX*100/$(e.currentTarget).outerWidth();

	if(posX >= 0 && posX <= $(e.currentTarget).outerWidth()){
		$('.volume-setting > .volume-progress').css('width', posX+'px');
		$('.volume-setting > .volume-slider').css('left', posX+'px');

		var newVolume = Math.floor(value);
		settings.general['volume-setting'] = newVolume;
		$('.volume-label').html('Default Volume '+newVolume+'%');
		fullstream.save();
	}
}

// Custom console.log string
fullstream.log = function(string){
	var currentdate = new Date();
	var min = currentdate.getMinutes();
	var sec = currentdate.getSeconds();
	
	if(min < 10){
		min = '0'+min;
	}
	if(sec < 10){
		sec = '0'+sec;
	}

	var time = currentdate.getHours()+':'+min+':'+sec;
	console.log('FullStream @ '+time+': '+string);
}
// Returns amount of channels
fullstream.channelCount = function(arr){
	var x = 0;
	if(arr){
		for(z in arr){
			x++;
		}
	}else{
		for(y in channelData){
			for(z in channelData[y]){
				x++;
			}
		}
	}
	return x;
}
// Returns amount of channels online
fullstream.channelsOnline = function(arr){
	var x = 0;
	if(arr){
		for(z in arr){
			if(arr[z].live){
				x++;
			}
		}
	}else{
		for(y in channelData){
			for(z in channelData[y]){
				if(channelsData[y][z].live){
					x++;
				}
			}
		}
	}
	return x;
}
// Returns amount of channels offline
fullstream.channelsOffline = function(arr){
	var x = 0;
	if(arr){
		for(z in arr){
			if(!arr[z].live){
				x++;
			}
		}
	}else{
		for(y in channelData){
			for(z in channelData[y]){
				if(!channelsData[y][z].live){
					x++;
				}
			}
		}
	}
	return x;
}
// Populates the status bar
fullstream.populateStatusBar = function(){
	var stats = $('#stream-stats');
	$(stats).html('');
	
	for(item in currentChannel){
		var i = $('<i></i>');
		var span = $('<span class="stat-item"></span>');
		if(currentChannel[item]){
			switch(item){
				case 'logo':
					$('#stream-logo').attr({
						'src': currentChannel.logo,
						'title': currentChannel.name
					});
					break;
				case 'status':
					$('#stream-status').html(clearChars(currentChannel.status)).attr('title', clearChars(currentChannel.status));
					break;
				case 'name':
					if(currentChannel.service == 'vod'){
						$(i).attr('class', 'fa fa-file-video-o');
					}else if(channelData.twitch[currentChannel.id] && !channelData.twitch[currentChannel.id].live){
						$(i).attr('class', 'fa fa-stop');
					}else{
						$(i).attr('class', 'fa fa-play');
					}
					$(span).html($(i)[0].outerHTML+currentChannel.url);
					$(span).attr('title', currentChannel.name);
					break;
				case 'genre':
					var icon = 'fa-gamepad'
					if(currentChannel.genre == 'Gaming Talk Shows'){
						icon = 'fa-microphone';
					}else if(currentChannel.genre == 'Game Development'){
						icon = 'fa fa-codepen';
					}else if(currentChannel.genre == 'Programming'){
						icon = 'fa fa-code';
					}else if(currentChannel.genre == 'Music'){
						icon = 'fa-music';
					}
					$(i).attr('class', 'fa '+icon);
					$(span).html($(i)[0].outerHTML+currentChannel.genreUrl);
					$(span).attr('title', currentChannel.genre);
					break;
				case 'viewers':
					if(currentChannel.service != 'vod'){
						$(i).attr('class', 'fa fa-male');
						$(span).html($(i)[0].outerHTML+' '+formatnum(currentChannel.viewers));
						$(span).attr('title', formatnum(currentChannel.viewers)+' Viewers');
					}
					break;
				case 'views':
					$(i).attr('class', 'fa fa-eye');
					$(span).html($(i)[0].outerHTML+' '+formatnum(currentChannel.views));
					$(span).attr('title', formatnum(currentChannel.views)+' Views');
					break;
				case 'followers':
					$(i).attr('class', 'fa fa-heart');
					$(span).html($(i)[0].outerHTML+' '+formatnum(currentChannel.followers));
					$(span).attr('title', formatnum(currentChannel.followers)+' Followers');
					break;
				case 'partner':
					$(i).attr('class', 'fa fa-twitch');
					$(span).html($(i)[0].outerHTML+' Partner');
					$(span).attr('title', currentChannel.name+' is partnered with Twitch.tv');
					break;
			}
			
		}else{
			switch(item){
				case 'logo':
					$('#stream-logo').attr({
						'src': 'images/offline.png',
						'title': currentChannel.name
					});
					break;
				case 'status':
					var statusString = 'Untitled Broadcast';
					$('#stream-status').html(statusString).attr('title', statusString);
					break;
			}
		}
		if($(span).html()){
			$(stats).append(span);
		}
	}
}
// Updates information about the current channel
fullstream.updateCurrentChannel = function(){
	if(currentChannel.service == 'twitch' || currentChannel.service == 'vod' || currentChannel.service == 'hosted'){
		var url = 'https://api.twitch.tv/kraken/channels/'+currentChannel.id+'?callback=?';
		var viewers = 0;
		
		if(currentChannel.service != 'vod' && channelData.twitch[currentChannel.id]){
			viewers = channelData.twitch[currentChannel.id].viewers;
		}
		
		$.getJSON(url, function(a){
			if(a){
				currentChannel.logo = a.logo;
				currentChannel.partner = a.partner;
				currentChannel.url = ' <a href="http://twitch.tv/'+a.name+'/profile" target="_blank">'+a.display_name+'</a>';
				currentChannel.followers = a.followers;
				currentChannel.name = a.display_name;
				if(currentChannel.service == 'twitch' || currentChannel.service == 'hosted'){
					currentChannel.genreUrl = ' <a href="http://twitch.tv/directory/game/'+a.game+'" target="_blank">'+a.game+'</a>';
					currentChannel.viewers = viewers
					currentChannel.status = a.status;
					currentChannel.views = a.views;
					currentChannel.genre = a.game;
				}
				fullstream.populateStatusBar();
			}
		});
	}
}
// Save settings array to LocalStorage
fullstream.save = function(){
	localStorage.fullstream = JSON.stringify(settings);
}
// Get settings array from LocalStorage
fullstream.load = function(){
	if(localStorage.fullstream){
		tempArray = JSON.parse(localStorage.fullstream);
		for(array in tempArray){
			if(array != "general"){
				settings[array] = tempArray[array];
			}
		}
		for(setting in tempArray.general){
			settings.general[setting] = tempArray.general[setting];
		}
	}else{
		fullstream.save();
	}
	// load saves from previous versions
	if(localStorage.favorites){
		settings.favorites = JSON.parse(localStorage.favorites);
		localStorage.favorites = '';
		fullstream.save();
	}
	if(localStorage.switcher){
		settings.switcherChannels = JSON.parse(localStorage.switcher);
		localStorage.switcher = '';
		fullstream.save();
	}
	if(localStorage.settings){
		var oldSettings = JSON.parse(localStorage.settings);
		settings.general['chat-setting'] = oldSettings.chatSetting;
		settings.general['notification-setting'] = oldSettings.notificationSetting;
		settings.general['offline-channels'] = oldSettings.offlineChannels;
		settings.general['pip-position'] = oldSettings.pipPosition;
		settings.general['sidebar-on-load'] = oldSettings.sidebarOnLoad;
		settings.general['switcher-setting'] = oldSettings.switcherSetting;
		settings.general['twitch-user'] = oldSettings.twitchUser;
		localStorage.settings = '';
		fullstream.save();
	}
}
// Generates drop down list of channels for the switcher and default channels drop downs
fullstream.channelOptions = function(){ 
	$('#switcher-channels-select').html('');
	$('#default-channel-select').html('');
	if(settings.general['default-channel']){
		$('#default-channel-select').append($('<option></option>').html(settings.general['default-channel']));
	}
	$('#default-channel-select').append($('<option></option>').html(''));
	
	var tempArray = [];
	for(x in channelData.twitch){
		tempArray[tempArray.length] = channelData.twitch[x].id;
	}
	for(y in tempArray.sort()){
		$('#switcher-channels-select').append($('<option></option>').html(tempArray[y]));
		if(tempArray[y] != settings.general['default-channel']){
			$('#default-channel-select').append($('<option></option>').html(tempArray[y]));
		}
	}
};
// Add a channel to the switcher array
fullstream.addSwitcherChannel = function(chan){
	if(settings.switcherChannels.indexOf(chan) < 0){
		if(!settings.switcherChannels.length){
			toggleMenuItem('#opt-4',false);
		}
		settings.switcherChannels[settings.switcherChannels.length] = chan;
		fullstream.save();
		notify(chan+' was added to the switcher.');
	}else{
		notify(chan+' is already in the Switcher list.');
	}
}
// Move a switcher channels around when being drag and dropped
fullstream.moveSwitcherChannel = function (old_index, new_index){
    if (new_index >= settings.switcherChannels.length) {
        var k = new_index - settings.switcherChannels.length;
        while ((k--) + 1) {
            settings.switcherChannels.push(undefined);
        }
    }
    settings.switcherChannels.splice(new_index, 0, settings.switcherChannels.splice(old_index, 1)[0]);
};
// Get list of channels user is following via APIs
fullstream.getChannels = function(offset){
	url = 'https://api.twitch.tv/kraken/users/'+settings.general['twitch-user']+'/follows/channels?limit=100&offset='+offset+'&callback=?';
	$.getJSON(url, function(a){
		if(a && a.follows){
			if(offset == 0){
				channelData.twitch = [];
			}
			for(x in a.follows){
				var video = 'http://www.twitch.tv/widgets/live_embed_player.swf?channel='+a.follows[x].channel.name;
				var chat = 'http://twitch.tv/chat/embed?channel='+a.follows[x].channel.name+'&amp;popout_chat=true';
				var fav = false;
				if(settings.favorites.indexOf(a.follows[x].channel.name) >= 0){
					fav = true;
				}
				var arr = {
					id:a.follows[x].channel.name,
					name:a.follows[x].channel.display_name, 
					live:false,
					logo:a.follows[x].channel.logo,
					service:'twitch', 
					videoEmbed:video, 
					chatEmbed:chat, 
					status:a.follows[x].channel.status,
					viewers:"",
					genre:a.follows[x].channel.game,
					favorite:fav
				};
				channelData.twitch[a.follows[x].channel.name] = arr;
			}
			if(a.follows.length >= 100){
				fullstream.getChannels(offset+100);
			}else{
				fullstream.getHostedChannels(0);
				fullstream.log('Fetched '+fullstream.channelCount(channelData.twitch)+' channel(s) from Twitch.tv with username: '+settings.general['twitch-user']);
			}
		}else{
			fullstream.getHostedChannels(0);
		}	
	});
}
// Generates an alphabetical array of all channels
fullstream.sortChannels = function(){
	sortedChannels.favorites = [];
	sortedChannels.online = [];
	sortedChannels.hosted = [];
	sortedChannels.offline = [];
	for(service in channelData){
		for(channel in channelData[service]){
			if(service == 'twitch'){
				if(channelData[service][channel].favorite){
					sortedChannels.favorites[sortedChannels.favorites.length] = channel;
				}else if(channelData[service][channel].live){
					sortedChannels.online[sortedChannels.online.length] = channel;
				}else{
					sortedChannels.offline[sortedChannels.offline.length] = channel;
				}
			}else{
				sortedChannels.hosted[sortedChannels.hosted.length] = channel;
			}
		}
	}
	for(tab in sortedChannels){
		sortedChannels[tab].sort();
	}
}
// Generates array of hosted channels
fullstream.getHostedChannels = function(offset){
	var url = 'https://api.twitch.tv/api/users/'+settings.general['twitch-user']+'/followed/hosting?limit=100&offset='+offset+'&callback=?';
	$.getJSON(url, function(a){
		if(a && a.hosts){
			if(offset == 0){
				channelData.hosted = [];
			}
			for(x in a.hosts){
				if(!channelData.twitch[a.hosts[x].target.id]){
					var video = 'http://www.twitch.tv/widgets/live_embed_player.swf?channel='+a.hosts[x].target.id;
					var chat = 'http://twitch.tv/chat/embed?channel='+a.hosts[x].target.id+'&amp;popout_chat=true';
					var arr = {
						id:a.hosts[x].target.id,
						name:a.hosts[x].target.channel.display_name+' ('+a.hosts[x].display_name+')', 
						live:false,
						logo:a.hosts[x].target.channel.logo,
						service:'hosted', 
						videoEmbed:video, 
						chatEmbed:chat, 
						status:a.hosts[x].target.title,
						viewers:a.hosts[x].target.viewers,
						genre:a.hosts[x].target.meta_game,
						favorite:false
					}
					channelData.hosted[a.hosts[x].target.id] = arr;
				}
			}
			if(a.hosts.length >= 100){
				fullstream.getHostedChannels(offset+100);
			}else{
				fullstream.updateData();
				fullstream.log('Fetched '+fullstream.channelCount(channelData.hosted)+' hosted channel(s) from Twitch.tv with username: '+settings.general['twitch-user']);
			}
		}else{
			fullstream.updateData();
		}
	});
}
// Get list of games and genres
fullstream.getGames = function(){
	loading = true;
	$(gameList).html('');
	var url = 'http://api.twitch.tv/api/users/'+settings.general['twitch-user']+'/follows/games?limit=100&offset=0&callback=?';
	$.getJSON(url, function(a){
		for(g in a.follows){
			var game = new aGame(a.follows[g].name, a.follows[g].box.small);
			$(gameList).append(game.asListItem());
		}
			loading = false;
	});
}
// Method to get channels via specific game
fullstream.getGameChannels = function(game, logo){
	$(gameList).html('');
	loading = true;
	var url = 'https://api.twitch.tv/kraken/search/streams?limit=100&offset=0&q='+game+'&callback=?'
	$.getJSON(url, function(a){
		if(a && a.streams){
			var header = new aGame(game, logo, a._total, true);
			$(gameList).append(header.asListItem());
			for(chan in a.streams){
				if(a.streams[chan].game == game && a.streams[chan].game != 'null'){
					var video = 'http://www.twitch.tv/widgets/live_embed_player.swf?channel='+a.streams[chan].channel.name;
					var chat = 'http://twitch.tv/chat/embed?channel='+a.streams[chan].channel.name+'&amp;popout_chat=true';
					var li = new aChannel('twitch', a.streams[chan].channel.name, true, video, chat, a.streams[chan].channel.display_name, false, a.streams[chan].channel.status, game, a.streams[chan].viewers, a.streams[chan].channel.logo);
					$(gameList).append(li.asListItem());
				}
			}
		}
		else{
			notify('Error loading channels, please try again later.');
		}
		loading = false;
	});
}
// Method to get twitch VODs of current channel being watched
fullstream.getVods = function(channel, offset, broadcast){	
	if(offset == 0){
		$('#vod-list').html('');
	}
	url = 'https://api.twitch.tv/kraken/channels/'+channel+'/videos?limit=100&offset='+offset+'&callback=?&broadcasts='+broadcast;
	loading = true;
	$.getJSON(url, function(a){	
		if(offset == 0){
			if(broadcast){
				var pastHeader = new channelSplitter(currentChannel.name+' Past Broadcasts', false, 'fa-file-video-o', 'past');
				var vodHeader = new channelSplitter(currentChannel.name+' Highlights', true, 'fa-file-video-o', 'highlights');
				$('#vod-list').append(vodHeader.listItem);
				$('#vod-list').append(pastHeader.listItem);
			}else{
				var pastHeader = new channelSplitter(currentChannel.name+' Past Broadcasts', true, 'fa-file-video-o', 'past');
				var vodHeader = new channelSplitter(currentChannel.name+' Highlights', false, 'fa-file-video-o', 'highlights');
				$('#vod-list').append(pastHeader.listItem);
				$('#vod-list').append(vodHeader.listItem);
			}
		}
		if(a.videos.length > 0){
			for(vod in a.videos){
				var newVod = new aVod(a.videos[vod].title, a.videos[vod]._id, a.videos[vod].description, a.videos[vod].game, a.videos[vod].length, a.videos[vod].preview, a.videos[vod].recorded_at, a.videos[vod].views, channel, broadcast);
				$('#vod-list').append(newVod.asListItem());
			}
			if(a.videos.length >= 100){
				fullstream.getVods(channel, offset+100, broadcast);
			}else{
				loading = false;
			}
		}else if(!broadcast){
			fullstream.getVods(channel, 0, true);
		}else{
			loading = false;
		}
	});
}
// Method to changes the video and chat embed as well as the current channel object
fullstream.changeChannel = function(videoEmbed, chatEmbed, id, service){
	fullstream.log('Switching to '+id+' ('+service+')');
	loading = true;
	currentChannel.id = id;
	window.history.pushState('id', 'channel', '?c='+id);
	currentChannel.service = service;
	fullstream.updateCurrentChannel();
	fullstream.populateChannels();

	$(videoTarget).attr('src', videoEmbed+'&start_volume='+settings.general["volume-setting"]);
	if(settings.general['chat-enabled']){
		if(service != 'vod'){
			$(chatTarget).attr('src', chatEmbed);
		}

		if(settings.general['chat-setting'] && service != 'vod'){
			setTimeout(function(){
				$('#tab-0')[0].checked = true;
			}, 1500);
		}
	
		toggleMenuItem('#opt-0',false);
	}

	setTimeout(function(){
		loading = false;
		toggleMenuItem('#opt-3',false);
	},1500);
}
// Method to change PiP channel embed
fullstream.changePipChannel = function(videoEmbed){
	if($('#pip-box').css('display') == 'none'){
		$('#pip-box').css('display', 'block');
	}
	$(pipTarget).attr('src', videoEmbed+'&start_volume=0');
}
// Populates the channel list with channels
fullstream.populateChannels = function(){
	$(channelList).html('');
	$('#switcher-channels').html('');
	for(tab in sortedChannels){
		if(fullstream.channelCount(sortedChannels[tab]) && !(tab == 'offline' && settings.general['offline-channels'])){
			var split = new channelSplitter(tab, settings.collapsed[tab]);
			$(channelList).append(split.listItem());
		}
		if(!settings.collapsed[tab] && tab != 'hosted'){
			for(var x=0; x<2; x++){
				for(channel in sortedChannels[tab]){
					if( (x==0 && channelData.twitch[sortedChannels[tab][channel]].live) || (x==1 && !channelData.twitch[sortedChannels[tab][channel]].live) && !(tab == 'offline' && settings.general['offline-channels']) ){
						var chan = channelData.twitch[sortedChannels[tab][channel]];
						var li = new aChannel(chan.service, chan.id, chan.live, chan.videoEmbed, chan.chatEmbed, chan.name, false, chan.status, chan.genre, chan.viewers, chan.logo);
						$(channelList).append(li.asListItem());
					}
				}
			}
		}else if(!settings.collapsed[tab]){
			for(var x=0; x<2; x++){
				for(channel in sortedChannels[tab]){
					if( (x==0 && channelData.hosted[sortedChannels[tab][channel]].live) || (x==1 && !channelData.hosted[sortedChannels[tab][channel]].live) ){
						var chan = channelData.hosted[sortedChannels[tab][channel]];
						var li = new aChannel(chan.service, chan.id, chan.live, chan.videoEmbed, chan.chatEmbed, chan.name, false, chan.status, chan.genre, chan.viewers, chan.logo);
						$(channelList).append(li.asListItem());
					}
				}
			}
		}
	}
	for(chan in settings.switcherChannels){
		for(channel in channelData.twitch){
			if(channelData.twitch[channel].id == settings.switcherChannels[chan]){
				var switcherChan = new aSwitcherChannel(chan, channelData.twitch[channel].name);
				$('#switcher-channels').append(switcherChan.asSection());
			}
		}
	}
	fullstream.updateCurrentChannel();
};
// Update the channels in data array from various APIs
fullstream.updateData = function(){
	var channelsString = '';
	for(x in channelData){
		for(y in channelData[x]){
			channelsString += y+',';
		}
	}
	var url = 'https://api.twitch.tv/kraken/streams?callback=?&jsonp=?&channel='+channelsString;
	$.getJSON(url, function(a){
		if(a.streams && a){
			if(!a.streams.length && APIErrorCheck < 3){
				APIErrorCheck += 1;
			}
			if(a.streams.length){
				APIErrorCheck = 0;
			}
			for(service in channelData){
				var matched = false;
				for(account in a.streams){
					var string = a.streams[account].channel.name;
					for(chan in channelData[service]){
						if(chan == string){
							matched = true;	
							channelData[service][chan].live = true;
							if(service == 'twitch' || !channelData[service][chan].name){
								channelData[service][chan].name = a.streams[account].channel.display_name;
							}
							channelData[service][chan].status = a.streams[account].channel.status;
							if(a.streams[account].channel.game){
								channelData[service][chan].genre = a.streams[account].channel.game;
							}
							channelData[service][chan].viewers = a.streams[account].viewers;
						}
					}
				}
				if(chan && !matched && channelData[service][chan]){
					channelData[service][chan].live = false;
					channelData[service][chan].name = "";
					channelData[service][chan].status = "";
					channelData[service][chan].genre = ""; 
					channelData[service][chan].viewers = "";
				}
			}
		}
		if(APIErrorCheck > 0 && APIErrorCheck < 3){
			fullstream.log('API request failed, retrying '+APIErrorCheck+' time(s)');
			fullstream.updateData();
		}
	})
	.success(function() {
		fullstream.log('Updated '+fullstream.channelsOnline(channelData.twitch)+'/'+fullstream.channelCount(channelData.twitch)+' channels from Twitch.tv');
		fullstream.sortChannels();
		fullstream.channelOptions();
		fullstream.populateChannels();
		if(settings.general['switcher-setting']){
			fullstream.switcher();
		}
		loading = false;
	});
}
// Detect and switch to top channel in switcher array that is online
fullstream.switcher = function(){
	var switched = false;
	for(chan in settings.switcherChannels){
		var selChan = settings.switcherChannels[chan];
		if(channelData.twitch[selChan] && !switched){
			if(channelData.twitch[selChan].live){
				if(currentChannel.id == selChan){
					switched = true;
				}else if(currentChannel.id != selChan){
					var cha = channelData.twitch[selChan];
					fullstream.changeChannel(cha.videoEmbed, cha.chatEmbed, cha.id, cha.service, cha.viewers);
					switched = true;
				}
			}
		}
	}
};

// Channel Object constructor
function aChannel(service, id, live, videoEmbed, chatEmbed, name, favorite, status, genre, viewers, logo){
	this.asListItem = function(){
		status = clearChars(status);
		var li = $('<li></li>');
		var ul = $('<ul></ul>');
		var nametag = $('<li></li>');
		var picture = $('<li></li>');
		var img = $('<img />');
		
		if(logo){
			$(img).attr('src', logo);
		}else if(!logo && live){
			$(img).attr('src', 'images/offline.png');
		}else{
			$(img).attr('src', 'images/offline.png');
		}
		$(picture).append(img);
		
		if(live){
			if(currentChannel.id == id && currentChannel.service == service){
				$(li).attr('class', 'selected-channel channel live');
			}else{
				$(li).attr('class', 'channel live');
			}
			var channelName = $('<span class="channel-name">'+name+'</span>');
			var channelDetails = $('<p class="channel-genre"></p>');
			
			var icon = 'fa-gamepad';
			if(genre){
				if(genre == 'Music'){
					icon = 'fa-music';
				}else if(genre == 'Programming'){
					icon = 'fa-code';
				}else if(genre == 'Game Development'){
					icon = 'fa-codepen';
				}else if(genre == 'Gaming Talk Shows'){
					icon = 'fa-microphone';
				}
				channelDetails.append('<i class="fa '+icon+'"></i> '+genre.substr(0,30));
			}else{
				channelDetails.append('<i class="fa '+icon+'"></i> Online');
			}

			var channelStats = $('<p class="channel-stats"><i class="fa fa-male"></i> '+formatnum(viewers)+'</p>');

			$(channelName).append(channelDetails);
			$(nametag).append(channelStats);
			$(nametag).append(channelName);
		}else{
			if(currentChannel.id == id){
				$(li).attr('class', 'selected-channel channel offline');
			}else{
				$(li).attr('class', 'channel offline')
			}
			$(nametag).html('<span class="channel-name">'+name+'<p class="channel-genre">Offline</p></span>');
		}
		$(ul).append(picture)
		var controls = $('<li></li>');
		var play = $('<i class="fa fa-play"></i>');
		
		if(channelData.twitch[id]){
			var fav = $('<i class="fa fa-heart not-favorite"></i>');
			if(channelData.twitch[id].favorite){
				fav = $('<i class="fa fa-heart is-favorite"></i>');
			}
		}
		var pip = $('<i class="fa fa-external-link-square"></i>');
		var addToSwitcher = $('<i class="not-switcher fa fa-th-list"></i>');
		for(chanl in settings.switcherChannels){
			if(settings.switcherChannels[chanl] == id){
				addToSwitcher = $('<i class="is-switcher fa fa-th-list"></i>');
			}
		}

		$(play).click(function(){
			if(settings.general['switcher-setting']){
				notify('The Switcher is currently on and might change the channel!')
			}
			fullstream.changeChannel(videoEmbed, chatEmbed, id, service);
		});
		$(pip).click(function(){
			fullstream.changePipChannel(videoEmbed);
		});
		$(fav).click(function(){
			var hit = null;
			for(x in settings.favorites){
				if(settings.favorites[x] == id){
					hit = x;
				}
			}
			if(hit == null){
				settings.favorites[settings.favorites.length] = id;
				channelData.twitch[id].favorite = true;
			}else{
				settings.favorites.splice(hit, 1);
				channelData.twitch[id].favorite = false;
			}
			settings.favorites.sort();
			fullstream.save();
			fullstream.sortChannels();
			fullstream.populateChannels();
		});

		var chanSwitch = true;
		$(controls).mouseover(function(){
			chanSwitch = false;
		});
		$(controls).mouseout(function(){
			chanSwitch = true;
		});
		
		$(li).click(function(){
			if(chanSwitch == true){
				fullstream.changeChannel(videoEmbed, chatEmbed, id, service);
				if(settings.general['switcher-setting']){
					notify('The Switcher is currently on and might change the channel!')
				}
			}
		});
		$(addToSwitcher).click(function(){
			fullstream.addSwitcherChannel(id);
			fullstream.populateChannels();
		});
		$(controls).append(play);
		$(controls).append(pip);
		if(service == "twitch"){
			$(controls).append(fav);
			$(controls).append(addToSwitcher);
		}
		$(controls).attr('class', 'controls');
		
		$(ul).append(nametag);
		$(li).append(controls)
		$(li).append(ul);
		
		return li;
	};
}
// Game Object Constructor
function aGame(game, logo, num, single){
	this.asListItem = function(){
		var li = $('<li class="channel game"></li>');
		var ul = $('<ul></ul>');
		var img = $('<li><img src="'+logo+'" /></li>');
		var nametag = $('<li class="game-name"><span>'+game+'</span></li>');
		if(single){
			if(num == 1){
				$(nametag).html(num+' Channel streaming<br>'+game);
			}else{
				$(nametag).html(num+' Channels streaming<br>'+game);
			}
		}
		var back = $('<li class="back"><i class="fa fa-level-up"></i></li>');

		ul.append(img)
		ul.append(nametag)
		if(single){
			ul.append(back);
		}
		li.append(ul);

		$(li).click(function(){
			if(single){
				fullstream.getGames();
			}else{
				fullstream.getGameChannels(game, logo);
			}
		});

		return li;
	}
}
// Switcher channel object constructor
function aSwitcherChannel(num, name){
	this.asSection = function(){
		var section = document.createElement('section');
		section.setAttribute('class', 'switcher-channel');
		section.setAttribute('draggable', 'true');

		section.addEventListener("dragstart", function(e){
			e.preventDefault;
			e.dataTransfer.setData('Text', '');
			start = num;
		}, false);
		section.addEventListener("dragend", function(e){
			e.preventDefault;
			fullstream.moveSwitcherChannel(start, stop);
			fullstream.save('switcher');
			fullstream.populateChannels();
		}, false);
		section.addEventListener("dragover", function(e){
			if (e.preventDefault) {
				e.preventDefault();
			}
			e.dataTransfer.dropEffect = 'move';
			stop = num;
			if(stop < start){
				$(this).css('border-top', '2px solid red');
			}else if(stop > start){
				$(this).css('border-bottom', '2px solid red');
			}			
		}, false);
		section.addEventListener("dragleave", function(e){
			e.preventDefault;
			$(this).css('border', '');
		}, false);

		var span = $('<span></span>').html((parseInt(num)+1)+'. '+name);
		var trash = $('<i></i>').attr('class', 'fa fa-trash-o');
		
		$(trash).click(function(){
			settings.switcherChannels.splice(num, 1);
			fullstream.save();
			fullstream.populateChannels();
			if(settings.switcherChannels.length == 0){
				toggleMenuItem('#opt-4',true);
				$('#tab-5')[0].checked = true;
			}
		});
		
		$(section).append(span);
		$(section).append(trash);
		
		return section;
	}
}
// channelSplitter constructor
function channelSplitter(name, up, logo, type){
	this.listItem = function(){		
		var li = document.createElement('li');
		var h4 = document.createElement('h4');
		var icon = document.createElement('i');
		var collapser = document.createElement('i');

		li.setAttribute('class', 'channel-splitter');
		
		if(!logo){
			if(name == 'favorites'){
				logo = 'fa-heart';
			}else{
				logo = 'fa-twitch';
			}
		}
		icon.setAttribute('class', 'fa '+logo);
		
		if(type){
			if(!up){
				collapser.setAttribute('class', 'fa fa-level-up');
			}else{
				collapser.setAttribute('class', 'fa fa-level-down');
			}
		}else{
			if(!up){
				collapser.setAttribute('class', 'fa fa-caret-up');
			}else{
				collapser.setAttribute('class', 'fa fa-caret-down');
			}
		}

		$(collapser).click(function(){
			if(type == 'game'){
				if(up){
					fullstream.getGameChannels(name);
				}else{
					fullstream.getGameChannels();
				}
			}else if(type && up && !loading){
				if(type == 'past'){
					fullstream.getVods(currentChannel.id, 0, true);
				}else{
					fullstream.getVods(currentChannel.id, 0, false);
				}
			}else{
				if(settings.collapsed[name]){
					settings.collapsed[name] = false;
				}else{
					settings.collapsed[name] = true;
				}
				fullstream.save();
				fullstream.populateChannels();
			}
		});

		$(h4).append(icon);
		$(h4).append(name);
		$(h4).append(collapser);
		$(li).append(h4);

		return li;
	}
}
// VoD constructor
function aVod(title, id, description, game, length, img, date, views, channel, broadcast){
	this.asListItem = function(){
		if(!img){
			img = 'images/offline.png';
		}

		var li = $('<li class="channel vod"></li>');
		var screenshot = $('<img src="'+img+'"/>')
		var details = $('<ul class="vod-details"></ul>');
		var vodTitle = $('<li class="vod-title">'+title+'</li>');
		var vodStats = $('<li></li>');
		vodStats.append('<i class="fa fa-video-camera"></i> '+formatTime(length));
		vodStats.append(' <i class="fa fa-eye"></i> '+views);
		if(game){
			vodStats.append(' <i class="fa fa-gamepad"></i> '+game);
		}

		var vodDescription = $('<li>'+description+'</li>');
		var videoEmbed = 'http://www.twitch.tv/widgets/live_embed_player.swf?channel='+channel+'&videoId='+id;
		
		details.append(vodTitle);
		details.append(vodStats);

		if(description){
			details.append(vodDescription);
		}

		li.append(screenshot);
		li.append(details);

		$(li).click(function(){
			currentChannel.status = title;
			currentChannel.views = views;
			currentChannel.genre = game;
			currentChannel.genreUrl = ' <a href="http://twitch.tv/directory/game/'+game+'" target="_blank">'+game+'</a>';
			fullstream.changeChannel(videoEmbed, '', channel, 'vod');
		});

		return li;
	}
}