/*
*  Author: Franky404
*  Repo: https://github.com/Franky404/translate-bot-telegram
*/
//==============================================//
// settings 
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('./config.json'));
// Module
const Telegraf = require('telegraf')
const LocalSession = require('telegraf-session-local');
const bot = new Telegraf(config.TELEGRAM_BOT_TOKEN);
const axios = require('axios');
// session
bot.use(new LocalSession({ database: 'session.json' }).middleware());
// start
bot.start(ctx => ctx.reply('Welcome'));
// set language from
bot.command('from', ctx => {
  const lang = ctx.message.text.substring(6);
  if (lang.length > 2 || lang.length === 1) {
    ctx.reply('” language code must be 2 chars, e.g. "en" or "fr"');
    return;
  }
  ctx.session.from = lang;
  ctx.reply(
    lang ? '… "from" language set to ' + lang : 'âœ… autodetect "from" language'
  );
});
// set language to
bot.command('to', ctx => {
  const lang = ctx.message.text.substring(4);
  if (lang.length === 0) {
    ctx.reply(
      '” please specify a language code! It must be 2 chars, e.g. "en" or "id"'
    );
    return;
  }
  if (lang.length > 2 || lang.length === 1) {
    ctx.reply('” language code must be 2 chars, e.g. "en" or "id"');
    return;
  }
  ctx.session.to = lang;
  ctx.reply('… "to" language set to ' + lang);
});
bot.command('history', ctx => {
  try {
    ctx.reply(
      JSON.parse(ctx.session.messages)
        .map(message => `${message.text}: ${message.translation}`)
        .join('\n')
    );
  } catch (err) {
    console.error(err);
  }
});
// clear session
bot.command('clear', ctx => {
  ctx.session.messages = JSON.stringify([]);
  ctx.reply('… History Berhasil Di Hapus!');
});
bot.command('dnt', ctx => {
  ctx.session.dnt = true;
  ctx.reply('… Tidak Acak');
});
bot.command('dt', ctx => {
  ctx.session.dnt = false;
  ctx.reply('… Acak');
});
// message 
bot.on('message', ctx => {
  const lang =
    (ctx.session.from ? ctx.session.from + '-' : '') + (ctx.session.to || 'en');
  console.log(lang);
  axios
    .get('https://translate.yandex.net/api/v1.5/tr.json/translate', {
      params: {
        key: config.YANDEX_API_KEY,
        text: ctx.message.text,
        lang: lang
      }
    })
    .then(res => {
      const translation = res.data.text[0];
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
