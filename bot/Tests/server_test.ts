import '../Runners/index.mts'
import {assert} from 'jsr:@std/assert'
import {ConfigAuth, ConfigServer, EnlistData} from '../../lib/index.mts'
import ValueUtils from '../../lib/SharedUtils/ValueUtils.mts'
import WebSocketClient from '../../lib/SharedUtils/WebSocketClient.mts'
import SystemMessage from '../../lib/Types/WebSocket/SystemMessage.ts'
import DatabaseHelper from '../Helpers/DatabaseHelper.mts'
import HttpHandler from '../Server/HttpHandler.mts'
import WebSocketHandler from '../Server/WebSocketHandler.ts'
import TestUtils from '../Utils/TestUtils.mts'

let http: HttpHandler
let ws: WebSocketHandler

Deno.test('init', async () => {
    EnlistData.run()
    await TestUtils.resetDatabases()
    DatabaseHelper.isTesting = true

    // Save server settings that will not conflict with any running dev environment
    DatabaseHelper.saveMain(
        new ConfigServer(
            8079,
            7707
        )
    )

    // Save auth for tests
    const salt = ValueUtils.generateSalt()
    const saltStr = ValueUtils.encodeBytes(salt, true)
    const password = 'test'
    const passwordHash = await ValueUtils.hashPassword(password, salt, true)
    const config = new ConfigAuth()
    config.username = 'test'
    config.passwordSalt = saltStr
    config.passwordHash = passwordHash

    const key = DatabaseHelper.saveMain(config)
    assert(key)
})
Deno.test('auth', async () => {
    const prr = Promise.withResolvers()
    const configServer = DatabaseHelper.loadMain(new ConfigServer())

    // Launch servers
    http = new HttpHandler()
    ws = new WebSocketHandler()

    // Test auth
    const authResponse = await fetch(`http://localhost:${configServer.httpPort}/api/salt`, {
        headers: { Authorization: `Bearer ${ValueUtils.safeBase64Encode('test')}` }
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
            console.log('incoming', message.data)
            assert(JSON.parse(message.data).action === 'pong')
            prr.resolve(undefined)
        },
        onError: (error) => {
            console.error('WebSocket error:', error)
        },
        onClose: () => {
            console.log('WebSocket connection closed')
        },
        onOpen: () => {
            console.log('WebSocket connection opened')
        },
        subprotocolValues: ['system', passwordHash]
    })
    wsc.init()
    const msg = new SystemMessage()
    msg.action = 'ping'
    console.log('outgoing', JSON.stringify(msg))
    wsc.send(msg)

    await prr.promise

    // Shut down
    wsc.disconnect()
    http.stop()
    await ws.stop()
    DatabaseHelper.closeConnection()
})