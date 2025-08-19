<script setup lang="ts">
import {computed} from "vue";
import {useCoreStore} from "@/stores/core.ts";
import {useRoute} from "vue-router";
import {useSystemStore} from "@/stores/system.ts";

type Separator = {
  type: 'separator';
  id: string;
  label: string;
};

type MessageItem = Message & { type: 'message' };
type ChatListItem = MessageItem | Separator;

const route = useRoute();
const coreStore = useCoreStore();
const systemStore = useSystemStore();

const props = defineProps<{
  account: any;
}>();

const messages = coreStore.getMessages(route.params.userId, route.params.accountId, route.params.dialogId);

const reversedMessagesWithSeparators = computed<ChatListItem[]>(() => {
  const items: ChatListItem[] = [];
  let lastLabel = '';

  const asc = [...messages.value].sort((x, y) => x.timestamp - y.timestamp);

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
        <div class="d-flex w-100 justify-space-between" :class="{
            'flex-row-reverse': item.author === account.me.id,
            'pt-3': item.charge
          }">
          <div class="d-flex align-center">
            <span>{{ formatTime(item.timestamp) }}</span>
            <span v-if="item.author === account.me.id" class="status ms-1" style="width: 14px;height: 14px"
            :class="{
              'sending': item.status === 'sending',
              'sent': item.status === 'sent',
              'seen': item.status === 'seen',
            }"
            >
            </span>
          </div>
          <div class="d-flex align-center pe-3" v-if="item.charge">
            <span :style="{
              color: item.charge.paid ? '#00ff7c' : '#ffee00'
            }" class="font-weight-bold me-1">{{ item.charge.value }}</span>
            <span class="font-weight-bold"
                  :style="{
              color: item.charge.paid ? '#00ff7c' : '#ffee00'
            }">{{ item.charge.currency.toUpperCase() }}</span>
          </div>
        </div>
      </template>
    </div>
    <div v-else class="dialog__messages__loader">
      <v-progress-circular :color="systemStore.theme === 'nexie-minimal' ? '#E0E0E0' : 'black'" model-value="60" indeterminate/>
    </div>
  </div>
</template>

<style scoped lang="scss">

.dialog__messages {
  .message {
    .status {
      background-size: cover;
      background-repeat: no-repeat;

      &.sending {
        background-image: url("../../assets/light/clock.svg");
      }
      &.sent {
        background-image: url("../../assets/light/check.svg");
      }
      &.seen {
        background-image: url("../../assets/light/eye.svg");
      }
    }
  }
}

.v-theme--nexie-minimal {
  .dialog__messages {
    background: #0D0F1A;

    .message {
      &.me, &.not-me {
        background: unset;
        color: #00C9FF;
        border: 1px solid #1E1E2E;
      }

      &.me {
        color: #9FA4B9;
      }

      .status {
        &.sending {
          background-image: url("../../assets/nexie-minimal/clock.svg");
        }
        &.sent {
          background-image: url("../../assets/nexie-minimal/check.svg");
        }
        &.seen {
          background-image: url("../../assets/nexie-minimal/eye.svg");
        }
      }
    }

    .message-separator {
      span {
        color: #E0E0E0;
      }
    }
  }
}
</style>