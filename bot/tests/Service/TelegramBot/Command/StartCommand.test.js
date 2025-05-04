import { expect, jest, test, describe, beforeEach } from '@jest/globals';
import StartCommand from "../../../../src/Service/TelegramBot/Command/StartCommand.js";
import StartScene from "../../../../src/Service/TelegramBot/Scene/StartScene/StartScene.js";

const mockTelegramBotContext = {
  reply: jest.fn(),
  scene: {
    enter: jest.fn()
  },
  chat: {
    username: 'mocked_user',
  }
};

const mockTelegramBotService = {
  getStorage: jest.fn()
};

describe('StartCommand', () => {
  let startCommand;

  beforeEach(() => {
    const mockGetUser = jest.fn();
    mockTelegramBotService.getStorage.mockReturnValue({ getUserByUsername: mockGetUser });
    startCommand = new StartCommand(mockTelegramBotService, mockTelegramBotContext);
    jest.clearAllMocks();
  });

  test('should reply with an error message if no user is found', async () => {
    mockTelegramBotService.getStorage().getUserByUsername.mockResolvedValue(false);
    await startCommand.run();
    expect(mockTelegramBotContext.reply).toHaveBeenCalledWith('You do not have permission to use this command.');
    expect(mockTelegramBotContext.scene.enter).not.toHaveBeenCalled();
  });

  test('should reply with an error message if found user is not admin or default role', async () => {
    mockTelegramBotService.getStorage().getUserByUsername.mockResolvedValue({ role: 'editor' });
    await startCommand.run();
    expect(mockTelegramBotContext.reply).toHaveBeenCalledWith('You do not have permission to use this command.');
    expect(mockTelegramBotContext.scene.enter).not.toHaveBeenCalled();
  });

  test.each([
    { role: 'admin', roleDescription: 'admin user' },
    { role: 'default', roleDescription: 'default user' }
  ])('should enter the StartScene if user is $roleDescription', async ({ role }) => {
    mockTelegramBotService.getStorage().getUserByUsername.mockResolvedValueOnce({ role });
    await startCommand.run();
    expect(mockTelegramBotContext.reply).not.toHaveBeenCalled();
    expect(mockTelegramBotContext.scene.enter).toHaveBeenCalledWith(StartScene.id);
  });
});