<script setup lang="ts">
import {useRoute} from "vue-router";
import {watch} from "vue";

import {useCoreStore} from "@/stores/core.ts";

import NavigationDrawer from "@/views/DialogsList/NavigationDrawer.vue";
import TopBar from "@/views/DialogsList/TopBar.vue";
import Dialogs from "@/views/DialogsList/Dialogs.vue";

const route = useRoute();
const coreStore = useCoreStore();

const accounts = coreStore.getAccounts(route.params.userId);

watch(accounts, (newValue) => {
  if (newValue.length !== 0) {
    for (const account of newValue) {
      coreStore.requestDialogs(route.params.userId, account.id);
    }
  }
}, {immediate: true});

</script>

<template>
  <NavigationDrawer/>
  <TopBar/>
  <Dialogs/>
</template>

<style lang="scss">
.v-toolbar-title__placeholder {
  font-size: 18px !important;
}

.dialogs {
  display: flex;
  flex-direction: column;

  .dialogs__list {
    border-radius: 20px;
    background: #F7F7F7;
    flex: 1;

    a.dialog__link {
      transition: .3s;
      text-decoration: none;
      color: black;
      padding: 10px 15px;
      display: flex;
      border-bottom: solid 1px #ffffff1c;

      &:hover {
        background-color: #EFEFEF;
      }

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
        max-height: 21px;

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