import {Purpose, About, Enlist} from '../Decorators.ts'
import {AbstractOption} from '../AbstractOption.ts'

@Enlist()
@Purpose('The setting type, reference steamvr.vrsettings or default.vrsettings to see what can be set.')
export class OptionSteamVRSettingType extends AbstractOption {
    @About('No setting preset chosen.')
    static readonly None = ''

    @About('The world scale of the currently running game.')
    static readonly WorldScale = '|worldScale|1'

    @About('The eye to use for the VR View, this currently does not actually work, sorry!')
    static readonly MirrorViewEye = 'steamvr|mirrorViewEye|4'

    @About('The rotation of the thumbstick of the left Valve Index controller.')
    static readonly KnucklesLeftThumbstickRotation = 'input|leftThumbstickRotation_knuckles|0'

    @About('The rotation of the thumbstick of the right Valve Index controller.')
    static readonly KnucklesRightThumbstickRotation = 'input|rightThumbstickRotation_knuckles|0'

    @About('The hardware brightness of the display panel in the headset.')
    static readonly HMDAnalogGain = 'steamvr|analogGain|1.30'

    @About('The refresh rate of the display panel in the headset.')
    static readonly HMDRefreshRate = 'steamvr|preferredRefreshRate|120'

    @About('The red gain of the image in the headset.')
    static readonly HMDDisplayGainRed = 'steamvr|hmdDisplayColorGainR|1.0'

    @About('The green gain of the image in the headset.')
    static readonly HMDDisplayGainGreen = 'steamvr|hmdDisplayColorGainG|1.0'

    @About('The blue gain of the image in the headset.')
    static readonly HMDDisplayGainBlue = 'steamvr|hmdDisplayColorGainB|1.0'
}