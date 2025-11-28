import { Telegraf } from 'telegraf';
import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Your bot token from BotFather
const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';

// Your app URL (change this to your hosting URL)
const APP_URL = process.env.APP_URL || 'https://your-app-url.com';

// AI Provider Configuration
// Options: 'gemini', 'openai', 'auto' (tries Gemini first, falls back to OpenAI)
const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini';

// Gemini API Key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// OpenAI API Key
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

// Initialize AI providers
let geminiModel = null;
let openaiClient = null;

if (GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' });
    console.log('✅ Gemini AI initialized');
  } catch (error) {
    console.error('❌ Gemini initialization failed:', error.message);
  }
}

if (OPENAI_API_KEY && OPENAI_API_KEY !== 'YOUR_OPENAI_API_KEY_HERE' && OPENAI_API_KEY.trim() !== '') {
  try {
    openaiClient = new OpenAI({ apiKey: OPENAI_API_KEY.trim() });
    console.log('✅ OpenAI initialized');
  } catch (error) {
    console.error('❌ OpenAI initialization failed:', error.message);
  }
} else {
  console.warn('⚠️ OPENAI_API_KEY not set or empty');
}

// Store conversation history per user (optional - for context)
const userConversations = new Map();

// Initialize bot
const bot = new Telegraf(BOT_TOKEN);

// Start command
bot.command('start', (ctx) => {
  ctx.reply(
    '👋 Bună! Bine ai venit la CRM System!\n\n' +
    'Eu sunt asistentul tău AI! Poți să mă întrebi orice despre CRM sau să folosești aplicația.\n\n' +
    'Comenzi disponibile:\n' +
    '/start - Meniul principal\n' +
    '/menu - Meniu rapid\n' +
    '/clear - Șterge istoricul conversației\n\n' +
    'Sau scrie-mi direct orice întrebare!',
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

// Clear conversation history
bot.command('clear', (ctx) => {
  const userId = ctx.from.id;
  userConversations.delete(userId);
  ctx.reply('✅ Istoricul conversației a fost șters!');
});

// AI Assistant function with multiple provider support
async function getAIResponse(userId, message) {
  const history = userConversations.get(userId) || [];
  
  const systemPrompt = 'Ești un asistent AI util pentru un sistem CRM. Răspunde în română, fii concis și util. Dacă întrebarea este despre CRM, oferă informații relevante.';
  
  // Try Gemini first if available and provider is 'auto' or 'gemini'
  if ((AI_PROVIDER === 'auto' || AI_PROVIDER === 'gemini') && geminiModel) {
    try {
      const prompt = `${systemPrompt}\n\nUtilizatorul te întreabă: "${message}"`;
      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Store in history
      history.push({ role: 'user', content: message });
      history.push({ role: 'assistant', content: text });
      if (history.length > 10) {
        history.splice(0, history.length - 10);
      }
      userConversations.set(userId, history);
      
      return text;
    } catch (error) {
      console.error('Gemini API Error:', error.message);
      // Fall back to OpenAI if Gemini fails and provider is 'auto'
      if (AI_PROVIDER === 'auto' && openaiClient) {
        console.log('🔄 Falling back to OpenAI...');
      } else {
        return '❌ Scuze, am întâmpinat o eroare cu Gemini API. Te rog încearcă din nou sau configurează OpenAI.';
      }
    }
  }
  
  // Use OpenAI if provider is 'openai' or as fallback
  if ((AI_PROVIDER === 'openai' || AI_PROVIDER === 'auto') && openaiClient) {
    try {
      // Build messages array with history
      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.slice(-6).map(h => ({
          role: h.role === 'user' ? 'user' : 'assistant',
          content: h.content
        })),
        { role: 'user', content: message }
      ];
      
      const completion = await openaiClient.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500
      });
      
      const text = completion.choices[0].message.content;
      
      // Store in history
      history.push({ role: 'user', content: message });
      history.push({ role: 'assistant', content: text });
      if (history.length > 10) {
        history.splice(0, history.length - 10);
      }
      userConversations.set(userId, history);
      
      return text;
    } catch (error) {
      console.error('OpenAI API Error:', error.message);
      console.error('OpenAI API Error Details:', error);
      
      // More specific error messages
      if (error.message?.includes('Invalid API key') || error.code === 'invalid_api_key') {
        return '❌ Cheia API OpenAI nu este validă.\n\nVerifică OPENAI_API_KEY în .env sau adaugă credit la:\nhttps://platform.openai.com/account/billing';
      } else if (error.message?.includes('insufficient_quota') || error.code === 'insufficient_quota') {
        return '❌ Nu ai credit suficient în contul OpenAI.\n\n💳 Adaugă credit la:\nhttps://platform.openai.com/account/billing\n\n📊 Verifică utilizarea:\nhttps://platform.openai.com/usage';
      } else if (error.message?.includes('rate_limit') || error.status === 429) {
        return '❌ Ai depășit limita de request-uri.\n\n⏳ Te rog așteaptă puțin înainte de a încerca din nou.';
      } else {
        return `❌ Eroare OpenAI API: ${error.message || error.code || 'Eroare necunoscută'}\n\nVerifică: https://platform.openai.com/account/billing`;
      }
    }
  }
  
  // No AI provider available
  return '❌ Nu este configurat niciun provider AI. Te rog adaugă GEMINI_API_KEY sau OPENAI_API_KEY în variabilele de mediu.';
}

// Menu button handler
bot.on('message', async (ctx) => {
  // Skip if it's a command
  if (ctx.message.text?.startsWith('/')) {
    return;
  }

  // Handle menu command
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
    return;
  }

  // Handle text messages as AI queries
  if (ctx.message.text && !ctx.message.text.startsWith('/')) {
    const userId = ctx.from.id;
    const userMessage = ctx.message.text;

    // Show typing indicator
    await ctx.replyWithChatAction('typing');

    // Get AI response
    const aiResponse = await getAIResponse(userId, userMessage);
    
    // Send response
    await ctx.reply(aiResponse, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🚀 Deschide CRM',
              web_app: { url: APP_URL }
            }
          ]
        ]
      }
    });
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
  console.log(`🔑 AI Provider: ${AI_PROVIDER}`);
  console.log(`✅ OpenAI initialized: ${openaiClient ? 'Yes' : 'No'}`);
  console.log(`✅ Gemini initialized: ${geminiModel ? 'Yes' : 'No'}`);
  if (!openaiClient && !geminiModel) {
    console.error('⚠️ WARNING: No AI provider initialized!');
    console.error(`   OPENAI_API_KEY: ${OPENAI_API_KEY ? 'Set (' + OPENAI_API_KEY.substring(0, 10) + '...)' : 'Not set'}`);
    console.error(`   GEMINI_API_KEY: ${GEMINI_API_KEY ? 'Set' : 'Not set'}`);
  }
});

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));





