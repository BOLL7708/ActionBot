
import {RefreshingAuthProvider} from 'npm:@twurple/auth'
import {SettingTwitchClient, SettingTwitchTokens} from '../../lib/index.mts'
import DatabaseHelper from '../Helpers/DatabaseHelper.mts'

export default class TwitchHandler {
    static auth(): boolean {
        const twitchClient = DatabaseHelper.loadMain(new SettingTwitchClient())
        const clientId = twitchClient.clientId
        const clientSecret = twitchClient.clientSecret

        // TODO: Figure out why the auth-provider does not resolve
        const authProvider = new RefreshingAuthProvider({
            clientId, clientSecret
        })

        // authProvider.onRefresh (await (userId, newTokenData) => {
        //     const tokens = new SettingTwitchTokens()
        //     tokens.userId = userId
        //     tokens.refreshToken = newTokenData.refreshToken
        //     tokens.accessToken = newTokenData.accessToken
        //     DatabaseHelper.saveMain()
        // })
        const twitchTokens = DatabaseHelper.loadMain(new SettingTwitchTokens())
        return false
    }
}