<script setup lang="ts">
import {RouterView} from 'vue-router'
import ErrorNotification from "@/components/Notification/ErrorNotification.vue";
import {useCoreStore} from "@/stores/core.ts";

const coreStore = useCoreStore();
</script>

<template>
  <v-app theme="light">
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
