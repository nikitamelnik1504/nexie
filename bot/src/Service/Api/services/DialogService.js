import { telegramBotService, socialsAgentService } from "../../../../index.js";

export class DialogService {
  async getDialogsList(socket, userId, payload) {
    const telegramUserData = await (await telegramBotService.getStorage()).getUserByUsername(userId);
    const accountId = this.validateAccountAccess(telegramUserData, payload.accountId);
    
    const socialAgentAccount = socialsAgentService.getAccount(accountId);
    const messenger = await socialAgentAccount.getMessenger();
    
    if (!messenger) {
      throw new Error('Messenger not available');
    }

    // Get dialogs
    const dialogs = messenger.getDialogs().list(0, 30);
    
    // Format response
    const response = {
      accountId: socialAgentAccount.id,
      me: messenger.getMe().id,
      data: this.formatDialogsList(dialogs)
    };

    // Set up listener for new dialogs (only for this user)
    this.setupDialogsListener(socket, messenger, userId);
    
    return response;
  }

  validateAccountAccess(telegramUserData, accountId) {
    if (!telegramUserData.social_agent_accounts.includes(accountId)) {
      throw new Error('Access denied to this account');
    }
    return accountId;
  }

  formatDialogsList(dialogs) {
    return dialogs.map(dialog => {
      const lastMessage = dialog.getMessages().lastMessage();
      return {
        id: dialog.id,
        lastMessage: {
          text: lastMessage ? lastMessage.text : null,
          timestamp: lastMessage ? lastMessage.timestamp : null,
          from: lastMessage ? lastMessage.from.id : null,
          status: lastMessage ? lastMessage.status : null,
        },
        member: {
          id: dialog.member.id,
          username: dialog.member.username,
        },
        unreadMessagesCount: 0,
      };
    });
  }

  setupDialogsListener(socket, messenger, userId) {
    // Only set up listener if not already set up for this user
    if (!messenger._dialogsListeners) {
      messenger._dialogsListeners = new Map();
    }

    if (!messenger._dialogsListeners.has(userId)) {
      const listener = (data) => {
        // Send update only to this specific user
        socket.emit('dialogsList', {
          accountId: messenger.accountId,
          me: messenger.getMe().id,
          data: this.formatDialogsList(data)
        });
      };

      messenger._dialogsListeners.set(userId, listener);
      messenger.on('dialogsList', listener);
    }
  }
}
