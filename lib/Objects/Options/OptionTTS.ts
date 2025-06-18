import {Purpose, About, Enlist} from '../Decorators.ts'
import {AbstractOption} from '../AbstractOption.ts'

@Enlist()
@Purpose('The various forms of TTS speech.')
export class OptionTTSType extends AbstractOption {
    @About('Will be read as -> [name] said: [text]')
    static readonly Said = 100 //

    @About('Will be read as -> [name] [text]')
    static readonly Action = 200 // [name] [text]

    @About('Will be read as -> [text]')
    static readonly Announcement = 300 // [text]

    @About('Will be read as -> [name] cheered: [text]')
    static readonly Cheer = 400// [name] cheered: [text]
}

@Purpose('The different functions an action can trigger for the TTS system.')
export class OptionTTSFunctionType extends AbstractOption {
    @About('Will enable the TTS as a whole.')
    static readonly Enable = 100

    @About('Will disable the TTS as a whole.')
    static readonly Disable = 101

    @About('Will stop the current playback.')
    static readonly StopCurrent = 110

    @About('Will stop the current playback and empty the queue.')
    static readonly StopAll = 111

    @About('Enable a user to use the TTS.')
    static readonly SetUserEnabled = 200

    @About('Disable a user from using the TTS.')
    static readonly SetUserDisabled = 201

    @About('Set a nickname for a user.')
    static readonly SetUserNick = 210

    @About('Get a nickname for a user.')
    static readonly GetUserNick = 211

    @About('Clear the nickname for a user.')
    static readonly ClearUserNick = 212

    @About('Set the voice for a user.')
    static readonly SetUserVoice = 220

    @About('Get the voice for a user.')
    static readonly GetUserVoice = 221

    @About('Set the gender for a user.')
    static readonly SetUserGender = 230

    @About('Set or update a dictionary entry.')
    static readonly SetDictionaryEntry = 300

    @About('Get a dictionary entry.')
    static readonly GetDictionaryEntry = 301
}