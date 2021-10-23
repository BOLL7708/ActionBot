interface IDiscordConfig {
    remoteScreenshotEmbedColor: string
    manualScreenshotEmbedColor: string
    webhooks: IDiscordWebhookConfig
    prefixCheer: string
    prefixReward: string
}
interface IDiscordWebhookConfig {
    [key: string]: string
}

// https://discord.com/developers/docs/resources/webhook#execute-webhook
interface IDiscordWebookPayload {
    content?: string // content, file or embeds
    username?: string
    avatar_url?: string
    tts?: boolean
    file?: any // // content, file or embeds
    embeds?: IDiscordEmbed[] // // content, file or embeds (up to 10)
    payload_json?: string // multipart/form-data JSON encoded body of non-file params
    allowed_mentions?: any // TODO
    components?: any // TODO
}
// https://discord.com/developers/docs/resources/channel#embed-object
interface IDiscordEmbed {
    title?: string
    type?: string // Always "rich" for webhooks
    description?: string
    url?: string
    timestamp?: string // ISO8601 timestamp
    color?: number
    footer?: IDiscordEmbedFooter
    image?: IDiscordEmbedMedia
    thumbnail?: IDiscordEmbedMedia
    video?: IDiscordEmbedMedia
    provider?: IDiscordEmbedProvider
    author?: IDiscordEmbedAuthor
    fields?: IDiscordEmbedField[]
}
interface IDiscordEmbedFooter {
    text: string
    icon_url?: string
    proxy_icon_uri?: string
}
interface IDiscordEmbedMedia {
    url: string
    proxy_url?: string
    height?: number
    width?: number
}
interface IDiscordEmbedProvider {
    name?: string
    url?: string
}
interface IDiscordEmbedAuthor {
    name: string
    url?: string
    icon_url?: string
    proxy_icon_url? : string
}
// https://discord.com/developers/docs/resources/channel#embed-object-embed-field-structure
interface IDiscordEmbedField {
    name: string
    value: string
    inline?: boolean
}