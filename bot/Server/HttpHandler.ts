import {ConfigAuth, ConfigServer} from '../../lib/index.ts'
import Log from '../../lib/SharedUtils/Log.ts'
import ValueUtils from '../../lib/SharedUtils/ValueUtils.ts'
import HttpServer from '../DenoUtils/HttpServer.ts'
import ItemStore from '../Database/ItemStore.ts'

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
    #server: HttpServer
    #fakeSaltCache: IFakeSaltItem[] = []
    #tag = this.constructor.name
    constructor() {
        const config = ItemStore.do.loadMain(ConfigServer)
        this.#server = new HttpServer({
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
                                if(!username || typeof username !== 'string') {
                                    const response: IErrorResponse = { error: 'Invalid bearer value' }
                                    return response
                                }
                                const configAuth = ItemStore.do.loadMain(ConfigAuth)
                                if(username == configAuth.username) {
                                    // We have a match, use real salt
                                    Log.i(this.#tag, 'Using real salt for', username)
                                    salt = configAuth.passwordSalt
                                } else {
                                    const fakeSaltItem = this.#fakeSaltCache.find(it => it.username == username)
                                    if(fakeSaltItem) {
                                        // We have a fake salt, use it
                                        Log.i(this.#tag, 'Using fake salt for', username)
                                        salt = fakeSaltItem.salt
                                    } else {
                                        // We don't have a fake salt, create one
                                        const fakeSalt = ValueUtils.generateSalt()
                                        const fakeSaltStr = ValueUtils.encodeBytes(fakeSalt)
                                        this.#fakeSaltCache.push({
                                            username: username,
                                            salt: fakeSaltStr
                                        })
                                        Log.i(this.#tag, 'Using new fake salt for', username)
                                        // Limit the cache size
                                        if(this.#fakeSaltCache.length > 32) this.#fakeSaltCache.shift()
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
        this.#server.stop().then()
    }
}
