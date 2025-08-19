<script setup lang="ts">
import {useDialogsStore} from "@/stores/dialogs.ts";
import {useSystemStore} from "@/stores/system.ts";

const dialogsStore = useDialogsStore();
const systemStore = useSystemStore();
</script>

<template>
  <v-navigation-drawer v-model="dialogsStore.drawer" style="box-shadow: none">
    <v-list>
      <v-list-group value="1" title="123">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" title="Theme"></v-list-item>
        </template>

        <v-list-item @click="systemStore.theme = 'light'" :disabled="systemStore.theme === 'light'">
          Light
        </v-list-item>
        <v-list-item @click="systemStore.theme = 'nexie-minimal'" :disabled="systemStore.theme === 'nexie-minimal'">
          Nexie Minimal
        </v-list-item>
      </v-list-group>
    </v-list>
  </v-navigation-drawer>
</template>

<style scoped lang="scss">
.v-theme--nexie-minimal {
  .v-navigation-drawer {
    background: #0D0F1A;

    .v-list-group {
      .v-list-item {
        color: #E0E0E0;
      }
    }
  }
}
</style>