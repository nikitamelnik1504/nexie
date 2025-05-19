class BrowserManager {

  #browsers = [];

  add(clientParams, browser) {
    this.#browsers.push({clientParams, browser});
    return browser;
  }

  get(clientParams) {
    if (clientParams.type === 'dolphin') {
      const match = this.#browsers.find(b => b.clientParams.authToken === clientParams.authToken && b.clientParams.apiUrl === clientParams.apiUrl && b.clientParams.profile === clientParams.profile);
      return match ? match.browser : match;
    }

    throw new Error(`Unsupported client type: ${clientParams?.type}`);
  }

  remove(browser) {
    this.#browsers.splice(this.#browsers.findIndex(b => b === browser), 1);
  }

}

export default BrowserManager;