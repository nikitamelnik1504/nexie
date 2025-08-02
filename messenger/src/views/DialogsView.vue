<script setup lang="ts">
import {useRoute} from "vue-router";
import {computed, ref, watch} from "vue";
import {useCoreStore} from "@/stores/core.ts";

const appVersion = __APP_VERSION__;
const socialsAgentVersion = '0.2.6';

const route = useRoute();

const coreStore = useCoreStore();

const accounts = coreStore.getAccounts(route.params.userId);

const dialogs = computed(() => {
  let res = [];
  for (const account of accounts.value) {
    const dialogsFromAccount = coreStore.getDialogs(account.id).value;
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
    for (const account of newValue) {
      coreStore.requestDialogs(route.params.userId, account.id);
    }
  }
}, {immediate: true});

function formatTime(timestamp: number) {
  const now = Date.now();
  const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

  const isMilliseconds = timestamp > 9999999999;
  const normalizedTimestamp = isMilliseconds ? timestamp : timestamp * 1000;

  if (normalizedTimestamp < twentyFourHoursAgo) {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
    }).format(new Date(normalizedTimestamp));
  } else {
    return new Date(normalizedTimestamp).toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'});
  }
}
</script>

<template>
  <div class="dialogs">
    <header>
      <h1 class="my-0">{{ route.params.userId }}</h1>
      <h5>SEM SocialAgents Version: {{ socialsAgentVersion }}</h5>
      <h5>SEM Client Version: {{ appVersion }}</h5>
    </header>

    <div class="dialogs__list">
      <div v-if="!dialogs || dialogs.length === 0" class="dialogs__loader">
        <v-progress-circular color="black" model-value="60" indeterminate/>
      </div>
      <router-link v-else v-for="dialog in dialogs.sort((x, y) => {
          const xIsMilliseconds = x.lastMessage.timestamp > 9999999999;
          const xNormalizedTimestamp = xIsMilliseconds ? x.lastMessage.timestamp : x.lastMessage.timestamp  * 1000;
          const yIsMilliseconds = y.lastMessage.timestamp > 9999999999;
          const yNormalizedTimestamp = yIsMilliseconds ? y.lastMessage.timestamp : y.lastMessage.timestamp  * 1000;
        return yNormalizedTimestamp - xNormalizedTimestamp ;
      })"
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
          <div class="dialog__platform" :class="{
            'ton': dialog.platform === 'ton',
            'fancentro': dialog.platform === 'fancentro',
          }">
            <div>
              <img src="../assets/ton.svg" alt="" v-if="dialog.platform === 'ton'" class="ton-logo">
              <img src="../assets/fancentro.png" alt="" v-else-if="dialog.platform === 'fancentro'" style="margin-top: -2px;"
                   class="fancentro-logo">
            </div>
            <h4>{{ dialog.platform }} - {{ dialog.username }}</h4>
          </div>
          <div class="dialog__message">
            <p>
              <img v-if="dialog.lastMessage.status === 'sending'" src="../assets/clock.svg" alt="" width="14" height="14" class="ms-1">
              <img v-else-if="dialog.lastMessage.status === 'sent'" src="../assets/check.svg" alt="" width="14" height="14" class="ms-1">
              <img v-else-if="dialog.lastMessage.status === 'seen'" src="../assets/eye.svg" alt="" width="14" height="14" class="ms-1">

              <i v-if="dialog.lastMessage.author !== dialog.member.id">You: </i>
              {{ dialog.lastMessage.text }}
            </p>
          </div>
        </div>
        <div>
          <div class="dialog__date">
            <p>{{ formatTime(dialog.lastMessage.timestamp) }}</p>
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
        display: flex;
        align-items: center;

        h4 {
          font-size: 12px;
          display: flex;
          align-items: center;
          font-weight: bold;
        }

        div {
          width: 18px;
          margin-right: 3px;
          display: flex;
          align-items: center;
          justify-content: center;

          img {
            max-width: 100%;
            max-height: 100%;
          }
        }

        &.fancentro {
          h4 {
            color: #8954c8;
          }

          div {
            img {
              max-width: 80%;
              max-height: 80%;
            }
          }
        }

        &.ton {
          h4 {
            color: #3380cc;
          }
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