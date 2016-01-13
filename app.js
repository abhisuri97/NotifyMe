var config = require('./config.json');
var login = require("facebook-chat-api");

var fb_api;
var request = require("request");
var TrieJS = require('triejs');
var http = require('http');
var async = require('async');

http.createServer(function (req, res) {
  console.log("ping");
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end("");
}).listen(process.env.PORT || 5000);

setInterval(function() {
  http.get(config.heroku_url, function(res) {
    console.log("pong");
  });
}, 300000); 

login({email: config.user , password: config.pass}, function callback (err, api) {
	if(err) return console.error(err);
    open_polls = new Object();
    function get(k) {
        return open_polls[k];
    }
	fb_api = api
    function createPoll(options, threadID, person, votes) {
                    var poll = {options: this.options, threadID: this.threadID, person: this.person, votes: this.votes};
                    return poll;
                }
	api.listen(function callback(err, message) {
        if(err) return console.log(err);
        
        participantIDs = message.participantIDs;   
        
        var sendMessage = function(finalMessage,recipients) {
            console.log(recipients);
            for(var i = 0; i < recipients.length; i++) {
                recipient = String(recipients[i]);
                console.log("recip:"+recipient);
                for(var j = 0; j < participantNames.length; j++) {
                    if(recipient == String(participantNames[j].name).toLowerCase()) {
                        api.sendMessage(finalMessage,participantNames[j].id);
                        console.log(finalMessage + " " + participantNames[j].id);
                    }
                }
//                api.getUserID(recipient, function(err, data) {
//                    if(err) {
//                        finalMessage = "USER_NOT_FOUND: Hi your @mention for \"@" + recipient + 
//                                       "\" resulted in an unknown target for your message (i.e. there are two or more people it can go to)." +
//                                       " Please be more specific :) But we have sent the message to anyone else who we could pinpoint.";
//                        recipients = [message.senderName];
//                        sendMessage(finalMessage,recipients);
//                        return;
//                    };
//                    threadID = data[0].userID;
//                            
//                    if((participantIDs.indexOf(threadID)) != -1) {
//                        console.log(threadID + " " + finalMessage);
//                        api.sendMessage(finalMessage,threadID);
//                    }
//                    else {
//                        finalMessage = "AMBIGUOUS_USER: Hi your @mention for \"@" + recipient + 
//                                       "\" resulted in an ambiguous target for your message (i.e. there are two or more people it can go to)." +
//                                       "Please be more specific :) But we have sent the message to anyone else who we could pinpoint.";
//                        recipients = [message.senderName];
//                        sendMessage(finalMessage,recipients);
//                    }
//                });
            }
        }

        participantNames = []
        allNames = [];
        
        var checkAtMention = function() {
            if (err) {
                throw err;
            }
            if(message.type == "message") {
                finalMessage = "";
                var recipients = [];
                if ((String(message.body).toLowerCase().indexOf("/help-abhibot")) >= 0) {
                    finalMessage = "Welcome to AbhiBot: an easy way to keep in touch with your group chats without all the unncessary clutter. You can mute a group chat and still get important notifications through @mentions in your chat! Be sure to friend " + config.name + " to get group @mentions straight to your inbox. To start, just do '@name' or '@firstname_lastname' to notify a person or @channel to send a message to the entire channel. Type /help-abhibot to see this again"
                    recipients = message.threadID;
                    api.sendMessage(finalMessage,recipients);
                    return;
                }
                

                if ((String(message.body).toLowerCase().indexOf("/poll")) == 0) {
                    if(get(message.threadID) != null) {
                        finalMessage = "ERROR: There is already a poll in the chat"
                        recipients = message.threadID;
                        api.sendMessage(finalMessage,recipients);
                    } else {
                    var options = []
                    var person = message.senderName;
                    for(var j=0; j<String(message.body).length; j++) {
                        str = String(message.body);
                        if(str[j]==="*") {
                            var startIndex = (j+1);
                            var endIndex = str.indexOf(",",j);
                            if (endIndex == -1) {
                                endIndex = str.length;
                            }
                            console.log(startIndex + " " + endIndex)
                            options.push(str.substring(startIndex,endIndex));
                        }
                    }
                    var votes = new Array(options.length);
                    for (var i = votes.length-1; i >= 0; -- i) votes[i] = 0;

                    var poll = {options: options, message: message.threadID, person: person, votes: votes}
                    open_polls[message.threadID] = poll;
                    finalMessage = "Poll Initialized:\n";
                    for(var a = 0; a < options.length; a++) {
                        finalMessage += (a) + ":" + options[a] + "\n";
                    }
                    recipients = message.threadID;
                    api.sendMessage(finalMessage,recipients);
                    return;
                }
                }
                if((get(message.threadID) != null) && (String(message.body).match(/^[0-9]+$/)!=null)) {
                    var poll = get(message.threadID);
                    console.log(open_polls);
                    if(parseInt(String(message.body)) < poll.options.length) {
                        poll.votes[parseInt(String(message.body))] += 1;
                    } else {
                        finalMessage = "ERROR ON "+ parseInt(String(message.body)) +": No such option. Choose between 0 and " + (poll.options.length-1) 
                        recipients = message.threadID;
                        api.sendMessage(finalMessage,recipients);
                    }
                }
                if((String(message.body).toLowerCase().indexOf("/closepoll")) == 0) {

                 if((get(message.threadID) != null)) {
                    var poll = get(message.threadID);
                    var finalMessage = "";
                    if(message.senderName == poll.person) {
                        finalMessage = "Poll Ended. Results:\n";
                        for(var a = 0; a < poll.options.length; a++) {
                            finalMessage += poll.options[a] + ":" + poll.votes[a] + "\n";
                        }
                        open_polls[message.threadID] = null;
                    } else {
                        finalMessage = "ERROR: Only the poll creator " + poll.person + " can close this poll."
                    }
                    recipients = message.threadID;
                    console.log(finalMessage);
                    if(finalMessage != "") {
                        api.sendMessage(finalMessage,recipients);
                    }
                    
                } else {
                    finalMessage = "ERROR: No Active polls in this chat";
                    recipients = message.threadID;
                    if(finalMessage != "") {
                        api.sendMessage(finalMessage,recipients);
                    }
                    }                    
                }
                if ((String(message.body).toLowerCase().indexOf("@")) >= 0) {
                    var names = [];
                    //find @ symbols and following letters coming after @ symbol
                    for(var j=0; j<String(message.body).length; j++) {
                        str = String(message.body);
                        if(str[j]==="@") {
                            var startIndex = (j+1);
                            var endIndex = str.indexOf(" ",j);
                            if (endIndex == -1) {
                                endIndex = str.length;
                            }
                            //push to names array
                            names.push(str.substring(startIndex,endIndex));
                        }
                    }
                    if(names.length > 0) {
                        var channelMention = false;
                        for(var l = 0; l < names.length; l++) {
                            if(names[l] == "channel") {
                                
                                console.log("YES");
                                finalMessage = "You have a new message from " + message.threadName + ": \"" + message.body + "\"";
                                for(var i = 0; i < participantNames.length; i++) {
                                    recipients.push(String(participantNames[i].name).toLowerCase());
                                }
                                channelMention = true;
                            }
                        }
                        for(var k = 0; (k < names.length) && (channelMention == false); k++) {
                            finalMessage = "You have a new message from " + message.senderName + " in " + message.threadName + ": \"" + message.body + "\"";
                            var namesNew = names[k].replace(/_/g, " ").toLowerCase();
                            result = [];
                            for(var i = 0; i < participantNames.length; i++) {
                                
                                console.log(participantNames[i].name);
                                if(String(participantNames[i].name).toLowerCase().indexOf(namesNew) >= 0) {
                                    result.push(String(participantNames[i].name).toLowerCase());
                                    console.log(String(participantNames[i].name).toLowerCase());
                                }
                            }
                            if((typeof result !== 'undefined')) {
                                if(result.length > 1) {
                                    
                                    console.log("YESa");
                                    finalMessage = "AMBIGUOUS_TARGET: Hi your @mention for \"@" + namesNew + 
                                            "\" resulted in an ambiguous target for your message ("+str(result)+")." +
                                            "Please be more specific :) But we have sent the message to anyone else who we could pinpoint.";
                                    recipients = [String(message.senderName).toLowerCase()];
                                    sendMessage(finalMessage,recipients);
                                    continue;
                                }
                            }
                            recipients.push(String(result));
                        }
                    }
                    if(typeof recipients !== 'undefined') {     
                        sendMessage(finalMessage,recipients);
                    }
                }
            }
        }
    
        
       
        async.each(participantIDs,
            function(item, callback){
                api.getUserInfo(item, function(err, ret) {
                    if(err) return console.error(err);
                    for(var prop in ret) {
                        if(ret.hasOwnProperty(prop) && ret[prop].name && ret[prop].name !== config.name) {
                            var tempAdd = ret[prop].name;
                            console.log(ret[prop].name + " " + item);
                            participantNames.push({name:ret[prop].name, id:item});
                        }
                    }
                    callback();
                });
            },
            function(err){
                checkAtMention();
            }
        );

    }
              
)});
               

