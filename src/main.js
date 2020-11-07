import Vue from 'vue'
import Antd from 'ant-design-vue';
import App from './App.vue'
import router from './router'
import store from './store'
import 'ant-design-vue/dist/antd.css';
import axios from 'axios';
Vue.prototype.$axios = axios //全局注册，使用方法为:this.$axios
axios.defaults.baseURL = '/api'

Vue.config.productionTip = false
Vue.use(Antd);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
