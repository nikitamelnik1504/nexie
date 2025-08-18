<script setup lang="ts">
import {useRoute} from "vue-router";
import {computed, watch} from "vue";
import {useCoreStore} from "@/stores/core.ts";

import Header from './Header.vue';
import Messages from './Messages.vue';
import Footer from './Footer.vue';
import AttachmentTypeSelect from "./AttachmentTypeSelect.vue";
import AttachmentMediaBrowser from "./AttachmentMediaBrowser.vue";
import ChargeableMessageModal from "./ChargeableMessageModal.vue";

const route = useRoute();
const coreStore = useCoreStore();

const accounts = coreStore.getAccounts(route.params.userId);
const account = computed(() => {
  return accounts.value.find(account => account.id === route.params.accountId);
});
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
const dialog = computed(() => {
  return dialogs.value.find(dialog => dialog.accountId === route.params.accountId && dialog.id === route.params.dialogId);
});

watch(accounts, (newValue) => {
  if (newValue.length !== 0 && !dialog.value) {
    coreStore.requestDialogs(route.params.userId, account.value.id);
  }
}, {immediate: true});

watch(dialog, (newValue) => {
  if (newValue.length !== 0) {
    coreStore.requestMessages(route.params.userId, route.params.accountId, route.params.dialogId);
  }
})

if (dialogs.value.length !== 0) {
  coreStore.requestMessages(route.params.userId, route.params.accountId, route.params.dialogId);
}

</script>

<template>
  <div class="dialog">
    <Header :member="{ username: dialog ? dialog.member.username : 'Loading...' }"
            :dialog="{ platform: dialog ? dialog.platform : 'Loading...' }"
            :me="{ username: dialog ? dialog.username : 'Loading...' }"
    />
    <Messages :account="account" />
    <Footer :account="account" />
  </div>

  <AttachmentTypeSelect />
  <AttachmentMediaBrowser />
  <ChargeableMessageModal />
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

        span {
          width: 26px;
          height: 26px;
          background-image: url("../../assets/light/arrow-back.svg");
          background-size: cover;
          background-repeat: no-repeat;
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
        font-size: 14px;
      }

      .dialog__user__platform {
        display: flex;
        align-items: center;
        padding-bottom: 2px;

        div {
          width: 16px;
          margin-right: 3px;
          display: flex;
          align-items: center;
          justify-content: center;

          img {
            max-width: 100%;
            max-height: 100%;
          }
        }

        h4 {
          font-size: 12px;
          line-height: 14px;
          font-weight: bold;
        }

        &.ton {
          h4 {
            color: #3380cc;
          }
        }

        &.fancentro {
          div {
            img {
              max-width: 80%;
              max-height: 80%;
            }
          }

          h4 {
            color: #8954c8;
          }
        }
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
    overflow-y: scroll;

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

    .message-separator {
      display: flex;
      justify-content: center;
      align-items: center;
      max-width: 100%;

      span {
        font-size: 12px;
        color: #000;
        text-align: center;
        margin-bottom: 10px;
        padding: 8px 14px;
        border-radius: 12px;
      }
    }
  }

  .dialog__field {
    padding: 10px 12px;
    border-top: solid 1px rgba(0, 0, 0, 0.09);
    display: flex;

    .wrapper {
      input {
        font-size: 14px;
        padding: 12px 14px;
        background-color: #EFEFEF;
        border: none;
        border-radius: 20px;
        width: 100%;
        flex: 1;
      }

      button {
        background: none;
      }
    }

    button {
      font-size: 14px;
      width: 64px;
      border: none;
      border-radius: 20px;

      &.charge {
        width: 48px;

        .charge-indicator {
          background: black;
        }

        .charge-icon {
          background-size: cover;
          background-image: url("../../assets/light/dollar.svg");
        }
      }

      &.attachment {
        border-radius: 12px;
        width: 48px;

        .attachment-indicator {
          background: black;
          color: white;
        }

        .attachment-icon {
          background-size: cover;
          background-image: url("../../assets/light/attachment.svg");
        }
      }
    }
  }
}

.paid-message-dialog {
  input {
    font-size: 14px;
    padding: 12px 14px;
    background-color: #EFEFEF;
    border: none;
    width: 100%;
    flex: 1;
    outline: none;
  }
}


</style>