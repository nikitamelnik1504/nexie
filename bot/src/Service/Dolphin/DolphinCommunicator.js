import axios from "axios";
import DolphinProfile from "./Communicator/DolphinProfile.js";

class DolphinCommunicator {

  profiles = [];

  authToken;
  apiUrl;

  constructor(apiUrl, authToken) {
    this.authToken = authToken;
    this.apiUrl = apiUrl;
  }

  static async connect(apiUrl, authToken) {
    await axios.post(apiUrl + `/auth/login-with-token`, {token: authToken}, {headers: {'Content-Type': 'application/json'}});
    return new this(apiUrl, authToken);
  }

  async fetchProfiles() {
    let data;

    try {
      // @todo Implement page iterator.
      data = (await axios.get('https://dolphin-anty-api.com/browser_profiles', {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        }
      })).data.data;
    } catch (e) {
      throw e;
    }

    return data;
  }

  async profile(id) {
    let profileInstances = this.profiles.filter(profile => +profile.id === +id);
    if (profileInstances.length !== 0) {
      return profileInstances[0].refresh();
    } else {
      try {
        const profileData = (await axios.get(`https://dolphin-anty-api.com/browser_profiles/` + id,
          {
            headers: {
              'Authorization': `Bearer ${this.authToken}`,
              'Content-Type': 'application/json'
            }
          })).data.data;
        const profileInstance = new DolphinProfile(profileData, this);
        this.profiles.push(profileInstance);
        return profileInstance.refresh();
      } catch (e) {
        console.error(e.response.data);
        return null;
      }
    }
  }

}

export default DolphinCommunicator;
