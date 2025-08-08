import HttpHandler from '../Server/HttpHandler.ts'
import WebSocketHandler from '../Server/WebSocketHandler.ts'

/**
 * Contains instances of various modules that are instantiated once.
 */
export default class Modules {
    static #instance: Modules|undefined
    static #isInternal: boolean = false

    private constructor() {
        if (!Modules.#isInternal) throw new TypeError('Class is not constructable.')
        Modules.#isInternal = false
    }

    /**
     * Get available modules.
     * If this hasn't been called before, it will instantiate all included modules.
     */
    static get(): Modules {
        if (!this.#instance) {
            this.#isInternal = true
            this.#instance = new Modules()
        }
        return this.#instance
    }

    /**
     * Will deallocate and recreate the stored instance.
     * This is used to reload various settings that are loaded on first instantiation.
     */
    static getNew(): Modules {
        this.#isInternal = true
        this.#instance = undefined // TODO: Hopefully this will deallocate everything, test it. Should be run before reloading bot config.
        this.#instance = new Modules()
        return this.#instance
    }

    // region Modules
    // region Servers
    http = new HttpHandler()
    ws = new WebSocketHandler()
    // endregion
    // endregion
}