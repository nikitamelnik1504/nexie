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
        <span></span>
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
.v-theme--nexie-minimal {
  header {
    background: #0D0F1A;
    color: #7F00FF;

    .dialog__back {
      a {
        span {
          background-image: url("../../assets/nexie-minimal/arrow-back.svg");
        }
      }
    }

    .dialog__user {
      .dialog__user__name {
        background: #E0E0E0;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        color: transparent;
      }

      .dialog__user__image {
        background: #E0E0E0;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        color: transparent;
        border: solid 1px #9FA4B9;
      }
    }
  }
}
</style>