import ProfileManager from "./managers/ProfileManager.js";
import BrowserManager from "./managers/BrowserManager.js";
import CookieManager from "./managers/CookieManager.js";
import { getArrayFromFile, writeArrayToFile } from "./utils/helper.js";

export default class Chat {
    constructor(token, profileId, platform, handleNewMessageCallback) {
        this.page = null;
        this.chat = null;
        this.profileId = profileId;
        this.token = token;
        this.browser = null;
        this.profile = null;
        this.queue = [];
        this.messageSending = false;
        this.dialogId = null;
        this.handleNewMessageCallback = handleNewMessageCallback;
        this.platform = platform;
    }

    async startChatFansly(userName, dialogId) {
        try {
            this.profile = new ProfileManager(this.token, this.profileId);
            await this.profile.startProfile();
            this.browser = new BrowserManager(this.token, this.profile);
            const cookieManager = new CookieManager(this.token, this.profileId);
            const cookies = await cookieManager.exportCookies();
            await this.browser.connect();

            this.page = await this.browser.newPage();
            await this.page.setCookie(...cookies);
            await this.page.setViewport({width: 414, height: 896})

            await this.page.setRequestInterception(true);
            this.page.on('request', req => {
                if (['stylesheet', 'font'].includes(req.resourceType())) {
                    req.abort();
                } else {
                    req.continue();
                }
            })

            // this.page.on('console', async (msg) => console.log('puppeteer:', await Promise.all(msg.args().map(arg => arg.jsonValue()))));
            await this.page.goto(`https://fansly.com/messages/${dialogId}`, { waitUntil: 'networkidle2' });
            console.log('start');

            await this.page.screenshot({path: 'test.png'});

            await this.page.waitForSelector('.message-collection', {timeout: 60000});
            // await this.page.screenshot({path: 'test.png'});

            this.chat = await this.page.evaluate(() => {
                const messages = document.querySelectorAll('.message-collection app-group-message.message');
                const chat = [];
                messages.forEach(message => {
                    if (message.querySelector('.message-text-wrapper .message-text')) {
                        const messageText = message.querySelector('.message-text-wrapper .message-text').textContent;
                        const sender = message.classList.contains('my-message') ? 'outbox' : 'inbox';
                        chat.push({message: messageText, sender});
                    }
                });
                return chat;
            });

            const dialogs = await getArrayFromFile('./private/dialogs.json')
            for (const dialog of dialogs) {
                if (dialog.dialogId === dialogId) {
                    dialog.messages = this.chat;
                    dialog.viewed = true;
                }
            }

            await writeArrayToFile('./private/dialogs.json', dialogs);
            console.log('oks');


            const client = await this.page.target().createCDPSession();
            await client.send('Network.enable')
            client.on('Network.webSocketFrameReceived', async ({ requestId, timestamp, response }) => {
                const data = JSON.parse(response.payloadData);
                // if (data.body?.dialog?.id === this.dialogId && data.body.message) {
                //     await this.handleNewMessageCallback(data.body.message.text);
                // }
            });
        } catch (err) {
            console.log(err);
            console.log('restart');
            // if (this.page) {
            //     await this.page.close();
            // }
            await this.browser.disconnect();
            await this.startChatFansly(userName, dialogId);
        }

    }

    async startChat(userName, dialogId) {
        switch (this.platform) {
            case 'ton':
                await this.startChatTon(userName, dialogId);
                break;
            case 'fansly':
                await this.startChatFansly(userName, dialogId);
                break;
        }
    }

    async startChatTon(userName) {
        try {
            this.profile = new ProfileManager(this.token, this.profileId);
            await this.profile.startProfile();
            this.browser = new BrowserManager(this.token, this.profile);
            const cookieManager = new CookieManager(this.token, this.profileId);
            const cookies = await cookieManager.exportCookies();
            await this.browser.connect();

            this.page = await this.browser.newPage();
            await this.page.setCookie(...cookies);

            await this.page.setRequestInterception(true);
            this.page.on('request', req => {
                if (['stylesheet', 'font'].includes(req.resourceType())) {
                    req.abort();
                } else {
                    req.continue();
                }
            })
            this.handleWebSocketNewMessage();
            this.page.on('console', async (msg) => console.log('puppeteer:', await Promise.all(msg.args().map(arg => arg.jsonValue()))));
            await this.page.goto(`https://ton.place/im`, { waitUntil: 'networkidle0' });
            console.log('start');
            await this.page.waitForSelector('.Dialog__name');

            const isChat = await this.page.evaluate((userName) => {
                const elements = document.querySelectorAll('.Dialog__name');

                for (const element of elements) {
                    if (element.innerText == userName) {
                        element.click();
                        return true;
                    }
                }
                console.log('Netu elementa');
                return false;
            }, userName);
            if (!isChat) {
                return;
            }
            await this.page.waitForSelector('.inbox');

            this.chat = await this.page.evaluate(() => {
                const chat = document.querySelector('.History');
                const elementsMessages = chat.querySelectorAll('.Message');

                let consChat = [];

                for (const message of elementsMessages) {
                    if (message.classList.contains('inbox') && message.querySelector('.Linkify')) {
                        consChat.push({
                            message: message.querySelector('.Linkify').innerText,
                            sender: "inbox",
                        });
                    } else if (message.classList.contains('outbox') && message.querySelector('.Linkify')) {
                        consChat.push({
                            message: message.querySelector('.Linkify').innerText,
                            sender: "outbox",
                        });
                    }
                }

                return consChat;
            });
            this.dialogId = this.page.url().match(/\d+/g).join('');
            const chats = await getArrayFromFile('./private/dialogs.json');
            await chats.push({
                dialogId: this.dialogId,
                profileId: this.profileId,
                name: userName,
                viewed: true,
                platform: 'ton',
                messages: this.chat
            });
            await writeArrayToFile('./private/dialogs.json', chats);
            console.log('oks');
            return;
        } catch (error) {
            console.log(error);
            if (this.browser) {
                // await this.page.close();
                console.log('destroy browser')
                await this.browser.disconnect();
            }
            await this.profile.stopProfile();
            await this.startChat(userName);
        }
    }

    async sendMessage(message) {
        try {
            await this.page.goto(this.page.url(), { waitUntil: 'networkidle2' });
            await this.page.waitForSelector('.SendForm__input_wrap .Input__wrapper .Input');

            await this.page.evaluate((message) => {
                const messageInput = document.querySelector('.SendForm__input_wrap .Input__wrapper .Input');

                if (messageInput) {
                    messageInput.value = message;
                }
                return true;
            }, message);
            console.log('Message sended');
            return true;
        } catch {
            await this.sendMessage(message);
        }
    }

    async sendMessageFansly(message) {
        try {
            console.log('message start');
            await this.page.goto(this.page.url(), { waitUntil: 'networkidle2' });
            await this.page.waitForSelector('app-group-message-input .message-input-container .message-input');

            await this.page.type('app-group-message-input .message-input-container .message-input', message);
            await this.page.waitForSelector('.send-button.can-send');
            // await this.page.click('.send-button.can-send');
            await this.page.screenshot({path: 'test.png'});
        } catch {
            await this.sendMessageFansly(message);
        }

    }

    async addMessageToQueue(message = null) {
        if (message) {
            this.queue.push(message);
        }
        if (!this.messageSending) {
            this.messageSending = true;
            for (const msg of this.queue) {
                switch (this.platform) {
                    case 'ton':
                        await this.sendMessage(msg);
                    case 'fansly':
                        await this.sendMessageFansly(msg);
                }
                
                this.queue = this.queue.filter(el => el !== msg);
            }
            this.messageSending = false;
        } else {
            await new Promise(resolve => setTimeout(resolve, 10000));
            await this.addMessageToQueue();
        }
    }

    async handleWebSocketNewMessage() {
        const client = await this.page.target().createCDPSession();
        await client.send('Network.enable')
        client.on('Network.webSocketFrameReceived', async ({ requestId, timestamp, response }) => {
            const data = JSON.parse(response.payloadData);
            if (data.body?.dialog?.id === this.dialogId && data.body.message) {
                await this.handleNewMessageCallback(data.body.message.text);
            }
        });
    }

    async close() {
        if (!this.messageSending) {
            await this.page.close();
        } else {
            await new Promise(resolve => setTimeout(resolve, 10000));
            await this.close();
        }
    }
}