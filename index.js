const Discord = require('discord.js');
const request = require('request');

const client = new Discord.Client();

client.on('ready', () => {
  console.info('logged in as ' + client.user.tag);
});

client.on('error', err => {
  console.error(err);
  process.exit(1);
});

client.on('warn', message => {
  console.warn(message);
});

client.on('reconnecting', message => {
  console.info('reconnecting...');
});

client.on('resume', message => {
  console.info('connected');
});

client.on('disconnect', message => {
  console.info('disconnected');
  process.exit(1);
});

client.on('message', message => {
  if (process.env.READING_CHANNELS.includes(message.channel.id)) {
    let content = message.cleanContent;
    message.attachments.forEach(attachment => {
      content += '\n' + attachment.proxyURL;
    });

    process.env.WRITING_CHANNELS.includes(channel => {
      client.channels.get(channel).send(content).catch(err => {
        console.error(err);
      });
    });

    process.env.WEBHOOKS.forEach(webhook => {
      request({
        url: webhook,
        method: 'POST',
        json: {
          content: content,
        },
      }, err => {
        if (err) {
          console.error(err);
        }
      });
    });
  }
});

client.login(process.env.TOKEN);
