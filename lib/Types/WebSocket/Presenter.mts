import {PresetAudioChannel} from '../../Objects/Data/Preset/PresetAudioChannel.mts'

// region To server

// endregion

// region From server

export interface IPresenterTts {
    originalMessage: string
    audioData: string
    channel: PresetAudioChannel
}

// endregion