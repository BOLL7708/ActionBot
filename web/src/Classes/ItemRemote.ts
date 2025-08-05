import ItemHelper, {type AbstractItemHelper} from '../../../lib/Classes/ItemHelper.ts'
import DatabaseRequest from '../../../lib/Messages/WebSocket/Database/Inbound/DatabaseRequest.ts'
import type DatabaseResponse from '../../../lib/Messages/WebSocket/Database/Outbound/DatabaseResponse.ts'
import type {AbstractItem} from '../../../lib/Objects/AbstractItem.ts'
import type {TClassConstructor} from '../../../lib/SharedUtils/LanguageTypes.ts'
import Log from '../../../lib/SharedUtils/Log.ts'
import WebSocketClient from '../../../lib/SharedUtils/WebSocketClient.ts'
import type {IJsonStore} from '../../../lib/Types/Database.ts'
import WebSocketClients from './WebSocketClients.ts'

export default class ItemRemote implements AbstractItemHelper {
    static #instance: ItemRemote | undefined
    static #isInternal: boolean = false

    #tag = this.constructor.name

    /**
     * This is a singleton only due to implementing abstract methods, which cannot be static.
     */
    static get do(): ItemRemote {
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

    // region Base
    async load<T extends AbstractItem>(classConstructor: TClassConstructor<T>, keyOrId: string | number): Promise<T> {
        if (this.#db === undefined) {
            Log.e(this.#tag, `Database is not initialized.`)
            return new classConstructor()
        }

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

    async save<T extends AbstractItem>(item: T, keyOrParentId: string | number, rowId?: number): Promise<number> {
        if (this.#db === undefined) {
            Log.e(this.#tag, `Database is not initialized.`)
            return -1
        }

        const request = new DatabaseRequest()
        request.action = 'save'
        request.messageId = this.#db.getNextMessageId()
        request.groupClass = item.constructor.name
        if(rowId) request.rowId = rowId
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
        Log.e(this.#tag, `Failed to save.`)
        return -1
    }

    async delete(rowId: number|number[]): Promise<number> {
        if (this.#db === undefined) {
            Log.e(this.#tag, `Database is not initialized.`)
            return -1
        }

        const request = new DatabaseRequest()
        request.action = 'delete'
        request.messageId = this.#db.getNextMessageId()
        if(Array.isArray(rowId)) {
            request.rowIds = rowId
        } else {
            request.rowId = rowId
        }
        const response = await this.#db.sendMessageWithPromise<DatabaseResponse>(request, request.messageId)
        if (response) {
            return response.deleteCount
        }

        Log.w(this.#tag, `Did not find anything to delete.`)
        return -1
    }

    // endregion

    // region Convenience
    async loadMain<T extends AbstractItem>(classConstructor: TClassConstructor<T>): Promise<T> {
        return await this.load(classConstructor, ItemHelper.mainKey)
    }

    async saveMain<T extends AbstractItem>(item: T): Promise<number> {
        return await this.save(item, ItemHelper.mainKey)
    }

    // endregion
}