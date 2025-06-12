import DatabaseRequest from '../../../lib/Messages/WebSocket/Database/Inbound/DatabaseRequest.ts'
import type DatabaseResponse from '../../../lib/Messages/WebSocket/Database/Outbound/DatabaseResponse.ts'
import {AbstractData} from '../../../lib/Objects/Data/AbstractData.js'
import ValueUtils from '../../../lib/SharedUtils/ValueUtils.ts'
import WebSocketFactory from './WebSocketFactory.ts'

/** TODO: UNTESTED */
AbstractData.prototype.__applyAsync = async function (
    instanceOrParsedJson: object = {},
    replaceIdsWithItems: boolean
): Promise<void> {
    const gen = AbstractData.__applyGenerator(
        this,
        instanceOrParsedJson,
        replaceIdsWithItems
    )
    let result = gen.next()
    while (!result.done) {
        const db = WebSocketFactory.getDatabaseClient() // TODO: Check if connected? Or just wait for it to connect?
        const request = new DatabaseRequest()
        request.messageId = db.getNextMessageId()
        request.rowId = ValueUtils.ensureNumber(result.value.id)
        const response = await db.sendMessageWithPromise<DatabaseResponse>(request, request.messageId)

        // TODO: Should be OK before this, not sure after...

        console.log('ABSTRACT DATA RUNNER', {response})
        const jsonStr = ValueUtils.safeBase64Decode(response?.dataJsonBase64 ?? '')
        result = gen.next(ValueUtils.safeJsonParse<any[]>(jsonStr))
    }
}