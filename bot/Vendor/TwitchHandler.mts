
import {RefreshingAuthProvider} from 'npm:@twurple/auth'
import {SettingTwitchClient, SettingTwitchTokens} from '../../lib/index.mts'
import DatabaseHelper from '../Helpers/DatabaseHelper.mts'

export default class TwitchHandler {
    authProvider: RefreshingAuthProvider

    constructor() {
        const twitchClient = DatabaseHelper.loadMain(new SettingTwitchClient())
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
            DatabaseHelper.saveMain(tokens)
        })

        // this.authProvider.addUser()
    }

    auth(): boolean {
        const twitchTokens = DatabaseHelper.loadMain(new SettingTwitchTokens())
        return false
    }
}