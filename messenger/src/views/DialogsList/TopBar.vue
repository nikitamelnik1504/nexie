<script setup lang="ts">
import {useRoute} from "vue-router";
import {useDialogsStore} from "@/stores/dialogs.ts";

const route = useRoute();
const dialogsStore = useDialogsStore();

const appVersion = __APP_VERSION__;
const socialsAgentVersion = '0.2.12';
</script>

<template>
  <v-app-bar scroll-behavior="fully-hide" scroll-threshold="60" class="py-0 pe-4" elevation="0">
    <div class="d-flex align-center">
      <v-btn class="px-0 drawer-button" @click="dialogsStore.drawer = !dialogsStore.drawer">
        <span></span>
      </v-btn>
      <v-app-bar-title class="my-0 ms-0">{{ route.params.userId }}</v-app-bar-title>
    </div>
    <div class="ms-auto text-end">
      <h5>SocialsAgent Version: {{ socialsAgentVersion }}</h5>
      <h5>Client Version: {{ appVersion }}</h5>
    </div>
  </v-app-bar>
</template>

<style scoped lang="scss">

.v-app-bar {
  .drawer-button {
    span {
      width: 24px;
      height: 24px;
      background-image: url("../../assets/light/burger-menu.svg");
      background-repeat: no-repeat;
      background-size: cover;
    }
  }
}

.v-theme--nexie-minimal {
  .v-app-bar {
    background: #0D0F1A;
    color: #E0E0E0;

    .drawer-button {
      span {
        background-image: url("../../assets/nexie-minimal/burger-menu.svg");
      }
    }
  }
}

</style>