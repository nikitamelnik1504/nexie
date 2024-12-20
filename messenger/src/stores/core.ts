import {defineStore} from "pinia";
import {computed, ref} from "vue";

import type {Ref} from 'vue';
import {useApiStore} from "@/stores/api";

type User = {
  id: string,
  wsConnection: any
}

type Account = {
  userId: string,
  id: string,
  remoteId: string,
  remoteIdForDialogs: string,
  username: string,
  platform: string,
}

type Dialog = {
  accountId: string,
  id: string;
  member: {
    id: string;
    username: string;
    image: unknown;
  };
  last_message: {
    text: string;
    author: string;
    timestamp: number;
  };
  new_messages_count: number;
  messages: Array<Message>;
};

type Message = {
  id: string;
  dialogId: string;
  text: string;
  author: string;
  timestamp: number;
};

export const useCoreStore = defineStore('core', () => {
  const users: Ref<Array<User>> = ref([]);
  const accounts: Ref<Array<Account>> = ref([]);
  const dialogs: Ref<Array<Dialog>> = ref([]);
  const messages: Ref<Array<Message>> = ref([]);

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
              userId,
              id: account.id,
              remoteId: account.remoteId,
              remoteIdForDialogs: account.remoteIdForDialogs,
              username: account.username,
              platform: account.platform,
            });
          }
          break;
        case 'dialogs_list':
          dialogs.value.length = 0;

          for (const item of data.data) {
            // @todo High-level error handle needed.
            if (item.dialogs === null) {
              break;
            }

            for (const dialog of item.dialogs) {
              dialogs.value.push(<Dialog>{
                accountId: item.accountId,
                id: dialog.id,
                member: {
                  id: dialog.userId,
                  username: dialog.userName,
                  image: null,
                },
                last_message: {
                  text: dialog.lastMessage.body.text,
                  author: dialog.lastMessage.from,
                  timestamp: dialog.timestamp,
                },
                new_messages_count: 0,
              })
            }
          }
          break;
        case 'dialog_messages':
          messages.value.length = 0;

          for (const message of data.data.messages) {
            messages.value.push(<Message>{
              id: message.id,
              dialogId: data.data.dialogId,
              text: message.data.text,
              author: message.authorId,
              timestamp: message.timestamp,
            })
          }
          break;
      }
    }
  }

  const user = (userId: string) => computed(() => users.value.find(user => user.id === userId));

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

  const getDialogs = (userId: string, accountId: string) => computed(() => {
    return dialogs.value.filter(dialog => dialog.accountId === accountId);
  });

  async function requestDialogs(userId) {
    const matchedUser = users.value.find(user => user.id === userId);
    return matchedUser.wsConnection.send(JSON.stringify({
      type: 'dialogs_list',
    }));
  }

  const getMessages = (userId: sring, accountId: string, dialogId: string) => computed(() => {
    return messages.value.filter(message => message.dialogId === dialogId);
  });

  async function requestMessages(userId: sring, accountId: string, dialogId: string) {
    const matchedUser = users.value.find(user => user.id === userId);
    return matchedUser.wsConnection.send(JSON.stringify({
      type: 'dialog_messages',
      data: {
        accountId,
        dialogId
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
    requestMessages
  }
});
