import {Enlist} from '../../Decorators.ts'
import {AbstractSetting} from './AbstractSetting.ts'

@Enlist()
export default class SettingEventEdge extends AbstractSetting {
    source: number = 0
    target: number = 0
}