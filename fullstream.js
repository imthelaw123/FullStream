/* Objects, Variables and Arrays */
var loading = true;
var APIErrorCheck = 0;
var fullstream = new Object(); // Main object for FullStream
// JSON array for twitch channels
fullstream.channels = []; 
// JSON array for favorited twitch channels
fullstream.favorites = []; 
// JSON array for non-twitch channels
fullstream.otherChannels = {
	"hitbox":[],
	"streamup":[],
	"vaughnlive":[]
};
// JSON array to store boolen values for collapsable channel categories
fullstream.collapsed = {
	'favorites' : false,
	'hitbox' : false,
	'streamup' : false,
	'vaughnlive' : false,
	'twitch' : false
};
// JSON array for storing channels data
fullstream.channelsData = {
	"twitch":[],
	"hitbox":[],
	"streamup":[],
	"vaughnlive":[]
};
// JSON array for switcher channels
fullstream.switcherChannels = []; 
// JSON array for storing settings
fullstream.settings = { 
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
// Initial current channel object
fullstream.currentChannel = {
	"name":"",
	"service":"",
	"url":"",
	"logo":"",
	"status":"",
	"genre":"",
	"genreUrl":"",
	"viewers":0,
	"views":0,
	"followers":0
};

// Helper functions for keeping strings clean from spaces
function cleanString(string){
	var newstring = '';
	for(var i=0; i>string.length; i++){
		if(string[i] != ' '){
			newstring += string[i];
		}
	}
	return string.toLowerCase();
}
function cleanStatus(string){
	if(string != undefined){
		var allowed = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ,.;:-+_|!"#%&/()=?@${}[]~*\\\'';
		var newString = '';
		for (var i=0; i<string.length; i++){
			for(var x=0; x<allowed.length; x++ ){
				if(string[i] == allowed[x]){
					newString += string[i];
				}
			}
		}
		return newString;
	}
}

// Helper function for formating large numbers into a readable string
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

// Helper function for showing notifications
function notify(string, length){
	if(fullstream.settings['notificationSetting'] == true){
		if(length == undefined){
			length = 6000;
		}
		$('#notificationBox p').html(string);
		$('#notificationBox').animate({
			bottom: '0px'
		});
		setTimeout(function(){
			$('#notificationBox').animate({
				bottom: '-65px'
			});
		},length);
	}
}

// Helper function to check if a channel is favorited
function isFavorite(chan){
	var isFav = true;
	var favs = fullstream.favorites;
	for(favchan in favs){
		if(favs[favchan] == chan){
			isFav = false;
		}
	}
	return isFav;
}

// Helper function to checks and add channel to the other channels JSON array
function addOtherChannel(newChan, service){
	var allreadyAdded = false;
	for(channel in fullstream.otherChannels[service]){
		if(fullstream.otherChannels[service][channel] == newChan){
			allreadyAdded = true;
		}
	}
	if(allreadyAdded == false){
		fullstream.otherChannels[service][fullstream.otherChannels[service].length] = newChan;
		fullstream.save('channels');
		fullstream.channelsToData();
		setTimeout(function(){
			fullstream.updateData();
		},2000);
		setTimeout(function(){
			fullstream.populate();
		},3000);
	}
	else{
		alert(newChan+' is allready added to the channels list')
	}
}

// Helper functions to handle menu item visibility
function hideMenuItem(id){
	$(id).animate({'opacity': '0'});
	$(id).css('display', 'none');
}
function showMenuItem(id){
	$(id).css('display', 'initial');
	$(id).animate({'opacity': '1'});
}

// Helper function to turn seconds values into readable time string
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

// Helper function to convert data from twitch API into a readable string
function formateDate(date){
	var newDate = date.substring(8,10)+'.'+date.substring(5,7)+'.'+date.substring(0,4);
	return newDate;
}

// Method for loging strings to browser consome with date and time
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
	console.log('FullStream - '+time+': '+string);
}

// Method to checks if any channels in a JSON array are live
fullstream.anyOnline = function(arr){
	var x = 0;
	for(y in arr){
		if(arr[y].live == true){
			x++;
		}
	}
	return x;
}

// Method to checks if any channels in a JSON array are offline (cause they might all be live)
fullstream.anyOffline = function(arr){
	var x = false;
	for(y in arr){
		if(arr[y].live == false){
			x = true;
		}
	}
	return x;
}

// Method to detect if there are any channels in the channels array
fullstream.anyChannels = function(){
	var x = 0;
	for(y in fullstream.channels){
		x++;
	}
	for(z in fullstream.otherChannels){
		for(v in fullstream.otherChannels[z]){
			x++;
		}
	}
	if(x>0){
		return true;
	}
	else{
		return false;
	}
}

// Method to check if any twitch channels in the channels array are live
fullstream.anyLiveTwitchChannels = function(){
	x=0;
	for(channel in fullstream.channelsData['twitch']){
		if(fullstream.channelsData['twitch'][channel].live == true){
			x++;
		}
	}
	if(x>0){
		return true;
	}
	else{
		return false;
	}
}

// Method to detect if there are any channels in the otherChannels array
fullstream.anyOtherChannels = function(){
	x=0;
	for(z in fullstream.otherChannels){
		for(v in fullstream.otherChannels[z]){
			x++;
		}
	}
	if(x>0){
		return true;
	}
	else{
		return false;
	}
}

// Method to populates the status bar with information of the current channel
fullstream.currentChannel.populate = function(){
	var stats = $('#streamStats');
	$(stats).html('');
	for(var x=0; x<7; x++){
		var i = $('<i></i>');
		var span = $('<span class="statItem"></span>');
		switch(x){
			case 0:
				if(this.logo != undefined && this.logo != ''){
					$('#streamLogo').attr({
						'src': this.logo,
						'title': this.name
					});
				}
				else{
					$('#streamLogo').attr({
						'src': 'images/offline.png'
					});
				}
				break;
			case 1:
				if(this.status != undefined && this.status != ''){
					$('#streamStatus').html(cleanStatus(this.status)).attr('title', cleanStatus(this.status));
				}
				else{
					var statusString = 'You\'re watching '+this.name+' on '+this.service;
					$('#streamStatus').html(statusString).attr('title', statusString);
				}
				break;
			case 2:
				if(this.name != undefined && this.name != ''){
					$(i).attr('class', 'fa fa-play');
					$(span).html($(i)[0].outerHTML+this.url);
					$(span).attr('title', this.name);
				}
				break;
			case 3:
				if(this.genre != undefined && this.genre != '' && this.genre != 'null'){
					if(this.service == 'twitch' || this.service == 'hitbox' || this.service == 'vod'){
						$(i).attr('class', 'fa fa-gamepad');
					}
					else{
						$(i).attr('class', 'fa fa-sitemap');
					}
					$(span).html($(i)[0].outerHTML+this.genreUrl);
					$(span).attr('title', this.genre);
				}
				break;
			case 4:
				if(this.viewers != 0 && this.viewers != undefined){
					$(i).attr('class', 'fa fa-male');
					$(span).html($(i)[0].outerHTML+' '+formatnum(this.viewers));
					$(span).attr('title', formatnum(this.viewers)+' Viewers');
				}
				break;
			case 5:
				if(this.views != 0){
					$(i).attr('class', 'fa fa-eye');
					$(span).html($(i)[0].outerHTML+' '+formatnum(this.views));
					$(span).attr('title', formatnum(this.views)+' Views');
				}
				break;
			case 6:
				if(this.followers != 0){
					$(i).attr('class', 'fa fa-heart');
					$(span).html($(i)[0].outerHTML+' '+formatnum(this.followers));
					$(span).attr('title', formatnum(this.followers)+' Followers');
				}
				break;
		}
		$(stats).append(span);
	}
}

// Method to updates information about the current channel from the channels data array
fullstream.currentChannel.update = function(){
	fullstream.currentChannel.name = this.id;
	fullstream.currentChannel.service = this.service;
	fullstream.currentChannel.url = '';
	fullstream.currentChannel.logo = 'images/offline.png'
	if(this.service != 'vod'){
		fullstream.currentChannel.status = 'You\'re watching '+this.id+' on '+this.service;
		fullstream.currentChannel.views = 0;
		fullstream.currentChannel.genre = '';
		fullstream.currentChannel.genreUrl = '';
	}
	fullstream.currentChannel.viewers = 0;
	fullstream.currentChannel.followers = 0;
	
	if(this.service == 'twitch' || this.service == 'vod'){
		var url = 'https://api.twitch.tv/kraken/channels/'+this.id+'?callback=?';
		var viewers = 0;
		
		if(fullstream.channelsData['twitch'][this.id] != undefined){
			viewers = fullstream.channelsData['twitch'][this.id].viewers;
		}
		
		$.getJSON(url, function(a){
			fullstream.currentChannel.logo = a.logo;
			fullstream.currentChannel.url = ' <a href="http://twitch.tv/'+a.name+'" target="_blank">'+a.name+'</a>';
			fullstream.currentChannel.followers = a.followers;
			fullstream.currentChannel.name = a.name;
			if(fullstream.currentChannel.service == 'twitch'){
				fullstream.currentChannel.genreUrl = ' <a href="http://twitch.tv/directory/game/'+a.game+'" target="_blank">'+a.game+'</a>';
				fullstream.currentChannel.viewers = viewers
				fullstream.currentChannel.status = a.status;
				fullstream.currentChannel.views = a.views;
				fullstream.currentChannel.genre = a.game;
			}
			fullstream.currentChannel.populate();
		});
	}
	else if(this.service == 'hitbox'){
		var url = 'http://api.hitbox.tv/media/live/'+this.id+'.json';
		$.getJSON(url, function(a){
			fullstream.currentChannel.name = a.livestream[0].media_name;
			fullstream.currentChannel.url = ' <a href="'+a.livestream[0].channel.channel_link+'" target="_blank">'+a.livestream[0].media_name+'</a>';
			fullstream.currentChannel.logo = 'http://edge.sf.hitbox.tv'+a.livestream[0].channel.user_logo;
			
			if(a.livestream[0].media_status != undefined && a.livestream[0].media_status != ''){
				fullstream.currentChannel.status = a.livestream[0].media_status;
			}
			else{
				fullstream.currentChannel.status = a.livestream[0].media_name+' is playing '+a.livestream[0].category_name;
			}
			
			fullstream.currentChannel.genre = a.livestream[0].category_name;
			fullstream.currentChannel.genreUrl = ' <a href="http://www.hitbox.tv/game/'+a.livestream[0].category_seo_key+'" target="_blank">'+a.livestream[0].category_name+'</a>';
			fullstream.currentChannel.followers = a.livestream[0].channel.followers;
			fullstream.currentChannel.populate();
		});
	}
	else if(this.service == 'streamup'){
		fullstream.currentChannel.url = ' <a href="https://streamup.com/'+this.id+'" target="_blank">'+this.id+'</a>';
		fullstream.currentChannel.populate();
	}
	else if(this.service == 'vaughnlive'){
		fullstream.currentChannel.url = ' <a href="https://vaughnlive.tv/'+this.id+'" target="_blank">'+this.id+'</a>';
		fullstream.currentChannel.populate();
	}
}

// Method to save various data to LocalStorage
fullstream.save = function(type){
	if(type == 'channels'){
		localStorage.otherChannels = JSON.stringify(fullstream.otherChannels);
		localStorage.favorites = JSON.stringify(fullstream.favorites);
		localStorage.switcher = JSON.stringify(fullstream.switcherChannels);
	}
	else if(type == 'settings'){
		localStorage.settings = JSON.stringify(fullstream.settings);
	}
}

// Method to get various data from LocalStorage
fullstream.load = function(type){
	if(type == 'channels'){
		if(localStorage.otherChannels != undefined){
			var tempArray = JSON.parse(localStorage.otherChannels);
			for(site in tempArray){
				if(tempArray[site].length && site != 'justin'){
					fullstream.otherChannels[site] = tempArray[site];;
				}
			}
		}
		if(localStorage.favorites != undefined){
			fullstream.favorites = JSON.parse(localStorage.favorites);
		}
		if(localStorage.switcher != undefined){
			fullstream.switcherChannels = JSON.parse(localStorage.switcher);
		}
	}
	else if(type == 'settings'){
		if(localStorage.settings != undefined){
			var tempSettings = JSON.parse(localStorage.settings);
			for(setting in fullstream.settings){
				for(tempSetting in tempSettings){
					if(setting == tempSetting){
						fullstream.settings[setting] = tempSettings[tempSetting];
					}
				}
			}
		}
	}
}

// Method to add a single channel to the channels array
fullstream.addChannel = function(site, channel){
	var allreadyAdded = false;
	for(key in fullstream.channels){
		for(var i=0; i<fullstream.channels[key].length; i++){
			if(fullstream.channels[key][i] == channel && key == site){
				allreadyAdded = true;
			}
		}
	}
	if(allreadyAdded == false){
		var channels = fullstream.channels[site];
		var channelsData = fullstream.channelsData[site];
		channels[channels.length] = channel;
		fullstream.save('channels');
		fullstream.channelsToData();
		fullstream.updateData();
		fullstream.channelOptions();
		setTimeout(function(){
			fullstream.populate();
		},1000);
		notify('You added '+channel+' from '+site+' to the channel list. It might take up to 1 minute for the list status to update.');
	}
	else{
		notify('The channel was already added');
	}
};

// Method to remove a single channel from the channels array
fullstream.removeChannel = function(cat, id){ // Deletes a channel
	var arr1 = fullstream.otherChannels[cat];
	var arr2 = fullstream.channelsData;
	for(var i=0; i<arr1.length; i++){
		if(arr1[i] == id){
			arr1.splice(i, 1);
		}
	}	
	delete arr2[cat][id];
	fullstream.populate();
	fullstream.save('channels');	
}

// Method to generates drop down list of channels for the switcher and default channels drop downs
fullstream.channelOptions = function(){ 
	$('#switcherChannelsSelect').html('');
	$('#defaultChannelSelect').html('');
	if(fullstream.settings['defaultChannel'] != 'none'){
		$('#defaultChannelSelect').append($('<option></option>').html(fullstream.settings['defaultChannel']));
	}
	$('#defaultChannelSelect').append($('<option></option>').html('none'));
	
	for(channel in fullstream.channels){
		$('#switcherChannelsSelect').append($('<option></option>').html(fullstream.channels[channel]));
		$('#defaultChannelSelect').append($('<option></option>').html(fullstream.channels[channel]));
	}
};

// Method to add a channel to the switcher
fullstream.addSwitcherChannel = function(string){
	if(string[0] != '*'){
		var allreadyAdded = false;
		for(chan in fullstream.switcherChannels){
			if(fullstream.switcherChannels[chan] == string){
				allreadyAdded = true;
			}
		}
		if(allreadyAdded == false){
			if(fullstream.switcherChannels.length == 0){
				showMenuItem('#opt2');
			}
			fullstream.switcherChannels[fullstream.switcherChannels.length] = string;
			fullstream.save('channels');
			notify(string+' was added to the switcher.');
		}
		else{
			notify(string+' is allready added to the Switcher.');
		}
	}
}

// Method to move a switcher channels around when being drag and dropped
fullstream.moveSwitcherChannel = function (old_index, new_index){
    if (new_index >= fullstream.switcherChannels.length) {
        var k = new_index - fullstream.switcherChannels.length;
        while ((k--) + 1) {
            fullstream.switcherChannels.push(undefined);
        }
    }
    fullstream.switcherChannels.splice(new_index, 0, fullstream.switcherChannels.splice(old_index, 1)[0]);
};

// Method to generate initial channels data array from channels array
fullstream.channelsToData = function(){
	for(x in fullstream.channels.sort()){
		var video = 'http://www.twitch.tv/widgets/live_embed_player.swf?channel='+fullstream.channels[x]+'&start_volume=100';
		var chat = 'http://twitch.tv/chat/embed?channel='+fullstream.channels[x]+'&amp;popout_chat=true';
		var channelsDataNew = {
			id:fullstream.channels[x], 
			live:false, 
			service:'twitch', 
			videoEmbed:video, 
			chatEmbed:chat, 
			status:"", 
			viewers:"", 
			genre:""
		};
		fullstream.channelsData['twitch'][fullstream.channels[x]] = channelsDataNew;
	}
	for(site in fullstream.otherChannels){
		for(y in fullstream.otherChannels[site]){
			var channel = fullstream.otherChannels[site][y];
			var video = '';
			var chat = '';
			if(site == 'hitbox'){
				video = 'http://www.hitbox.tv/embed/'+channel+'?autoplay=true';
				chat = 'http://www.hitbox.tv/embedchat/'+channel;
			}
			else if(site == 'streamup'){
				video = 'https://streamup.com/rooms/'+channel+'/plugins/video/show?autoplayAudio=true';
				chat = 'chatNotSupported.html';
			}
			else if(site == 'vaughnlive'){
				video = 'http://vaughnlive.tv/embed/video/'+channel;
				chat = 'http://vaughnlive.tv/embed/chat/'+channel;
			}
			var channelsDataNew = {
				id:fullstream.otherChannels[site][y], 
				live:true, 
				service:site, 
				videoEmbed:video, 
				chatEmbed:chat,
				name:fullstream.otherChannels[site][y],
				status:null, 
				viewers:null, 
				genre:null
			};
			fullstream.channelsData[site][fullstream.otherChannels[site][y]] = channelsDataNew;
		}
	}
};

// Method to Import/update channels from twitch APIs
fullstream.updateChannels = function(){
	if(fullstream.settings.twitchUser != ''){
		fullstream.channels = [];
		fullstream.getChannels(0);
	}
}
fullstream.getChannels = function(offset){
	url = 'https://api.twitch.tv/kraken/users/'+fullstream.settings.twitchUser+'/follows/channels?limit=100&offset='+offset+'&callback=?';
	$.getJSON(url, function(a){
		if(a != undefined && a.follows != undefined){
			for(x in a.follows){
				fullstream.channels[fullstream.channels.length] = a.follows[x].channel.name;
			}
			if(a.follows.length >= 100){
				fullstream.getChannels(offset+100);
			}
			else{
				fullstream.channelOptions();
				fullstream.log('Fetched '+fullstream.channels.length+' channels from Twitch.tv using username: '+fullstream.settings.twitchUser);
			}
		}
	});
}

// Method to get channels via specific game
fullstream.getGameChannels = function(game, offset){
	loading = true;
	url = 'https://api.twitch.tv/kraken/search/streams?limit=100&offset='+offset+'&q='+game+'&callback=?';
	$.getJSON(url, function(a){
		if(a.streams != undefined){
			if(offset == 0){
				$(gameList).html('');
				var gameHeader = new channelSplitter(game, 'fa-gamepad', 'herp');
				$(gameList).append(gameHeader.listItem);
			}
			for(chan in a.streams){
				if(a.streams[chan].game == game && a.streams[chan].game != 'null'){
					var video = 'http://www.twitch.tv/widgets/live_embed_player.swf?channel='+a.streams[chan].channel.name+'&start_volume=100';
					var chat = 'http://twitch.tv/chat/embed?channel='+a.streams[chan].channel.name+'&amp;popout_chat=true';
					var li = new aChannel('twitch', a.streams[chan].channel.name, true, video, chat, a.streams[chan].channel.name, a.streams[chan].channel.status, game, a.streams[chan].viewers, a.streams[chan].channel.logo);
					$(gameList).append(li.asListItem());
				}
			}
			if(a.streams.length >= 100){
				fullstream.getGameChannels(game, offset+100);
			}
		}
		else{
			notify('Error loading channels, please try again later.');
			hideMenuItem('#opt5');
			$('#tab1')[0].checked = true;
		}
		loading = false;
	});
}

// Method to get twitch VODs of current channel being watched
fullstream.getVods = function(channel, offset){
	url = 'https://api.twitch.tv/kraken/channels/'+channel+'/videos?limit=100&offset='+offset+'&callback=?';
	$.getJSON(url, function(a){
		if(offset == 0){
			if(a.videos.length > 0){
				showMenuItem('#opt6');
			}else{
				hideMenuItem('#opt6');
			}
			$(vodList).html('');
			var vodHeader = new channelSplitter(fullstream.currentChannel.name, 'fa-file-video-o', 0);
			$(vodList).append(vodHeader.listItem);
		}
		for(vod in a.videos){
			var newVod = new aVod(a.videos[vod].title, a.videos[vod]._id, a.videos[vod].description, a.videos[vod].game, a.videos[vod].length, a.videos[vod].preview, a.videos[vod].recorded_at, a.videos[vod].views, channel);
			
			$(vodList).append(newVod.asListItem());
		}
		if(a.videos.length >= 100){
			fullstream.getVods(channel, offset+100);
		}
	});
}

// Method to changes the video and chat embed as well as the current channel object
fullstream.changeChannel = function(videoEmbed, chatEmbed, id, service){
	fullstream.log('Switching channel to '+id+' from '+service)
	loading = true;
	fullstream.currentChannel.id = id;
	fullstream.currentChannel.service = service;
	fullstream.currentChannel.update();
	fullstream.populate();

	$(videoTarget).attr('src', videoEmbed);
	if(service != 'vod'){
		$(chatTarget).attr('src', chatEmbed);
	}

	if(fullstream.settings['chatSetting'] && service != 'streamup' && service != 'vod'){
		setTimeout(function(){
			switchTab('#opt0');
		}, 2000);
	}

	if(service == 'streamup'){
		hideMenuItem('#opt0');
	}else{
		showMenuItem('#opt0');
	}

	if(service != 'twitch' && service != 'vod'){
		hideMenuItem('#opt6');
	}

	if(service == 'twitch'){
		fullstream.getVods(id, 0);
	}

	setTimeout(function(){
		loading = false;
	},5000);
}

// Method to change PiP channel embed
fullstream.changePipChannel = function(videoEmbed){
	if($('#pipbox').css('display') == 'none'){
		$('#pipbox').css('display', 'block');
	}
	$(pipTarget).attr('src', videoEmbed);
}

// Method to populate the channels list with data from the channels data array
fullstream.populate = function(){
	if(fullstream.anyChannels()){
		var arr = fullstream.channelsData;
		var favs = fullstream.favorites;
		$(channelList).html('');
		
		// Populates channels list with favorited channels if any
		if(fullstream.favorites.length > 0){
			var favSplitter = new channelSplitter('favorites', 'fa-heart');
			$(channelList).append(favSplitter.listItem());
			
			if(fullstream.collapsed['favorites'] == false){
				for(channel in favs.sort()){
					for(chanl in arr['twitch']){
						if(favs[channel] == arr['twitch'][chanl].id && arr['twitch'][chanl].live){
							var chan = arr['twitch'][chanl];
							var li = new aChannel(chan.service, chan.id, chan.live, chan.videoEmbed, chan.chatEmbed, chan.name, chan.status, chan.genre, chan.viewers, chan.logo);
							$(channelList).append(li.asListItem());
						}
					}
				}
				for(channel in favs.sort()){
					for(chanl in arr['twitch']){
						if(favs[channel] == arr['twitch'][chanl].id && arr['twitch'][chanl].live == false){
							var chan = arr['twitch'][chanl];
							var li = new aChannel(chan.service, chan.id, chan.live, chan.videoEmbed, chan.chatEmbed, chan.name, chan.status, chan.genre, chan.viewers, chan.logo);
							$(channelList).append(li.asListItem());
						}
					}
				}	
			}
		}

		// populates the channels list with non twitch channels if any
		for(key in arr){
			if(fullstream.anyOnline(arr[key]) > 0 && key != 'twitch'){
				var otherSplitter = new channelSplitter(key, 'fa-video-camera');
				$(channelList).append(otherSplitter.listItem());

				if(fullstream.collapsed[key] == false){
					for(channel in arr[key]){
						if(arr[key][channel].live == true){
							var chan = arr[key][channel];
							var li = new aChannel(chan.service, chan.id, chan.live, chan.videoEmbed, chan.chatEmbed, chan.name, chan.status, chan.genre, chan.viewers, chan.logo);						
							$(channelList).append(li.asListItem());
						}
					}
				}
			}
		}

		// populates the channels list with twitch channels if any
		for(key in arr){
			if(key == 'twitch'){
				if(fullstream.channels.length > 0){
					if(fullstream.favorites.length > 0 || fullstream.anyOtherChannels()){
						if(fullstream.anyLiveTwitchChannels() == false && fullstream.settings['offlineChannels'] == true){}
						else{
							var twitchSplitter = new channelSplitter(key, 'fa-twitch');
							$(channelList).append(twitchSplitter.listItem());
						}
					}
				}
				if(fullstream.collapsed['twitch'] == false){
					// populates the channels list with online twitch channels if any
					for(channel in arr[key]){
						if(arr[key][channel].live == true){
							var chan = arr[key][channel];
							var li = new aChannel(chan.service, chan.id, chan.live, chan.videoEmbed, chan.chatEmbed, chan.name, chan.status, chan.genre, chan.viewers, chan.logo);
							if(isFavorite(chan.id)){
								$(channelList).append(li.asListItem());
							}
						}
					}
					// populates the channels list with offline twitch channels if any
					for(channel in arr[key]){
						if(fullstream.settings['offlineChannels'] == false){
							if(arr[key][channel].live == false ){
								var chan = arr[key][channel];
								var li = new aChannel(chan.service, chan.id, chan.live, chan.videoEmbed, chan.chatEmbed, chan.name, chan.status, chan.genre, chan.viewers, chan.logo);
								if(isFavorite(chan.id)){
									$(channelList).append(li.asListItem());
								}
							}
						}
					}
				}
			}
		}
		if(fullstream.anyLiveTwitchChannels() == false && fullstream.settings['offlineChannels'] == true && fullstream.favorites.length == 0 && fullstream.anyOtherChannels() == false){
			$(channelList).html('<h3>No channels on your list are currently streaming</h3>');
		}
		fullstream.log('Populated updated channel data to channels list');
	}
	else{
		$(channelList).html('<h3>You don\'t have any channels, please add or import some in the settings menu.</h3>');
	}
};

// Method to populate the switcher with channels in the switcher array
fullstream.populateSwitcher = function(){
	$('#switcherChannels').html('');
	for(chan in fullstream.switcherChannels){
		for(channel in fullstream.channels){
			if(fullstream.channels[channel] == fullstream.switcherChannels[chan]){
				var switcherChan = new aSwitcherChannel(chan, fullstream.switcherChannels[chan]);
				$('#switcherChannels').append(switcherChan.asSection());
			}
		}
	}
}

// Method to update the channels data array from various APIs
fullstream.updateData = function(){
	if(fullstream.channels.length != 0){
		var twitch = fullstream.channelsData['twitch'];
		var channelsString = '';		
		for(x in fullstream.channels){
			channelsString += fullstream.channels[x]+',';
		}
		var url = 'https://api.twitch.tv/kraken/streams?callback=?&jsonp=?&channel='+channelsString;
		$.getJSON(url, function(a){
			if(a.streams != undefined || a != undefined){
				if(a.streams.length == 0 && APIErrorCheck < 3){
					APIErrorCheck += 1;
				}
				if(a.streams.length > 0){
					APIErrorCheck = 0;
				}
				for(chan in twitch){
					var pass = false;
					for(var x=0; x < a.streams.length; x++){
						if(twitch[chan].id == a.streams[x].channel.name){
							var newChan = new aChannel('twitch', twitch[chan].id, true, twitch[chan].videoEmbed, twitch[chan].chatEmbed, a.streams[x].channel.display_name, a.streams[x].channel.status, a.streams[x].channel.game, a.streams[x].viewers, a.streams[x].channel.logo);
							pass = true;
						}
					}
					if(pass == false){
						var newChan = new aChannel('twitch', twitch[chan].id, false, twitch[chan].videoEmbed, twitch[chan].chatEmbed);
					}
					twitch[chan] = newChan.asJson();
				}
			}
			if(APIErrorCheck > 0 && APIErrorCheck < 3){
				fullstream.log('API request failed, retrying '+APIErrorCheck+' time(s)');
				fullstream.updateData();
			}
		})
		.success(function() {
			fullstream.log('Updated '+fullstream.anyOnline(fullstream.channelsData['twitch'])+'/'+fullstream.channels.length+' channels from Twitch.tv');
			fullstream.currentChannel.update();
			fullstream.populate();
			fullstream.populateSwitcher();
			if(fullstream.settings['switcherSetting']){
				fullstream.switcher();
			}
		});
	}
}

// Method to detect and switch to top channel in switcher array that is online
fullstream.switcher = function(){
	var switched = false;
	for(chan in fullstream.switcherChannels){
		var selChan = fullstream.switcherChannels[chan];
		if(fullstream.channelsData['twitch'][selChan] != undefined && switched == false){
			if(fullstream.channelsData['twitch'][selChan].live){
				if(fullstream.currentChannel.id == selChan){
					switched = true;
				}
				else if(fullstream.currentChannel.id != selChan){
					var cha = fullstream.channelsData['twitch'][selChan];
					fullstream.changeChannel(cha.videoEmbed, cha.chatEmbed, cha.id, cha.service, cha.viewers);
					switched = true;
				}
			}
		}
	}
};

// Channel Object constructor
function aChannel(service, id, live, videoEmbed, chatEmbed, name, status, genre, viewers, logo){	
	this.asJson = function(){
		status = cleanStatus(status);
		var Json = {};
		Json.service = service;
		Json.id = id;
		Json.live = live;
		Json.name = name;
		Json.status = status;
		Json.genre = genre;
		Json.viewers = viewers;
		Json.logo = logo;
		Json.videoEmbed = videoEmbed;
		Json.chatEmbed = chatEmbed;
		return Json;
	};
	this.asListItem = function(){
		status = cleanStatus(status);
		var li = $('<li></li>');
		var ul = $('<ul></ul>');
		var nametag = $('<li></li>');
		var picture = $('<li></li>');
		var img = $('<img />');
		
		if(logo != undefined){
			$(img).attr('src', logo);
		}
		else if(logo == undefined && live){
			$(img).attr('src', 'images/online.png');
		}
		else{
			$(img).attr('src', 'images/offline.png');
		}
		$(picture).append(img);
		
		if(live != false){
			if(fullstream.currentChannel.id == id){
				$(li).attr('class', 'selectedChannel channel live');
			}
			else{
				$(li).attr('class', 'channel live');
			}
			if(service == "twitch"){
				$(li).hover(function(){
					$(this).css('height', 'auto');
				},function(){
					$(this).css('height', '32px');
				});
			}

			var viewerCount = formatnum(viewers)+' Viewers';
			if(viewers == 1){
				viewerCount = formatnum(viewers)+' Viewer';
			}
			$(nametag).html('<b>'+name+'</b>');
			if(status){
				var details = $('<li class="details"></li>').html('Game: '+genre+' | '+viewerCount+'<br><br>Status:<br>'+status);
			}
			
		}
		else{
			if(fullstream.currentChannel.id == id){
				$(li).attr('class', 'selectedChannel channel offline');
			}
			else{
				$(li).attr('class', 'channel offline')
			}
			$(nametag).html('<b>'+id+'</b>');
		}
		$(ul).append(picture)
		var controls = $('<li></li>');
		var play = $('<i class="fa fa-play"></i>');
		
		var fav = $('<i class="fa fa-heart notFavorite"></i>');
		if(isFavorite(id, service) == false){
			fav = $('<i class="fa fa-heart isFavorite"></i>');
		}

		var pip = $('<i class="fa fa-external-link-square"></i>');
		if(service == "twitch"){
			var game = $('<i class="fa fa-gamepad"></i>');
			$(game).click(function(){
				fullstream.getGameChannels(genre, 0);
				showMenuItem('#opt5');
				$('#tab5')[0].checked = true;
			});
		}
		var addToSwitcher = $('<i class="notSwitcher fa fa-th-list"></i>');
		for(chanl in fullstream.switcherChannels){
			if(fullstream.switcherChannels[chanl] == id){
				addToSwitcher = $('<i class="isSwitcher fa fa-th-list"></i>');
			}
		}
		var deleteButton = $('<i class="fa fa-trash-o"></i>');

		$(play).click(function(){
			if(fullstream.settings['switcherSetting']){
				notify('The Switcher is currently on and might change the channel!')
			}
			fullstream.changeChannel(videoEmbed, chatEmbed, id, service);
		});
		$(pip).click(function(){
			fullstream.changePipChannel(videoEmbed);
		});
		$(fav).click(function(){
			var favs = fullstream.favorites;
			var allreadyFavorited = false;
			for(channel in favs){
				if(favs[channel] == id){
					allreadyFavorited = true;
				}
			}

			if(allreadyFavorited == false){
				fullstream.favorites[fullstream.favorites.length] = id;
				notify(id+' was added to favorites.');
			}
			else{
				for(channel in favs){
					if(favs[channel] == id){
						favs.splice(channel, 1);
						notify(id+' was removed from favorites.');
					}
				}
			}
			fullstream.save('channels');
			fullstream.populate();
		});

		var chanSwitch = true;
		$(fav).mouseover(function(){
			chanSwitch = false;
		})
		$(pip).mouseover(function(){
			chanSwitch = false;
		})
		$(game).mouseover(function(){
			chanSwitch = false;
		})
		$(addToSwitcher).mouseover(function(){
			chanSwitch = false;
		})
		$(deleteButton).mouseover(function(){
			chanSwitch = false;
		})
		$(fav).mouseout(function(){
			chanSwitch = true;
		})
		$(pip).mouseout(function(){
			chanSwitch = true;
		})
		$(game).mouseout(function(){
			chanSwitch = true;
		})
		$(addToSwitcher).mouseout(function(){
			chanSwitch = true;
		})
		$(deleteButton).mouseout(function(){
			chanSwitch = true;
		})
		$(li).click(function(){
			if(chanSwitch == true){
				if(fullstream.settings['switcherSetting']){
					notify('The Switcher is currently on and might change the channel!')
				}
				fullstream.changeChannel(videoEmbed, chatEmbed, id, service);
			}
		});
		$(deleteButton).click(function(){
			fullstream.removeChannel(service, id);
			fullstream.populate();
		});
		$(addToSwitcher).click(function(){
			fullstream.addSwitcherChannel(id);
			fullstream.populateSwitcher();
			fullstream.populate();
		});
		$(controls).append(play);
		$(controls).append(pip);
		if(service == "twitch"){
			$(controls).append(fav);
			if(live){
				$(controls).append(game);
			}
			$(controls).append(addToSwitcher);
		}
		if(service != 'twitch'){
			$(controls).append(deleteButton);
		}
		$(controls).attr('class', 'controls');
		
		$(ul).append(nametag);
		if(live != false){
			$(ul).append(details)
		}
		$(li).append(controls)
		$(li).append(ul);
		
		return li;
	};
}

// Switcher channel object constructor
function aSwitcherChannel(num, name){
	this.asSection = function(){
		var section = document.createElement('section');
		section.setAttribute('class', 'switcherChannel');
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
			fullstream.populateSwitcher();
		}, false);
		section.addEventListener("dragover", function(e){
			if (e.preventDefault) {
				e.preventDefault();
			}
			e.dataTransfer.dropEffect = 'move';
			stop = num;
			if(stop < start){
				$(this).css('border-top', '2px solid red');
			}
			else if(stop > start){
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
			fullstream.switcherChannels.splice(num, 1);
			fullstream.save('channels');
			fullstream.populateSwitcher();
			fullstream.populate();
			if(fullstream.switcherChannels.length == 0){
				hideMenuItem('#opt2');
			}
		});
		
		$(section).append(span);
		$(section).append(trash);
		
		return section;
	}
}

// channelSplitter constructor
function channelSplitter(name, logo, alt){
	this.listItem = function(){		
		var li = document.createElement('li');
		var h4 = document.createElement('h4');
		var icon = document.createElement('i');
		var collapser = document.createElement('i');

		li.setAttribute('class', 'channelSplitter');
		icon.setAttribute('class', 'fa '+logo);
		if(alt == undefined){	
			if(fullstream.collapsed[name]){
				collapser.setAttribute('class', 'fa fa-caret-down');
			}else{
				collapser.setAttribute('class', 'fa fa-caret-up');
			}
		}

		$(collapser).click(function(){
			if(fullstream.collapsed[name]){
				fullstream.collapsed[name] = false;
			}else{
				fullstream.collapsed[name] = true;
			}
			fullstream.populate();
		});

		$(h4).append(icon);
		if(alt == undefined){
			$(h4).append(name);
		}else if(alt != 0){
			$(h4).append('Channels streaming:<br>'+name);
		}else if(alt == 0){
			$(h4).append('Hightlights from: '+name);
		}
		$(h4).append(collapser);
		$(li).append(h4);

		return li;
	}
}

// VoD constructor
function aVod(title, id, description, game, length, img, date, views, channel){
	this.asListItem = function(){
		var li = $('<li class="channel vod"></li>');
		var pre = $('<img src="'+img+'"/>')
		var details = $('<ul class="VodDetails"></ul>');
		var videoEmbed = 'http://www.twitch.tv/widgets/live_embed_player.swf?channel='+channel+'&start_volume=100&chapter_id='+id.substring(1, id.lenght);
		for(var i=1; i<6; i++){
			var string = '';
			switch(i){
				case 1:
					string = title+'<br><br>';
					break;
				case 2:
					string = description;
					break
				case 3:
					string = '';
					break
				case 4:
					string = '<br>Length: '+formatTime(length);
					break;
				case 5:
					string = 'Recorded: '+formateDate(date);
					break;
			}
			var detailLi = $('<li>'+string+'</li>');
			details.append(detailLi);
		}

		li.append(pre);
		li.append(details);

		$(li).click(function(){
			fullstream.currentChannel.status = title;
			fullstream.currentChannel.views = views;
			fullstream.currentChannel.genre = game;
			fullstream.currentChannel.genreUrl = ' <a href="http://twitch.tv/directory/game/'+game+'" target="_blank">'+game+'</a>';
			fullstream.changeChannel(videoEmbed, '', channel, 'vod');
		});

		return li;
	}
}