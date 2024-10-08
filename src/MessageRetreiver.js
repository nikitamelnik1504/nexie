import ProfileManager from "./managers/ProfileManager.js";
import BrowserManager from "./managers/BrowserManager.js";
import CookieManager from "./managers/CookieManager.js";
import { getArrayFromFile, writeArrayToFile } from "./utils/helper.js";

export default class MessageRetriever {
    constructor(token, profileId) {
        this.profileId = profileId;
        this.token = token;
        this.profile = null;
        this.browser = null;
        this.cookie = null;
        this.sitesList = [
            {
                'name': 'Ton',
                'url': 'ton.place',
                'messages_url': '/im'
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
        } catch {
            if (this.browser) {
                await this.profile.stopProfile();
                await this.browser.disconnect();
            }
            await this.start();
        }
    }

    async getMessagesFromTon(page) {
        try {
            await page.waitForSelector('.Dialog__cont');
            await page.screenshot({ path: 'test.png' })

            return await page.evaluate(async () => {
                const wrappers = await document.querySelectorAll('.Dialog__cont');
                let results = [];

                await wrappers.forEach(wrapper => {
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

    async getMessageFromWebSocket(token, profileId) {
        for (const site of this.sitesList) {
            const cookies = await this.cookie.getFilteredCookieByUrl(site.url);
            this.page = await this.browser.newPage();
            await this.page.setCookie(...cookies);

            const client = await this.page.target().createCDPSession();
            await client.send('Network.enable');

            client.on('Network.webSocketCreated', ({ requestId, url }) => {
                console.log('WebSocket created', url);
            });

            client.on('Network.webSocketFrameReceived', async ({ requestId, timestamp, response }) => {
                console.log(response.payloadData.body.message.text);
                console.log(response.payloadData);
                if (response.payloadData.message.text) {
                    const messages = await getArrayFromFile('./private/messages.json');
                    messages.push({
                        name: response.payloadData.body.user.firstname +' '+ response.payloadData.body.user.lastname,
                        message: response.payloadData.body.message.text,
                        profileId: profileId
                    });
                    await writeArrayToFile('./private/messages.json', messages);
                    console.log('WebSocket initialized');
                }
            });
            await this.page.goto(`https://${site.url}${site.messages_url}`, { waitUntil: 'networkidle2', timeout: 60000 });
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
