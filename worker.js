const REGISTER_URL = "https://sho-rt.org/?ref=5GENIL";
const DOWNLOAD_URL = "https://sho-rt.org/?ref=5GENIL";
const CHANNEL_URL = "https://t.me/empire88channel";
const SUPPORT_URL = "https://t.me/Aurelia_1317";
const IMAGE_URL = "https://i.imgur.com/X5v4cI5.png";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/") {
      return new Response("Empire88 Bot is running");
    }

    if (request.method === "GET" && url.pathname === "/setup") {
      const webhookUrl = `${url.origin}/webhook`;

      const result = await telegram(env.BOT_TOKEN, "setWebhook", {
        url: webhookUrl,
        secret_token: env.WEBHOOK_SECRET,
        drop_pending_updates: true
      });

      return Response.json(result);
    }

    if (request.method === "POST" && url.pathname === "/webhook") {
      const secret = request.headers.get(
        "X-Telegram-Bot-Api-Secret-Token"
      );

      if (secret !== env.WEBHOOK_SECRET) {
        return new Response("Unauthorized", { status: 401 });
      }

      const update = await request.json();

      if (update.message) {
        const chatId = update.message.chat.id;
        const text = update.message.text || "";

        if (text.startsWith("/start")) {
          await sendWelcome(chatId, env);
        } else {
          await sendMenu(chatId, env);
        }
      }

      if (update.callback_query) {
        const callback = update.callback_query;
        const chatId = callback.message.chat.id;

        await telegram(env.BOT_TOKEN, "answerCallbackQuery", {
          callback_query_id: callback.id
        });

        if (callback.data === "promotions") {
          await telegram(env.BOT_TOKEN, "sendMessage", {
            chat_id: chatId,
            text:
              "🎁 <b>Empire88 Promotions</b>\n\n" +
              "查看最新会员优惠及特别活动。",
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "🔥 Claim Bonus",
                    url: REGISTER_URL
                  }
                ],
                [
                  {
                    text: "⬅️ Back",
                    callback_data: "menu"
                  }
                ]
              ]
            }
          });
        }

        if (callback.data === "menu") {
          await sendMenu(chatId, env);
        }
      }

      return new Response("OK");
    }

    return new Response("Not found", { status: 404 });
  }
};

async function sendWelcome(chatId, env) {
  const result = await telegram(env.BOT_TOKEN, "sendPhoto", {
    chat_id: chatId,
    photo: IMAGE_URL,
    caption:
      "👋 <b>Welcome to Empire88</b>\n\n" +
      "One App. Endless Entertainment.\n\n" +
      "请选择你需要的服务 👇",
    parse_mode: "HTML",
    reply_markup: menuButtons()
  });

  if (!result.ok) {
    await sendMenu(chatId, env);
  }
}

async function sendMenu(chatId, env) {
  await telegram(env.BOT_TOKEN, "sendMessage", {
    chat_id: chatId,
    text: "请选择你需要的服务 👇",
    reply_markup: menuButtons()
  });
}

function menuButtons() {
  return {
    inline_keyboard: [
      [
        {
          text: "🎁 Promotions",
          callback_data: "promotions"
        },
        {
          text: "🌐 Register",
          url: REGISTER_URL
        }
      ],
      [
        {
          text: "📥 Download APP",
          url: DOWNLOAD_URL
        },
        {
          text: "📢 Official Channel",
          url: CHANNEL_URL
        }
      ],
      [
        {
          text: "💬 Customer Support",
          url: SUPPORT_URL
        }
      ]
    ]
  };
}

async function telegram(token, method, body) {
  const response = await fetch(
    `https://api.telegram.org/bot${token}/${method}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    }
  );

  return response.json();
}
