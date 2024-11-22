import DatabaseHelper from './DatabaseHelper.mts'
import Utils from '../Utils/Utils.mts'
import Color from '../Constants/ColorConstants.mts'
import {SettingTwitchClient, SettingTwitchTokens} from '../../lib-shared/index.mts'

export default class TwitchTokensHelper {
    /**
     * Load existing tokens for channel and chatbot (if different) and refresh them.
     */
    static async refreshToken() {
        let channelTokenData = await DatabaseHelper.load(new SettingTwitchTokens(), 'Channel')
        if(channelTokenData) await this.refresh(channelTokenData, 'Channel')
        else Utils.log(`TwitchTokens: No tokens for Channel user, load editor to login.`, Color.Purple)
        let chatbotTokenData = await DatabaseHelper.load(new SettingTwitchTokens(), 'Chatbot')
        if(chatbotTokenData) await this.refresh(chatbotTokenData, 'Chatbot')
        else Utils.log(`TwitchTokens: No tokens for Chatbot user, load editor to login.`, Color.Purple)
    }

    private static async refresh(data: SettingTwitchTokens, key: string) {
        const clientData = await DatabaseHelper.load(new SettingTwitchClient(), 'Main')
        const response = await fetch('https://id.twitch.tv/oauth2/token', {
            method: 'post',
            body: new URLSearchParams({
                'grant_type': 'refresh_token',
                'refresh_token': data.refreshToken,
                'client_id': clientData?.clientId ?? '',
                'client_secret': clientData?.clientSecret ?? ''
            })
        })
        const json = await response.json()
        if (!json.error && !(json.status >= 300)) {
            data.accessToken = json.access_token
            data.refreshToken = json.refresh_token
            const success = await DatabaseHelper.save(data, key)
            if(success) console.log(`Successfully refreshed tokens for ${key} and stored them.`);
            else console.error(`Failed to save tokens for ${key}.`);
        } else {
            console.error(`Failed to refresh tokens for ${key}: ${json.status} -> ${json.error}`);
        }
    }
}