import ProfileManager from "./managers/ProfileManager.js";
import BrowserManager from "./managers/BrowserManager.js";
import CookieManager from "./managers/CookieManager.js";
import { getArrayFromFile, writeArrayToFile } from "./utils/helper.js";
import { timeout } from "puppeteer";

export default class MessageRetriever {
    constructor(token, profileId) {
        this.profileId = profileId;
        this.token = token;
        this.profile = null;
        this.browser = null;
        this.cookie = null;
        this.sitesList = [
            // {
            //     'name': 'Ton',
            //     'url': 'ton.place',
            //     'messages_url': '/im'
            // },
            {
                'name': 'Fancentro',
                'url': 'fancentro.com',
                'messages_url': '/messages'
            }
        ];
    }

    async start() {
        try{
            this.profile = new ProfileManager(this.token, this.profileId);
            await this.profile.startProfile();
            this.browser = new BrowserManager(this.token, this.profile);
            this.cookie = new CookieManager(this.token, this.profileId);
            await this.browser.connect();
        } catch (error){
            console.log(error);
            await this.start();
        }
    }

    async getMessagesFromTon(page) {
        try {
            await page.waitForSelector('.Dialog__cont');
            await page.screenshot({ path: 'test.png' })

            return await page.evaluate(async () => {
                const wrappers = document.querySelectorAll('.Dialog__cont');
                let results = [];

                wrappers.forEach(wrapper => {
                    if (wrapper.nextElementSibling && wrapper.nextElementSibling.classList.contains('Dialog__unread')) {
                        results.push({
                            name: wrapper.querySelector('.Dialog__name').innerText,
                            message: wrapper.querySelector('.Dialog__text').innerText
                        });
                    }
                });
                return results;
            });
        } catch (error) {
            console.error('Error get message with Ton:', error);
        }
    }

    async getMessageFromWebSocket() {
        try {
            for (const site of this.sitesList) {
                const cookies = await this.cookie.exportCookies();
                this.page = await this.browser.newPage();
                await this.page.setCookie(...cookies);

                this.page.on('console', async (msg) => console.log('puppeteer:', await Promise.all(msg.args().map(arg => arg.jsonValue()))));

                const client = await this.page.target().createCDPSession();
                await client.send('Network.enable');

                client.on('Network.webSocketFrameReceived', async ({ requestId, timestamp, response }) => {
                    const data = await JSON.parse(response.payloadData);
                    console.log('websocks', data)
                    
                    if (data.body?.message) {
                        const dialogs = await getArrayFromFile('./private/dialogs.json');
                        let dialogFound = false;
                        for (const dialog of dialogs) {
                            if (dialog.dialogId === data.body.dialog.id) {
                                await dialog.messages.push(data.body.message.text);
                                dialogFound = true;
                                break;
                            }
                        }
                        if (!dialogFound) {
                            await dialogs.push({
                                dialogId: data.body.dialog.id,
                                profileId: this.profileId,
                                name: `${data.body.user.firstName} ${data.body.user.lastName}`,
                                viewed: false,
                                messages: 
                                [{
                                    message: data.body.message.text,
                                    sender: 'inbox'
                                }],
                            });
                        }
                        await writeArrayToFile('./private/dialogs.json', dialogs);
                    }
                });
                await this.page.goto(`https://${site.url}${site.messages_url}`, { waitUntil: 'networkidle0'});
                await this.page.screenshot({path: 'testffdfd.png'})
                console.log('oks')
            }
        } catch (error) {
            console.log(error);
            await this.profile.stopProfile();
            await this.browser.disconnect();
            await this.start();
            await this.getMessageFromWebSocket()
        }
    }

    async getProfileMessage() {
        for (const site of this.sitesList) {
            const cookies = await this.cookie.getFilteredCookieByUrl(site.url);
            this.page = await this.browser.newPage();
            await this.page.setCookie(...cookies);
            await this.page.goto(`https://${site.url}${site.messages_url}`, { waitUntil: 'networkidle2', timeout: 60000 });
            switch (site.name) {
                case 'Ton':
                    return await this.getMessagesFromTon(this.page);
                default:
                    console.log(`Undefined site: ${site.name}`);
            }
        }
    }
}
