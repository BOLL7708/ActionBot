import {assert, assertEquals} from 'jsr:@std/assert'
import Log, {EEasyDebugLogLevel} from '../../bot/EasyTSUtils/Log.mts'
import WebSocketClient from '../../bot/EasyTSUtils/WebSocketClient.mts'
import WebSocketServer, {EWebSocketServerState} from '../../bot/EasyTSUtils/WebSocketServer.mts'
import DataBaseHelper from '../../bot/Helpers/DataBaseHelper.mts'

Deno.test('init', () => {
    DataBaseHelper.isTesting = true
    Log.setOptions({
        logLevel: EEasyDebugLogLevel.Warning,
        useColors: true,
        capitalizeTag: false,
        tagPrefix: '[',
        tagPostfix: '] '
    })
})

Deno.test('server + client', async (t) => {
    const r = Promise.withResolvers()
    let resolveCount = 0
    const resolve = ()=>{
        if(++resolveCount == 2) r.resolve(undefined)
    }

    const wsSrv = new WebSocketServer({
        name: 'Test',
        port: 7713,
        keepAlive: true,
        onServerEvent: (state, value, session) => {
            switch (state) {
                case EWebSocketServerState.ClientConnected: {
                    const sessionId = session?.sessionId ?? ''
                    t.step('first -> cli', () => {
                        wsSrv.sendMessage('first', sessionId)
                    })
                    break
                }
                case EWebSocketServerState.Error: {
                    console.log('error', value)
                    assert(false)
                }
            }
        },
        onMessageReceived: (message, session) => {
            assertEquals(session.subProtocols[0], 'deno.test')
            assertEquals(session.subProtocols[1], 'password12345')
            switch (message) {
                case 'one': {
                    t.step('second -> cli', ()=>{
                        wsSrv.sendMessage('second', session.sessionId)
                    })
                    break
                }
                case 'two': {
                    t.step('third -> cli', ()=>{
                        wsSrv.sendMessage('third', session.sessionId)
                    })
                    break
                }
                case 'three': {
                    t.step('terminate -> 💥', ()=>{
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
        }
    })

    const wsClient = new WebSocketClient({
        clientName: 'I test',
        serverUrl: 'ws://localhost:7713',
        onMessage: (message: MessageEvent) => {
            switch (message.data) {
                case 'first': {
                    t.step('srv <- first', ()=>{
                        wsClient.send('one')
                    })
                    break
                }
                case 'second': {
                    t.step('srv <- second', ()=>{
                        wsClient.send('two')
                    })
                    break
                }
                case 'third': {
                    t.step('srv <- third', ()=>{
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
        subProtocolValues: ['deno.test', 'password12345']
    })
    wsClient.init()

    await r.promise
})
