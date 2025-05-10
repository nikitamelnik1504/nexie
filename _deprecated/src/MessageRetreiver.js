import { getArrayFromFile, writeArrayToFile } from "./utils/helper.js";
import { timeout } from "puppeteer";

export default class MessageRetriever {

    async getMessagesFromFancentro() {
        try {
            const cookies = await this.cookie.exportCookies();
            this.page = await this.browser.newPage();
            await this.page.setViewport({ width: 414, height: 896 })
            await this.page.setCookie(...cookies);

            //this.page.on('console', async (msg) => console.log('puppeteer:', await Promise.all(msg.args().map(arg => arg.jsonValue()))));

            const client = await this.page.target().createCDPSession();
            await client.send('Network.enable');

            let roomsData = [];
	    let messages = [];
            await client.on('Network.webSocketFrameReceived', async ({ requestId, timestamp, response }) => {
                if (response.payloadData.includes('room')) {
                    const data = await JSON.parse(response.payloadData.replace(/^42\/fc,/, ''));
                    if (data[0] === 'room_list') {
                        roomsData = data[1].roomsData;
                    }
                }
            });
            this.page.on('response', async (response) => {
try {
                if (response.url().includes('chat.getInterlocutors')) {
                    const responseBody = await response.text();
                    const data = JSON.parse(responseBody);
                    if (data.response.meta.total > 0) {
                        try {
                            //const messages = [];
                            for (const room of roomsData) {
                                try {
                                    if (data.response.collection[room.members[0].externalId]) {
                                        room.members[0].name = data.response.collection[room.members[0].externalId].name;
                                    } else {
                                        room.members[0].name = 'Unactive user';
                                    }

                                    const name = room.members[0].name;
                                    const viewed = room.currentMember.unread;
                                    const message = room.messages[0]?.type === 'text' ? room.messages[0].data.text : 'Photo'
                                    const dialogId = room._id;

                                    messages.push({
                                        name,
                                        message,
                                        dialogId,
                                        viewed
                                    })
                                } catch (err){
                                    console.log(err);
                                }
                            }

                            console.log('oks')
                        } catch (err){
                            console.log(err);
                        }
                    }
                }
}catch{}
            });


            await this.page.goto(`https://fancentro.com/admin/messages`, { waitUntil: 'networkidle0' });

try {
	await this.page.waitForSelector('undefined', {timeout: 60000});
} catch {}
return messages;
            // console.log('start');

            // await this.page.waitForSelector('#scrollableDiv .List > div > button');

            // const messages = await this.page.evaluate(() => {
            //     const messagesElements = document.querySelectorAll('#scrollableDiv .List > div > button')
            //     const messages = [];

            //     for (const messageEl of messagesElements) {
            //         const name = messageEl.querySelector('h2').textContent;
            //         const message = messageEl.querySelector('p > span > span').textContent;
            //         const viewed = messageEl.querySelector('time')?.nextElementSibling?.querySelector('span') ? false : true;
            //         const dialogId = null;

            //         messages.push({
            //             name,
            //             message,
            //             dialogId,
            //             viewed
            //         });
            //     }

            //     return messages;
            // });

            // console.log('oks');

            // await this.page.close()
            // return messages;
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
                            await dialog.messages.push({ message, sender: 'inbox' });
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
            await this.page.goto(`https://fansly.com/${senderId}`, { waitUntil: 'networkidle0' });
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
                        await dialog.messages.push({ message: data.body.message.text, sender: 'inbox' });
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

    async getNameForFancentroByMessage(message) {
        try {
            await this.page.goto(`https://fancentro.com/admin/messages`, { waitUntil: 'networkidle0' });
            await this.page.waitForSelector('#scrollableDiv .List > div > button');

            const messages = await this.page.evaluate((message) => {
                const messagesElements = document.querySelectorAll('#scrollableDiv .List > div > button')
                const messages = [];

                for (const messageEl of messagesElements) {
                    const name = messageEl.querySelector('h2').textContent;
                    const messageText = messageEl.querySelector('p > span > span').textContent;

                    if (message == messageText) {
                        return name;
                    }
                }
                return null;
            }, message);
        } catch {
            return null;
        }
    }

    async getMessageFromWebSocketFromFancentro(response) {
        try {
            const data = await JSON.parse(response.payloadData.replace(/^42\/fc,/, ''));
            if (data[0] === 'message') {
                const message = data[1];
                const messageText = message.data.text;
                const dialogId = message.bucketId;
                const name = await this.getNameForFancentroByMessage(messageText);

                const dialogs = await getArrayFromFile('./private/dialogs.json');
                let dialogFound = false;
                for (const dialog of dialogs) {
                    if (dialog.dialogId === dialogId) {
                        await dialog.messages.push({ message: messageText, sender: 'inbox' });
                        dialogFound = true;
                        break;
                    }
                }
                if (!dialogFound) {
                    await dialogs.push({
                        dialogId,
                        profileId: this.profileId,
                        name,
                        viewed: false,
                        messages:
                            [{
                                message: messageText,
                                sender: 'inbox'
                            }],
                    });
                }
                await writeArrayToFile('./private/dialogs.json', dialogs);

            }

        } catch (err) { }
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

                switch (platform) {
                    case 'ton':
                        await this.getMessageFromWebSocketFromTon(response);
                        break;
                    case 'fansly':
                        await this.getMessageFromWebSocketFromFansly(response);
                        break;
                    case 'fancentro':
                        await this.getMessageFromWebSocketFromFancentro(response);
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
                case 'fancentro':
                    await this.page.goto('https://fancentro.com/admin/messages');
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
