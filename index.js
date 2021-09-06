/*
*  Author: Franky404
*  Repo: https://github.com/Franky404/translate-bot-telegram
*/
//==============================================//
// settings 
const fs = require('fs-extra');
const config = JSON.parse(fs.readFileSync('./config.json'));
// Module
const { Telegraf } = require('telegraf');
const  LocalSession  = require('telegraf-session-local');
const bot = new Telegraf(config.TELEGRAM_BOT_TOKEN);
const axios = require('axios');
const translate = require('@vitalets/google-translate-api')
// session
bot.use(new LocalSession({ database: '.data/session.json' }).middleware());
// start
bot.start(ctx => ctx.reply('Welcome👋🏻'));
// message 
bot.on('message', ctx => {
const lang = 'en'
translate(`${ctx.message.text}`,{to:`${lang}`}).then( res => {
     const translation = res.text
      ctx.reply(translation);
      if (ctx.session.dnt === true) {
        return;
      }
      let messages = JSON.parse(ctx.session.messages) || [];
      messages.push({ text: ctx.message.text, translation: translation });
      ctx.session.messages = JSON.stringify(messages);
    });
});
//started
bot.startPolling();
