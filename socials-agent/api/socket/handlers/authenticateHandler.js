export default async function authenticateHandler({ socket, payload, socialsAgentService, setupListener }) {
  try {
    const { userId } = data;
    if (!userId) {
      socket.emit('error', { message: 'userId required' });
      return;
    }

    // Store user info and join room
    socket.userId = userId;
    socket.userData = userData;
    socket.join(`user_${userId}_${socket.id}`);

    // Send accounts
    const accounts = userData.social_agent_accounts.map(id => {
      const account = socialsAgentService.getAccount(id);
      return {
        id: account.id,
        username: account.getPlatformUsername(),
        platform: account.getPlatformType(),
      };
    });

    socket.emit('accounts', { type: "accounts", data: accounts });
    console.log(`User ${userId} authenticated`);
  } catch (error) {
    socket.emit('error', { message: 'Authentication failed' });
  }
};