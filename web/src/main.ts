import {mount} from 'svelte'
import './app.css'
import Log, {ELogLevel} from '../../lib/SharedUtils/Log.mjs'
import App from './App.svelte'

Log.setLogLevel(ELogLevel.Verbose)

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
