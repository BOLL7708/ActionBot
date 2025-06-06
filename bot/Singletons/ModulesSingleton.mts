import HttpHandler from '../Server/HttpHandler.mts'
import WebSocketHandler from '../Server/WebSocketHandler.ts'

/**
 * Contains instances of various modules
 */
export default class ModulesSingleton {
    private static _instance: ModulesSingleton;
    private constructor() {}
    public static getInstance(): ModulesSingleton {
        if (!this._instance) this._instance = new ModulesSingleton();
        return this._instance;
    }
    // region Servers
    public http = new HttpHandler()
    public ws = new WebSocketHandler()
    // endregion

    // endregion
}