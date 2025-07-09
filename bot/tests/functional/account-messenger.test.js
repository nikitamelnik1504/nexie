import {
    describe,
    test,
    beforeAll,
    afterAll,
    expect,
    jest,
} from '@jest/globals';
import SocialsAgentService from '../../src/Service/SocialsAgent/Service.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { setTimeout as delay } from 'timers/promises';
import { on } from 'events';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FIXTURES_DIR = __dirname + '/../../data';

jest.setTimeout(60000);

const mockAgentData = {
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

const mockTargetData = {
    client: {
        type: 'system',
        params: {},
    },
    platform: {
        name: 'ton',
        "login": null,
        "password": null,
        username: 'kukom'
    },
};

async function waitForDialogs(messenger, minCount = 1, timeout = 20000, interval = 1000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        const dialogs = messenger.getDialogs().list();
        if (dialogs.length >= minCount) {
            return dialogs;
        }
        await new Promise(r => setTimeout(r, interval));
    }
    throw new Error(
        `Timed out after ${timeout}ms waiting for at least ${minCount} dialog(s).`
    );
}

describe('Messaging', () => {
    let service;
    let agentAccount, targetAccount;
    let agentMessenger, targetMessenger;
    let agentDialog, targetDialog;
    let agentMessengerFactory, targetMessengerFactory;

    beforeAll(async () => {
        service = await SocialsAgentService.init(FIXTURES_DIR);

        // Clean any leftover accounts
        for (const account of service.getAccounts()) {
            await service.removeAccount(account.id);
        }

        agentAccount = service.getFactory().createAccount(mockAgentData);
        targetAccount = service.getFactory().createAccount(mockTargetData);
        await service.addAccount(agentAccount);
        await service.addAccount(targetAccount);

        await Promise.all([
            agentAccount.startMessenger(),
            targetAccount.startMessenger(),
        ]);

        agentMessenger = await agentAccount.getMessenger();
        targetMessenger = await targetAccount.getMessenger();

        agentMessengerFactory = agentMessenger.getFactory();
        targetMessengerFactory = targetMessenger.getFactory();

        const agentDialogs = await waitForDialogs(agentMessenger, 1, 20000);

        const targetDialogs = await waitForDialogs(targetMessenger, 1, 20000);
        targetDialog = targetDialogs[0];

        agentDialog = agentDialogs.find(d =>
            d.member.username.toLowerCase().trim() ===
            mockTargetData.platform.username.toLowerCase().trim()
        );

        if (!agentDialog) {
            throw new Error(
                `Expected a dialog with "${mockTargetData.platform.username}"`
            );
        }
    });

    afterAll(async () => {
        await Promise.all([
            agentAccount.stopMessenger(),
            targetAccount.stopMessenger(),
        ]);
        await service.removeAccount(agentAccount.id);
        await service.removeAccount(targetAccount.id);
    });

    test('1) Dolphin sees dialog with our target user', () => {
        expect(agentDialog).toBeDefined();
        expect(agentDialog.member.username).toBe(mockTargetData.platform.username);
    });

    test('2) Dolphin emits "messageSent" when sending a test message', async () => {
        const onSent = jest.fn();
        agentMessenger.on('messageSent', onSent);

        const payload = {
            dialogId: agentDialog.id,
            text: 'Test',
            from: mockAgentData.platform.username,
            timestamp: Date.now(),
        };

        const dialogMessages = agentDialog.getMessages();
        const msg = agentMessengerFactory.createMessage(dialogMessages, payload);
        dialogMessages.addMessage(msg);

        await delay(1000);
        expect(onSent).toHaveBeenCalledTimes(1);
    });
});
