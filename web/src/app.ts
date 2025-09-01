import '../../lib/index.ts'
import {type Component, mount} from 'svelte'
import './app.css'
import Log, {ELogLevel} from '../../lib/SharedUtils/Log.js'
import ValueUtils from '../../lib/SharedUtils/ValueUtils.js'
import Dashboard from './Dashboard.svelte'
import Editor from './Editor.svelte'
import Events from './Events.svelte'
import Presenter from './Presenter.svelte'
import Setup from './Setup.svelte'
import Start from './Start.svelte'

Log.setLogLevel(ELogLevel.Verbose) // TODO: Log level is verbose for development

// Load different modules based on the hash of the URL that launched this page.
let hash = window.location.hash.slice(1).toLowerCase()
let module: Component
switch (hash) {
    case 'setup': module = Setup; break
    case 'editor': module = Editor; break
    case 'events': module = Events; break
    case 'dashboard': module = Dashboard; break
    case 'presenter': module = Presenter; break
    default:
        module = Start
        hash = 'start'
}
window.document.title = 'ActionBot > '+ValueUtils.capitalizeFirstLetter(hash)
const app = mount(module, {
    target: document.getElementById('app')!
})

export default app
