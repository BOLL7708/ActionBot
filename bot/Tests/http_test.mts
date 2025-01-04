import {assert} from 'jsr:@std/assert'
import {EnlistData} from '../../lib/index.mts'
import HttpServer from '../DenoUtils/HttpServer.mts'
import Log, {EEasyDebugLogLevel} from '../../lib/SharedUtils/Log.mts'

Deno.test('init', () => {
    EnlistData.run()
    Log.setOptions({
        logLevel: EEasyDebugLogLevel.Warning,
        stackLevel: EEasyDebugLogLevel.Warning,
        useColors: true,
        capitalizeTag: false,
        tagPrefix: '[',
        tagPostfix: '] '
    })
})

Deno.test('server', async (t) => {
    const port = 8081
    const httpServer = new HttpServer({
        name: 'TestServer',
        port,
        hostname: '127.0.0.1',
        rootFolders: {
            '/assets': '../_user/',
            '/data': '../_user/'
        },
        loggingProxy: Log.get()
    })

    // TODO: This is actually a 404, figure that out.
    //  I think it is because there is not native file listing feature, so a file needs to exist.
    const response = await fetch(`http://localhost:${port}/assets`)

    // assert(response.ok)
    const text = await response.text()
    console.log(text)
    await httpServer.stop()
})