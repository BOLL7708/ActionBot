import '../../Runners/index.ts'
import {assert, assertEquals} from 'jsr:@std/assert'
import Log from '../../../lib/SharedUtils/Log.ts'
import WebSocketClient from '../../../lib/SharedUtils/WebSocketClient.ts'
import WebSocketServer, {EWebSocketServerState} from '../../DenoUtils/WebSocketServer.ts'

const tag = import.meta.filename ?? 'tag'

Deno.test('server + client', async (t) => {
    const subprotocolValues = ['deno.test', 'password12345']
    const r = Promise.withResolvers()
    let resolveCount = 0
    const resolve = () => {
        if (++resolveCount == 2) r.resolve(undefined)
    }

    const wsSrv = new WebSocketServer({
        name: 'Test',
        port: 7713,
        hostname: '127.0.0.1',
        keepAlive: true,
        onServerEvent: (state, value, session) => {
            switch (state) {
                case EWebSocketServerState.ClientConnected: {
                    const sessionId = session?.sessionId ?? ''
                    t.step('first -> cli', () => {
                        wsSrv.sendMessage('first', sessionId, [])
                    })
                    break
                }
                case EWebSocketServerState.Error: {
                    Log.e(tag, 'error', value)
                    assert(false)
                }
            }
        },
        onMessageReceived: (message, session) => {
            assertEquals(session.subprotocols[0], 'deno.test')
            assertEquals(session.subprotocols[1], 'password12345')
            switch (message) {
                case 'one': {
                    t.step('second -> cli', () => {
                        wsSrv.sendMessage('second', session.sessionId, subprotocolValues)
                    })
                    break
                }
                case 'two': {
                    t.step('third -> cli', () => {
                        wsSrv.sendMessage('third', session.sessionId, subprotocolValues)
                    })
                    break
                }
                case 'three': {
                    t.step('terminate -> 💥', () => {
                        wsSrv.disconnectSession(session?.sessionId ?? '')
                        wsSrv.shutdown()
                    })
                    resolve()
                    break
                }
                default: {
                    assert(false)
                }
            }
        },
        loggingProxy: Log.get()
    })

    const wsClient = new WebSocketClient({
        clientName: 'I test',
        serverUrl: 'ws://localhost:7713',
        onMessage: (message: MessageEvent) => {
            switch (message.data) {
                case 'first': {
                    t.step('srv <- first', () => {
                        wsClient.send('one')
                    })
                    break
                }
                case 'second': {
                    t.step('srv <- second', () => {
                        wsClient.send('two')
                    })
                    break
                }
                case 'third': {
                    t.step('srv <- third', () => {
                        wsClient.send('three')
                    })
                    break
                }
            }
        },
        onClose: () => {
            wsClient.disconnect()
            resolve()
        },
        subprotocolValues: subprotocolValues
    })
    wsClient.init()

    await r.promise
})
