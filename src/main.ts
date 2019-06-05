import Vue from 'vue'
import App from './App.vue'

import {ServiceConnector} from './assets/ts/ServiceConnector';

export let $bus = new Vue({});

export const ExternalSettings: IExternalSettings = (window as any)['external-settings'];

export const connector = new ServiceConnector(
    ExternalSettings.Urls.Service,
    ExternalSettings.Token,
    'TAXI',
    ExternalSettings.Organization.UID,
    (state: boolean) => $bus.$emit('busy', state),
);

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
