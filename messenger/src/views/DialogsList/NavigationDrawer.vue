<script setup lang="ts">
import {useDialogsStore} from "@/stores/dialogs.ts";

const dialogsStore = useDialogsStore();
</script>

<template>
  <v-navigation-drawer v-model="dialogsStore.drawer" style="box-shadow: none">
    <v-list>
    </v-list>
  </v-navigation-drawer>
</template>

<style scoped lang="scss">

</style>