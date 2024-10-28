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
            {
                'name': 'Ton',
                'url': 'ton.place',
                'messages_url': '/im'
            },
            {
                'name': 'Fancentro',
                'url': 'fancentro.com',
                'messages_url': '/messages'
            },
            {
                'name': 'Fansly',
                'url': 'fansly.com',
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
            await page.screenshot({ path: 'test.png' })
            await page.waitForSelector('.Dialog__cont');
            console.log('Poshlo')

            return await page.evaluate(async () => {
                const wrappers = document.querySelectorAll('.Dialog__cont');
                let results = [];

                wrappers.forEach(wrapper => {
                    results.push({
                        name: wrapper.querySelector('.Dialog__name').innerText,
                        message: wrapper.querySelector('.Dialog__text').innerText,
                        viewed: wrapper.nextElementSibling && wrapper.nextElementSibling.classList.contains('Dialog__unread') ? false : true
                    });
                    // if (wrapper.nextElementSibling && wrapper.nextElementSibling.classList.contains('Dialog__unread')) {
                    //     results.push({
                    //         name: wrapper.querySelector('.Dialog__name').innerText,
                    //         message: wrapper.querySelector('.Dialog__text').innerText
                    //     });
                    // }
                });
                await this.browser.disconnect();
                await this.profile.stopProfile();
                console.log('yeas');
                return results;
            });
        } catch (error) {
            console.error('Error get message with Ton:', error);
            console.log('restart');
            await this.browser.disconnect();
            await this.profile.stopProfile();
            await this.start();
            return await this.getMessagesFromTon(page);
        }
    }

    async getMessagesFromFansly() {
        try {
            const cookies = await this.cookie.exportCookies();
            this.page = await this.browser.newPage();
            await this.page.setViewport({width: 414, height: 896})
            await this.page.setCookie(...cookies);

            this.page.on('console', async (msg) => console.log('puppeteer:', await Promise.all(msg.args().map(arg => arg.jsonValue()))));

            await this.page.goto(`https://fansly.com/messages`, { waitUntil: 'networkidle0' });

            console.log('start');
            try {
                await this.page.click('.modal-content .btn.margin-top-2');
            } catch {}

            try {
                await this.page.click('.modal-content .button-wrapper .btn.solid-green');
            } catch {}

            try {
                await this.page.waitForSelector('.right-side div[routerlink="/messages"]');
                await this.page.click('.right-side div[routerlink="/messages"]');
            } catch {}

            await this.page.waitForSelector('.message-list a');
            console.log('test')

            const result = await this.page.evaluate(() => {
                const messagesElements = document.querySelectorAll('.message-list > a');
                let result = [];
                for (const messageEl of messagesElements) {
                    const dialogId = messageEl.getAttribute('href').replace('/messages/', '');
                    const message = messageEl.querySelector('.eclipse').textContent;
                    const name = messageEl.querySelector('.message-contact .display-name').textContent;
                    
                    const viewed = messageEl.querySelector('.badge-container') ? false : true;

                    console.log('yeah');
                    result.push({
                        name,
                        message,
                        dialogId,
                        viewed
                    });
                }
                return result;
            });

            console.log('oks');
            console.log(result);
            await this.browser.disconnect();
            await this.profile.stopProfile();
            return result;
        } catch (err) {
            console.log(err);
            console.log('restart');
            await this.browser.disconnect();
            await this.profile.stopProfile();
            await this.start();
            return await this.getMessagesFromFansly();
        } finally {
            await this.browser.disconnect();
            await this.profile.stopProfile();
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

                try {

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
                } catch {}
                await this.page.goto(`https://${site.url}${site.messages_url}`, { waitUntil: 'networkidle0'});
                // await this.AuthAccount();

                await this.page.click('.modal-content .btn');

                try {
                    await this.page.waitForSelector('dfdfd', {timeout: 60000});
                } catch {}
                
                await this.page.screenshot({path: 'test.png'})
                console.log('oks')
            }
        } catch (error) {
            console.log(error);
            console.log('restart');
            await this.profile.stopProfile();
            await this.browser.disconnect();
            await this.start();
            await this.getMessageFromWebSocket()
        }
    }

    async getProfileMessage(platformName) {
        try {
        
            // const cookies = await this.cookie.exportCookies();
            // this.page = await this.browser.newPage();
            // await this.page.setCookie(...cookies);
            // return await this.getMessagesFromTon(this.page);
            switch (platformName) {
                case 'ton':
                    await this.page.goto(`https://ton.place/im`, { waitUntil: 'networkidle2' });
                    return await this.getMessagesFromTon(this.page);
                case 'fansly':
                    return await this.getMessagesFromFansly(this.page);;
                default:
                    console.log(`Undefined platform: ${platformName}`);
            }
        
        } catch (err){
            console.log(err);
            console.log('restart')
            await this.browser.disconnect();
            await this.profile.stopProfile();
            await this.start();
            return await this.getProfileMessage(platformName);
        }
    }

    async AuthAccount() {
        try {
            await this.page.evaluate(()=>{
                // const elements = Array.from(document.querySelectorAll('span[data-i18context="snapcentro_authorize_login"]'));
                const elements = Array.from(document.querySelectorAll('*'))
                const btn = elements.find(el => el.textContent === 'Sign in' || el.textContent === 'Login');
                btn.click()
                return;
            })
            await this.page.waitForSelector('#fansly_login');
            
            await this.page.type('#fansly_login', 'skripchakandreywork@gmail.com');
            await this.page.type('#fansly_password', '123QAZzaq');
            await this.page.click('.modal-content app-button.btn xd-localization-string')
            await this.page.waitForSelector('modal-content');
            await this.page.click('.modal-content .btn');
            } catch (error){console.log(error)}
    }
}
