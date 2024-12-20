<script setup lang="ts">
import {useRoute} from "vue-router";
import {onMounted, ref, watch} from "vue";
import {useApiStore} from "@/stores/api";
import {useMessageStore} from "@/stores/message.ts";

const route = useRoute();
const apiStore = useApiStore();
const messageStore = useMessageStore();

const initializeWebSocket = async () => {
  if (!apiStore.websocketConnection) {
    await apiStore.fetchWebSocketConnection(import.meta.env.VITE_API_URL, route.params.userId);
  }

  if (apiStore.websocketConnection) {
    apiStore.websocketConnection.onmessage = (message) => {
      const data = JSON.parse(message.data);

      if (data.type === 'dialogs_list') {
        for (const dialog of data.data.dialogs) {
          messageStore.addDialog(data.data.platform, dialog.userName, dialog.lastMessage?.body?.text || "", "", 5);
        }
      }
    };
  }
};

onMounted(async () => {
  await initializeWebSocket();

  watch(
      () => apiStore.websocketConnection,
      async (newConnection, oldConnection) => {
        if (newConnection !== oldConnection) {
          await initializeWebSocket();
        }
      }
  );
});
</script>

<template>
  <div class="dialogs">
    <a href="#" v-for="dialog in messageStore.dialogsSorted" class="dialog">
      <div></div>
      <div class="dialog__message_info">
        <h2>{{ dialog.username }}</h2>
        <h4>{{ dialog.platform }}</h4>
        <p>{{ dialog.preview_message }}</p>
      </div>
      <div>
        <span>{{ dialog.messages_count }}</span>
      </div>
    </a>
  </div>
</template>

<style lang="scss">

.dialogs {
  a.dialog {
    text-decoration: none;
    color: white;
    padding: 10px 15px;
    display: flex;
    border-bottom: solid 1px #ffffff1c;

    .dialog__message_info {
      flex: 1;
    }
  }
}

</style>