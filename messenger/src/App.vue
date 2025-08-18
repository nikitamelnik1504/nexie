<script setup lang="ts">
import {RouterView} from 'vue-router'
import ErrorNotification from "@/components/Notification/ErrorNotification.vue";
import {useCoreStore} from "@/stores/core.ts";
import {useSystemStore} from "@/stores/system.ts";
import { watch } from "vue";

const coreStore = useCoreStore();
const systemStore = useSystemStore();

watch(systemStore, (oldValue, newValue) => {
  switch (newValue.theme) {
    case 'dreamsync':
      document.body.style.background = '#0D0F1A';
      break;
    case 'light':
      document.body.style.background = 'white';
      break;
  }
});

</script>

<template>
  <v-app :theme="systemStore.theme">
    <div class="notification-bar">
      <ErrorNotification
          v-for="(notification, index) in coreStore.notifications.filter((item) => item.type === 'error')" :key="index"
          :message="notification.message"/>
    </div>
    <RouterView/>
  </v-app>
</template>

<style lang="scss">
@import "@/assets/scss/global.scss";
</style>
