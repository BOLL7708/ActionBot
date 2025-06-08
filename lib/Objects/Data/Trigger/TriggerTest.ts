import {TDataSingle} from '../AbstractData.ts'
import {DataMap} from '../DataMap.ts'
import {SettingTest} from '../Setting/SettingTest.ts'
import {AbstractTrigger} from './AbstractTrigger.ts'

export class TriggerTest extends AbstractTrigger {
    setting: TDataSingle<SettingTest> = 0

    enlist() {
        DataMap.addRootInstance({
            instance: new TriggerTest(),
            tag: 'Trigger',
            description: 'A test trigger.',
            documentation: {
                setting: 'A single setting'
            },
            types: {
                setting: SettingTest.ref.id.build()
            }
        })
    }
}