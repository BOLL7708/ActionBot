import {assert} from 'jsr:@std/assert'
import {ConfigAuth, ConfigServer} from '../../../lib/index.ts'
import SystemMessage from '../../../lib/Messages/WebSocket/SystemMessage.ts'
import Log from '../../../lib/SharedUtils/Log.ts'
import ValueUtils from '../../../lib/SharedUtils/ValueUtils.ts'
import WebSocketClient from '../../../lib/SharedUtils/WebSocketClient.ts'
import ItemStore from '../../Database/ItemStore.ts'
import JsonStore from '../../Database/JsonStore.ts'
import HttpHandler from '../../Server/HttpHandler.ts'
import WebSocketHandler from '../../Server/WebSocketHandler.ts'
import TestUtils from '../../Utils/TestUtils.ts'

let http: HttpHandler
let ws: WebSocketHandler
const tag = import.meta.filename ?? 'tag'

Deno.test('init', async () => {
    TestUtils.truncateDatabase()
    JsonStore.isTesting = true

    // Save server settings that will not conflict with any running dev environment
    const configServer = new ConfigServer()
    configServer.httpPort = 8079
    configServer.webSocketPort = 7707
    ItemStore.saveMain(configServer)

    // Save auth for tests
    const salt = ValueUtils.generateSalt()
    const saltStr = ValueUtils.encodeBytes(salt, true)
    const password = 'test'
    const passwordHash = await ValueUtils.hashPassword(password, salt, true)
    const config = new ConfigAuth()
    config.username = 'test'
    config.passwordSalt = saltStr
    config.passwordHash = passwordHash

    const key = ItemStore.saveMain(config)
    assert(key)
})
Deno.test('auth', async () => {
    const prr = Promise.withResolvers()
    const configServer = ItemStore.loadMain(ConfigServer)

    // Launch servers
    http = new HttpHandler()
    ws = new WebSocketHandler()

    // Test auth
    const authResponse = await fetch(`http://localhost:${configServer.httpPort}/api/salt`, {
        headers: {Authorization: `Bearer ${ValueUtils.safeBase64Encode('test')}`}
    })
    assert(authResponse.ok)
    const json = await authResponse.json()
    const passwordHash = await ValueUtils.hashPassword(
        'test',
        ValueUtils.decodeBytes(json.salt),
        true
    )
    assert(passwordHash.length > 0)
    const wsc = new WebSocketClient({
        clientName: 'Test Client',
        messageQueueing: true,
        serverUrl: `ws://localhost:${configServer.webSocketPort}`,
        onMessage: (message) => {
            assert(JSON.parse(message.data).action === 'pong')
            prr.resolve(undefined)
        },
        onError: (error) => {
            Log.e(tag, 'WebSocket error:', error)
        },
        onClose: () => {
            Log.i(tag, 'WebSocket connection closed')
        },
        onOpen: () => {
            Log.i(tag, 'WebSocket connection opened')
        },
        subprotocolValues: ['system', passwordHash]
    })
    wsc.init()
    const msg = new SystemMessage()
    msg.action = 'ping'
    wsc.send(msg)

    await prr.promise

    // Shut down
    wsc.disconnect()
    http.stop()
    await ws.stop()
    JsonStore.closeConnection()
})