import axios from 'axios';
import BrowserManager from './managers/BrowserManager.js';
import CookieManager from './managers/CookieManager.js';
import ProfileManager from './managers/ProfileManager.js';
import MessageRetriever from './MessageRetreiver.js';
import { getArrayFromFile, writeArrayToFile } from './utils/helper.js';

const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiODBlOGFjM2E4ZGY1NjZiZjkxYjU2MjU0NjM4NWE4NjI1NjlhMGEwMTE5OTVkZWVlZjNkMWU1YzM3ZjRjN2I1MDQ5NjFiZDA5MTgyMzkyMjIiLCJpYXQiOjE3MjcyOTI1OTcuNjExNTQ1LCJuYmYiOjE3MjcyOTI1OTcuNjExNTQ2LCJleHAiOjE3NTg4Mjg1OTcuNTk2OTYzLCJzdWIiOiIzNzUwNTE0Iiwic2NvcGVzIjpbXX0.cu3orWJhCEn2nqytQXTs7H6_7DhzlcSbZXxOTkbmkOzA_VpVRVuCrU3wtLGl-NSGhdi9yLTaE6Jo5i14NSqJTsUf3j2eWetUoHN3t-XIT_0dcHxFTUD1NvEF0JoJX6CPk05r6AOC7Dw4f10SPGVWbdVct2vJJDuvnWKdWDR8AAsvj-Uszgg8R8u80P1zh1o3OpQ5qSXsl1kHeacj4Nog1ZNKDZ6kGQ-6b1yR8bOItjW_FlIu37pfiiZNzWB6WIs_N7amRB9EAXXAl1AQxLHZHreJ0butYzn6nWIfW-2vvB5ZS8H6nDI-khpzAo4-Qomeg8qPELJmCDEoTbOdaQB-TISFATMGvAI2oYIbVDHpk0GxGGEh4RiM3A181IToypYdsxvsmSYrzgEsybekdQavuVIiVnhLcyNcZJRIfYYFj14pyk_oCwRl12yMUYylFU6q_LN7_Nj-zaEH0jAIHlRWM2gVZCCIgb_-37xgtwT6hOc_JGohhl1p_wIjW-HgJjgP-42l4JAmCcLJBKtVSS6PilGO9tPfldfqgK0Z4fHpBOgJkkpNxcqhlykf91hbU4h85eIqD1UH5bhVdr5608mN1_FC_VRqX8W_RvDskQi47_7Z0lSdj7lL6E-dZ4YJpIYfqc0BTXlXFJb0_uTSIlXFTAQFYSEs-Su7TR_ywbXFI4Y'
const testProfileId = '438410210'; //401936834
const sitesList = [
    {
        'name': 'Ton',
        'url': 'ton.place',
        'messages_url': '/im'
    }
];

const getProfileMessages = async (profileId) => {
    const profileManager = new ProfileManager(token, profileId);
    await profileManager.startProfile();
    const browserManager = new BrowserManager(token, profileManager);
    const cookieManager = new CookieManager(token, profileId);
    await browserManager.connect();

    for (const site of sitesList) {
        try {
            const cookies = await cookieManager.getFilteredCookieByUrl(site.url);
            const page = await browserManager.newPage();
            await page.setCookie(...cookies);
            await page.goto(`https://${site.url}${site.messages_url}`, { waitUntil: 'networkidle2', timeout: 60000 });
            const messageRetriever = new MessageRetriever(page);

            // const webSocketPage = await browserManager.newPage();
            // await webSocketPage.setCookie(...cookies);

            // await getMessageFromWebSocket(webSocketPage, profileId);
            
            // await webSocketPage.goto(`https://${site.url}${site.messages_url}`, { waitUntil: 'networkidle2', timeout: 60000 });
            

            switch (site.name) {
                case 'Ton':
                    return await messageRetriever.getMessagesFromTon(page);
                default:
                    console.log(`Undefined site: ${site.name}`);
            }
        } catch (error) {
            console.error(`Error loading ${site.name}:`, error);
        } finally {
            await browserManager.disconnect();
            await profileManager.stopProfile();
        }
    }
}

// (async () => {
//     const profiles = await ProfileManager.getProfiles(token);
//     // const profiles = {data: [{id: testProfileId}]};

//     for (const profile of profiles.data) {
//         try {
//             let messages = await getProfileMessages(profile.id);
//             console.log('Message received');
//             const allMessages = await getArrayFromFile('./private/messages.json');
//             await messages.forEach((msg) => {
//                 msg.profileId = profile.id;
//                 allMessages.push(msg);
//             });
//             await writeArrayToFile('./private/messages.json', allMessages);

//         } catch(error) {
//             console.log(error);
//             continue;
//         }
//     }
// })()

async function getMessageFromWebSocket(page, profileId) {
    // const profileManager = new ProfileManager(token, profileId);
    // await profileManager.startProfile();
    // const browserManager = new BrowserManager(token, profileManager);
    // const cookieManager = new CookieManager(token, testProfileId);
    // await browserManager.connect();

    // const cookies = await cookieManager.getFilteredCookieByUrl('ton.place');
    // const page = await browserManager.newPage();
    // await page.setCookie(...cookies);

    const client = await page.target().createCDPSession();
    await client.send('Network.enable');

    client.on('Network.webSocketCreated', ({ requestId, url }) => {
        console.log('WebSocket created', url);
    });

    client.on('Network.webSocketFrameReceived', async ({ requestId, timestamp, response }) => {
        console.log(response.payloadData);
        const messages = await getArrayFromFile('./private/messages.json');
        messages.push({
            name: response.payloadData.message.body.user.firstname + response.payloadData.message.body.user.lastname,
            message: response.payloadData.message.body.message.text,
            profileId: profileId
        });
        await writeArrayToFile('./private/messages.json', messages);
        console.log('WebSocket initialized');
    })
}

(async () => {
    //401936834

    // const profileManager = new ProfileManager(token, testProfileId);
    // await profileManager.startProfile();
    // const browserManager = new BrowserManager(token, profileManager);
    // await browserManager.connect();

    // console.log('Profile 1');

    // const profileManager2 = new ProfileManager(token, '401936834');
    // await profileManager2.startProfile();
    // const browserManager2 = new BrowserManager(token, profileManager2);
    // await browserManager2.connect();

    // console.log('Profile 2');

    // await browserManager.disconnect();
    // await profileManager.stop();
    // await browserManager2.disconnect();
    // await profileManager2.stop();

    await startChat('438410210', 'Ке но')
})();

async function startChat(profileId, userName) {
    const profileManager = new ProfileManager(token, profileId);
    await profileManager.startProfile();
    const browserManager = new BrowserManager(token, profileManager);
    const cookieManager = new CookieManager(token, profileId);
    await browserManager.connect();

    const cookies = await cookieManager.getFilteredCookieByUrl('ton.place');
    const page = await browserManager.newPage();
    await page.setCookie(...cookies);
    await page.goto(`https://ton.place/im`, {waitUntil: 'networkidle2', timeout: 120000 });
    // await page.screenshot({path: "test2.png"})
    const test = await page.evaluate(()=>{
        const elements = document.querySelectorAll('.Dialog__name');
        for (const element of elements) {
            if (element.innerText == userName) {
                return 'Nashel';
            }
        }
    })
    // const chatElement = await page.$(`.Dialog__name:contains("${userName}")`);
    console.log(test);
    return
}