<script setup lang="ts">
import {useRoute} from "vue-router";

const route = useRoute();

defineProps<{
  me: {
    username: string,
  },
  member: {
    username: string
  },
  dialog: {
    platform: string
  }
}>();
</script>

<template>
  <header>
    <div class="dialog__back">
      <router-link :to="{name: 'dialogs', params: { userId: route.params.userId }}">
        <img src="../../assets/arrow-back.svg" alt="back">
      </router-link>
    </div>
    <div class="dialog__user">
      <div class="dialog__user__image">
        {{ Array.from(member.username)[0].toUpperCase() }}
      </div>
      <div>
        <div class="dialog__user__name">
          <h2>{{ member.username }}</h2>
        </div>
        <div class="dialog__user__platform" :class="{
            'ton': dialog.platform === 'ton',
            'fancentro': dialog.platform === 'fancentro',
          }">
          <div>
            <img src="../../assets/ton.svg" alt="" v-if="dialog.platform === 'ton'">
            <img src="../../assets/fancentro.png" alt="" v-else-if="dialog.platform === 'fancentro'"
                 class="fancentro-logo">
          </div>
          <h4>{{ dialog.platform }} -
            {{ me.username }}</h4>
        </div>
      </div>
    </div>
    <div class="dialog__actions">
      <!-- Optional actions like a button for leaving the chat -->
    </div>
  </header>
</template>

<style scoped lang="scss">

</style>