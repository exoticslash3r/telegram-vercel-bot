from fastapi import FastAPI, Request
import os
import requests

app = FastAPI()

BOT_TOKEN = os.environ.get("BOT_TOKEN")
if not BOT_TOKEN:
    raise Exception("BOT_TOKEN not set")

API_URL = f"https://api.telegram.org/bot{BOT_TOKEN}"

@app.post("/")
async def webhook(request: Request):
    try:
        data = await request.json()
    except:
        return {"ok": True}

    message = data.get("message")
    if message:
        chat_id = message["chat"]["id"]
        text = message.get("text", "Hello")
        requests.post(
            f"{API_URL}/sendMessage",
            json={"chat_id": chat_id, "text": f"You said: {text}"}
        )
    return {"ok": True}
