import {OptionSteamVRSettingType} from '../../Options/OptionSteamVRSetting.mts'
import {DataMap} from '../DataMap.mts'
import {AbstractAction} from './AbstractAction.mts'

export class ActionSettingVR extends AbstractAction {
    settingPreset = OptionSteamVRSettingType.WorldScale
    settingPreset_orCustom = ''
    settingPreset_inCategory = ''
    setToValue: string = ''
    resetToValue: string = ''
    duration: number = 0

    enlist() {
        DataMap.addRootInstance({
            instance: new ActionSettingVR(),
            tag: '⚙️',
            description: 'Used to change SteamVR settings.',
            documentation: {
                settingPreset: 'The format is: category|setting|default, where an empty category will use the app ID for game specific settings.',
                settingPreset_orCustom: '',
                settingPreset_inCategory: '',
                setToValue: 'The value to set the setting to, takes various formats, will use possible default if missing.',
                resetToValue: 'The value to reset to after the duration has expired, will fall back on a default value if empty.',
                duration: 'The amount of time in seconds to wait before resetting the setting to default, skipped if set to 0.'
            },
            types: {
                settingPreset: OptionSteamVRSettingType.ref
            }
        })
    }
}