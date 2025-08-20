export default async function albumsListHandler({ socket, payload, socialsAgentService, setupListener }) {
  if (!socket.userId) {
    socket.emit('error', { message: 'Not authenticated' });
    return;
  }

  try {
    const account = socialsAgentService.getAccount(payload.accountId);
    const messenger = await account.getMessenger();
    const albums = messenger.getAlbums().list(0, 30);

    const response = {
      accountId: account.id,
      me: messenger.getMe().id,
      data: albums.map(album => ({
        id: album.id,
        title: album.title,
        coverUrl: album.coverUrl,
        timestamp: album.timestamp,
      }))
    };
    socket.emit('albumsList', response);

    // Set up listener for albums updates (only for this user)
    setupListener(socket.userId, messenger, 'albumsList', (data) => {
      socket.emit('albumsList', {
        accountId: account.id,
        me: messenger.getMe().id,
        data: data.map(album => ({
          id: album.id,
          title: album.title,
          coverUrl: album.coverUrl,
          timestamp: album.timestamp,
        }))
      });
    });
  } catch (error) {
    socket.emit('error', { message: 'Failed to get albums' });
  }
}
