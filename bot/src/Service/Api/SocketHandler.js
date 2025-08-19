import { UserManager } from './UserManager.js';
import { MessageHandler } from './MessageHandler.js';

export class SocketHandler {
  constructor(io, telegramBotService, socialsAgentService) {
    this.io = io;
    this.telegramBotService = telegramBotService;
    this.socialsAgentService = socialsAgentService;
    this.userManager = new UserManager();
    this.messageHandler = new MessageHandler(this.io, this.userManager);
    
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      
      // Handle user authentication
      socket.on('authenticate', async (data) => {
        await this.handleAuthentication(socket, data);
      });

      // Handle all message requests
      socket.on('dialogsList', async (payload) => {
        await this.handleRequest(socket, 'dialogsList', payload);
      });

      socket.on('dialogMessages', async (payload) => {
        await this.handleRequest(socket, 'dialogMessages', payload);
      });

      socket.on('dialogSendMessage', async (payload) => {
        await this.handleRequest(socket, 'dialogSendMessage', payload);
      });

      socket.on('albumsList', async (payload) => {
        await this.handleRequest(socket, 'albumsList', payload);
      });

      socket.on('albumMediasList', async (payload) => {
        await this.handleRequest(socket, 'albumMediasList', payload);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.handleDisconnection(socket);
      });
    });
  }

  async handleAuthentication(socket, data) {
    const { userId } = data;

    if (!userId) {
      socket.emit('error', { message: 'userId is required' });
      return;
    }

    try {
      const telegramUserData = await (await this.telegramBotService.getStorage()).getUserByUsername(userId);
      if (!telegramUserData) {
        socket.emit('error', { message: 'User not found' });
        return;
      }

      // Authenticate user and join room
      this.userManager.authenticateUser(socket, userId, telegramUserData);

      // Send user's accounts
      const accounts = this.getUserAccounts(telegramUserData);
      socket.emit('accounts', { type: "accounts", data: accounts });
      
      console.log(`User ${userId} authenticated and joined room user_${userId}`);
      
    } catch (error) {
      console.error('Authentication error:', error);
      socket.emit('error', { message: 'Authentication failed' });
    }
  }

  getUserAccounts(telegramUserData) {
    const accounts = [];
    for (const socialAgentId of telegramUserData.social_agent_accounts) {
      const socialAgentAccount = this.socialsAgentService.getAccount(socialAgentId);
      accounts.push({
        id: socialAgentAccount.id,
        username: socialAgentAccount.getPlatformUsername(),
        platform: socialAgentAccount.getPlatformType(),
      });
    }
    return accounts;
  }

  async handleRequest(socket, requestType, payload) {
    if (!this.userManager.isUserAuthenticated(socket)) {
      socket.emit('error', { message: 'User not authenticated' });
      return;
    }

    try {
      await this.messageHandler.handleRequest(socket, requestType, payload);
    } catch (error) {
      console.error(`${requestType} error:`, error);
      socket.emit('error', { message: `Failed to process ${requestType}` });
    }
  }

  handleDisconnection(socket) {
    if (socket.userId) {
      console.log(`User ${socket.userId} disconnected`);
      this.userManager.removeUser(socket.userId);
    }
  }
}
