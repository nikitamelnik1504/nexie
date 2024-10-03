import puppeteer from 'puppeteer';
import ProfileManager from './ProfileManager.js';

export default class BrowserManager {
    constructor(token, profileId) {
        this.token = token;
        this.profileId = profileId;
        this.browser = null;
    }

    async connect() {
        const profileManager = new ProfileManager(this.token, this.profileId);
        await profileManager.startProfile();
        this.browser = await puppeteer.connect({
            browserWSEndpoint: `ws://127.0.0.1:${profileManager.port}${profileManager.wsEndpoint}`,
        });
    }

    async disconnect() {
        if (this.browser) {
            await this.browser.disconnect();
        }
    }

    async newPage() {
        if (this.browser) {
            return await this.browser.newPage();
        }
        throw new Error('Browser not connected');
    }
}
