<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const model = ref([
    {
        label: 'XSSpecter',
        items: [
            { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' },
            { label: 'Alerts', icon: 'pi pi-fw pi-bolt', to: '/alerts' },
            { label: 'Account', icon: 'pi pi-fw pi-user', to: '/account', class: 'rotated-icon' },
            { label: 'Logout', icon: 'pi pi-fw pi-sign-out', to: '/logout' }
        ]
    },
    {
        label: 'Links',
        items: [
            {
                label: 'Documentation',
                icon: 'pi pi-fw pi-book',
                to: 'https://github.com/isira-adithya/PUSL3190/blob/main/Documentation.md',
                target: '_blank'
            },
            {
                label: 'View Source',
                icon: 'pi pi-fw pi-github',
                url: 'https://github.com/isira-adithya/xsspecter',
                target: '_blank'
            }
        ]
    }
]);

const user = JSON.parse(localStorage.getItem('user'));
if (user) {
    if (user.role === 'ADMIN'){
        model.value[0].items.push({ label: 'Settings', icon: 'pi pi-fw pi-cog', to: '/settings' });
    }
}
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model">
            <app-menu-item v-if="!item.separator" :item="item" :index="i" :key="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator" :key="`sep-${i}`"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
