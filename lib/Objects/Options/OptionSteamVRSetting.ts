import {Description, Documentation, Enlist} from '../Decorators.ts'
import {AbstractOption} from '../AbstractOption.ts'

@Enlist()
@Description('The setting type, reference steamvr.vrsettings or default.vrsettings to see what can be set.')
export class OptionSteamVRSettingType extends AbstractOption {
    @Documentation('No setting preset chosen.')
    static readonly None = ''

    @Documentation('The world scale of the currently running game.')
    static readonly WorldScale = '|worldScale|1'

    @Documentation('The eye to use for the VR View, this currently does not actually work, sorry!')
    static readonly MirrorViewEye = 'steamvr|mirrorViewEye|4'

    @Documentation('The rotation of the thumbstick of the left Valve Index controller.')
    static readonly KnucklesLeftThumbstickRotation = 'input|leftThumbstickRotation_knuckles|0'

    @Documentation('The rotation of the thumbstick of the right Valve Index controller.')
    static readonly KnucklesRightThumbstickRotation = 'input|rightThumbstickRotation_knuckles|0'

    @Documentation('The hardware brightness of the display panel in the headset.')
    static readonly HMDAnalogGain = 'steamvr|analogGain|1.30'

    @Documentation('The refresh rate of the display panel in the headset.')
    static readonly HMDRefreshRate = 'steamvr|preferredRefreshRate|120'

    @Documentation('The red gain of the image in the headset.')
    static readonly HMDDisplayGainRed = 'steamvr|hmdDisplayColorGainR|1.0'

    @Documentation('The green gain of the image in the headset.')
    static readonly HMDDisplayGainGreen = 'steamvr|hmdDisplayColorGainG|1.0'

    @Documentation('The blue gain of the image in the headset.')
    static readonly HMDDisplayGainBlue = 'steamvr|hmdDisplayColorGainB|1.0'
}