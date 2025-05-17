import '../Runners/index.mts'
import {assert} from 'jsr:@std/assert'
import {EnlistData} from '../../lib/index.mts'
import HttpServer from '../DenoUtils/HttpServer.mts'
import Log, {ELogLevel} from '../../lib/SharedUtils/Log.mts'

Deno.test('init', () => {
    EnlistData.run()
    Log.setOptions({
        logLevel: ELogLevel.Warning,
        stackLevel: ELogLevel.Warning,
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
        staticApi: {
            root: 'api',
            responses: {
                hello: {message: 'Yes!'}
            }
        },
        loggingProxy: Log.get()
    })

    // region API
    const response = await fetch(`http://localhost:${port}/api/hello`)
    assert(response.ok)
    const json = await response.json()
    console.assert(json.message === 'Yes!')
    // endregion

    await httpServer.stop()
})