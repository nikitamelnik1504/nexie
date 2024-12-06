import DolphinBrowser from "../DolphinBrowser.js";
import puppeteer from "puppeteer";
import axios from "axios";

class DolphinProfile {

  communicator;
  browser = null;

  constructor(profileData, dolphinCommunicator) {
    this.id = profileData.id;
    this.userId = profileData.userId;
    this.name = profileData.name;

    this.running = profileData.success !== undefined ? profileData.success : false;
    this.port = null;
    this.wsEndpoint = null;
    this.communicator = dolphinCommunicator;
  }

  async start() {
    if (this.running === true) {
      return this;
    }

    try {
      const profileData = (await axios.get(this.communicator.apiUrl + `/browser_profiles/` + this.id + `/start?automation=1`)).data;
      this.running = profileData.success;
      this.port = profileData.automation.port;
      this.wsEndpoint = profileData.automation.wsEndpoint;
    } catch (error) {
      if (error.response.data.errorObject !== undefined && error.response.data.errorObject.code === 'E_BROWSER_RUN_DUPLICATE') {
        await axios.get(this.communicator.apiUrl + `/browser_profiles/` + this.id + `/stop`);

        await new Promise((resolve) => {
          setTimeout(() => resolve(), 5000);
        });

        return this.start();
      }
    }

    return this;
  }

  async refresh() {
    try {
      await axios.get(this.communicator.apiUrl + `/browser_profiles/` + this.id + `/start?automation=1`);
      await axios.get(this.communicator.apiUrl + `/browser_profiles/` + this.id + `/stop`);
      this.running = false;
      this.port = null;
      this.wsEndpoint = null;
    } catch (error) {
      if (error.response.data.errorObject !== undefined && error.response.data.errorObject.code === 'E_BROWSER_RUN_DUPLICATE') {
        this.running = true;
      }
    }

    return this;
  }

  async exportCookies() {
    const {data} = await axios.post(`https://sync.anty-api.com/?actionType=getCookies&browserProfileId=` + this.id, {}, {headers: {'Authorization': `Bearer ${this.communicator.authToken}`, 'Content-Type': 'application/json'}});
    return data.success ? data.data : false;
  }

  async importCookies(raw) {
    raw = JSON.stringify(raw);
    return await axios.post(`https://sync.anty-api.com/?actionType=importCookies&browserProfileId=` + this.id, raw, {headers: {'Authorization': `Bearer ${this.communicator.authToken}`, 'Content-Type': 'application/json'}});
  }

  stop() {
  }

  async openBrowser() {
    if (this.running === false) {
      throw new Error('Profile is not running!');
    }

    if (this.browser !== null) {
      return this.browser;
    }

    const browser = await puppeteer.connect({
      browserWSEndpoint: `ws://127.0.0.1:${this.port}${this.wsEndpoint}`,
    })

    return this.browser = new DolphinBrowser(this, browser);
  }

}

export default DolphinProfile;