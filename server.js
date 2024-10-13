import { Telegraf, Markup } from "telegraf";
import { getArrayFromFile, writeArrayToFile } from "./src/utils/helper.js";
import express from "express";
import { WebSocketServer } from "ws";
import Chat from "./src/Chat.js";
import MessageRetriever from "./src/MessageRetreiver.js";
import ProfileManager from "./src/managers/ProfileManager.js";


const bot = new Telegraf('7639460431:AAFv2g2y9wdz1GEb7gORgiugyJ8qWlYHkRg');
const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiODBlOGFjM2E4ZGY1NjZiZjkxYjU2MjU0NjM4NWE4NjI1NjlhMGEwMTE5OTVkZWVlZjNkMWU1YzM3ZjRjN2I1MDQ5NjFiZDA5MTgyMzkyMjIiLCJpYXQiOjE3MjcyOTI1OTcuNjExNTQ1LCJuYmYiOjE3MjcyOTI1OTcuNjExNTQ2LCJleHAiOjE3NTg4Mjg1OTcuNTk2OTYzLCJzdWIiOiIzNzUwNTE0Iiwic2NvcGVzIjpbXX0.cu3orWJhCEn2nqytQXTs7H6_7DhzlcSbZXxOTkbmkOzA_VpVRVuCrU3wtLGl-NSGhdi9yLTaE6Jo5i14NSqJTsUf3j2eWetUoHN3t-XIT_0dcHxFTUD1NvEF0JoJX6CPk05r6AOC7Dw4f10SPGVWbdVct2vJJDuvnWKdWDR8AAsvj-Uszgg8R8u80P1zh1o3OpQ5qSXsl1kHeacj4Nog1ZNKDZ6kGQ-6b1yR8bOItjW_FlIu37pfiiZNzWB6WIs_N7amRB9EAXXAl1AQxLHZHreJ0butYzn6nWIfW-2vvB5ZS8H6nDI-khpzAo4-Qomeg8qPELJmCDEoTbOdaQB-TISFATMGvAI2oYIbVDHpk0GxGGEh4RiM3A181IToypYdsxvsmSYrzgEsybekdQavuVIiVnhLcyNcZJRIfYYFj14pyk_oCwRl12yMUYylFU6q_LN7_Nj-zaEH0jAIHlRWM2gVZCCIgb_-37xgtwT6hOc_JGohhl1p_wIjW-HgJjgP-42l4JAmCcLJBKtVSS6PilGO9tPfldfqgK0Z4fHpBOgJkkpNxcqhlykf91hbU4h85eIqD1UH5bhVdr5608mN1_FC_VRqX8W_RvDskQi47_7Z0lSdj7lL6E-dZ4YJpIYfqc0BTXlXFJb0_uTSIlXFTAQFYSEs-Su7TR_ywbXFI4Y'
const chatsUrl = 'https://';

bot.start((ctx) => {
    ctx.reply('Choose option:', Markup.keyboard(['Chats', 'Settings']).resize());
});

bot.hears('Chats', async (ctx) => {
    ctx.reply(
        'Opening chat...',
        Markup.inlineKeyboard([
            Markup.button.webApp('Open chat', `${chatsUrl}/chats`)
        ])
    );
});


bot.hears('Settings', (ctx) => {
    ctx.reply('Logic settings');
});

console.log('bot started');



const app = express();
app.use(express.static('private'));

app.get('/chats', async (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>All Chats</title>
            <link rel="stylesheet" href="chats.css">
        </head>
        <body>

        <div class="chat-list-container">
            <div class="chat-header">
                <h2>All Chats</h2>
            </div>
            
            <div id="chat-list" class="chat-body">
                <div class="loader-container">
                    <div class="loader"></div>
                </div>
            </div>
        </div>

        <script src="chatList.js"></script>

        </body>
        </html>
        `)
})

app.get('/chat', async (req, res) => {
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
             <div class="loader-container">
                <div class="loader"></div>
             </div>
            </div>
            
            <form class="chat-footer">
                <input type="text" placeholder="Type your message..." class="chat-input">
                <button type="submit" class="send-button">Send</button>
            </form>
        </div>

        <script src="chat.js"></script>

        </body>
        </html>
    `);
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log('server running');
    // const profiles = await ProfileManager.getProfiles(token);
    // console.log(profiles)
    // for (const profile of profiles.data) {
    //     const messageRetreiver = new MessageRetriever(token, profile.id);
    //     await messageRetreiver.start();
    //     await messageRetreiver.getMessageFromWebSocket();
    // }

    // const messageRetreiver = new MessageRetriever(token, 439402330);
    // await messageRetreiver.start();
    // await messageRetreiver.getMessageFromWebSocket();

})

bot.launch();

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
    ws.on('message', async (message) => {
        const data = JSON.parse(message);
        if (data.userName && data.profileId) {
            ws.chat = new Chat(token, data.profileId, (newMessage) => {
                ws.send(JSON.stringify({ newMessage }));
            });
            await ws.chat.startChat(data.userName);
            const chat = await ws.chat.chat;
            ws.send(JSON.stringify({ chat }));
        }

        if (data.message) {
            await ws.chat.addMessageToQueue(data.message);
        }
    });

    ws.on('close', (close) => {
        console.log('Connect closed', close)
        ws.chat.close();
    });
    ws.on('headers', (headers) => {
        headers.push('Access-Control-Allow-Origin: *');
        headers.push('Acces-Control-Allow-Methods: GET, POST');
    });
});
