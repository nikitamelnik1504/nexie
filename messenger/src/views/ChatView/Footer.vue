<script setup lang="ts">
import {ref} from "vue";
import {useChatStore} from "@/stores/chat.ts";
import {useCoreStore} from "@/stores/core.ts";
import {useRoute} from "vue-router";

const route = useRoute();

const chatStore = useChatStore();
const coreStore = useCoreStore();

const messageText = ref('');

const props = defineProps<{
  account: any;
}>();

function sendMessage() {
  const message = {
    id: null,
    dialogId: route.params.dialogId,
    text: messageText.value,
    author: props.account.me.id,
    timestamp: Date.now(),
    status: 'sending',
    attachments: [...chatStore.actions.attachment.mediaBrowserSelectedItems]
  };

  if (chatStore.actions.charge.value !== 0) {
    message.charge = {
      value: chatStore.actions.charge.value,
      currency: 'eur',
      paid: false,
    };
  }

  coreStore.messages.push(message);
  coreStore.requestSendMessage(route.params.userId, route.params.accountId, route.params.dialogId, messageText.value, chatStore.actions.attachment.mediaBrowserSelectedItems, message.charge ? message.charge : {});
  chatStore.actions.charge.value = 0;
  messageText.value = '';
  chatStore.actions.attachment.mediaBrowserSelectedItems.length = 0;
}

</script>

<template>
  <div class="dialog__field">
    <div class="position-relative wrapper" style="flex: 1">
      <input v-model="messageText" placeholder="Type here..." class="position-relative pe-0"/>
    </div>
    <button class="position-relative charge d-flex justify-center align-center"
            :class="{'v-btn--disabled': chatStore.actions.attachment.mediaBrowserSelectedItems.length === 0}"
            @click="chatStore.actions.charge.modalOpen = true">
      <span class="charge-icon" style="width: 15px;height: 22px"></span>
      <span v-if="chatStore.actions.charge.value !== 0" class="charge-indicator position-absolute"
            style="width: 4px;height: 4px;border-radius: 10px;left: 22.3px;bottom: 3px"/>
    </button>
    <button class="attachment d-flex justify-center position-relative align-center"
            @click="chatStore.actions.attachment.selectTypeOpen = true">
      <span class="attachment-icon" style="width: 21px; height: 21px"></span>
      <span v-if="chatStore.actions.attachment.mediaBrowserSelectedItems.length > 0" class="attachment-indicator px-1"
            style="position:absolute;right: -5px;top: -5px;border-radius: 20px;font-size: 12px;line-height: 16px">{{
          chatStore.actions.attachment.mediaBrowserSelectedItems.length
        }}
      </span>
    </button>
    <button @click="sendMessage"
            :disabled="!messageText && chatStore.actions.attachment.mediaBrowserSelectedItems.length === 0"
            :class="{'v-btn--disabled': !messageText && chatStore.actions.attachment.mediaBrowserSelectedItems.length === 0}">
      Send
    </button>
  </div>
</template>

<style scoped lang="scss">
.v-theme--nexie-minimal {
  .dialog__field {
    background: #0D0F1A;
    border: none;

    .wrapper {
      input {
        background: none;
        color: #E0E0E0;
        outline: none;
      }
    }

    button {
      background: transparent;
      color: #E0E0E0;
      border: #E0E0E0;

      &.charge {
        .charge-indicator {
          background: #E0E0E0;
        }

        .charge-icon {
          background-image: url("../../assets/nexie-minimal/dollar.svg");
        }
      }

      &.attachment {
        background: transparent;

        .attachment-indicator {
          background: #E0E0E0;
          color: #0D0F1A;
        }

        .attachment-icon {
          background-image: url("../../assets/nexie-minimal/attachment.svg");
        }
      }
    }
  }
}
</style>