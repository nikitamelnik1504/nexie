import { telegramBotService, socialsAgentService } from "../../../../index.js";
import ImageAttachment from "../../SocialsAgent/user/Messenger/Ton/ImageAttachment.js";

export class MessageService {
  async getDialogMessages(socket, userId, payload) {
    const telegramUserData = await (await telegramBotService.getStorage()).getUserByUsername(userId);
    const accountId = this.validateAccountAccess(telegramUserData, payload.data.accountId);
    
    const socialAgentAccount = socialsAgentService.getAccount(accountId);
    const messenger = await socialAgentAccount.getMessenger();
    
    if (!messenger) {
      throw new Error('Messenger not available');
    }

    // Get messages
    const dialog = messenger.getDialogs().dialog(payload.data.dialogId);
    const messages = dialog.getMessages();
    
    // Format response
    const response = {
      accountId: socialAgentAccount.id,
      dialogId: dialog.id,
      page: null,
      data: this.formatMessagesList(messages.list())
    };

    // Set up listener for new messages (only for this user)
    this.setupMessagesListener(socket, messenger, userId);
    
    return response;
  }

  async sendMessage(socket, userId, payload) {
    const telegramUserData = await (await telegramBotService.getStorage()).getUserByUsername(userId);
    const accountId = this.validateAccountAccess(telegramUserData, payload.accountId);
    
    const socialAgentAccount = socialsAgentService.getAccount(accountId);
    const messenger = await socialAgentAccount.getMessenger();
    
    if (!messenger) {
      throw new Error('Messenger not available');
    }

    // Send message
    const dialog = messenger.getDialogs().dialog(payload.dialogId);
    const messages = dialog.getMessages();
    
    const newMessage = messenger.getFactory().createMessage(messages, payload.data);
    messages.addMessage(newMessage);

    // Format response
    const response = {
      accountId: socialAgentAccount.id,
      dialogId: dialog.id,
      data: this.formatMessage(newMessage)
    };

    // Set up listener for message sent confirmation (only for this user)
    this.setupMessageSentListener(socket, messenger, userId);
    
    return response;
  }

  validateAccountAccess(telegramUserData, accountId) {
    if (!telegramUserData.social_agent_accounts.includes(accountId)) {
      throw new Error('Access denied to this account');
    }
    return accountId;
  }

  formatMessagesList(messages) {
    return messages.map(message => this.formatMessage(message));
  }

  formatMessage(message) {
    const formatted = {
      id: message.id,
      from: message.from.id,
      timestamp: message.timestamp,
      text: message.text,
      attachments: [],
      isRead: message.isRead,
      charge: message.price
    };

    // Format attachments
    for (const attachment of message.attachments) {
      if (attachment instanceof ImageAttachment) {
        formatted.attachments.push({
          type: 'image',
          id: attachment.id,
          src: attachment.getMedia().src,
        });
      }
    }

    return formatted;
  }

  setupMessagesListener(socket, messenger, userId) {
    // Only set up listener if not already set up for this user
    if (!messenger._messagesListeners) {
      messenger._messagesListeners = new Map();
    }

    if (!messenger._messagesListeners.has(userId)) {
      const listener = (data) => {
        // Send update only to this specific user
        socket.emit('dialogMessages', {
          accountId: messenger.accountId,
          dialogId: data[0]._collection._dialog.id,
          page: null,
          data: this.formatMessagesList(data)
        });
      };

      messenger._messagesListeners.set(userId, listener);
      messenger.on('messagesList', listener);
    }
  }

  setupMessageSentListener(socket, messenger, userId) {
    // Only set up listener if not already set up for this user
    if (!messenger._messageSentListeners) {
      messenger._messageSentListeners = new Map();
    }

    if (!messenger._messageSentListeners.has(userId)) {
      const listener = (data) => {
        // Send update only to this specific user
        socket.emit('dialogSendMessage', {
          accountId: messenger.accountId,
          dialogId: data._collection._dialog.id,
          data: this.formatMessage(data)
        });
      };

      messenger._messageSentListeners.set(userId, listener);
      messenger.on('messageSent', listener);
    }
  }
}
