export default async function authenticateHandler({socket, payload, socialsAgentService, setupListener}) {
  try {
    const {userId} = payload;

    if (!userId) {
      socket.emit('error', {message: 'userId required'});
      return;
    }

    // Store user info and join room
    socket.userId = userId;

    socket.join(`user_${userId}_${socket.id}`);

    // @todo Remove in 1.0.0.
    // Send accounts
    const ids = await socialsAgentService.getStorage().getByTelegramId(userId);

    const accounts = ids
      .map(id => socialsAgentService.getAccount(id))
      .filter(Boolean)
      .map(account => ({
        id: account.id,
        username: account.getPlatformUsername(),
        platform: account.getPlatformType(),
      }));

    socket.emit('accounts', {type: "accounts", data: accounts});
    console.log(`User ${userId} authenticated`);
  } catch (error) {
    socket.emit('error', {message: 'Authentication failed'});
  }
};