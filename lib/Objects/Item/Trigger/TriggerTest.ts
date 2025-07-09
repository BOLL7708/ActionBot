import {Purpose, About, Enlist, Item, Tag} from '../../Decorators.ts'
import {ItemMap} from '../../ItemMap.ts'
import {SettingTest} from '../Setting/SettingTest.ts'
import {AbstractTrigger} from './AbstractTrigger.ts'

@Enlist()
@Purpose('A test trigger.')
@Tag('Trigger')
export class TriggerTest extends AbstractTrigger {
    @About('A single setting')
    @Item(SettingTest.ref)
    setting: number = 0
}