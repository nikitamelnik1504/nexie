class DolphinFancentroTab {

  page;
  profile;

  constructor(profile, page) {
    this.profile = profile;
    this.page = page;
  }

  static async open(profile, page) {
    await page.goto('https://fancentro.com');
    return new this(profile, page);
  }

  async getAuthorizationStatus() {
    try {
      const cookies = await this.profile.exportCookies();
      await this.page.setCookie(...cookies);
    } catch (error) {
    }

    await this.page.setViewport({width: 414, height: 896});
    await this.page.goto(`https://fancentro.com/login`, {waitUntil: 'networkidle0', timeout: 60000});

    await this.page.waitForSelector('button[aria-label="Mobile menu"]', {timeout: 15000});
    await this.page.click('button[aria-label="Mobile menu"]');
  }

}

export default DolphinFancentroTab;