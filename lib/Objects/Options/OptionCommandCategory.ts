import {Purpose, About, Enlist} from '../Decorators.ts'
import {AbstractOption} from '../AbstractOption.ts'

@Enlist()
@Purpose('Categories of commands.')
export class OptionCommandCategory extends AbstractOption {
    @About('Uncategorized commands')
    static readonly Uncategorized = 0

    @About('Admin commands')
    static readonly Admin = 1000

    @About('System commands')
    static readonly System = 2000

    @About('Twitch commands')
    static readonly Twitch = 3000

    @About('Steam commands')
    static readonly Steam = 4000

    @About('SteamVR commands')
    static readonly SteamVR = 4100

    @About('Text-To-Speech commands')
    static readonly TTS = 5000

    @About('Dictionary commands')
    static readonly Dictionary = 5100

    @About('Chat commands')
    static readonly Chat = 6000

    @About('Link commands')
    static readonly Links = 6100

    @About('Utility commands')
    static readonly Utility = 7000

    @About('Misc commands')
    static readonly Misc = 8000

    @About('Custom commands')
    static readonly Custom = 9000
}