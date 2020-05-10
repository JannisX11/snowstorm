import Vue from 'vue'
import App from './components/App'
import './vscode_extension'
import './browser'

new Vue({
    components: { App },
    template: '<App/>'
 }).$mount('#app')
