import '../../../lib/index.ts'
import {assert, assertEquals} from '@std/assert'
import ItemHelper from '../../../lib/Classes/ItemHelper.ts'
import {ConfigTest, PresetTest} from '../../../lib/index.ts'
import ValueUtils from '../../../lib/SharedUtils/ValueUtils.ts'
import JsonStore from '../../Database/JsonStore.ts'
import Test from '../../Utils/Test.ts'

Test.run('init', () => {
    Test.truncateData()
})

Test.run('recreate', () => {
    const preset = new PresetTest()
    preset.value = 'Yes please!'
    const presetId = JsonStore.save({
        group_class: PresetTest.name,
        group_key: 'ChildTest',
        parent_id: null,
        json_text: JSON.stringify(preset)
    })
    assert(presetId)

    const config = new ConfigTest()
    config.singleString = 'PLEASE WORK'
    config.singleNumber = 123456
    config.singleReference = presetId
    const configId = JsonStore.save({
        group_class: ConfigTest.name,
        group_key: 'ParentTest',
        parent_id: null,
        json_text: JSON.stringify(config)
    })
    assert(configId)

    const loadedConfig = JsonStore.loadWithChildrenByRowId(configId) ?? []
    const recreatedConfig = ItemHelper.recreateWithChildren<ConfigTest>(loadedConfig)
    assertEquals(configId, recreatedConfig?.__info().rowId ?? 0)
    assertEquals(presetId, ValueUtils.ensureNumber(Object.keys(recreatedConfig?.__children() ?? {})?.pop()))
})