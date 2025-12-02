import { Telegraf, Markup } from "telegraf";

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) throw new Error("BOT_TOKEN not set");

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => ctx.reply("🤖 Bot running"));

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(200).send("OK");
  const body = await new Promise((resolve) => {
    let data = "";
    req.on("data", chunk => data += chunk);
    req.on("end", () => resolve(JSON.parse(data)));
  });
  await bot.handleUpdate(body);
  res.status(200).send("OK");
}
