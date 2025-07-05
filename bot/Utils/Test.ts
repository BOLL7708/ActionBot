import {ConfigAuth} from '../../lib/Objects/Item/Config/ConfigAuth.ts'
import {ConfigServer} from '../../lib/Objects/Item/Config/ConfigServer.ts'
import ValueUtils from '../../lib/SharedUtils/ValueUtils.ts'
import ItemStore from '../Database/ItemStore.ts'
import JsonStore from '../Database/JsonStore.ts'
import _TestContext = Deno.TestContext

export default class Test {
    /** This wraps Deno.test to apply settings for testing */
    static run(name: string, fn: (t: _TestContext) => void | Promise<void>): void {
        // TODO: Can do more here like switching which Discord webhooks to use. Yay!
        JsonStore.isTesting = true
        Deno.test(name, fn)
    }

    /**
     * Sets the JsonStore to be in testing mode.
     * Deletes every single row in the JsonStore.
     */
    static truncateData(): boolean {
        JsonStore.isTesting = true
        return JsonStore.deleteAll()
    }

    /**
     * Sets the JsonStore to be in testing mode.
     * Create server settings and auth for user `test:test`
     */
    static async initializeData(): Promise<boolean> {
        JsonStore.isTesting = true

        // Save server settings that will not conflict with any running dev environment
        const configServer = new ConfigServer()
        configServer.httpPort = 8079
        configServer.webSocketPort = 7707
        ItemStore.do.saveMain(configServer)

        // Save auth for tests
        const salt = ValueUtils.generateSalt()
        const saltStr = ValueUtils.encodeBytes(salt, true)
        const password = 'test'
        const passwordHash = await ValueUtils.hashPassword(password, salt, true)
        const config = new ConfigAuth()
        config.username = 'test'
        config.passwordSalt = saltStr
        config.passwordHash = passwordHash

        return ItemStore.do.saveMain(config) > 0
    }
}
