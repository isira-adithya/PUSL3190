<script setup>
import { ref } from 'vue';

const menu = ref(null);

const items = ref([
  { label: 'Mark All as Read', icon: 'pi pi-fw pi-check' },
  { label: 'Export Alerts', icon: 'pi pi-fw pi-download' }
]);

const unreviewedAlerts = ref([
  {
    id: 13,
    timestamp: "2025-03-20T18:17:59.241Z",
    domain: "SAMPLE"
  },
  {
    id: 12,
    timestamp: "2025-03-20T18:17:47.842Z",
    domain: "SAMPLE"
  },
  {
    id: 11,
    timestamp: "2025-03-20T18:17:47.775Z",
    domain: "SAMPLE"
  },
  {
    id: 10,
    timestamp: "2025-03-20T18:17:47.711Z",
    domain: "SAMPLE"
  },
  {
    id: 9,
    timestamp: "2025-03-20T18:17:47.638Z",
    domain: "SAMPLE"
  }
]);

function formatDate(dateString) {
  return new Date(dateString).toLocaleString();
}
</script>

<template>
  <div class="card">
    <div class="flex items-center justify-between mb-6">
      <div class="font-semibold text-xl">Unreviewed Alerts</div>
      <div>
        <Button icon="pi pi-ellipsis-v" class="p-button-text p-button-plain p-button-rounded" @click="$refs.menu.toggle($event)"></Button>
        <Menu ref="menu" popup :model="items" class="!min-w-40"></Menu>
      </div>
    </div>

    <span class="block text-muted-color font-medium mb-4">TODAY</span>
    <ul class="p-0 mx-0 mt-0 mb-6 list-none">
      <li v-for="alert in unreviewedAlerts" :key="alert.id" class="flex items-center py-2 border-b border-surface">
        <div class="w-12 h-12 flex items-center justify-center bg-red-100 dark:bg-red-400/10 rounded-full mr-4 shrink-0">
          <i class="pi pi-exclamation-circle !text-xl text-red-500"></i>
        </div>
        <span class="text-surface-900 dark:text-surface-0 leading-normal">
          Alert ID: {{ alert.id }}
          <span class="text-surface-700 dark:text-surface-100">
            detected on <span class="text-primary font-bold">{{ alert.domain }}</span> at {{ formatDate(alert.timestamp) }}
          </span>
        </span>
      </li>
    </ul>

    <div v-if="unreviewedAlerts.length === 0" class="text-center py-4 text-muted-color">
      No unreviewed alerts
    </div>
  </div>
</template>
        