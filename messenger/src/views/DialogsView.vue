<script setup lang="ts">
import {useRoute} from "vue-router";
import {computed, ref, watch} from "vue";
import {useCoreStore} from "@/stores/core.ts";

const appVersion = __APP_VERSION__;
const socialsAgentVersion = '0.2.0';

const route = useRoute();

const coreStore = useCoreStore();

const accounts = coreStore.getAccounts(route.params.userId);

const dialogs = computed(() => {
  let res = [];
  for (const account of accounts.value) {
    const dialogsFromAccount = coreStore.getDialogs(route.params.userId, account.id).value;
    const dialogsWithNewProperty = dialogsFromAccount.map(dialog => ({
      ...dialog,
      platform: account.platform,
      username: account.username
    }));
    res = res.concat(dialogsWithNewProperty);
  }
  return res;
});

watch(accounts, (newValue) => {
  if (newValue.length !== 0) {
    coreStore.requestDialogs(route.params.userId);
  }
}, {immediate: true});

function formatTime(timestamp: number) {
  const now = Date.now();
  const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

  if (timestamp < twentyFourHoursAgo) {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
    }).format(new Date(timestamp));
  } else {
    return new Date(timestamp).toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'});
  }
}
</script>

<template>
  <div class="dialogs">
    <header>
      <h1 class="mb-0">Messages</h1>
      <h5>Socials Agent Version: {{ socialsAgentVersion }}</h5>
      <h5>Client Version: {{ appVersion }}</h5>
    </header>

    <div class="dialogs__list">
      <div v-if="!dialogs || dialogs.length === 0" class="dialogs__loader">
        <v-progress-circular color="black" model-value="60" indeterminate/>
      </div>
      <router-link v-else v-for="dialog in dialogs"
                   class="dialog__link"
                   :to="{ name: 'dialog', params: { userId: route.params.userId, accountId: dialog.accountId, dialogId: dialog.id }}">
        <div class="dialog__avatar">
          <div class="dialog__avatar_image">
            {{ Array.from(dialog.member.username)[0].toUpperCase() }}
          </div>
        </div>
        <div class="dialog__message_info">
          <div class="dialog__username">
            <h2>{{ dialog.member.username }}</h2>
          </div>
          <div class="dialog__platform">
            <h4>{{ dialog.platform }} - {{ dialog.username }}</h4>
          </div>
          <div class="dialog__message">
            <p>{{ dialog.last_message.text }}</p>
          </div>
        </div>
        <div>
          <div class="dialog__date">
            <p>{{ formatTime(dialog.last_message.timestamp) }}</p>
          </div>
          <div class="dialog__new_messages_count">
            <!--            <span>{{ dialog.new_messages_count }}</span>-->
          </div>
        </div>
      </router-link>
<!--      <div v-else class="dialog__list__empty">-->
<!--        There is no messages.-->
<!--      </div>-->
    </div>
  </div>
</template>

<style lang="scss">
.dialogs {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  header h1 {
    font-size: 18px;
    margin: 6px 0;
  }

  .dialogs__list {
    border-radius: 20px;
    background: #F7F7F7;
    flex: 1;

    a.dialog__link {
      text-decoration: none;
      color: black;
      padding: 10px 15px;
      display: flex;
      border-bottom: solid 1px #ffffff1c;

      .dialog__username {
        h2 {
          font-size: 14px;
          font-weight: bold;
        }
      }

      .dialog__platform {
        h4 {
          font-size: 13px;
        }
      }

      .dialog__message {
        p {
          font-size: 13px;
        }
      }

      .dialog__avatar_image {
        display: flex;
        align-items: center;
        justify-content: center;
        background: white;
        width: 52px;
        height: 52px;
        margin-top: 7px;
        border-radius: 40px;
        margin-right: 14px;
      }

      .dialog__message_info {
        flex: 1;
      }
    }

    .dialog__list__empty {
    }

    .dialogs__loader {
      font-size: 21px;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 12px;
    }
  }
}
</style>