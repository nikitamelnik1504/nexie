import {expect, jest, test, describe, beforeEach, afterEach} from '@jest/globals';

import SocialsAgentService from "../../src/Service/SocialsAgent/Service.js";

import {fileURLToPath} from "url";
import {dirname} from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const mockAccountAgentData = {
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

const mockAccountTargetData = {
  client: {
    type: 'system',
    params: {},
  },
  platform: {
    "name": "ton",
    "login": null,
    "password": null,
    "username": "tester"
  }
};


const socialAgentAccountAgentMessenger = await socialAgentAccount.getMessenger();

const socialAgentAccountTargetMessenger = await socialAgentAccount.getMessenger();

// Will trigger daemon which will send message.
const message = socialAgentAccountAgentMessenger.getFactory().createMessage(dialogMessages, payload.data)
// Required to register message in dialogs collection.
dialogMessages.addMessage(message);



// CORE TEST!!!
// Agent idea.
// socialAgentAccountAgentMessenger.on('messageSent')
// Target idea.
// if (socialAgentAccountTargetMessenger.on('messageNew'))