import { Telegraf, Markup } from "telegraf";
import { json } from "micro";

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = Number(process.env.ADMIN_ID);
if (!BOT_TOKEN) throw new Error("BOT_TOKEN not set");

const bot = new Telegraf(BOT_TOKEN);

// In-memory missions storage
let MISSIONS = {};

// Helper for user label
const userLabel = (ctx) => ${ctx.from.first_name || ""} ${ctx.from.last_name || ""}.trim();

// ---------- Message handler ----------
bot.on("text", async (ctx) => {
  const text = ctx.message.text;
  const user = ctx.from;

  if (ctx.session && ctx.session.flow === "mission_proof") {
    const mission_title = ctx.session.mission_title || "Unknown mission";
    const mid = m_${Date.now()};
    const caption = 📥 *Mission Proof Submitted*\n\n⚙️ Mission: ${mission_title}\n👤 User: ${userLabel(ctx)}\n🆔 ID: ${user.id};

    try {
      await ctx.telegram.sendMessage(ADMIN_ID, caption, { parse_mode: "Markdown" });
      await ctx.telegram.sendMessage(
        ADMIN_ID,
        "Review buttons:",
        Markup.inlineKeyboard([
          Markup.button.callback("✅ Accept Proof", `admin:accept:proof:${user.id}:${mid}`),
          Markup.button.callback("❌ Decline Proof", `admin:decline:proof:${user.id}:${mid}`)
        ])
      );
      await ctx.reply("✅ Proof submitted and sent to admin for review.");
    } catch (err) {
      console.error(err);
      await ctx.reply("❌ Failed to send proof to admin.");
    }
    ctx.session = null;
    return;
  }

  if (ctx.session && ctx.session.flow === "publish_code") {
    if (text === process.env.PUBLISH_CODE) {
      ctx.session.pub = 1;
      await ctx.reply("Send mission title.");
      return;
    } else {
      await ctx.reply("❌ Invalid code.");
      return;
    }
  }

  if (ctx.session && ctx.session.pub === 1) {
    ctx.session.title = text;
    ctx.session.pub = 2;
    await ctx.reply("Send mission description.");
    return;
  }

  if (ctx.session && ctx.session.pub === 2) {
    const mid = m_${Date.now()};
    MISSIONS[mid] = { title: ctx.session.title, document: text };
    ctx.session = null;
    await ctx.reply("✅ Mission published.");
    return;
  }

  // Default reply
  await ctx.reply("Use /start");
});

// ---------- Callback Queries ----------
bot.on("callback_query", async (ctx) => {
  const data = ctx.callbackQuery.data;
  if (!data) return;

  if (data.startsWith("admin:accept:proof:")) {
    const userId = data.split(":")[3];
    await ctx.reply(`✅ Proof accepted for user ${userId}`);
    await ctx.answerCbQuery();
    return;
  }

  if (data.startsWith("admin:decline:proof:")) {
    const userId = data.split(":")[3];
    await ctx.reply(`❌ Proof declined for user ${userId}`);
    await ctx.answerCbQuery();
    return;
  }
});

// ---------- /start ----------
bot.start((ctx) => ctx.reply("🤖 Bot running"));

// ---------- Vercel Webhook handler ----------
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(200).send("OK");
  const body = await json(req);
  await bot.handleUpdate(body);
  res.status(200).send("OK");
}
