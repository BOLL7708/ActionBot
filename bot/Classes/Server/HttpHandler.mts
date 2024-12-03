import {ConfigServer} from '../../../lib/Objects/Data/Config/ConfigServer.mts'
import Log from '../../../lib/SharedUtils/Log.mts'
import HttpServer from '../../DenoUtils/HttpServer.mts'
import DatabaseHelper from '../../Helpers/DatabaseHelper.mts'

export default class HttpHandler {
    private _server: HttpServer
    constructor() {
        const config = DatabaseHelper.loadMain(new ConfigServer())
        this._server = new HttpServer({
            name: 'Static Files',
            port: config.httpServerPort,
            rootFolders: {
                '/assets': '../_user',
                '/data': '../_user',
                '/test': '../web',
                '/': '../web/dist'
            },
            loggingProxy: Log.get()
        })
    }

    public stop() {
        this._server.stop().then()
    }
}