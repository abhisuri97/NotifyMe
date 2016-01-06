#AbhiBot

A simple way to keep track of your group chats without looking at every message. You can mute busy group chats, but still be notified when you are needed thru @mentions. Simply add “Smh Munone” to your group chat and type `/help-abhibot` to get started. 

##Basic usage

- `/help-abhibot`: produces help info
- `@channel`: send PM from Abhibot Suriwat to everyone in the group chat
- `@name`: send PM to the person whose name contains at least the characters in `@name`
- `@firstname_lastname`: send PM to the person whose name contains the Firstname and LastName

##Configuration

If you want to do this with your own Facebook bot. Please fork the repository and create a separate dummy account on Facebook. Replace the fields in config.json, run `npm install` and `node app.js`. After that you should be ready to go!

####Thank you to npm facebook-chat-api for making the majority of this happen!