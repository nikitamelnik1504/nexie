<script setup lang="ts">
import {useDialogStore} from "@/stores/dialog.ts";

const dialogStore = useDialogStore();
</script>

<template>
  <v-bottom-sheet v-model="dialogStore.chat.actions.attachment.selectTypeOpen">
    <v-list>
      <v-list-subheader title="Select attachment type"/>
      <v-list-item
          v-for="tile in [{ title: 'Cloud'}, {title: 'Upload'}]"
          :key="tile.title"
          :title="tile.title"
          :disabled="tile.title === 'Upload'"
          @click="dialogStore.chat.actions.attachment.selectTypeOpen = false; dialogStore.chat.actions.attachment.mediaBrowserOpen = true"
      />
    </v-list>
  </v-bottom-sheet>
</template>

<style scoped lang="scss">

</style>