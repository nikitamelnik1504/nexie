import BrowserManager from './managers/BrowserManager.js';
import CookieManager from './managers/CookieManager.js';
import ProfileManager from './managers/ProfileManager.js';
import MessageRetriever from './MessageRetreiver.js';

const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiODBlOGFjM2E4ZGY1NjZiZjkxYjU2MjU0NjM4NWE4NjI1NjlhMGEwMTE5OTVkZWVlZjNkMWU1YzM3ZjRjN2I1MDQ5NjFiZDA5MTgyMzkyMjIiLCJpYXQiOjE3MjcyOTI1OTcuNjExNTQ1LCJuYmYiOjE3MjcyOTI1OTcuNjExNTQ2LCJleHAiOjE3NTg4Mjg1OTcuNTk2OTYzLCJzdWIiOiIzNzUwNTE0Iiwic2NvcGVzIjpbXX0.cu3orWJhCEn2nqytQXTs7H6_7DhzlcSbZXxOTkbmkOzA_VpVRVuCrU3wtLGl-NSGhdi9yLTaE6Jo5i14NSqJTsUf3j2eWetUoHN3t-XIT_0dcHxFTUD1NvEF0JoJX6CPk05r6AOC7Dw4f10SPGVWbdVct2vJJDuvnWKdWDR8AAsvj-Uszgg8R8u80P1zh1o3OpQ5qSXsl1kHeacj4Nog1ZNKDZ6kGQ-6b1yR8bOItjW_FlIu37pfiiZNzWB6WIs_N7amRB9EAXXAl1AQxLHZHreJ0butYzn6nWIfW-2vvB5ZS8H6nDI-khpzAo4-Qomeg8qPELJmCDEoTbOdaQB-TISFATMGvAI2oYIbVDHpk0GxGGEh4RiM3A181IToypYdsxvsmSYrzgEsybekdQavuVIiVnhLcyNcZJRIfYYFj14pyk_oCwRl12yMUYylFU6q_LN7_Nj-zaEH0jAIHlRWM2gVZCCIgb_-37xgtwT6hOc_JGohhl1p_wIjW-HgJjgP-42l4JAmCcLJBKtVSS6PilGO9tPfldfqgK0Z4fHpBOgJkkpNxcqhlykf91hbU4h85eIqD1UH5bhVdr5608mN1_FC_VRqX8W_RvDskQi47_7Z0lSdj7lL6E-dZ4YJpIYfqc0BTXlXFJb0_uTSIlXFTAQFYSEs-Su7TR_ywbXFI4Y'
const testProfileId = '438410210';
const sitesList = [
    {
        'name': 'Ton',
        'url': 'ton.place',
        'messages_url': '/im'
    }
];

const getProfileMessages = async (profileId) => {
    const browserManager = new BrowserManager(token, profileId);
    const cookieManager = new CookieManager(token, profileId);
    //const profileManager = new ProfileManager(token, profileId);
    //await profileManager.startProfile();
    await browserManager.connect();

    for (const site of sitesList) {
        try {
            const cookies = await cookieManager.getFilteredCookieByUrl(site.url);
            const page = await browserManager.newPage();
            await page.setCookie(...cookies);
            await page.goto(`https://${site.url}${site.messages_url}`, { waitUntil: 'networkidle2', timeout: 60000 });
            const messageRetriever = new MessageRetriever(page);

            switch (site.name) {
                case 'Ton':
                    return await messageRetriever.getMessagesFromTon(page);
                default:
                    console.log(`Undefined site: ${site.name}`);
            }

            await page.close();
        } catch (error) {
            console.error(`Error loading ${site.name}:`, error);
        } finally {
            await browserManager.disconnect();
        }
    }
}

(async () => {
    // const profiles = await ProfileManager.getProfiles(token);

    // for (const profile of profiles.data) {
    //     try {
    //const messages = await getProfileMessages(profile.id);
    //console.log(messages);
    //     } catch(error) {
    //         console.log(error);
    //         continue;
    //     }
    // }

    const browserManager = new BrowserManager(token, testProfileId);
    const cookieManager = new CookieManager(token, testProfileId);
    await browserManager.connect();

    const cookies = await cookieManager.getFilteredCookieByUrl('ton.place');
    const page = await browserManager.newPage();
    await page.setCookie(...cookies);


    // await page.on('framenavigated', () => {
    //     const client = page._client;

    //     client.on('Network.webSocketCreated', ({requestId, url}) => {
    //         console.log('WebSocket created', url);
    //     });

    //     client.on('Network.webSocketFrameReceived', ({requestId, timestamp, response}) => {
    //         console.log(response.payloadData);
    //     })
    // })

    const client = await page.target().createCDPSession();
    await client.send('Network.enable');

    client.on('Network.webSocketCreated', ({ requestId, url }) => {
        console.log('WebSocket created', url);
    });

    client.on('Network.webSocketFrameReceived', ({ requestId, timestamp, response }) => {
        console.log(response.payloadData);
    })

    await page.goto(`https://ton.place/im`, { waitUntil: 'networkidle2', timeout: 60000 });

})()

const message = { "type": "message", "body": { "message": { "id": 66156872, "fromId": 1855811, "toId": 2032338, "createdAt": 1727883727, "text": "I welcome you to my personal temple!💥🛕 tell me what's on your mind and how I got your attention😈👻", "attachments": [{ "type": "photo", "photo": { "photoId": 7251271, "photoMedium": "https://tonplace.ams3.cdn.digitaloceanspaces.com/photos/532/f30f93d8-b278-49be-4d6c-7182cccc072c.jpg", "photoLarge": "https://tonplace.ams3.cdn.digitaloceanspaces.com/photos/532/f30f93d8-b278-49be-4d6c-7182cccc072c.jpg", "thumbnail": "data:image/jpeg;base64,/9j/2wCEAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDIBCQkJDAsMGA0NGDIhHCEyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMv/AABEIABAADAMBIgACEQEDEQH/xAGiAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgsQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+gEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoLEQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/AOZ1bw4XgKW4KyiMuRt7D19q83llhgmeN48kHsa9GHjJ9T+1fadkfnj5HYYA459TjH9K4q7UrcEFWPoXXkiuGneLtI7anLJJxP/Z", "width": 960, "height": 1280, "encrypted": true, "photoMediumEncrypted": "", "photoLargeEncrypted": "" }, "link": null, "video": null, "tips": null, "poll": null, "roulette": null, "rouletteLot": null, "bundle": null, "battlePrize": null }, { "type": "photo", "photo": { "photoId": 7251273, "photoMedium": "https://tonplace.ams3.cdn.digitaloceanspaces.com/photos/712/6144c8e0-1ccc-406e-7a29-d5e2eaecf6c1.jpg", "photoLarge": "https://tonplace.ams3.cdn.digitaloceanspaces.com/photos/712/6144c8e0-1ccc-406e-7a29-d5e2eaecf6c1.jpg", "thumbnail": "data:image/jpeg;base64,/9j/2wCEAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDIBCQkJDAsMGA0NGDIhHCEyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMv/AABEIABAADAMBIgACEQEDEQH/xAGiAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgsQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+gEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoLEQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/AOL1Lw1GVk8xliKwM67iFywHA5688YrzuTZHK6FMkH1rrb/xhea+zRXBEfmSGTcMgAYxjFYNzI6S7SM4HXHWuSnzRdpHVV5ZJOJ//9k=", "width": 960, "height": 1280, "encrypted": true, "photoMediumEncrypted": "", "photoLargeEncrypted": "" }, "link": null, "video": null, "tips": null, "poll": null, "roulette": null, "rouletteLot": null, "bundle": null, "battlePrize": null }, { "type": "photo", "photo": { "photoId": 7251274, "photoMedium": "https://tonplace.ams3.cdn.digitaloceanspaces.com/photos/561/8dee851f-f3e0-4dda-5676-f52a1fe42dc6.jpg", "photoLarge": "https://tonplace.ams3.cdn.digitaloceanspaces.com/photos/561/8dee851f-f3e0-4dda-5676-f52a1fe42dc6.jpg", "thumbnail": "data:image/jpeg;base64,/9j/2wCEAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDIBCQkJDAsMGA0NGDIhHCEyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMv/AABEIABAADAMBIgACEQEDEQH/xAGiAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgsQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+gEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoLEQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/AOX17RibWTEIURxqcY5Yk4ry+ZEjmdHB3A44r0ubxa3iBp/t0rW8bYZFXKqScA55zwOlcVfKEumXymwOm9eSK5KblHRnVUUZao//2Q==", "width": 960, "height": 1280, "encrypted": true, "photoMediumEncrypted": "", "photoLargeEncrypted": "" }, "link": null, "video": null, "tips": null, "poll": null, "roulette": null, "rouletteLot": null, "bundle": null, "battlePrize": null }], "isInbox": false, "isUnread": true, "isWelcome": true, "isBroadcast": false, "price": 0, "isHidden": false, "decryptKey": "", "currency": "eur", "telegramStatus": 0 }, "user": { "id": 2032338, "firstName": "fxmprft", "lastName": "", "sex": 0, "bDate": "0.0.0", "countryId": 0, "countryName": "", "cityId": 0, "cityName": "", "photoId": 0, "photo": "/assets/ava_placeholder.png", "photoMedium": "/assets/ava_placeholder.png", "photoLarge": "/assets/ava_placeholder.png", "thumbnail": "", "followers": 0, "followed": 7, "lastUpdate": 1727883725, "status": "", "rating": 0, "isBanned": false }, "dialog": { "id": 2971344, "peerId": 2032338, "createdAt": 1727883727, "updatedAt": 1727883727, "lastMsgId": 66156872, "modelLastMsgId": 0, "unread": 0, "sponsor": false }, "randomId": 0 }, "id": 1727883727636087281 }


message.body.message.text;
