import ItemHelper, {type AbstractItemHelper} from '../../../lib/Classes/ItemHelper.ts'
import DatabaseRequest from '../../../lib/Messages/WebSocket/Database/Inbound/DatabaseRequest.ts'
import type DatabaseResponse from '../../../lib/Messages/WebSocket/Database/Outbound/DatabaseResponse.ts'
import type {AbstractItem} from '../../../lib/Objects/AbstractItem.ts'
import type {TClassConstructor} from '../../../lib/SharedUtils/LanguageTypes.ts'
import WebSocketClient from '../../../lib/SharedUtils/WebSocketClient.ts'
import type {IJsonStore} from '../../../lib/Types/Database.ts'
import WebSocketClients from './WebSocketClients.ts'

export default class ItemRemote implements AbstractItemHelper {
    static #instance: ItemRemote | undefined
    static #isInternal: boolean = false

    static get run(): ItemRemote {
        if (this.#instance == undefined) {
            this.#isInternal = true
            this.#instance = new ItemRemote()
        }
        return this.#instance
    }

    #db: WebSocketClient | undefined = undefined

    private constructor() {
        if (!ItemRemote.#isInternal) throw new TypeError('Class is not constructable.')
        ItemRemote.#isInternal = false
        this.#db = WebSocketClients.database
        this.#db?.init()
    }

    async load<T extends AbstractItem>(classConstructor: TClassConstructor<T>, keyOrId: string | number): Promise<T> {
        if (this.#db === undefined) return new classConstructor()

        const request = new DatabaseRequest()
        request.action = 'load'
        request.messageId = this.#db.getNextMessageId()
        request.groupClass = classConstructor.name
        switch (typeof keyOrId) {
            case 'string':
                request.groupKey = keyOrId
                break
            case 'number':
                request.rowId = keyOrId
                break
        }
        const response = await this.#db.sendMessageWithPromise<DatabaseResponse>(request, request.messageId)
        if (response) {
            if (response.items) {
                const item = ItemHelper.recreateWithChildren<T>(response.items as IJsonStore[])
                if (item) return item
            }
        }
        return new classConstructor()
    }

    async save<T extends AbstractItem>(item: T, keyOrParentId: string | number): Promise<number> {
        if (this.#db === undefined) return -1

        const request = new DatabaseRequest()
        request.action = 'save'
        request.messageId = this.#db.getNextMessageId()
        request.groupClass = item.constructor.name
        switch (typeof keyOrParentId) {
            case 'string':
                request.groupKey = keyOrParentId
                break
            case 'number':
                request.parentId = keyOrParentId
                break
        }
        request.data = item
        const response = await this.#db.sendMessageWithPromise<DatabaseResponse>(request, request.messageId)
        if (response) {
            return response.savedRowId
        }
        return -1
    }

    async loadMain<T extends AbstractItem>(classConstructor: TClassConstructor<T>): Promise<T> {
        return await this.load(classConstructor, ItemHelper.mainKey)
    }

    async saveMain<T extends AbstractItem>(item: T): Promise<number> {
        return await this.save(item, ItemHelper.mainKey)
    }

    async delete(rowId: number): Promise<number> {
        if (this.#db === undefined) return -1

        const request = new DatabaseRequest()
        request.action = 'delete'
        request.messageId = this.#db.getNextMessageId()
        request.rowId = rowId
        const response = await this.#db.sendMessageWithPromise<DatabaseResponse>(request, request.messageId)
        if (response) {
            return response.deleteCount
        }
        return -1
    }
}