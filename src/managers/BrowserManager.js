import puppeteer from 'puppeteer';
import ProfileManager from './ProfileManager.js';
import fs from 'fs';

export default class BrowserManager {
    constructor(token, profileId) {
        this.token = token;
        this.profileId = profileId;
        this.browser = null;
    }

    async saveConnect({port, wsEndpoint}) {
        const connectData = {
            [this.profileId]: {
                port,
                wsEndpoint
            }
        };
        fs.writeFileSync('../private/config.json', JSON.stringify(connectData));
    }

    async connect() {
        const profileManager = new ProfileManager(this.token, this.profileId);
        const profileData = await profileManager.startProfile();
        if (profileData) {
            const { port, wsEndpoint } = profileData;
            this.browser = await puppeteer.connect({
                browserWSEndpoint: `ws://127.0.0.1:${port}${wsEndpoint}`,
            });
        } else {
            console.error("Couldn't connect to the browser");
        }
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
