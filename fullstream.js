/*
	FullStream - A Better Way to Watch Twitch.tv
	Version: 0.3
	By: Kniffen Technologies - http://knifftech.net
*/
// Variables and arrays
var fullstream = new Object();
fullstream.settings = intel;
fullstream.defaultSettings = JSON.parse(JSON.stringify(intel));
fullstream.channelData = {};
fullstream.currentStream = new channelObj;
fullstream.currentStream.pip;
fullstream.currentStream.vod;
fullstream.sortedChannels = {
	favorites:[],
	online:[],
	hosted:[],
	offline:[]
}
fullstream.gameIcons = {
	'fa-music'			: ['music'],
	'fa-code'			: ['programming', 'game development'],
	'fa-paint-brush'	: ['creative'],
	'fa-microphone'	 	: ['gaming talk shows'],
	'fa-truck'			: ['euro truck Simulator', 'euro truck simulator 2', 'american truck simulator', 'farming simulator 2015'],
	'fa-cube'			: ['minecraft', 'terraria', 'minecraft: xbox one edition'],
	'fa-space-shuttle'	: ['elite: dangerous', 'eve online', 'star citizen'],
	'fa-rocket'			: ['kerbal space program'],
	'fa-fighter-jet'	: ['arma', 'arma ii', 'arma iii', 'battlefield 4', 'battlefield 3','war thunder'],
	'fa-plane'			: ['microsoft flight simulator x'],
	'fa-ship'			: ['world of warships'],
	'fa-car'			: ['gran turismo 5', 'gran turismo 6', 'assetto corsa', 'project cars', 'the crew', 'forza motorsport 5', 'forza horizon 2', 'iracing.com'],
	'fa-wrench'			: ['factorio', 'automation - the car company tycoon game', 'truck mechanic simulator 2015', 'car mechanic simulator 2015', 'car mechanic simulator 2014'],
	'fa-train'			: ['train simulator 2015', 'train simulator 2014'],
	'fa-building'		: ['cities: skylines'],
	'fa-bus'			: ['omsi', 'omsi 2'],
	'fa-map-marker'		: ['geoguessr'],
	'fa-stethoscope'	: ['surgeon simulator 2013'],
	'fa-birthday-cake'	: ['portal', 'portal 2'],
	'fa-rebel'			: ['star wars: the old republic', 'star wars battlefront', 'star wars: battlefront 2', 'star wars: battlefront']
}
// Formats large numbers into readable strings
Number.prototype.formatNum = function(){
	if(this){
		num = this.toString();
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
// Fetches special icons for games from gameIcons array
String.prototype.getIcon = function(){
	var gIcon = "fa-gamepad";
	for(icon in fullstream.gameIcons){
		if(fullstream.gameIcons[icon].indexOf(this.toString().toLowerCase()) >= 0){
			gIcon = icon;
		}
	}
	return gIcon;
}
// Gets URL parameters
function getParameter(paramName) {
	var searchString = window.location.search.substring(1), i, val, params = searchString.split("&");
	for(var i=0; i < params.length; i++){
		val = params[i].split("=");
		if(val[0] == paramName){
			return val[1];
		}
	}
	return null;
}
// For initial users
function start(){
	fullstream.settings.states.first = false;
	fullstream.saveSettings();
	$('#welcome').hide();
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
// Loads settings store in Local Storage
fullstream.loadSettings = function(){
	if(localStorage.fullstreamSettings){
		tempArray = JSON.parse(localStorage.fullstreamSettings);
		for(cat in tempArray){
			for(setting in tempArray[cat]){
				if( JSON.stringify(tempArray[cat][setting]) != JSON.stringify(fullstream.settings[cat][setting]) ){
					fullstream.settings[cat][setting] = tempArray[cat][setting];
					fullstream.toggleSetting(cat, setting, true);
				}
			}
		}
	}
	if(!fullstream.settings.strings.twitchUsername.value){
		$('#loading').hide();
	}
	if(fullstream.settings.lists.switcher.length){
		$('#opt-switcher').show();
	}
}
// Saves settings to Local Storage
fullstream.saveSettings = function(){
	fullstream.log('Saved settings');
	localStorage.fullstreamSettings = JSON.stringify(fullstream.settings);
}
// Gets channels user is following from twitch API
fullstream.getFollows = function(offset){
	if(!offset){
		offset = 0;
		fullstream.channelData = {};
	}
	var url = 'https://api.twitch.tv/kraken/users/'+fullstream.settings.strings.twitchUsername.value+'/follows/channels?limit=100&offset='+offset+'&callback=?';
	$.getJSON(url, function(a){
		if(a.error){
			fullstream.settings.strings.twitchUsername.value = '';
			fullstream.saveSettings();
			alert('Invalid username');
			$('#loading').hide();
		}else if(a && a.follows){
			for(x in a.follows){
				var chan = new channelObj();
				for(y in chan){
					if(y in a.follows[x] && a.follows[x]){
						chan[y] = a.follows[x][y];
					}else if(y in a.follows[x].channel && a.follows[x].channel){
						chan[y] = a.follows[x].channel[y];
					}
				}
				if(fullstream.settings.lists.favorite.indexOf(chan.name) >= 0){
					chan.favorite = true;
				}
				if(fullstream.settings.lists.switcher.indexOf(chan.name) >= 0){
					chan.switcher = true;
				}
				if(fullstream.channelData[fullstream.currentStream.name]){
					chan.single = false;
				}
				fullstream.channelData[chan.name] = chan;
			}
			if(a.follows.length >= 100){
				fullstream.getFollows(offset+100);
			}else{
				var amount = offset+a.follows.length
				fullstream.log('Fetched '+amount+' following channel(s) with username '+fullstream.settings.strings.twitchUsername.value);
				if(fullstream.settings.booleans['check-showHosted'].value){
					fullstream.getHosted();
				}else{
					fullstream.updateChannels();
				}
			}
		}
	});
}
// Gets hosted channels by channels user is following from twitch API
fullstream.getHosted = function(){
	if(fullstream.settings.strings.twitchUsername.value){
		var url = 'https://api.twitch.tv/api/users/'+fullstream.settings.strings.twitchUsername.value+'/followed/hosting?limit=100&offset=0&callback=?';
		$.getJSON(url, function(a){
			if(a && a.hosts){
				for(x in a.hosts){
					if(!fullstream.channelData[a.hosts[x].target.channel.name] || (fullstream.channelData[a.hosts[x].target.channel.name] && fullstream.channelData[a.hosts[x].target.channel.name].current)){
						var chan = new channelObj();
						for(y in chan){
							if(y in a.hosts[x].target && a.hosts[x].target){
								chan[y] = a.hosts[x].target[y];
							}else if(y in a.hosts[x].target.channel && a.hosts[x].target.channel){
								chan[y] = a.hosts[x].target.channel[y];
							}
						}
						chan.display_name = chan.display_name+' ('+a.hosts[x].display_name+')';
						chan.hosted = true;
						fullstream.channelData[chan.name] = chan;
					}
				}
				fullstream.log('Fetched '+a.hosts.length+' hosted channel(s) with username '+fullstream.settings.strings.twitchUsername.value);
			}
		}).done(function(){
			fullstream.updateChannels();
		});
	}
}
// Updates channelData with various data from twitch API
fullstream.updateChannels = function(){
	var channelsString = '';
	for(x in fullstream.channelData){
		channelsString += x+',';
	}
	var url = 'https://api.twitch.tv/kraken/streams?callback=?&jsonp=?&channel='+channelsString;
	$.getJSON(url, function(a){
		if(a && a.streams && !(JSON.stringify(fullstream.channelData) == '{}') ){
			for(x in a.streams){
				var that = fullstream.channelData[a.streams[x].channel.name];
				for(y in that){
					if(y in a.streams[x] && a.streams[x][y]){
						that[y] = a.streams[x][y];
					}else if(y in a.streams[x].channel && a.streams[x].channel[y] && !( y == 'display_name' && that.hosted) ){
						that[y] = a.streams[x].channel[y];
					}
				}
				if(!that.logo){
					that.logo = 'images/offline.png';
				}
				that.live = true;
			}
			if(fullstream.channelData[fullstream.currentStream.name]){
				var data = fullstream.channelData[fullstream.currentStream.name];
				for(z in data){
					if(z in fullstream.currentStream){
						fullstream.currentStream[z] = data[z];
					}
				}
			}
			if(fullstream.settings.booleans['check-switcher'].value && !$('.list-switcher').is(":hover")){
				fullstream.switcher();
			}
			fullstream.log('Updated '+a.streams.length+' live channel(s)');
		}
	}).done(function(){
		fullstream.sortChannels();
		if(fullstream.currentStream.vod){
			var url = 'https://api.twitch.tv/kraken/videos/'+fullstream.currentStream.vod+'?callback=?';
			$.getJSON(url, function(a){
				if(!fullstream.channelData[fullstream.currentStream.name]){
					fullstream.channelData[fullstream.currentStream.name] = new channelObj();
				}
				for(x in fullstream.currentStream){
					if(x in a){
						fullstream.currentStream[x] = a[x];
					}
					fullstream.currentStream.viewers = 0;
					fullstream.currentStream.video_height = 0;
				}
				fullstream.currentStream.status = a.title;
				fullstream.currentStream.display_name = a.channel.display_name;
				fullstream.currentStream.live = true;
			}).done(function(){
				fullstream.populateChannels();
			});
		}else if(fullstream.currentStream.name && !fullstream.currentStream.live){
			var url = 'https://api.twitch.tv/kraken/channels/'+fullstream.currentStream.name+'?callback=?';
			$.getJSON(url, function(a){
				for(x in fullstream.currentStream){
					if(x in a){
						fullstream.currentStream[x] = a[x];
					}
				}
				if(!fullstream.channelData[fullstream.currentStream.name]){
					fullstream.currentStream.live = true;
				}
			}).done(function(){
				fullstream.populateChannels();
			});
		}else{
			fullstream.populateChannels();
		}
	});
}
// Sorts channels alphabetically and by category
fullstream.sortChannels = function(){
	var that = fullstream.sortedChannels;
	var data = fullstream.channelData;
	
	for(cat in that){
		that[cat] = [];
	}
	var offlineFavs = [];
	for(chan in data){
		if(data[chan].favorite && data[chan].live){
			that.favorites.push(chan);
		}else if(data[chan].favorite){
			offlineFavs.push(chan);
		}else if(data[chan].live && !data[chan].hosted){
			that.online.push(chan);
		}else if(data[chan].hosted){
			that.hosted.push(chan);
		}else{
			that.offline.push(chan);
		}
	}
	for(cat in that){
		that[cat].sort();
	}
	that.favorites = that.favorites.concat(offlineFavs.sort());
	
	fullstream.log('Sorted channel(s)');
}
// Displays channels on lists and bars
fullstream.populateChannels = function(){
	$('.list-channels').html('');
	var sorted = fullstream.sortedChannels;
	var data = fullstream.channelData;
	for(cat in sorted){
		if(sorted[cat].length){
			var split = new listSplitter(cat, true);
			$('.list-channels').append(split);
		}
		for(chan in sorted[cat]){
			var that = data[sorted[cat][chan]];
			if(!fullstream.settings.states.collapsed[cat] && !that.single){
				var item = new channelItem(that.name);
				$('.list-channels').append(item);
			}
		}
	}
	$('.list-switcher').html('');
	var split = new listSplitter('Switcher channels');
	$('.list-switcher').append(split);
	if(fullstream.settings.lists.switcher.length){
		$('#opt-switcher').show();
		var list = fullstream.settings.lists.switcher;
		for(chan in list){
			var item = new switcherItem(list[chan]);
			$('.list-switcher').append(item);
		}
	}else{
		$('#opt-switcher').hide();
	}
	if(fullstream.currentStream.name){
		if(fullstream.currentStream.logo){
			$('#topbar .channel-logo').attr('src', fullstream.currentStream.logo);
		}
		if(fullstream.currentStream.status){
			$('#topbar .title').html(fullstream.currentStream.status);
		}
		$('#topbar .stats').html('');
		for(x in fullstream.currentStream){
			var i = $('<i class="fa"></i>');
			var stat = $('<span></span>');
			var pass = true;
			if(fullstream.currentStream[x]){
				switch(x){
					case 'name':
						if(fullstream.currentStream.vod){
							i.addClass('fa-file-video-o');
						}else if(fullstream.currentStream.live){
							i.addClass('fa-play');
						}else{
							i.addClass('fa-stop');
						}
						stat.html('<a href="http://twitch.tv/'+fullstream.currentStream[x]+'/profile" target="_blank">'+fullstream.currentStream.display_name+'</a>');
						stat.attr('title', fullstream.currentStream[x]+' on twitch.tv');
						break;
					case 'game':
						if(fullstream.currentStream.game){
							i.addClass(fullstream.currentStream.game.getIcon());
							stat.html('<a href="http://www.twitch.tv/directory/game/'+fullstream.currentStream[x]+'" target="_blank">'+fullstream.currentStream[x]+'</a>');
							stat.attr('title', fullstream.currentStream[x]+' on twitch.tv');
						}
						break;
					case 'viewers':
						i.addClass('fa-user');
						stat.html(fullstream.currentStream[x].formatNum());
						stat.attr('title', fullstream.currentStream[x].formatNum()+' viewers');
						break;
					case 'views':
						i.addClass('fa-eye');
						stat.html(fullstream.currentStream[x].formatNum());
						stat.attr('title', fullstream.currentStream[x].formatNum()+' views');
						break;
					case 'followers':
						i.addClass('fa-heart');
						stat.html(fullstream.currentStream[x].formatNum());
						stat.attr('title', fullstream.currentStream[x].formatNum()+' followers');
						break;
					case 'partner':
						i.addClass('fa-twitch');
						stat.html('Partner');
						stat.attr('title', 'Partnered with twitch.tv');
						break;
					case 'video_height':
						i.addClass('fa-video-camera');
						var res = fullstream.currentStream.video_height+'p'+Math.ceil(fullstream.currentStream.average_fps);
						stat.html(res);
						stat.attr('title', 'Stream resolution and framerate: '+res);
						break;
					default:
						pass = false;
						break;
				}
			}
			if(pass && fullstream.currentStream[x]){
				$('#topbar .stats').append(i, stat);
			}
			$('title').html(fullstream.currentStream.display_name+' - FullStream');
		}
	}
	$('#loading').hide();
	fullstream.log('Populated channel(s)');
}
// Gets twitch information panels for current stream
fullstream.getPanels = function(){
	$('#loading').show();
	if(fullstream.currentStream.name){
		$('.list-panels').html('');
		var header = new listSplitter(fullstream.currentStream.name+'\'s panels');
		$('.list-panels').append(header);
		var url = 'http://api.twitch.tv/api/channels/'+fullstream.currentStream.name+'/panels?callback=?';
		$.getJSON(url, function(a){
			if(a){
				for(x in a){
					var panel = new panelItem(a[x].data.title, a[x].data.link, a[x].data.image, a[x].html_description);
					$('.list-panels').append(panel);
				}
			}
			fullstream.log('Fatched panels for channel: '+fullstream.currentStream.name);
			$('#loading').hide();
		});
	}
}
// Gets various VODs from twitch API
fullstream.getVods = function(type){
	$('#loading').show();
	fullstream.settings.states.vod = type;
	fullstream.saveSettings();
	$('.list-vods').html('');
	if(!type){
		var vodCats = {
			"highlights" : "Highlights",
			"past-broadcasts" : "Past Broadcasts",
			"top" : "Top videos on twitch"
		};
		for(cat in vodCats){
			if(cat == 'top' || fullstream.currentStream.name){
				var listLink = $('<div class="list-item list-item-listlink"></div>');
				var listLinkIcon = $('<i class="fa fa-file-video-o"></i>');
				var listLinkTitle = $('<h2>'+vodCats[cat]+'</h2>');
				if(cat != 'top'){
					listLinkTitle = $('<h2>'+fullstream.currentStream.name+'\'s '+vodCats[cat]+'</h2>');
				}

				listLink.click({cat: cat}, function(e){ fullstream.getVods(e.data.cat) });
				
				$(listLink).append(listLinkIcon, listLinkTitle);
				$('.list-vods').append(listLink);
			}
		}
		$('#loading').hide();
	}else if(type == 'highlights' || type == 'past-broadcasts'){
		var header = new listSplitter(fullstream.currentStream.name+'\'s '+type, 2);
		header.click(function(){ fullstream.getVods(); });
		$('.list-vods').append(header);
		var past = false;
		if(type == 'past-broadcasts'){
			past = true;
		}
		var url = 'https://api.twitch.tv/kraken/channels/'+fullstream.currentStream.name+'/videos?limit=100&offset=0&callback=?&broadcasts='+past;
		$.getJSON(url, function(a){
			for(vod in a.videos){
				var newVod = new vodItem(a.videos[vod].channel.name, a.videos[vod].title, a.videos[vod]._id, a.videos[vod].game, a.videos[vod].description, a.videos[vod].preview);
				$('.list-vods').append(newVod);
			}
			$('#loading').hide();
		});
	}else if('top'){
		var header = new listSplitter('Top videos on twitch', 2);
		header.click(function(){ fullstream.getVods(); });
		$('.list-vods').append(header);
		var url = 'https://api.twitch.tv/kraken/videos/top/?offset=0&limit=100&callback=?';
		$.getJSON(url, function(a){
			for(vod in a.videos){
				var newVod = new vodItem(a.videos[vod].channel.name, a.videos[vod].title, a.videos[vod]._id, a.videos[vod].game, a.videos[vod].description, a.videos[vod].preview);
				$('.list-vods').append(newVod);
			}
			$('#loading').hide();
		});
	}
}
// Gets various Games and channels streaming particular games from twitch API
fullstream.getGames = function(game){
	$('#loading').show();
	$('.list-games').html('');
	if(!game){
		fullstream.settings.states.game = '';
	}else{
		fullstream.settings.states.game = game;
	}
	fullstream.saveSettings();
	if(!game){
		var gamingCats = {
			"___following" : "Games you follow",
			"___top100" : "Top 100 Games on Twitch",
			"Gaming Talk Shows" : "Gaming Talk Shows",
			"Music" : "Music",
			"Game Development" : "Game Development",
			"Creative" : "Creative"
		};
		for(cat in gamingCats){
			if(cat != '___following' || fullstream.settings.strings.twitchUsername.value){
				var listLink = $('<div class="list-item list-item-listlink"></div>');
				var listLinkIcon = $('<i class="fa '+cat.getIcon()+'"></i>');
				var listLinkTitle = $('<h2>'+gamingCats[cat]+'</h2>');

				listLink.click({cat: cat}, function(e){ fullstream.getGames(e.data.cat) });
			
				$(listLink).append(listLinkIcon, listLinkTitle);
				$('.list-games').append(listLink);
			}
		}
		$('#loading').hide();
	}else if(game == '___top100'){ // Top 100
		var header = new listSplitter('Top 100 games on Twitch', 2);
		header.click(function(){ fullstream.getGames(); });
		$('.list-games').append(header);
		var url = 'https://api.twitch.tv/kraken/games/top?offset=0&limit=100&callback=?';
		$.getJSON(url, function(a){
			for(x in a.top){
				var game = new gameItem(a.top[x].game.name, a.top[x].game.box.small, a.top[x].viewers);
				$('.list-games').append(game);
			}
			$('#loading').hide();
		});
	}else if(game == '___following'){
		var header = new listSplitter(fullstream.settings.strings.twitchUsername.value+'\'s Followed games', 2);
		header.click(function(){ fullstream.getGames() });
		$('.list-games').append(header);
		var url = 'http://api.twitch.tv/api/users/'+fullstream.settings.strings.twitchUsername.value+'/follows/games?limit=100&offset=0&callback=?';
		$.getJSON(url, function(a){
			for(x in a.follows){
				var game = new gameItem(a.follows[x].name, a.follows[x].box.small);
				$('.list-games').append(game);
			}
			$('#loading').hide();
		});
	}else if(game){
		var header = new listSplitter(game, 2);
		header.click(function(){
			fullstream.settings.states.game = "";
			fullstream.saveSettings();
			fullstream.getGames();
		});
		$('.list-games').append(header);
		var url = 'https://api.twitch.tv/kraken/search/streams?limit=100&offset=0&q='+game+'&callback=?'
		$.getJSON(url, function(a){
			for(x in a.streams){
				if(a.streams[x].game == fullstream.settings.states.game){
					var data = new channelObj();
					for(y in data){
						if(y in a.streams[x] && a.streams[x][y]){
							data[y] = a.streams[x][y];
						}else if(y in a.streams[x].channel && a.streams[x].channel[y]){
							data[y] = a.streams[x].channel[y];
						}
					}
					data.live = true;
					data.hosted = true;
					var chan = new channelItem(data.name, data);
					$('.list-games').append(chan);
				}
			}
			$('#loading').hide();
		});
	}
}
// Handles setting changes
fullstream.toggleSetting = function(cat, setting, onload){
	if(cat == 'booleans' && $('#'+setting)[0]){
		$('#'+setting)[0].checked = fullstream.settings[cat][setting].value;
		switch(setting){
			case'check-chat':
				if(!fullstream.settings[cat][setting].value){
					$('.tab-content-chat #chat-embed').attr('src', '');
					$('#opt-chat').hide();
				}else if(fullstream.currentStream.name){
					$('.tab-content-chat #chat-embed').attr('src', 'http://twitch.tv/chat/embed?channel='+fullstream.currentStream.name+'&amp;amp;popout_chat=true');
					$('#opt-chat').show();
				}
				break;
			case 'check-switcher':
				$('#toggle-switcher').css('color', '');
				if(fullstream.settings[cat][setting].value){
					$('#toggle-switcher').css('color', '#237196');
				}
				if(fullstream.settings.lists.switcher.length){
					$('#opt-switcher').show();
				}else{
					$('#opt-switcher').hide();
				}
				break;
			case 'check-showHosted':
				if(!onload && fullstream.settings.strings.twitchUsername.value){
					fullstream.getFollows();
				}
				break;
		}
	}else if(cat == 'options'){
		$('#'+setting).val(fullstream.settings[cat][setting].value);
		switch(setting){
			case 'colorTheme':
				$('body').attr('class', 'theme-'+fullstream.settings[cat][setting].value);
				break;
			case 'pipPosition':
				if(fullstream.currentStream.pip){
					$('#pip-stream').attr('class', fullstream.settings[cat][setting].value);
				}
				break;
			case 'sidebarPosition':
				if(fullstream.settings[cat][setting].value == fullstream.defaultSettings[cat][setting].value){
					$('#sidebar').attr('class', 'sidebar-right');
					$('#fullstream-wrapper').css('flex-direction', 'row');
				}else{
					$('#sidebar').attr('class', 'sidebar-left');
					$('#fullstream-wrapper').css('flex-direction', 'row-reverse');
				}
				if($('#toggle-sidebar').hasClass('fa-angle-right')){
					$('#toggle-sidebar').switchClass('fa-angle-right', 'fa-angle-left');
				}else{
					$('#toggle-sidebar').switchClass('fa-angle-left', 'fa-angle-right');
				}
				break;
		}
	}else if(cat == 'strings'){
		if(setting == 'twitchUsername'){
			$('#twitchUsername').val(fullstream.settings[cat][setting].value);
			if(fullstream.settings[cat][setting].value){
				$('#opt-channels').show();
				$('#opt-games').show();
				fullstream.getFollows();
			}else{
				$('#opt-channels').hide();
			}
		}
	}else if(cat == 'states'){
		if(setting != 'collapsed' && !onload){
			if(fullstream.settings[cat][setting]){
				fullstream.settings[cat][setting] = false;
			}else{
				fullstream.settings[cat][setting] = true;
			}
		}
		if(setting == 'sidebar'){
			if(onload){
				if(!fullstream.settings[cat][setting] && fullstream.settings.options.sidebarPosition.value == fullstream.defaultSettings.options.sidebarPosition.value){
					$('#sidebar').css('margin-right', '-320px');
				}else if(!fullstream.settings[cat][setting]){
					$('#sidebar').css('margin-left', '-320px');
				}
			}else{
				if(fullstream.settings.options.sidebarPosition.value == 'left'){
					if( $('#sidebar').css('margin-left') < '0px' ){
						$('#sidebar').animate({'margin-left': '0px'});
					}else{
						$('#sidebar').animate({'margin-left': '-320px'});	
					}
				}else{
					if( $('#sidebar').css('margin-right') < '0px' ){
						$('#sidebar').animate({'margin-right': '0px'});
					}else{
						$('#sidebar').animate({'margin-right': '-320px'});	
					}
				}
			}
			if($('#toggle-sidebar').hasClass('fa-angle-right')){
				$('#toggle-sidebar').switchClass('fa-angle-right', 'fa-angle-left');
			}else{
				$('#toggle-sidebar').switchClass('fa-angle-left', 'fa-angle-right');
			}
		}else if(setting == 'topbar'){
			if(!fullstream.settings[cat][setting]){
				$('#media').switchClass('topbar-normal', 'topbar-small');
				$('#toggle-topbar').switchClass('fa-angle-up', 'fa-angle-down');
			}else{
				$('#media').switchClass('topbar-small', 'topbar-normal');
				$('#toggle-topbar').switchClass('fa-angle-down', 'fa-angle-up');
			}
		}
	}
}
// Automatic channel switcher
fullstream.switcher = function(){
	var list = fullstream.settings.lists.switcher;
	var hit = false;

	for(x in list){
		if(!hit && fullstream.channelData[list[x]] && fullstream.channelData[list[x]].live){
			hit = true;
			if(list[x] != fullstream.currentStream.name){
				fullstream.changeChannel(list[x]);
			}
		}
	}
}
// Changes the video and chat embed on the page
fullstream.changeChannel = function(channel, vod){
	fullstream.settings.states.vod = '' ;
	fullstream.saveSettings();

	var path = '?';
	if(channel){
		path += 'c='+channel;
	}
	if(channel && fullstream.currentStream.pip){
		path += '&p='+fullstream.currentStream.pip;
	}else if(fullstream.currentStream.pip){
		path += 'p='+fullstream.currentStream.pip;
	}
	if(vod){
		path += '&v='+vod;
	}
	document.location.href = path;
}
// JSON object for channels
function channelObj(){
	return {
		name: '',
		display_name: '', 
		live: false,
		logo: 'images/offline.png',
		status: '',
		favorite: false,
		switcher: false,
		hosted: false,
		single: false,
		game: '',
		views: '',
		followers: '',
		viewers: 0,
		partner: false,
		video_height: 0,
		average_fps: 0
	}
}
// Element object for channels
function channelItem(id, data){
	if(!data){
		var data = fullstream.channelData[id];
	}
	if(!data.logo){
		data.logo = 'images/offline.png';
	}
	var channelItem = $('<div class="list-item list-item-channel"></div>');
	var logo = $('<img class="list-item-logo" src="'+data.logo+'" />');
	var title = $('<span class="chan-stat chan-stat-title">'+data.display_name+'</span>');
	var genre = $('<span class="chan-stat chan-stat-genre"></span>');
	var icons = $('<span class="chan-stat chan-stat-icons"></span>');
	var viewers = $('<span class="chan-stat chan-stat-viewers"><i class="fa fa-user"></i> '+data.viewers.formatNum()+'</span>');

	if(data.live && !data.game){
		genre.append('<i class="fa fa-play"></i> Online');
	}else if(data.live){
		genre.append('<i class="fa '+data.game.getIcon()+'"></i> '+data.game);
	}else{
		genre.append('Offline');
	}

	if(fullstream.settings.lists.favorite.indexOf(data.name) >= 0){
		channelItem.addClass('favorited');
	}
	if(fullstream.settings.lists.switcher.indexOf(data.name) >= 0){
		channelItem.addClass('on-switcher');
	}
	if(fullstream.currentStream.pip == data.name){
		channelItem.addClass('pipped');
	}

	if(data && !data.hosted){
		var favicon = $('<i class="fav-toggle fa fa-heart"></i>');
		var switchicon = $('<i class="switch-toggle fa fa-list-ol"></i>');
		icons.append(favicon, switchicon);
	}
	var pipicon = $('<i class="pip-toggle"><b>PiP</b></i>');
	icons.append(pipicon);

	icons.find('> i').click(function(){
		if( $(this).hasClass('fav-toggle') || $(this).hasClass('switch-toggle') ){
			var cat = 'favorite';
			if($(this).hasClass('switch-toggle')){
				cat = 'switcher';
			}
			if(fullstream.settings.lists[cat].indexOf(data.name) >= 0){
				fullstream.settings.lists[cat].splice(fullstream.settings.lists[cat].indexOf(data.name), 1);
				data[cat] = false;
			}else{
				fullstream.settings.lists[cat][fullstream.settings.lists[cat].length] = data.name;
				data[cat] = true;
			}
			fullstream.saveSettings();
			fullstream.sortChannels();
			fullstream.populateChannels();
		}else if($(this).hasClass('pip-toggle')){
			fullstream.currentStream.pip = data.name;
			fullstream.saveSettings();
			fullstream.changeChannel(fullstream.currentStream.name, fullstream.currentStream.vod);
		}
		return false;
	});
	channelItem.mouseover({statustext: data.status},function(e){
		$(this).find('.chan-stat-genre').html(e.data.statustext);
	}).mouseout({gametext: genre.html()},function(e){
		$(this).find('.chan-stat-genre').html(e.data.gametext);
	});

	channelItem.click({id: id},function(e){
		var switcherActive = false;
		if(fullstream.settings.booleans['check-switcher'].value){
			var hit = false;
			for(x in fullstream.settings.lists.switcher){
				if(fullstream.channelData[fullstream.settings.lists.switcher[x]].live && !hit){
					hit = true;
					var live = confirm('There are live channels on the switcher list, would you like to disable the switcher and change the channel?');
					if(live){
						$('#check-switcher').click();
					}else{
						switcherActive = true;
					}
				}
			}
		}
		if(!switcherActive){
			fullstream.settings.states.vod = '';
			fullstream.saveSettings();
			fullstream.changeChannel(e.data.id);
		}
	});

	channelItem.append(logo, title, genre, icons);
	if(data.live){
		channelItem.append(viewers);
	}

	return channelItem;
}
// Element objct for switcher channels
function switcherItem(id, data){
	var switcherItem = new channelItem(id, data);
	var index = fullstream.settings.lists.switcher.indexOf(id);
	switcherItem.addClass('list-item-switcher');

	var movers = $('<div class="switcher-movers"></div>');
	var moveUp = $('<i class="switch-move-up fa fa-chevron-up"></i>');
	var moveDown = $('<i class="switch-move-down fa fa-chevron-down"></i>');

	if(index > 0){
		movers.append(moveUp);
	}
	if(index < fullstream.settings.lists.switcher.length-1){
		movers.append(moveDown);
	}
	switcherItem.append(movers);

	movers.find('i').click({index: index}, function(e){
		var stop = e.data.index + 1;
		if( $(this).hasClass('switch-move-up') ){
			stop = e.data.index - 1;
		}

        if(e.data.index >= fullstream.settings.lists.switcher.length){
        	var k = stop - fullstream.settings.lists.switcher.length;
        	while ((k--) + 1) {
        	    fullstream.settings.lists.switcher.push(undefined);
        	}
    	}
		fullstream.settings.lists.switcher.splice(stop, 0, fullstream.settings.lists.switcher.splice(e.data.index, 1)[0]);
		fullstream.saveSettings();
		fullstream.populateChannels();

	});

	return switcherItem;
}
// Element object for panels
function panelItem(title, link, img, description){
	var panelItem = $('<div class="list-item list-item-panel"></div>');
	
	if(link){
		panelItem.click({link: link},function(e){
			window.location.href = e.data.link;
		});
	}
	if(title){
		var h1 = $('<h1>'+title+'</h1>');
		panelItem.append(h1);
	}
	if(img){
		var img = $('<img src="'+img+'" />');
		panelItem.append(img);
	}
	if(description){
		var p = $('<div class="description">'+description+'</div>');
		panelItem.append(p);
	}

	return panelItem;
}
// Element object for VODs
function vodItem(name, title, id, game, description, img){
	var vodItem = $('<div class="list-item list-item-vod"></div>');
	var _title = $('<h1>'+title+'</h1>');
	var _img = $('<img src="'+img+'"/>');
	var _info = $('<span class="description"></span>');
	
	if(game){
		var _game = $('<p><i class="fa '+game.getIcon()+'"></i> '+game+'</p>');
		_info.append(_game);
	}
	if(description){
		var _description = $('<p>'+description+'</p>');
		_info.append(_description);
	}
	
	vodItem.click({name: name, id: id},function(e){
		fullstream.changeChannel(e.data.name, e.data.id);
	});
	
	vodItem.append(_title, _info, _img);

	return vodItem;
}
// Element object for games
function gameItem(title, img, viewers){
	var gameItem = $('<div class="list-item list-item-game"></div>');
	var logo = $('<img src="'+img+'" />');
	var titleSpan = $('<span class="game-title">'+title+'</span>');

	gameItem.append(logo, titleSpan);

	if(viewers){
		gameItem.append( $('<span class="game-viewers"><i class="fa fa-user"></i> '+viewers.formatNum()+'</span>') );
	}

	gameItem.click({game: title},function(e){
		fullstream.settings.states.game = e.data.game;
		fullstream.saveSettings();
		fullstream.getGames(e.data.game);
	});

	return gameItem;
}
// Element object for list splitters
function listSplitter(name, tog){
	var splitter = $('<div id="splitter-'+name+'" class="list-splitter"></div>')
	var i = $('<i class="fa"></i>');
	var nameSpan = $('<span class="splitter-title">'+name+'</span>');
	var toggle = $('<i class="splitter-toggle fa"></i>');

	if(name == 'favorites'){
		i.addClass('fa-heart');
	}else if(name == 'highlights' || name == 'past-broadcasts'){
		i.addClass('fa-file-video-o');
	}else{
		i.addClass('fa-twitch');
	}

	if(tog == 2){
		toggle.addClass('fa-reply');
	}
	else if(name in fullstream.settings.states.collapsed && tog){
		if(fullstream.settings.states.collapsed[name]){
			toggle.addClass('fa-caret-down');
		}else{
			toggle.addClass('fa-caret-up');
		}
	}
		
		splitter.append(i, nameSpan, toggle);
		splitter.click({name: name},function(e){
			if(e.data.name in fullstream.settings.states.collapsed){
				var id = this.id.substr(9);
				var collapsed = fullstream.settings.states.collapsed;
				
				if(collapsed[id]){
					collapsed[id] = false;
				}else{
					collapsed[id] = true;
				}

				fullstream.populateChannels();
				fullstream.saveSettings();
			}
		});

	return splitter;
}
// On page ready
$(document).ready(function(){
	fullstream.currentStream.name = getParameter('c');
	fullstream.currentStream.pip = getParameter('p');
	fullstream.currentStream.vod = getParameter('v');
	fullstream.loadSettings();

	if(fullstream.currentStream.name){
		$('#topbar .title').html('FullStream');
		$('#topbar .stats').html('Loading '+fullstream.currentStream.name+'...');
		if(!fullstream.settings.strings.twitchUsername.value){
			fullstream.updateChannels();
		}
		if(fullstream.settings.booleans['check-chat'].value){
			$('#opt-chat').show();
		}
		$('#opt-panels').show();
		$('#opt-vods').show();
	}
	if(!fullstream.currentStream.pip){
		$('#toggle-pip').hide();
	}
	if( !(fullstream.currentStream.name && fullstream.currentStream.pip) ){
		$('#toggle-pipswitch').hide();
	}

	/* Click event handlers */
	// Prevent form defaults
	$('form').on('submit', function(e){
		e.preventDefault();
	});
	$('#topbar-controls i').click(function(){
		switch(this.id){
			case 'toggle-home':
				if(fullstream.settings.strings.twitchUsername.value){
					$('#tab-channels').click();
				}else{
					$('#tab-settings').click();
				}
				document.location.href = document.location.href.substr(0,document.location.href.indexOf('?'));
				break;
			case 'toggle-pip':
				fullstream.currentStream.pip = '';
				fullstream.saveSettings();
				fullstream.changeChannel(fullstream.currentStream.name, fullstream.currentStream.vod);
				break;
			case 'toggle-pipswitch':
				if(fullstream.currentStream.name && fullstream.currentStream.pip){
					document.location.href = '?c='+fullstream.currentStream.pip+'&p='+fullstream.currentStream.name;
				}
				break;
			case 'toggle-switcher':
				$('#check-switcher').click();
				break;
			case 'toggle-topbar':
				fullstream.toggleSetting('states', 'topbar');
				break;
			case 'toggle-sidebar':
				fullstream.toggleSetting('states', 'sidebar');
				break;
		}
		fullstream.saveSettings();
	});
	// Handle sidebar menu clicks
	$('.tabs > li > input').click(function(){
		fullstream.settings.states.lastTab = this.id;
		fullstream.saveSettings();
		if(this.id == 'tab-panels'){
			fullstream.getPanels();
		}else if(this.id == 'tab-games'){
			fullstream.getGames(fullstream.settings.states.game);
		}else if(this.id == 'tab-vods'){
			fullstream.getVods(fullstream.settings.states.vod);
		}
	});
	$('#'+fullstream.settings.states.lastTab).click();
	// Handle settings boolean changes
	$('.setting-check input[type="checkbox"]').click(function(){
		fullstream.settings.booleans[this.id].value = $(this)[0].checked;
		fullstream.saveSettings();
		fullstream.toggleSetting('booleans', this.id);
	});
	// Handle settings options changes
	$('.setting select').change(function(){
		fullstream.settings.options[this.id].value = this.value;
		fullstream.saveSettings();
		fullstream.toggleSetting('options', this.id);
	});
	// Handle username change
	$('#save-twitchUsername').click(function(){
		$('#loading').show();
		if($('#twitchUsername').val()){
			var ok = true;
			if(fullstream.settings.strings.twitchUsername.value){
				ok = confirm('This will remove all favorited channels and clear the switcher. Are you sure you want to do this?');
			}
			if(ok){
				fullstream.settings.strings.twitchUsername.value = $('#twitchUsername').val().replace(/\s+/g, '').toLowerCase();;
				fullstream.settings.lists.favorite = [];
				fullstream.settings.lists.switcher = [];
				fullstream.saveSettings();
				fullstream.toggleSetting('strings', 'twitchUsername');
			}else{
				$('#loading').hide();
			}
		}else{
			alert('Invalid username');
			$('#loading').hide();
		}
	});
	// Reset settings and refresh
	$('#reset').click(function(){
		fullstream.settings = fullstream.defaultSettings;
		fullstream.saveSettings();
		location.reload();
	});

	// Handle keydown events
	$(window).keydown(function(e){
		var liveChannels = [];
		liveChannels = liveChannels.concat(fullstream.sortedChannels.favorites, fullstream.sortedChannels.online, fullstream.sortedChannels.hosted);
		if(fullstream.settings.booleans['check-hotkeys'].value && $("input[type=text]").is(':focus') == false){
			switch(e.keyCode){
				case 83:
					$('#toggle-sidebar').click();
					break;
				case 84:
					$('#toggle-topbar').click();
					break;
				case 66:
				case 78:
					if(liveChannels.length){
						target = '';
						if(e.keyCode == 66){
							liveChannels.reverse();
						}

						var next = false;
						var hit = false;
						for(x in liveChannels){
							if(liveChannels[x] == fullstream.currentStream.name || !fullstream.currentStream.name){
								next = true;
							}else if(next && !hit && fullstream.channelData[liveChannels[x]].live){
								hit = true;
								target = liveChannels[x];
							}
						}
						if(!hit){
							for(x in liveChannels){
								if(!hit && fullstream.channelData[liveChannels[x]].live){
									hit = true;
									target = liveChannels[x];
								}
							}
						}
						if(fullstream.settings.booleans['check-switcher'].value){
							$('#check-switcher').click();
						}
						if(target && target != fullstream.currentStream.name){
							fullstream.changeChannel(target);
						}
					}
					break;
			}
		}
	});

	// Update data every 60 seconds
	var timeCount = 0;
	setInterval(function(){
		if(fullstream.settings.strings.twitchUsername.value){
			timeCount++;
			if(timeCount >= 5){
				timeCount = 0;
				fullstream.getFollows();
			}else{
				fullstream.updateChannels();
			}
		}
	},60000);

	if(fullstream.settings.states.first){
		$('#welcome').show();
	}
});