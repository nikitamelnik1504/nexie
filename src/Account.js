import ProfileManager from "./managers/ProfileManager.js";
import BrowserManager from "./managers/BrowserManager.js";
import CookieManager from "./managers/CookieManager.js";


export default class Account {
    constructor(token, profileId, login, password) {
        this.profileId = profileId;
        this.token = token;
        this.profile = null;
        this.browser = null;
        this.cookie = null;
        this.login = login;
        this.password = password;
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
            await this.browser.disconnect();
            // await this.profile.stopProfile();
            await this.start();
        }
    }

    async stop () {
        if (this.page) {
            await this.page.close();
        }
        await this.browser.disconnect();
        // await this.profile.stopProfile();
    }

    async _is2FARequired() {
        try {
            await this.page.waitForSelector('#fansly_twofa', {timeout: 40000});
        } catch {
            await this.page.screenshot({ path: 'testTwo.png' });
            console.log('twoFa undefined');
        }
        return await this.page.$('#fansly_twofa') !== null;
    }

    async fanslyAuth() {
        // await this.stop();
        // return { success: true, isCode: false };
        try {
            const cookies = await this.cookie.exportCookies();
            this.page = await this.browser.newPage();
            await this.page.setCookie(...cookies);

            await this.page.setViewport({width: 414, height: 896})

            //this.page.on('console', async (msg) => console.log('puppeteer:', await Promise.all(msg.args().map(arg => arg.jsonValue()))));

            await this.page.goto(`https://fansly.com/`, { waitUntil: 'networkidle2' });
            try {
                await this.page.waitForNavigation()
            } catch {}

            await this.page.evaluate(() => {
                // const elements = Array.from(document.querySelectorAll('span[data-i18context="snapcentro_authorize_login"]'));
                const elements = Array.from(document.querySelectorAll('*'))
                const btn = elements.find(el => el.textContent === 'Sign in' || el.textContent === 'Login');
                btn.click()
                return;
            })

            await this.page.waitForSelector('#fansly_login', { timeout: 60000 });
            console.log(this.login);
            console.log(this.password);

            await this.page.type('#fansly_login', this.login);
            await this.page.type('#fansly_password', this.password);
            await this.page.waitForSelector('.modal-content app-button xd-localization-string');
            await this.page.click('.modal-content app-button.btn xd-localization-string');
            try {await this.page.click('.modal-content app-button.btn xd-localization-string')} catch {}

            const is2FARequired = await this._is2FARequired();

            console.log(is2FARequired);

            if (is2FARequired) {
                return { success: true, isCode: true };
            }
            await this.stop();

            return { success: true, isCode: false };
        } catch (error) {
            console.log(error)
            console.log('restart');
            await this.browser.disconnect();
            
            // await this.profile.stopProfile();
            await this.start();
            return await this.fanslyAuth();
        }
    }

    async twoFactorAuth(code) {
        try {
            console.log('set Two Factor')
            await this.page.waitForSelector('#fansly_twofa');
            await this.page.type('#fansly_twofa', code);
            await this.page.click('.modal-content app-button xd-localization-string');
            try {
                await this.page.waitForSelector('.modal-content .error', {timeout: 5000});
            } catch {}
            
            if (await this.page.$('.modal-content .error') !== null) {
                await this.stop();
                return {success: false, message: "Incorrectly code. Account not added"};
            }
            await this.stop();
            return {success: true}
        } catch (error){console.log(error) }
    }

    async tonAuth () {
        try {
        const cookies = await this.cookie.exportCookies();
        this.page = await this.browser.newPage();
        await this.page.setCookie(...cookies);

        this.page.on('console', async (msg) => console.log('puppeteer:', await Promise.all(msg.args().map(arg => arg.jsonValue()))));

        await this.page.goto(`https://ton.place/im`, { waitUntil: 'networkidle2' });
        // await this.page.screenshot({path: 'test_input.png'})
        
        await this.page.waitForSelector('.Input', {timeout: 60000, visible: true});
        await this.page.type('.Input', this.login);
        await this.page.click('.Form__item__cont .Button__text');

        try {
            await this.page.waitForSelector('form ul li:last-child', {visible: true});
            console.log(await this.page.$('form ul') !== null);
            if (await this.page.$('form ul') !== null) {
                await this.page.click('form ul li:last-child > div');
            }
        } catch {}

        await this.page.waitForSelector('#identifierId');
        await this.page.type('#identifierId', this.login);
        await this.page.waitForSelector('#identifierNext', {visible: true});
        await this.page.click('#identifierNext');
        
        console.log('test2');

        await this.page.waitForSelector('input[type=password]', {visible: true,});
        await this.page.type('input[type="password"]', this.password);
        await this.page.waitForSelector('#passwordNext', {visible: true});
        await this.page.click('#passwordNext');

        await this.stop();
        return { success: true, isCode: false };

        } catch (err) {
            console.log(err);
            console.log('restart');
            await this.page.close();
            await this.browser.disconnect();
            await this.profile.stopProfile();
            await this.start();
            return await this.tonAuth();
        }
    }

}