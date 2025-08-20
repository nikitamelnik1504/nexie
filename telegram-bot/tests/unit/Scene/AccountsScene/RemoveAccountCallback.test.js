import { expect, jest, test, describe, beforeEach } from '@jest/globals';
import RemoveAccountCallback from "../../../../src/Scene/AccountsScene/RemoveAccountCallback.js";

const mockTelegramBotContext = {
  reply: jest.fn(),
  match: ['', 'mock_social_agent_account_id']
};

const mockTelegramBotService = {
  getStorage: jest.fn(),
  getSocialsAgentService: jest.fn()
};

describe('RemoveAccountCallback', () => {
  let removeAccountCallback;
  let socialsAgentServiceMock, storageServiceMock;

  beforeEach(async () => {
    socialsAgentServiceMock = { removeAccount: jest.fn() };
    storageServiceMock = {
      removeUserAccessToSocialAgentAccount: jest.fn(),
      removeSocialAgentAccount: jest.fn(),
      getAllUsersWithAccessToSocialAgentAccount: jest.fn().mockResolvedValue([{}, {}, {}]),
    };

    mockTelegramBotService.getSocialsAgentService.mockResolvedValue(socialsAgentServiceMock);
    mockTelegramBotService.getStorage.mockResolvedValue(storageServiceMock);

    removeAccountCallback = new RemoveAccountCallback(mockTelegramBotService, mockTelegramBotContext);
    jest.clearAllMocks();
  });

  test('removes the social agent account and unassigns all users who had access', async () => {
    await removeAccountCallback.run();

    expect(storageServiceMock.getAllUsersWithAccessToSocialAgentAccount).toHaveBeenCalledWith(mockTelegramBotContext.match[1]);
    expect(storageServiceMock.removeUserAccessToSocialAgentAccount).toHaveBeenCalledTimes(3);
    expect(socialsAgentServiceMock.removeAccount).toHaveBeenCalledWith(mockTelegramBotContext.match[1]);
    expect(storageServiceMock.removeSocialAgentAccount).toHaveBeenCalledWith(mockTelegramBotContext.match[1]);


  });
});