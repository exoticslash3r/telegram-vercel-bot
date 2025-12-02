import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("OK");
  }

  const message = req.body?.message;
  if (!message) return res.status(200).send("OK");

  const chatId = message.chat.id;
  const text = message.text || "Hello";

  await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: `You said: ${text}`
    })
  });

  res.status(200).send("OK");
}
