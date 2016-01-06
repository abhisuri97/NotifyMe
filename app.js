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
  http.get("http://mysterious-tor-6444.herokuapp.com", function(res) {
    console.log("pong");
  });
}, 300000); 

login({email: config.user , password: config.pass}, function callback (err, api) {
	if(err) return console.error(err);

	fb_api = api

	api.listen(function callback(err, message) {
        if(err) return console.log(err);
        
        participantIDs = message.participantIDs;   
        
        var sendMessage = function(finalMessage,recipients) {
            
            for(var i = 0; i < recipients.length; i++) {
                recipient = String(recipients[i]);
                api.getUserID(recipient, function(err, data) {
                    if(err) {
                        finalMessage = "USER_NOT_FOUND: Hi your @mention for \"@" + recipient + 
                                       "\" resulted in an unknown target for your message (i.e. there are two or more people it can go to)." +
                                       " Please be more specific :) But we have sent the message to anyone else who we could pinpoint.";
                        recipients = [message.senderName];
                        sendMessage(finalMessage,recipients);
                        return;
                    };
                    threadID = data[0].userID;
                            
                    if((participantIDs.indexOf(threadID)) != -1) {
                        console.log(threadID + " " + finalMessage);
                        api.sendMessage(finalMessage,threadID);
                    }
                    else {
                        finalMessage = "AMBIGUOUS_USER: Hi your @mention for \"@" + recipient + 
                                       "\" resulted in an ambiguous target for your message (i.e. there are two or more people it can go to)." +
                                       "Please be more specific :) But we have sent the message to anyone else who we could pinpoint.";
                        recipients = [message.senderName];
                        sendMessage(finalMessage,recipients);
                    }
                });
            }
        }

        participantNames = new TrieJS();
        allNames = [];
        
        var checkAtMention = function() {
            if (err) {
                throw err;
            }
            participantNames.remove(config.name);
            if(message.type == "message") {
                finalMessage = "";
                var recipients = [];
                if ((String(message.body).toLowerCase().indexOf("/help-abhibot")) >= 0) {
                    finalMessage = "Welcome to AbhiBot: an easy way to keep in touch with your group chats without all the unncessary clutter. You can mute a group chat and still get important notifications through @mentions in your chat! Be sure to friend " + config.name + " to get group @mentions straight to your inbox. To start, just do '@name' or '@firstname_lastname' to notify a person or @channel to send a message to the entire channel. Type /help-abhibot to see this again"
                    recipients = message.threadID;
                    api.sendMessage(finalMessage,recipients);
                    return;
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
                                finalMessage = "You have a new message from " + message.threadName + ": \"" + message.body + "\"";
                                recipients = allNames;
                                channelMention = true;
                            }
                        }
                        for(var k = 0; (k < names.length) && (channelMention == false); k++) {
                            finalMessage = "You have a new message from " + message.senderName + " in " + message.threadName + ": \"" + message.body + "\"";
                            var namesNew = names[k].replace(/_/g, " ").toLowerCase();
                            result = participantNames.find(namesNew);
                            if((typeof result !== 'undefined')) {
                                if(result.length > 1) {
                                    finalMessage = "AMBIGUOUS_TARGET: Hi your @mention for \"@" + namesNew + 
                                            "\" resulted in an ambiguous target for your message (i.e. there are two or more people it can go to)." +
                                            "Please be more specific :) But we have sent the message to anyone else who we could pinpoint.";
                                    recipients = [message.senderName];
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
                            participantNames.add(tempAdd);
                            allNames.push(tempAdd);
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
               

