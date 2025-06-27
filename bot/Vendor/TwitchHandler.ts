
import {RefreshingAuthProvider} from 'npm:@twurple/auth'
import {SettingTwitchClient, SettingTwitchTokens} from '../../lib/index.ts'
import ItemStore from '../Database/ItemStore.ts'

export default class TwitchHandler {
    authProvider: RefreshingAuthProvider

    constructor() {
        const twitchClient = ItemStore.loadMain(new SettingTwitchClient())
        const clientId = twitchClient.clientId
        const clientSecret = twitchClient.clientSecret

        this.authProvider = new RefreshingAuthProvider({
            clientId, clientSecret
        })

        this.authProvider.onRefresh ((userId, newTokenData) => {
            const tokens = new SettingTwitchTokens()
            tokens.userId = userId
            tokens.refreshToken = newTokenData.refreshToken ?? ''
            tokens.accessToken = newTokenData.accessToken
            ItemStore.saveMain(tokens)
        })

        // this.authProvider.addUser()
    }

    auth(): boolean {
        const twitchTokens = ItemStore.loadMain(new SettingTwitchTokens())
        return false
    }
}