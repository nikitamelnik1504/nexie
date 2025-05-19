import puppeteer from "puppeteer-core";
import axios from "axios";

class DolphinProfile {

  _client;
  browser = null;

  constructor(profileData, dolphinClient) {
    this.id = profileData.id;
    this.userId = profileData.userId;
    this.name = profileData.name;

    this.running = false;
    this.port = null;
    this.wsEndpoint = null;
    this._client = dolphinClient;
  }

  async start() {
    if (this.running) return this;

    try {
      const profileData = (await axios.get(this._client.apiUrl + `/browser_profiles/` + this.id + `/start?automation=1`)).data;
      this.running = profileData.success;
      this.port = profileData.automation.port;
      this.wsEndpoint = profileData.automation.wsEndpoint;

      // Delay after open.
      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (error) {
      if (error.response.data.errorObject !== undefined && error.response.data.errorObject.code === 'E_BROWSER_RUN_DUPLICATE') {
        this.running = true;
      }
      console.log(error);
    }

    return this;
  }

  async stop() {
    if (!this.running) return this;

    try {
      // @todo Replace this shit.
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.running = false;
        this.port = null;
        this.wsEndpoint = null;

        // Delay after close.
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

      // const {success} = (await axios.get(this._client.apiUrl + `/browser_profiles/` + this.id + `/stop`)).data;

      // if (success) {
      //   this.running = false;
      //   this.port = null;
      //   this.wsEndpoint = null;
      //
      //   // Delay after close.
      //   await new Promise(resolve => setTimeout(resolve, 5000));
      // }
    } catch (error) {
      console.log(error);
    }

    return this;
  }

  async refresh() {
    if (this.running === true && this.wsEndpoint !== null) {
      return this;
    }

    this.running = false;
    this.port = null;
    this.wsEndpoint = null;

    await this.start();

    if (this.running === true && this.wsEndpoint === null) {
      return this;
    }

    await this.stop();

    return this;
  }

  async exportCookies() {
    const {data} = await axios.post(`https://sync.anty-api.com/?actionType=getCookies&browserProfileId=` + this.id, {}, {
      headers: {
        'Authorization': `Bearer ${this._client.authToken}`,
        'Content-Type': 'application/json'
      }
    });
    return data.success ? data.data : false;
  }

  async importCookies(raw) {
    raw = JSON.stringify(raw);
    return await axios.post(`https://sync.anty-api.com/?actionType=importCookies&browserProfileId=` + this.id, raw, {
      headers: {
        'Authorization': `Bearer ${this._client.authToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async getBrowser() {
    if (this.running === false) {
      throw new Error('Profile is not running!');
    }

    if (this.browser !== null) {
      return this.browser;
    }

    if (this.port === null || this.wsEndpoint === null) {
      throw new Error('Profile is running, but not in scope of the SocialsAgent Service!');
    }

    //   const cookies = await instance.profile.exportCookies();
    //   await instance.page.setCookie(...cookies);
    return this.browser = await puppeteer.connect({
      browserWSEndpoint: `ws://127.0.0.1:${this.port}${this.wsEndpoint}`,
    })
  }

}

export default DolphinProfile;