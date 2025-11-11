import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Markup } from 'telegraf';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BotService implements OnModuleInit {
  private bot: Telegraf;

  constructor(private configService: ConfigService) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN')!;
    this.bot = new Telegraf(token);
  }

  onModuleInit() {
    // /start komandasi
    this.bot.start(async (ctx) => {
      const photoPath = path.join(
        process.cwd(),
        'src',
        'assets',
        'images',
        'logo.jpg',
      );

      const caption = `
📢 Bu botda siz hozirgi kunda almas narxlari va MLBBga donat qilishni eng oson va eng arzon yo‘l bilan amalga oshirishingiz mumkin!

💞 Asosiy Kanal: @ustozmlbb  
🎥 YouTube Kanal: https://www.youtube.com/@UstozMLBB
👤 Ega: @suhrobgiyosov
      `;

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
    });

    // /help komandasi
    this.bot.help((ctx) =>
      ctx.reply('🧩 Buyruqlar:\n/start - boshlash\n/help - yordam'),
    );

    // 💰 Almas narxlari tugmasi bosilganda
    this.bot.action('price', async (ctx) => {
      await ctx.answerCbQuery();
      await ctx.reply(
        `
💎 Ustoz MLBB ALMAZ SERVICE — ENG ISHONCHLI VA TEZKOR XIZMAT!
🔥 Siz so‘raysiz — biz jo‘natamiz! 🔥

📦 Narxlar ro‘yxati (MLBB Almazlar):

(100 + 10) 💎 — 25 000 so‘m
(150 + 15) 💎 — 35 000 so‘m
(250 + 30) 💎 — 57 000 so‘m
(500 + 70) 💎 — 115 000 so‘m
(1000 + 155) 💎 — 225 000 so‘m
(1500 + 265) 💎 — 340 000 so‘m
(2500 + 500) 💎 — 550 000 so‘m
(5000 + 1000) 💎 — 1 090 000 so‘m 💥

💳 Weekly Diamond Pass — 25 000 so‘m

⸻

⚙️ Afzalliklarimiz:
✅ 1–5 daqiqada yetkazib berish
✅ 100% ishonchli to‘lov tizimi
✅ Doimiy mijozlarga bonuslar 🎁
✅ 24/7 qo‘llab-quvvatlash

⸻

📩 Buyurtma berish uchun:
👉 ID raqamingizni yuboring
👉 To‘lovni amalga oshiring
👉 Almazlaringizni qabul qiling ⚡️
        `,
        { parse_mode: 'Markdown' },
      );
    });

    // 🔁 Almas sotish tugmasi bosilganda
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

    // Oddiy matn xabariga javob — menyuni ko‘rsatish
    this.bot.on('text', async (ctx) => {
      await ctx.reply(
        'Manu tanlang:',
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.callback('💰 Almas narxlari', 'price')],
            [Markup.button.callback('🔁 Almas olish', 'buy')],
          ]),
        },
      );
    });
    

    // Botni ishga tushuramiz
    this.bot.launch();
    console.log('✅ Telegram bot menyu bilan ishga tushdi...');
  }
}
