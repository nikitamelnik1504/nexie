import axios from 'axios';

export default class CookieManager
{
    constructor(token, profileId) {
        this.profileId = profileId;
        this.token = token;
    }

    async importCookies(raw) {
        raw = JSON.stringify(raw);
        const status = await axios.post(`https://sync.anty-api.com/?actionType=importCookies&browserProfileId=${this.profileId}`, raw, {headers: {'Authorization': `Bearer ${this.token}`, 'Content-Type': 'application/json'}});
        return status;
    }
    
    async exportCookies() {
        const {data} = await axios.post(`https://sync.anty-api.com/?actionType=getCookies&browserProfileId=${this.profileId}`, {}, {headers: {'Authorization': `Bearer ${this.token}`, 'Content-Type': 'application/json'}});
        return data.success ? data.data : false;
    }
    
    async getFilteredCookieByUrl(url) {
        const cookie = await this.exportCookies(this.profileId);
        const filteredCookie = await cookie.filter(async cookie => { await cookie.domain.includes('.' + url)});
        return filteredCookie;
    }
}
