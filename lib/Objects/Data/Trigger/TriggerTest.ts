import {Description, Documentation, Enlist, ReferenceType, Tag} from '../../Decorators.ts'
import {DataMap} from '../../DataMap.ts'
import {SettingTest} from '../Setting/SettingTest.ts'
import {AbstractTrigger} from './AbstractTrigger.ts'

@Enlist()
@Description('A test trigger.')
@Tag('Trigger')
export class TriggerTest extends AbstractTrigger {
    @Documentation('A single setting')
    @ReferenceType(SettingTest.ref.id)
    setting: number = 0
}