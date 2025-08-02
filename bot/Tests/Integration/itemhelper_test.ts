import '../../../lib/index.ts'
import {assert, assertEquals} from '@std/assert'
import ItemHelper from '../../../lib/Classes/ItemHelper.ts'
import {ConfigTest, EventFlow, PresetTest} from '../../../lib/index.ts'
import SettingEventNode from '../../../lib/Objects/Item/Setting/SettingEventNode.ts'
import ValueUtils from '../../../lib/SharedUtils/ValueUtils.ts'
import ItemStore from '../../Database/ItemStore.ts'
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

Test.run('recreate deep', () => {
    const event = new EventFlow()
    const eventKey = 'Test'
    const saveEvent = (event: EventFlow): number => JsonStore.save({
        group_class: EventFlow.name,
        group_key: eventKey,
        parent_id: null,
        json_text: JSON.stringify(event)
    })

    const eventId = saveEvent(event)
    assert(eventId > 0)

    const setting = new SettingEventNode()
    const saveSetting = (setting: SettingEventNode, row_id: number|undefined): number => JsonStore.save({
        row_id,
        group_class: SettingEventNode.name,
        group_key: null,
        parent_id: eventId,
        json_text: JSON.stringify(setting)
    })
    const settingId = saveSetting(setting, undefined)
    assert(settingId > 0)

    const preset = new PresetTest()
    preset.value = 'Sub-sub-child'
    const presetId = JsonStore.save({
        group_class: PresetTest.name,
        group_key: null,
        parent_id: settingId,
        json_text: JSON.stringify(preset)
    })
    assert(presetId > 0)

    setting.item = presetId
    saveSetting(setting, settingId)

    event.nodes.push(settingId)
    saveEvent(event)

    let eventWithChildren = JsonStore.loadWithChildrenByRowId(eventId)
    let eventRecreated = ItemHelper.recreateWithChildren(eventWithChildren)
    assertEquals([settingId, presetId], Object.keys(eventRecreated?.__children() ?? {}).map(ValueUtils.ensureNumber))

    eventWithChildren = JsonStore.loadWithChildrenByGroupAndKey(EventFlow.name, eventKey)
    eventRecreated = ItemHelper.recreateWithChildren(eventWithChildren)
    assertEquals([settingId, presetId], Object.keys(eventRecreated?.__children() ?? {}).map(ValueUtils.ensureNumber))
})