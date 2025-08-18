<script setup lang="ts">
import {useChatStore} from "@/stores/chat.ts";

const chatStore = useChatStore();
</script>

<template>
  <v-bottom-sheet v-model="chatStore.actions.attachment.selectTypeOpen">
    <v-list>
      <v-list-subheader title="Select attachment type"/>
      <v-list-item
          v-for="tile in [{ title: 'Cloud'}, {title: 'Upload'}]"
          :key="tile.title"
          :title="tile.title"
          :disabled="tile.title === 'Upload'"
          @click="chatStore.actions.attachment.selectTypeOpen = false; chatStore.actions.attachment.mediaBrowserOpen = true"
      />
    </v-list>
  </v-bottom-sheet>
</template>

<style scoped lang="scss">

</style>