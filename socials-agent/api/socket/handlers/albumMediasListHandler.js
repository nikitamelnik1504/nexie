export default async function albumMediasListHandler({ socket, payload, socialsAgentService, setupListener }) {
  if (!socket.userId) {
    socket.emit('error', { message: 'Not authenticated' });
    return;
  }

  try {
    const account = socialsAgentService.getAccount(payload.accountId);
    const messenger = await account.getMessenger();
    const album = messenger.getAlbums().album(payload.albumId);
    const items = album.getItems().list(0, 30);

    const response = {
      accountId: account.id,
      albumId: album.id,
      me: messenger.getMe().id,
      data: items.map(item => {
        const media = item.getMedia();
        return {
          id: media.id,
          src: media.src,
          timestamp: item.timestamp,
          type: media.constructor.name === 'VideoBase' ? 'video' : 'image',
        };
      })
    };
    socket.emit('albumMediasList', response);

    // Set up listener for album media updates (only for this user)
    setupListener(socket.userId, messenger, 'albumMediasList', (data) => {
      socket.emit('albumMediasList', {
        accountId: account.id,
        albumId: data[0]._collection._album.id,
        me: messenger.getMe().id,
        data: data.map(item => {
          const media = item.getMedia();
          return {
            id: media.id,
            src: media.src,
            timestamp: item.timestamp,
            type: media.constructor.name === 'VideoBase' ? 'video' : 'image',
          };
        })
      });
    });
  } catch (error) {
    socket.emit('error', { message: 'Failed to get album media' });
  }
}
