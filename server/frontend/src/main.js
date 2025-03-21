import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import Aura from '@primeuix/themes/aura';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

import '@/assets/styles.scss';

const app = createApp(App);

app.use(router);
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.app-dark'
        }
    }
});
app.use(ToastService);
app.use(ConfirmationService);

// session monitor
window.setInterval(() => {
    if (window.location.pathname == '/app/auth/login'){
        return;
    }
    fetch('/api/users/me', {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => {
        if (response.status === 403) {
            router.push('/auth/login');
            return;
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}, 30000);

app.mount('#app');
