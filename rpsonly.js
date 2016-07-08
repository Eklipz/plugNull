/**
 *Copyright 2014 Yemasthui
 *Modifications (including forks) of the code to fit personal needs are allowed only for personal use and should refer back to the original source.
 *This software is not for profit, any extension, or unauthorised person providing this software is not authorised to be in a position of any monetary gain from this use of this software. Any and all money gained under the use of the software (which includes donations) must be passed on to the original author.
 */


(function () {


var socket = function () {
function loadSocket() {
SockJS.prototype.msg = function(a){this.send(JSON.stringify(a))};
sock = new SockJS('https://benzi.io:4964/socket');
sock.onopen = function() {
console.log('Connected to socket!');
sendToSocket();
};
sock.onclose = function() {
console.log('Disconnected from socket, reconnecting every minute ..');
var reconnect = setTimeout(function(){ loadSocket() }, 60 * 1000);
};
sock.onmessage = function(broadcast) {
var rawBroadcast = broadcast.data;
var broadcastMessage = rawBroadcast.replace(/["\\]+/g, '');
API.chatLog(broadcastMessage);
console.log(broadcastMessage);
};
}
if (typeof SockJS == 'undefined') {
$.getScript('https://cdn.jsdelivr.net/sockjs/0.3.4/sockjs.min.js', loadSocket);
} else loadSocket();
}

var sendToSocket = function () {
var basicBotSettings = basicBot.settings;
var basicBotRoom = basicBot.room;
var basicBotInfo = {
time: Date.now(),
version: basicBot.version
};
var data = {users:API.getUsers(),userinfo:API.getUser(),room:location.pathname,basicBotSettings:basicBotSettings,basicBotRoom:basicBotRoom,basicBotInfo:basicBotInfo};
return sock.msg(data);
};

    var storeToStorage = function () {
        localStorage.setItem("basicBotsettings", JSON.stringify(basicBot.settings));
        localStorage.setItem("basicBotRoom", JSON.stringify(basicBot.room));
        var basicBotStorageInfo = {
            time: Date.now(),
            stored: true,
            version: basicBot.version
        };
        localStorage.setItem("basicBotStorageInfo", JSON.stringify(basicBotStorageInfo));

    };

    var subChat = function (chat, obj) {
        if (typeof chat === "undefined") {
            API.chatLog("There is a chat text missing.");
            console.log("There is a chat text missing.");
            return "[Error] No text message found.";
        }
        var lit = '%%';
        for (var prop in obj) {
            chat = chat.replace(lit + prop.toUpperCase() + lit, obj[prop]);
        }
        return chat;
    };

    var loadChat = function (cb) {
        if (!cb) cb = function () {
        };
        $.get("https://rawgit.com/Eklipz/plugNull/master/lang/langIndex.json", function (json) {
            var link = basicBot.chatLink;
            if (json !== null && typeof json !== "undefined") {
                langIndex = json;
                link = langIndex[basicBot.settings.language.toLowerCase()];
                if (basicBot.settings.chatLink !== basicBot.chatLink) {
                    link = basicBot.settings.chatLink;
                }
                else {
                    if (typeof link === "undefined") {
                        link = basicBot.chatLink;
                    }
                }
                $.get(link, function (json) {
                    if (json !== null && typeof json !== "undefined") {
                        if (typeof json === "string") json = JSON.parse(json);
                        basicBot.chat = json;
                        cb();
                    }
                });
            }
            else {
                $.get(basicBot.chatLink, function (json) {
                    if (json !== null && typeof json !== "undefined") {
                        if (typeof json === "string") json = JSON.parse(json);
                        basicBot.chat = json;
                        cb();
                    }
                });
            }
        });
    };

    var retrieveSettings = function () {
        var settings = JSON.parse(localStorage.getItem("basicBotsettings"));
        if (settings !== null) {
            for (var prop in settings) {
                basicBot.settings[prop] = settings[prop];
            }
        }
    };

    var retrieveFromStorage = function () {
        var info = localStorage.getItem("basicBotStorageInfo");
        if (info === null) API.chatLog(basicBot.chat.nodatafound);
        else {
            var settings = JSON.parse(localStorage.getItem("basicBotsettings"));
            var room = JSON.parse(localStorage.getItem("basicBotRoom"));
            var elapsed = Date.now() - JSON.parse(info).time;
            if ((elapsed < 1 * 60 * 60 * 1000)) {
                API.chatLog(basicBot.chat.retrievingdata);
                for (var prop in settings) {
                    basicBot.settings[prop] = settings[prop];
                }
                basicBot.room.users = room.users;
                basicBot.room.afkList = room.afkList;
                basicBot.room.historyList = room.historyList;
                basicBot.room.mutedUsers = room.mutedUsers;
                // basicBot.room.autoskip = room.autoskip;
                basicBot.room.roomstats = room.roomstats;
                basicBot.room.messages = room.messages;
                basicBot.room.queue = room.queue;
                basicBot.room.newBlacklisted = room.newBlacklisted;
                API.chatLog(basicBot.chat.datarestored);
            }
        }
        var json_sett = null;
        var roominfo = document.getElementById("room-settings");
        info = roominfo.textContent;
        var ref_bot = "@basicBot=";
        var ind_ref = info.indexOf(ref_bot);
        if (ind_ref > 0) {
            var link = info.substring(ind_ref + ref_bot.length, info.length);
            var ind_space = null;
            if (link.indexOf(" ") < link.indexOf("\n")) ind_space = link.indexOf(" ");
            else ind_space = link.indexOf("\n");
            link = link.substring(0, ind_space);
            $.get(link, function (json) {
                if (json !== null && typeof json !== "undefined") {
                    json_sett = JSON.parse(json);
                    for (var prop in json_sett) {
                        basicBot.settings[prop] = json_sett[prop];
                    }
                }
            });
        }

    };

    String.prototype.splitBetween = function (a, b) {
        var self = this;
        self = this.split(a);
        for (var i = 0; i < self.length; i++) {
            self[i] = self[i].split(b);
        }
        var arr = [];
        for (var i = 0; i < self.length; i++) {
            if (Array.isArray(self[i])) {
                for (var j = 0; j < self[i].length; j++) {
                    arr.push(self[i][j]);
                }
            }
            else arr.push(self[i]);
        }
        return arr;
    };

String.prototype.startsWith = function(str) {
return this.substring(0, str.length) === str;
};

    function linkFixer(msg) {
        var parts = msg.splitBetween('<a href="', '<\/a>');
        for (var i = 1; i < parts.length; i = i + 2) {
            var link = parts[i].split('"')[0];
            parts[i] = link;
        }
        var m = '';
        for (var i = 0; i < parts.length; i++) {
            m += parts[i];
        }
        return m;
    };

        function decodeEntities(s) {
var str, temp = document.createElement('p');
temp.innerHTML = s;
str = temp.textContent || temp.innerText;
temp = null;
return str;
}; 

    var botCreator = "Matthew (Yemasthui)";
    var botMaintainer = "Benzi"
    var botCreatorIDs = ["3851534", "4105209"];

    var basicBot = {
        version: "4.20",
        status: false,
        name: "nullBot",
        loggedInID: null,
        scriptLink: "https://rawgit.com/Eklipz/plugNull/master/heart.js",
        cmdLink: "https://git.io/vKvpm",
        chatLink: "https://rawgit.com/Eklipz/plugNull/master/lang/en.json",
        chat: null,
        loadChat: loadChat,
        retrieveSettings: retrieveSettings,
        retrieveFromStorage: retrieveFromStorage,
        settings: {
            botName: "nullBot",
            language: "english",
            chatLink: "https://rawgit.com/Eklipz/plugNull/master/lang/en.json",
            scriptLink: "https://rawgit.com/Eklipz/plugNull/master/heart.js",
            startupCap: 1, // 1-200
            startupVolume: 0, // 0-100
            startupEmoji: false, // true or false
            autowoot: true,
            commandCooldown: 30,
            usercommandsEnabled: true,
            commandLiteral: "$"
        },
        room: {
            name: null,
        chatMessages: [], 
            users: [],
            afkList: [],
            mutedUsers: [],
            bannedUsers: [],
            skippable: true,
            usercommand: true,
            allcommand: true,
            roomstats: {
                accountName: null,
                totalWoots: 0,
                totalCurates: 0,
                totalMehs: 0,
                launchTime: null,
                songCount: 0,
                chatmessages: 0
            },
            messages: {
                from: [],
                to: [],
                message: []
            },
            queue: {
                id: [],
                position: []
            },
        },
        User: function (id, name) {
            this.id = id;
            this.username = name;
            this.jointime = Date.now();
            this.lastActivity = Date.now();
            this.votes = {
                woot: 0,
                meh: 0,
                curate: 0
            };
            this.lastEta = null;
            this.afkWarningCount = 0;
            this.afkCountdown = null;
            this.inRoom = true;
            this.isMuted = false;
            this.lastDC = {
                time: null,
                position: null,
                songCount: 0
            };
            this.lastKnownPosition = null;
        },
        userUtilities: {
            getJointime: function (user) {
                return user.jointime;
            },
            getUser: function (user) {
                return API.getUser(user.id);
            },
            updatePosition: function (user, newPos) {
                user.lastKnownPosition = newPos;
            },
            setLastActivity: function (user) {
                user.lastActivity = Date.now();
                user.afkWarningCount = 0;
                clearTimeout(user.afkCountdown);
            },
            getLastActivity: function (user) {
                return user.lastActivity;
            },
            lookupUser: function (id) {
                for (var i = 0; i < basicBot.room.users.length; i++) {
                    if (basicBot.room.users[i].id === id) {
                        return basicBot.room.users[i];
                    }
                }
                return false;
            },
            lookupUserName: function (name) {
                for (var i = 0; i < basicBot.room.users.length; i++) {
                    var match = basicBot.room.users[i].username.trim() == name.trim();
                    if (match) {
                        return basicBot.room.users[i];
                    }
                }
                return false;
            },
            getPermission: function (obj) { //1 requests
                var u;
                if (typeof obj === "object") u = obj;
                else u = API.getUser(obj);
                for (var i = 0; i < botCreatorIDs.length; i++) {
                    if (botCreatorIDs[i].indexOf(u.id) > -1) return 10;
                }
                if (u.gRole < 2) return u.role;
                else {
                    switch (u.gRole) {
                        case 2:
                            return 7;
                        case 3:
                            return 8;
                        case 4:
                            return 9;
                        case 5:
                            return 10;
                    }
                }
                return 0;
            }
        },

        roomUtilities: {
            rankToNumber: function (rankString) {
                var rankInt = null;
                switch (rankString) {
                    case "admin":
                        rankInt = 10;
                        break;
                    case "ambassador":
                        rankInt = 7;
                        break;
                    case "host":
                        rankInt = 5;
                        break;
                    case "cohost":
                        rankInt = 4;
                        break;
                    case "manager":
                        rankInt = 3;
                        break;
                    case "bouncer":
                        rankInt = 2;
                        break;
                    case "residentdj":
                        rankInt = 1;
                        break;
                    case "user":
                        rankInt = 0;
                        break;
                }
                return rankInt;
            },
            msToStr: function (msTime) {
                var ms, msg, timeAway;
                msg = '';
                timeAway = {
                    'days': 0,
                    'hours': 0,
                    'minutes': 0,
                    'seconds': 0
                };
                ms = {
                    'day': 24 * 60 * 60 * 1000,
                    'hour': 60 * 60 * 1000,
                    'minute': 60 * 1000,
                    'second': 1000
                };
                if (msTime > ms.day) {
                    timeAway.days = Math.floor(msTime / ms.day);
                    msTime = msTime % ms.day;
                }
                if (msTime > ms.hour) {
                    timeAway.hours = Math.floor(msTime / ms.hour);
                    msTime = msTime % ms.hour;
                }
                if (msTime > ms.minute) {
                    timeAway.minutes = Math.floor(msTime / ms.minute);
                    msTime = msTime % ms.minute;
                }
                if (msTime > ms.second) {
                    timeAway.seconds = Math.floor(msTime / ms.second);
                }
                if (timeAway.days !== 0) {
                    msg += timeAway.days.toString() + 'd';
                }
                if (timeAway.hours !== 0) {
                    msg += timeAway.hours.toString() + 'h';
                }
                if (timeAway.minutes !== 0) {
                    msg += timeAway.minutes.toString() + 'm';
                }
                if (timeAway.minutes < 1 && timeAway.hours < 1 && timeAway.days < 1) {
                    msg += timeAway.seconds.toString() + 's';
                }
                if (msg !== '') {
                    return msg;
                } else {
                    return false;
                }
            },
            

        eventChat: function (chat) {
            chat.message = linkFixer(chat.message);
            chat.message = decodeEntities(chat.message); 
            chat.message = chat.message.trim();
            
            basicBot.room.chatMessages.push([chat.cid, chat.message, chat.sub, chat.timestamp, chat.type, chat.uid, chat.un]); 
            
            for (var i = 0; i < basicBot.room.users.length; i++) {
                if (basicBot.room.users[i].id === chat.uid) {
                    basicBot.userUtilities.setLastActivity(basicBot.room.users[i]);
                    if (basicBot.room.users[i].username !== chat.un) {
                        basicBot.room.users[i].username = chat.un;
                    }
                }
            }
            if (basicBot.chatUtilities.chatFilter(chat)) return void (0);
            if (!basicBot.chatUtilities.commandCheck(chat))
                basicBot.chatUtilities.action(chat);
        },
        eventUserjoin: function (user) {
            var known = false;
            var index = null;
            for (var i = 0; i < basicBot.room.users.length; i++) {
                if (basicBot.room.users[i].id === user.id) {
                    known = true;
                    index = i;
                }
            }
            for (var j = 0; j < basicBot.room.users.length; j++) {
                if (basicBot.userUtilities.getUser(basicBot.room.users[j]).id === user.id) {
                    basicBot.userUtilities.setLastActivity(basicBot.room.users[j]);
                    basicBot.room.users[j].jointime = Date.now();
                }

            }
        },
        eventUserleave: function (user) {
            var lastDJ = API.getHistory()[0].user.id;
            for (var i = 0; i < basicBot.room.users.length; i++) {
                if (basicBot.room.users[i].id === user.id) {
                    basicBot.userUtilities.updateDC(basicBot.room.users[i]);
                    basicBot.room.users[i].inRoom = false;
                    if (lastDJ == user.id){
                        var user = basicBot.userUtilities.lookupUser(basicBot.room.users[i].id);
                        basicBot.userUtilities.updatePosition(user, 0);
                    }
                }
            }
        },

            commandCheck: function (chat) {
                var cmd;
                if (chat.message.charAt(0) === basicBot.settings.commandLiteral) {
                    var space = chat.message.indexOf(' ');
                    if (space === -1) {
                        cmd = chat.message;
                    }
                    else cmd = chat.message.substring(0, space);
                }
                
                var executed = false;

                for (var comm in basicBot.commands) {
                    var cmdCall = basicBot.commands[comm].command;
                    if (!Array.isArray(cmdCall)) {
                        cmdCall = [cmdCall]
                    }
                    for (var i = 0; i < cmdCall.length; i++) {
                        if (basicBot.settings.commandLiteral + cmdCall[i] === cmd) {
                            basicBot.commands[comm].functionality(chat, basicBot.settings.commandLiteral + cmdCall[i]);
                            executed = true;
                            break;
                        }
                    }
                }

                if (executed && userPerm === 0) {
                    basicBot.room.usercommand = false;
                    setTimeout(function () {
                        basicBot.room.usercommand = true;
                    }, basicBot.settings.commandCooldown * 1000);
                }
                if (executed) {
                    /*if (basicBot.settings.cmdDeletion) {
                        API.moderateDeleteChat(chat.cid);
                    }*/
                    //basicBot.room.allcommand = false;
                    //setTimeout(function () {
                        basicBot.room.allcommand = true;
                    //}, 5 * 1000);
                }
                return executed;
            },
            action: function (chat) {
                var user = basicBot.userUtilities.lookupUser(chat.uid);
                if (chat.type === 'message') {
                    for (var j = 0; j < basicBot.room.users.length; j++) {
                        if (basicBot.userUtilities.getUser(basicBot.room.users[j]).id === chat.uid) {
                            basicBot.userUtilities.setLastActivity(basicBot.room.users[j]);
                        }

                    }
                }
                basicBot.room.roomstats.chatmessages++;
            },
        },
        connectAPI: function () {
            this.proxy = {
                eventChat: $.proxy(this.eventChat, this),
                eventChatcommand: $.proxy(this.eventChatcommand, this),
                eventHistoryupdate: $.proxy(this.eventHistoryupdate, this),

            };
            API.on(API.CHAT, this.proxy.eventChat);
            API.on(API.CHAT_COMMAND, this.proxy.eventChatcommand);
            API.on(API.HISTORY_UPDATE, this.proxy.eventHistoryupdate);
        },
        disconnectAPI: function () {
            API.off(API.CHAT, this.proxy.eventChat);
            API.off(API.CHAT_COMMAND, this.proxy.eventChatcommand);
            API.off(API.HISTORY_UPDATE, this.proxy.eventHistoryupdate);
        },
        startup: function () {
            Function.prototype.toString = function () {
                return 'Function.'
            };
            var u = API.getUser();
            basicBot.connectAPI();

            basicBot.room.name = window.location.pathname
            var Check;

console.log(basicBot.room.name);

            var detect = function(){
                 if(basicBot.room.name != window.location.pathname){
                    console.log("Killing bot after room change.");
                    storeToStorage();
                    basicBot.disconnectAPI();
                    setTimeout(function () {
                        kill();
                    }, 1000);
                    if (basicBot.settings.roomLock){ 
                        window.location = 'https://plug.dj' + basicBot.room.name; 
                    }
                    else { 
                        clearInterval(Check); 
                    }
                }
            };

            Check = setInterval(function(){ detect() }, 2000);

            retrieveSettings();
            retrieveFromStorage();
            window.bot = basicBot;
            basicBot.loggedInID = API.getUser().id;
            basicBot.status = true;
            API.sendChat('/cap ' + basicBot.settings.startupCap);
            API.setVolume(basicBot.settings.startupVolume);
            if (basicBot.settings.autowoot) { 
            $("#woot").click();
            }
            if (basicBot.settings.startupEmoji) {
                var emojibuttonoff = $(".icon-emoji-off");
                if (emojibuttonoff.length > 0) {
                    emojibuttonoff[0].click();
                }
                API.chatLog(':smile: Emojis enabled.');
            }
            else {
                var emojibuttonon = $(".icon-emoji-on");
                if (emojibuttonon.length > 0) {
                    emojibuttonon[0].click();
                }
                API.chatLog('Emojis disabled.');
            }
            API.chatLog('Avatars capped at ' + basicBot.settings.startupCap);
            API.chatLog('Volume set to ' + basicBot.settings.startupVolume);
            socket();
        },
        commands: {
            executable: function (minRank, chat) {
                var id = chat.uid;
                var perm = basicBot.userUtilities.getPermission(id);
                var minPerm;
                switch (minRank) {
                    case 'admin':
                        minPerm = 10;
                        break;
                    case 'ambassador':
                        minPerm = 7;
                        break;
                    case 'host':
                        minPerm = 5;
                        break;
                    case 'cohost':
                        minPerm = 4;
                        break;
                    case 'manager':
                        minPerm = 3;
                        break;
                    case 'mod':
                        if (basicBot.settings.bouncerPlus) {
                            minPerm = 2;
                        }
                        else {
                            minPerm = 3;
                        }
                        break;
                    case 'bouncer':
                        minPerm = 2;
                        break;
                    case 'residentdj':
                        minPerm = 1;
                        break;
                    case 'user':
                        minPerm = 0;
                        break;
                    default:
                        API.chatLog('error assigning minimum permission');
                }
                return perm >= minPerm;

            },
            /**
             command: {
                        command: 'cmd',
                        rank: 'user/bouncer/mod/manager',
                        type: 'startsWith/exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !basicBot.commands.executable(this.rank, chat) ) return void (0);
                                else{
                                
                                }
                        }
                },
             **/


            pingCommand: {
                command: 'ping',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(basicBot.chat.pong)
                    }
                }
            },

            rpslsCommand: {
                command: ['rps', 'rpsls'],
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(basicBot.chat.rpslsempty);
                            return false;
                        }
                        else {
                            var choices = ["rock", "paper", "scissors", "lizard", "spock"];
                            var botChoice = choices[Math.floor(Math.random()*choices.length)];
                            var userChoice = msg.substring(space + 1);
                            if (botChoice == userChoice) {
                                return API.sendChat(subChat("/me chose " + botChoice + ". " + basicBot.chat.rpslsdraw, {name: chat.un}));
                            
                            } else if (botChoice == "rock" && userChoice == "paper") {
                                return API.sendChat(subChat("/me chose " + botChoice + ". " + basicBot.chat.rpslswin, {name: chat.un}));
                            
                            } else if (botChoice == "rock" && userChoice == "scissors") {
                                return API.sendChat(subChat("/me chose " + botChoice + ". " + basicBot.chat.rpslslose, {name: chat.un}));
                            
                            } else if (botChoice == "rock" && userChoice == "lizard") {
                                return API.sendChat(subChat("/me chose " + botChoice + ". " + basicBot.chat.rpslslose, {name: chat.un}));
                            
                            } else if (botChoice == "rock" && userChoice == "spock") {
                                return API.sendChat(subChat("/me chose " + botChoice + ". " + basicBot.chat.rpslswin, {name: chat.un}));
                            
                            } else if (botChoice == "paper" && userChoice == "rock") {
                                return API.sendChat(subChat("/me chose " + botChoice + ". " + basicBot.chat.rpslslose, {name: chat.un}));
                            
                            } else if (botChoice == "paper" && userChoice == "scissors") {
                                return API.sendChat(subChat("/me chose " + botChoice + ". " + basicBot.chat.rpslswin, {name: chat.un}));
                            
                            } else if (botChoice == "paper" && userChoice == "lizard") {
                                return API.sendChat(subChat("/me chose " + botChoice + ". " + basicBot.chat.rpslswin, {name: chat.un}));
                            
                            } else if (botChoice == "paper" && userChoice == "spock") {
                                return API.sendChat(subChat("/me chose " + botChoice + ". " + basicBot.chat.rpslslose, {name: chat.un}));
                            
                            } else if (botChoice == "scissors" && userChoice == "rock") {
                                return API.sendChat(subChat("/me chose " + botChoice + ". " + basicBot.chat.rpslswin, {name: chat.un}));
                            
                            } else if (botChoice == "scissors" && userChoice == "paper") {
                                return API.sendChat(subChat("/me chose " + botChoice + ". " + basicBot.chat.rpslslose, {name: chat.un}));
                            
                            } else if (botChoice == "scissors" && userChoice == "lizard") {
                                return API.sendChat(subChat("/me chose " + botChoice + ". " + basicBot.chat.rpslslose, {name: chat.un}));
                            
                            } else if (botChoice == "scissors" && userChoice == "spock") {
                                return API.sendChat(subChat("/me chose " + botChoice + ". " + basicBot.chat.rpslswin, {name: chat.un}));
                            
                            } else if (botChoice == "lizard" && userChoice == "rock") {
                                return API.sendChat(subChat("/me chose " + botChoice + ". " + basicBot.chat.rpslswin, {name: chat.un}));
                            
                            } else if (botChoice == "lizard" && userChoice == "paper") {
                                return API.sendChat(subChat("/me chose " + botChoice + ". " + basicBot.chat.rpslslose, {name: chat.un}));
                            
                            } else if (botChoice == "lizard" && userChoice == "scissors") {
                                return API.sendChat(subChat("/me chose " + botChoice + ". " + basicBot.chat.rpslslose, {name: chat.un}));
                            
                            } else if (botChoice == "lizard" && userChoice == "spock") {
                                return API.sendChat(subChat("/me chose " + botChoice + ". " + basicBot.chat.rpslslose, {name: chat.un}));
                            
                            } else if (botChoice == "spock" && userChoice == "rock") {
                                return API.sendChat(subChat("/me chose " + botChoice + ". " + basicBot.chat.rpslslose, {name: chat.un}));
                            
                            } else if (botChoice == "spock" && userChoice == "paper") {
                                return API.sendChat(subChat("/me chose " + botChoice + ". " + basicBot.chat.rpslswin, {name: chat.un}));
                            
                            } else if (botChoice == "spock" && userChoice == "scissors") {
                                return API.sendChat(subChat("/me chose " + botChoice + ". " + basicBot.chat.rpslslose, {name: chat.un}));
                            
                            } else if (botChoice == "spock" && userChoice == "lizard") {
                                return API.sendChat(subChat("/me chose " + botChoice + ". " + basicBot.chat.rpslswin, {name: chat.un}));
                            
                            } else {
                                return API.sendChat(subChat(basicBot.chat.rpserror, {botchoice: botChoice, userchoice: userChoice}));
                            }
                        }
                    }
                }
            }

        }
    };

    loadChat(basicBot.startup);
}).call(this);