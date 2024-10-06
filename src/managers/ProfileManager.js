import axios from 'axios';
import {getArrayFromFile, writeArrayToFile} from '../utils/helper.js';

export default class ProfileManager {
    constructor(token, profileId) {
        this.token = token;
        this.apiBaseURL = 'http://localhost:3001/v1.0';
        this.profileId = profileId;
        this.port = null;
        this.wsEndpoint = null;
        this.headlessMode = true;
    }

    static async getProfiles(token) {
        try {
            const response = await axios.get('https://dolphin-anty-api.com/browser_profiles', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error get profiles:', error);
            return null;
        }
    }

    async saveProfileConnectData() {
        let fileArray = await getArrayFromFile(this.filePath);
        await fileArray.push({profileId: this.profileId, port: this.port, wsEndpoint: this.wsEndpoint});
        await writeArrayToFile(this.filePath, fileArray);
    }

    async startProfile() {
        try {
            await axios.post(`${this.apiBaseURL}/auth/login-with-token`, { token: this.token }, { headers: { 'Content-Type': 'application/json' } });
            const { data } = await axios.get(`${this.apiBaseURL}/browser_profiles/${this.profileId}/start?automation=1&headless=${Number(this.headlessMode)}`);
            this.port = data.automation.port;
            this.wsEndpoint = data.automation.wsEndpoint;
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
