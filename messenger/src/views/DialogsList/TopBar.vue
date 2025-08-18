<script setup lang="ts">
import {useRoute} from "vue-router";
import {useDialogsStore} from "@/stores/dialogs.ts";

const route = useRoute();
const dialogsStore = useDialogsStore();

const appVersion = __APP_VERSION__;
const socialsAgentVersion = '0.2.10';
</script>

<template>
  <v-app-bar scroll-behavior="fully-hide" scroll-threshold="60" class="py-0 pe-4" elevation="0">
    <div class="d-flex align-center">
      <v-btn class="px-0" @click="dialogsStore.drawer = !dialogsStore.drawer">
        <img src="../../assets/burger-menu.svg" alt="" width="24">
      </v-btn>
      <v-app-bar-title class="my-0 ms-0">{{ route.params.userId }}</v-app-bar-title>
    </div>
    <div class="ms-auto text-end">
      <h5>SEM SocialAgents Version: {{ socialsAgentVersion }}</h5>
      <h5>SEM Client Version: {{ appVersion }}</h5>
    </div>
  </v-app-bar>
</template>

<style scoped lang="scss">

</style>