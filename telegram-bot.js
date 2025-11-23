import { Telegraf } from 'telegraf';
import express from 'express';

// Your bot token from BotFather
const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';

// Your app URL (change this to your hosting URL)
const APP_URL = process.env.APP_URL || 'https://your-app-url.com';

// Initialize bot
const bot = new Telegraf(BOT_TOKEN);

// Start command
bot.command('start', (ctx) => {
  ctx.reply(
    '👋 Bună! Bine ai venit la CRM System!\n\n' +
    'Folosește butonul de mai jos pentru a deschide aplicația:',
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🚀 Deschide CRM',
              web_app: { url: APP_URL }
            }
          ],
          [
            {
              text: '📊 Dashboard',
              callback_data: 'dashboard'
            },
            {
              text: '📋 Proiecte',
              callback_data: 'projects'
            }
          ]
        ]
      }
    }
  );
});

// Menu button handler
bot.on('message', (ctx) => {
  if (ctx.message.text === '/menu' || ctx.message.text === 'Menu') {
    ctx.reply(
      '📱 Meniu Principal',
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🚀 Deschide Aplicația',
                web_app: { url: APP_URL }
              }
            ],
            [
              {
                text: 'ℹ️ Ajutor',
                callback_data: 'help'
              },
              {
                text: '📞 Contact',
                callback_data: 'contact'
              }
            ]
          ]
        }
      }
    );
  }
});

// Callback handlers
bot.action('dashboard', (ctx) => {
  ctx.answerCbQuery();
  ctx.reply('📊 Deschid Dashboard...', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '🚀 Deschide Aplicația',
            web_app: { url: APP_URL }
          }
        ]
      ]
    }
  });
});

bot.action('projects', (ctx) => {
  ctx.answerCbQuery();
  ctx.reply('📋 Deschid Proiecte...', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '🚀 Deschide Aplicația',
            web_app: { url: APP_URL }
          }
        ]
      ]
    }
  });
});

bot.action('help', (ctx) => {
  ctx.answerCbQuery();
  ctx.reply(
    'ℹ️ Ajutor\n\n' +
    'Pentru a deschide aplicația CRM:\n' +
    '1. Apasă butonul "🚀 Deschide CRM"\n' +
    '2. Sau folosește comanda /start\n\n' +
    'Funcționalități:\n' +
    '• Gestionare clienți\n' +
    '• Gestionare sarcini\n' +
    '• Statusuri personalizate\n' +
    '• Dashboard cu statistici',
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🚀 Deschide Aplicația',
              web_app: { url: APP_URL }
            }
          ]
        ]
      }
    }
  );
});

bot.action('contact', (ctx) => {
  ctx.answerCbQuery();
  ctx.reply('📞 Pentru suport, contactează administratorul aplicației.');
});

// Error handling
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}:`, err);
});

// Start bot
bot.launch().then(() => {
  console.log('🤖 Telegram bot is running!');
  console.log(`📱 App URL: ${APP_URL}`);
});

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));


