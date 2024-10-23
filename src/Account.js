import ProfileManager from "./managers/ProfileManager.js";
import BrowserManager from "./managers/BrowserManager.js";
import CookieManager from "./managers/CookieManager.js";


export default class Account {
    constructor(token, profileId, name, login, password) {
        this.profileId = profileId;
        this.token = token;
        this.profile = null;
        this.browser = null;
        this.cookie = null;
        this.login = login;
        this.password = password;
        this.name = name;
        // this.on2FaCode = on2FaCode;
    }

    async start() {
        try {
            this.profile = new ProfileManager(this.token, this.profileId);
            await this.profile.startProfile();
            this.browser = new BrowserManager(this.token, this.profile);
            this.cookie = new CookieManager(this.token, this.profileId);
            await this.browser.connect();
        } catch (error) {
            console.log(error);
            await this.start();
        }
    }

    async _is2FARequired() {
        try {
            await this.page.waitForSelector('#fansly_twofa');
        } catch {
        }
        return await this.page.$('#fansly_twofa') !== null;
    }

    async fanslyAuth() {
        try {
            const cookies = await this.cookie.exportCookies();
            this.page = await this.browser.newPage();
            await this.page.setCookie(...cookies);

            this.page.on('console', async (msg) => console.log('puppeteer:', await Promise.all(msg.args().map(arg => arg.jsonValue()))));


            try {
                await this.page.goto(`https://fansly.com/messages`, { waitUntil: 'networkidle0' });
            } catch (error) {
                console.log(error)
                console.log('restart');
                await this.profile.stopProfile();
                await this.browser.disconnect();
                await this.start();
                await this.fanslyAuth();
            }

            await this.page.evaluate(() => {
                // const elements = Array.from(document.querySelectorAll('span[data-i18context="snapcentro_authorize_login"]'));
                const elements = Array.from(document.querySelectorAll('*'))
                const btn = elements.find(el => el.textContent === 'Sign in' || el.textContent === 'Login');
                btn.click()
                return;
            })

            await this.page.waitForSelector('#fansly_login', { timeout: 60000 });

            await this.page.type('#fansly_login', this.login);
            await this.page.type('#fansly_password', this.password);

            await this.page.click('.modal-content app-button.btn xd-localization-string')

            const is2FARequired = await this._is2FARequired();
            if (is2FARequired) {
                await this.page.screenshot({ path: 'testst.png' });
                return { success: true, isCode: true };
            }

            // try {
            //     await this.page.waitForSelector('dffddf', {timeout: 60000})
            // } catch {
            //     this.page.screenshot({path: 'testst.png'});
            // }
            // await this.page.waitForSelector('modal-content');
            // await this.page.click('.modal-content .btn');
            return { success: true, isCode: false };
        } catch (error) {
            console.log(error)
        }
    }

    async twoFactorAuth(code) {
        try {
            await this.page.waitForSelector('#fansly_twofa');
            await this.page.type('#fansly_twofa', code);
            await this.page.click('.modal-content app-button.btn xd-localization-string');
            return {success: true}
        } catch (error){console.log(error) }
    }

}