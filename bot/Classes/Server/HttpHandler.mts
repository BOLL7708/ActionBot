import {ConfigServer} from '../../../lib-shared/Objects/Data/Config/ConfigServer.mts'
import HttpServer from '../../EasyTSUtils/HttpServer.mts'
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
            }
        })
    }

    public stop() {
        this._server.stop().then()
    }
}