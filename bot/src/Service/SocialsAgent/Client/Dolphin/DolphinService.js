import DolphinClient from "./DolphinClient.js";

/**
 * @todo In next-gen version we may use multiple dolphin connections. It should be implemented as array of Communicators.
 */
class DolphinService {

  sessions = [];

  async client(apiUrl, authToken) {
    const existSession = this.sessions.filter(session => session.apiUrl === apiUrl);
    if (existSession.length !== 0) {
      await DolphinClient.connect(apiUrl, authToken);
      return existSession[0];
    }

    const newSession = await DolphinClient.connect(apiUrl, authToken);
    this.sessions.push(newSession);
    return newSession;
  }

}

export default DolphinService