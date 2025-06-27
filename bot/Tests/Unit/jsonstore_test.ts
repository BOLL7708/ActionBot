import {assertFalse} from 'jsr:@std/assert/false'
import {assert, assertEquals} from 'jsr:@std/assert'
import '../../../lib/index.ts'
import {ConfigExample, ConfigTest, PresetTest} from '../../../lib/index.ts'
import Log, {ELogLevel} from '../../../lib/SharedUtils/Log.ts'
import JsonStore from '../../Database/JsonStore.ts'
import TestUtils from '../../Utils/TestUtils.ts'

Deno.test('init', () => {
    Log.setLogLevel(ELogLevel.Verbose)
    JsonStore.isTesting = true
})

Deno.test('single save & load with key, check values', () => {
    TestUtils.truncateDatabase()
    const mainConfigTest = JsonStore.loadByGroupAndKey(ConfigTest.name, JsonStore.OBJECT_MAIN_KEY)
    assertEquals(mainConfigTest, [])
    const config = new ConfigTest()
    config.singleNumber = 1024
    config.singleString = 'We are testing'
    const json_blob = JSON.stringify(config)
    assert(json_blob.length > 0)
    assert(!!JsonStore.save({
        group_key: JsonStore.OBJECT_MAIN_KEY,
        group_class: ConfigTest.name,
        json_blob: json_blob,
        parent_id: null
    }))
    const result = JsonStore.loadByGroupAndKey(ConfigTest.name, JsonStore.OBJECT_MAIN_KEY)
    const loadedJson = result?.[0].json_blob ?? ''
    assertEquals(json_blob, loadedJson)
    const remadeItem = new ConfigTest().__apply(loadedJson)
    assertEquals(config, remadeItem)
    assertEquals(remadeItem.singleNumber, config.singleNumber)
    assertEquals(remadeItem.singleString, config.singleString)
})
Deno.test('save & load many with keys and IDs, test failure cases, delete', () => {
    TestUtils.truncateDatabase()
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
            json_blob: JSON.stringify(config),
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
            json_blob: JSON.stringify(other),
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

Deno.test('parent id, associate child and cascade delete', () => {
    TestUtils.truncateDatabase()
    const parent = new ConfigTest()
    const parent_id = JsonStore.save({
        group_key: JsonStore.OBJECT_MAIN_KEY,
        group_class: ConfigTest.name,
        json_blob: JSON.stringify(parent),
        parent_id: null
    })
    assert(parent_id)
    const child = new PresetTest()
    const child_id = JsonStore.save({
        group_key: null,
        group_class: PresetTest.name,
        json_blob: JSON.stringify(child),
        parent_id
    })
    assert(child_id)
    parent.singleReference = child_id
    assert(JsonStore.save({
        group_key: JsonStore.OBJECT_MAIN_KEY,
        group_class: ConfigTest.name,
        json_blob: JSON.stringify(parent),
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

Deno.test('convenience actions', () => {
    TestUtils.truncateDatabase()
    const child = new PresetTest()
    child.value = 'Testing'
    const childId = JsonStore.save({
        group_key: 'GlobalPreset',
        group_class: PresetTest.name,
        json_blob: JSON.stringify(child),
        parent_id: null
    })
    const parent = new ConfigTest()
    parent.singleReference = childId
    const parentId = JsonStore.save({
        group_key: 'Parent',
        group_class: ConfigTest.name,
        json_blob: JSON.stringify(parent),
        parent_id: null
    })
    const result = JsonStore.loadWithChildrenByGroupAndKey(ConfigTest.name, 'Parent')
    assertEquals(Object.keys(result).length, 2)

    // TODO: Is this enough, more?
})

Deno.test('deinit', () => {
    JsonStore.closeConnection()
})