import Account from "../Account.js";

export default class AccountManager {
    constructor(token, profiles, accounts, login, password, platform) {
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
            // freeProfile = this.profiles.find(profile => linkedProfilesIds.find(id => profile.id !== id));

            const freeProfiles = [];

            for (const account of this.accounts) {
                for (const profile of this.profiles) {
                    if (account.profileId === profile.id && account.platform !== this.platform) {
                        freeProfiles.push(profile);
                    }
                }
            }
            freeProfiles.push(this.profiles.filter(profile => {!linkedProfilesIds.includes(profile.id)}));


            
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
}