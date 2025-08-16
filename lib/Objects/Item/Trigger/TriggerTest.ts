import {About, Enlist, Item, Purpose, Tag} from '../../Decorators.ts'
import {SettingTest} from '../Setting/SettingTest.ts'
import {AbstractTrigger} from './AbstractTrigger.ts'

@Enlist()
@Purpose('A test trigger.')
@Tag('Trigger')
export class TriggerTest extends AbstractTrigger {
    @About('A single setting')
    @Item(SettingTest.ref)
    setting: number = 0

    __nodeText(): string {
        return `Value: ${this.setting}`
    }
}