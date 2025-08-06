import {defineStore} from "pinia";
import {computed, ref} from "vue";

import type {Ref} from 'vue';
import {useApiStore} from "@/stores/api";
import {useDialogStore} from "@/stores/dialog.ts";

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
    status: string;
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
  charge?: {
    price: number,
    paid: boolean,
    currency: string
  };
  attachments: Array<Attachment> | [];
};

type Attachment = {
  type: string;
  id: string;
  src: string;
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
  const dialogStore = useDialogStore();

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
              existingDialog.lastMessage.status = dialog.lastMessage.status;

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
                  status: dialog.lastMessage.status
                },
                unreadMessagesCount: 0,
              });
            }
          }
          break;
        case 'dialogMessages':
          messages.value.length = 0;

          for (const message of data.data) {
            messages.value.push(<Message>{
              // @todo ACCOUNT ID??????
              id: message.id,
              dialogId: data.dialogId,
              text: message.text,
              author: message.from,
              timestamp: message.timestamp,
              status: 'sent',
              attachments: message.attachments,
              charge: message.charge,
            })
          }
          break;
        case 'dialogMessageNew':
          messages.value.push(<Message>{
            // @todo ACCOUNT ID??????
            id: data.data.id,
            dialogId: data.dialogId,
            text: data.data.text,
            author: data.data.from,
            timestamp: data.data.timestamp,
            status: 'sent',
          })

          const existingDialog = dialogs.value.find(existDialog =>
            existDialog.id === data.dialogId
            // existDialog.accountId === data.accountId
          );

          existingDialog.lastMessage.text = data.data.text;
          existingDialog.lastMessage.author = data.data.from;
          existingDialog.lastMessage.timestamp = data.data.timestamp;

          break;

        case 'dialogSendMessage':
          // @todo STUPID.
          messages.value.find(m => m.status === 'sending').status = 'sent';
          break;
        case 'albumsList':
          dialogStore.chat.actions.attachment.mediaBrowserItems.length = 0;

          for (const album of data.data) {
            dialogStore.chat.actions.attachment.mediaBrowserItems.push(<Album>{
              id: album.id,
              title: album.title,
              cover: album.coverUrl,
              timestamp: album.timestamp,
              medias: [],
              accountId: data.accountId,
            });
          }
          break;
        case 'albumMediasList':
          const album = dialogStore.chat.actions.attachment.mediaBrowserItems.find(album => album.id === data.albumId);
          for (const media of data.data) {
            if (media.type === 'image') {
              album?.medias.push(<Image>{
                id: media.id,
                src: media.src,
                timestamp: media.timestamp,
                type: 'image'
              });
            } else if (media.type === 'video') {
              album?.medias.push(<Video>{
                id: media.id,
                src: media.src,
                timestamp: media.timestamp,
                type: 'video',
              });
            }
          }
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

  async function requestSendMessage(userId: string, accountId: string, dialogId: string, message: string, attachments: Array<Attachment> = [], charge = {}) {
    const matchedUser = users.value.find(user => user.id === userId);
    return matchedUser.wsConnection.send(JSON.stringify({
      type: 'dialogSendMessage',
      accountId,
      dialogId,
      data: {
        text: message,
        attachments,
        ...charge
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
    removeNotification,
  }
});
