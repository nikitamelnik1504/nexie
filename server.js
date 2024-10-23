import { Telegraf, Markup, Scenes, session} from "telegraf";
import { getArrayFromFile, writeArrayToFile } from "./src/utils/helper.js";
import express from "express";
import { WebSocketServer } from "ws";
import Chat from "./src/Chat.js";
import MessageRetriever from "./src/MessageRetreiver.js";
import ProfileManager from "./src/managers/ProfileManager.js";
import Account from "./src/Account.js";
import AccountManager from "./src/managers/AccountManager.js";


const bot = new Telegraf('7639460431:AAFv2g2y9wdz1GEb7gORgiugyJ8qWlYHkRg', {handlerTimeout: 300000});
const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiODBlOGFjM2E4ZGY1NjZiZjkxYjU2MjU0NjM4NWE4NjI1NjlhMGEwMTE5OTVkZWVlZjNkMWU1YzM3ZjRjN2I1MDQ5NjFiZDA5MTgyMzkyMjIiLCJpYXQiOjE3MjcyOTI1OTcuNjExNTQ1LCJuYmYiOjE3MjcyOTI1OTcuNjExNTQ2LCJleHAiOjE3NTg4Mjg1OTcuNTk2OTYzLCJzdWIiOiIzNzUwNTE0Iiwic2NvcGVzIjpbXX0.cu3orWJhCEn2nqytQXTs7H6_7DhzlcSbZXxOTkbmkOzA_VpVRVuCrU3wtLGl-NSGhdi9yLTaE6Jo5i14NSqJTsUf3j2eWetUoHN3t-XIT_0dcHxFTUD1NvEF0JoJX6CPk05r6AOC7Dw4f10SPGVWbdVct2vJJDuvnWKdWDR8AAsvj-Uszgg8R8u80P1zh1o3OpQ5qSXsl1kHeacj4Nog1ZNKDZ6kGQ-6b1yR8bOItjW_FlIu37pfiiZNzWB6WIs_N7amRB9EAXXAl1AQxLHZHreJ0butYzn6nWIfW-2vvB5ZS8H6nDI-khpzAo4-Qomeg8qPELJmCDEoTbOdaQB-TISFATMGvAI2oYIbVDHpk0GxGGEh4RiM3A181IToypYdsxvsmSYrzgEsybekdQavuVIiVnhLcyNcZJRIfYYFj14pyk_oCwRl12yMUYylFU6q_LN7_Nj-zaEH0jAIHlRWM2gVZCCIgb_-37xgtwT6hOc_JGohhl1p_wIjW-HgJjgP-42l4JAmCcLJBKtVSS6PilGO9tPfldfqgK0Z4fHpBOgJkkpNxcqhlykf91hbU4h85eIqD1UH5bhVdr5608mN1_FC_VRqX8W_RvDskQi47_7Z0lSdj7lL6E-dZ4YJpIYfqc0BTXlXFJb0_uTSIlXFTAQFYSEs-Su7TR_ywbXFI4Y'


bot.start((ctx) => {
    ctx.reply('Choose option:', Markup.keyboard(['Chats', 'Settings']).resize());
});

bot.hears('Chats', async (ctx) => {
    const messages = await getArrayFromFile('./private/messages.json');

    await messages.forEach(msg => {
        ctx.reply(
            `[${msg.name}] ${msg.message}`,
            Markup.inlineKeyboard([
                Markup.button.webApp('Open chat', `https://d259-20-61-126-212.ngrok-free.app/chats`)
            ])
        );
    });
});


bot.hears('Settings', (ctx) => {
    // ctx.reply('Settings:', {
    //     reply_markup: {
    //         keyboard: [
    //             [{text: 'Access', callback_data: 'acces'}],
    //             [{text: 'Back', callback_data: 'back'}]
    //         ],
    //         rezise_keyboard: true,
    //         one_time_keyboard: true
    //     }
    // })
    ctx.reply('Settings:', Markup.keyboard(['Access', 'Accounts', 'Back']).resize());
});

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

let accounts = await getArrayFromFile('./private/accounts.json');
let addingAccount = false;
let accountLogin = '';
let accountPassword = '';
let accountName = '';
const profiles = await ProfileManager.getProfiles(token);

bot.hears('Accounts', (ctx) => {
    // accounts.forEach(account => {

    // })
    ctx.reply('Choose option', {
        reply_markup: {
            keyboard: [
                [{ text: 'Add account' }, { text: 'Delete account' }]
            ],
            resize_keyboard: true
        }
    })
});

const addAccountScene = new Scenes.WizardScene(
    'add-account-scene',

    // Первый шаг - ввод логина
    async (ctx) => {
        ctx.reply('Введите логин:');
        return ctx.wizard.next();
    },

    // Второй шаг - ввод пароля
    async (ctx) => {
        ctx.scene.session.login = ctx.message.text;
        ctx.reply('Введите пароль:');
        return ctx.wizard.next();
    },

    // async (ctx) => {
    //     ctx.scene.session.password = ctx.message.text;
    //     ctx.reply('Введите имя:');
    //     return ctx.wizard.next();
    // },

    // Четвёртый шаг - выбор платформы
    async (ctx) => {
        ctx.scene.session.name = ctx.message.text;

        const platforms = ['ton', 'fancentro', 'fansly'];
        await ctx.reply('Выберите платформу:', Markup.inlineKeyboard(
            platforms.map(platform => Markup.button.callback(platform, platform))
        ));

        return ctx.wizard.next();
    },

    async (ctx) => {
        const platform = ctx.callbackQuery.data;
        ctx.scene.session.platform = platform;
        await ctx.reply('Wait please');
        const { login, password, name } = ctx.scene.session;
        const accountManager = new AccountManager(token, profiles.data, accounts, login, password, name);
        const result = await accountManager.bindAccount();
        ctx.scene.session.result = result;
        ctx.scene.session.accountManager = accountManager;
        if (ctx.scene.session.result.isCode) {
            ctx.reply('Enter 2Fa code');
            return ctx.wizard.next();
        } else {
            return ctx.scene.leave();
        }
    },

    async (ctx) => {
            const code = ctx.message.text;
            ctx.scene.session.accountManager.setTwoFactorAuthCode(code);
            const result = ctx.scene.session.result;

            if (result.success) {
                await ctx.reply(`Аккаунт успешно привязан к профилю ${result.profile.name}`);
            } else {
                await ctx.reply(result.message);
            }
            return ctx.scene.leave(); // Завершаем сцену
            }
        );

        // Создаём менеджер сцен
        const stage = new Scenes.Stage([addAccountScene]);

        bot.use(session());
        bot.use(stage.middleware());

        // Обрабатываем команду добавления аккаунта
        bot.hears('Add account', (ctx) => {
            ctx.scene.enter('add-account-scene');
        });


        // bot.hears('Add account', (ctx) => {
        //     addingAccount = true;
        //     ctx.reply('Enter login:');
        // })

        // bot.on('text', async (ctx) => {
        //     if (addingAccount && !accountLogin) {
        //         accountLogin = ctx.message.text;
        //         ctx.reply('Enter password:');
        //     } else if (addingAccount && accountLogin && !accountPassword) {
        //         accountPassword = ctx.message.text;
        //         ctx.reply('Enter name');
        //     } else if (addingAccount && accountLogin && accountPassword && !accountName) {
        //         accountName = ctx.message.text;
        //         ctx.reply('Ented 2fa code or any character');
        //     } else if (addingAccount && accountLogin && accountPassword && accountName) {
        //         accounts.push({login: accountLogin, password: accountPassword, name: accountName});
        //         await writeArrayToFile('./private/accounts.json', accounts);
        //         const account = new Account();
        //     }
        // })


        console.log('bot started');



        const app = express();
        app.use(express.static('private'));

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
            const profiles = await ProfileManager.getProfiles(token);
            // console.log(profiles)
            // for (const profile of profiles.data) {
            //     const messageRetreiver = new MessageRetriever(token, profile.id);
            //     await messageRetreiver.start().then(()=>{

            //     })
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
