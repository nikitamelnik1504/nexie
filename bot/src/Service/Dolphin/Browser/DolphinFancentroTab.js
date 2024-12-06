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
    const cookies = await this.profile.exportCookies();
    await this.page.setCookie(...cookies);
    await this.page.setViewport({width: 414, height: 896});
    await this.page.goto(`https://fancentro.com/login`, {waitUntil: 'networkidle0'});
  }

}

export default DolphinFancentroTab;