import {OptionEntryUsage} from '../../Options/OptionEntryType.mts'
import {DataEntries} from '../AbstractData.mts'
import {DataMap} from '../DataMap.mts'
import {DataUtils} from '../DataUtils.mts'
import {PresetAudioChannel} from '../Preset/PresetAudioChannel.mts'
import {AbstractAction} from './AbstractAction.mts'

export class ActionAudio extends AbstractAction {
    srcEntries: string[] = ['']
    srcEntries_use = OptionEntryUsage.First
    volume: number = 1.0
    nonce: string = ''
    repeat: number = 1
    channel: number|DataEntries<PresetAudioChannel> = 0
    channel_orOnSpeechChannel: boolean = false

    enlist() {
        DataMap.addRootInstance({
            instance: new ActionAudio(),
            tag: '🎶',
            description: 'Trigger audio clips.',
            documentation: {
                srcEntries: 'The web URL, local URL or data URL of one or more audio files.\n\nA path ending in a slash or including an asterisk will do a wildcard match of multiple files.',
                volume: 'The volume of the audio, the valid range is 0.0 to 1.0.',
                nonce: 'A unique value that is provided to the callback for audio finished playing.\n\nWill be overwritten for automatic rewards, and is used for some functionality in the fixed rewards.',
                repeat: 'Repeat the playback of this audio this many times.',
                channel: 'Channel to enqueue on, 0 if empty, or use the TTS channel to avoid playing over speech.'
            },
            types: {
                srcEntries: DataUtils.getStringFileAudioRef(),
                srcEntries_use: OptionEntryUsage.ref,
                channel: PresetAudioChannel.ref.id.build()
            }
        })
    }
}