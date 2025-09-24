import axios from "axios";
import DolphinProfile from "./DolphinProfile.js";

class DolphinClient {

  profiles = [];

  authToken;
  apiUrl;

  // @todo Implement dolphin client hierarchy.
  static CLIENT_BROWSER_STATUS = {
    0: 'Profile is not found',
    1: 'Profile is failed to start',
    2: 'Profile is running out of bot',
    3: 'Profile is successfully started'
  };

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

  getProfiles() {
    return this.profiles;
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
        if (e.response.data.error !== undefined && e.response.data.error.code === 'E_BROWSER_PROFILE_ACCESS_DENIED') {
          return false;
        }

        console.error(e.response.data);
        return null;
      }
    }
  }

}

export default DolphinClient;
