class DolphinFancentroTab {

  page;

  constructor(page) {
    this.page = page;
  }

  static async open(page) {
    await page.goto('https://fancentro.com');
    return new this(page);
  }

  getAuthorizationStatus() {
  }

}

export default DolphinFancentroTab;