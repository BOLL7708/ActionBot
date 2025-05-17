import '../Runners/index.mts'
import {assert, assertEquals} from 'jsr:@std/assert'
import {EnlistData} from '../../lib/index.mts'
import ValueUtils from '../../lib/SharedUtils/ValueUtils.mts'
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
    const salt = ValueUtils.encodeSalt(ValueUtils.generateSalt())
    const port = 8081
    const httpServer = new HttpServer({
        name: 'TestServer',
        port,
        hostname: '127.0.0.1',
        rootFolders: {
            '/assets': '../_user/',
            '/data': '../_user/'
        },
        simpleApi: {
            root: 'api',
            responses: {
                first: {message: 'one'},
                second: ()=>{ return {message: 'two'}},
                third: (request: Request) => {
                    const authHeader = request.headers.get('Authorization')
                    if (authHeader) {
                        const [_label, saltStr] = authHeader.split(' ')
                        assertEquals(salt, saltStr)
                        return {message: `three`}
                    } else {
                        return {message: 'error'}
                    }
                }
            }
        },
        loggingProxy: Log.get()
    })

    // region API
    const staticResponse = await fetch(`http://localhost:${port}/api/first`)
    assert(staticResponse.ok)
    const staticJson = await staticResponse.json()
    assertEquals(staticJson.message, 'one')

    const dynamicResponse = await fetch(`http://localhost:${port}/api/second`)
    assert(dynamicResponse.ok)
    const dynamicJson = await dynamicResponse.json()
    assertEquals(dynamicJson.message, 'two')
    
    const requestResponse = await fetch(
        `http://localhost:${port}/api/third`, {
            headers: {'Authorization': `Bearer ${salt}`}
        })
    assert(requestResponse.ok)
    const requestJson = await requestResponse.json()
    assertEquals(requestJson.message, 'three')
    // endregion

    await httpServer.stop()
})