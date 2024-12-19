<script setup lang="ts">
import {useRoute} from "vue-router";

const route = useRoute()

fetch(import.meta.env.VITE_API_URL + '/' + route.params.userId + '/dialogs/webSocket', {
  headers: {
    "ngrok-skip-browser-warning": true
  }
}).then(async (result) => {
  const socket = new WebSocket('wss://' + '825d-178-158-218-135.ngrok-free.app');
});

const wsConnection = '';

const dialogs = [
  {
    platform: "Fancentro",
    username: "Nikita",
    preview_message: "Привіт, це тестове повідомлення.",
    image: "",
    messages_count: 5,
  },
  {
    platform: "Fansly",
    username: "Katryn",
    preview_message: "Ахаха, а я й не знала.",
    image: "",
    messages_count: 1,
  }
];
</script>

<template>
  <div class="dialogs">
    <a href="#" v-for="dialog in dialogs" class="dialog">
      <div></div>
      <div class="dialog__message_info">
        <h2>{{ dialog.username }}</h2>
        <h4>{{ dialog.platform }}</h4>
        <p>{{ dialog.preview_message }}</p>
      </div>
      <div>
        <span>{{ dialog.messages_count }}</span>
      </div>
    </a>
  </div>
</template>

<style lang="scss">

.dialogs {
  a.dialog {
    text-decoration: none;
    color: white;
    padding: 10px 15px;
    display: flex;
    border-bottom: solid 1px #ffffff1c;

    .dialog__message_info {
      flex: 1;
    }
  }
}

</style>