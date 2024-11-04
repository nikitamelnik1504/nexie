import puppeteer from 'puppeteer';

export default class BrowserManager {
    constructor(token, profileManager) {
        this.token = token;
        this.browser = null;
        this.profile = profileManager;
    }

    async connect() {
        this.browser = await puppeteer.connect({
            browserWSEndpoint: `ws://127.0.0.1:${this.profile.port}${this.profile.wsEndpoint}`,
        });
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
