import { Telegraf, Markup } from "telegraf";
const bot = new Telegraf('7639460431:AAFv2g2y9wdz1GEb7gORgiugyJ8qWlYHkRg');
import { getArrayFromFile } from "./src/utils/helper.js";
import express from "express";
import path from "path";

bot.start((ctx) => {
    ctx.reply('Choose option:', Markup.keyboard(['Chats', 'Settings']).resize());
});

bot.hears('Chats', async (ctx) => {
    const messages = await getArrayFromFile('./private/messages.json');

    await messages.forEach(msg => {
        ctx.reply(
            `[${msg.name}] ${msg.message}`,
            Markup.inlineKeyboard([
                Markup.button.url('Open chat', `https://d852-4-180-183-240.ngrok-free.app/chat?profile_id=${msg.profileId}&name=${msg.name}`)
            ])
        );
    });
});


bot.hears('Settings', (ctx) => {
    ctx.reply('Logic settings');
});

console.log('bot started');

const app = express();
app.use(express.static('private'));

app.get('/chat', (req, res) => {
    console.log(req.query);
    const profileId = decodeURIComponent(req.query.profile_id);
    const userName = decodeURIComponent(req.query.name);
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Responsive Chat</title>
        <link rel="stylesheet" href="styles.css">
        </head>
        <body>

        <div class="chat-container">
            <div class="chat-header">
            <h2>Chat with ${userName}</h2>
            </div>
            
            <div class="chat-body">
            <div class="message received">
                <p>Hello! How are you?</p>
            </div>
            <div class="message sent">
                <p>I'm good, thank you! And you?</p>
            </div>
            </div>
            
            <div class="chat-footer">
            <input type="text" placeholder="Type your message..." class="chat-input">
            <button class="send-button">Send</button>
            </div>
        </div>

        <script>
            const currentUrl = window.location.href;

            
        </script>

        </body>
        </html>
    `);
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{
    console.log('server running');
})

bot.launch();