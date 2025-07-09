import {assert, assertEquals} from 'jsr:@std/assert'
import '../../../lib/index.ts'
import {assertFalse} from 'jsr:@std/assert/false'
import {ConfigExample, ConfigTest, PresetTest} from '../../../lib/index.ts'
import JsonStore from '../../Database/JsonStore.ts'
import Test from '../../Utils/Test.ts'

Test.run('init', () => {
    Test.truncateData()
})

Test.run('single save & load with key, check values', () => {
    Test.truncateData()
    const mainConfigTest = JsonStore.loadByGroupAndKey(ConfigTest.name, JsonStore.OBJECT_MAIN_KEY)
    assertEquals(mainConfigTest, [])
    const config = new ConfigTest()
    config.singleNumber = 1024
    config.singleString = 'We are testing'
    const json_text = JSON.stringify(config)
    assert(json_text.length > 0)
    assert(!!JsonStore.save({
        group_key: JsonStore.OBJECT_MAIN_KEY,
        group_class: ConfigTest.name,
        json_text: json_text,
        parent_id: null
    }))
    const result = JsonStore.loadByGroupAndKey(ConfigTest.name, JsonStore.OBJECT_MAIN_KEY)
    const loadedJson = result?.[0].json_text ?? ''
    assertEquals(json_text, loadedJson)
    const remadeItem = new ConfigTest().__apply(loadedJson)
    assertEquals(config, remadeItem)
    assertEquals(remadeItem.singleNumber, config.singleNumber)
    assertEquals(remadeItem.singleString, config.singleString)
})
Test.run('save & load many with keys and IDs, test failure cases, delete', () => {
    Test.truncateData()
    const config = new ConfigTest()
    const configKeys: string[] = []
    const configIds: number[] = []
    for (let i = 0; i < 10; i++) {
        config.singleNumber = i
        const key = `Testing-${i}`
        configKeys.push(key)
        const id = JsonStore.save({
            group_key: key,
            group_class: ConfigTest.name,
            json_text: JSON.stringify(config),
            parent_id: null
        })
        assert(id)
        configIds.push(id)
    }
    const other = new ConfigExample()
    const otherKeys: string[] = []
    const otherIds: number[] = []
    for (let i = 0; i < 5; i++) {
        config.singleNumber = i
        const key = `Other-${i}`
        otherKeys.push(key)
        const id = JsonStore.save({
            group_key: `Other-${i}`,
            group_class: ConfigExample.name,
            json_text: JSON.stringify(other),
            parent_id: null
        })
        assert(id)
        otherIds.push(id)
    }

    // Select
    // Keys
    assertEquals(0, JsonStore.loadByGroupAndKey(ConfigExample.name, configKeys)?.length)
    assertEquals(configKeys.length, JsonStore.loadByGroupAndKey(ConfigTest.name, configKeys)?.length)
    assertEquals(Math.floor(configKeys.length / 2), JsonStore.loadByGroupAndKey(ConfigTest.name, configKeys.slice(0, configKeys.length / 2))?.length)
    // Ids
    assertEquals(0, JsonStore.loadByRowId(configIds, 1)?.length)
    assertEquals(configIds.length, JsonStore.loadByRowId(configIds)?.length)
    assertEquals(Math.floor(configIds.length / 2), JsonStore.loadByRowId(configIds.slice(0, configIds.length / 2))?.length)

    // Keys
    assertEquals(0, JsonStore.loadByGroupAndKey(ConfigTest.name, otherKeys)?.length)
    assertEquals(otherKeys.length, JsonStore.loadByGroupAndKey(ConfigExample.name, otherKeys)?.length)
    assertEquals(Math.floor(otherKeys.length / 2), JsonStore.loadByGroupAndKey(ConfigExample.name, otherKeys.slice(0, otherKeys.length / 2))?.length)
    // Ids
    assertEquals(0, JsonStore.loadByRowId(otherIds, 1)?.length)
    assertEquals(otherIds.length, JsonStore.loadByRowId(otherIds)?.length)
    assertEquals(Math.floor(otherIds.length / 2), JsonStore.loadByRowId(otherIds.slice(0, otherIds.length / 2))?.length)

    // Delete
    assertEquals(configKeys.length, JsonStore.deleteByGroupAndKey(ConfigTest.name, configKeys))
    assertEquals(0, JsonStore.loadByGroupAndKey(ConfigTest.name, configKeys)?.length)
    assertEquals(otherIds.length, JsonStore.deleteByRowId(otherIds))
    assertEquals(0, JsonStore.loadByRowId(otherIds)?.length)
})

Test.run('parent id, associate child and cascade delete', () => {
    Test.truncateData()
    const parent = new ConfigTest()
    const parent_id = JsonStore.save({
        group_key: JsonStore.OBJECT_MAIN_KEY,
        group_class: ConfigTest.name,
        json_text: JSON.stringify(parent),
        parent_id: null
    })
    assert(parent_id)
    const child = new PresetTest()
    const child_id = JsonStore.save({
        group_key: null,
        group_class: PresetTest.name,
        json_text: JSON.stringify(child),
        parent_id
    })
    assert(child_id)
    parent.singleReference = child_id
    assert(JsonStore.save({
        group_key: JsonStore.OBJECT_MAIN_KEY,
        group_class: ConfigTest.name,
        json_text: JSON.stringify(parent),
        parent_id: null,
        row_id: parent_id
    }))

    const child_json = JsonStore.loadByRowId(child_id, parent_id)
    assertEquals(child_json?.[0].row_id, child_id)
    assertEquals(child_json?.[0].parent_id, parent_id)
    assertEquals(child_json?.[0].group_key, null)

    const parent_json = JsonStore.loadByRowId(parent_id)
    assertEquals(parent_json?.[0].row_id, parent_id)
    assertEquals(parent_json?.[0].parent_id, null)
    assertEquals(parent_json?.[0].group_key, JsonStore.OBJECT_MAIN_KEY)

    assert(JsonStore.deleteByRowId(parent_id)) // Cascade delete
    assertFalse(JsonStore.loadByRowId(parent_id)?.length)
    assertFalse(JsonStore.loadByRowId(child_id)?.length)
})

Test.run('convenience actions', () => {
    Test.truncateData()
    const child = new PresetTest()
    child.value = 'Testing'
    const childId = JsonStore.save({
        group_key: 'GlobalPreset',
        group_class: PresetTest.name,
        json_text: JSON.stringify(child),
        parent_id: null
    })
    const parent = new ConfigTest()
    parent.singleReference = childId
    const _parentId = JsonStore.save({
        group_key: 'Parent',
        group_class: ConfigTest.name,
        json_text: JSON.stringify(parent),
        parent_id: null
    })
    const result = JsonStore.loadWithChildrenByGroupAndKey(ConfigTest.name, 'Parent')
    assertEquals(Object.keys(result).length, 2)

    // TODO: Is this enough, more?
})

Test.run('deinit', () => {
    JsonStore.closeConnection()
})