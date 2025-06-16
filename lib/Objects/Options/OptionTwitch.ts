import {Description, Documentation, Enlist} from '../Decorators.ts'
import {AbstractOption} from '../AbstractOption.ts'

@Enlist()
@Description('The visibility of a Twitch reward.')
export class OptionTwitchRewardVisible extends AbstractOption {
    static readonly NoChange = 0

    @Documentation('The reward will be visible.')
    static readonly Visible = 100

    @Documentation('The reward will be hidden.')
    static readonly Hidden = 200
}

@Enlist()
@Description('The usability of a Twitch reward.')
export class OptionTwitchRewardUsable extends AbstractOption {
    static readonly NoChange = 0

    @Documentation('The reward will be available to redeem.')
    static readonly Enabled = 100

    @Documentation('The reward will not be possible to redeem.')
    static readonly Disabled = 200

}

@Enlist()
@Description('The tier of a Twitch subscription.')
export class OptionTwitchSubTier extends AbstractOption {
    static readonly Prime = 0
    static readonly Tier1 = 1000
    static readonly Tier2 = 2000
    static readonly Tier3 = 3000
}