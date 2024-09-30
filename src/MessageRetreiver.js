import { timeout } from "puppeteer";

export default class MessageRetriever {
    constructor(page) {
        this.page = page;
    }

    // async getNewMessages(sitesList, profileId) {
    //     for (const site of sitesList) {
    //         try {
    //             const cookies = await this.profileManager.getFilteredCookieByUrl(profileId, site.url);
    //             const page = await this.browser.newPage();
    //             await page.setCookie(...cookies);
    //             await page.goto(`https://${site.url}${site.messages_url}`, { waitUntil: 'networkidle2' });

    //             switch (site.name) {
    //                 case 'Ton':
    //                     await this.getMessagesFromTon(page);
    //                     break;
    //                 default:
    //                     console.log(`Undefined site: ${site.name}`);
    //             }

    //             await page.close();
    //         } catch (error) {
    //             console.error(`Error ${site.name}:`, error);
    //         }
    //     }
    // }

    async getMessagesFromTon(page) {
        try {
            await page.waitForSelector('.Dialog__name', {timeout: 60000});
            return await page.evaluate(async () => {
                const elementsName = document.querySelectorAll('.Dialog__name');
                const elementsMessage = document.querySelectorAll('.Dialog__text');
            
                let results = [];
            
                for (let i=0; elementsName.length>i; i++) {
                    // if (!elementsName.parentElement.nexElementSibiling.classList.contains('Dialog__unread')) return results;
                    results.push({name: elementsName[i].innerText, message: elementsMessage[i].innerText});
                }
                return results;
               });
        } catch (error) {
            console.error('Error get message with Ton:', error);
        }
    }
}
