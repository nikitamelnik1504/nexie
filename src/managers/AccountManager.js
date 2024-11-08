import Account from "../Account.js";

export default class AccountManager {
    constructor(token, profiles, accounts = null, login = null, password = null, platform = null) {
        this.profiles = profiles;
        this.token = token;
        this.accounts = accounts;
        this.login = login;
        this.password = password;
        this.account = null;
        this.platform = platform;
    }

    async bindAccount () {
        let freeProfile = null;
        if (this.accounts.length > 0) {
            const linkedProfilesIds = this.accounts.map((account) => {account.profileId});
            const freeProfiles = [];

            for (const account of this.accounts) {
                for (const profile of this.profiles) {
                    if (account.profileId === profile.id && account.platform !== this.platform) {
                        freeProfiles.push(profile);
                    } else if (profile.id !== account.profileId) {
                        freeProfiles.push(profile);
                    }
                }
            }
                        
            freeProfile = freeProfiles[0];
        } else {
            freeProfile = this.profiles[0];
        }

        if (!freeProfile) {
            return {success: false, message: 'There are no free profiles'};
        }

        console.log(freeProfile.id);

        this.account = new Account(this.token, freeProfile.id, this.login, this.password );

        const accountLogin = await this.platformAuthSelection();

        if (accountLogin?.success) {
            freeProfile.account = {login: this.login, password: this.password, name: this.name};
            return {success: true, profile: freeProfile, isCode: accountLogin.isCode};
        } else {
            return {success: false, message: 'Error auth'};
        }
    }

    async platformAuthSelection () {
        await this.account.start();
        switch (this.platform) {
            case 'fansly':
                return await this.account.fanslyAuth();
            case 'ton':
                return await this.account.tonAuth();
            case 'fancentro':
                return await this.account.fancentroAuth();
        }
    }

    async setTwoFactorAuthCode(code) {
        return await this.account.twoFactorAuth(code);
    }

    static async getAuthorizedAccount(token, profileId, platform) {
        const account = new Account(token, profileId);
        await account.start();
        switch (platform) {
            case 'fansly':
                return await account.getAuthorizedAccountFansly();
            case 'ton':
                return await account.getAuthorizedAccountTon();
            case 'fancentro':
                return await account.getAuthorizedAccountFancentro();
        }
    }
}