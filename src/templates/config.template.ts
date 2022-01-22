/*
..######..########..########.########..########.##....##.########.####....###....##........######.
.##....##.##.....##.##.......##.....##.##.......###...##....##.....##....##.##...##.......##....##
.##.......##.....##.##.......##.....##.##.......####..##....##.....##...##...##..##.......##......
.##.......########..######...##.....##.######...##.##.##....##.....##..##.....##.##........######.
.##.......##...##...##.......##.....##.##.......##..####....##.....##..#########.##.............##
.##....##.##....##..##.......##.....##.##.......##...###....##.....##..##.....##.##.......##....##
..######..##.....##.########.########..########.##....##....##....####.##.....##.########..######.
*/
Config.credentials = <ICredentialsConfig> {
    OBSPassword: '',
    OpenVR2WSPassword: '',
    GoogleTTSApiKey: '',
    PhilipsHueUsername: '',
    TwitchClientID: '',
    TwitchClientSecret: '',
    TwitchChannelRefreshToken: '',
    TwitchChatbotRefreshToken: '',
    PHPPassword: '',
    DiscordWebhooks: {
        [KeysTemplate.KEY_DISCORD_SSSVR]: 'The webhook URL you want to use for VR screenshots',
        [KeysTemplate.KEY_DISCORD_CHAT]: 'The webhook URL you want to use for logging Twitch chat',
        [KeysTemplate.KEY_CHANNELTROPHY]: 'The webhook URL you want to use for the channel trophy',
        [KeysTemplate.COMMAND_SOURCESCREENSHOT]: 'The webhook URL you want to use for OBS screenshots',
        [KeysTemplate.COMMAND_CHANNELTROPHY_STATS]: 'The webhook URL you want to use for channel trophy statistics',
        [KeysTemplate.COMMAND_CLIPS]: 'The webhook URL you want to use for Twitch clips'
    }
}

/*
..######...#######..##....##.########.########...#######..##.......##.......########.########.
.##....##.##.....##.###...##....##....##.....##.##.....##.##.......##.......##.......##.....##
.##.......##.....##.####..##....##....##.....##.##.....##.##.......##.......##.......##.....##
.##.......##.....##.##.##.##....##....########..##.....##.##.......##.......######...########.
.##.......##.....##.##..####....##....##...##...##.....##.##.......##.......##.......##...##..
.##....##.##.....##.##...###....##....##....##..##.....##.##.......##.......##.......##....##.
..######...#######..##....##....##....##.....##..#######..########.########.########.##.....##
*/
// You can add other config files named config.[something].ts and load one of these using a URL param:
// index.php?config=[something] and it will be overriding things in your main config.
Config.controller = <IControllerConfig> { // Set defaults for the widget
    defaults: {
        pipeAllChat: true,
        ttsForAll: true,
        pingForChat: true,
        logChatToDiscord: true,
        useGameSpecificRewards: true,
        updateTwitchGameCategory: true
    },
    gameDefaults: {
        // [Games.YOUR_GAME]: { pipeAllChat: false }
    },
    websocketsUsed: {
        twitchChat: true,
        twitchPubsub: true,
        openvr2ws: true,
        pipe: true,
        obs: true,
        screenshots: true
    },
    commandReferences: {
        // [KeysTemplate.YOUR_COMMAND]: KeysTemplate.KEY_YOURREWARD
    },
    commandPermissionsDefault: {
        streamer: true,
        moderators: true,
        VIPs: false,
        subscribers: false,
        everyone: false
    },
    commandPermissionsOverrides: {
        [KeysTemplate.COMMAND_LOG_ON]: {moderators: false},
        [KeysTemplate.COMMAND_LOG_OFF]: {moderators: false},
        [KeysTemplate.COMMAND_TTS_NICK]: {VIPs: true},
        [KeysTemplate.COMMAND_BRIGHTNESS]: {moderators: false},
        [KeysTemplate.COMMAND_REFRESHRATE]: {moderators: false},
        [KeysTemplate.COMMAND_VRVIEWEYE]: {moderators: false},
        [KeysTemplate.COMMAND_GAME]: {everyone: true}
    },
    speechReferences: {
        /*
        .######..######..##..##..######..#####..
        .##........##.....####...##......##..##.
        .####......##......##....####....##..##.
        .##........##.....####...##......##..##.
        .##......######..##..##..######..#####..
        */
        [KeysTemplate.COMMAND_TTS_ON]: [
            'Global TTS activated', 
            'Global TTS already on'
        ],
        [KeysTemplate.COMMAND_TTS_OFF]: [
            'Global TTS terminated', 
            'Global TTS already off'
        ],        
        [KeysTemplate.COMMAND_TTS_MUTE]: [
            '%s has lost their voice',
            '%s is already muted'
        ],
        [KeysTemplate.COMMAND_TTS_UNMUTE]: [
            '%s has regained their voice', 
            '%s is not muted'
        ],
        [KeysTemplate.COMMAND_SCALE]: [
            'World scale set to %s%',
            'World scale will change from %s to %s% over %s minutes',
            'World scale sequence finished',
            'World scale sequence not set',
            'World scale sequence terminated'
        ],
        [KeysTemplate.COMMAND_CHANNELTROPHY_STATS]: [
            'Initiating posting all Channel Trophy statistics',
            'Completed posting all Channel Trophy statistics',
            'Initiating posting of Channel Trophy statistics',
            'Completed posting of Channel Trophy statistics',
            'Failed to post Channel Trophy statistics'
        ],
        [KeysTemplate.COMMAND_CLIPS]: [
            'Starting Twitch clip import.',
            'There are %s old clips, %s new clips.',
            'Finished posting %s new clips.'
        ],
        [KeysTemplate.COMMAND_DICTIONARY]: [
            '%s is now said as %s', 
            '%s messed up a dictionary entry'
        ],
        [KeysTemplate.KEY_CALLBACK_APPID]: [
            'Twitch game updated: %s',
            'Twitch game not matched: %s'
        ],

        /*
        .#####...##..##..##..##...####...##...##..######...####..
        .##..##...####...###.##..##..##..###.###....##....##..##.
        .##..##....##....##.###..######..##.#.##....##....##.....
        .##..##....##....##..##..##..##..##...##....##....##..##.
        .#####.....##....##..##..##..##..##...##..######...####..
        */
        [KeysTemplate.KEY_MIXED_CHAT]: '%s said: %s',
        [KeysTemplate.KEY_SCREENSHOT]: 'Photograph %s',
        [KeysTemplate.KEY_INSTANTSCREENSHOT]: 'Instant shot!',
        [KeysTemplate.COMMAND_TTS_NICK]: '%s is now called %s',
        [KeysTemplate.COMMAND_CHAT_ON]: 'Chat enabled',
        [KeysTemplate.COMMAND_CHAT_OFF]: 'Chat disabled',
        [KeysTemplate.COMMAND_PING_ON]: 'Chat ping enabled',
        [KeysTemplate.COMMAND_PING_OFF]: 'Chat ping disabled',
        [KeysTemplate.COMMAND_LOG_ON]: 'Logging enabled',
        [KeysTemplate.COMMAND_LOG_OFF]: 'Logging disabled',
        [KeysTemplate.COMMAND_CAMERA_ON]: 'Camera enabled',
        [KeysTemplate.COMMAND_CAMERA_OFF]: 'Camera disabled',
        [KeysTemplate.COMMAND_BRIGHTNESS]: 'Headset brightness set to %s%',
        [KeysTemplate.COMMAND_REFRESHRATE]: 'Headset refresh rate set to %s hertz',
        [KeysTemplate.COMMAND_VRVIEWEYE]: 'Output eye mode changed to %s',
        [KeysTemplate.COMMAND_GAMEREWARDS_ON]: 'Game specific rewards enabled',
        [KeysTemplate.COMMAND_GAMEREWARDS_OFF]: 'Game specific rewards disabled',
    },
    rewardReferences: {
        // [KeysTemplate.KEY_AREWARD]: KeysTemplate.KEY_YOURREWARD
    },
    defaultTwitchGameCategory: 'Games + Demos',
    resetIncrementingRewardsOnLoad: [
        // KeysTemplate.KEY_YOURREWARD
    ],
    saveConsoleOutputToSettings: false,
    secretChatSymbols: ['!']
}

/*
..######....#######...#######...######...##.......########
.##....##..##.....##.##.....##.##....##..##.......##......
.##........##.....##.##.....##.##........##.......##......
.##...####.##.....##.##.....##.##...####.##.......######..
.##....##..##.....##.##.....##.##....##..##.......##......
.##....##..##.....##.##.....##.##....##..##.......##......
..######....#######...#######...######...########.########
*/
Config.google = <IGoogleConfig> { // TTS
    speakerTimeoutMs: 5000,
    randomizeVoice: false,
    randomizeVoiceLanguageFilter: 'en-', // Matches from the first character and onward, can be extended with regional setting.
    defaultVoice: '', // This will be used if randomization is turned off.
    speakingRateOverride: undefined,
    skipSaid: false
},

/*
..#######..########...######.
.##.....##.##.....##.##....##
.##.....##.##.....##.##......
.##.....##.########...######.
.##.....##.##.....##.......##
.##.....##.##.....##.##....##
..#######..########...######.
*/
Config.obs = <IObsConfig> { // Toggle sources in OBS on and off with the obs-websocket plugin.
    port: 4445,
    configs: {
        /*
        [KeysTemplate.KEY_OBS_EXAMPLE1]: {
            sceneNames: ['Your Scene Name'],
            sourceName: 'Your Source Name',
            filterName: 'Optional Your Filter Name',
            durationMs: 10000
        }
        */
    },
    filterOnScenes: [''], // WIP
    sourceScreenshotConfig: {
        sourceName: 'Your Source Name',
        embedPictureFormat: 'png',
        saveToFilePath: 'C:\\A file path\\on your\\disk\\',
		discordDescription: 'OBS Screenshot',
        discordGameTitle: 'Your Game',
        signTitle: 'Screenshot',
        signDurationMs: 10000
    }
}

/*
.########..####.########..########
.##.....##..##..##.....##.##......
.##.....##..##..##.....##.##......
.########...##..########..######..
.##.........##..##........##......
.##.........##..##........##......
.##........####.##........########
*/
Config.pipe = <IPipeConfig> { // In-VR-overlays and notifications with OpenVRNotificationPipe
    port: 8077,
    showRewardsWithKeys: [
        KeysTemplate.KEY_TTSSPEAK,
        KeysTemplate.KEY_SCREENSHOT
    ],
    configs: {
        /*
        [KeysTemplate.KEY_YOURREWARD]: {
            imagePath: '_assets/yourimage.png',
            durationMs: 3000,
            config: PipePresets.YOUR_PRESET
        }
        */
    },
    useCustomChatNotification: false,
    customChatMessageConfig: {
        rect: { x: 0, y: 120, w: 500, h: 200 },
        font: { size: 32, family: 'Arial', color: '#ddd', lineSpacing: 1.05 }
    },
    customChatNameConfig: {
        rect: { x: 100, y: 100, w: 400, h: 100 },
        font: { size: 32, family: 'Arial Black', outlines: [
            { color: 'white', width: 8 },
            { color: 'black', width: 4 }
        ] }
    },
    customChatAvatarConfig: { x: 0, y: 0, w: 100, h: 100 }
}


/*
..######...######..########..########.########.##....##..######..##.....##..#######..########
.##....##.##....##.##.....##.##.......##.......###...##.##....##.##.....##.##.....##....##...
.##.......##.......##.....##.##.......##.......####..##.##.......##.....##.##.....##....##...
..######..##.......########..######...######...##.##.##..######..#########.##.....##....##...
.......##.##.......##...##...##.......##.......##..####.......##.##.....##.##.....##....##...
.##....##.##....##.##....##..##.......##.......##...###.##....##.##.....##.##.....##....##...
..######...######..##.....##.########.########.##....##..######..##.....##..#######.....##...
*/
Config.screenshots = <IScreenshotConfig> { // Trigger and transmit screenshots with SuperScreenShotterVR.
    port: 8807,
    delay: 5,
    callback: {
        discordManualTitle: 'Manual Screenshot',
        discordRewardTitle: 'Photograph: %s', // Template value is the reward description
        discordRewardInstantTitle: 'Instant shot! 📸',
        signTitle: 'Screenshot',
        signManualSubtitle: 'Manual shot!',
        signDurationMs: 5000
    }
}

/*
.########..####..######...######...#######..########..########.
.##.....##..##..##....##.##....##.##.....##.##.....##.##.....##
.##.....##..##..##.......##.......##.....##.##.....##.##.....##
.##.....##..##...######..##.......##.....##.########..##.....##
.##.....##..##........##.##.......##.....##.##...##...##.....##
.##.....##..##..##....##.##....##.##.....##.##....##..##.....##
.########..####..######...######...#######..##.....##.########.
*/
Config.discord = <IDiscordConfig> { // Send things to Discord
    remoteScreenshotEmbedColor: '#000000',
    manualScreenshotEmbedColor: '#FFFFFF',
    prefixCheer: '🙌 ',
    prefixReward: '🏆 '
}

/*
.########..##.....##.####.##.......####.########...######..##.....##.##.....##.########
.##.....##.##.....##..##..##........##..##.....##.##....##.##.....##.##.....##.##......
.##.....##.##.....##..##..##........##..##.....##.##.......##.....##.##.....##.##......
.########..#########..##..##........##..########...######..#########.##.....##.######..
.##........##.....##..##..##........##..##..............##.##.....##.##.....##.##......
.##........##.....##..##..##........##..##........##....##.##.....##.##.....##.##......
.##........##.....##.####.########.####.##.........######..##.....##..#######..########
*/
Config.philipshue = <IPhilipsHueConfig> { // Control Philips Hue lights
    serverPath: 'http://a-local-IP',
    lightsIds: [], // IDs of lights to affect with the color rewards
    lightConfigs: {
        // [KeysTemplate.KEY_YOURREWARD]: { x: 0.5, y: 0.5 }
    },
    plugConfigs: {
        /*
        [KeysTemplate.KEY_YOURREWARD]: {
            id: 1,
            originalState: false,
            triggerState: true,
            duration: 30
        }
        */
    }
}

/*
..#######..########..########.##....##.##.....##.########...#######..##......##..######.
.##.....##.##.....##.##.......###...##.##.....##.##.....##.##.....##.##..##..##.##....##
.##.....##.##.....##.##.......####..##.##.....##.##.....##........##.##..##..##.##......
.##.....##.########..######...##.##.##.##.....##.########...#######..##..##..##..######.
.##.....##.##........##.......##..####..##...##..##...##...##........##..##..##.......##
.##.....##.##........##.......##...###...##.##...##....##..##........##..##..##.##....##
..#######..##........########.##....##....###....##.....##.#########..###..###...######.
*/
Config.openvr2ws = <IOpenVR2WSConfig> {
    port: 7708,
    configs: {
        /*
        [KeysTemplate.KEY_YOURREWARD]: {
            type: OpenVR2WS.TYPE_WORLDSCALE,
            value: 0.5,
            resetToValue: 1.0,
            duration: 30
        }
        */
    }
}

/*
....###....##.....##.########..####..#######..########..##..........###....##....##.########.########.
...##.##...##.....##.##.....##..##..##.....##.##.....##.##.........##.##....##..##..##.......##.....##
..##...##..##.....##.##.....##..##..##.....##.##.....##.##........##...##....####...##.......##.....##
.##.....##.##.....##.##.....##..##..##.....##.########..##.......##.....##....##....######...########.
.#########.##.....##.##.....##..##..##.....##.##........##.......#########....##....##.......##...##..
.##.....##.##.....##.##.....##..##..##.....##.##........##.......##.....##....##....##.......##....##.
.##.....##..#######..########..####..#######..##........########.##.....##....##....########.##.....##
*/
Config.audioplayer = <IAudioPlayerConfig> { // Play sound effects
    configs: {
        /*
        [KeysTemplate.KEY_SOUND_CHAT]: {
            src: '_assets/your_chat_sound.wav',
            volume: 0.5
        },
        [KeysTemplate.KEY_YOURREWARD]: {
            src: '_assets/your_audio.wav',
            volume: 1.0,
            nonce: 'your_audio_nonce',
            repeat: 2
        }
        */
    }
}

/*
..######..####..######...##....##
.##....##..##..##....##..###...##
.##........##..##........####..##
..######...##..##...####.##.##.##
.......##..##..##....##..##..####
.##....##..##..##....##..##...###
..######..####..######...##....##
*/
Config.sign = <ISignConfig> { // Show on-screen notification with title+image+subtitle
    enabled: false,
    width: 200,
    height: 300,
    transitionDurationMs: 500,
    fontFamily: 'sans-serif',
    fontColor: 'white',
    fontSize: '150%',
    direction: 'left',
    configs: {
        // [KeysTemplate.KEY_YOURREWARD]: {durationMs: 5000, title: 'Your Reward'}
    }
}

/*
.########..##.....##.##....##
.##.....##.##.....##.###...##
.##.....##.##.....##.####..##
.########..##.....##.##.##.##
.##...##...##.....##.##..####
.##....##..##.....##.##...###
.##.....##..#######..##....##
*/
Config.run = <IRunConfig> {
    configs: {},
    gameSpecificConfigs: {}
}

/*
.########.##......##.####.########..######..##.....##
....##....##..##..##..##.....##....##....##.##.....##
....##....##..##..##..##.....##....##.......##.....##
....##....##..##..##..##.....##....##.......#########
....##....##..##..##..##.....##....##.......##.....##
....##....##..##..##..##.....##....##....##.##.....##
....##.....###..###..####....##.....######..##.....##
*/
Config.twitch = <ITwitchConfig> {
    channelName: 'ChannelName',
    chatbotName: 'ChatbotName',
    announcerName: 'AnnouncterName',
    announcerTriggers: ['❗'],

    proxyChatBotName: 'RestreamBot',
    proxyChatFormat: /\[(\w*):\s(.+)\]\s(.+)/,

    ignoreModerators: [
        'RestreamBot'
    ],

    skipUpdatingRewards: [
        KeysTemplate.KEY_CHANNELTROPHY
    ],
    defaultRewards: [ // Will be turned on unless they are in the other setting below to be disabled.
        KeysTemplate.KEY_SCREENSHOT,
        KeysTemplate.KEY_INSTANTSCREENSHOT
    ],
    disableRewards: [],
    autoRewards: [
        // KeysTemplate.KEY_YOURREWARD,
    ],

    disableAutoRewardAfterUse: [ 
        // KeysTemplate.KEY_YOURREWARD
    ], 

    rewardConfigs: {   
        /*
        .#####...######..######...####...##..##..##......######.
        .##..##..##......##......##..##..##..##..##........##...
        .##..##..####....####....######..##..##..##........##...
        .##..##..##......##......##..##..##..##..##........##...
        .#####...######..##......##..##...####...######....##...
        */
        [KeysTemplate.KEY_TTSSPEAK]: {
            title: 'TTS',
            cost: 10,
            prompt: 'Read message aloud',
            background_color: '#808080',
            is_user_input_required: true
        },
        [KeysTemplate.KEY_TTSSETVOICE]: {
            title: 'Set TTS voice',
            cost: 10,
            prompt: 'Change TTS voice',
            background_color: '#808080',
            is_user_input_required: true
        },
        [KeysTemplate.KEY_TTSSWITCHVOICEGENDER]: {
            title: 'TTS Gender Flip',
            cost: 10,
            prompt: "Switch your TTS voice gender",
            background_color: '#808080'
        },
        [KeysTemplate.KEY_SCREENSHOT]: {
            title: 'Screenshot with description',
            cost: 15,
            prompt: 'Description is read before timed shot',
            background_color: '#808080',
            is_user_input_required: true
        },
        [KeysTemplate.KEY_INSTANTSCREENSHOT]: {
            title: 'Instant screenshot',
            cost: 10,
            prompt: 'Immediately trigger a screenshot.',
            background_color: '#808080'
        }

        /*
        ..####...##..##...####...######...####...##...##.
        .##..##..##..##..##........##....##..##..###.###.
        .##......##..##...####.....##....##..##..##.#.##.
        .##..##..##..##......##....##....##..##..##...##.
        ..####....####....####.....##.....####...##...##.
        */

        // Add custom reward configs here, if you care to separate them from the default ones.
    },

    rewardConfigProfileDefault: {
        // [KeysTemplate.KEY_YOURREWARD]: true,
    },
    rewardConfigProfileNoGame: {
        // [KeysTemplate.KEY_YOURREWARD]: true,
    },
    rewardConfigProfilePerGame: {
        // [GamesTemplate.A_GAME]: { [KeysTemplate.KEY_YOURREWARD]: true, [KeysTemplate.KEY_YOUROTHERREWARD]: false }
    },
    turnOnRewardForGames: {
        // [GamesTemplate.A_GAME]: [KeysTemplate.KEY_YOURREWARD, KeysTemplate.KEY_YOUROTHERREWARD]
    },
    turnOffRewardForGames: {
        // [GamesTemplate.A_GAME]: [KeysTemplate.KEY_YOURREWARD, KeysTemplate.KEY_YOUROTHERREWARD]
    },
    gameSpecificRewards: [
        // [KeysTemplate.KEY_YOURGAMEREWARD, KeysTemplate.KEY_YOUROTHERGAMEREWARD]
    ],
    gameSpecificRewardsPerGame: {
        // [GamesTemplate.A_GAME]: {[KeysTemplate.KEY_YOURGAMEREWARD]: { title: "Update title", cost: "Update cost" }}
    },
    channelTrophyUniqueNumbers: {
        // 1234: { speech: "", label: "" }
    }
}

/*
.##......##.########.########.
.##..##..##.##.......##.....##
.##..##..##.##.......##.....##
.##..##..##.######...########.
.##..##..##.##.......##.....##
.##..##..##.##.......##.....##
..###..###..########.########.
*/
Config.web = {
    configs: {}
}