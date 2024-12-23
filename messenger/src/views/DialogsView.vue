<script setup lang="ts">
import {useRoute} from "vue-router";
import {useMessageStore} from "@/stores/message.ts";
import {onMounted} from "vue";

const route = useRoute();
const messageStore = useMessageStore();

onMounted(async () => {
  await messageStore.load(route.params.userId);
})

</script>

<template>
  <div class="dialogs">
    <header>
      <h1>Messages</h1>
    </header>
    <div class="dialogs__list">
      <router-link v-for="dialog in messageStore.dialogsSorted" class="dialog__link"
                   :to="{ name: 'dialog', params: { userId: route.params.userId, dialogId: dialog.id }}">
        <div></div>
        <div class="dialog__message_info">
          <div class="dialog__username">
            <h2>{{ dialog.member.username }}</h2>
          </div>
          <div class="dialog__platform">
            <h4>{{ dialog.platform }}</h4>
          </div>
          <div class="dialog__message">
            <p>{{ dialog.last_message.text }}</p>
          </div>
        </div>
        <div>
          <div class="dialog__date">
            <p>12:32</p>
          </div>
          <div class="dialog__new_messages_count">
            <span>{{ dialog.new_messages_count }}</span>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<style lang="scss">
.dialogs {
  .dialogs__list {
    a.dialog__link {
      background: #F7F7F7;
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

      .dialog__message_info {
        flex: 1;
      }
    }
  }
}
</style>