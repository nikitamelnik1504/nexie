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
        try {
            this.profile = new ProfileManager(this.token, this.profileId);
            await this.profile.startProfile();
            this.browser = new BrowserManager(this.token, this.profile);
            this.cookie = new CookieManager(this.token, this.profileId);
            await this.browser.connect();
        } catch (error) {
            console.log(error);
            await this.start();
        }
    }

    async getMessagesFromTon() {
        try {
            const cookies = await this.cookie.exportCookies();
            this.page = await this.browser.newPage();
            await this.page.setViewport({ width: 414, height: 896 })
            await this.page.setCookie(...cookies);

            this.page.on('console', async (msg) => console.log('puppeteer:', await Promise.all(msg.args().map(arg => arg.jsonValue()))));

            await this.page.goto(`https://ton.place/im`, { waitUntil: 'networkidle0' });

            await this.page.waitForSelector('.Dialog__cont');

            const messages = await this.page.evaluate(async () => {
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
                
                console.log('yeas');
                return results;
            });
            await this.page.close();
            return messages;
        } catch (error) {
            console.error('Error get message with Ton:', error);
            console.log('restart');
            if (this.page) {
                await this.page.close();
            }
            // await this.profile.stopProfile();
            await this.start();
            return await this.getMessagesFromTon(page);
        }
    }

    async getMessagesFromFancentro() {
        try {
            const cookies = await this.cookie.exportCookies();
            this.page = await this.browser.newPage();
            await this.page.setViewport({ width: 414, height: 896 })
            await this.page.setCookie(...cookies);

            this.page.on('console', async (msg) => console.log('puppeteer:', await Promise.all(msg.args().map(arg => arg.jsonValue()))));

            await this.page.goto(`https://fancentro.com/admin/messages`, { waitUntil: 'networkidle0' });

            console.log('start');

            await this.page.waitForSelector('#scrollableDiv .List > div > button');

            const messages = await this.page.evaluate(() => {
                const messagesElements = document.querySelectorAll('#scrollableDiv .List > div > button')
                const messages = [];

                for (const messageEl of messagesElements) {
                    const name = messageEl.querySelector('h2').textContent;
                    const message = messageEl.querySelector('p > span > span').textContent;
                    const viewed = messageEl.querySelector('time')?.nextElementSibling?.querySelector('span') ? false : true;
                    const dialogId = null;

                    messages.push({
                        name,
                        message,
                        dialogId,
                        viewed
                    });
                }

                return messages;
            });

            console.log('oks');

            await this.page.close()
            return messages;
        } catch (err) {
            console.log(err);
            console.log('restart');
            if (this.page) {
                await this.page.close()
            }
            // await this.profile.stopProfile();
            await this.start();
            return await this.getMessagesFromFancentro();
        }
    }

    async getMessagesFromFansly() {
        try {
            const cookies = await this.cookie.exportCookies();
            this.page = await this.browser.newPage();
            await this.page.setViewport({ width: 414, height: 896 })
            await this.page.setCookie(...cookies);

            this.page.on('console', async (msg) => console.log('puppeteer:', await Promise.all(msg.args().map(arg => arg.jsonValue()))));

            await this.page.goto(`https://fansly.com/messages`, { waitUntil: 'networkidle0' });

            console.log('start');
            try {
                await this.page.click('.modal-content .btn.margin-top-2');
            } catch { }

            try {
                await this.page.click('.modal-content .button-wrapper .btn.solid-green');
            } catch { }

            try {
                await this.page.waitForSelector('.right-side div[routerlink="/messages"]');
                await this.page.click('.right-side div[routerlink="/messages"]');
            } catch { }

            await this.page.waitForSelector('.message-list a', { timeout: 60000 });
            console.log('test')

            const result = await this.page.evaluate(() => {
                const messagesElements = document.querySelectorAll('.message-list > a');
                let result = [];
                for (const messageEl of messagesElements) {
                    if (!messageEl.querySelector('.eclipse')) {
                        continue;
                    }
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
            await this.page.close();
            // await this.browser.disconnect();
            // await this.profile.stopProfile();
            return result;
        } catch (err) {
            console.log(err);
            console.log('restart');
            if (this.page) {
                await this.page.close();
            }
            // await this.browser.disconnect();
            // await this.profile.stopProfile();
            await this.start();
            return await this.getMessagesFromFansly();
        }
    }

    async getMessageFromWebSocketFromFansly(response) {
        try {
            const data = await JSON.parse(JSON.parse(response?.payloadData).d);
            // const parseData = await JSON.parse(data);
            if (data.event) {
                const event = JSON.parse(data.event);
                const message = event.message?.content;
                const dialogId = event.message?.groupId;

                if (message) {
                    const dialogs = await getArrayFromFile('./private/dialogs.json');
                    let dialogFound = false;
                    for (const dialog of dialogs) {
                        if (dialog.dialogId === dialogId) {
                            await dialog.messages.push(message);
                            dialogFound = true;
                            break;
                        }
                    }
                    if (!dialogFound) {
                        const name = await this.getNameForFanslyBySenderId(event.message.senderId);
                        await dialogs.push({
                            dialogId: dialogId,
                            profileId: this.profileId,
                            name,
                            viewed: false,
                            messages:
                                [{
                                    message: message,
                                    sender: 'inbox'
                                }],
                        });
                    }
                    await writeArrayToFile('./private/dialogs.json', dialogs);

                }
            }
        } catch (error) {
            console.log(error);
            // await this.getMessageFromWebSocketFromFansly(response);
        }

    }

    async getNameForFanslyBySenderId(senderId) {
        try {
            await this.page.goto(`https://fansly.com/${senderId}`, {waitUntil: 'networkidle0'});
            await this.page.waitForSelector('.profile-name .display-name');
            const name = await this.page.evaluate(() => document.querySelector('.profile-name .display-name').textContent);
            return name;
        } catch {
            return this.getNameForFanslyBySenderId(senderId);
        }
    }

    async getMessageFromWebSocketFromTon(response) {
        try {
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
        } catch {
            //await this.getMessageFromWebSocketFromTon();
        }
    }

    async getMessageFromWebSocket(platform) {
        try {
            const cookies = await this.cookie.exportCookies();
            this.page = await this.browser.newPage();
            await this.page.setCookie(...cookies);

            this.page.on('console', async (msg) => console.log('puppeteer:', await Promise.all(msg.args().map(arg => arg.jsonValue()))));

            const client = await this.page.target().createCDPSession();
            await client.send('Network.enable');

            client.on('Network.webSocketFrameReceived', async ({ requestId, timestamp, response }) => {
                console.log(JSON.parse(response.payloadData));

                switch (platform) {
                    case 'ton':
                        await this.getMessageFromWebSocketFromTon(response);
                        break;
                    case 'fansly':
                        await this.getMessageFromWebSocketFromFansly(response);
                        break;
                }

            });

            switch (platform) {
                case 'ton':
                    await this.page.goto(`https://ton.place/im`);
                    break;
                case 'fansly':
                    await this.page.goto(`https://fansly.com/messages`);
                    break;
            }

        } catch (error) {
            console.log(error);
            console.log('restart');
            // await this.profile.stopProfile();
            // await this.browser.disconnect();
            if (this.page) {
                await this.page.close();
            }
            await this.start();
            await this.getMessageFromWebSocket()
        }
    }

    async getProfileMessage(platformName) {
        try {
            switch (platformName) {
                case 'ton':
                    //await this.page.goto(`https://ton.place/im`, { waitUntil: 'networkidle2' });
                    return await this.getMessagesFromTon(this.page);
                case 'fansly':
                    return await this.getMessagesFromFansly();
                case 'fancentro':
                    return await this.getMessagesFromFancentro();
                default:
                    console.log(`Undefined platform: ${platformName}`);
            }

        } catch (err) {
            console.log(err);
            console.log('restart')
            if (this.page) {
                await this.page.close()
            }
            // await this.browser.disconnect();
            // await this.profile.stopProfile();
            await this.start();
            return await this.getProfileMessage(platformName);
        }
    }
}
