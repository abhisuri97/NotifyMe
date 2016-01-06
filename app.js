var config = require('./config.json');
var login = require("facebook-chat-api");

var fb_api;
var request = require("request");
var TrieJS = require('triejs');
var http = require('http');
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
        participant_ids = message.participantIDs;   
        
        var sendMessage = function(finalMessage,recipients) {
            console.log(recipients);
            for(var i = 0; i < recipients.length; i++) {
                recipient = recipients[i];
                
                api.getUserID(recipient, function(err, data) {
                                if(err) {
                                    finalMessage = "USER_NOT_FOUND: Hi your @mention for \"@" + recipient + "\" resulted in an unknown target for your message (i.e. there are two or more people it can go to). Please be more specific :) But we have sent the message to anyone else who we could pinpoint.";
                                    recipients = [message.senderName];
                                    sendMessage(finalMessage,recipients);
                                    return;
                                };
                                threadID = data[0].userID;
                            
                                console.log("THREADID:" + threadID + " " + participant_ids.indexOf(threadID));
                                if(participant_ids.indexOf(threadID) != -1) {
                                    console.log(threadID + " " + finalMessage);
                                    api.sendMessage(finalMessage,threadID);
                                }
                                else {
                                    finalMessage = "AMBIGUOUS_USER: Hi your @mention for \"@" + recipient + "\" resulted in an ambiguous target for your message (i.e. there are two or more people it can go to). Please be more specific :) But we have sent the message to anyone else who we could pinpoint.";
                                    recipients = [message.senderName];
                                    sendMessage(finalMessage,recipients);
                                }
                });
            }
        }
        
        var initUserTrie = function(callback,callback2) {
            var participantNames = new TrieJS();
            var participantNamesbkUp = [];
            
            callback(err,participantNames,callback2);
        }
        
        var getUsersForTrie = function(err,data,callback2) {
            for(var i = 0; i < participant_ids.length; i++) {
                
                api.getUserInfo(participant_ids[i], function(err, ret) {
                    if(err) return console.error(err);
                    for(var prop in ret) {
                        if(ret.hasOwnProperty(prop) && ret[prop].name) {
                            var tempAdd = ret[prop].name;
                            data.add(tempAdd);
                            console.log(tempAdd);
                        }
                    }

                });            
            }
            callback2(err,data);
        }
        
        
        var checkAtMention = function(err,data) {
            
            if(err) throw err;
            if(message.type == "message") {
                
                finalMessage = "";
                var recipients = [];
                
                if (String(message.body).toLowerCase().indexOf("/help-abhibot") >= 0) {
                    finalMessage = "Welcome to AbhiBot: an easy way to keep in touch with your group chats without all the unncessary clutter. You can mute a group chat and still get important notifications through @mentions in your chat! Be sure to friend 'Abhibot Suriwat' to get group @mentions straight to your inbox. To start, just do '@firstname lastname' to notify a person or @channel to send a message to the entire channel. Type /help-abhibot to see this again"
                    recipients = message.threadID;
                    api.sendMessage(finalMessage,recipients);
                    return;
                }
                
                if (String(message.body).toLowerCase().indexOf("@") >= 0) {
                    
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
                        for(var k = 0; k < names.length; k++) {
                            if(names[k] === "channel") {
                                finalMessage = "You have a new message from " + message.threadName + ": \"" + message.body + "\""
                                for(var l = 0; l < message.data.length; l++) {
                                    recipients.push("ALL");
                                }
                                break;
                            }
                            else {
                                finalMessage = "You have a new message from " + message.senderName + " in " + message.threadName + ": \"" + message.body + "\"";
                                console.log(names[k]);
                                result = data.find(names[k]);
                                console.log("RESULT:" + result + " from " + String(names[k]));

                                if((typeof result !== 'undefined')) {
                                    
                                        
                                        if(result.length > 1) {
                                            console.log("YES");

                                            finalMessage = "AMBIGUOUS_TARGET: Hi your @mention for \"@" + names[k] + "\" resulted in an ambiguous target for your message (i.e. there are two or more people it can go to). Please be more specific :) But we have sent the message to anyone else who we could pinpoint.";
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
        }
//        
        initUserTrie(getUsersForTrie,checkAtMention);   
    }
              
)});
               

