#NotifyMe

A simple way to keep track of your group chats without looking at every message. You can mute busy group chats, but still be notified when you are needed thru @mentions. Simply add your bot to your group chat and type `/help-abhibot` to get started. 
##Initialization
Replace the dummy config file with the appropriate data.
##Basic usage

- `/help-abhibot`: produces help info
- `@channel`: send PM from Abhibot Suriwat to everyone in the group chat
- `@name`: send PM to the person whose name contains at least the characters in `@name`
- `@firstname_lastname`: send PM to the person whose name contains the Firstname and LastName
- `/poll *option 1, *blah, *blah also, *etc`: create a poll with options `option 1`,`blah`,`blah also`,`etc`. Max 1 poll at a time per thread (no simultaneous polls in the same thread). Produces a message with the following syntax: 
```
Poll Initialized:
0: option 1
1: blah
2: blah also
3: etc
```
Users can vote by typing any of the indexes 0,1,2,3...
- `/closepoll`: close active polls. Only the poll creator can do this!

##Configuration

If you want to do this with your own Facebook bot. Please fork the repository and create a separate dummy account on Facebook. Replace the fields in config.json, run `npm install` and `node app.js`. After that you should be ready to go!

####Thank you to npm facebook-chat-api for making the majority of this happen!
