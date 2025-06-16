import {Description, Documentation, Enlist, Reference, Tag} from '../../Decorators.ts'
import {DataMap} from '../../DataMap.ts'
import {SettingTest} from '../Setting/SettingTest.ts'
import {AbstractTrigger} from './AbstractTrigger.ts'

@Enlist()
@Description('A test trigger.')
@Tag('Trigger')
export class TriggerTest extends AbstractTrigger {
    @Documentation('A single setting')
    @Reference(SettingTest.ref.id)
    setting: number = 0
}