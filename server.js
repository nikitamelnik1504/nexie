import { Telegraf, Markup, Scenes, session } from "telegraf";
import { getArrayFromFile, writeArrayToFile } from "./src/utils/helper.js";
import express from "express";
import { WebSocketServer } from "ws";
import Chat from "./src/Chat.js";
import MessageRetriever from "./src/MessageRetreiver.js";
import ProfileManager from "./src/managers/ProfileManager.js";
import AccountManager from "./src/managers/AccountManager.js";


const bot = new Telegraf('7639460431:AAFv2g2y9wdz1GEb7gORgiugyJ8qWlYHkRg', { handlerTimeout: 600000 });
const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiODBlOGFjM2E4ZGY1NjZiZjkxYjU2MjU0NjM4NWE4NjI1NjlhMGEwMTE5OTVkZWVlZjNkMWU1YzM3ZjRjN2I1MDQ5NjFiZDA5MTgyMzkyMjIiLCJpYXQiOjE3MjcyOTI1OTcuNjExNTQ1LCJuYmYiOjE3MjcyOTI1OTcuNjExNTQ2LCJleHAiOjE3NTg4Mjg1OTcuNTk2OTYzLCJzdWIiOiIzNzUwNTE0Iiwic2NvcGVzIjpbXX0.cu3orWJhCEn2nqytQXTs7H6_7DhzlcSbZXxOTkbmkOzA_VpVRVuCrU3wtLGl-NSGhdi9yLTaE6Jo5i14NSqJTsUf3j2eWetUoHN3t-XIT_0dcHxFTUD1NvEF0JoJX6CPk05r6AOC7Dw4f10SPGVWbdVct2vJJDuvnWKdWDR8AAsvj-Uszgg8R8u80P1zh1o3OpQ5qSXsl1kHeacj4Nog1ZNKDZ6kGQ-6b1yR8bOItjW_FlIu37pfiiZNzWB6WIs_N7amRB9EAXXAl1AQxLHZHreJ0butYzn6nWIfW-2vvB5ZS8H6nDI-khpzAo4-Qomeg8qPELJmCDEoTbOdaQB-TISFATMGvAI2oYIbVDHpk0GxGGEh4RiM3A181IToypYdsxvsmSYrzgEsybekdQavuVIiVnhLcyNcZJRIfYYFj14pyk_oCwRl12yMUYylFU6q_LN7_Nj-zaEH0jAIHlRWM2gVZCCIgb_-37xgtwT6hOc_JGohhl1p_wIjW-HgJjgP-42l4JAmCcLJBKtVSS6PilGO9tPfldfqgK0Z4fHpBOgJkkpNxcqhlykf91hbU4h85eIqD1UH5bhVdr5608mN1_FC_VRqX8W_RvDskQi47_7Z0lSdj7lL6E-dZ4YJpIYfqc0BTXlXFJb0_uTSIlXFTAQFYSEs-Su7TR_ywbXFI4Y'
const chatsUrl = 'https://194-62-105-58.sslip.io/chats';

bot.start((ctx) => {
    showMenu(ctx);
});

function showMenu(ctx) {
    ctx.reply('Choose option:', Markup.keyboard([Markup.button.webApp('Chats', chatsUrl), 'Settings']).resize());
}

bot.hears('Chats', async (ctx) => {
    Markup.button.webApp('Open chats', `${chatsUrl}/chats`)
    // ctx.reply(
    //     'Opening chat...',
    //     Markup.inlineKeyboard([
    //         Markup.button.webApp('Open chat', `${chatsUrl}/chats`)
    //     ])
    // );
});


bot.hears('Settings', (ctx) => {
    ctx.reply('Settings:', Markup.keyboard(['Access', 'Accounts', 'Back']).resize());
});

bot.hears('Back', (ctx) => {
    showMenu(ctx);
})

bot.hears('Access', (ctx) => {
    ctx.reply('Enter the user ID');
    // bot.on('text', (msg) => {
    //     const userId = msg.message.text;
    //     if (!accesList.allowedUsers.includes(userId)) {
    //         accesList.allowedUsers.push(userId);
    //         saveAccessList(accesList);
    //         ctx.reply(`Access granted`);
    //     } else {
    //         ctx.reply('This user already has access');
    //     }
    // })
})


const profiles = await ProfileManager.getProfiles(token);
const platforms = ['ton', 'fancentro', 'fansly'];



bot.action(/account_delete_(\d+)/, async (ctx) => {
    const index = Number(ctx.match[1]);
    let accounts = await getArrayFromFile('./private/accounts.json');
    await accounts.splice(index, 1);
    await writeArrayToFile('./private/accounts.json', accounts);
    ctx.reply('The account has been successfully deleted');
});

bot.hears('Accounts', async (ctx) => {
    let accounts = await getArrayFromFile('./private/accounts.json');
    if (accounts.length > 0) {
        let index = 0;
        for (const account of accounts) {
            await ctx.reply(`Account name: ${account.name} \nPlatform: ${account.platform}`, Markup.inlineKeyboard([
                Markup.button.callback('Delete account', `account_delete_${index}`)
            ]));
            index++;
        }
    }
    ctx.reply('Choose option', {
        reply_markup: {
            keyboard: [
                [{ text: 'Add account' }, { text: 'Back' }]
            ],
            resize_keyboard: true
        }
    })
});

const addAccountScene = new Scenes.WizardScene(
    'add-account-scene',

    async (ctx) => {
        ctx.reply('Enter login or email:');
        return ctx.wizard.next();
    },

    async (ctx) => {
        ctx.scene.session.login = ctx.message.text;
        ctx.reply('Enter password:');
        return ctx.wizard.next();
    },

    async (ctx) => {
        ctx.scene.session.password = ctx.message.text;
        ctx.reply('Enter name:');
        return ctx.wizard.next();
    },

    async (ctx) => {
        ctx.scene.session.name = ctx.message.text;


        await ctx.reply('Choose platform please:', Markup.inlineKeyboard(
            platforms.map(platform => Markup.button.callback(platform, platform))
        ));

        return ctx.wizard.next();
    },

    async (ctx) => {
        let accounts = await getArrayFromFile('./private/accounts.json');
        const platform = ctx.callbackQuery.data;
        ctx.scene.session.platform = platform;
        await ctx.reply('Wait please');
        const { login, password, name } = ctx.scene.session;
        const accountManager = new AccountManager(token, profiles.data, accounts, login, password, platform);
        const result = await accountManager.bindAccount();
        ctx.scene.session.result = result;
        ctx.scene.session.accountManager = accountManager;
        if (ctx.scene.session.result.isCode) {
            ctx.reply('Enter 2Fa code');
            return ctx.wizard.next();
        } else {
            if (result.success) {
                await accounts.push({ login, password, name, platform, profileId: result.profile.id });
                await writeArrayToFile('./private/accounts.json', accounts)
                await ctx.reply(`The account ${name} is successfully linked to the platform`);

                const messageRetreiver = new MessageRetriever(token, result.profile.id);

                messageRetreiver.start().then(async () => {
                    const messages = await messageRetreiver.getProfileMessage(platform);
                    const dialogs = await getArrayFromFile('./private/dialogs.json');

                    for (const message of messages) {
                        let dialogFound = false;
                        // for (const dialog of dialogs) {
                        //     if (dialog.dialogId === message.dialogId) {
                        //         await dialog.messages.push(message.message);
                        //         dialogFound = true;
                        //         break;
                        //     }
                        // }
                        if (!dialogFound) {
                            await dialogs.push({
                                dialogId: message.dialogId || null,
                                profileId: result.profile.id,
                                name: message.name,
                                viewed: message.viewed,
                                platform: platform,
                                messages: [
                                    {
                                        message: message.message,
                                        sender: message.viewed
                                    }
                                ]
                            });
                        }
                        console.log(dialogs)
                        await writeArrayToFile('./private/dialogs.json', dialogs);

                        await messageRetreiver.start();
                        await messageRetreiver.getMessageFromWebSocket(platform);
                    }
                    console.log('leave');
                });
            } else {
                await ctx.reply(result.message);
            }
            return ctx.scene.leave();
        }
    },

    async (ctx) => {
        let accounts = await getArrayFromFile('./private/accounts.json');
        const { login, password, name, platform } = ctx.scene.session;
        const code = ctx.message.text;
        const result = await ctx.scene.session.accountManager.setTwoFactorAuthCode(code);
        console.log(result);

        if (result.success) {
            accounts.push({ login, password, name, platform, profileId: result.profile.id });
            await writeArrayToFile('./private/accounts.json', accounts)
            await ctx.reply(`The account ${name} is successfully linked to the platform`);

            const messageRetreiver = new MessageRetriever(token, result.profile.id);
            messageRetreiver.start().then(async () => {
                const messages = await messageRetreiver.getProfileMessage(platform);
                const dialogs = await getArrayFromFile('./private/dialogs.json');

                for (const message of messages) {
                    let dialogFound = false;
                    for (const dialog of dialogs) {
                        if (dialog.dialogId === message.dialogId) {
                            // await dialog.messages.push({message: message.message, sender: message.sender});
                            dialog = {
                                dialogId: message.dialogId || null,
                                profileId: result.profile.id,
                                name: message.name,
                                viewed: message.viewed,
                                platform,
                                messages: [
                                    {
                                        message: message.message,
                                        sender: 'inbox'
                                    }
                                ]
                            }
                            dialogFound = true;
                            break;
                        }
                    }
                    if (!dialogFound) {
                        await dialogs.push({
                            dialogId: message.dialogId || null,
                            profileId: result.profile.id,
                            name: message.name,
                            viewed: message.viewed,
                            platform,
                            messages: [
                                {
                                    message: message.message,
                                    sender: 'inbox'
                                }
                            ]
                        });
                    }
                    console.log(dialogs)
                    await writeArrayToFile('./private/dialogs.json', dialogs);

                    await messageRetreiver.start();
                    await messageRetreiver.getMessageFromWebSocket(platform);
                }
            });
            // const messages = await messageRetreiver.getProfileMessage(platform);
            // console.log(messages);
            // const dialogs = await getArrayFromFile('./private/dialogs.json');

            // for (const message of messages) {
            //     let dialogFound = false;
            //     for (const dialog of dialogs) {
            //         if (dialog.dialogId === message.dialogId) {
            //             // await dialog.messages.push({message: message.message, sender: message.sender});
            //             dialog = {
            //                 dialogId: message.dialogId || null,
            //                 profileId: result.profile.id,
            //                 name: message.name,
            //                 viewed: message.viewed,
            //                 platform,
            //                 messages: [
            //                     {
            //                         message: message.message,
            //                         sender: 'inbox'
            //                     }
            //                 ]
            //             }
            //             dialogFound = true;
            //             break;
            //         }
            //     }
            //     if (!dialogFound) {
            //         await dialogs.push({
            //             dialogId: message.dialogId || null,
            //             profileId: result.profile.id,
            //             name: message.name,
            //             viewed: message.viewed,
            //             platform,
            //             messages: [
            //                 {
            //                     message: message.message,
            //                     sender: 'inbox'
            //                 }
            //             ]
            //         });
            //     }
            //     console.log(dialogs)
            //     await writeArrayToFile('./private/dialogs.json', dialogs);

            //     messageRetreiver.getMessageFromWebSocket(platform);
            // }
        } else {
            await ctx.reply(result.message);
        }
        return ctx.scene.leave();
    }
);

const stage = new Scenes.Stage([addAccountScene]);

bot.use(session());
bot.use(stage.middleware());

bot.hears('Add account', (ctx) => {
    ctx.scene.enter('add-account-scene');
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
                <button class="back-button" onclick="location.href='/chats'">Back</button>
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
    const profiles = await ProfileManager.getProfiles(token);
    for (const profile of profiles.data) {
        const profileManager = new ProfileManager(token, profile.id);
        await profileManager.stopProfile();
    }
})

bot.launch();

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
    ws.on('message', async (message) => {
        const data = JSON.parse(message);
        if (data.userName && data.profileId) {
            ws.chat = new Chat(token, data.profileId, data.platform, (newMessage) => {
                ws.send(JSON.stringify({ newMessage }));
            });
            await ws.chat.startChat(data.userName, data.dialogId, data.platform);
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
