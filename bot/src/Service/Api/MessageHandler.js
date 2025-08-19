import { DialogService } from './services/DialogService.js';
import { MessageService } from './services/MessageService.js';
import { AlbumService } from './services/AlbumService.js';

export class MessageHandler {
  constructor(io, userManager) {
    this.io = io;
    this.userManager = userManager;
    
    // Initialize services
    this.dialogService = new DialogService();
    this.messageService = new MessageService();
    this.albumService = new AlbumService();
  }

  async handleRequest(socket, requestType, payload) {
    const userId = socket.userId;
    
    switch (requestType) {
      case 'dialogsList':
        await this.handleDialogsList(socket, userId, payload);
        break;
        
      case 'dialogMessages':
        await this.handleDialogMessages(socket, userId, payload);
        break;
        
      case 'dialogSendMessage':
        await this.handleDialogSendMessage(socket, userId, payload);
        break;
        
      case 'albumsList':
        await this.handleAlbumsList(socket, userId, payload);
        break;
        
      case 'albumMediasList':
        await this.handleAlbumMediasList(socket, userId, payload);
        break;
        
      default:
        socket.emit('error', { message: `Unknown request type: ${requestType}` });
    }
  }

  async handleDialogsList(socket, userId, payload) {
    try {
      const result = await this.dialogService.getDialogsList(socket, userId, payload);
      socket.emit('dialogsList', result);
    } catch (error) {
      console.error('Error getting dialogs list:', error);
      socket.emit('error', { message: 'Failed to get dialogs list' });
    }
  }

  async handleDialogMessages(socket, userId, payload) {
    try {
      const result = await this.messageService.getDialogMessages(socket, userId, payload);
      socket.emit('dialogMessages', result);
    } catch (error) {
      console.error('Error getting dialog messages:', error);
      socket.emit('error', { message: 'Failed to get dialog messages' });
    }
  }

  async handleDialogSendMessage(socket, userId, payload) {
    try {
      const result = await this.messageService.sendMessage(socket, userId, payload);
      socket.emit('dialogSendMessage', result);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  async handleAlbumsList(socket, userId, payload) {
    try {
      const result = await this.albumService.getAlbumsList(socket, userId, payload);
      socket.emit('albumsList', result);
    } catch (error) {
      console.error('Error getting albums list:', error);
      socket.emit('error', { message: 'Failed to get albums list' });
    }
  }

  async handleAlbumMediasList(socket, userId, payload) {
    try {
      const result = await this.albumService.getAlbumMediasList(socket, userId, payload);
      socket.emit('albumMediasList', result);
    } catch (error) {
      console.error('Error getting album medias list:', error);
      socket.emit('error', { message: 'Failed to get album medias list' });
    }
  }
}
