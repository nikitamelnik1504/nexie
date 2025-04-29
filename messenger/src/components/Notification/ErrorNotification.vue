<script setup lang="ts">
defineProps<{ message: string }>();
</script>

<template>
  <div class="notification-error">
    {{ message }}
  </div>
</template>

<style lang="scss">
.notification-error {
  background: #ff3939;
  color: white;
  text-align: center;
}
</style>