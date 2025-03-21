<script setup>
import { ref, onMounted } from 'vue';

const menu = ref(null);

const items = ref([
  { label: 'Export CSV', icon: 'pi pi-fw pi-download' },
  { label: 'View Details', icon: 'pi pi-fw pi-search' }
]);

const domainDistribution = ref([
  { domain: 'example.com', count: 10 },
  { domain: 'test.com', count: 5 },
  { domain: 'sample.com', count: 8 }
]);

const userAgentDistribution = ref([
  { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3', count: 15 },
  { userAgent: 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3', count: 8 },
  { userAgent: 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:54.0) Gecko/20100101 Firefox/54.0', count: 5 }
]);

const props = defineProps({
  domainDistribution: {
    type: Array,
    default: () => []
  },
  userAgentDistribution: {
    type: Array,
    default: () => []
  }
});

function getPercentage(count) {
  const total = domainDistribution.value.reduce((sum, item) => sum + item.count, 0);
  return ((count / total) * 100).toFixed(2);
}

function shortenUserAgent(ua) {
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  if (ua.includes('MSIE') || ua.includes('Trident')) return 'Internet Explorer';
  return 'Other';
}

onMounted(() => {
  // Fetch data from API or use props
  if (props.domainDistribution.length > 0) {
    domainDistribution.value = props.domainDistribution;
  }
  if (props.userAgentDistribution.length > 0) {
    userAgentDistribution.value = props.userAgentDistribution;
  }
});
</script>

<template>
  <div class="card">
    <div class="flex justify-between items-center mb-6">
      <div class="font-semibold text-xl">Domain Distribution</div>
      <div>
        <Button icon="pi pi-ellipsis-v" class="p-button-text p-button-plain p-button-rounded" @click="$refs.menu.toggle($event)"></Button>
        <Menu ref="menu" popup :model="items" class="!min-w-40"></Menu>
      </div>
    </div>
    <ul class="list-none p-0 m-0">
      <li v-for="(domain, index) in domainDistribution" :key="index" class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <span class="text-surface-900 dark:text-surface-0 font-medium mr-2 mb-1 md:mb-0">{{ domain.domain }}</span>
          <div class="mt-1 text-muted-color">Vulnerable Domain</div>
        </div>
        <div class="mt-2 md:mt-0 flex items-center">
          <div class="bg-surface-300 dark:bg-surface-500 rounded-border overflow-hidden w-40 lg:w-24" style="height: 8px">
            <div class="bg-orange-500 h-full" :style="{ width: getPercentage(domain.count) + '%' }"></div>
          </div>
          <span class="text-orange-500 ml-4 font-medium">{{ domain.count }} alerts</span>
        </div>
      </li>
      <div v-if="domainDistribution.length <= 0">
        <li class="flex items-center py-2 border-b border-surface">
          <div class="w-12 h-12 flex items-center justify-center mr-4 shrink-0">
            <i class="pi pi-exclamation-circle !text-xl text-red-500"></i>
          </div>
          <span class="text-surface-900 dark:text-surface-0 leading-normal">No vulnerable domains found.</span>
        </li>
      </div>
    </ul>

    <div class="font-semibold text-xl mt-8 mb-6">User Agent Distribution</div>
    <ul class="list-none p-0 m-0">
      <li v-for="(ua, index) in userAgentDistribution" :key="index" class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <span class="text-surface-900 dark:text-surface-0 font-medium mr-2 mb-1 md:mb-0">{{ shortenUserAgent(ua.userAgent) }}</span>
          <div class="mt-1 text-muted-color">Browser</div>
        </div>
        <div class="mt-2 md:mt-0 flex items-center">
          <div class="bg-surface-300 dark:bg-surface-500 rounded-border overflow-hidden w-40 lg:w-24" style="height: 8px">
            <div class="bg-cyan-500 h-full" :style="{ width: '100%' }"></div>
          </div>
          <span class="text-cyan-500 ml-4 font-medium">{{ ua.count }} alerts</span>
        </div>
      </li>
    </ul>
    <div v-if="userAgentDistribution.length <= 0">
        <li class="flex items-center py-2 border-b border-surface">
          <div class="w-12 h-12 flex items-center justify-center mr-4 shrink-0">
            <i class="pi pi-exclamation-circle !text-xl text-red-500"></i>
          </div>
          <span class="text-surface-900 dark:text-surface-0 leading-normal">No user agents found.</span>
        </li>
      </div>
  </div>
</template>