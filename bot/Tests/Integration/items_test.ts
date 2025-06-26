import '../../../lib/index.ts'
import {assert, assertEquals} from '@std/assert'
import ItemHelper from '../../../lib/Classes/ItemHelper.ts'
import {ConfigTest, PresetTest} from '../../../lib/index.ts'
import Log, {ELogLevel} from '../../../lib/SharedUtils/Log.ts'
import ValueUtils from '../../../lib/SharedUtils/ValueUtils.ts'
import JsonStoreHelper from '../../Helpers/JsonStoreHelper.ts'
import TestUtils from '../../Utils/TestUtils.ts'

Deno.test('init', () => {
    Log.setLogLevel(ELogLevel.Verbose)
    JsonStoreHelper.isTesting = true
})

Deno.test('recreate', () => {
    TestUtils.truncateDatabase()

    const preset = new PresetTest()
    preset.value = 'Yes please!'
    const presetId = JsonStoreHelper.saveJson({
        group_class: PresetTest.name,
        group_key: 'ChildTest',
        parent_id: null,
        json_blob: JSON.stringify(preset)
    })
    assert(presetId)

    const config = new ConfigTest()
    config.singleString = 'PLEASE WORK'
    config.singleNumber = 123456
    config.singleReference = presetId
    const configId = JsonStoreHelper.saveJson({
        group_class: ConfigTest.name,
        group_key: 'ParentTest',
        parent_id: null,
        json_blob: JSON.stringify(config)
    })
    assert(configId)

    const loadedConfig = JsonStoreHelper.loadJsonAndItemsByRowId(configId) ?? []
    const recreatedConfig = ItemHelper.recreate<ConfigTest>(loadedConfig)
    assertEquals(configId, recreatedConfig?.__info().rowId ?? 0)
    assertEquals(presetId, ValueUtils.ensureNumber(Object.keys(recreatedConfig?.__children() ?? {})?.pop()))
})