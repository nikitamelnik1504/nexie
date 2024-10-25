import Account from "../Account.js";

export default class AccountManager {
    constructor(token, profiles, accounts, login, password) {
        this.profiles = profiles;
        this.token = token;
        this.accounts = accounts;
        this.login = login;
        this.password = password;
        this.account = null;
    }

    async bindAccount () {
        let freeProfile = null;
        if (this.accounts.length > 0) {
            const linkedProfilesIds = this.accounts.map((account) => account.profileId);
            freeProfile = this.profiles.find(profile => linkedProfilesIds.find(id => profile.id !== id));
            console.log(freeProfile);
        } else {
            freeProfile = this.profiles[0];
        }

        if (!freeProfile) {
            return {success: false, message: 'There are no free profiles'};
        }

        this.account = new Account(this.token, freeProfile.id, this.login, this.password );
        await this.account.start();
        const accountLogin = await this.account.fanslyAuth();

        if (accountLogin?.success) {
            freeProfile.account = {login: this.login, password: this.password, name: this.name};
            return {success: true, profile: freeProfile, isCode: accountLogin.isCode};
        } else {
            return {success: false, message: 'Error auth'};
        }
    }

    async setTwoFactorAuthCode(code) {
        return await this.account.twoFactorAuth(code);
    }
}