import {ConfigChat, ConfigCommands, ConfigTwitch, DataUtils, IActionUser, SettingTwitchTokens, TriggerCommand, TriggerRemoteCommand} from '../../../lib-shared/index.mts'
import Color from '../../Constants/ColorConstants.mts'
import DatabaseHelper from '../../Helpers/DatabaseHelper.mts'
import TextHelper from '../../Helpers/TextHelper.mts'
import TwitchHelixHelper from '../../Helpers/TwitchHelixHelper.mts'
import StatesSingleton from '../../Singletons/StatesSingleton.mts'
import DiscordUtils from '../../Utils/DiscordUtils.mts'
import Utils from '../../Utils/Utils.mts'
import {ActionHandler, Actions} from '../Actions.mts'
import SessionVars from '../Data/SessionVars.mts'
import TwitchFactory, {ITwitchEmote, ITwitchMessageCmd} from '../Data/TwitchFactory.mts'
import {EEventSource} from '../Enums.mts'
import TwitchChat, {ITwitchChatMessageCallback, ITwitchWhisperMessageCallback} from './TwitchChat.mts'

export default class Twitch{
    // Constants

    /**
     * This [URL]/[Emote ID]/[Resolution], resolution can be 1.0, 2.0 or 3.0.
     */
    static readonly EMOTE_URL = 'https://static-cdn.jtvnw.net/emoticons/v1'
    private _config = new ConfigTwitch()
    private _configChat = new ConfigChat()
    private _configCommands = new ConfigCommands()
    private _twitchChatIn: TwitchChat = new TwitchChat()
    public _twitchChatOut: TwitchChat = new TwitchChat()
    public _twitchChatRemote: TwitchChat = new TwitchChat()
    private LOG_COLOR_COMMAND: string = 'maroon'

    async init(initChat: boolean = true) {
        this._config = await DatabaseHelper.loadMain(new ConfigTwitch())
        this._configChat = await DatabaseHelper.loadMain(new ConfigChat())
        this._configCommands = await DatabaseHelper.loadMain(new ConfigCommands())
        if(initChat) {
            // In/out for chat in the main channel
            const channelTokens = await DatabaseHelper.load<SettingTwitchTokens>(new SettingTwitchTokens(), 'Channel')
            const chatbotTokens = await DatabaseHelper.load<SettingTwitchTokens>(new SettingTwitchTokens(), 'Chatbot')
            this._twitchChatIn.init(channelTokens?.userLogin, channelTokens?.userLogin)
            this._twitchChatOut.init(chatbotTokens?.userLogin, channelTokens?.userLogin, true)

            // Remote command channel
            const remoteChannel = DataUtils.ensureData(this._configCommands.remoteCommandChannel)?.userName ?? ''
            if(remoteChannel.length > 0) this._twitchChatRemote.init(chatbotTokens?.userLogin, remoteChannel)
        }        
        this._twitchChatIn.registerChatMessageCallback((message) => {
            this.onChatMessage(message)
        })
        this._twitchChatRemote.registerChatMessageCallback((message) => {
            this.onRemoteChatMessage(message)
        })
        this._twitchChatOut.registerWhisperMessageCallback((message) => {
            this.onWhisperMessage(message)
        })
    }

    private _globalCooldowns: Map<string, number> = new Map()
    private _userCooldowns: Map<string, number> = new Map()
    private _commands: ITwitchCommand[] = []
    registerCommandTrigger(trigger: TriggerCommand, eventKey: string) {
        if(trigger.entries.length > 0) {
            trigger.entries = trigger.entries.map((entry) => {
                return TextHelper.replaceTags(entry, {eventKey: eventKey}).toLowerCase()
            })
            const actionHandler = new ActionHandler(eventKey)

            // Store the command(s)
            const command = { eventKey, trigger, handler: actionHandler } as ITwitchCommand
            this._commands.push(command)

            // Log the command
            const who: string[] = []
            const permissions = DataUtils.ensureData(command.trigger.permissions)
            if(permissions?.everyone) who.push('everyone')
            else {
                if(permissions?.subscribers) who.push('subs')
                if(permissions?.VIPs) who.push('VIPs')
                if(permissions?.moderators) who.push('mods')
                if(permissions?.streamer) who.push('streamer')
            }
            const message = `Registering command(s): <${command.trigger.entries.join(', ')}> for ${who.join(' + ')}`
            Utils.logWithBold(message, this.LOG_COLOR_COMMAND)
        } else {
            console.warn('Skipped registering a command as no entries!')
        }
    }

    private _remoteGlobalCooldowns: Map<string, number> = new Map()
    private _remoteUserCooldowns: Map<string, number> = new Map()
    private _remoteCommands: ITwitchCommand[] = []
    registerRemoteCommand(triggerRemote: TriggerRemoteCommand, eventKey: string) {
        if(triggerRemote.entries.length != 0) {
            triggerRemote.entries = triggerRemote.entries.map((entry) => {
                return TextHelper.replaceTags(entry, {eventKey: eventKey}).toLowerCase()
            })
            const handler = new ActionHandler(eventKey)

            // Store the command(s)
            const remoteCommand = { eventKey, triggerRemote, handler } as ITwitchCommand
            this._remoteCommands.push(remoteCommand)

            // Log the command
            const message = `Registering remote command: <${remoteCommand.triggerRemote.entries.join(', ')}>`
            Utils.logWithBold(message, this.LOG_COLOR_COMMAND)
        } else {
            Utils.logWithBold('Skipped registering a command!', this.LOG_COLOR_COMMAND)
        }
    }

    private _announcements: ITwitchAnnouncement[] = []
    registerAnnouncers(twitchAnnouncement: ITwitchAnnouncement) {
        this._announcements.push(twitchAnnouncement)
    }

    private _chatCheerCallback: ITwitchChatCheerCallback = (userName, messageData) => { console.warn('Twitch: Unhandled cheer message') }
    setChatCheerCallback(callback: ITwitchChatCheerCallback) {
        this._chatCheerCallback = callback
    }

    private _chatCallback: ITwitchChatCallback = (userData, messageData) => { console.warn('Twitch: Unhandled chat message') }
    setChatCallback(callback: ITwitchChatCallback) {
        this._chatCallback = callback
    }

    private _allChatCallback: ITwitchChatMessageCallback = () => { console.warn('Twitch: Unhandled chat message (all)') }
    setAllChatCallback(callback: ITwitchChatMessageCallback) {
        this._allChatCallback = callback
    }

    private _whisperCallback: ITwitchWhisperMessageCallback = (messageCmd) => {
        // console.warn('Twitch: Unhandled whisper message')
        // Utils.log(`Got whisper: ${messageCmd.message.text}`, Color.Orange, true, true)
        // console.log(messageCmd)
    }
    setWhisperCallback(callback: ITwitchWhisperMessageCallback) {
        this._whisperCallback = callback
    }

    private async onWhisperMessage(messageCmd: ITwitchMessageCmd) {
        await this.onChatMessage(messageCmd, true)
        this._whisperCallback(messageCmd)
    }

    private async onChatMessage(messageCmd: ITwitchMessageCmd, isWhisper: boolean = false) {
        const msg = messageCmd.message
        if(!msg) return
        if(!isWhisper) {
            SessionVars.lastTwitchChatterUserId = messageCmd.properties['user-id']
            SessionVars.lastTwitchChatMessage = messageCmd.message.text
        }
        let userName: string = msg.username?.toLowerCase() ?? ''
        if(userName.length == 0) return
        let userId: number = parseInt(messageCmd.properties['user-id'] ?? '')
        let text: string = msg.text?.trim() ?? ''
        if(text.length == 0) return
        const isBroadcaster = (messageCmd.properties?.badges ?? [] as string[]).indexOf('broadcaster/1') > -1
            || userName === (await DatabaseHelper.load<SettingTwitchTokens>(new SettingTwitchTokens(), 'channel'))?.userLogin
        const isModerator = (
            messageCmd.properties?.mod == '1'
            || (await TwitchHelixHelper.isUserModerator(userId)) // Fallback
        ) && !(
            DataUtils.ensureDataArray(this._configCommands.ignoreModerators) ?? []).map(user => user.userName.toLowerCase()
        ).includes(userName)
        const isVIP = messageCmd.properties?.badges?.match(/\b(vip\/\d+)\b/) != null
            || (await TwitchHelixHelper.isUserVIP(userId)) // Fallback
        const isSubscriber = messageCmd.properties?.badges?.match(/\b(subscriber\/\d+)\b/) != null

        // Chat proxy
        const proxyChatBot = DataUtils.ensureData(this._configChat.proxyChatBotUser)?.userName ?? ''
        if(proxyChatBot.length > 0 && proxyChatBot.toLowerCase() == userName) {
            const matches = text.match(Utils.toRegExp(this._configChat.proxyChatMessageRegex))
            if(matches && matches.length == 4) {
                userName = matches[2].toLowerCase()
                text = matches[3]
                Utils.log(`Got proxy message from ${matches[1]}: ${userName} [${text.length}]`, 'purple')
            }
        }

        // User data for most callbacks
        const user: IActionUser = {
            source: EEventSource.TwitchChat,
            eventKey: 'Unknown',
            id: parseInt(messageCmd.properties["user-id"] ?? ''),
            login: userName,
            name: messageCmd.properties?.["display-name"] ?? userName,
            input: '',
            inputWords: [],
            message: await TextHelper.cleanText(messageCmd.message.text, undefined, TwitchFactory.getEmotePositions(messageCmd.properties.emotes ?? [])),
            color: messageCmd.properties?.color ?? '',
            isModerator: isModerator,
            isVIP: isVIP,
            isSubscriber: isSubscriber,
            isBroadcaster: isBroadcaster,
            bits: parseInt(messageCmd?.properties?.bits ?? '0'),
            bitsTotal: 0,
            rewardCost: 0
        }

        // For logging
        if(!isWhisper) this._allChatCallback(messageCmd)

        // Rewards
        if(typeof messageCmd.properties['custom-reward-id'] === 'string') {
            console.log("Twitch Chat: Skipped as it's a reward.")
            return
        }

        // Commands
        if(text && text.indexOf(this._configCommands.commandPrefix) == 0) {
            const chatbotTokens = await DatabaseHelper.load<SettingTwitchTokens>(new SettingTwitchTokens(), 'Chatbot')
            if(user.login.toLowerCase() == chatbotTokens?.userLogin) {
                Utils.log(`Twitch Chat: Skipped command as it was from the chat bot account. (${user.login} == ${chatbotTokens?.userLogin})`, this.LOG_COLOR_COMMAND)
                return
            }
            let commandStr = text.split(' ').shift()?.substring(1).toLowerCase()
            let command = this._commands.find(cmd => cmd.trigger.entries.includes(commandStr ?? ''))
            let textStr = Utils.splitOnFirst(' ', text).pop()?.trim() ?? ''

            // Word count
            const wordCount = textStr.split(' ').length
            if(command && command.trigger.requireMinimumWordCount && wordCount < command.trigger.requireMinimumWordCount) {
                Utils.log(`Twitch Chat: Skipped command as word count it too low: ${wordCount} < ${command.trigger.requireMinimumWordCount}`, this.LOG_COLOR_COMMAND)
                return
            }
            if(command && command.trigger.requireExactWordCount && wordCount !== command.trigger.requireExactWordCount) {
                Utils.log(`Twitch Chat: Skipped command as word count is incorrect: ${wordCount} != ${command.trigger.requireMinimumWordCount}`, this.LOG_COLOR_COMMAND)
                return
            }

            // Role check
            const permissions = (
                command?.trigger.permissions
                    ? DataUtils.ensureData(command.trigger.permissions)
                    : undefined
                ) ?? DataUtils.ensureData(this._configCommands.defaultCommandPermissions)
            const allowedRole = permissions && (
                (permissions.streamer && isBroadcaster)
                || (permissions.moderators && isModerator)
                || (permissions.VIPs && isVIP)
                || (permissions.subscribers && isSubscriber)
                || permissions.everyone
            )

            // Execute command
            if(command && commandStr && allowedRole) {
                user.input = textStr
                user.inputWords = textStr.split(' ')
                user.source = EEventSource.TwitchCommand
                if(!isWhisper || this._configCommands.allowWhisperCommands) {
                    this.handleCommand(command, user, this._globalCooldowns, this._userCooldowns, isBroadcaster)
                }
                const webhook = DataUtils.ensureData(this._configCommands.logWhisperCommandsToDiscord)
                if(isWhisper && webhook) {
                    const userData = await TwitchHelixHelper.getUserById(user.id)
                    DiscordUtils.enqueueMessage(
                        webhook.url,
                        user.name,
                        userData?.profile_image_url,
                        '**Whisper Command**: '+Utils.escapeForDiscord(user.message)
                    )
                }
                return
            }
        }
        if(isWhisper) return

        const bits = Utils.toInt(messageCmd.properties?.bits, 0)
        const messageData:ITwitchMessageData = {
            text: text,
            bits: bits,
            isAction: msg.isAction,
            emotes: messageCmd.properties?.emotes || []
        }

        const announcement = this._announcements.find(a => a.userNames.includes(userName))
        if(announcement) { // Announcement bots
            const firstWord = text.split(' ')[0]
            if(text.length >= 1 && announcement.triggers.indexOf(firstWord) != -1) return announcement.callback(user, messageData, firstWord)
        } 
        else if(!isNaN(bits) && bits > 0) { // Cheers
            user.source = EEventSource.TwitchCheer
            return this._chatCheerCallback(user, messageData)
        } 
        else { // Normal users
            return this._chatCallback(user, messageData)
        }
    }

    private async onRemoteChatMessage(messageCmd: ITwitchMessageCmd) {
        if(!StatesSingleton.getInstance().runRemoteCommands) return
        const msg = messageCmd.message
        if(!msg) return
        let userName: string = msg.username?.toLowerCase() ?? ''
        if(userName.length == 0) return
        let text: string = msg.text?.trim() ?? ''
        if(text.length == 0) return

        const user = await Actions.buildEmptyUserData(EEventSource.TwitchRemoteCommand, 'Unknown')
        user.login = userName
        user.name = messageCmd.properties?.["display-name"] ?? userName
        user.id = parseInt(messageCmd.properties["user-id"] ?? '')

        // Commands
        if(text && text.indexOf(this._configCommands.remoteCommandPrefix) == 0) {
            let commandStr = text.split(' ').shift()?.substring(1).toLowerCase() ?? ''
            let command = this._remoteCommands.find(cmd => cmd.triggerRemote.entries.includes(commandStr))
            let textStr = Utils.splitOnFirst(' ', text).pop()?.trim() ?? ''

            // User check
            const allowedUsers = DataUtils.ensureDataArray(this._configCommands.remoteCommandAllowedUsers) ?? []
            const allowedUser = allowedUsers.find((user) => user.userName == userName)

            // Execute command
            if(command && commandStr && allowedUser) {
                user.input = textStr
                user.inputWords = textStr.split(' ')
                user.source = EEventSource.TwitchRemoteCommand
                this.handleCommand(command, user, this._remoteGlobalCooldowns, this._remoteUserCooldowns, false)
                return
            }
        }
    }

    /**
     * Will execute the command handler if it is allowed by the cooldowns.
     * @param command
     * @param user
     * @param globalCooldowns
     * @param userCooldowns
     * @param override
     * @private
     */
    private handleCommand(command: ITwitchCommand, user: IActionUser, globalCooldowns: Map<string, number>, userCooldowns: Map<string, number>, override: boolean) {
        const globalCooldown = command.trigger?.globalCooldown ?? command.triggerRemote?.globalCooldown ?? 0
        const userCooldown = command.trigger?.userCooldown ?? command.triggerRemote?.userCooldown ?? 0
        const hasGlobalCooldown = globalCooldown > 0
        const allowedByGlobalCooldown =
            override
            || !hasGlobalCooldown
            || Date.now() > (globalCooldowns.get(command.eventKey) ?? 0)

        const hasUserCooldown = userCooldown > 0
        const cooldownUserKey = `${command.eventKey}_${user.login}`
        const allowedByUserCooldown =
            override
            || !hasUserCooldown
            || Date.now() > (userCooldowns.get(cooldownUserKey) ?? 0)

        // Update user object
        user.eventKey = command.eventKey
        user.commandConfig = command

        // Handle
        if(allowedByGlobalCooldown && allowedByUserCooldown) {
            if(hasGlobalCooldown) globalCooldowns.set(command.eventKey, Date.now()+globalCooldown*1000)
            if(hasUserCooldown) userCooldowns.set(cooldownUserKey, Date.now()+userCooldown*1000)
            command.handler.call(user).then()
        }
    }

    async runCommand(commandStr: string, userData?: IActionUser) {
        Utils.log(`Run command: ${commandStr}`, Color.Purple)
        let command = this._commands.find(cmd => cmd.trigger.entries.includes(commandStr.toLowerCase()))
        if(command?.handler) command.handler.call(userData ?? await Actions.buildEmptyUserData(EEventSource.AutoCommand, 'Unknown')).then()
    }

    async sendRemoteCommand(commandStr: string) {
        this._twitchChatRemote.sendMessageToChannel(commandStr)
    }
}

export interface ITwitchCommand {
    eventKey: string
    trigger: TriggerCommand
    triggerRemote: TriggerRemoteCommand
    handler: ActionHandler
}

export interface ITwitchAnnouncement {
    userNames: string[]
    triggers: string[]
    callback: ITwitchAnnouncementCallback
}

// Callbacks
export interface ITwitchChatCallback {
    (user: IActionUser, messageData: ITwitchMessageData): void
}

export interface ITwitchAnnouncementCallback {
    (user: IActionUser, messageData: ITwitchMessageData, firstWord: string): void
}
export interface ITwitchChatCheerCallback {
    (user: IActionUser, messageData: ITwitchMessageData): void
}

// Callback data
export interface ITwitchMessageData {
    text: string
    bits: number
    isAction: boolean
    emotes: ITwitchEmote[]
}