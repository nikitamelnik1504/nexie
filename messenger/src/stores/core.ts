import {defineStore} from "pinia";
import {computed, ref} from "vue";

import type {Ref} from 'vue';
import {useApiStore} from "@/stores/api";

type User = {
  id: string,
  wsConnection: any
}

type Account = {
  id: string,
  username: string,
  platform: string,
  userId: string,
  me: Me | null,
}

type Member = {
  id: string | null,
  username: string,
  image: string,
}

type Me = {
  id: string,
}

type Dialog = {
  accountId: string,
  id: string;
  member: Member,
  lastMessage: {
    text: string;
    author: string;
    timestamp: number;
  };
  unreadMessagesCount: number;
};

type Message = {
  id: string;
  dialogId: string;
  text: string;
  author: string;
  timestamp: number;
  status: string;
};

type Notification = {
  type: string;
  message: string;
  pinned: boolean;
}

export const useCoreStore = defineStore('core', () => {
  const users: Ref<Array<User>> = ref([]);
  const accounts: Ref<Array<Account>> = ref([]);
  const dialogs: Ref<Array<Dialog>> = ref([]);
  const messages: Ref<Array<Message>> = ref([]);
  const notifications: Ref<Array<Notification>> = ref([]);

  const apiStore = useApiStore();

  async function startWebSocketConnection(userId: string) {
    const user = users.value.find(user => user.id === userId);
    if (user.wsConnection) {
      return;
    }

    user.wsConnection = await apiStore.getWebSocketConnection(userId);
    user.wsConnection.onmessage = async (message) => {
      const data = JSON.parse(message.data);

      switch (data.type) {
        case 'accounts':
          for (const account of data.data) {
            if (accounts.value.find(existAccount => existAccount.id === account.id)) {
              continue;
            }

            accounts.value.push(<Account>{
              id: account.id,
              username: account.username,
              platform: account.platform,
              userId,
              me: null,
            });
          }
          break;
        case 'dialogsList':
          const account = accounts.value.find(account => account.id === data.accountId);

          if (account && account.me === null) {
            account.me = <Me>{
              id: data.me,
            };
          }

          for (const dialog of data.data) {
            const existingDialog = dialogs.value.find(existDialog =>
              existDialog.id === dialog.id &&
              existDialog.accountId === data.accountId
            );

            // @todo High-level error handle needed.
            if (existingDialog) {
              existingDialog.member.id = dialog.member.id;
              existingDialog.member.username = dialog.member.username;
              existingDialog.member.image = dialog.member.image || null;

              existingDialog.lastMessage.text = dialog.lastMessage.text;
              existingDialog.lastMessage.author = dialog.lastMessage.from;
              existingDialog.lastMessage.timestamp = dialog.lastMessage.timestamp;

              existingDialog.unreadMessagesCount = dialog.unreadMessagesCount || 0; // Update unread messages
            } else {
              // Add new dialog if it doesn't exist
              dialogs.value.push(<Dialog>{
                accountId: data.accountId,
                id: dialog.id,
                member: <Member>{
                  id: dialog.member.id,
                  username: dialog.member.username,
                  image: null,
                },
                lastMessage: {
                  text: dialog.lastMessage.text,
                  author: dialog.lastMessage.from,
                  timestamp: dialog.lastMessage.timestamp,
                },
                unreadMessagesCount: 0,
              });
            }
          }
        case 'dialogMessages':
          messages.value.length = 0;

          for (const message of data.data) {
            messages.value.push(<Message>{
              id: message.id,
              dialogId: data.dialogId,
              text: decodeURIComponent(message.text),
              author: message.from,
              timestamp: message.timestamp,
              status: 'sent',
            })
          }
          break;
        case 'dialog_message_new':
          const dialog = dialogs.value.find((dialog) => dialog.id === data.data.dialogId && dialog.accountId === data.data.accountId);
          dialog.last_message.text = decodeURIComponent(data.data.message.text);
          dialog.last_message.author = data.data.message.from;
          dialog.last_message.timestamp = data.data.message.timestamp;

          messages.value.push(<Message>{
            id: data.data.message.id,
            dialogId: data.data.dialogId,
            text: decodeURIComponent(data.data.message.text),
            author: data.data.message.from,
            timestamp: data.data.message.timestamp,
            status: 'sent',
          })
          break;
      }
    }
  }

  const user = (userId: string) => computed(() => users.value.find(user => user.id === userId));

  function addNotification(type: string, message: string, pinned: boolean) {
    notifications.value.push(<Notification>{type, message, pinned});
    if (!pinned) {
      setTimeout(() => {
        removeNotification(type, message);
      }, 5000);
    }
  }

  function removeNotification(type: string, message: string) {
    const notification = notifications.value.find((notification) => notification.type === type && notification.message === message);
    const notificationArrayIndex = notifications.value.indexOf(notification);
    if (notificationArrayIndex > -1) {
      notifications.value.splice(notificationArrayIndex, 1);
    }
  }

  function addUser(userId: string) {
    if (users.value.find(user => user.id === userId)) {
      return;
    }

    users.value.push(<User>{
      id: userId,
      wsConnection: null,
    });
  }

  const getAccounts = (userId: string) => computed(() => {
    return accounts.value.filter(account => account.userId === userId);
  });

  const getDialogs = (accountId: string) => computed(() => {
    return dialogs.value.filter(dialog => dialog.accountId === accountId);
  });

  async function requestDialogs(userId, accountId) {
    const matchedUser = users.value.find(user => user.id === userId);
    return matchedUser.wsConnection.send(JSON.stringify({
      type: 'dialogsList',
      accountId
    }));
  }

  const getMessages = (userId: string, accountId: string, dialogId: string) => computed(() => {
    return messages.value.filter(message => message.dialogId === dialogId);
  });

  async function requestMessages(userId: string, accountId: string, dialogId: string) {
    const matchedUser = users.value.find(user => user.id === userId);
    return matchedUser.wsConnection.send(JSON.stringify({
      type: 'dialogMessages',
      data: {
        accountId,
        dialogId
      }
    }));
  }

  async function requestSendMessage(userId: sring, accountId: string, dialogId: string, message: string) {
    const matchedUser = users.value.find(user => user.id === userId);
    return matchedUser.wsConnection.send(JSON.stringify({
      type: 'dialogSendMessage',
      accountId,
      dialogId,
      data: {
        text: message
      }
    }));
  }

  return {
    users,
    user,
    addUser,
    startWebSocketConnection,
    getAccounts,
    dialogs,
    getDialogs,
    messages,
    getMessages,
    requestDialogs,
    requestMessages,
    requestSendMessage,
    notifications,
    addNotification,
    removeNotification
  }
});
