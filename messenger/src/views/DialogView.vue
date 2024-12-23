<script setup lang="ts">
import {useRoute} from "vue-router";
import {useApiStore} from "@/stores/api";
import {useMessageStore} from "@/stores/message.ts";
import {onMounted} from "vue";

const route = useRoute();
const apiStore = useApiStore();

const test = [
  {
    text: 'Hello one',
  },
  {
    text: 'How are you?',
  },
  {
    text: 'I am fine',
  },
  {
    text: 'Do not worry',
  }
];

onMounted(async () => {
  await apiStore.websocketConnection.send({userId: route.params.userId, type: 'dialog_messages'});
});
</script>

<template>
  <div class="dialog">
    <header>
      <div class="dialog__user">
        <div class="dialog__user__image"></div>
        <div>
          <div class="dialog__user__name"><h2>Kemurai</h2></div>
          <div class="dialog__user__platform"><h4>Fancentro - Nastiashiine</h4></div>
        </div>
      </div>
      <div class="dialog__actions">
      </div>
    </header>
    <div class="dialog__messages">

    </div>
    <div class="dialog__field">

    </div>
  </div>
</template>

<style lang="scss">
.dialog {
  header {
    border-bottom: solid 1px gray;


  }
}
</style>