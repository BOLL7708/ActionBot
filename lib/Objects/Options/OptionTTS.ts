import {Description, Documentation, Enlist} from '../Decorators.ts'
import {AbstractOption} from '../AbstractOption.ts'

@Enlist()
@Description('The various forms of TTS speech.')
export class OptionTTSType extends AbstractOption {
    @Documentation('Will be read as -> [name] said: [text]')
    static readonly Said = 100 //

    @Documentation('Will be read as -> [name] [text]')
    static readonly Action = 200 // [name] [text]

    @Documentation('Will be read as -> [text]')
    static readonly Announcement = 300 // [text]

    @Documentation('Will be read as -> [name] cheered: [text]')
    static readonly Cheer = 400// [name] cheered: [text]
}

@Description('The different functions an action can trigger for the TTS system.')
export class OptionTTSFunctionType extends AbstractOption {
    @Documentation('Will enable the TTS as a whole.')
    static readonly Enable = 100

    @Documentation('Will disable the TTS as a whole.')
    static readonly Disable = 101

    @Documentation('Will stop the current playback.')
    static readonly StopCurrent = 110

    @Documentation('Will stop the current playback and empty the queue.')
    static readonly StopAll = 111

    @Documentation('Enable a user to use the TTS.')
    static readonly SetUserEnabled = 200

    @Documentation('Disable a user from using the TTS.')
    static readonly SetUserDisabled = 201

    @Documentation('Set a nickname for a user.')
    static readonly SetUserNick = 210

    @Documentation('Get a nickname for a user.')
    static readonly GetUserNick = 211

    @Documentation('Clear the nickname for a user.')
    static readonly ClearUserNick = 212

    @Documentation('Set the voice for a user.')
    static readonly SetUserVoice = 220

    @Documentation('Get the voice for a user.')
    static readonly GetUserVoice = 221

    @Documentation('Set the gender for a user.')
    static readonly SetUserGender = 230

    @Documentation('Set or update a dictionary entry.')
    static readonly SetDictionaryEntry = 300

    @Documentation('Get a dictionary entry.')
    static readonly GetDictionaryEntry = 301
}