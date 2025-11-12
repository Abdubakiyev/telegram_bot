import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Markup } from 'telegraf';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BotService implements OnModuleInit, OnModuleDestroy {
  private bot: Telegraf;

  constructor(private configService: ConfigService) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) throw new Error('❌ TELEGRAM_BOT_TOKEN topilmadi');

    this.bot = new Telegraf(token);
  }

  async onModuleInit() {
    // === /start komandasi ===
    this.bot.start(async (ctx) => {
      const photoPath = path.join(process.cwd(), 'dist', 'assets', 'images', 'logo.jpg');
      const caption = `
📢 Bu botda siz hozirgi kunda almas narxlari va MLBBga donat qilishni eng oson va eng arzon yo‘l bilan amalga oshirishingiz mumkin!

💞 Asosiy Kanal: @ustozmlbb  
🎥 YouTube Kanal: https://www.youtube.com/@UstozMLBB
👤 Ega: @suhrobgiyosov
      `;

      if (fs.existsSync(photoPath)) {
        await ctx.replyWithPhoto(
          { source: fs.createReadStream(photoPath) },
          {
            caption,
            parse_mode: 'HTML',
            reply_markup: Markup.inlineKeyboard([
              [Markup.button.callback('💰 Almas narxlari', 'price')],
              [Markup.button.callback('🔁 Almas olish', 'buy')],
            ]).reply_markup,
          },
        );
      } else {
        await ctx.reply(caption);
      }
    });

    // /help komandasi
    this.bot.help((ctx) => ctx.reply('🧩 Buyruqlar:\n/start - boshlash\n/help - yordam'));

    // 💰 Almas narxlari
    this.bot.action('price', async (ctx) => {
      await ctx.answerCbQuery();
      await ctx.reply(
        `
💎 *Ustoz MLBB ALMAZ SERVICE* — ENG ISHONCHLI VA TEZKOR XIZMAT!
🔥 Siz so‘raysiz — biz jo‘natamiz! 🔥

📦 Narxlar (MLBB Almazlar):

(100 + 10) 💎 — 25 000 so‘m  
(150 + 15) 💎 — 35 000 so‘m  
(250 + 30) 💎 — 57 000 so‘m  
(500 + 70) 💎 — 115 000 so‘m  
(1000 + 155) 💎 — 225 000 so‘m  
(1500 + 265) 💎 — 340 000 so‘m  
(2500 + 500) 💎 — 550 000 so‘m  
(5000 + 1000) 💎 — 1 090 000 so‘m 💥

💳 Weekly Diamond Pass — 25 000 so‘m
        `,
        { parse_mode: 'Markdown' },
      );
    });

    // 🔁 Almas sotib olish
    this.bot.action('buy', async (ctx) => {
      await ctx.answerCbQuery();
      await ctx.reply(
        `
💸 *Almas sotish uchun kerakli ma’lumotlar:*

1️⃣ Nechta almas sotmoqchisiz?  
2️⃣ Hisob raqamingiz (ID)?  

Operator siz bilan tez orada bog‘lanadi.  
📞 Aloqa: @suhrobgiyosov
        `,
        { parse_mode: 'Markdown' },
      );
    });

    // Oddiy matn kelganda menyu
    this.bot.on('text', async (ctx) => {
      await ctx.reply('Menu tanlang:', {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('💰 Almas narxlari', 'price')],
          [Markup.button.callback('🔁 Almas olish', 'buy')],
        ]),
      });
    });

    // === Webhookni o‘chirib, yangi webhookni sozlash ===
    try {
      await this.bot.telegram.deleteWebhook();
    } catch (err) {
      console.warn('⚠️ Webhook o‘chirishda xatolik:', err.message);
    }

    const WEBHOOK_URL = this.configService.get<string>('WEBHOOK_URL');
    const PORT = parseInt(process.env.PORT || '3000');

    if (!WEBHOOK_URL) throw new Error('❌ WEBHOOK_URL topilmadi. Ngrok yoki haqiqiy HTTPS URL kerak.');

    // === Webhook orqali ishga tushiramiz ===
    await this.bot.launch({
      webhook: {
        domain: WEBHOOK_URL, // qat’iy string bo‘lishi kerak
        port: parseInt(process.env.PORT!),
      }
    });
    
    

    process.once('SIGINT', () => this.bot.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'));

    console.log(`✅ Telegram bot webhook bilan ishga tushdi: ${WEBHOOK_URL}`);
  }

  async onModuleDestroy() {
    await this.bot.stop('ModuleDestroy');
    console.log('🛑 Telegram bot to‘xtatildi.');
  }
}
