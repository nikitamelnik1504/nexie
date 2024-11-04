import puppeteer from 'puppeteer';

export default class BrowserManager {
    static connectedBrowsers = []
    constructor(token, profileManager) {
        this.token = token;
        this.browser = null;
        this.profile = profileManager;
    }

    async connect() {
        let isConnect = false;
        for (const browser of BrowserManager.connectedBrowsers) {
            if (browser.profileId === this.profile.id) {
                this.browser = browser.browser;
                isConnect = true;
            }
        }
        if (!isConnect) {
            this.browser = await puppeteer.connect({
                browserWSEndpoint: `ws://127.0.0.1:${this.profile.port}${this.profile.wsEndpoint}`,
            });
            BrowserManager.connectedBrowsers.push({browser: this.browser, profileId: this.profile.id});
        }
    }

    async disconnect() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    async newPage() {
        if (this.browser) {
            return await this.browser.newPage();
        }
        throw new Error('Browser not connected');
    }
}
