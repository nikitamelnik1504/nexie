import PuppeteerBrowserBase from "../../lib/PuppeteerBrowserBase.js";

class SystemBrowser extends PuppeteerBrowserBase {

    constructor(props) {
        super(props);
        this.client = null;
        this.wsConnection = null;
    }

    async start() {
        if (this.client && this.wsConnection) {
            throw new Error('System browser is already running!');
        }

        this.client = await this._clientManager.get('system');

        if (!this.client) {
            throw new Error('System client is not found.');
        }

        const clientProfile = await this.client.profile(this.profile);

        if (!clientProfile) {
            throw new Error('System profile is not found.');
        }

        await clientProfile.start();

        this.wsConnection = await clientProfile.getBrowser();
    }

    async stop() {
        await super.stop();

        if (!this.client || !this.wsConnection) {
            throw new Error('System browser is not running!');
        }

        this.wsConnection = null;
        await (await this.client.profile(this.profile)).stop();
    }
}

export default SystemBrowser;