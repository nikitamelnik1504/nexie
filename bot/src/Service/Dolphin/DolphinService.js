import DolphinCommunicator from "./DolphinCommunicator.js";

/**
 * @todo In next-gen version we may use multiple dolphin connections. It should be implemented as array of Communicators.
 */
class DolphinService {

  sessions = [];

  async connect(apiUrl, authToken) {
    const existSession = this.sessions.filter(session => session.apiUrl === apiUrl);
    if (existSession.length !== 0) {
      await DolphinCommunicator.connect(apiUrl, authToken);
      return existSession[0];
    }

    const newSession = await DolphinCommunicator.connect(apiUrl, authToken);
    this.sessions.push(newSession);
    return newSession;
  }

}

export default DolphinService