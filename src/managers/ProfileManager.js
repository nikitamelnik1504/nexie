import axios from 'axios';

export default class ProfileManager {
    constructor(token, profileId = null) {
        this.token = token;
        this.apiBaseURL = 'http://localhost:3001/v1.0';
        this.profileId = profileId;
        this.profiles = null;
    }

    static async getProfiles(token) {
        try {
            const response = await axios.get('https://dolphin-anty-api.com/browser_profiles', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            this.profiles = response.data;
            return response.data;
        } catch (error) {
            console.error('Error get profiles:', error);
            return null;
        }
    }

    async startProfile(headlessMode = true) {
        try {
            await axios.post(`${this.apiBaseURL}/auth/login-with-token`, { token: this.token }, { headers: { 'Content-Type': 'application/json' } });
            const { data } = await axios.get(`${this.apiBaseURL}/browser_profiles/${this.profileId}/start?automation=1&headless=${Number(headlessMode)}`);
            return data.success ? data.automation : null;
        } catch (error) {
            console.error('Error start profile:', error);
            return null;
        }
    }

    async stopProfile() {
        try {
            await axios.get(`${this.apiBaseURL}/browser_profiles/${this.profileId}/stop`);
        } catch (error) {
            console.error('Error stop profile:', error);
            return null;
        }
    }

}
