import {expect, jest, test, describe, beforeEach, afterEach} from '@jest/globals';

import SocialsAgentService from "../../src/Service/SocialsAgent/lib/Service.js";

import {fileURLToPath} from "url";
import {dirname} from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const mockAccountData = {
  client: {
    type: 'dolphin',
    params: {
      "authToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiODBlOGFjM2E4ZGY1NjZiZjkxYjU2MjU0NjM4NWE4NjI1NjlhMGEwMTE5OTVkZWVlZjNkMWU1YzM3ZjRjN2I1MDQ5NjFiZDA5MTgyMzkyMjIiLCJpYXQiOjE3MjcyOTI1OTcuNjExNTQ1LCJuYmYiOjE3MjcyOTI1OTcuNjExNTQ2LCJleHAiOjE3NTg4Mjg1OTcuNTk2OTYzLCJzdWIiOiIzNzUwNTE0Iiwic2NvcGVzIjpbXX0.cu3orWJhCEn2nqytQXTs7H6_7DhzlcSbZXxOTkbmkOzA_VpVRVuCrU3wtLGl-NSGhdi9yLTaE6Jo5i14NSqJTsUf3j2eWetUoHN3t-XIT_0dcHxFTUD1NvEF0JoJX6CPk05r6AOC7Dw4f10SPGVWbdVct2vJJDuvnWKdWDR8AAsvj-Uszgg8R8u80P1zh1o3OpQ5qSXsl1kHeacj4Nog1ZNKDZ6kGQ-6b1yR8bOItjW_FlIu37pfiiZNzWB6WIs_N7amRB9EAXXAl1AQxLHZHreJ0butYzn6nWIfW-2vvB5ZS8H6nDI-khpzAo4-Qomeg8qPELJmCDEoTbOdaQB-TISFATMGvAI2oYIbVDHpk0GxGGEh4RiM3A181IToypYdsxvsmSYrzgEsybekdQavuVIiVnhLcyNcZJRIfYYFj14pyk_oCwRl12yMUYylFU6q_LN7_Nj-zaEH0jAIHlRWM2gVZCCIgb_-37xgtwT6hOc_JGohhl1p_wIjW-HgJjgP-42l4JAmCcLJBKtVSS6PilGO9tPfldfqgK0Z4fHpBOgJkkpNxcqhlykf91hbU4h85eIqD1UH5bhVdr5608mN1_FC_VRqX8W_RvDskQi47_7Z0lSdj7lL6E-dZ4YJpIYfqc0BTXlXFJb0_uTSIlXFTAQFYSEs-Su7TR_ywbXFI4Y",
      "apiUrl": "http://localhost:3001/v1.0",
      "profile": 435948299,
    }
  },
  platform: {
    "name": "ton",
    "login": null,
    "password": null,
    "username": "kira_angel"
  }
};

const requiredDialogProperties = ['id', 'messages'];
const requiredMessageProperties = ['id', 'from', 'timestamp', 'text'];

const socialsAgentService = await SocialsAgentService.init(__dirname + '/../../data');

describe.each([0])(`Dolphin Ton account (with messages) run flow from zero.`, () => {
  let newAccount, dialogs;

  test('create account in system', async () => {
    for (const account of socialsAgentService.getAccounts()) {
      await socialsAgentService.removeAccount(account.id);
    }

    newAccount = socialsAgentService.getFactory().createAccount(mockAccountData);
    await socialsAgentService.addAccount(newAccount);

    if (!socialsAgentService.getAccount(newAccount.id)) {
      throw new Error('Account just created has not been found.');
    }
  });

  test('launch real-time message scrapping', async () => {
    await newAccount.startMessenger();
  }, 60000);

  test('verify that dialogs have been loaded', async () => {
    const dialogsCollection = (await newAccount.getMessenger()).getDialogs();
    if (dialogsCollection === null) {
      throw new Error('Dialogs collection has not been created.');
    }

    await new Promise((resolve, reject) => {
      let interval;

      const timeout = setTimeout(() => {
        clearInterval(interval);
        reject(new Error('Dialogs have not been loaded within 20 seconds.'));
      }, 20000);

      interval = setInterval(() => {
        dialogs = dialogsCollection.list(0, 10);

        if (dialogs.length !== 0) {
          clearTimeout(timeout);
          clearInterval(interval);
          resolve();
        }
      }, 1000);
    });
  }, 21000);

  test('verify that each dialog contain required data', async () => {
    for (const dialog of dialogs) {
      for (const property of requiredDialogProperties) {
        if (!dialog.hasOwnProperty(property)) {
          throw new Error(`Missing property ${property} from dialog.`);
        }
      }
    }
  });

  test('verify that each message of each dialog contain required data', async () => {
    for (const dialog of dialogs) {
      for (const message of dialog.messages.list(0, 10)) {
        for (const property of requiredMessageProperties) {
          if (!message.hasOwnProperty(property)) {
            throw new Error(`Missing property ${property} from message.`);
          }
        }
      }
    }
  });

  test('stop real-time message scrapping', async () => {
    await newAccount.stopMessenger();
  }, 60000);

  test('delete account from system', async () => {
    await socialsAgentService.removeAccount(newAccount.id);

    if (socialsAgentService.getAccount(newAccount.id)) {
      throw new Error('Account has not been deleted.');
    }
  });
});
