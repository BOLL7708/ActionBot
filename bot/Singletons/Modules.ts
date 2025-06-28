import HttpHandler from '../Server/HttpHandler.ts'
import WebSocketHandler from '../Server/WebSocketHandler.ts'

/**
 * Contains instances of various modules
 */
export default class Modules {
    static #instance: Modules
    static #isInternal: boolean = false

    private constructor() {
        if (!Modules.#isInternal) throw new TypeError('Class is not constructable.')
        Modules.#isInternal = false
    }

    static get(): Modules {
        if (!this.#instance) {
            this.#isInternal = true
            this.#instance = new Modules()
        }
        return this.#instance
    }

    // region Servers
    http = new HttpHandler()
    ws = new WebSocketHandler()
    // endregion
}