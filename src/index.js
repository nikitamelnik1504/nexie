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
    const profileManager = new ProfileManager(token, profileId);
    await browserManager.connect();

    for (const site of sitesList) {
        try {
            const cookies = await cookieManager.getFilteredCookieByUrl(site.url);
            const page = await browserManager.newPage();
            await page.setCookie(...cookies);
            await page.goto(`https://${site.url}${site.messages_url}`, {waitUntil: 'networkidle2', timeout: 60000});
            const messageRetriever = new MessageRetriever(page);

            switch (site.name) {
                case 'Ton':
                    console.log(await messageRetriever.getMessagesFromTon(page));
                    break;
                default:
                    console.log(`Undefined site: ${site.name}`);
            }

            await page.close();
        } catch (error) {
            console.error(`Error loading ${site.name}:`, error);
        } finally {
            if (page) {
                await page.close();
            }
            await browserManager.disconnect();
            await profileManager.stopProfile();
        }
    }
}

(async ()=>{
    const profiles = await ProfileManager.getProfiles(token);
    
    for (const profile of profiles.data) {
        try {
            await getProfileMessages(profile.id);
        } catch(error) {
            console.log(error);
            continue;
        }
    }
    return;
})()