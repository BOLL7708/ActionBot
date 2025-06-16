import {Description, Documentation, Enlist} from '../Decorators.ts'
import {AbstractOption} from './AbstractOption.ts'

@Enlist()
@Description('Categories of commands.')
export class OptionCommandCategory extends AbstractOption {
    @Documentation('Uncategorized commands')
    static readonly Uncategorized = 0

    @Documentation('Admin commands')
    static readonly Admin = 1000

    @Documentation('System commands')
    static readonly System = 2000

    @Documentation('Twitch commands')
    static readonly Twitch = 3000

    @Documentation('Steam commands')
    static readonly Steam = 4000

    @Documentation('SteamVR commands')
    static readonly SteamVR = 4100

    @Documentation('Text-To-Speech commands')
    static readonly TTS = 5000

    @Documentation('Dictionary commands')
    static readonly Dictionary = 5100

    @Documentation('Chat commands')
    static readonly Chat = 6000

    @Documentation('Link commands')
    static readonly Links = 6100

    @Documentation('Utility commands')
    static readonly Utility = 7000

    @Documentation('Misc commands')
    static readonly Misc = 8000

    @Documentation('Custom commands')
    static readonly Custom = 9000
}