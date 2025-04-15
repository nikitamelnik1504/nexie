<script setup lang="ts">
import {useRoute} from "vue-router";
import {ref, computed, watch} from "vue";
import {useCoreStore} from "@/stores/core.ts";

const route = useRoute();

const message = ref('');

const coreStore = useCoreStore();

const accounts = coreStore.getAccounts(route.params.userId);

const account = computed(() => {
  return accounts.value.find(account => account.id === route.params.accountId);
});

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

const dialog = computed(() => {
  return dialogs.value.find(dialog => dialog.accountId === route.params.accountId && dialog.id === route.params.dialogId);
});

const messages = coreStore.getMessages(route.params.userId, route.params.accountId, route.params.dialogId);
const reversedMessages = computed(() => [...messages.value].sort((x, y) => x.timestamp - y.timestamp).reverse());

watch(accounts, (newValue) => {
  if (newValue.length !== 0) {
    coreStore.requestDialogs(route.params.userId);
  }
}, {immediate: true});

watch(dialogs, (newValue) => {
  if (newValue.length !== 0) {
    coreStore.requestMessages(route.params.userId, route.params.accountId, route.params.dialogId);
  }
})

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'});
}

function sendMessage(message) {
  coreStore.messages.push({
    id: null,
    dialogId: route.params.dialogId,
    text: decodeURIComponent(message),
    author: dialog.value.me.id,
    timestamp: Date.now(),
    status: 'sending',
  });
  coreStore.requestSendMessage(route.params.userId, route.params.accountId, route.params.dialogId, message);
}

</script>

<template>
  <div class="dialog">
    <header>
      <div class="dialog__back">
        <router-link :to="{name: 'dialogs', params: { userId: route.params.userId }}">
          <img src="../assets/arrow-back.svg" alt="back">
        </router-link>
      </div>
      <div class="dialog__user">
        <div class="dialog__user__image">
          {{ dialog ? Array.from(dialog.member.username)[0].toUpperCase() : '' }}
        </div>
        <div>
          <div class="dialog__user__name">
            <h2>{{ dialog ? dialog.member.username : 'Loading...' }}</h2>
          </div>
          <div class="dialog__user__platform">
            <h4>{{ dialog ? dialog.platform : 'Loading...' }} -
              {{ dialog ? dialog.username : 'Loading...' }}</h4>
          </div>
        </div>
      </div>
      <div class="dialog__actions">
        <!-- Optional actions like a button for leaving the chat -->
      </div>
    </header>
    <div class="dialog__messages">
      <div v-if="messages.length !== 0" v-for="dialogMessage in reversedMessages" :key="dialogMessage.id"
           class="message"
           :class="{
        'me': dialogMessage.author === dialog.me.id,
        'not-me': dialogMessage.author !== dialog.me.id,
      }"
      >
        <p>{{ dialogMessage.text }}</p>
        <span>{{ formatTime(dialogMessage.timestamp) }}</span>
      </div>
      <div v-else class="dialog__messages__loader">
        <v-progress-circular color="black" model-value="60" indeterminate/>
      </div>
    </div>
    <div class="dialog__field">
      <input v-model="message" placeholder="Please write the message"/>
      <button @click="sendMessage(message)">Send</button>
    </div>
  </div>
</template>


<style lang="scss">
.dialog {
  height: 100vh;
  display: flex;
  flex-direction: column;

  header {
    border-bottom: solid 1px rgba(0, 0, 0, 0.09);
    padding: 10px 12px;
    display: flex;

    .dialog__back {
      display: flex;
      margin-right: 5px;

      a {
        display: flex;
        align-items: center;

        img {
          width: 26px;
        }
      }
    }

    .dialog__user {
      text-align: start;
      display: flex;
      align-items: center;
      margin-right: 20px;

      .dialog__user__name h2 {
        font-weight: bold;
        font-size: 15px;
      }

      .dialog__user__platform h4 {
        font-size: 13px;
        line-height: 14px;
        opacity: 0.7;
        padding-bottom: 4px;
      }

      .dialog__user__image {
        display: flex;
        align-items: center;
        justify-content: center;
        background: #EFEFEF;
        width: 45px;
        height: 45px;
        border-radius: 40px;
        margin-right: 10px;
      }
    }
  }

  .dialog__messages {
    flex: 1;
    display: flex;
    flex-direction: column-reverse;
    padding: 10px 12px;
    overflow: scroll;

    .message {
      font-size: 14px;
      display: inline-flex;
      flex-direction: column;
      padding: 8px 14px;
      border-radius: 12px;
      margin-bottom: 10px;
      max-width: 78%;

      &.me {
        background: black;
        color: white;
        align-self: end;
        align-items: end;
      }

      &.not-me {
        align-self: start;
        color: black;
        background: #EFEFEF;
      }

      span {
        font-size: 12px;
      }
    }

    .dialog__messages__loader {
      font-size: 21px;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .dialog__field {
    padding: 10px 12px;
    border-top: solid 1px rgba(0, 0, 0, 0.09);
    display: flex;

    input {
      font-size: 14px;
      padding: 12px 14px;
      background-color: #EFEFEF;
      border: none;
      border-radius: 20px;
      width: 73%;
      flex: 1;
    }

    button {
      font-size: 14px;
      width: 64px;
      border: none;
      border-radius: 20px;
      background: black;
      color: white;
      margin-left: 8px;
    }
  }
}
</style>