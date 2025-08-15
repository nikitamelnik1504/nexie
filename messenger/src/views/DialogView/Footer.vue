<script setup lang="ts">
import {ref} from "vue";
import {useDialogStore} from "@/stores/dialog.ts";
import {useCoreStore} from "@/stores/core.ts";
import {useRoute} from "vue-router";

const route = useRoute();

const dialogStore = useDialogStore();
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
    attachments: [...dialogStore.chat.actions.attachment.mediaBrowserSelectedItems]
  };

  if (dialogStore.chat.actions.charge.value !== 0) {
    message.charge = {
      value: dialogStore.chat.actions.charge.value,
      currency: 'eur',
      paid: false,
    };
  }

  coreStore.messages.push(message);
  coreStore.requestSendMessage(route.params.userId, route.params.accountId, route.params.dialogId, messageText.value, dialogStore.chat.actions.attachment.mediaBrowserSelectedItems, message.charge ? message.charge : {});
  dialogStore.chat.actions.charge.value = 0;
  messageText.value = '';
  dialogStore.chat.actions.attachment.mediaBrowserSelectedItems.length = 0;
}

</script>

<template>
  <div class="dialog__field">
    <div class="position-relative wrapper" style="flex: 1">
      <input v-model="messageText" placeholder="Please write the message" class="position-relative"
             style="padding-right: 39px;"/>
      <button class="position-absolute d-flex justify-end w-auto"
              :class="{'v-btn--disabled': dialogStore.chat.actions.attachment.mediaBrowserSelectedItems.length === 0}" style="top: 13px; right: 15px"><img
          src="../../assets/dollar.svg" alt="" width="14" @click="dialogStore.chat.actions.charge.modalOpen = true">
        <span v-if="dialogStore.chat.actions.charge.value !== 0" class="position-absolute"
              style="width: 4px;height: 4px;border-radius: 10px;right: 4.6px;top: 24px;background: black;"/>
      </button>
    </div>
    <button class="attachment d-flex justify-center position-relative" @click="dialogStore.chat.actions.attachment.selectTypeOpen = true">
      <img alt="attachment" src="../../assets/attachment.svg" width="21" />
      <span v-if="dialogStore.chat.actions.attachment.mediaBrowserSelectedItems.length > 0" class="px-1"
            style="position:absolute;right: -5px;top: -5px;background: white;color: black;border-radius: 20px;border: solid 4px black;font-size: 12px;line-height: 16px">{{
          dialogStore.chat.actions.attachment.mediaBrowserSelectedItems.length
        }}</span>
    </button>
    <button @click="sendMessage" :disabled="!messageText && dialogStore.chat.actions.attachment.mediaBrowserSelectedItems.length === 0"
            :class="{'v-btn--disabled': !messageText && dialogStore.chat.actions.attachment.mediaBrowserSelectedItems.length === 0}">Send
    </button>
  </div>
</template>

<style scoped lang="scss">

</style>