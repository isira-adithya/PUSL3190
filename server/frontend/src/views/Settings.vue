<template>
  <div class="grid grid-cols-12 gap-8">
    <div class="card col-span-12">
      <Toast />
      <ConfirmDialog group="positioned"></ConfirmDialog>
      <NotificationsWidget />
    </div>
  </div>
</template>

<script setup>
import NotificationsWidget from '@/components/settings/NotificationsWidget.vue';
import { onMounted } from 'vue';

// Load settings on component mount
onMounted(() => {
});
</script>