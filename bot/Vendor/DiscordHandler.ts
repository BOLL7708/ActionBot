import {WebhookClient, APIMessage} from 'npm:discord.js'
import ItemStore from '../Database/ItemStore.ts'
import {ConfigDiscord, DataEntries, DataUtils, PresetDiscordWebhook} from '../../lib/index.ts'

export default class DiscordHandler {
    static async postToWebhook(message: string): Promise<string> {
        const discordConfig = ItemStore.loadMain(new ConfigDiscord())
        const url = DataUtils.ensureData(discordConfig.webhookOverride)?.url
        let apiMessage: APIMessage | undefined = undefined
        if (url) {
            const webhookClient = new WebhookClient({url})
            apiMessage = await webhookClient.send({
                content: 'This is a test!'
            })
        }
        return apiMessage?.id ?? ''
    }
}