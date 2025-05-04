import {TDataSingle} from '../AbstractData.mts'
import {DataMap} from '../DataMap.mts'
import {SettingTest} from '../Setting/SettingTest.mts'
import {AbstractTrigger} from './AbstractTrigger.mts'

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