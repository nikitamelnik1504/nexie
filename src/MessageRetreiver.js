export default class MessageRetriever {
    constructor(page) {
        this.page = page;
    }

    async getMessagesFromTon(page) {
        try {
            await page.waitForSelector('.Dialog__cont');
            await page.screenshot({path: 'test.png'})
            
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
}
