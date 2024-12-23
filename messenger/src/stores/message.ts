import { computed, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { useApiStore } from '@/stores/api';

import type { Ref } from 'vue';

type Dialog = {
  id: string;
  platform: string;
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
  text: string;
  author: string;
  timestamp: number;
};

export const useMessageStore = defineStore('message', () => {
  const dialogs: Ref<Array<Dialog>> = ref([]);
  const apiStore = useApiStore();

  async function load(userId?: string) {
    if (apiStore.websocketConnection) {
      apiStore.websocketConnection.onmessage = (message) => {
        const data = JSON.parse(message.data);

        if (data.type === 'dialogs_list') {
          for (const dialog of data.data.dialogs) {
            addDialog({
              id: dialog.id,
              platform: data.data.platform,
              member: {
                id: dialog.userId,
                username: dialog.userName,
                image: null,
              },
              last_message: {
                text: dialog.lastMessage?.body?.text || '',
                author: dialog.lastMessage?.author || '',
                timestamp: dialog.lastMessage?.timestamp || 0,
              },
              new_messages_count: dialog.newMessagesCount || 0,
              messages: [],
            });
          }
        } else if (data.type === 'dialog_messages') {
          for (const message of data.data.messages) {
            addMessageToDialog(message.dialogId, {
              text: message.message,
              author: message.author,
              timestamp: message.timestamp,
            });
          }
        }
      };
      return;
    }

    await apiStore.fetchWebSocketConnection(import.meta.env.VITE_API_URL, userId);
  }

  watch(
    () => apiStore.websocketConnection,
    async (newConnection, oldConnection) => {
      if (newConnection !== oldConnection) {
        try {
          await load();
        } catch (error) {
          console.error('Error reloading websocket connection:', error);
        }
      }
    }
  );

  function addDialog(dialog: Partial<Dialog>) {
    const matchedDialog = dialogs.value.find((d) => d.id === dialog.id);
    if (matchedDialog) {
      matchedDialog.member.username = dialog.member?.username || matchedDialog.member.username;
      matchedDialog.last_message = dialog.last_message || matchedDialog.last_message;
    } else {
      dialogs.value.push({
        id: dialog.id || '',
        platform: dialog.platform || '',
        member: dialog.member || { id: '', username: '', image: null },
        last_message: dialog.last_message || { text: '', author: '', timestamp: 0 },
        new_messages_count: dialog.new_messages_count || 0,
        messages: dialog.messages || [],
      });
    }
  }

  function addMessageToDialog(dialogId: string, message: Message) {
    const matchedDialog = dialogs.value.find((d) => d.id === dialogId);
    if (matchedDialog) {
      matchedDialog.messages.push(message);
    }
  }

  const dialogsSorted = computed(() =>
    dialogs.value.sort((a, b) => b.last_message.timestamp - a.last_message.timestamp)
  );

  return { load, dialogs, addMessageToDialog, dialogsSorted };
});
