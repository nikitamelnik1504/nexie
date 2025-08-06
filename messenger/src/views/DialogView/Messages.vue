<script setup lang="ts">
import {computed} from "vue";

type Separator = {
  type: 'separator';
  id: string;
  label: string;
};

type MessageItem = Message & { type: 'message' };
type ChatListItem = MessageItem | Separator;

const props = defineProps<{
  messages: Array<any>;
  account: any;
}>();

const reversedMessagesWithSeparators = computed<ChatListItem[]>(() => {
  const items: ChatListItem[] = [];
  let lastLabel = '';

  const asc = [...props.messages].sort((x, y) => x.timestamp - y.timestamp);

  for (const msg of asc) {
    const label = formatDate(msg.timestamp);

    if (label !== lastLabel) {
      items.push({type: 'separator', id: `sep-${msg.timestamp}`, label});
      lastLabel = label;
    }

    items.push({
      ...msg,
      type: 'message',
    });
  }
  return items.reverse();
})

function formatDate(timestamp: number) {
  const isMilliseconds = timestamp > 9999999999;
  const normalizedTimestamp = isMilliseconds ? timestamp : timestamp * 1000;

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(normalizedTimestamp));
}

function formatTime(timestamp: number) {
  const isMilliseconds = timestamp > 9999999999;

  const normalizedTimestamp = isMilliseconds ? timestamp : timestamp * 1000;

  return new Date(normalizedTimestamp).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>

<template>
  <div class="dialog__messages">
    <div v-if="messages.length !== 0" v-for="item in reversedMessagesWithSeparators" :key="item.id"
         class="message"
         :class="{
        'me': item.author === account.me.id,
        'not-me': item.author !== account.me.id && item.type !== 'separator',
        'message-separator': item.type === 'separator'
      }"
    >
      <template
          v-if="item.type === 'separator'"
      >
        <span>{{ item.label }}</span>
      </template>
      <template v-else>
        <v-container v-if="item.attachments.length !== 0">
          <v-row class="justify-end">
            <v-col :cols="(() => {
                if (item.attachments.length === 1) {
                  return 12;
                }
                if (item.attachments.length === 2) {
                  return 6;
                }
                if (item.attachments.length >= 3) {
                  return 4;
                }
              })()" v-for="attachment in item.attachments" :key="attachment.id">
              <v-img
                  class="mx-auto"
                  max-width="300"
                  min-width="60"
                  :src="attachment.src"
              >
                <template v-slot:placeholder>
                  <div class="d-flex align-center justify-center fill-height">
                    <v-progress-circular
                        color="grey-lighten-4"
                        indeterminate
                    ></v-progress-circular>
                  </div>
                </template>
              </v-img>
            </v-col>
          </v-row>
        </v-container>
        <p>{{ item.text }}</p>
        <img v-if="item.charge" src="../../assets/dollar.svg" width="14" height="14" alt="" style="filter: contrast(0%)">
        <div class="d-flex w-100" :class="{
            'justify-end': item.author === account.me.id,
            'justify-start': item.author !== account.me.id,
          }">
          <span>{{ formatTime(item.timestamp) }}</span>
          <span v-if="item.author === account.me.id" class="d-flex align-center">
              <img v-if="item.status === 'sending'" src="../../assets/clock.svg" alt="" width="14" height="14"
                   class="ms-1">
              <img v-else-if="item.status === 'sent'" src="../../assets/check.svg" alt="" width="14" height="14"
                   class="ms-1">
              <img v-else-if="item.status === 'seen'" src="../../assets/eye.svg" alt="" width="14" height="14"
                   class="ms-1">
            </span>
        </div>
      </template>
    </div>
    <div v-else class="dialog__messages__loader">
      <v-progress-circular color="black" model-value="60" indeterminate/>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>