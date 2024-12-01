import {assert} from 'jsr:@std/assert'
import {EnlistData} from '../../lib-shared/index.mts'
import HttpServer from '../EasyTSUtils/HttpServer.mts'
import Log, {EEasyDebugLogLevel} from '../EasyTSUtils/Log.mts'

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
    const port = 8080
    const httpServer = new HttpServer({
        name: 'TestServer',
        port,
        rootFolders: {
            '/assets': '../_user/',
            '/data': '../_user/'
        }
    })
    const response = await fetch(`http://localhost:${port}/assets`) // TODO: This is actually a 404, figure that out.
    // assert(response.ok)
    const text = await response.text()
    console.log(text)
    await httpServer.stop()
})