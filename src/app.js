import {createApp} from 'vue'
import App from './components/App'
import './vscode_extension'
import './browser'

createApp({
    components: { App },
    template: '<App/>'
}).mount('#app')
