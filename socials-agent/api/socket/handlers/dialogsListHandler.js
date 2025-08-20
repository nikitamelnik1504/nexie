export default async function dialogsListHandler({ socket, payload, socialsAgentService, setupListener }) {
  if (!socket.userId) {
    socket.emit('error', { message: 'Not authenticated' });
    return;
  }

  try {
    const account = socialsAgentService.getAccount(payload.accountId);
    const messenger = await account.getMessenger();
    const dialogs = messenger.getDialogs().list(0, 30);

    const response = {
      accountId: account.id,
      me: messenger.getMe().id,
      data: dialogs.map(dialog => {
        const lastMessage = dialog.getMessages().lastMessage();
        return {
          id: dialog.id,
          lastMessage: {
            text: lastMessage?.text || null,
            timestamp: lastMessage?.timestamp || null,
            from: lastMessage?.from?.id || null,
            status: lastMessage?.status || null,
          },
          member: {
            id: dialog.member.id,
            username: dialog.member.username,
          },
          unreadMessagesCount: 0,
        };
      })
    };

    socket.emit('dialogsList', response);

    // Set up listener for dialogs updates (only for this user, once)
    setupListener(`user_${socket.userId}_${socket.id}`, messenger, 'dialogsList', (data) => {
      socket.emit('dialogsList', {
        accountId: account.id,
        me: messenger.getMe().id,
        data: data.map(dialog => {
          const lastMessage = dialog.getMessages().lastMessage();
          return {
            id: dialog.id,
            lastMessage: {
              text: lastMessage?.text || null,
              timestamp: lastMessage?.timestamp || null,
              from: lastMessage?.from?.id || null,
              status: lastMessage?.status || null,
            },
            member: {
              id: dialog.member.id,
              username: dialog.member.username,
            },
            unreadMessagesCount: 0,
          };
        })
      });
    }, true);
  } catch (error) {
    socket.emit('error', { message: 'Failed to get dialogs' });
  }
}
