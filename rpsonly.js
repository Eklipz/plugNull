/**
 *Copyright 2014 Yemasthui
 *Modifications (including forks) of the code to fit personal needs are allowed only for personal use and should refer back to the original source.
 *This software is not for profit, any extension, or unauthorised person providing this software is not authorised to be in a position of any monetary gain from this use of this software. Any and all money gained under the use of the software (which includes donations) must be passed on to the original author.
 */


(function () {

    API.getWaitListPosition = function(id){
        if(typeof id === 'undefined' || id === null){
            id = API.getUser().id;
        }
        var wl = API.getWaitList();
        for(var i = 0; i < wl.length; i++){
            if(wl[i].id === id){
                return i;
            }
        }
        return -1;
    };

    var kill = function () {
        clearInterval(basicBot.room.autodisableInterval);
        clearInterval(basicBot.room.afkInterval);
        basicBot.status = false;
    };

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


    var basicBot = {
        version: "1.07",
        status: false,
        name: "nullBot",
        loggedInID: null,
        scriptLink: "https://rawgit.com/Eklipz/plugNull/master/heart.js",
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
            roomLock: false, // Requires an extension to re-load the script 
            startupCap: 1, // 1-200
            startupVolume: 0, // 0-100
            startupEmoji: false, // true or false
            autowoot: true,
            autoskip: false, 
            smartSkip: false,
            maximumAfk: 120,
            afkRemoval: false,
            maximumDc: 60,
            bouncerPlus: false,
            lockdownEnabled: false,
            lockGuard: false,
            maximumLocktime: 10,
            cycleGuard: false,
            maximumCycletime: 10,
            voteSkip: false,
            voteSkipLimit: 10,
            historySkip: false,
            timeGuard: false,
            maximumSongLength: 10,
            autodisable: false,
            commandCooldown: 30,
            usercommandsEnabled: true,
            skipPosition: 3,
            skipReasons: [
                ["theme", "This song does not fit the room theme. "],
                ["op", "This song is on the OP list. "],
                ["history", "This song is in the history. "],
                ["mix", "You played a mix, which is against the rules. "],
                ["sound", "The song you played had bad sound quality or no sound. "],
                ["nsfw", "The song you contained was NSFW (image or sound). "],
                ["unavailable", "The song you played was not available for some users. "]
            ],
            afkpositionCheck: 15,
            afkRankCheck: "ambassador",
            motdEnabled: false,
            motdInterval: 5,
            motd: "MOTD",
            filterChat: false,
            etaRestriction: false,
            welcome: false,
            intervalMessages: [],
            messageInterval: 5,
            songstats: false,
            commandLiteral: "$",
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
            afkInterval: null,
            autoskipTimer: null,
            autodisableInterval: null,
            autodisableFunc: function () {
                if (basicBot.status && basicBot.settings.autodisable) {
                    API.sendChat('!afkdisable');
                    API.sendChat('!joindisable');
                }
            },
            queueing: 0,
            queueable: true,
            currentDJID: null,
            historyList: [],
            cycleTimer: setTimeout(function () {
            }, 1),
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
            }
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
            updateDC: function (user) {
                user.lastDC.time = Date.now();
                user.lastDC.position = user.lastKnownPosition;
                user.lastDC.songCount = basicBot.room.roomstats.songCount;
            },
            setLastActivity: function (user) {
                user.lastActivity = Date.now();
                user.afkWarningCount = 0;
                clearTimeout(user.afkCountdown);
            },
            getLastActivity: function (user) {
                return user.lastActivity;
            },
            getWarningCount: function (user) {
                return user.afkWarningCount;
            },
            setWarningCount: function (user, value) {
                user.afkWarningCount = value;
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
            voteRatio: function (id) {
                var user = basicBot.userUtilities.lookupUser(id);
                var votes = user.votes;
                if (votes.meh === 0) votes.ratio = 1;
                else votes.ratio = (votes.woot / votes.meh).toFixed(2);
                return votes;

            },
            getPermission: function (obj) { //1 requests
                var u;
                if (typeof obj === "object") u = obj;
                else u = API.getUser(obj);
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
            },
            moveUser: function (id, pos, priority) {
                var user = basicBot.userUtilities.lookupUser(id);
                var wlist = API.getWaitList();
                if (API.getWaitListPosition(id) === -1) {
                    if (wlist.length < 50) {
                        API.moderateAddDJ(id);
                        if (pos !== 0) setTimeout(function (id, pos) {
                            API.moderateMoveDJ(id, pos);
                        }, 1250, id, pos);
                    }
                    else {
                        var alreadyQueued = -1;
                        for (var i = 0; i < basicBot.room.queue.id.length; i++) {
                            if (basicBot.room.queue.id[i] === id) alreadyQueued = i;
                        }
                        if (alreadyQueued !== -1) {
                            basicBot.room.queue.position[alreadyQueued] = pos;
                            return API.sendChat(subChat(basicBot.chat.alreadyadding, {position: basicBot.room.queue.position[alreadyQueued]}));
                        }
                        basicBot.roomUtilities.booth.lockBooth();
                        if (priority) {
                            basicBot.room.queue.id.unshift(id);
                            basicBot.room.queue.position.unshift(pos);
                        }
                        else {
                            basicBot.room.queue.id.push(id);
                            basicBot.room.queue.position.push(pos);
                        }
                        var name = user.username;
                        return API.sendChat(subChat(basicBot.chat.adding, {name: name, position: basicBot.room.queue.position.length}));
                    }
                }
                else API.moderateMoveDJ(id, pos);
            },
            dclookup: function (id) {
                var user = basicBot.userUtilities.lookupUser(id);
                if (typeof user === 'boolean') return basicBot.chat.usernotfound;
                var name = user.username;
                if (user.lastDC.time === null) return subChat(basicBot.chat.notdisconnected, {name: name});
                var dc = user.lastDC.time;
                var pos = user.lastDC.position;
                if (pos === null) return basicBot.chat.noposition;
                var timeDc = Date.now() - dc;
                var validDC = false;
                if (basicBot.settings.maximumDc * 60 * 1000 > timeDc) {
                    validDC = true;
                }
                var time = basicBot.roomUtilities.msToStr(timeDc);
                if (!validDC) return (subChat(basicBot.chat.toolongago, {name: basicBot.userUtilities.getUser(user).username, time: time}));
                var songsPassed = basicBot.room.roomstats.songCount - user.lastDC.songCount;
                var afksRemoved = 0;
                var afkList = basicBot.room.afkList;
                for (var i = 0; i < afkList.length; i++) {
                    var timeAfk = afkList[i][1];
                    var posAfk = afkList[i][2];
                    if (dc < timeAfk && posAfk < pos) {
                        afksRemoved++;
                    }
                }
                var newPosition = user.lastDC.position - songsPassed - afksRemoved;
                if (newPosition <= 0) return subChat(basicBot.chat.notdisconnected, {name: name});
                var msg = subChat(basicBot.chat.valid, {name: basicBot.userUtilities.getUser(user).username, time: time, position: newPosition});
                basicBot.userUtilities.moveUser(user.id, newPosition, true);
                return msg;
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
            booth: {
                lockTimer: setTimeout(function () {
                }, 1000),
                locked: false,
                lockBooth: function () {
                    API.moderateLockWaitList(!basicBot.roomUtilities.booth.locked);
                    basicBot.roomUtilities.booth.locked = false;
                    if (basicBot.settings.lockGuard) {
                        basicBot.roomUtilities.booth.lockTimer = setTimeout(function () {
                            API.moderateLockWaitList(basicBot.roomUtilities.booth.locked);
                        }, basicBot.settings.maximumLocktime * 60 * 1000);
                    }
                },
                unlockBooth: function () {
                    API.moderateLockWaitList(basicBot.roomUtilities.booth.locked);
                    clearTimeout(basicBot.roomUtilities.booth.lockTimer);
                }
            },
            afkCheck: function () {
                if (!basicBot.status || !basicBot.settings.afkRemoval) return void (0);
                var rank = basicBot.roomUtilities.rankToNumber(basicBot.settings.afkRankCheck);
                var djlist = API.getWaitList();
                var lastPos = Math.min(djlist.length, basicBot.settings.afkpositionCheck);
                if (lastPos - 1 > djlist.length) return void (0);
                for (var i = 0; i < lastPos; i++) {
                    if (typeof djlist[i] !== 'undefined') {
                        var id = djlist[i].id;
                        var user = basicBot.userUtilities.lookupUser(id);
                        if (typeof user !== 'boolean') {
                            var plugUser = basicBot.userUtilities.getUser(user);
                            if (rank !== null && basicBot.userUtilities.getPermission(plugUser) <= rank) {
                                var name = plugUser.username;
                                var lastActive = basicBot.userUtilities.getLastActivity(user);
                                var inactivity = Date.now() - lastActive;
                                var time = basicBot.roomUtilities.msToStr(inactivity);
                                var warncount = user.afkWarningCount;
                                if (inactivity > basicBot.settings.maximumAfk * 60 * 1000) {
                                    if (warncount === 0) {
                                        API.sendChat(subChat(basicBot.chat.warning1, {name: name, time: time}));
                                        user.afkWarningCount = 3;
                                        user.afkCountdown = setTimeout(function (userToChange) {
                                            userToChange.afkWarningCount = 1;
                                        }, 90 * 1000, user);
                                    }
                                    else if (warncount === 1) {
                                        API.sendChat(subChat(basicBot.chat.warning2, {name: name}));
                                        user.afkWarningCount = 3;
                                        user.afkCountdown = setTimeout(function (userToChange) {
                                            userToChange.afkWarningCount = 2;
                                        }, 30 * 1000, user);
                                    }
                                    else if (warncount === 2) {
                                        var pos = API.getWaitListPosition(id);
                                        if (pos !== -1) {
                                            pos++;
                                            basicBot.room.afkList.push([id, Date.now(), pos]);
                                            user.lastDC = {

                                                time: null,
                                                position: null,
                                                songCount: 0
                                            };
                                            API.moderateRemoveDJ(id);
                                            API.sendChat(subChat(basicBot.chat.afkremove, {name: name, time: time, position: pos, maximumafk: basicBot.settings.maximumAfk}));
                                        }
                                        user.afkWarningCount = 0;
                                    }
                                }
                            }
                        }
                    }
                }
            },
            
smartSkip: function (reason) {
var dj = API.getDJ();
var id = dj.id;
var waitlistlength = API.getWaitList().length;
var locked = false;
basicBot.room.queueable = false;
if (waitlistlength == 50) {
basicBot.roomUtilities.booth.lockBooth();
locked = true;
}
setTimeout(function (id) {
API.moderateForceSkip();
setTimeout(function () {
if (typeof reason !== 'undefined') {
API.sendChat(reason);
}
}, 500);
basicBot.room.skippable = false;
setTimeout(function () {
basicBot.room.skippable = true
}, 5 * 1000);
setTimeout(function (id) {
basicBot.userUtilities.moveUser(id, basicBot.settings.skipPosition, false);
basicBot.room.queueable = true;
if (locked) {
setTimeout(function () {
basicBot.roomUtilities.booth.unlockBooth();
}, 1000);
}
}, 1500, id);
}, 1000, id);
}, 

            changeDJCycle: function () {
                var toggle = $(".cycle-toggle");
                if (toggle.hasClass("disabled")) {
                    toggle.click();
                    if (basicBot.settings.cycleGuard) {
                        basicBot.room.cycleTimer = setTimeout(function () {
                            if (toggle.hasClass("enabled")) toggle.click();
                        }, basicBot.settings.cycleMaxTime * 60 * 1000);
                    }
                }
                else {
                    toggle.click();
                    clearTimeout(basicBot.room.cycleTimer);
                }
            },
            intervalMessage: function () {
                var interval;
                if (basicBot.settings.motdEnabled) interval = basicBot.settings.motdInterval;
                else interval = basicBot.settings.messageInterval;
                if ((basicBot.room.roomstats.songCount % interval) === 0 && basicBot.status) {
                    var msg;
                    if (basicBot.settings.motdEnabled) {
                        msg = basicBot.settings.motd;
                    }
                    else {
                        if (basicBot.settings.intervalMessages.length === 0) return void (0);
                        var messageNumber = basicBot.room.roomstats.songCount % basicBot.settings.intervalMessages.length;
                        msg = basicBot.settings.intervalMessages[messageNumber];
                    }
                    API.sendChat('/me ' + msg);
                }
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
            var greet = true;
            var welcomeback = null;
            if (known) {
                basicBot.room.users[index].inRoom = true;
                var u = basicBot.userUtilities.lookupUser(user.id);
                var jt = u.jointime;
                var t = Date.now() - jt;
                if (t < 10 * 1000) greet = false;
                else welcomeback = true;
            }
            else {
                basicBot.room.users.push(new basicBot.User(user.id, user.username));
                welcomeback = false;
            }
            for (var j = 0; j < basicBot.room.users.length; j++) {
                if (basicBot.userUtilities.getUser(basicBot.room.users[j]).id === user.id) {
                    basicBot.userUtilities.setLastActivity(basicBot.room.users[j]);
                    basicBot.room.users[j].jointime = Date.now();
                }

            }
            if (basicBot.settings.welcome && greet) {
                welcomeback ?
                    setTimeout(function (user) {
                        API.sendChat(subChat(basicBot.chat.welcomeback, {name: user.username}));
                    }, 1 * 1000, user)
                    :
                    setTimeout(function (user) {
                        API.sendChat(subChat(basicBot.chat.welcome, {name: user.username}));
                    }, 1 * 1000, user);
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
                        user.lastDC.time = null;
                        user.lastDC.position = user.lastKnownPosition;
                    }
                }
            }
        },
        eventVoteupdate: function (obj) {
            for (var i = 0; i < basicBot.room.users.length; i++) {
                if (basicBot.room.users[i].id === obj.user.id) {
                    if (obj.vote === 1) {
                        basicBot.room.users[i].votes.woot++;
                    }
                    else {
                        basicBot.room.users[i].votes.meh++;
                    }
                }
            }

            var mehs = API.getScore().negative;
            var woots = API.getScore().positive;
            var dj = API.getDJ();
            var timeLeft = API.getTimeRemaining();
        var timeElapsed = API.getTimeElapsed(); 
        
            if (basicBot.settings.voteSkip) {
                if ((mehs - woots) >= (basicBot.settings.voteSkipLimit)) {
                    API.sendChat(subChat(basicBot.chat.voteskipexceededlimit, {name: dj.username, limit: basicBot.settings.voteSkipLimit}));
                    if (basicBot.settings.smartSkip && timeLeft > timeElapsed){
                        basicBot.roomUtilities.smartSkip();
                    }
                    else {
                    API.moderateForceSkip();
                    }
                }
            }

        },
        eventCurateupdate: function (obj) {
            for (var i = 0; i < basicBot.room.users.length; i++) {
                if (basicBot.room.users[i].id === obj.user.id) {
                    basicBot.room.users[i].votes.curate++;
                }
            }
        },
        eventDjadvance: function (obj) {
        if (basicBot.settings.autowoot) { 
            $("#woot").click(); // autowoot
        }

            var user = basicBot.userUtilities.lookupUser(obj.dj.id)
            for(var i = 0; i < basicBot.room.users.length; i++){
                if(basicBot.room.users[i].id === user.id){
                    basicBot.room.users[i].lastDC = {
                        time: null,
                        position: null,
                        songCount: 0
                    };
                }
            }

            var lastplay = obj.lastPlay;
            if (typeof lastplay === 'undefined') return;
            if (basicBot.settings.songstats) {
                if (typeof basicBot.chat.songstatistics === "undefined") {
                    API.sendChat("/me " + lastplay.media.author + " - " + lastplay.media.title + ": " + lastplay.score.positive + "W/" + lastplay.score.grabs + "G/" + lastplay.score.negative + "M.")
                }
                else {
                    API.sendChat(subChat(basicBot.chat.songstatistics, {artist: lastplay.media.author, title: lastplay.media.title, woots: lastplay.score.positive, grabs: lastplay.score.grabs, mehs: lastplay.score.negative}))
                }
            }
            basicBot.room.roomstats.totalWoots += lastplay.score.positive;
            basicBot.room.roomstats.totalMehs += lastplay.score.negative;
            basicBot.room.roomstats.totalCurates += lastplay.score.grabs;
            basicBot.room.roomstats.songCount++;
            basicBot.roomUtilities.intervalMessage();
            basicBot.room.currentDJID = obj.dj.id;

            
var newMedia = obj.media;
var timeLimitSkip = setTimeout(function () {
if (basicBot.settings.timeGuard && newMedia.duration > basicBot.settings.maximumSongLength * 60 && !basicBot.room.roomevent) {
var name = obj.dj.username;
API.sendChat(subChat(basicBot.chat.timelimit, {name: name, maxlength: basicBot.settings.maximumSongLength}));
if (basicBot.settings.smartSkip){
return basicBot.roomUtilities.smartSkip();
}
else { 
                        return API.moderateForceSkip();
                    }
                }
}, 2000);
var format = obj.media.format;
var cid = obj.media.cid;
var naSkip = setTimeout(function () {
if (format == 1){
$.getJSON('https://www.googleapis.com/youtube/v3/videos?id=' + cid + '&key=AIzaSyDcfWu9cGaDnTjPKhg_dy9mUh6H7i4ePZ0&part=snippet&callback=?', function (track){
if (typeof(track.items[0]) === 'undefined'){
var name = obj.dj.username;
API.sendChat(subChat(basicBot.chat.notavailable, {name: name}));
if (basicBot.settings.smartSkip){
return basicBot.roomUtilities.smartSkip();
}
else {
return API.moderateForceSkip();
}
}
}); 
}
else {
var checkSong = SC.get('/tracks/' + cid, function (track){
if (typeof track.title === 'undefined'){
var name = obj.dj.username;
API.sendChat(subChat(basicBot.chat.notavailable, {name: name}));
if (basicBot.settings.smartSkip){
return basicBot.roomUtilities.smartSkip();
}
else {
return API.moderateForceSkip();
}
}
});
}
}, 2000); 

            clearTimeout(historySkip);
            if (basicBot.settings.historySkip) {
                var alreadyPlayed = false;
                var apihistory = API.getHistory();
                var name = obj.dj.username;
                var historySkip = setTimeout(function () {
                    for (var i = 0; i < apihistory.length; i++) {
                        if (apihistory[i].media.cid === obj.media.cid) {
                            basicBot.room.historyList[i].push(+new Date());
                            alreadyPlayed = true;
                            API.sendChat(subChat(basicBot.chat.songknown, {name: name}));
                            if (basicBot.settings.smartSkip){
                                return basicBot.roomUtilities.smartSkip();
                            }
                            else {
                                return API.moderateForceSkip();
                            }
                        }
                    }
                    if (!alreadyPlayed) {
                        basicBot.room.historyList.push([obj.media.cid, +new Date()]);
                    }
                }, 2000);
            }
            if (user.ownSong) {
                API.sendChat(subChat(basicBot.chat.permissionownsong, {name: user.username}));
                user.ownSong = false;
            }
            clearTimeout(basicBot.room.autoskipTimer);
            if (basicBot.settings.autoskip) {
                var remaining = obj.media.duration * 1000;
                var startcid = API.getMedia().cid; 
                basicBot.room.autoskipTimer = setTimeout(function () {
                var endcid = API.getMedia().cid;
        if (startcid === endcid) { 
                    //API.sendChat('Song stuck, skipping...');
                    API.moderateForceSkip();
        }
                }, remaining + 5000);
            }
            storeToStorage();
            sendToSocket(); 
        },
        eventWaitlistupdate: function (users) {
            if (users.length < 50) {
                if (basicBot.room.queue.id.length > 0 && basicBot.room.queueable) {
                    basicBot.room.queueable = false;
                    setTimeout(function () {
                        basicBot.room.queueable = true;
                    }, 500);
                    basicBot.room.queueing++;
                    var id, pos;
                    setTimeout(
                        function () {
                            id = basicBot.room.queue.id.splice(0, 1)[0];
                            pos = basicBot.room.queue.position.splice(0, 1)[0];
                            API.moderateAddDJ(id, pos);
                            setTimeout(
                                function (id, pos) {
                                    API.moderateMoveDJ(id, pos);
                                    basicBot.room.queueing--;
                                    if (basicBot.room.queue.id.length === 0) setTimeout(function () {
                                        basicBot.roomUtilities.booth.unlockBooth();
                                    }, 1000);
                                }, 1000, id, pos);
                        }, 1000 + basicBot.room.queueing * 2500);
                }
            }
            for (var i = 0; i < users.length; i++) {
                var user = basicBot.userUtilities.lookupUser(users[i].id);
                basicBot.userUtilities.updatePosition(user, API.getWaitListPosition(users[i].id) + 1);
            }
        },
        chatcleaner: function (chat) {
            if (!basicBot.settings.filterChat) return false;
            if (basicBot.userUtilities.getPermission(chat.uid) > 1) return false;
            var msg = chat.message;
            var containsLetters = false;
            for (var i = 0; i < msg.length; i++) {
                ch = msg.charAt(i);
                if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9') || ch === ':' || ch === '^') containsLetters = true;
            }
            if (msg === '') {
                return true;
            }
            if (!containsLetters && (msg.length === 1 || msg.length > 3)) return true;
            msg = msg.replace(/[ ,;.:\/=~+%^*\-\\"'&@#]/g, '');
            var capitals = 0;
            var ch;
            for (var i = 0; i < msg.length; i++) {
                ch = msg.charAt(i);
                if (ch >= 'A' && ch <= 'Z') capitals++;
            }
            if (capitals >= 40) {
                API.sendChat(subChat(basicBot.chat.caps, {name: chat.un}));
                return true;
            }
            msg = msg.toLowerCase();
            if (msg === 'skip') {
                API.sendChat(subChat(basicBot.chat.askskip, {name: chat.un}));
                return true;
            }
            for (var j = 0; j < basicBot.chatUtilities.spam.length; j++) {
                if (msg === basicBot.chatUtilities.spam[j]) {
                    API.sendChat(subChat(basicBot.chat.spam, {name: chat.un}));
                    return true;
                }
            }
            return false;
        },
        chatUtilities: {
            chatFilter: function (chat) {
                var msg = chat.message;
                var perm = basicBot.userUtilities.getPermission(chat.uid);
                var user = basicBot.userUtilities.lookupUser(chat.uid);
                return false;
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
                else return false;
                var userPerm = basicBot.userUtilities.getPermission(chat.uid);
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
                        basicBot.room.allcommand = true;
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
            spam: [
                'hueh', 'hu3', 'brbr', 'heu', 'brbr', 'kkkk', 'spoder', 'mafia', 'zuera', 'zueira',
                'zueria', 'aehoo', 'aheu', 'alguem', 'algum', 'brazil', 'zoeira', 'fuckadmins', 'affff', 'vaisefoder', 'huenaarea',
                'hitler', 'ashua', 'ahsu', 'ashau', 'lulz', 'huehue', 'hue', 'huehuehue', 'merda', 'pqp', 'puta', 'mulher', 'pula', 'retarda', 'caralho', 'filha', 'ppk',
                'gringo', 'fuder', 'foder', 'hua', 'ahue', 'modafuka', 'modafoka', 'mudafuka', 'mudafoka', 'ooooooooooooooo', 'foda'
            ],
            curses: [
                'nigger', 'faggot', 'nigga', 'niqqa', 'motherfucker', 'modafocka'
            ]
        },
        connectAPI: function () {
            this.proxy = {
                eventChat: $.proxy(this.eventChat, this),
                eventUserskip: $.proxy(this.eventUserskip, this),
                eventUserjoin: $.proxy(this.eventUserjoin, this),
                eventUserleave: $.proxy(this.eventUserleave, this),
                //eventFriendjoin: $.proxy(this.eventFriendjoin, this),
                eventVoteupdate: $.proxy(this.eventVoteupdate, this),
                eventCurateupdate: $.proxy(this.eventCurateupdate, this),
                eventRoomscoreupdate: $.proxy(this.eventRoomscoreupdate, this),
                eventDjadvance: $.proxy(this.eventDjadvance, this),
                //eventDjupdate: $.proxy(this.eventDjupdate, this),
                eventWaitlistupdate: $.proxy(this.eventWaitlistupdate, this),
                eventVoteskip: $.proxy(this.eventVoteskip, this),
                eventModskip: $.proxy(this.eventModskip, this),
                eventChatcommand: $.proxy(this.eventChatcommand, this),
                eventHistoryupdate: $.proxy(this.eventHistoryupdate, this),

            };
            API.on(API.CHAT, this.proxy.eventChat);
            API.on(API.USER_SKIP, this.proxy.eventUserskip);
            API.on(API.USER_JOIN, this.proxy.eventUserjoin);
            API.on(API.USER_LEAVE, this.proxy.eventUserleave);
            API.on(API.VOTE_UPDATE, this.proxy.eventVoteupdate);
            API.on(API.GRAB_UPDATE, this.proxy.eventCurateupdate);
            API.on(API.ROOM_SCORE_UPDATE, this.proxy.eventRoomscoreupdate);
            API.on(API.ADVANCE, this.proxy.eventDjadvance);
            API.on(API.WAIT_LIST_UPDATE, this.proxy.eventWaitlistupdate);
            API.on(API.MOD_SKIP, this.proxy.eventModskip);
            API.on(API.CHAT_COMMAND, this.proxy.eventChatcommand);
            API.on(API.HISTORY_UPDATE, this.proxy.eventHistoryupdate);
        },
        disconnectAPI: function () {
            API.off(API.CHAT, this.proxy.eventChat);
            API.off(API.USER_SKIP, this.proxy.eventUserskip);
            API.off(API.USER_JOIN, this.proxy.eventUserjoin);
            API.off(API.USER_LEAVE, this.proxy.eventUserleave);
            API.off(API.VOTE_UPDATE, this.proxy.eventVoteupdate);
            API.off(API.CURATE_UPDATE, this.proxy.eventCurateupdate);
            API.off(API.ROOM_SCORE_UPDATE, this.proxy.eventRoomscoreupdate);
            API.off(API.ADVANCE, this.proxy.eventDjadvance);
            API.off(API.WAIT_LIST_UPDATE, this.proxy.eventWaitlistupdate);
            API.off(API.MOD_SKIP, this.proxy.eventModskip);
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
            if (basicBot.room.roomstats.launchTime === null) {
                basicBot.room.roomstats.launchTime = Date.now();
            }

            for (var j = 0; j < basicBot.room.users.length; j++) {
                basicBot.room.users[j].inRoom = false;
            }
            var userlist = API.getUsers();
            for (var i = 0; i < userlist.length; i++) {
                var known = false;
                var ind = null;
                for (var j = 0; j < basicBot.room.users.length; j++) {
                    if (basicBot.room.users[j].id === userlist[i].id) {
                        known = true;
                        ind = j;
                    }
                }
                if (known) {
                    basicBot.room.users[ind].inRoom = true;
                }
                else {
                    basicBot.room.users.push(new basicBot.User(userlist[i].id, userlist[i].username));
                    ind = basicBot.room.users.length - 1;
                }
                var wlIndex = API.getWaitListPosition(basicBot.room.users[ind].id) + 1;
                basicBot.userUtilities.updatePosition(basicBot.room.users[ind], wlIndex);
            }
            basicBot.room.afkInterval = setInterval(function () {
                basicBot.roomUtilities.afkCheck()
            }, 10 * 1000);
            basicBot.room.autodisableInterval = setInterval(function () {
                basicBot.room.autodisableFunc();
            }, 60 * 60 * 1000);
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
            loadChat(API.sendChat(subChat(basicBot.chat.online2)));
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
            
            weedCommand: {
                command: 'weed',
                rank: 'user',
                type: 'startsWith',
                getWeeds: function (chat) {
                    var sho = Math.floor(Math.random() * basicBot.chat.weeds.length);
                    return basicBot.chat.weeds[sho];
                },
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!basicBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(basicBot.chat.eatweed);
                            return false;
                        }
                        else {
                            var name = msg.substring(space + 2);
                            var user = basicBot.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat(subChat(basicBot.chat.nouserweed, {name: name}));
                            }
                            else if (user.username === chat.un) {
                                return API.sendChat(subChat(basicBot.chat.selfweed, {name: name}));
                            }
                            else {
                                return API.sendChat(subChat(basicBot.chat.weed, {nameto: user.username, namefrom: chat.un, weed: this.getWeeds()}));
                            }
                        }
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
                            API.sendChat(subChat(basicBot.chat.rpslsempty));
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
                                return API.sendChat(basicBot.chat.rpserror, {botchoice: botChoice, userchoice: userChoice});
                            }
                        }
                    }
                }
            }
        }
    };

    loadChat(basicBot.startup);
}).call(this);