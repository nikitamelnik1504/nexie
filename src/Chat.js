import ProfileManager from "./managers/ProfileManager.js";
import BrowserManager from "./managers/BrowserManager.js";
import CookieManager from "./managers/CookieManager.js";
import { getArrayFromFile, writeArrayToFile } from "./utils/helper.js";

export default class Chat {
    constructor(token, profileId, handleNewMessageCallback) {
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
    }

    async startChat(userName) {
        try {
            this.profile = new ProfileManager(this.token, this.profileId);
            await this.profile.startProfile();
            this.browser = new BrowserManager(this.token, this.profile);
            const cookieManager = new CookieManager(this.token, this.profileId);
            const cookies = await cookieManager.getFilteredCookieByUrl('ton.place');
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
            await this.page.goto(`https://ton.place/im`, { waitUntil: 'networkidle2' });
            await this.page.waitForSelector('.Dialog__name', { timeout: 10000 });

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
            await this.page.screenshot({path:'screren.png'})
            console.log(await this.page.content());
            
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
                    } else if (message.classList.contains('outbox')) {
                        consChat.push({
                            message: message.querySelector('.Linkify').innerText,
                            sender: "outbox",
                        });
                    }
                }

                return consChat;
            });
            this.dialogId = this.page.url().match(/\d+/g).join('');
            console.log(this.dialogId);
            const chats = await getArrayFromFile('./private/chats.json');
            chats.push(this.chat);
            await writeArrayToFile('./private/chats.json');
            return;
        } catch (error) {
            console.log(error);
            await this.profile.stopProfile();
            if (this.browser) {
                console.log('destroy browser')
                await this.browser.disconnect()
            }
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

    async addMessageToQueue(message = null) {
        if (message) {
            this.queue.push(message);
        }
        if (!this.messageSending) {
            this.messageSending = true;
            for (const msg of this.queue) {
                await this.sendMessage(msg);
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
            this.handleNewMessageCallback(data.body);
            console.log('New message in dialog', data.body);
            if (data.body?.dialog?.id === this.dialogId && data.body.message) {
                this.handleNewMessageCallback(data.body.message.text);
            }
        });
    }

    async close() {
        if (!this.messageSending) {
            await this.browser.disconnect();
            await this.profile.stopProfile();
        } else {
            await new Promise(resolve => setTimeout(resolve, 10000));
            await this.close();
        }
    }
}