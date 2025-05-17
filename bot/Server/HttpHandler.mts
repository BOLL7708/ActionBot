import {ConfigAuth, ConfigServer} from '../../lib/index.mts'
import Log from '../../lib/SharedUtils/Log.mts'
import ValueUtils from '../../lib/SharedUtils/ValueUtils.mts'
import HttpServer from '../DenoUtils/HttpServer.mts'
import DatabaseHelper from '../Helpers/DatabaseHelper.mts'

interface IFakeSaltItem {
    username: string
    salt: string
}

interface ISaltResponse {
    salt: string
}

interface IErrorResponse {
    error: string
}

export default class HttpHandler {
    private _server: HttpServer
    private _fakeSaltCache: IFakeSaltItem[] = []
    constructor() {
        const TAG = this.constructor.name
        Log.w(TAG, 'Starting HTTP server')
        const config = DatabaseHelper.loadMain(new ConfigServer())
        this._server = new HttpServer({
            name: 'Static Files',
            port: config.httpPort,
            hostname: '0.0.0.0', // Any host and interface
            rootFolders: {
                '/assets': '../_user',
                '/data': '../_user',
                '/test': '../web',
                '/': '../web/dist'
            },
            simpleApi: {
                root: 'api',
                responses: {
                    salt: (request: Request) => {
                        // Get the Authorization header and extract the Bearer value,
                        // decide the base64 string and match it against the username
                        // in the ConfigAuth object.
                        const header = request.headers.get('Authorization')
                        let salt = ''
                        if(header) {
                            const [bearer, b64str] = header.split(' ')
                            if(bearer === 'Bearer') {
                                const username = ValueUtils.safeBase64Decode(b64str)
                                if(!username) {
                                    const response: IErrorResponse = { error: 'Invalid bearer value' }
                                    return response
                                }
                                const configAuth = DatabaseHelper.loadMain(new ConfigAuth())
                                if(username == configAuth.username) {
                                    // We have a match, use real salt
                                    Log.i(TAG, 'Using real salt for', username)
                                    salt = configAuth.passwordSalt
                                } else {
                                    const fakeSaltItem = this._fakeSaltCache.find(it => it.username == username)
                                    if(fakeSaltItem) {
                                        // We have a fake salt, use it
                                        Log.i(TAG, 'Using fake salt for', username)
                                        salt = fakeSaltItem.salt
                                    } else {
                                        // We don't have a fake salt, create one
                                        const fakeSalt = ValueUtils.generateSalt()
                                        const fakeSaltStr = ValueUtils.encodeSalt(fakeSalt)
                                        this._fakeSaltCache.push({
                                            username: username,
                                            salt: fakeSaltStr
                                        })
                                        Log.i(TAG, 'Using new fake salt for', username)
                                        // Limit the cache size
                                        if(this._fakeSaltCache.length > 32) this._fakeSaltCache.shift()
                                        salt = fakeSaltStr
                                    }
                                }
                            } else {
                                const response: IErrorResponse = { error: 'Invalid authorization header' }
                                return response
                            }
                        }
                        if(!ValueUtils.isBlank(salt)) {
                            const response: ISaltResponse = { salt }
                            return response
                        }
                        const response: IErrorResponse = { error: 'Authorization header missing' }
                        return response
                    }
                }
            },
            loggingProxy: Log.get()
        })
    }

    public stop() {
        this._server.stop().then()
    }
}
