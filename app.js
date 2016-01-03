var config = require('./config.json');
var login = require("facebook-chat-api");

var fb_api;
var request = require("request");

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

	var participant_ids = [];
	var participant_names = [];

	api.listen(function callback(err, message) {
		participant_names = message.participantNames;
        participant_ids = message.participantIDs;   
        if(message.type == "message") {
				 //if @mention
		  for (var i = 0; i < participant_names.length; i++) {
			var name = participant_names[i].toLowerCase();

			if (participant_names.length > 0) {
                
                if (String(message.body).toLowerCase().indexOf("/help-abhibot") >= 0) {
                        api.sendMessage("Welcome to AbhiBot: an easy way to keep in touch with your group chats without all the unncessary clutter. You can mute a group chat and still get important notifications through @mentions in your chat! Be sure to friend 'Abhibot Suriwat' to get group @mentions straight to your inbox. To start, just do '@firstname lastname' to notify a person or @channel to send a message to the entire channel. Type \\help-abhibot to see this again", message.threadID);
                    }
				for (var i = 0; i < participant_names.length; i++) {
					var name = String(participant_names[i]).toLowerCase();
                    
                    if (String(message.body).toLowerCase().indexOf("@channel ") >= 0) {
                        api.getUserID(name, function(err, data) {
                                if(err) return callback(err);
                                var recipientID = data[0].userID;
                                api.sendMessage("You have a new message from " + message.threadName + ": \"" + message.body + "\"", recipientID);
    });
                    }
					if (String(message.body).toLowerCase().indexOf("@" + name) >= 0) {
						console.log("message: " + message.body);
						var recipient_id = "";
						for (var i = 0; i < participant_names.length; i++) {
							if (String(participant_names[i]).toLowerCase() == name) {
								recipient_id = participant_ids[i];
							}
						}
						console.log("recipient_id: " + recipient_id);
                        api.getUserID(name, function(err, data) {
                                if(err) return callback(err);
                                var threadID = data[0].userID;
                            api.sendMessage("You have a new message from " + message.senderName + " in " + message.threadName + ": \"" + message.body + "\"", threadID);
    });
						
					}
                    
				}
			} else {
				console.log("received message from: " + message.senderName);
			}
          }
        
		};
	});
});

