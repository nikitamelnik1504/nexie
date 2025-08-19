import { telegramBotService, socialsAgentService } from "../../../../index.js";
import VideoBase from "../../SocialsAgent/lib/Messenger/VideoBase.js";
import ImageBase from "../../SocialsAgent/lib/Messenger/ImageBase.js";

export class AlbumService {
  async getAlbumsList(socket, userId, payload) {
    const telegramUserData = await (await telegramBotService.getStorage()).getUserByUsername(userId);
    const accountId = this.validateAccountAccess(telegramUserData, payload.accountId);
    
    const socialAgentAccount = socialsAgentService.getAccount(accountId);
    const messenger = await socialAgentAccount.getMessenger();
    
    if (!messenger) {
      throw new Error('Messenger not available');
    }

    // Get albums
    const albums = messenger.getAlbums().list(0, 30);
    
    // Format response
    const response = {
      accountId: socialAgentAccount.id,
      me: messenger.getMe().id,
      data: this.formatAlbumsList(albums)
    };

    // Set up listener for new albums (only for this user)
    this.setupAlbumsListener(socket, messenger, userId);
    
    return response;
  }

  async getAlbumMediasList(socket, userId, payload) {
    const telegramUserData = await (await telegramBotService.getStorage()).getUserByUsername(userId);
    const accountId = this.validateAccountAccess(telegramUserData, payload.accountId);
    
    const socialAgentAccount = socialsAgentService.getAccount(accountId);
    const messenger = await socialAgentAccount.getMessenger();
    
    if (!messenger) {
      throw new Error('Messenger not available');
    }

    // Get album
    const album = messenger.getAlbums().album(payload.albumId);
    if (!album) {
      throw new Error('Album not found');
    }

    // Get album items
    const albumItems = album.getItems().list(0, 30);
    
    // Format response
    const response = {
      accountId: socialAgentAccount.id,
      albumId: album.id,
      me: messenger.getMe().id,
      data: this.formatAlbumMediasList(albumItems)
    };

    // Set up listener for new album media (only for this user)
    this.setupAlbumMediasListener(socket, messenger, userId);
    
    return response;
  }

  validateAccountAccess(telegramUserData, accountId) {
    if (!telegramUserData.social_agent_accounts.includes(accountId)) {
      throw new Error('Access denied to this account');
    }
    return accountId;
  }

  formatAlbumsList(albums) {
    return albums.map(album => ({
      id: album.id,
      title: album.title,
      coverUrl: album.coverUrl,
      timestamp: album.timestamp,
    }));
  }

  formatAlbumMediasList(albumItems) {
    return albumItems.map(albumItem => {
      const media = albumItem.getMedia();
      
      const formatted = {
        id: media.id,
        src: media.src,
        timestamp: albumItem.timestamp,
        type: null,
      };

      if (media instanceof VideoBase) {
        formatted.type = 'video';
      } else if (albumItem.media instanceof ImageBase) {
        formatted.type = 'image';
      }

      return formatted;
    });
  }

  setupAlbumsListener(socket, messenger, userId) {
    // Only set up listener if not already set up for this user
    if (!messenger._albumsListeners) {
      messenger._albumsListeners = new Map();
    }

    if (!messenger._albumsListeners.has(userId)) {
      const listener = (data) => {
        // Send update only to this specific user
        socket.emit('albumsList', {
          accountId: messenger.accountId,
          me: messenger.getMe().id,
          data: this.formatAlbumsList(data)
        });
      };

      messenger._albumsListeners.set(userId, listener);
      messenger.on('albumsList', listener);
    }
  }

  setupAlbumMediasListener(socket, messenger, userId) {
    // Only set up listener if not already set up for this user
    if (!messenger._albumMediasListeners) {
      messenger._albumMediasListeners = new Map();
    }

    if (!messenger._albumMediasListeners.has(userId)) {
      const listener = (data) => {
        // Send update only to this specific user
        socket.emit('albumMediasList', {
          accountId: messenger.accountId,
          me: messenger.getMe().id,
          albumId: data[0]._collection._album.id,
          data: this.formatAlbumMediasList(data)
        });
      };

      messenger._albumMediasListeners.set(userId, listener);
      messenger.on('albumMediasList', listener);
    }
  }
}
